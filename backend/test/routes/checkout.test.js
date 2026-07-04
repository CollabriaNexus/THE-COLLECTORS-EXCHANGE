import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import { ZodError } from 'zod';

vi.mock('crypto', () => ({
  default: {
    createHmac: vi.fn(() => ({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn(() => 'valid-sig'),
    })),
  },
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
      token === 'seller'
        ? { id: 'seller-id', name: 'Seller', email: 'seller@test.com', role: 'user' }
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
      product: {
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      order: { findFirst: vi.fn(), create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
      wishlistItem: { deleteMany: vi.fn() },
      notification: { create: vi.fn() },
      $transaction: vi.fn(),
    };
  });

  describe('POST /create-order', () => {
    const validBody = {
      shippingAddress: '123 St',
      city: 'Mum',
      state: 'MH',
      zipCode: '400001',
      phone: '9876543210',
      items: [{ productId: 'p1' }],
    };

    it('creates an order successfully', async () => {
      mockPrisma.cartItem.findMany.mockResolvedValue([
        {
          productId: 'p1',
          product: { id: 'p1', title: 'Test', price: 100, sellerId: 'seller-id' },
        },
      ]);
      mockPrisma.$transaction.mockImplementation(async (cb) => {
        const tx = {
          product: {
            findUnique: vi.fn().mockResolvedValue({
              id: 'p1',
              title: 'Test',
              price: 100,
              sellerId: 'seller-id',
              status: 'Approved',
            }),
          },
          order: {
            findFirst: vi.fn().mockResolvedValue(null),
            create: vi.fn().mockResolvedValue({ id: 'order-1', displayId: 'HOR00001', items: [] }),
          },
        };
        return cb(tx);
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/checkout.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/create-order',
        payload: validBody,
        headers: { authorization: 'Bearer buyer' },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().success).toBe(true);
    });

    it('calculates platformFee from commissionPercent in the order response', async () => {
      mockPrisma.cartItem.findMany.mockResolvedValue([
        {
          productId: 'p1',
          product: {
            id: 'p1',
            title: 'Test',
            price: 200,
            commissionPercent: 20,
            sellerId: 'seller-id',
          },
        },
      ]);
      mockPrisma.$transaction.mockImplementation(async (cb) => {
        const tx = {
          product: {
            findUnique: vi.fn().mockResolvedValue({
              id: 'p1',
              title: 'Test',
              price: 200,
              commissionPercent: 20,
              sellerId: 'seller-id',
              status: 'Approved',
            }),
          },
          order: {
            findFirst: vi.fn().mockResolvedValue(null),
            create: vi.fn().mockResolvedValue({ id: 'order-1', displayId: 'HOR00001', items: [] }),
          },
        };
        return cb(tx);
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/checkout.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/create-order',
        payload: validBody,
        headers: { authorization: 'Bearer buyer' },
      });
      expect(res.statusCode).toBe(200);
      // 20% of 200 = 40
      expect(res.json().platformFee).toBe(40);
    });

    it('applies a product-scoped coupon only to eligible items and defers usage recording', async () => {
      mockPrisma.cartItem.findMany.mockResolvedValue([
        { productId: 'p1', product: { id: 'p1' } },
        { productId: 'p2', product: { id: 'p2' } },
      ]);
      const products = {
        p1: { id: 'p1', title: 'A', price: 1000, sellerId: 'seller-id', status: 'Approved' },
        p2: { id: 'p2', title: 'B', price: 500, sellerId: 'seller-id', status: 'Approved' },
      };
      const couponUsageCreate = vi.fn();
      const orderCreate = vi.fn().mockImplementation(async ({ data }) => ({
        id: 'order-1',
        displayId: 'HOR00001',
        items: [],
        ...data,
      }));
      mockPrisma.$transaction.mockImplementation(async (cb) => {
        const tx = {
          product: { findUnique: vi.fn(async ({ where }) => products[where.id]) },
          coupon: {
            findUnique: vi.fn().mockResolvedValue({
              id: 'c1',
              code: 'SAVE10',
              discountPercent: 10,
              productId: 'p1',
              minPurchase: 0,
              maxUses: 1,
              maxUsesPerUser: 1,
              isActive: true,
              expiresAt: null,
            }),
          },
          couponUsage: { count: vi.fn().mockResolvedValue(0), create: couponUsageCreate },
          order: { findFirst: vi.fn().mockResolvedValue(null), create: orderCreate },
        };
        return cb(tx);
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/checkout.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/create-order',
        payload: {
          ...validBody,
          items: [{ productId: 'p1' }, { productId: 'p2' }],
          couponCode: 'SAVE10',
        },
        headers: { authorization: 'Bearer buyer' },
      });
      expect(res.statusCode).toBe(200);
      // 10% of the eligible product (1000) only — NOT 10% of the full 1500 cart
      expect(res.json().discountAmount).toBe(100);
      expect(res.json().amount).toBe(1400);
      // Usage must not be recorded until payment succeeds
      expect(couponUsageCreate).not.toHaveBeenCalled();
      // Order persisted the discounted total
      expect(orderCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            couponId: 'c1',
            discountAmount: 100,
            totalAmount: 1400,
            subtotalBeforeDiscount: 1500,
          }),
        }),
      );
    });

    it('rejects a coupon whose minimum purchase is not met and rolls back the order', async () => {
      mockPrisma.cartItem.findMany.mockResolvedValue([{ productId: 'p1', product: { id: 'p1' } }]);
      const orderCreate = vi.fn();
      mockPrisma.$transaction.mockImplementation(async (cb) => {
        const tx = {
          product: {
            findUnique: vi.fn().mockResolvedValue({
              id: 'p1',
              title: 'A',
              price: 100,
              sellerId: 'seller-id',
              status: 'Approved',
            }),
          },
          coupon: {
            findUnique: vi.fn().mockResolvedValue({
              id: 'c1',
              code: 'BIG',
              discountPercent: 10,
              productId: null,
              minPurchase: 5000,
              maxUses: 0,
              maxUsesPerUser: 0,
              isActive: true,
              expiresAt: null,
            }),
          },
          couponUsage: { count: vi.fn().mockResolvedValue(0), create: vi.fn() },
          order: { findFirst: vi.fn().mockResolvedValue(null), create: orderCreate },
        };
        return cb(tx);
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/checkout.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/create-order',
        payload: { ...validBody, couponCode: 'BIG' },
        headers: { authorization: 'Bearer buyer' },
      });
      expect(res.statusCode).toBe(422);
      // Order was never created — invalid coupon rolls the whole transaction back
      expect(orderCreate).not.toHaveBeenCalled();
    });

    it('rejects purchase of a non-approved product', async () => {
      mockPrisma.cartItem.findMany.mockResolvedValue([{ productId: 'p1', product: { id: 'p1' } }]);
      mockPrisma.$transaction.mockImplementation(async (cb) => {
        const tx = {
          product: {
            findUnique: vi.fn().mockResolvedValue({
              id: 'p1',
              title: 'A',
              price: 100,
              sellerId: 'seller-id',
              status: 'Rejected',
            }),
          },
          order: { findFirst: vi.fn().mockResolvedValue(null), create: vi.fn() },
        };
        return cb(tx);
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/checkout.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/create-order',
        payload: validBody,
        headers: { authorization: 'Bearer buyer' },
      });
      expect(res.statusCode).toBe(422);
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
      const res = await fastify2.inject({
        method: 'POST',
        url: '/create-order',
        payload: validBody,
        headers: { authorization: 'Bearer token' },
      });
      expect(res.statusCode).toBe(401);
    });

    it('returns 400 with invalid body', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/checkout.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/create-order',
        payload: {},
        headers: { authorization: 'Bearer buyer' },
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /verify-payment', () => {
    it('verifies payment successfully', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId: 'buyer-id',
        paymentStatus: 'Pending',
      });
      mockPrisma.order.update.mockResolvedValue({
        id: 'order-1',
        paymentStatus: 'Paid',
        status: 'Processing',
        items: [],
      });
      const app = buildApp(mockPrisma);
      app.addHook('onRoute', () => {});
      await app.register((await import('../../routes/checkout.js')).default);
      await app.ready();
      delete process.env.RAZORPAY_KEY_ID;
      delete process.env.RAZORPAY_KEY_SECRET;
      process.env.NODE_ENV = 'development';
      const res = await app.inject({
        method: 'POST',
        url: '/verify-payment',
        payload: {
          orderId: 'order-1',
          razorpayOrderId: 'rp_1',
          razorpayPaymentId: 'pay_1',
          razorpaySignature: 'sig_1',
        },
        headers: { authorization: 'Bearer buyer' },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().success).toBe(true);
    });

    it('claims the product atomically and clears carts on success', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId: 'buyer-id',
        paymentStatus: 'Pending',
        paymentMethod: 'online',
        items: [{ productId: 'p1' }],
      });
      mockPrisma.product.updateMany = vi.fn().mockResolvedValue({ count: 1 });
      mockPrisma.order.update.mockResolvedValue({
        id: 'order-1',
        paymentStatus: 'Paid',
        status: 'Processing',
        items: [{ productId: 'p1' }],
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/checkout.js')).default);
      await app.ready();
      delete process.env.RAZORPAY_KEY_ID;
      delete process.env.RAZORPAY_KEY_SECRET;
      process.env.NODE_ENV = 'development';
      const res = await app.inject({
        method: 'POST',
        url: '/verify-payment',
        payload: { orderId: 'order-1' },
        headers: { authorization: 'Bearer buyer' },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().success).toBe(true);
      // Guarded claim only flips an Approved product to Sold
      expect(mockPrisma.product.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'p1', status: 'Approved' },
          data: { status: 'Sold' },
        }),
      );
      expect(mockPrisma.cartItem.deleteMany).toHaveBeenCalledWith({ where: { productId: 'p1' } });
    });

    it('cancels the order and flags a refund when an item is already sold', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId: 'buyer-id',
        paymentStatus: 'Pending',
        paymentMethod: 'online',
        items: [{ productId: 'p1' }],
      });
      mockPrisma.product.updateMany = vi.fn().mockResolvedValue({ count: 0 }); // another order already claimed it
      const orderUpdate = vi.fn().mockResolvedValue({});
      mockPrisma.order.update = orderUpdate;
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/checkout.js')).default);
      await app.ready();
      delete process.env.RAZORPAY_KEY_ID;
      delete process.env.RAZORPAY_KEY_SECRET;
      process.env.NODE_ENV = 'development';
      const res = await app.inject({
        method: 'POST',
        url: '/verify-payment',
        payload: { orderId: 'order-1' },
        headers: { authorization: 'Bearer buyer' },
      });
      expect(res.statusCode).toBe(409);
      expect(res.json().refundRequired).toBe(true);
      expect(orderUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'Cancelled', paymentStatus: 'Refunded' }),
        }),
      );
    });

    it('returns 404 when order not found', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/checkout.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/verify-payment',
        payload: { orderId: 'bad-id' },
        headers: { authorization: 'Bearer buyer' },
      });
      expect(res.statusCode).toBe(404);
    });

    it('returns 403 when order belongs to another user', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId: 'other-id',
        paymentStatus: 'Pending',
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/checkout.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/verify-payment',
        payload: {
          orderId: 'order-1',
          razorpayOrderId: 'rp_1',
          razorpayPaymentId: 'pay_1',
          razorpaySignature: 'sig_1',
        },
        headers: { authorization: 'Bearer buyer' },
      });
      expect(res.statusCode).toBe(403);
    });

    it('returns 422 when already paid', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId: 'buyer-id',
        paymentStatus: 'Paid',
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/checkout.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/verify-payment',
        payload: { orderId: 'order-1' },
        headers: { authorization: 'Bearer buyer' },
      });
      expect(res.statusCode).toBe(422);
    });
  });
});
