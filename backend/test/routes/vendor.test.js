import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';

function buildApp(mockPrisma) {
  const fastify = Fastify();
  fastify.decorate('prisma', mockPrisma);
  fastify.decorate('authenticate', async (req, reply) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return reply.status(401).send({ error: 'No token provided' });
    req.user = { sub: 'sb-123' };
    req.dbUser =
      token === 'admin'
        ? { id: 'admin-id', role: 'admin' }
        : { id: 'vendor-user-id', role: 'user' };
  });
  return fastify;
}

describe('vendor routes', () => {
  let mockPrisma;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma = {
      vendor: { findUnique: vi.fn(), update: vi.fn() },
      product: { count: vi.fn(), findMany: vi.fn() },
      orderItem: { findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
      order: { findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
      payout: { findMany: vi.fn(), count: vi.fn(), aggregate: vi.fn() },
      productView: { count: vi.fn(), groupBy: vi.fn() },
      cartEvent: { count: vi.fn() },
      checkoutEvent: { count: vi.fn() },
      rating: { findUnique: vi.fn(), create: vi.fn() },
      $transaction: vi.fn(),
    };
  });

  describe('GET /profile', () => {
    it('returns vendor profile', async () => {
      mockPrisma.vendor.findUnique.mockResolvedValue({
        id: 'v1',
        type: 'SINGLE',
        status: 'APPROVED',
      });
      mockPrisma.product.count.mockResolvedValue(3);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/vendor.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/profile',
        headers: { authorization: 'Bearer vendor' },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().activeCount).toBe(3);
    });

    it('returns 401 without dbUser', async () => {
      const fastify2 = Fastify();
      fastify2.decorate('prisma', mockPrisma);
      fastify2.decorate('authenticate', async (req, reply) => {
        req.user = { sub: '' };
        req.dbUser = null;
      });
      await fastify2.register((await import('../../routes/vendor.js')).default);
      await fastify2.ready();
      const res = await fastify2.inject({
        method: 'GET',
        url: '/profile',
        headers: { authorization: 'Bearer token' },
      });
      expect(res.statusCode).toBe(401);
    });

    it('returns 404 when vendor not found', async () => {
      mockPrisma.vendor.findUnique.mockResolvedValue(null);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/vendor.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/profile',
        headers: { authorization: 'Bearer vendor' },
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /stats', () => {
    it('returns vendor stats', async () => {
      mockPrisma.vendor.findUnique.mockResolvedValue({ id: 'v1' });
      // First call: fetch product IDs; second call: getOfflineSold (empty)
      mockPrisma.product.findMany.mockResolvedValueOnce([{ id: 'p1' }]).mockResolvedValueOnce([]);
      mockPrisma.orderItem.findMany.mockResolvedValue([
        { price: 100, quantity: 2, orderId: 'o1', platformFee: 20 },
      ]);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/vendor.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/stats',
        headers: { authorization: 'Bearer vendor' },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().totalSales).toBe(200);
    });

    it('returns totalPlatformFees and netEarnings in stats', async () => {
      mockPrisma.vendor.findUnique.mockResolvedValue({ id: 'v1' });
      // First call: fetch product IDs; second call: getOfflineSold (empty)
      mockPrisma.product.findMany.mockResolvedValueOnce([{ id: 'p1' }]).mockResolvedValueOnce([]);
      mockPrisma.orderItem.findMany.mockResolvedValue([
        { price: 100, quantity: 1, orderId: 'o1', platformFee: 20 },
        { price: 200, quantity: 1, orderId: 'o2', platformFee: 50 },
      ]);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/vendor.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/stats',
        headers: { authorization: 'Bearer vendor' },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().totalSales).toBe(300);
      expect(res.json().totalPlatformFees).toBe(70);
      expect(res.json().netEarnings).toBe(230);
    });

    it('returns 404 without vendor', async () => {
      mockPrisma.vendor.findUnique.mockResolvedValue(null);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/vendor.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/stats',
        headers: { authorization: 'Bearer vendor' },
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /analytics/overview', () => {
    it('returns analytics overview', async () => {
      mockPrisma.vendor.findUnique.mockResolvedValue({ id: 'v1' });
      mockPrisma.product.findMany.mockResolvedValue([{ id: 'p1' }]);
      mockPrisma.orderItem.findMany.mockResolvedValue([]);
      mockPrisma.payout.aggregate.mockResolvedValue({ _sum: { amount: 0 } });
      mockPrisma.product.count.mockResolvedValue(0);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/vendor.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/analytics/overview',
        headers: { authorization: 'Bearer vendor' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('returns totalPlatformFees and netEarnings in analytics overview', async () => {
      mockPrisma.vendor.findUnique.mockResolvedValue({ id: 'v1' });
      mockPrisma.product.findMany
        .mockResolvedValueOnce([{ id: 'p1' }, { id: 'p2' }])
        .mockResolvedValue([]);
      mockPrisma.orderItem.findMany.mockResolvedValue([
        {
          price: 100,
          quantity: 2,
          orderId: 'o1',
          platformFee: 20,
          createdAt: new Date(),
          order: { paymentStatus: 'Paid', status: 'Delivered' },
        },
        {
          price: 50,
          quantity: 1,
          orderId: 'o2',
          platformFee: 5,
          createdAt: new Date(),
          order: { paymentStatus: 'Pending', status: 'Processing' },
        },
      ]);
      mockPrisma.payout.aggregate.mockResolvedValue({ _sum: { amount: 0 } });
      mockPrisma.product.count.mockResolvedValue(2);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/vendor.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/analytics/overview',
        headers: { authorization: 'Bearer vendor' },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().totalRevenue).toBe(250);
      // platformFee is stored PER UNIT, so it must be multiplied by quantity just
      // like price is. This previously summed the raw column (25), which both
      // under-reported the platform's take and made netEarnings (225) disagree
      // with what the payout run would actually pay out.
      expect(res.json().totalPlatformFees).toBe(45); // 20*2 + 5*1
      // === the payout formula in admin.js: sum((price - platformFee) * quantity)
      // = (100-20)*2 + (50-5)*1 = 205
      expect(res.json().netEarnings).toBe(205);
      // and the money reconciles: payouts + fees == revenue collected
      expect(res.json().netEarnings + res.json().totalPlatformFees).toBe(res.json().totalRevenue);
    });
  });

  describe('GET /analytics/interest', () => {
    it('returns interest data', async () => {
      mockPrisma.product.findMany.mockResolvedValue([{ id: 'p1' }]);
      mockPrisma.productView.count.mockResolvedValue(10);
      mockPrisma.productView.groupBy.mockResolvedValue([]);
      mockPrisma.cartEvent.count.mockResolvedValue(3);
      mockPrisma.checkoutEvent.count.mockResolvedValue(1);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/vendor.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/analytics/interest',
        headers: { authorization: 'Bearer vendor' },
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('GET /analytics/sales-graph', () => {
    it('returns sales graph data', async () => {
      mockPrisma.product.findMany.mockResolvedValueOnce([{ id: 'p1' }]).mockResolvedValue([]);
      mockPrisma.orderItem.findMany.mockResolvedValue([
        {
          price: 100,
          quantity: 1,
          orderId: 'o1',
          createdAt: new Date('2024-01-15'),
          order: { status: 'Delivered' },
        },
      ]);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/vendor.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/analytics/sales-graph',
        headers: { authorization: 'Bearer vendor' },
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('GET /analytics/top-products', () => {
    it('returns top products', async () => {
      mockPrisma.product.findMany.mockResolvedValue([{ id: 'p1' }]);
      mockPrisma.orderItem.findMany.mockResolvedValue([
        {
          productId: 'p1',
          price: 100,
          quantity: 1,
          orderId: 'o1',
          product: { id: 'p1', title: 'Test', image: 'img.jpg', price: 100 },
        },
      ]);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/vendor.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/analytics/top-products',
        headers: { authorization: 'Bearer vendor' },
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('GET /payouts', () => {
    it('returns payouts with pagination', async () => {
      mockPrisma.vendor.findUnique.mockResolvedValue({ id: 'v1' });
      mockPrisma.payout.findMany.mockResolvedValue([{ id: 'po1', amount: 100 }]);
      mockPrisma.payout.count.mockResolvedValue(1);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/vendor.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/payouts',
        headers: { authorization: 'Bearer vendor' },
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('PATCH /pickup-address', () => {
    it('updates pickup address', async () => {
      mockPrisma.vendor.findUnique.mockResolvedValue({ id: 'v1' });
      mockPrisma.vendor.update.mockResolvedValue({ id: 'v1', pickupAddress: 'New Addr' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/vendor.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/pickup-address',
        payload: { pickupAddress: 'New Addr' },
        headers: { authorization: 'Bearer vendor' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('returns 404 without vendor', async () => {
      mockPrisma.vendor.findUnique.mockResolvedValue(null);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/vendor.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/pickup-address',
        payload: { pickupAddress: 'New' },
        headers: { authorization: 'Bearer vendor' },
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /rate', () => {
    it('submits a rating', async () => {
      mockPrisma.vendor.findUnique.mockResolvedValue({ id: 'v1', userId: 'vendor-user-id' });
      mockPrisma.product.findMany.mockResolvedValue([{ id: 'p1' }]);
      mockPrisma.orderItem.findFirst.mockResolvedValue({ id: 'oi1' });
      mockPrisma.rating.findUnique.mockResolvedValue(null);
      mockPrisma.$transaction.mockImplementation(async (cb) => {
        const tx = {
          vendor: {
            findUnique: vi.fn().mockResolvedValue({ id: 'v1', rating: 4, ratingCount: 5 }),
            update: vi.fn(),
          },
          rating: { create: vi.fn() },
        };
        return cb(tx);
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/vendor.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/rate',
        payload: { vendorId: 'v1', rating: 5 },
        headers: { authorization: 'Bearer vendor' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('returns 400 without vendorId or rating', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/vendor.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/rate',
        payload: {},
        headers: { authorization: 'Bearer vendor' },
      });
      expect(res.statusCode).toBe(400);
    });

    it('returns 403 without prior purchase', async () => {
      mockPrisma.vendor.findUnique.mockResolvedValue({ id: 'v1', userId: 'vendor-user-id' });
      mockPrisma.product.findMany.mockResolvedValue([{ id: 'p1' }]);
      mockPrisma.orderItem.findFirst.mockResolvedValue(null);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/vendor.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/rate',
        payload: { vendorId: 'v1', rating: 5 },
        headers: { authorization: 'Bearer vendor' },
      });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /orders', () => {
    it('returns vendor orders', async () => {
      mockPrisma.product.findMany.mockResolvedValue([{ id: 'p1' }]);
      mockPrisma.orderItem.findMany.mockResolvedValue([
        {
          id: 'oi1',
          order: { user: { name: 'Buyer' } },
          product: { id: 'p1', title: 'Test', image: 'img.jpg', price: 100 },
        },
      ]);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/vendor.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/orders',
        headers: { authorization: 'Bearer vendor' },
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('PATCH /orders/:orderItemId/ship', () => {
    it('marks order item as shipped', async () => {
      mockPrisma.orderItem.findUnique.mockResolvedValue({
        id: 'oi1',
        product: { sellerId: 'vendor-user-id' },
        order: { id: 'o1', status: 'Processing', items: [] },
        status: 'Pending',
      });
      mockPrisma.orderItem.update.mockResolvedValue({ id: 'oi1', status: 'Shipped' });
      mockPrisma.orderItem.findMany.mockResolvedValue([{ status: 'Shipped' }]);
      mockPrisma.order.findUnique.mockResolvedValue({ status: 'Processing' });
      mockPrisma.order.update.mockResolvedValue({});
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/vendor.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/orders/oi1/ship',
        payload: { trackingID: 'TRK123' },
        headers: { authorization: 'Bearer vendor' },
      });
      expect(res.statusCode).toBe(200);
      expect(mockPrisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'Shipped' } }),
      );
    });

    it('refuses to ship an item on a cancelled order', async () => {
      mockPrisma.orderItem.findUnique.mockResolvedValue({
        id: 'oi1',
        product: { sellerId: 'vendor-user-id' },
        order: { id: 'o1', status: 'Cancelled', items: [] },
        status: 'Pending',
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/vendor.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/orders/oi1/ship',
        payload: { trackingID: 'TRK123' },
        headers: { authorization: 'Bearer vendor' },
      });
      expect(res.statusCode).toBe(422);
      expect(mockPrisma.orderItem.update).not.toHaveBeenCalled();
    });

    it('returns 404 when order item not found', async () => {
      mockPrisma.orderItem.findUnique.mockResolvedValue(null);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/vendor.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/orders/oi1/ship',
        payload: { trackingID: 'TRK123' },
        headers: { authorization: 'Bearer vendor' },
      });
      expect(res.statusCode).toBe(404);
    });

    it("returns 403 when not vendor's product", async () => {
      mockPrisma.orderItem.findUnique.mockResolvedValue({
        id: 'oi1',
        product: { sellerId: 'other-user' },
        order: { items: [] },
        status: 'Pending',
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/vendor.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/orders/oi1/ship',
        payload: { trackingID: 'TRK123' },
        headers: { authorization: 'Bearer vendor' },
      });
      expect(res.statusCode).toBe(403);
    });
  });
});
