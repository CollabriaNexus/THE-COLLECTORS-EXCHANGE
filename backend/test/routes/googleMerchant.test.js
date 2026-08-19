import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';

const mockGoogleMerchant = {
  ensureDeveloperRegistration: vi.fn(),
  findOrCreateDataSource: vi.fn(),
  insertProduct: vi.fn(),
  deleteProduct: vi.fn(),
};

vi.mock('../../lib/googleMerchant.js', () => mockGoogleMerchant);

function buildApp(mockPrisma) {
  const fastify = Fastify();
  fastify.decorate('prisma', mockPrisma);
  fastify.decorate('authenticate', async (req, reply) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return reply.status(401).send({ error: 'No token provided' });
    req.user = { sub: 'sb-123' };
    req.dbUser =
      token === 'superadmin'
        ? { id: 'admin-id', role: 'admin' }
        : token === 'curator'
          ? { id: 'curator-id', role: 'curator' }
          : { id: 'user-id', role: 'user' };
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

describe('googleMerchant routes', () => {
  let mockPrisma;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma = {
      product: { findMany: vi.fn(), findUnique: vi.fn() },
    };
  });

  describe('POST /products/sync-to-google', () => {
    it('syncs approved products and excludes never-eligible unpublished records from reconciliation', async () => {
      mockGoogleMerchant.ensureDeveloperRegistration.mockResolvedValue({});
      mockGoogleMerchant.findOrCreateDataSource.mockResolvedValue({ name: 'ds1' });
      mockPrisma.product.findMany
        .mockResolvedValueOnce([
          { id: 'p1', title: 'Watch', status: 'Approved', isPublished: true, price: 1000 },
        ])
        .mockResolvedValueOnce([]);
      mockGoogleMerchant.insertProduct.mockResolvedValue({});
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/googleMerchant.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/products/sync-to-google',
        headers: { authorization: 'Bearer superadmin' },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().results.synced).toBe(1);
      expect(mockPrisma.product.findMany).toHaveBeenNthCalledWith(1, {
        where: { status: 'Approved', isPublished: true },
      });
      expect(mockPrisma.product.findMany).toHaveBeenNthCalledWith(2, {
        where: {
          OR: [{ status: 'Sold' }, { status: 'Approved', isPublished: false }],
        },
        orderBy: { id: 'asc' },
        take: 11,
      });
    });

    it('handles duplicate products as skipped', async () => {
      mockGoogleMerchant.ensureDeveloperRegistration.mockResolvedValue({});
      mockGoogleMerchant.findOrCreateDataSource.mockResolvedValue({ name: 'ds1' });
      mockPrisma.product.findMany
        .mockResolvedValueOnce([
          { id: 'p1', title: 'Watch', status: 'Approved', isPublished: true },
        ])
        .mockResolvedValueOnce([]);
      mockGoogleMerchant.insertProduct.mockRejectedValue({ status: 409, message: 'duplicate' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/googleMerchant.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/products/sync-to-google',
        headers: { authorization: 'Bearer superadmin' },
      });
      expect(res.json().results.skipped).toBe(1);
    });

    it('returns 403 for non-superadmin', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/googleMerchant.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/products/sync-to-google',
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(403);
    });

    it('handles developer registration error', async () => {
      mockGoogleMerchant.ensureDeveloperRegistration.mockRejectedValue(
        new Error('Permission denied'),
      );
      mockPrisma.product.findMany
        .mockResolvedValueOnce([
          { id: 'p1', title: 'Watch', status: 'Approved', isPublished: true },
        ])
        .mockResolvedValueOnce([]);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/googleMerchant.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/products/sync-to-google',
        headers: { authorization: 'Bearer superadmin' },
      });
      expect(res.statusCode).toBe(500);
      expect(res.json().error).toBe('GCP project not registered with Merchant Center.');
    });

    it('returns message when no approved products', async () => {
      mockGoogleMerchant.ensureDeveloperRegistration.mockResolvedValue({});
      mockGoogleMerchant.findOrCreateDataSource.mockResolvedValue({ name: 'ds1' });
      mockPrisma.product.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/googleMerchant.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/products/sync-to-google',
        headers: { authorization: 'Bearer superadmin' },
      });
      expect(res.json().message).toContain('No Approved and published products');
      expect(res.json().reconciliation).toEqual({
        deleted: 0,
        skipped: 0,
        errors: [],
        processed: 0,
        limit: 10,
        nextCursor: null,
      });
      expect(mockGoogleMerchant.ensureDeveloperRegistration).not.toHaveBeenCalled();
    });

    it('deletes Sold and unpublished products while inserting only eligible products', async () => {
      mockGoogleMerchant.ensureDeveloperRegistration.mockResolvedValue({});
      mockGoogleMerchant.findOrCreateDataSource.mockResolvedValue({ name: 'ds1' });
      mockPrisma.product.findMany
        .mockResolvedValueOnce([
          { id: 'eligible', title: 'Public watch', status: 'Approved', isPublished: true },
        ])
        .mockResolvedValueOnce([
          { id: 'sold', title: 'Sold watch', status: 'Sold', isPublished: true },
          { id: 'hidden', title: 'Hidden watch', status: 'Approved', isPublished: false },
        ]);
      mockGoogleMerchant.insertProduct.mockResolvedValue({});
      mockGoogleMerchant.deleteProduct.mockResolvedValue({});

      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/googleMerchant.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/products/sync-to-google',
        headers: { authorization: 'Bearer superadmin' },
      });

      expect(res.statusCode).toBe(200);
      expect(mockGoogleMerchant.insertProduct).toHaveBeenCalledTimes(1);
      expect(mockGoogleMerchant.insertProduct).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'eligible' }),
        'ds1',
        expect.any(String),
      );
      expect(mockGoogleMerchant.deleteProduct).toHaveBeenCalledTimes(2);
      expect(mockGoogleMerchant.deleteProduct).toHaveBeenNthCalledWith(1, 'sold', 'ds1');
      expect(mockGoogleMerchant.deleteProduct).toHaveBeenNthCalledWith(2, 'hidden', 'ds1');
      expect(res.json().reconciliation).toEqual({
        deleted: 2,
        skipped: 0,
        errors: [],
        processed: 2,
        limit: 10,
        nextCursor: null,
      });
    });

    it('treats missing Merchant inputs as skipped and reports other deletion errors', async () => {
      mockGoogleMerchant.ensureDeveloperRegistration.mockResolvedValue({});
      mockGoogleMerchant.findOrCreateDataSource.mockResolvedValue({ name: 'ds1' });
      mockPrisma.product.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([
        { id: 'gone', title: 'Already gone', status: 'Sold', isPublished: true },
        { id: 'also-gone', title: 'Also gone', status: 'Approved', isPublished: false },
        { id: 'failed', title: 'Delete failed', status: 'Sold', isPublished: true },
      ]);
      mockGoogleMerchant.deleteProduct
        .mockRejectedValueOnce({ status: 404, message: 'Merchant API 404: Not found' })
        .mockRejectedValueOnce(new Error('product input not found'))
        .mockRejectedValueOnce(new Error('Permission denied'));

      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/googleMerchant.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/products/sync-to-google',
        headers: { authorization: 'Bearer superadmin' },
      });

      expect(res.statusCode).toBe(200);
      expect(mockGoogleMerchant.insertProduct).not.toHaveBeenCalled();
      expect(mockGoogleMerchant.deleteProduct).toHaveBeenCalledTimes(3);
      expect(res.json().reconciliation).toEqual({
        deleted: 0,
        skipped: 2,
        errors: [{ id: 'failed', title: 'Delete failed', error: 'Permission denied' }],
        processed: 3,
        limit: 10,
        nextCursor: null,
      });
    });

    it('processes at most the default reconciliation batch and returns the next cursor', async () => {
      mockGoogleMerchant.ensureDeveloperRegistration.mockResolvedValue({});
      mockGoogleMerchant.findOrCreateDataSource.mockResolvedValue({ name: 'ds1' });
      const candidates = Array.from({ length: 11 }, (_, index) => ({
        id: `p${String(index + 1).padStart(2, '0')}`,
        title: `Product ${index + 1}`,
        status: 'Sold',
        isPublished: true,
      }));
      mockPrisma.product.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce(candidates);
      mockGoogleMerchant.deleteProduct.mockResolvedValue({});

      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/googleMerchant.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/products/sync-to-google',
        headers: { authorization: 'Bearer superadmin' },
      });

      expect(res.statusCode).toBe(200);
      expect(mockGoogleMerchant.deleteProduct).toHaveBeenCalledTimes(10);
      expect(mockGoogleMerchant.deleteProduct).not.toHaveBeenCalledWith('p11', expect.anything());
      expect(res.json().reconciliation).toEqual({
        deleted: 10,
        skipped: 0,
        errors: [],
        processed: 10,
        limit: 10,
        nextCursor: 'p10',
      });
    });

    it('caps an explicit limit and resumes in deterministic id order after the cursor', async () => {
      mockPrisma.product.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/googleMerchant.js')).default);
      await app.ready();

      const res = await app.inject({
        method: 'POST',
        url: '/products/sync-to-google?limit=999&cursor=p10',
        headers: { authorization: 'Bearer superadmin' },
      });

      expect(res.statusCode).toBe(200);
      expect(mockPrisma.product.findMany).toHaveBeenNthCalledWith(2, {
        where: {
          OR: [{ status: 'Sold' }, { status: 'Approved', isPublished: false }],
        },
        orderBy: { id: 'asc' },
        take: 51,
        cursor: { id: 'p10' },
        skip: 1,
      });
      expect(res.json().reconciliation).toEqual({
        deleted: 0,
        skipped: 0,
        errors: [],
        processed: 0,
        limit: 50,
        nextCursor: null,
      });
    });
  });

  describe('POST /products/:id/sync-to-google', () => {
    it.each([
      [{ status: 'Sold', isPublished: true }, 'not approved'],
      [{ status: 'Approved', isPublished: false }, 'not published'],
    ])('rejects an ineligible product (%s)', async (state, reason) => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'p1',
        title: 'Watch',
        price: 1000,
        ...state,
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/googleMerchant.js')).default);
      await app.ready();

      const res = await app.inject({
        method: 'POST',
        url: '/products/p1/sync-to-google',
        headers: { authorization: 'Bearer superadmin' },
      });

      expect(res.statusCode).toBe(422);
      expect(res.json().detail).toContain(reason);
      expect(mockGoogleMerchant.ensureDeveloperRegistration).not.toHaveBeenCalled();
      expect(mockGoogleMerchant.insertProduct).not.toHaveBeenCalled();
    });

    it('syncs a product that is approved and published', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'p1',
        title: 'Watch',
        status: 'Approved',
        isPublished: true,
        price: 1000,
      });
      mockGoogleMerchant.ensureDeveloperRegistration.mockResolvedValue({});
      mockGoogleMerchant.findOrCreateDataSource.mockResolvedValue({ name: 'ds1' });
      mockGoogleMerchant.insertProduct.mockResolvedValue({});
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/googleMerchant.js')).default);
      await app.ready();

      const res = await app.inject({
        method: 'POST',
        url: '/products/p1/sync-to-google',
        headers: { authorization: 'Bearer superadmin' },
      });

      expect(res.statusCode).toBe(200);
      expect(mockGoogleMerchant.insertProduct).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'p1' }),
        'ds1',
        expect.any(String),
      );
    });
  });
});
