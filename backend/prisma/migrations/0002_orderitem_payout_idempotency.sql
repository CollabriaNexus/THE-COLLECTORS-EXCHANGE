-- Payout idempotency: mark each OrderItem once it has been included in a payout,
-- so auto-create-payout can never sweep the same delivered item into a second payout.

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN "paidOut" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "OrderItem" ADD COLUMN "payoutId" TEXT;

-- CreateIndex
CREATE INDEX "OrderItem_paidOut_idx" ON "OrderItem"("paidOut");
