import { describe, it, expect } from 'vitest';
import {
  toPaise,
  toRupees,
  applyDiscountToItems,
  orderTotalFromItems,
  payoutFromItems,
  platformFeeFromItems,
} from '../../lib/money.js';

/**
 * THE INVARIANT, exactly as the payout run computes it:
 *
 *   sum((item.price - item.platformFee) * qty) + sum(item.platformFee * qty)
 *     === Order.totalAmount
 *
 * Asserted in integer paise, so "exactly" means exactly — not toBeCloseTo.
 */
const expectReconciles = (items, totalAmount) => {
  const payoutPaise = items.reduce(
    (s, i) => s + (toPaise(i.price) - toPaise(i.platformFee)) * i.quantity,
    0,
  );
  const feePaise = items.reduce((s, i) => s + toPaise(i.platformFee) * i.quantity, 0);
  expect(payoutPaise + feePaise).toBe(toPaise(totalAmount));
};

/** A line as checkout.js builds it, before any discount. */
const line = (productId, price, commissionPercent = 10) => ({
  productId,
  quantity: 1,
  price,
  commissionPercent,
  platformFee: Math.round(((price * commissionPercent) / 100) * 100) / 100,
});

describe('money — paise conversion', () => {
  it('round-trips rupees through paise', () => {
    expect(toPaise(10000)).toBe(1000000);
    expect(toPaise(6700.67)).toBe(670067);
    expect(toRupees(670067)).toBe(6700.67);
  });

  it('does not accumulate float error the way naive rupee arithmetic does', () => {
    // The canonical float trap: 0.1 + 0.2 !== 0.3
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(toRupees(toPaise(0.1) + toPaise(0.2))).toBe(0.3);
  });
});

describe('money — applyDiscountToItems (platform absorbs the discount)', () => {
  it('reproduces the reported money leak and fixes it', () => {
    // The exact worked example from the defect report:
    // product 10,000, commission 10% -> fee 1,000. Buyer applies a 20% coupon
    // and pays 8,000. The OLD behaviour left item.price at 10,000, so the payout
    // (price - platformFee) was 9,000 against 8,000 collected -> 1,000 lost.
    const items = [line('p1', 10000, 10)];
    expect(payoutFromItems(items)).toBe(9000);

    const discounted = applyDiscountToItems(items, 2000);
    const totalAmount = orderTotalFromItems(discounted); // what the buyer pays

    expect(totalAmount).toBe(8000);
    expect(discounted[0].price).toBe(8000); // discount is now visible on the ITEM
    expect(discounted[0].platformFee).toBe(-1000); // platform funds the promo
    expect(payoutFromItems(discounted)).toBe(9000); // vendor's payout is untouched
    expect(platformFeeFromItems(discounted)).toBe(-1000);

    // 9,000 paid out + (-1,000) platform = 8,000 collected. Nothing is lost.
    expectReconciles(discounted, totalAmount);
  });

  it('leaves the vendor whole and the platform funding the whole sale at 100% off', () => {
    // discountPercent: 100 is permitted by schemas/coupon.js. Buyer pays 0 and
    // the vendor is still owed their full 9,000 — the platform pays all of it.
    const items = [line('p1', 10000, 10)];
    const discounted = applyDiscountToItems(items, 10000);
    const totalAmount = orderTotalFromItems(discounted);

    expect(totalAmount).toBe(0);
    expect(discounted[0].price).toBe(0);
    expect(payoutFromItems(discounted)).toBe(9000);
    expect(platformFeeFromItems(discounted)).toBe(-9000);
    expectReconciles(discounted, totalAmount); // 9000 + (-9000) === 0
  });

  it('splits an evenly-divisible discount across 3 items (price 10000, 33% off)', () => {
    const items = [line('p1', 10000), line('p2', 10000), line('p3', 10000)];
    const discountAmount = Math.round(((30000 * 33) / 100) * 100) / 100; // 9900
    expect(discountAmount).toBe(9900);

    const discounted = applyDiscountToItems(items, discountAmount);
    const totalAmount = orderTotalFromItems(discounted);

    expect(totalAmount).toBe(20100); // 30000 - 9900
    expect(discounted.map((i) => i.price)).toEqual([6700, 6700, 6700]);
    expect(payoutFromItems(discounted)).toBe(27000); // 3 x 9000, unchanged by the coupon
    expectReconciles(discounted, totalAmount);
  });

  it('creates and destroys no paise on a FRACTIONAL split with a remainder', () => {
    // 30001 @ 33% = 9900.33 — does not divide into 3 equal paise amounts.
    const items = [line('p1', 10000), line('p2', 10000), line('p3', 10001)];
    const discountAmount = Math.round(((30001 * 33) / 100) * 100) / 100;
    expect(discountAmount).toBe(9900.33);

    const discounted = applyDiscountToItems(items, discountAmount);
    const totalAmount = orderTotalFromItems(discounted);

    // The odd paise lands on the last line rather than being rounded away.
    expect(discounted.map((i) => i.price)).toEqual([6700, 6700, 6700.67]);
    expect(discounted.map((i) => i.platformFee)).toEqual([-2300, -2300, -2300.23]);

    // The shares sum to the discount EXACTLY: 3300 + 3300 + 3300.33 = 9900.33
    const shares = items.map((it, k) => toPaise(it.price) - toPaise(discounted[k].price));
    expect(shares.reduce((a, b) => a + b, 0)).toBe(toPaise(discountAmount));

    // Total charged is exactly subtotal - discount, to the paise.
    expect(toPaise(totalAmount)).toBe(toPaise(30001) - toPaise(9900.33));
    expect(totalAmount).toBe(20100.67);

    // Vendors are paid exactly what they were owed pre-coupon: 9000 + 9000 + 9000.90
    expect(payoutFromItems(items)).toBe(27000.9);
    expect(payoutFromItems(discounted)).toBe(27000.9);
    expect(platformFeeFromItems(discounted)).toBe(-6900.23);

    // 27000.90 + (-6900.23) === 20100.67. No paise created or destroyed.
    expectReconciles(discounted, totalAmount);
  });

  it('only discounts the lines a product-scoped coupon applies to', () => {
    const items = [line('p1', 1000), line('p2', 500)];
    const discounted = applyDiscountToItems(items, 100, (i) => i.productId === 'p1');

    expect(discounted[0].price).toBe(900);
    expect(discounted[1]).toEqual(items[1]); // untouched
    expectReconciles(discounted, orderTotalFromItems(discounted));
  });

  it('does not mutate the caller’s items', () => {
    const items = [line('p1', 1000)];
    applyDiscountToItems(items, 100);
    expect(items[0].price).toBe(1000);
    expect(items[0].platformFee).toBe(100);
  });

  it('is a no-op when there is no discount', () => {
    const items = [line('p1', 1000)];
    expect(applyDiscountToItems(items, 0)).toEqual(items);
  });

  it('refuses a discount larger than the eligible lines rather than paying the buyer', () => {
    const items = [line('p1', 1000)];
    expect(() => applyDiscountToItems(items, 1000.01)).toThrow(/exceeds the eligible line total/);
  });

  it('stays exact on amounts large enough to overflow float multiplication', () => {
    // discountPaise * cumWeight exceeds Number.MAX_SAFE_INTEGER here; a Number
    // multiply would silently drop low paise and break the invariant.
    const items = [line('p1', 4000000.01), line('p2', 3000000.07), line('p3', 2999999.99)];
    const subtotal = 4000000.01 + 3000000.07 + 2999999.99;
    const discountAmount = Math.round(((subtotal * 33) / 100) * 100) / 100;

    const discounted = applyDiscountToItems(items, discountAmount);
    const totalAmount = orderTotalFromItems(discounted);

    expect(toPaise(totalAmount)).toBe(toPaise(subtotal) - toPaise(discountAmount));
    expect(payoutFromItems(discounted)).toBe(payoutFromItems(items));
    expectReconciles(discounted, totalAmount);
  });

  it('holds the invariant across a sweep of awkward prices and percentages', () => {
    const prices = [1, 0.01, 33.33, 999.99, 10000, 12345.67, 7, 0.03];
    const percents = [1, 3, 7, 12.5, 33, 50, 66.67, 99, 100];

    for (const pct of percents) {
      for (let n = 1; n <= prices.length; n++) {
        const items = prices.slice(0, n).map((p, k) => line(`p${k}`, p, 10 + (k % 16)));
        const subtotal = items.reduce((s, i) => s + toPaise(i.price) * i.quantity, 0);
        const discountAmount = Math.round((toRupees(subtotal) * pct) / 100 / 0.01) * 0.01;
        const discountPaise = Math.min(toPaise(discountAmount), subtotal);

        const discounted = applyDiscountToItems(items, toRupees(discountPaise));
        const totalAmount = orderTotalFromItems(discounted);

        // 1. buyer is charged exactly subtotal - discount
        expect(toPaise(totalAmount)).toBe(subtotal - discountPaise);
        // 2. the books balance to the paise
        expectReconciles(discounted, totalAmount);
        // 3. the vendor's payout never moves — the platform absorbs the promo
        expect(toPaise(payoutFromItems(discounted))).toBe(toPaise(payoutFromItems(items)));
      }
    }
  });
});
