import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';

function buildApp(mockPrisma) {
  const fastify = Fastify();
  fastify.decorate('prisma', mockPrisma);
  fastify.decorate('authenticate', async (req, reply) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return reply.status(401).send({ error: 'No token provided' });
    req.user = { sub: token === 'user2' ? 'sb-456' : 'sb-123' };
    const dbUser =
      token === 'admin'
        ? {
            id: 'admin-id',
            role: 'admin',
            name: 'Admin',
            email: 'admin@test.com',
            supabaseId: 'sb-123',
            kycData: {},
          }
        : token === 'curator'
          ? {
              id: 'curator-id',
              role: 'curator',
              name: 'Curator',
              email: 'curator@test.com',
              supabaseId: 'sb-123',
              kycData: {},
            }
          : token === 'user2'
            ? {
                id: 'user2-id',
                role: 'user',
                name: 'User2',
                email: 'user2@test.com',
                supabaseId: 'sb-456',
                kycData: {},
              }
            : {
                id: 'user-id',
                role: 'user',
                name: 'Test User',
                email: 'test@test.com',
                supabaseId: 'sb-123',
                kycData: {},
              };
    req.dbUser = dbUser;
  });
  fastify.decorate('requireDbUser', async (req, reply) => {
    if (!req.dbUser) return reply.status(401).send({ error: 'User profile not synchronized' });
  });
  return fastify;
}

describe('users routes', () => {
  let mockPrisma;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma = {
      user: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        create: vi.fn(),
      },
      notification: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        create: vi.fn(),
      },
      order: { findMany: vi.fn() },
      pushSubscription: { upsert: vi.fn(), deleteMany: vi.fn() },
    };
  });

  describe('POST /register', () => {
    it('creates new user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 'new-id', email: 'test@test.com' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/register',
        payload: { email: 'test@test.com' },
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(201);
    });

    it('updates existing user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'existing-id',
        email: 'test@test.com',
        name: 'Old',
      });
      mockPrisma.user.update.mockResolvedValue({
        id: 'existing-id',
        email: 'test@test.com',
        name: 'New',
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/register',
        payload: { email: 'test@test.com', name: 'New' },
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('returns 401 without auth', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/register',
        payload: { email: 'test@test.com' },
      });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /me', () => {
    it('returns current user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'test@test.com',
        products: [],
        cart: [],
        wishlist: [],
        orders: [],
        vendor: null,
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/me',
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('returns 404 when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/me',
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /:id', () => {
    it('returns user by id (own)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'test@test.com',
        products: [],
        cart: [],
        wishlist: [],
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/user-id',
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('returns 403 when accessing another user as non-admin', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/other-id',
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(403);
    });

    it('allows admin to access any user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'other-id',
        email: 'other@test.com',
        products: [],
        cart: [],
        wishlist: [],
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/other-id',
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('returns 404 when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/nonexistent',
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /orders', () => {
    it('returns user orders', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id' });
      mockPrisma.order.findMany.mockResolvedValue([{ id: 'o1', items: [] }]);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/orders',
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('PATCH /me', () => {
    it('updates user profile', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id', supabaseId: 'sb-123' });
      mockPrisma.user.update.mockResolvedValue({ id: 'user-id', name: 'Updated' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/me',
        payload: { name: 'Updated' },
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('returns 404 when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/me',
        payload: { name: 'Updated' },
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('notifications', () => {
    it('GET /notifications returns notifications', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id' });
      mockPrisma.notification.findMany.mockResolvedValue([{ id: 'n1', title: 'Test' }]);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/notifications',
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('PATCH /notifications/read-all marks all as read', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id' });
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 3 });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/notifications/read-all',
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('PATCH /notifications/:id/read marks single notification', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id' });
      mockPrisma.notification.findUnique.mockResolvedValue({ id: 'n1', userId: 'user-id' });
      mockPrisma.notification.update.mockResolvedValue({ id: 'n1', read: true });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/notifications/n1/read',
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('returns 404 when notification not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id' });
      mockPrisma.notification.findUnique.mockResolvedValue(null);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/notifications/n1/read',
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /kyc', () => {
    it('submits KYC data', async () => {
      mockPrisma.user.update.mockResolvedValue({ id: 'user-id', kycStatus: 'pending' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/kyc',
        payload: { kycData: { pan: 'ABCDE1234F' } },
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('returns 500 on prisma error', async () => {
      mockPrisma.user.update.mockRejectedValue(new Error('DB error'));
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/kyc',
        payload: { kycData: { pan: 'ABCDE1234F' } },
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(500);
    });
  });

  describe('POST /seller-agreement/accept', () => {
    it('accepts seller agreement', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id', kycData: {} });
      mockPrisma.user.update.mockResolvedValue({
        id: 'user-id',
        kycData: { agreementAccepted: true },
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/seller-agreement/accept',
        payload: { signedByName: 'John Doe' },
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('returns 400 without signedByName', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/seller-agreement/accept',
        payload: {},
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /seller-agreement/pdf', () => {
    it('returns 404 when no PDF URL configured', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'GET', url: '/seller-agreement/pdf' });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('push subscriptions', () => {
    it('POST /push-subscribe subscribes', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id' });
      mockPrisma.pushSubscription.upsert.mockResolvedValue({});
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/push-subscribe',
        payload: { endpoint: 'https://endpoint', keys: { p256dh: 'key1', auth: 'auth1' } },
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('POST /push-subscribe returns 400 with invalid subscription', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/push-subscribe',
        payload: { endpoint: 'https://endpoint', keys: {} },
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(400);
    });

    it('DELETE /push-subscribe unsubscribes', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id' });
      mockPrisma.pushSubscription.deleteMany.mockResolvedValue({});
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'DELETE',
        url: '/push-subscribe',
        payload: { endpoint: 'https://endpoint' },
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('phone verification', () => {
    it('POST /phone/submit submits phone', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.update.mockResolvedValue({
        id: 'user-id',
        phone: '1234567890',
        phoneVerificationStatus: 'pending',
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/phone/submit',
        payload: { phone: '1234567890' },
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('returns 400 with invalid phone', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/phone/submit',
        payload: { phone: '123' },
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(400);
    });

    it('returns 409 when phone taken by another user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'other-id', supabaseId: 'sb-other' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/phone/submit',
        payload: { phone: '1234567890' },
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(409);
    });

    it('GET /phone/verifications returns pending for admin', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/phone/verifications',
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('GET /phone/verifications returns 403 for non-admin', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/phone/verifications',
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(403);
    });

    it('PATCH /phone/:userId/approve approves phone', async () => {
      mockPrisma.user.update.mockResolvedValue({ id: 'uid', phoneVerificationStatus: 'verified' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/phone/uid/approve',
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('PATCH /phone/:userId/reject rejects phone', async () => {
      mockPrisma.user.update.mockResolvedValue({ id: 'uid', phoneVerificationStatus: 'rejected' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/users.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'PATCH',
        url: '/phone/uid/reject',
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });
  });
});
