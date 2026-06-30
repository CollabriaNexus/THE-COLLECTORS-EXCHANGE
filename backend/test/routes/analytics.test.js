import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';

function buildApp(mockPrisma) {
  const fastify = Fastify();
  fastify.decorate('prisma', mockPrisma);
  fastify.decorate('authenticate', async (req, reply) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return reply.status(401).send({ error: 'No token provided' });
    req.user = { sub: 'sb-123' };
    req.dbUser = { id: 'user-id', role: 'user' };
  });
  return fastify;
}

describe('analytics routes', () => {
  let mockPrisma;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma = {
      product: { findUnique: vi.fn() },
      productView: { create: vi.fn() },
      cartEvent: { create: vi.fn() },
      checkoutEvent: { create: vi.fn() },
    };
  });

  describe('POST /view', () => {
    it('records a product view', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1' });
      mockPrisma.productView.create.mockResolvedValue({});
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/analytics.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/view', payload: { productId: 'p1', sessionId: 'sess-1' }, headers: { authorization: 'Bearer user' } });
      expect(res.statusCode).toBe(200);
    });

    it('returns 400 without productId', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/analytics.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/view', payload: {}, headers: { authorization: 'Bearer user' } });
      expect(res.statusCode).toBe(400);
    });

    it('returns 404 for unknown product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/analytics.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/view', payload: { productId: 'p1' }, headers: { authorization: 'Bearer user' } });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /cart', () => {
    it('records cart event', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1' });
      mockPrisma.cartEvent.create.mockResolvedValue({});
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/analytics.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/cart', payload: { productId: 'p1', action: 'ADD' }, headers: { authorization: 'Bearer user' } });
      expect(res.statusCode).toBe(200);
    });

    it('returns 400 without productId or action', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/analytics.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/cart', payload: {}, headers: { authorization: 'Bearer user' } });
      expect(res.statusCode).toBe(400);
    });

    it('returns 400 with invalid action', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/analytics.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/cart', payload: { productId: 'p1', action: 'INVALID' }, headers: { authorization: 'Bearer user' } });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /checkout', () => {
    it('records checkout event', async () => {
      mockPrisma.checkoutEvent.create.mockResolvedValue({});
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/analytics.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/checkout', payload: { productId: 'p1' }, headers: { authorization: 'Bearer user' } });
      expect(res.statusCode).toBe(200);
    });

    it('returns 400 without productId', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/analytics.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/checkout', payload: {}, headers: { authorization: 'Bearer user' } });
      expect(res.statusCode).toBe(400);
    });
  });
});
