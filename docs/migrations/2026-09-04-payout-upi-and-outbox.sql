-- ============================================================================
--  Seller payout destination (UPI) + admin outbox
--  Written 2026-09-04. NOT APPLIED — the owner runs this.
--
--  Apply with either:
--     psql "$DATABASE_URL" -f docs/migrations/2026-09-04-payout-upi-and-outbox.sql
--  or by pasting it into the Supabase SQL editor.
--
--  Use the POOLER connection string, not the direct one — the direct host is
--  IPv6-only and is not reachable from Lambda or from a Windows dev machine.
--  See AGENTS.md for the current pooler URL.
--
--  This script is idempotent: every statement is IF NOT EXISTS / guarded, so
--  running it twice is harmless.
--
--  AFTER APPLYING: run `npx prisma generate` in backend/ so the client knows
--  about the new model, then redeploy the Lambda. The app tolerates these
--  columns being absent (nothing reads them until the features ship), so
--  applying this early is safe; deploying code that USES them before applying
--  it is not.
-- ============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Vendor payout destination
--
-- Sellers were shown PENDING payouts while the platform had never asked them
-- where the money should go — in practice that became an off-platform WhatsApp
-- exchange of bank details, which is both a trust problem and a fraud surface.
--
-- Deliberately UPI-only. A UPI ID ("name@bank") is a payment address, not an
-- account number + IFSC, so this stays out of the heavier obligations that
-- storing full bank credentials would attract under the DPDP Act, while still
-- covering the large majority of Indian sellers. If full bank details are ever
-- needed, treat that as a separate decision with encryption-at-rest attached.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE "Vendor" ADD COLUMN IF NOT EXISTS "payoutUpi"          TEXT;
ALTER TABLE "Vendor" ADD COLUMN IF NOT EXISTS "payoutUpiName"      TEXT;
ALTER TABLE "Vendor" ADD COLUMN IF NOT EXISTS "payoutUpiUpdatedAt" TIMESTAMP(3);


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Admin outbox
--
-- There is no transactional email provider in this project, by choice: adding
-- one costs money and would send customer name, address and email to a
-- third-party processor. Instead, order events draft a message into this table
-- and the admin dashboard renders it with copy-to-clipboard so the operator
-- sends it from their own mail client.
--
-- Net effect: the buyer gets a receipt, and no customer data leaves our
-- infrastructure. If a provider is adopted later this table becomes the send
-- queue rather than being discarded — status/sentAt/sentBy already model it.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OutboundMessageType') THEN
    CREATE TYPE "OutboundMessageType" AS ENUM (
      'ORDER_CONFIRMED',
      'ORDER_SHIPPED',
      'ORDER_DELIVERED',
      'ORDER_CANCELLED'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OutboundMessageStatus') THEN
    CREATE TYPE "OutboundMessageStatus" AS ENUM ('PENDING', 'SENT', 'SKIPPED');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "OutboundMessage" (
  "id"     TEXT NOT NULL,
  "type"   "OutboundMessageType"   NOT NULL,
  "status" "OutboundMessageStatus" NOT NULL DEFAULT 'PENDING',

  "orderId" TEXT,

  -- Snapshotted at draft time rather than joined at read time, so a message
  -- still renders exactly as drafted even if the user later edits their profile.
  "recipientEmail" TEXT NOT NULL,
  "recipientName"  TEXT,

  "subject"  TEXT NOT NULL,
  "bodyText" TEXT NOT NULL,
  "bodyHtml" TEXT,

  "sentAt" TIMESTAMP(3),
  "sentBy" TEXT,
  "note"   TEXT,

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "OutboundMessage_pkey" PRIMARY KEY ("id")
);

-- ON DELETE CASCADE: a deleted order's drafts are meaningless, and keeping them
-- would leave the recipient's email address behind with nothing to justify it.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'OutboundMessage_orderId_fkey'
  ) THEN
    ALTER TABLE "OutboundMessage"
      ADD CONSTRAINT "OutboundMessage_orderId_fkey"
      FOREIGN KEY ("orderId") REFERENCES "Order"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS "OutboundMessage_status_idx"    ON "OutboundMessage"("status");
CREATE INDEX IF NOT EXISTS "OutboundMessage_type_idx"      ON "OutboundMessage"("type");
CREATE INDEX IF NOT EXISTS "OutboundMessage_orderId_idx"   ON "OutboundMessage"("orderId");
CREATE INDEX IF NOT EXISTS "OutboundMessage_createdAt_idx" ON "OutboundMessage"("createdAt");


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Row Level Security
--
-- Every other table in this schema is reached only through the Fastify backend
-- using a direct Postgres connection, which bypasses RLS. But the Supabase
-- anon key is public (it ships in the JS bundle), so PostgREST exposes each
-- table by default. RLS with no permissive policy is what keeps that shut —
-- verified: anon reads against User/Vendor/Order return 200 with an empty set.
--
-- OutboundMessage holds customer email addresses and full order context, so it
-- gets the same treatment: RLS on, no policy for anon or authenticated.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE "OutboundMessage" ENABLE ROW LEVEL SECURITY;


-- ─────────────────────────────────────────────────────────────────────────────
-- Verification — run these after applying.
-- ─────────────────────────────────────────────────────────────────────────────

-- Expect three rows:
-- SELECT column_name, data_type FROM information_schema.columns
--  WHERE table_name = 'Vendor' AND column_name LIKE 'payoutUpi%';

-- Expect rowsecurity = true:
-- SELECT relname, relrowsecurity FROM pg_class
--  WHERE relname = 'OutboundMessage';

-- Expect 0 — no policy should exist for this table:
-- SELECT count(*) FROM pg_policies
--  WHERE schemaname = 'public' AND tablename = 'OutboundMessage';
