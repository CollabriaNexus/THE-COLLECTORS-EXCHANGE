import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import crypto from 'crypto';
import { ZodError } from 'zod';

// Real crypto is used throughout: signature verification is the thing under test,
// so the HMAC must not be stubbed out.
const { razorpayMock } = vi.hoisted(() => ({
  razorpayMock: {
    orders: { create: vi.fn() },
    payments: { fetch: vi.fn(), refund: vi.fn() },
  },
}));

vi.mock('razorpay', () => ({
  default: vi.fn(() => razorpayMock),
}));

// Genuine gateway signature over a (gateway order, payment) pair.
const sign = (rpOrderId, rpPaymentId) =>
  crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${rpOrderId}|${rpPaymentId}`)
    .digest('hex');

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
    razorpayMock.orders.create.mockResolvedValue({ id: 'rp_order_123' });
    razorpayMock.payments.fetch.mockReset();
    razorpayMock.payments.refund.mockReset().mockResolvedValue({ id: 'rfnd_1' });
    mockPrisma = {
      cartItem: { findMany: vi.fn(), deleteMany: vi.fn() },
      product: {
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      order: {
        findFirst: vi.fn(),
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      wishlistItem: { deleteMany: vi.fn() },
      notification: { create: vi.fn() },
      // verify-payment runs claim+finalize in one interactive transaction; the
      // create-order tests override this with their own tx double.
      $transaction: vi.fn(async (cb) => cb(mockPrisma)),
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

    it('rejects duplicate productIds so the same one-of-a-kind item cannot be billed twice', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/checkout.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/create-order',
        payload: { ...validBody, items: [{ productId: 'p1' }, { productId: 'p1' }] },
        headers: { authorization: 'Bearer buyer' },
      });
      expect(res.statusCode).toBe(400);
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
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

  // These exercise the LIVE gateway path (real keys configured, real HMAC).
  describe('POST /verify-payment (live gateway verification)', () => {
    // Order worth ₹1000, paid through gateway order rp_order_own.
    const liveOrder = {
      id: 'order-1',
      userId: 'buyer-id',
      status: 'Pending',
      paymentStatus: 'Pending',
      paymentMethod: 'online',
      paymentOrderId: 'rp_order_own',
      totalAmount: 1000,
      items: [{ productId: 'p1' }],
    };

    const capturedPayment = {
      status: 'captured',
      amount: 100000, // ₹1000 in paise
      currency: 'INR',
      order_id: 'rp_order_own',
    };

    async function buildLiveApp() {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/checkout.js')).default);
      await app.ready();
      return app;
    }

    it('verifies a genuine, correctly-priced payment for its own order', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(liveOrder);
      razorpayMock.payments.fetch.mockResolvedValue(capturedPayment);
      const app = await buildLiveApp();
      const res = await app.inject({
        method: 'POST',
        url: '/verify-payment',
        payload: {
          orderId: 'order-1',
          razorpayOrderId: 'rp_order_own',
          razorpayPaymentId: 'pay_1',
          razorpaySignature: sign('rp_order_own', 'pay_1'),
        },
        headers: { authorization: 'Bearer buyer' },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().success).toBe(true);
      // Finalize is gated on the order still being Pending/Pending
      expect(mockPrisma.order.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'order-1', status: 'Pending', paymentStatus: 'Pending' },
          data: expect.objectContaining({ paymentStatus: 'Paid', paymentId: 'pay_1' }),
        }),
      );
    });

    it('rejects a genuine signature captured from a DIFFERENT order', async () => {
      // The attacker paid ₹1 for rp_order_cheap and holds a real gateway
      // signature for it, then replays that triple against this ₹1000 order.
      mockPrisma.order.findUnique.mockResolvedValue(liveOrder);
      const app = await buildLiveApp();
      const res = await app.inject({
        method: 'POST',
        url: '/verify-payment',
        payload: {
          orderId: 'order-1',
          razorpayOrderId: 'rp_order_cheap',
          razorpayPaymentId: 'pay_cheap',
          razorpaySignature: sign('rp_order_cheap', 'pay_cheap'), // genuinely valid!
        },
        headers: { authorization: 'Bearer buyer' },
      });
      expect(res.statusCode).toBe(400);
      expect(res.json().error).toBe('Payment does not belong to this order');
      // Rejected before the signature check even runs — nothing was finalized
      expect(razorpayMock.payments.fetch).not.toHaveBeenCalled();
      expect(mockPrisma.order.updateMany).not.toHaveBeenCalled();
      expect(mockPrisma.product.updateMany).not.toHaveBeenCalled();
    });

    it('rejects a forged signature and marks the payment Failed', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(liveOrder);
      const app = await buildLiveApp();
      const res = await app.inject({
        method: 'POST',
        url: '/verify-payment',
        payload: {
          orderId: 'order-1',
          razorpayOrderId: 'rp_order_own',
          razorpayPaymentId: 'pay_1',
          razorpaySignature: 'deadbeef',
        },
        headers: { authorization: 'Bearer buyer' },
      });
      expect(res.statusCode).toBe(400);
      expect(res.json().error).toBe('Invalid payment signature');
      expect(mockPrisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { paymentStatus: 'Failed' } }),
      );
      expect(mockPrisma.order.updateMany).not.toHaveBeenCalled();
    });

    it('rejects a payment whose captured amount does not match the order total', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(liveOrder);
      // Signature is genuine and bound to the right order, but only ₹1 moved.
      razorpayMock.payments.fetch.mockResolvedValue({ ...capturedPayment, amount: 100 });
      const app = await buildLiveApp();
      const res = await app.inject({
        method: 'POST',
        url: '/verify-payment',
        payload: {
          orderId: 'order-1',
          razorpayOrderId: 'rp_order_own',
          razorpayPaymentId: 'pay_1',
          razorpaySignature: sign('rp_order_own', 'pay_1'),
        },
        headers: { authorization: 'Bearer buyer' },
      });
      expect(res.statusCode).toBe(400);
      expect(res.json().error).toBe('Payment does not match this order');
      expect(mockPrisma.order.updateMany).not.toHaveBeenCalled();
      expect(mockPrisma.product.updateMany).not.toHaveBeenCalled();
    });

    it('rejects a payment that was authorized but never captured', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(liveOrder);
      razorpayMock.payments.fetch.mockResolvedValue({ ...capturedPayment, status: 'authorized' });
      const app = await buildLiveApp();
      const res = await app.inject({
        method: 'POST',
        url: '/verify-payment',
        payload: {
          orderId: 'order-1',
          razorpayOrderId: 'rp_order_own',
          razorpayPaymentId: 'pay_1',
          razorpaySignature: sign('rp_order_own', 'pay_1'),
        },
        headers: { authorization: 'Bearer buyer' },
      });
      expect(res.statusCode).toBe(400);
      expect(mockPrisma.order.updateMany).not.toHaveBeenCalled();
    });

    it('rejects when the gateway cannot confirm the payment', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(liveOrder);
      razorpayMock.payments.fetch.mockRejectedValue(new Error('not found'));
      const app = await buildLiveApp();
      const res = await app.inject({
        method: 'POST',
        url: '/verify-payment',
        payload: {
          orderId: 'order-1',
          razorpayOrderId: 'rp_order_own',
          razorpayPaymentId: 'pay_1',
          razorpaySignature: sign('rp_order_own', 'pay_1'),
        },
        headers: { authorization: 'Bearer buyer' },
      });
      expect(res.statusCode).toBe(400);
      expect(mockPrisma.order.updateMany).not.toHaveBeenCalled();
    });

    it('is idempotent: a second concurrent verify reports success without cancelling the paid order', async () => {
      // Both requests read Pending; the first one wins the guarded finalize, so
      // this one's gate matches 0 rows.
      mockPrisma.order.findUnique
        .mockResolvedValueOnce(liveOrder)
        .mockResolvedValue({ ...liveOrder, status: 'Processing', paymentStatus: 'Paid' });
      mockPrisma.order.updateMany.mockResolvedValue({ count: 0 });
      razorpayMock.payments.fetch.mockResolvedValue(capturedPayment);
      const app = await buildLiveApp();
      const res = await app.inject({
        method: 'POST',
        url: '/verify-payment',
        payload: {
          orderId: 'order-1',
          razorpayOrderId: 'rp_order_own',
          razorpayPaymentId: 'pay_1',
          razorpaySignature: sign('rp_order_own', 'pay_1'),
        },
        headers: { authorization: 'Bearer buyer' },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().success).toBe(true);
      expect(res.json().order.paymentStatus).toBe('Paid');
      // The loser must not claim products, cancel/refund, or re-notify the buyer
      expect(mockPrisma.product.updateMany).not.toHaveBeenCalled();
      expect(mockPrisma.order.update).not.toHaveBeenCalled();
      expect(mockPrisma.notification.create).not.toHaveBeenCalled();
    });

    it('actually refunds through the gateway when an item is already sold', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(liveOrder);
      razorpayMock.payments.fetch.mockResolvedValue(capturedPayment);
      mockPrisma.product.updateMany.mockResolvedValue({ count: 0 }); // claimed by someone else
      const app = await buildLiveApp();
      const res = await app.inject({
        method: 'POST',
        url: '/verify-payment',
        payload: {
          orderId: 'order-1',
          razorpayOrderId: 'rp_order_own',
          razorpayPaymentId: 'pay_1',
          razorpaySignature: sign('rp_order_own', 'pay_1'),
        },
        headers: { authorization: 'Bearer buyer' },
      });
      expect(res.statusCode).toBe(409);
      expect(razorpayMock.payments.refund).toHaveBeenCalledWith(
        'pay_1',
        expect.objectContaining({ notes: expect.objectContaining({ orderId: 'order-1' }) }),
      );
      expect(mockPrisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'Cancelled', paymentStatus: 'Refunded' }),
        }),
      );
      expect(res.json().refundPending).toBe(false);
    });

    it('does not claim Refunded in the ledger when the gateway refund fails', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(liveOrder);
      razorpayMock.payments.fetch.mockResolvedValue(capturedPayment);
      razorpayMock.payments.refund.mockRejectedValue(new Error('gateway down'));
      mockPrisma.product.updateMany.mockResolvedValue({ count: 0 });
      const app = await buildLiveApp();
      const res = await app.inject({
        method: 'POST',
        url: '/verify-payment',
        payload: {
          orderId: 'order-1',
          razorpayOrderId: 'rp_order_own',
          razorpayPaymentId: 'pay_1',
          razorpaySignature: sign('rp_order_own', 'pay_1'),
        },
        headers: { authorization: 'Bearer buyer' },
      });
      expect(res.statusCode).toBe(409);
      expect(res.json().refundPending).toBe(true);
      // We still hold the money — the order stays Paid rather than lying
      expect(mockPrisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'Cancelled', paymentStatus: 'Paid' }),
        }),
      );
    });

    it('rejects a replayed payment that is already bound to another order', async () => {
      const { Prisma } = await import('@prisma/client');
      mockPrisma.order.findUnique.mockResolvedValue(liveOrder);
      razorpayMock.payments.fetch.mockResolvedValue(capturedPayment);
      mockPrisma.order.updateMany.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: 'test',
          meta: { target: ['paymentId'] },
        }),
      );
      const app = await buildLiveApp();
      const res = await app.inject({
        method: 'POST',
        url: '/verify-payment',
        payload: {
          orderId: 'order-1',
          razorpayOrderId: 'rp_order_own',
          razorpayPaymentId: 'pay_1',
          razorpaySignature: sign('rp_order_own', 'pay_1'),
        },
        headers: { authorization: 'Bearer buyer' },
      });
      expect(res.statusCode).toBe(400);
      expect(res.json().error).toBe('This payment has already been used');
      // The unique constraint fires before any product is touched
      expect(mockPrisma.product.updateMany).not.toHaveBeenCalled();
    });
  });
});
