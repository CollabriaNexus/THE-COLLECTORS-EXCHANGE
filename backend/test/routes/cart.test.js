import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';

function buildApp(mockPrisma) {
  const fastify = Fastify();
  fastify.decorate('prisma', mockPrisma);
  fastify.decorate('authenticate', async (req, reply) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return reply.status(401).send({ error: 'No token provided' });
    req.user = { sub: 'sb-123' };
    req.dbUser = { id: 'user-id' };
  });
  return fastify;
}

describe('cart routes', () => {
  let mockPrisma;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma = {
      user: { findUnique: vi.fn() },
      product: { findUnique: vi.fn() },
      cartItem: { findMany: vi.fn(), upsert: vi.fn(), delete: vi.fn() },
    };
  });

  describe('GET /:userId', () => {
    it('returns cart items', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id', supabaseId: 'sb-123' });
      mockPrisma.cartItem.findMany.mockResolvedValue([{ id: 'c1', product: { title: 'Test' } }]);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/cart.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'GET', url: '/user-id', headers: { authorization: 'Bearer token' } });
      expect(res.statusCode).toBe(200);
    });

    it('returns 403 when accessing another user\'s cart', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'other-id', supabaseId: 'sb-other' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/cart.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'GET', url: '/other-id', headers: { authorization: 'Bearer token' } });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('POST /', () => {
    it('adds item to cart', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id', supabaseId: 'sb-123' });
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', status: 'Approved' });
      mockPrisma.cartItem.upsert.mockResolvedValue({ id: 'c1', userId: 'user-id', productId: 'p1' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/cart.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/', payload: { userId: 'user-id', productId: 'p1' }, headers: { authorization: 'Bearer token' } });
      expect(res.statusCode).toBe(201);
    });

    it('returns 404 when product not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id', supabaseId: 'sb-123' });
      mockPrisma.product.findUnique.mockResolvedValue(null);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/cart.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/', payload: { userId: 'user-id', productId: 'p1' }, headers: { authorization: 'Bearer token' } });
      expect(res.statusCode).toBe(404);
    });

    it('returns 422 when product is sold', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id', supabaseId: 'sb-123' });
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', status: 'Sold' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/cart.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/', payload: { userId: 'user-id', productId: 'p1' }, headers: { authorization: 'Bearer token' } });
      expect(res.statusCode).toBe(422);
    });

    it('returns 422 when product not approved', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id', supabaseId: 'sb-123' });
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', status: 'Pending' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/cart.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/', payload: { userId: 'user-id', productId: 'p1' }, headers: { authorization: 'Bearer token' } });
      expect(res.statusCode).toBe(422);
    });
  });

  describe('DELETE /', () => {
    it('removes item from cart', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id', supabaseId: 'sb-123' });
      mockPrisma.cartItem.delete.mockResolvedValue({});
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/cart.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'DELETE', url: '/', payload: { userId: 'user-id', productId: 'p1' }, headers: { authorization: 'Bearer token' } });
      expect(res.statusCode).toBe(204);
    });
  });
});
