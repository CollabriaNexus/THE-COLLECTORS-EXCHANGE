/**
 * Coupon usage-limit enforcement.
 *
 * An error carrying the HTTP status the route should reply with.
 */
export class OrderError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * An order "holds" a coupon unless it has been cancelled or its money came back.
 *
 * WHY ORDERS AND NOT CouponUsage: the limit check has to consult state that
 * exists at the moment the discount is *granted*. `Order.couponId` is written by
 * create-order/apply-coupon — the CouponUsage row is not written until
 * verify-payment. Counting CouponUsage at grant time (the old behaviour) always
 * read 0, so a maxUses:1 coupon could be attached to N checkouts and then all N
 * verified. The Order row IS the reservation.
 *
 * Trade-off: an abandoned checkout that is left Pending holds its use until the
 * order is cancelled. That is the deliberate direction to err in — burning a
 * promo slot is recoverable (an admin can raise maxUses), over-issuing a discount
 * is money already gone. See the report for the suggested Pending-order reaper.
 */
const holdsCoupon = (couponId) => ({
  couponId,
  status: { not: 'Cancelled' },
  paymentStatus: { notIn: ['Failed', 'Refunded'] },
});

/**
 * Enforce maxUses / maxUsesPerUser, race-safely, and reserve a use for this order.
 *
 * MUST be called inside an interactive transaction that goes on to write the
 * Order carrying `couponId` — the reservation is only real once that row commits
 * alongside the lock below.
 *
 * RACE SAFETY: count-then-insert is not safe under Postgres' default Read
 * Committed isolation — two concurrent transactions both read count=0 and both
 * insert, and no constraint stops them. So take the coupon row's write lock
 * FIRST. Concurrent claimers on the same coupon then queue behind it, and
 * because Read Committed takes a fresh snapshot per statement, whoever waits
 * sees the winner's committed order once the lock is released at commit. This is
 * a DB-level guarantee and needs no schema change.
 *
 * @param {import('@prisma/client').Prisma.TransactionClient} tx
 * @param {{id:string, maxUses:number, maxUsesPerUser:number}} coupon
 * @param {string} userId
 * @param {string} [excludeOrderId] - an existing order being amended, so it does
 *   not count itself.
 */
export async function claimCouponUse(tx, coupon, userId, excludeOrderId) {
  if (!(coupon.maxUses > 0) && !(coupon.maxUsesPerUser > 0)) return;

  // Serializes every concurrent checkout claiming this coupon. Held until commit.
  await tx.$queryRaw`SELECT id FROM "Coupon" WHERE id = ${coupon.id} FOR UPDATE`;

  const where = holdsCoupon(coupon.id);
  if (excludeOrderId) where.id = { not: excludeOrderId };

  if (coupon.maxUses > 0) {
    const used = await tx.order.count({ where });
    if (used >= coupon.maxUses) {
      throw new OrderError(422, 'Coupon usage limit reached');
    }
  }

  if (coupon.maxUsesPerUser > 0) {
    const usedByUser = await tx.order.count({ where: { ...where, userId } });
    if (usedByUser >= coupon.maxUsesPerUser) {
      throw new OrderError(422, 'You have already used this coupon the maximum number of times');
    }
  }
}
