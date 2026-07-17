/**
 * Money helpers for order/discount arithmetic.
 *
 * Every money column in schema.prisma is a Float, so arithmetic done directly in
 * rupees accumulates binary-float error. Everything here is computed in *integer
 * paise* and converted back to rupees exactly once, at the end.
 *
 * THE INVARIANT these helpers exist to protect, for every order:
 *
 *     sum(vendor payouts) + sum(platform fees) == Order.totalAmount
 *
 * Payout is computed by subtraction from the stored item columns
 * (admin.js `/payouts/auto-create`: `(item.price - item.platformFee) * quantity`).
 * Substituting that in:
 *
 *     sum((price - fee) * qty) + sum(fee * qty)  ==  sum(price * qty)
 *
 * The fee term cancels *identically*. That has two consequences that drive the
 * whole design here:
 *
 *   1. The invariant holds if and only if `sum(OrderItem.price * quantity)`
 *      equals `Order.totalAmount`. It cannot be fixed by touching platformFee
 *      alone. A discount MUST be pushed down into `OrderItem.price` itself.
 *   2. Because payout is a subtraction of two stored columns, whatever rounding
 *      lands in platformFee is absorbed and can never leak into the total. Only
 *      the apportionment of the discount across item prices has to be exact.
 */

/** Rupees (Float) -> integer paise. */
export const toPaise = (rupees) => Math.round(Number(rupees) * 100);

/** Integer paise -> rupees (Float), as a clean 2-decimal value. */
export const toRupees = (paise) => Math.round(paise) / 100;

/**
 * round(a * b / c) for non-negative integers, exact, via BigInt.
 *
 * `Math.round(discountPaise * weight / total)` would be the obvious spelling, but
 * the intermediate PRODUCT overflows Number.MAX_SAFE_INTEGER for orders of only a
 * few lakh rupees (1e8 * 1e8 = 1e16 > 9.007e15), silently dropping paise. The
 * multiply therefore has to happen in BigInt too — computing `a * b` as a Number
 * and only then widening would have already lost the low bits.
 *
 * round(n/d) == floor((2n + d) / 2d) for non-negative n.
 */
const mulDivRound = (a, b, c) => {
  const num = 2n * BigInt(a) * BigInt(b) + BigInt(c);
  const den = 2n * BigInt(c);
  return Number(num / den);
};

/** Exact order total implied by the item rows: sum(price * quantity). */
export const orderTotalFromItems = (items) =>
  toRupees(items.reduce((sum, i) => sum + toPaise(i.price) * i.quantity, 0));

/** What admin.js will actually disburse for these items: sum((price - fee) * qty). */
export const payoutFromItems = (items) =>
  toRupees(
    items.reduce(
      (sum, i) => sum + (toPaise(i.price) - toPaise(i.platformFee ?? 0)) * i.quantity,
      0,
    ),
  );

/** The platform's take for these items: sum(fee * qty). May be negative — see below. */
export const platformFeeFromItems = (items) =>
  toRupees(items.reduce((sum, i) => sum + toPaise(i.platformFee ?? 0) * i.quantity, 0));

/**
 * Push a coupon discount down into the order lines it applies to.
 *
 * DISCOUNT POLICY: **the platform absorbs the promo** (option (a)).
 *
 * Each eligible line has its apportioned share `d` subtracted from BOTH `price`
 * and `platformFee`, so the payout subtraction gives:
 *
 *     payout = price' - fee' = (p - d) - (f - d) = p - f
 *
 * i.e. the vendor is paid exactly what they were owed before the coupon existed —
 * their agreed (price - commission) — and the entire discount comes out of the
 * platform's commission. Past a large enough discount the platform's fee on a
 * line goes NEGATIVE. That is correct and intentional: it is the platform paying,
 * out of pocket, for a promotion it chose to run.
 *
 * The alternative (vendor shares the discount pro-rata) is a business decision,
 * not a technical one. Nothing in the repo states a policy, so this picks the
 * option that does not silently reduce a seller's agreed payout.
 *
 * @param {Array<{price:number, platformFee:number, quantity:number}>} items - not mutated.
 * @param {number} discountAmount - total discount in rupees (Order.discountAmount).
 * @param {(item:any) => boolean} isEligible - the lines the coupon is scoped to.
 * @returns {Array} new item objects with adjusted price/platformFee.
 */
export function applyDiscountToItems(items, discountAmount, isEligible = () => true) {
  const out = items.map((i) => ({ ...i }));
  const discountPaise = toPaise(discountAmount);
  if (discountPaise <= 0) return out;

  const targets = [];
  let totalWeight = 0;
  out.forEach((item, k) => {
    if (!isEligible(item)) return;
    const weight = toPaise(item.price) * item.quantity;
    if (weight <= 0) return;
    targets.push({ k, weight });
    totalWeight += weight;
  });

  if (totalWeight <= 0) {
    throw new Error('applyDiscountToItems: no eligible line has any value to discount');
  }
  if (discountPaise > totalWeight) {
    // Would push a line price negative and hand the buyer money. Not reachable
    // via the coupon routes (the discount is a <=100% cut of exactly these
    // lines), so getting here means a caller computed it off a different set.
    throw new Error('applyDiscountToItems: discount exceeds the eligible line total');
  }

  // Cumulative (not per-line) rounding: each line is allocated against a running
  // *exact* target, so rounding error can never accumulate. The final line closes
  // on cumWeight === totalWeight, whose target is discountPaise exactly, so the
  // shares sum to the discount to the paise by construction — no paise is created
  // or destroyed, however the ratios happen to fall.
  let cumWeight = 0;
  let cumAllocated = 0;
  for (const { k, weight } of targets) {
    cumWeight += weight;
    const cumTarget =
      cumWeight === totalWeight
        ? discountPaise
        : mulDivRound(discountPaise, cumWeight, totalWeight);
    const sharePaise = cumTarget - cumAllocated;
    cumAllocated = cumTarget;

    const item = out[k];
    // quantity is pinned at 1 for these one-of-a-kind listings, so a line's share
    // is also its per-unit share. Fail loudly rather than round money away if a
    // multi-unit line ever appears and the share doesn't divide evenly.
    if (sharePaise % item.quantity !== 0) {
      throw new Error(
        'applyDiscountToItems: discount share does not divide evenly across quantity',
      );
    }
    const perUnit = sharePaise / item.quantity;
    item.price = toRupees(toPaise(item.price) - perUnit);
    item.platformFee = toRupees(toPaise(item.platformFee ?? 0) - perUnit);
  }

  return out;
}
