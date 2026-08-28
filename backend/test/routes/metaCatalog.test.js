import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';

const mockMetaCatalog = {
  syncProductToMeta: vi.fn(),
};

vi.mock('../../lib/metaCatalog.js', () => mockMetaCatalog);

function buildApp(mockPrisma) {
  const fastify = Fastify();
  fastify.decorate('prisma', mockPrisma);
  fastify.decorate('authenticate', async (req, reply) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return reply.status(401).send({ error: 'No token provided' });
    req.user = { sub: 'sb-123' };
    req.dbUser =
      token === 'superadmin' ? { id: 'admin-id', role: 'admin' } : { id: 'user-id', role: 'user' };
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

describe('metaCatalog routes', () => {
  let mockPrisma;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma = {
      product: { findMany: vi.fn(), findUnique: vi.fn() },
    };
  });

  describe('POST /products/sync-to-meta', () => {
    it('syncs live and reconciliation products', async () => {
      mockPrisma.product.findMany
        .mockResolvedValueOnce([
          { id: 'p1', title: 'Watch', status: 'Approved', isPublished: true, price: 1000 },
        ])
        .mockResolvedValueOnce([
          { id: 'p2', title: 'Sold Watch', status: 'Sold', isPublished: false, price: 2000 },
        ]);
      mockMetaCatalog.syncProductToMeta.mockResolvedValue({ id: '999' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/metaCatalog.js')).default);
      await app.ready();

      const res = await app.inject({
        method: 'POST',
        url: '/products/sync-to-meta',
        headers: { authorization: 'Bearer superadmin' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().results.synced).toBe(2);
      expect(mockMetaCatalog.syncProductToMeta).toHaveBeenCalledTimes(2);
    });

    it('reports per-product failures without aborting the batch', async () => {
      mockPrisma.product.findMany
        .mockResolvedValueOnce([
          { id: 'p1', title: 'Watch', status: 'Approved', isPublished: true, price: 1000 },
        ])
        .mockResolvedValueOnce([]);
      mockMetaCatalog.syncProductToMeta.mockRejectedValue(new Error('Graph API down'));
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/metaCatalog.js')).default);
      await app.ready();

      const res = await app.inject({
        method: 'POST',
        url: '/products/sync-to-meta',
        headers: { authorization: 'Bearer superadmin' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().results.synced).toBe(0);
      expect(res.json().results.errors).toEqual([
        { id: 'p1', title: 'Watch', error: 'Graph API down' },
      ]);
    });

    it('short-circuits with a friendly message when nothing needs syncing', async () => {
      mockPrisma.product.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/metaCatalog.js')).default);
      await app.ready();

      const res = await app.inject({
        method: 'POST',
        url: '/products/sync-to-meta',
        headers: { authorization: 'Bearer superadmin' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({
        synced: 0,
        errors: [],
        message: 'No products to sync.',
      });
      expect(mockMetaCatalog.syncProductToMeta).not.toHaveBeenCalled();
    });

    it('rejects non-superadmins', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/metaCatalog.js')).default);
      await app.ready();

      const res = await app.inject({
        method: 'POST',
        url: '/products/sync-to-meta',
        headers: { authorization: 'Bearer regular-user' },
      });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('POST /products/:id/sync-to-meta', () => {
    it('syncs a single product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'p1',
        title: 'Watch',
        status: 'Approved',
        isPublished: true,
        price: 1000,
      });
      mockMetaCatalog.syncProductToMeta.mockResolvedValue({ id: '999' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/metaCatalog.js')).default);
      await app.ready();

      const res = await app.inject({
        method: 'POST',
        url: '/products/p1/sync-to-meta',
        headers: { authorization: 'Bearer superadmin' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().product).toEqual({ id: 'p1', title: 'Watch' });
    });

    it('returns 404 when the product does not exist', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/metaCatalog.js')).default);
      await app.ready();

      const res = await app.inject({
        method: 'POST',
        url: '/products/missing/sync-to-meta',
        headers: { authorization: 'Bearer superadmin' },
      });

      expect(res.statusCode).toBe(404);
    });

    it('surfaces the Meta API error detail on failure', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', title: 'Watch' });
      const err = new Error('Meta Catalog API: Bad request');
      err.status = 400;
      err.raw = { message: 'Bad request' };
      mockMetaCatalog.syncProductToMeta.mockRejectedValue(err);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/metaCatalog.js')).default);
      await app.ready();

      const res = await app.inject({
        method: 'POST',
        url: '/products/p1/sync-to-meta',
        headers: { authorization: 'Bearer superadmin' },
      });

      expect(res.statusCode).toBe(400);
      expect(res.json().detail).toBe('Bad request');
    });
  });
});
