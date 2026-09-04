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
      cartItem: { findMany: vi.fn(), upsert: vi.fn(), delete: vi.fn(), deleteMany: vi.fn() },
    };
  });

  describe('GET /:userId', () => {
    it('returns cart items', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id', supabaseId: 'sb-123' });
      mockPrisma.cartItem.findMany.mockResolvedValue([{ id: 'c1', product: { title: 'Test' } }]);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/cart.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/user-id',
        headers: { authorization: 'Bearer token' },
      });
      expect(res.statusCode).toBe(200);
    });

    it("returns 403 when accessing another user's cart", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'other-id', supabaseId: 'sb-other' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/cart.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'GET',
        url: '/other-id',
        headers: { authorization: 'Bearer token' },
      });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('POST /', () => {
    it('adds item to cart', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id', supabaseId: 'sb-123' });
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'p1',
        status: 'Approved',
        isPublished: true,
      });
      mockPrisma.cartItem.upsert.mockResolvedValue({
        id: 'c1',
        userId: 'user-id',
        productId: 'p1',
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/cart.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/',
        payload: { userId: 'user-id', productId: 'p1' },
        headers: { authorization: 'Bearer token' },
      });
      expect(res.statusCode).toBe(201);
    });

    // `status` and `isPublished` are set independently, so an Approved product
    // can still be deliberately pulled from the storefront. Before this guard a
    // known id could be added straight to a cart even though the public
    // catalogue no longer listed it.
    it('refuses a product that is Approved but not published', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id', supabaseId: 'sb-123' });
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'p1',
        status: 'Approved',
        isPublished: false,
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/cart.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/',
        payload: { userId: 'user-id', productId: 'p1' },
        headers: { authorization: 'Bearer token' },
      });
      expect(res.statusCode).toBe(422);
      expect(mockPrisma.cartItem.upsert).not.toHaveBeenCalled();
    });

    it('returns 404 when product not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id', supabaseId: 'sb-123' });
      mockPrisma.product.findUnique.mockResolvedValue(null);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/cart.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/',
        payload: { userId: 'user-id', productId: 'p1' },
        headers: { authorization: 'Bearer token' },
      });
      expect(res.statusCode).toBe(404);
    });

    it('returns 422 when product is sold', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id', supabaseId: 'sb-123' });
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', status: 'Sold' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/cart.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/',
        payload: { userId: 'user-id', productId: 'p1' },
        headers: { authorization: 'Bearer token' },
      });
      expect(res.statusCode).toBe(422);
    });

    it('returns 422 when product not approved', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id', supabaseId: 'sb-123' });
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', status: 'Pending' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/cart.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/',
        payload: { userId: 'user-id', productId: 'p1' },
        headers: { authorization: 'Bearer token' },
      });
      expect(res.statusCode).toBe(422);
    });
  });

  describe('DELETE /', () => {
    it('removes item from cart', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id', supabaseId: 'sb-123' });
      mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/cart.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'DELETE',
        url: '/',
        payload: { userId: 'user-id', productId: 'p1' },
        headers: { authorization: 'Bearer token' },
      });
      expect(res.statusCode).toBe(204);
      expect(mockPrisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-id', productId: 'p1' },
      });
    });

    it('is idempotent — removing an already-gone item still returns 204', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id', supabaseId: 'sb-123' });
      mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 0 });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/cart.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'DELETE',
        url: '/',
        payload: { userId: 'user-id', productId: 'gone' },
        headers: { authorization: 'Bearer token' },
      });
      expect(res.statusCode).toBe(204);
    });
  });
});
