-- ============================================================
-- TCE-005: Additive migration for ContactMessage admin reply
-- workflow fields. NEVER DROP existing columns. All new fields
-- are nullable or carry safe defaults so production data
-- (0 rows currently) is never disrupted.
-- ============================================================

ALTER TABLE "ContactMessage"
  ADD COLUMN IF NOT EXISTS "replyText" TEXT;

ALTER TABLE "ContactMessage"
  ADD COLUMN IF NOT EXISTS "repliedAt" TIMESTAMP(3);

ALTER TABLE "ContactMessage"
  ADD COLUMN IF NOT EXISTS "repliedBy" TEXT;

-- Status trackers: UNREAD (default) → READ → REPLIED
ALTER TABLE "ContactMessage"
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'UNREAD';

-- Align existing rows using the "read" boolean column that
-- already tracks unread state.
UPDATE "ContactMessage"
SET "status" = CASE WHEN "read" = TRUE THEN 'READ' ELSE 'UNREAD' END
WHERE "status" IS NULL OR "status" = 'UNREAD';

CREATE INDEX IF NOT EXISTS "ContactMessage_status_idx"
  ON "ContactMessage" ("status");
