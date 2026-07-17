import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import { ZodError } from 'zod';

function buildApp(mockPrisma) {
  const fastify = Fastify();
  fastify.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: 'Validation Error', issues: error.issues });
    }
    reply.status(error.statusCode || 500).send({ error: error.message });
  });
  fastify.decorate('prisma', mockPrisma);
  fastify.decorate('authenticate', async (req, reply) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return reply.status(401).send({ error: 'No token provided' });
    req.user = { sub: 'sb-123' };
    req.dbUser = { id: 'buyer-id', name: 'Buyer', email: 'buyer@test.com', role: 'user' };
  });
  fastify.decorate('authenticateAdmin', async (req, reply) => {
    req.dbUser = { id: 'admin-id', role: 'admin' };
  });
  return fastify;
}

/**
 * POST /apply-coupon attaches a coupon to an ALREADY-CREATED order. It has the
 * same two obligations as create-order:
 *
 *  1. the discount must reach OrderItem.price, because the payout run reads the
 *     ITEM — a discount recorded only on Order.totalAmount is money the platform
 *     collects but still disburses;
 *  2. sum(item payouts) + sum(platformFee) === Order.totalAmount, exactly.
 */
describe('coupon routes — POST /apply-coupon', () => {
  let mockPrisma;
  let tx;
  let orderItemUpdate;
  let queryRaw;
  let orderUpdateMany;
  let orderCount;

  const payoutOf = (items) => items.reduce((s, i) => s + (i.price - i.platformFee) * i.quantity, 0);
  const feesOf = (items) => items.reduce((s, i) => s + i.platformFee * i.quantity, 0);

  // The item rows as written back by the route.
  const writtenItems = () =>
    orderItemUpdate.mock.calls.map((c) => ({
      id: c[0].where.id,
      quantity: 1,
      ...c[0].data,
    }));

  const pendingOrder = (items) => ({
    id: 'o1',
    userId: 'buyer-id',
    status: 'Pending',
    paymentStatus: 'Pending',
    couponId: null,
    totalAmount: items.reduce((s, i) => s + i.price * i.quantity, 0),
    items,
  });

  const item = (id, productId, price, commissionPercent = 10) => ({
    id,
    productId,
    quantity: 1,
    price,
    commissionPercent,
    platformFee: Math.round(((price * commissionPercent) / 100) * 100) / 100,
    product: { id: productId },
  });

  const coupon = (overrides = {}) => ({
    id: 'c1',
    code: 'SAVE20',
    discountPercent: 20,
    productId: null,
    minPurchase: 0,
    maxUses: 0,
    maxUsesPerUser: 0,
    isActive: true,
    expiresAt: null,
    ...overrides,
  });

  const post = async (code = 'SAVE20', orderId = 'o1') => {
    const app = buildApp(mockPrisma);
    await app.register((await import('../../routes/coupon.js')).default);
    await app.ready();
    return app.inject({
      method: 'POST',
      url: '/apply-coupon',
      payload: { code, orderId },
      headers: { authorization: 'Bearer buyer' },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    orderItemUpdate = vi.fn();
    queryRaw = vi.fn().mockResolvedValue([{ id: 'c1' }]);
    orderUpdateMany = vi.fn().mockResolvedValue({ count: 1 });
    orderCount = vi.fn().mockResolvedValue(0);
    tx = {
      order: { updateMany: orderUpdateMany, count: orderCount, findUnique: vi.fn() },
      orderItem: { update: orderItemUpdate },
      $queryRaw: queryRaw,
    };
    mockPrisma = {
      order: { findUnique: vi.fn() },
      coupon: { findUnique: vi.fn() },
      $transaction: vi.fn(async (cb) => cb(tx)),
    };
  });

  it('pushes the discount into the item rows and reconciles to the paise', async () => {
    // 10,000 @ 10% commission, 20% coupon -> buyer pays 8,000, vendor still 9,000.
    const items = [item('i1', 'p1', 10000, 10)];
    mockPrisma.order.findUnique.mockResolvedValue(pendingOrder(items));
    mockPrisma.coupon.findUnique.mockResolvedValue(coupon());
    tx.order.findUnique.mockResolvedValue({ id: 'o1', totalAmount: 8000 });

    const res = await post();

    expect(res.statusCode).toBe(200);
    expect(res.json().discountAmount).toBe(2000);
    expect(res.json().newTotal).toBe(8000);

    // The order total is discounted...
    expect(orderUpdateMany.mock.calls[0][0].data).toMatchObject({
      couponId: 'c1',
      discountAmount: 2000,
      subtotalBeforeDiscount: 10000,
      totalAmount: 8000,
    });
    // ...and so is the item the payout will actually read.
    const written = writtenItems();
    expect(written).toEqual([{ id: 'i1', quantity: 1, price: 8000, platformFee: -1000 }]);
    expect(payoutOf(written)).toBe(9000); // vendor's agreed payout, untouched
    expect(payoutOf(written) + feesOf(written)).toBe(8000); // === totalAmount
  });

  it('reconciles exactly on a fractional multi-item split', async () => {
    // 30001 @ 33% = 9900.33, which does not divide evenly across three lines.
    const items = [item('i1', 'p1', 10000), item('i2', 'p2', 10000), item('i3', 'p3', 10001)];
    mockPrisma.order.findUnique.mockResolvedValue(pendingOrder(items));
    mockPrisma.coupon.findUnique.mockResolvedValue(coupon({ discountPercent: 33 }));
    tx.order.findUnique.mockResolvedValue({ id: 'o1', totalAmount: 20100.67 });

    const res = await post();

    expect(res.statusCode).toBe(200);
    expect(res.json().discountAmount).toBe(9900.33);
    expect(res.json().newTotal).toBe(20100.67); // 30001 - 9900.33

    const written = writtenItems();
    expect(written.map((i) => i.price)).toEqual([6700, 6700, 6700.67]);
    const paise = (r) => Math.round(r * 100);
    expect(paise(payoutOf(written)) + paise(feesOf(written))).toBe(paise(20100.67));
    expect(payoutOf(written)).toBe(27000.9); // unchanged by the coupon
  });

  it('only touches the lines a product-scoped coupon applies to', async () => {
    const items = [item('i1', 'p1', 1000), item('i2', 'p2', 500)];
    mockPrisma.order.findUnique.mockResolvedValue(pendingOrder(items));
    mockPrisma.coupon.findUnique.mockResolvedValue(
      coupon({ discountPercent: 10, productId: 'p1' }),
    );
    tx.order.findUnique.mockResolvedValue({ id: 'o1', totalAmount: 1400 });

    const res = await post();

    expect(res.statusCode).toBe(200);
    expect(res.json().discountAmount).toBe(100); // 10% of the eligible 1000, not of 1500
    expect(orderItemUpdate).toHaveBeenCalledTimes(1);
    expect(orderItemUpdate.mock.calls[0][0]).toMatchObject({
      where: { id: 'i1' },
      data: { price: 900, platformFee: 0 },
    });
  });

  it('enforces the usage limit under the coupon row lock, before writing', async () => {
    const items = [item('i1', 'p1', 1000)];
    mockPrisma.order.findUnique.mockResolvedValue(pendingOrder(items));
    mockPrisma.coupon.findUnique.mockResolvedValue(coupon({ maxUses: 1 }));
    orderCount.mockResolvedValue(1); // another order already holds this coupon

    const res = await post();

    expect(res.statusCode).toBe(422);
    expect(res.json().error).toBe('Coupon usage limit reached');
    expect(orderUpdateMany).not.toHaveBeenCalled();
    expect(orderItemUpdate).not.toHaveBeenCalled();
    // race safety: lock acquired before the count
    expect(queryRaw.mock.calls[0][0].join('?')).toMatch(/FOR UPDATE/);
    expect(queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
      orderCount.mock.invocationCallOrder[0],
    );
  });

  it('does not count the order being amended against its own limit', async () => {
    const items = [item('i1', 'p1', 1000)];
    mockPrisma.order.findUnique.mockResolvedValue(pendingOrder(items));
    mockPrisma.coupon.findUnique.mockResolvedValue(coupon({ maxUses: 1 }));
    tx.order.findUnique.mockResolvedValue({ id: 'o1', totalAmount: 800 });

    expect((await post()).statusCode).toBe(200);
    expect(orderCount.mock.calls[0][0].where).toMatchObject({
      couponId: 'c1',
      id: { not: 'o1' },
    });
  });

  it('refuses to stack a second coupon on an order that already has one', async () => {
    const items = [item('i1', 'p1', 1000)];
    mockPrisma.order.findUnique.mockResolvedValue({
      ...pendingOrder(items),
      couponId: 'other',
    });

    const res = await post();
    expect(res.statusCode).toBe(422);
    expect(res.json().error).toMatch(/already been applied/);
    expect(orderItemUpdate).not.toHaveBeenCalled();
  });

  it('loses the race to a concurrent apply and writes nothing', async () => {
    const items = [item('i1', 'p1', 1000)];
    mockPrisma.order.findUnique.mockResolvedValue(pendingOrder(items));
    mockPrisma.coupon.findUnique.mockResolvedValue(coupon());
    orderUpdateMany.mockResolvedValue({ count: 0 }); // someone else got there first

    const res = await post();
    expect(res.statusCode).toBe(422);
    expect(res.json().error).toMatch(/already been applied/);
    expect(orderItemUpdate).not.toHaveBeenCalled();
  });

  it('rejects an inactive coupon', async () => {
    mockPrisma.order.findUnique.mockResolvedValue(pendingOrder([item('i1', 'p1', 1000)]));
    mockPrisma.coupon.findUnique.mockResolvedValue(coupon({ isActive: false }));

    const res = await post();
    expect(res.statusCode).toBe(422);
    expect(res.json().error).toMatch(/no longer active/);
  });

  it('rejects an expired coupon', async () => {
    mockPrisma.order.findUnique.mockResolvedValue(pendingOrder([item('i1', 'p1', 1000)]));
    mockPrisma.coupon.findUnique.mockResolvedValue(coupon({ expiresAt: '2020-01-01T00:00:00Z' }));

    const res = await post();
    expect(res.statusCode).toBe(422);
    expect(res.json().error).toMatch(/expired/);
  });

  it('rejects a coupon whose minimum purchase is not met', async () => {
    mockPrisma.order.findUnique.mockResolvedValue(pendingOrder([item('i1', 'p1', 1000)]));
    mockPrisma.coupon.findUnique.mockResolvedValue(coupon({ minPurchase: 5000 }));

    const res = await post();
    expect(res.statusCode).toBe(422);
    expect(res.json().error).toMatch(/Minimum purchase/);
  });

  it('rejects a coupon that matches no item in the order', async () => {
    mockPrisma.order.findUnique.mockResolvedValue(pendingOrder([item('i1', 'p1', 1000)]));
    mockPrisma.coupon.findUnique.mockResolvedValue(coupon({ productId: 'other-product' }));

    const res = await post();
    expect(res.statusCode).toBe(422);
    expect(res.json().error).toMatch(/does not apply/);
  });

  it('refuses to discount an order that is already paid', async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      ...pendingOrder([item('i1', 'p1', 1000)]),
      paymentStatus: 'Paid',
    });

    const res = await post();
    expect(res.statusCode).toBe(422);
    expect(res.json().error).toMatch(/already been paid/);
  });

  it("refuses to discount another user's order", async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      ...pendingOrder([item('i1', 'p1', 1000)]),
      userId: 'someone-else',
    });

    const res = await post();
    expect(res.statusCode).toBe(403);
  });

  it('returns 404 for an unknown order', async () => {
    mockPrisma.order.findUnique.mockResolvedValue(null);
    expect((await post()).statusCode).toBe(404);
  });

  it('returns 404 for an unknown coupon', async () => {
    mockPrisma.order.findUnique.mockResolvedValue(pendingOrder([item('i1', 'p1', 1000)]));
    mockPrisma.coupon.findUnique.mockResolvedValue(null);
    expect((await post()).statusCode).toBe(404);
  });
});
