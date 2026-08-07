-- ============================================================
-- TCE-006: Additive migration for admin-defined custom columns
-- on Product. `adminNotes` stores admin-only free-text values
-- keyed by custom column id, e.g.
--   {"col_abc123": "paid in cash", "col_def456": "needs polish"}
--
-- NEVER DROP existing columns. The new column is NOT NULL with a
-- safe '{}' default so existing rows backfill automatically and
-- production data is never disrupted.
--
-- SECURITY: this column is admin-only. It is globally omitted by
-- the Prisma client (backend/plugins/prisma.js) and only opted
-- back into on admin-authenticated routes.
-- ============================================================

ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "adminNotes" JSONB NOT NULL DEFAULT '{}';
