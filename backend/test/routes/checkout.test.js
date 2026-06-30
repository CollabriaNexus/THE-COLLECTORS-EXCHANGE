import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import { ZodError } from 'zod';

vi.mock('crypto', () => ({
  default: { createHmac: vi.fn(() => ({ update: vi.fn().mockReturnThis(), digest: vi.fn(() => 'valid-sig') })) },
  createHmac: vi.fn(() => ({ update: vi.fn().mockReturnThis(), digest: vi.fn(() => 'valid-sig') })),
}));

vi.mock('razorpay', () => ({
  default: vi.fn(() => ({
    orders: { create: vi.fn().mockResolvedValue({ id: 'rp_order_123' }) },
  })),
}));

function buildApp(mockPrisma) {
  const fastify = Fastify();
  fastify.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: 'Validation Error', message: 'Request validation failed', issues: error.issues });
    }
    reply.status(error.statusCode || 500).send({ error: error.message });
  });
  fastify.decorate('prisma', mockPrisma);
  fastify.decorate('authenticate', async (req, reply) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return reply.status(401).send({ error: 'No token provided' });
    req.user = { sub: 'sb-123' };
    req.dbUser = token === 'seller' ? { id: 'seller-id', name: 'Seller', email: 'seller@test.com', role: 'user' }
      : { id: 'buyer-id', name: 'Buyer', email: 'buyer@test.com', role: 'user' };
  });
  return fastify;
}

describe('checkout routes', () => {
  let mockPrisma;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
    process.env.RAZORPAY_KEY_SECRET = 'test_secret';
    process.env.NODE_ENV = 'development';
    mockPrisma = {
      cartItem: { findMany: vi.fn(), deleteMany: vi.fn() },
      product: { findUnique: vi.fn(), update: vi.fn() },
      order: { findFirst: vi.fn(), create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
      wishlistItem: { deleteMany: vi.fn() },
      notification: { create: vi.fn() },
      $transaction: vi.fn(),
    };
  });

  describe('POST /create-order', () => {
    const validBody = { shippingAddress: '123 St', city: 'Mum', state: 'MH', zipCode: '400001', phone: '9876543210', items: [{ productId: 'p1' }] };

    it('creates an order successfully', async () => {
      mockPrisma.cartItem.findMany.mockResolvedValue([{ productId: 'p1', product: { id: 'p1', title: 'Test', price: 100, sellerId: 'seller-id' } }]);
      mockPrisma.$transaction.mockImplementation(async (cb) => {
        const tx = {
          product: { findUnique: vi.fn().mockResolvedValue({ id: 'p1', title: 'Test', price: 100, sellerId: 'seller-id', status: 'Approved' }) },
          order: { findFirst: vi.fn().mockResolvedValue(null), create: vi.fn().mockResolvedValue({ id: 'order-1', displayId: 'HOR00001', items: [] }) },
        };
        return cb(tx);
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/checkout.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/create-order', payload: validBody, headers: { authorization: 'Bearer buyer' } });
      expect(res.statusCode).toBe(200);
      expect(res.json().success).toBe(true);
    });

    it('returns 401 without dbUser', async () => {
      const app = buildApp(mockPrisma);
      app.ready();
      const fastify2 = Fastify();
      fastify2.decorate('prisma', mockPrisma);
      fastify2.decorate('authenticate', async (req, reply) => {
        req.user = { sub: 'sb-123' };
        req.dbUser = null;
      });
      await fastify2.register((await import('../../routes/checkout.js')).default);
      await fastify2.ready();
      const res = await fastify2.inject({ method: 'POST', url: '/create-order', payload: validBody, headers: { authorization: 'Bearer token' } });
      expect(res.statusCode).toBe(401);
    });

    it('returns 400 with invalid body', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/checkout.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/create-order', payload: {}, headers: { authorization: 'Bearer buyer' } });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /verify-payment', () => {
    it('verifies payment successfully', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ id: 'order-1', userId: 'buyer-id', paymentStatus: 'Pending' });
      mockPrisma.order.update.mockResolvedValue({ id: 'order-1', paymentStatus: 'Paid', status: 'Processing', items: [] });
      const app = buildApp(mockPrisma);
      app.addHook('onRoute', (routeOptions) => {});
      await app.register((await import('../../routes/checkout.js')).default);
      await app.ready();
      delete process.env.RAZORPAY_KEY_ID;
      delete process.env.RAZORPAY_KEY_SECRET;
      process.env.NODE_ENV = 'development';
      const res = await app.inject({ method: 'POST', url: '/verify-payment', payload: { orderId: 'order-1', razorpayOrderId: 'rp_1', razorpayPaymentId: 'pay_1', razorpaySignature: 'sig_1' }, headers: { authorization: 'Bearer buyer' } });
      expect(res.statusCode).toBe(200);
      expect(res.json().success).toBe(true);
    });

    it('returns 404 when order not found', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/checkout.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/verify-payment', payload: { orderId: 'bad-id' }, headers: { authorization: 'Bearer buyer' } });
      expect(res.statusCode).toBe(404);
    });

    it('returns 403 when order belongs to another user', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ id: 'order-1', userId: 'other-id', paymentStatus: 'Pending' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/checkout.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/verify-payment', payload: { orderId: 'order-1', razorpayOrderId: 'rp_1', razorpayPaymentId: 'pay_1', razorpaySignature: 'sig_1' }, headers: { authorization: 'Bearer buyer' } });
      expect(res.statusCode).toBe(403);
    });

    it('returns 422 when already paid', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ id: 'order-1', userId: 'buyer-id', paymentStatus: 'Paid' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/checkout.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/verify-payment', payload: { orderId: 'order-1' }, headers: { authorization: 'Bearer buyer' } });
      expect(res.statusCode).toBe(422);
    });
  });
});
