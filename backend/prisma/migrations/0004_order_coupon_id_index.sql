-- Coupon usage-limit enforcement: index the column the limit check counts on.
--
-- NOT YET APPLIED. Written as a file only, per instruction — nothing here has
-- been run against any database.
--
-- Background: create-order and /apply-coupon enforce maxUses/maxUsesPerUser by
-- counting the Orders that hold a coupon, while holding that coupon's row lock
-- (SELECT ... FOR UPDATE — see backend/lib/coupon.js). The correctness of that
-- check does not depend on this index; its COST does. "Order"."couponId" is
-- unindexed (see 0001_baseline.sql — Order is indexed on userId, status,
-- displayId, paymentStatus, createdAt, but not couponId), so the count is a
-- sequential scan over the whole Order table, executed while every other
-- checkout claiming the same coupon is queued behind the lock. That is fine at
-- today's row count and degrades badly as Order grows.
--
-- Partial index: the check only ever counts orders that still hold the coupon,
-- and only non-NULL couponId rows are countable, so the index only needs to
-- cover those — on a table where most orders carry no coupon this stays small.
--
-- CONCURRENTLY so this does not take a write lock on Order in production. It
-- cannot run inside a transaction block: run it standalone (autocommit),
-- following the same convention as 0003_manual_orders.sql.
--
-- Migration: add_order_coupon_id_index (2026-07-17)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Order_couponId_idx"
  ON "Order" ("couponId")
  WHERE "couponId" IS NOT NULL;

-- When this is applied, add the matching declaration to schema.prisma's Order
-- model so the schema and the database do not drift:
--
--   @@index([couponId])
--
-- (Prisma cannot express the partial WHERE clause; the declaration is only there
-- to stop `prisma migrate` proposing to drop the index.)
