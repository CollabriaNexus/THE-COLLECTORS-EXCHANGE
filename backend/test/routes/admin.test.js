import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import { ZodError } from 'zod';

function buildApp(mockPrisma) {
  const fastify = Fastify();
  fastify.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Request validation failed',
        issues: error.issues,
      });
    }
    reply.status(error.statusCode || 500).send({ error: error.message });
  });
  fastify.decorate('prisma', mockPrisma);
  fastify.decorate('authenticate', async (req, reply) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return reply.status(401).send({ error: 'No token provided' });
    req.user = { sub: 'sb-123' };
    req.dbUser =
      token === 'admin'
        ? { id: 'admin-id', role: 'admin', name: 'Admin', email: 'admin@test.com' }
        : token === 'curator'
          ? { id: 'curator-id', role: 'curator' }
          : token === 'superadmin'
            ? { id: 'superadmin-id', role: 'admin' }
            : { id: 'user-id', role: 'user' };
  });
  fastify.decorate('authenticateAdmin', async (req, reply) => {
    await fastify.authenticate(req, reply);
    if (reply.sent) return;
    if (!req.dbUser || (req.dbUser.role !== 'admin' && req.dbUser.role !== 'curator')) {
      return reply.status(403).send({ error: 'Access denied: Admin or Curator role required' });
    }
  });
  fastify.decorate('authenticateSuperAdmin', async (req, reply) => {
    await fastify.authenticate(req, reply);
    if (reply.sent) return;
    if (!req.dbUser || req.dbUser.role !== 'admin') {
      return reply.status(403).send({ error: 'Access denied: Super Admin role required' });
    }
  });
  return fastify;
}

describe('admin routes', () => {
  let mockPrisma;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma = {
      user: { count: vi.fn(), findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn() },
      product: {
        count: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        delete: vi.fn(),
        create: vi.fn(),
      },
      order: { count: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
      vendor: { findUnique: vi.fn(), upsert: vi.fn() },
      notification: { create: vi.fn() },
      auditLog: { create: vi.fn() },
      payout: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      cartItem: { deleteMany: vi.fn() },
      wishlistItem: { deleteMany: vi.fn() },
      orderItem: { deleteMany: vi.fn() },
      productView: { deleteMany: vi.fn() },
      cartEvent: { deleteMany: vi.fn() },
      checkoutEvent: { deleteMany: vi.fn() },
      auctionBid: { deleteMany: vi.fn() },
      auction: { delete: vi.fn() },
      $transaction: vi.fn(),
      $queryRaw: vi.fn(),
    };
  });

  describe('GET /stats/overview', () => {
    it('returns dashboard stats', async () => {
      mockPrisma.user.count.mockResolvedValueOnce(10).mockResolvedValueOnce(2);
      mockPrisma.product.count.mockResolvedValue(50);
      mockPrisma.order.count.mockResolvedValue(25);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/stats/overview',
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().totalUsers).toBe(10);
      expect(res.json().pendingKyc).toBe(2);
    });
  });

  describe('GET /stats/analytics', () => {
    it('returns analytics data', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);
      mockPrisma.product.findMany.mockResolvedValue([]);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/stats/analytics',
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('GET /kyc/requests', () => {
    it('returns KYC requests', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/kyc/requests',
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('GET /kyc/requests/:id', () => {
    it('returns single KYC request', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'uid', name: 'Test' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/kyc/requests/uid',
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('returns 404 when not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/kyc/requests/nonexistent',
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PATCH /kyc/requests/:id/approve', () => {
    it('approves KYC request', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'uid',
        kycData: { companyName: 'Test Corp' },
        type: 'company',
      });
      mockPrisma.$transaction.mockImplementation(async (cb) => {
        const tx = {
          user: { update: vi.fn().mockResolvedValue({ id: 'uid', kycStatus: 'verified' }) },
          vendor: { upsert: vi.fn().mockResolvedValue({ id: 'v1' }) },
        };
        return cb(tx);
      });
      mockPrisma.notification.create.mockResolvedValue({});
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/kyc/requests/uid/approve',
        payload: {},
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('returns 404 when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/kyc/requests/nonexistent/approve',
        payload: {},
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PATCH /kyc/requests/:id/reject', () => {
    it('rejects KYC request', async () => {
      mockPrisma.user.update.mockResolvedValue({ id: 'uid', kycStatus: 'none' });
      mockPrisma.notification.create.mockResolvedValue({});
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/kyc/requests/uid/reject',
        payload: { reason: 'Bad docs' },
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('returns 400 without reason', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/kyc/requests/uid/reject',
        payload: {},
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('PATCH /users/:id/ban', () => {
    it('bans user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'uid' });
      mockPrisma.user.update.mockResolvedValue({ id: 'uid', banned: true });
      mockPrisma.notification.create.mockResolvedValue({});
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/users/uid/ban',
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('returns 404 when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/users/nonexistent/ban',
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PATCH /users/:id/unban', () => {
    it('unbans user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'uid' });
      mockPrisma.user.update.mockResolvedValue({ id: 'uid', banned: false });
      mockPrisma.notification.create.mockResolvedValue({});
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/users/uid/unban',
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('GET /users', () => {
    it('returns users list', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/users',
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('GET /users/:id', () => {
    it('returns single user detail', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'uid',
        products: [],
        cart: [],
        wishlist: [],
        vendor: null,
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/users/uid',
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('PATCH /vendor/:userId/type', () => {
    it('toggles vendor type', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'uid' });
      mockPrisma.vendor.upsert.mockResolvedValue({ id: 'v1', type: 'BULK' });
      mockPrisma.auditLog.create.mockResolvedValue({});
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/vendor/uid/type',
        payload: { type: 'BULK' },
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('returns 400 with invalid type', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/vendor/uid/type',
        payload: { type: 'INVALID' },
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('PATCH /users/:id/role', () => {
    it('updates user role', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({});
      mockPrisma.user.update.mockResolvedValue({ id: 'uid', role: 'curator' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/users/other-id/role',
        payload: { role: 'curator' },
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('returns 422 when changing own role', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/users/admin-id/role',
        payload: { role: 'user' },
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(422);
    });

    it('returns 400 with invalid role', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/users/other-id/role',
        payload: { role: 'superadmin' },
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /products', () => {
    it('returns products list', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/products',
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('GET /products/:id', () => {
    it('returns single product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'p1',
        seller: { id: 's1', name: 'S' },
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/products/p1',
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('returns 404 when not found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/products/nonexistent',
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PATCH /products/:id/review', () => {
    it('starts review', async () => {
      mockPrisma.product.update.mockResolvedValue({ id: 'p1', status: 'In_Review' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/products/p1/review',
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('PATCH /products/:id/approve', () => {
    it('approves product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'p1',
        status: 'Pending',
        sellerId: 's1',
        title: 'Test',
      });
      mockPrisma.product.update.mockResolvedValue({ id: 'p1', status: 'Approved' });
      mockPrisma.notification.create.mockResolvedValue({});
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/products/p1/approve',
        headers: { authorization: 'Bearer superadmin' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('returns 422 when product is sold', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', status: 'Sold' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/products/p1/approve',
        headers: { authorization: 'Bearer superadmin' },
      });
      expect(res.statusCode).toBe(422);
    });
  });

  describe('PATCH /products/:id/reject', () => {
    it('rejects product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'p1',
        status: 'Pending',
        sellerId: 's1',
        title: 'Test',
      });
      mockPrisma.product.update.mockResolvedValue({ id: 'p1', status: 'Rejected' });
      mockPrisma.notification.create.mockResolvedValue({});
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/products/p1/reject',
        payload: { reason: 'Bad quality' },
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('returns 400 without reason', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', status: 'Pending' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/products/p1/reject',
        payload: {},
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('PATCH /products/:id/sold', () => {
    it('marks product as sold', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'p1',
        status: 'Approved',
        sellerId: 's1',
        title: 'Test',
      });
      mockPrisma.product.update.mockResolvedValue({ id: 'p1', status: 'Sold', isPublished: false });
      mockPrisma.notification.create.mockResolvedValue({});
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/products/p1/sold',
        headers: { authorization: 'Bearer superadmin' },
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('PATCH /products/:id/authenticity', () => {
    it('updates authenticity status', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', status: 'Pending' });
      mockPrisma.product.update.mockResolvedValue({
        id: 'p1',
        authenticityStatus: 'Verified',
        status: 'Approved',
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/products/p1/authenticity',
        payload: { status: 'Verified' },
        headers: { authorization: 'Bearer superadmin' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('returns 400 with invalid status', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', status: 'Pending' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/products/p1/authenticity',
        payload: { status: 'INVALID' },
        headers: { authorization: 'Bearer superadmin' },
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('DELETE /products/:id', () => {
    it('deletes product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', status: 'Pending' });
      mockPrisma.cartItem.deleteMany.mockResolvedValue({});
      mockPrisma.wishlistItem.deleteMany.mockResolvedValue({});
      mockPrisma.orderItem.deleteMany.mockResolvedValue({});
      mockPrisma.productView.deleteMany.mockResolvedValue({});
      mockPrisma.cartEvent.deleteMany.mockResolvedValue({});
      mockPrisma.checkoutEvent.deleteMany.mockResolvedValue({});
      mockPrisma.product.delete.mockResolvedValue({});
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'DELETE',
        url: '/products/p1',
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('returns 404 when not found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'DELETE',
        url: '/products/nonexistent',
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PATCH /products/:id (update)', () => {
    it('updates product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1' });
      mockPrisma.product.update.mockResolvedValue({ id: 'p1', brand: 'Rolex' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/products/p1',
        payload: { brand: 'Rolex' },
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('GET /brands', () => {
    it('returns brands list', async () => {
      mockPrisma.product.findMany.mockResolvedValue([{ brand: 'Rolex' }, { brand: 'Patek' }]);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/brands',
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('GET /orders', () => {
    it('returns orders list', async () => {
      mockPrisma.order.findMany.mockResolvedValue([]);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/orders',
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('GET /orders/:id', () => {
    it('returns single order', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ id: 'o1', user: {}, items: [] });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/orders/o1',
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('PATCH /orders/:id/status', () => {
    it('updates order status', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'o1',
        status: 'Processing',
        paymentStatus: 'Paid',
        paymentMethod: 'online',
        items: [],
      });
      mockPrisma.order.update.mockResolvedValue({ id: 'o1', status: 'Shipped', userId: 'uid' });
      mockPrisma.notification.create.mockResolvedValue({});
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/orders/o1/status',
        payload: { status: 'Shipped' },
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('rejects an illegal transition (Delivered -> Processing)', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'o1',
        status: 'Delivered',
        paymentStatus: 'Paid',
        paymentMethod: 'online',
        items: [],
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/orders/o1/status',
        payload: { status: 'Processing' },
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(422);
    });

    it('restores inventory and flags refund when cancelling a paid order', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'o1',
        status: 'Processing',
        paymentStatus: 'Paid',
        paymentMethod: 'online',
        items: [{ productId: 'p1' }],
      });
      mockPrisma.product.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.order.update.mockResolvedValue({ id: 'o1', status: 'Cancelled', userId: 'uid' });
      mockPrisma.notification.create.mockResolvedValue({});
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/orders/o1/status',
        payload: { status: 'Cancelled' },
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
      expect(mockPrisma.product.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: { in: ['p1'] }, status: 'Sold' },
          data: { status: 'Approved' },
        }),
      );
      expect(mockPrisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'Cancelled', paymentStatus: 'Refunded' }),
        }),
      );
    });

    it('marks a COD order paid when delivered', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'o1',
        status: 'Shipped',
        paymentStatus: 'Pending',
        paymentMethod: 'cod',
        items: [],
      });
      mockPrisma.order.update.mockResolvedValue({ id: 'o1', status: 'Delivered', userId: 'uid' });
      mockPrisma.notification.create.mockResolvedValue({});
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/orders/o1/status',
        payload: { status: 'Delivered' },
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
      expect(mockPrisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'Delivered', paymentStatus: 'Paid' }),
        }),
      );
    });

    it('returns 400 with invalid status', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/orders/o1/status',
        payload: { status: 'INVALID' },
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('PATCH /orders/:id/ship', () => {
    it('ships order with tracking ID', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'o1',
        status: 'Processing',
        userId: 'uid',
      });
      mockPrisma.order.update.mockResolvedValue({
        id: 'o1',
        status: 'Shipped',
        trackingID: 'TRK123',
        userId: 'uid',
      });
      mockPrisma.notification.create.mockResolvedValue({});
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/orders/o1/ship',
        payload: { trackingID: 'TRK123' },
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('refuses to ship a cancelled order', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'o1',
        status: 'Cancelled',
        userId: 'uid',
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/orders/o1/ship',
        payload: { trackingID: 'TRK123' },
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(422);
    });

    it('returns 400 without tracking ID', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/orders/o1/ship',
        payload: {},
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /payouts/auto-create', () => {
    it('auto-creates payouts', async () => {
      mockPrisma.order.findMany.mockResolvedValue([]);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/payouts/auto-create',
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('pays net commission and stamps items paidOut (idempotent)', async () => {
      mockPrisma.order.findMany.mockResolvedValue([
        {
          id: 'o1',
          items: [
            {
              id: 'oi1',
              price: 1000,
              platformFee: 100,
              quantity: 1,
              product: { sellerId: 'seller-x' },
            },
          ],
        },
      ]);
      mockPrisma.vendor.findUnique.mockResolvedValue({ id: 'v1', userId: 'seller-x' });
      const txUpdateMany = vi.fn().mockResolvedValue({ count: 1 });
      mockPrisma.$transaction.mockImplementation(async (cb) =>
        cb({
          payout: { create: vi.fn().mockResolvedValue({ id: 'p1' }) },
          orderItem: { updateMany: txUpdateMany },
        }),
      );
      mockPrisma.notification.create.mockResolvedValue({});
      mockPrisma.auditLog.create.mockResolvedValue({});
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/payouts/auto-create',
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
      // net = (1000 - 100 commission) x 1
      expect(res.json().created[0]).toMatchObject({ amount: 900, items: 1 });
      // items marked paid out so a future run can't re-pay them
      expect(txUpdateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: { in: ['oi1'] } },
          data: { paidOut: true, payoutId: 'p1' },
        }),
      );
    });
  });

  describe('POST /payouts', () => {
    it('creates payout', async () => {
      mockPrisma.vendor.findUnique.mockResolvedValue({ id: 'v1', userId: 'uid' });
      mockPrisma.payout.create.mockResolvedValue({ id: 'po1', amount: 5000 });
      mockPrisma.auditLog.create.mockResolvedValue({});
      mockPrisma.notification.create.mockResolvedValue({});
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/payouts',
        payload: {
          vendorId: 'v1',
          amount: 5000,
          periodStart: '2024-01-01',
          periodEnd: '2024-01-31',
        },
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('PATCH /payouts/:id/status', () => {
    it('updates payout status', async () => {
      mockPrisma.payout.update.mockResolvedValue({
        id: 'po1',
        amount: 5000,
        status: 'PAID',
        paidAt: new Date(),
        vendor: { userId: 'uid' },
      });
      mockPrisma.auditLog.create.mockResolvedValue({});
      mockPrisma.notification.create.mockResolvedValue({});
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/payouts/po1/status',
        payload: { status: 'PAID' },
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('GET /payouts', () => {
    it('returns payouts list', async () => {
      mockPrisma.payout.findMany.mockResolvedValue([]);
      mockPrisma.payout.count.mockResolvedValue(0);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/payouts',
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('GET /products/tce-store', () => {
    it('returns TCE store products', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/products/tce-store',
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('POST /products', () => {
    it('creates TCE product', async () => {
      mockPrisma.product.create.mockResolvedValue({
        id: 'p1',
        title: 'TCE Product',
        status: 'Approved',
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/products',
        payload: {
          title: 'TCE Product',
          category: 'Timepieces',
          description: 'Desc',
          condition: 'Mint',
          price: 10000,
          image: 'https://img.com/1.jpg',
        },
        headers: { authorization: 'Bearer superadmin' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('returns 400 with missing fields', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/products',
        payload: {},
        headers: { authorization: 'Bearer superadmin' },
      });
      expect(res.statusCode).toBe(400);
    });

    it('returns 400 with invalid category', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/admin.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/products',
        payload: {
          title: 'TCE Product',
          category: 'Invalid',
          description: 'Desc',
          condition: 'Mint',
          price: 10000,
        },
        headers: { authorization: 'Bearer superadmin' },
      });
      expect(res.statusCode).toBe(400);
    });
  });
});
