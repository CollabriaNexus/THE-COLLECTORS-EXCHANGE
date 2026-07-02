import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';

function buildApp(mockPrisma) {
  const fastify = Fastify();
  fastify.decorate('prisma', mockPrisma);
  fastify.decorate('authenticate', async (req, reply) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return reply.status(401).send({ error: 'No token provided' });
    if (token === 'banned') return reply.status(403).send({ error: 'Your account has been banned' });
    req.user = { sub: 'sb-123' };
    const dbUser = token === 'admin' ? { id: 'admin-id', role: 'admin', kycStatus: 'verified', vendor: { id: 'v1', type: 'SINGLE', status: 'APPROVED', maxListings: 5 } }
      : token === 'curator' ? { id: 'curator-id', role: 'curator', kycStatus: 'verified', vendor: null }
      : token === 'vendor' ? { id: 'vendor-id', role: 'user', kycStatus: 'verified', vendor: { id: 'v2', type: 'SINGLE', status: 'APPROVED', maxListings: 5 } }
      : token === 'bulk-vendor' ? { id: 'bulk-vendor-id', role: 'user', kycStatus: 'verified', vendor: { id: 'v3', type: 'BULK', status: 'APPROVED', maxListings: 999999 } }
      : token === 'no-kyc' ? { id: 'user-id', role: 'user', kycStatus: 'none', vendor: null }
      : token === 'other-user' ? { id: 'other-id', role: 'user', kycStatus: 'verified', vendor: null }
      : null;
    if (dbUser && dbUser.banned) return reply.status(403).send({ error: 'banned' });
    req.dbUser = dbUser;
    if (!dbUser && token !== 'no-db') return reply.status(401).send({ error: 'not found' });
  });
  fastify.decorate('requireDbUser', async (req, reply) => {
    if (!req.dbUser) return reply.status(401).send({ error: 'User profile not synchronized' });
  });
  return fastify;
}

describe('products routes', () => {
  let mockPrisma;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma = {
      $queryRaw: vi.fn(),
      product: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      vendor: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    };
  });

  describe('GET /debug/prisma', () => {
    it('returns connection status', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ ok: 1 }]);
      mockPrisma.product.count.mockResolvedValue(5);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'GET', url: '/debug/prisma' });
      expect(res.statusCode).toBe(200);
      expect(res.json().connected).toBe(true);
      expect(res.json().productCount).toBe(5);
    });

    it('returns 500 on error', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('DB down'));
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'GET', url: '/debug/prisma' });
      expect(res.statusCode).toBe(500);
    });
  });

  describe('GET /', () => {
    it('returns products list with pagination', async () => {
      mockPrisma.product.findMany.mockResolvedValue([{ id: 'p1', title: 'Test', seller: { name: 'Seller' } }]);
      mockPrisma.product.count.mockResolvedValue(1);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'GET', url: '/' });
      expect(res.statusCode).toBe(200);
      expect(res.json().products).toHaveLength(1);
      expect(res.json().total).toBe(1);
    });

    it('filters by category', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'GET', url: '/?category=Timepieces' });
      expect(res.statusCode).toBe(200);
    });

    it('filters by search', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'GET', url: '/?search=watch' });
      expect(res.statusCode).toBe(200);
    });

    it('sorts public catalog by commissionPercent DESC then createdAt DESC', async () => {
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'p2', title: 'High Comm', price: 100, commissionPercent: 25, seller: { name: 'S' }, status: 'Approved' },
        { id: 'p1', title: 'Low Comm', price: 100, commissionPercent: 10, seller: { name: 'S' }, status: 'Approved' },
      ]);
      mockPrisma.product.count.mockResolvedValue(2);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'GET', url: '/' });
      expect(res.statusCode).toBe(200);
      expect(res.json().products[0].id).toBe('p2');
      expect(res.json().products[1].id).toBe('p1');
    });

    it('returns 500 on DB error', async () => {
      mockPrisma.product.findMany.mockRejectedValue(new Error('DB error'));
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'GET', url: '/' });
      expect(res.statusCode).toBe(500);
    });
  });

  describe('GET /:id', () => {
    it('returns product by id', async () => {
      mockPrisma.product.findFirst.mockResolvedValue({ id: 'p1', title: 'Test', seller: { name: 'S' } });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'GET', url: '/p1' });
      expect(res.statusCode).toBe(200);
      expect(res.json().id).toBe('p1');
    });

    it('returns 404 when not found', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(null);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'GET', url: '/nonexistent' });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /', () => {
    const validProduct = { title: 'Watch', category: 'Timepieces', description: 'Desc', condition: 'Mint', price: 1000, image: 'https://img.com/1.jpg', sellerId: 'vendor-id' };

    it('creates a product', async () => {
      mockPrisma.product.create.mockResolvedValue({ id: 'new-p', ...validProduct, images: [], keywords: [] });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/', payload: validProduct, headers: { authorization: 'Bearer vendor' } });
      expect(res.statusCode).toBe(201);
    });

    it('creates a product with custom commissionPercent', async () => {
      mockPrisma.product.count.mockResolvedValue(0);
      mockPrisma.product.create.mockResolvedValue({ id: 'new-p', ...validProduct, commissionPercent: 20, images: [], keywords: [] });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/', payload: { ...validProduct, commissionPercent: 20 }, headers: { authorization: 'Bearer vendor' } });
      expect(res.statusCode).toBe(201);
    });

    it('returns 401 without auth', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/', payload: validProduct });
      expect(res.statusCode).toBe(401);
    });

    it('returns 403 when sellerId mismatches', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/', payload: { ...validProduct, sellerId: 'wrong-id' }, headers: { authorization: 'Bearer vendor' } });
      expect(res.statusCode).toBe(403);
    });

    it('returns 403 when KYC not verified', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/', payload: { ...validProduct, sellerId: 'user-id' }, headers: { authorization: 'Bearer no-kyc' } });
      expect(res.statusCode).toBe(403);
    });

    it('returns 422 when listing limit reached for SINGLE vendor', async () => {
      mockPrisma.product.count.mockResolvedValue(5);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/', payload: validProduct, headers: { authorization: 'Bearer vendor' } });
      expect(res.statusCode).toBe(422);
    });
  });

  describe('PUT /:id', () => {
    it('updates a product as owner', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', sellerId: 'vendor-id', status: 'Pending' });
      mockPrisma.product.update.mockResolvedValue({ id: 'p1', title: 'Updated' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'PUT', url: '/p1', payload: { title: 'Updated' }, headers: { authorization: 'Bearer vendor' } });
      expect(res.statusCode).toBe(200);
    });

    it('returns 404 when product not found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'PUT', url: '/nonexistent', payload: { title: 'Updated' }, headers: { authorization: 'Bearer vendor' } });
      expect(res.statusCode).toBe(404);
    });

    it('returns 422 when product is sold', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', sellerId: 'vendor-id', status: 'Sold' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'PUT', url: '/p1', payload: { title: 'Updated' }, headers: { authorization: 'Bearer vendor' } });
      expect(res.statusCode).toBe(422);
    });

    it('returns 403 when not owner and not admin', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', sellerId: 'other-id', status: 'Pending' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'PUT', url: '/p1', payload: { title: 'Updated' }, headers: { authorization: 'Bearer vendor' } });
      expect(res.statusCode).toBe(403);
    });

    it('updates commissionPercent on an owned product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', sellerId: 'vendor-id', status: 'Approved' });
      mockPrisma.product.update.mockResolvedValue({ id: 'p1', title: 'Updated', commissionPercent: 20 });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'PUT', url: '/p1', payload: { commissionPercent: 20 }, headers: { authorization: 'Bearer vendor' } });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('DELETE /:id', () => {
    it('deletes product as owner', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', sellerId: 'vendor-id' });
      mockPrisma.product.delete.mockResolvedValue({});
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'DELETE', url: '/p1', headers: { authorization: 'Bearer vendor' } });
      expect(res.statusCode).toBe(204);
    });

    it('returns 404 when not found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'DELETE', url: '/nope', headers: { authorization: 'Bearer vendor' } });
      expect(res.statusCode).toBe(404);
    });

    it('returns 403 when not owner nor admin', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', sellerId: 'other-id' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'DELETE', url: '/p1', headers: { authorization: 'Bearer vendor' } });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('POST /bulk', () => {
    it('creates products in bulk', async () => {
      mockPrisma.product.create.mockResolvedValue({ id: 'new' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/bulk', payload: { products: [{ title: 'Watch', category: 'Timepieces', description: 'Desc', condition: 'Mint', price: 100, image: 'https://img.com/1.jpg' }] }, headers: { authorization: 'Bearer bulk-vendor' } });
      expect(res.statusCode).toBe(200);
      expect(res.json().created).toBe(1);
    });

    it('returns 400 with empty products', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/bulk', payload: { products: [] }, headers: { authorization: 'Bearer vendor' } });
      expect(res.statusCode).toBe(400);
    });

    it('returns 422 when over 100 products', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/bulk', payload: { products: Array(101).fill({ title: 'a', category: 'Timepieces', description: 'd', condition: 'c', price: 1, image: 'https://img.com/1.jpg' }) }, headers: { authorization: 'Bearer vendor' } });
      expect(res.statusCode).toBe(422);
    });

    it('returns 403 when KYC not verified', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/bulk', payload: { products: [{ title: 'Watch', category: 'Timepieces', description: 'Desc', condition: 'Mint', price: 100, image: 'https://img.com/1.jpg' }] }, headers: { authorization: 'Bearer no-kyc' } });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('PATCH /:id/sold', () => {
    it('marks product as sold', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', sellerId: 'vendor-id', status: 'Approved' });
      mockPrisma.product.update.mockResolvedValue({ id: 'p1', status: 'Sold' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'PATCH', url: '/p1/sold', headers: { authorization: 'Bearer vendor' } });
      expect(res.statusCode).toBe(200);
    });

    it('returns 404 when product not found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'PATCH', url: '/nope/sold', headers: { authorization: 'Bearer vendor' } });
      expect(res.statusCode).toBe(404);
    });

    it('returns 403 when not the seller', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', sellerId: 'other-id', status: 'Approved' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'PATCH', url: '/p1/sold', headers: { authorization: 'Bearer vendor' } });
      expect(res.statusCode).toBe(403);
    });

    it('returns 422 when already sold', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', sellerId: 'vendor-id', status: 'Sold' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/products.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'PATCH', url: '/p1/sold', headers: { authorization: 'Bearer vendor' } });
      expect(res.statusCode).toBe(422);
    });
  });
});
