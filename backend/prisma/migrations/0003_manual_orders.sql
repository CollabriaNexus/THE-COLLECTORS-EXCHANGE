-- Manual order punching: flag orders created by an admin (cash / walk-in / backfill)
-- and widen PaymentMethod to cover the offline tender types the admin UI offers.

-- Migration: add_order_is_manual (2026-07-16)
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "isManual" BOOLEAN NOT NULL DEFAULT false;

-- Migration: extend_payment_method_enum (2026-07-16)
-- NOTE: ALTER TYPE ... ADD VALUE cannot run inside a transaction block on
-- PostgreSQL < 12, and even on >= 12 the new value is not usable in the same
-- transaction that adds it. Run each statement below standalone (autocommit),
-- separately from the ALTER TABLE above.
ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'card';
ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'upi';
ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'bank_transfer';
