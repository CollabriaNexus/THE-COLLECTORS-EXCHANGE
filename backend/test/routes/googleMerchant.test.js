import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';

const mockGoogleMerchant = {
  ensureDeveloperRegistration: vi.fn(),
  findOrCreateDataSource: vi.fn(),
  insertProduct: vi.fn(),
};

vi.mock('../../lib/googleMerchant.js', () => mockGoogleMerchant);

function buildApp(mockPrisma) {
  const fastify = Fastify();
  fastify.decorate('prisma', mockPrisma);
  fastify.decorate('authenticate', async (req, reply) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return reply.status(401).send({ error: 'No token provided' });
    req.user = { sub: 'sb-123' };
    req.dbUser = token === 'superadmin' ? { id: 'admin-id', role: 'admin' }
      : token === 'curator' ? { id: 'curator-id', role: 'curator' }
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
      product: { findMany: vi.fn() },
    };
  });

  describe('POST /products/sync-to-google', () => {
    it('syncs approved products to Google Merchant', async () => {
      mockGoogleMerchant.ensureDeveloperRegistration.mockResolvedValue({});
      mockGoogleMerchant.findOrCreateDataSource.mockResolvedValue({ name: 'ds1' });
      mockPrisma.product.findMany.mockResolvedValue([{ id: 'p1', title: 'Watch', status: 'Approved', price: 1000 }]);
      mockGoogleMerchant.insertProduct.mockResolvedValue({});
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/googleMerchant.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/products/sync-to-google', headers: { authorization: 'Bearer superadmin' } });
      expect(res.statusCode).toBe(200);
      expect(res.json().results.synced).toBe(1);
    });

    it('handles duplicate products as skipped', async () => {
      mockGoogleMerchant.ensureDeveloperRegistration.mockResolvedValue({});
      mockGoogleMerchant.findOrCreateDataSource.mockResolvedValue({ name: 'ds1' });
      mockPrisma.product.findMany.mockResolvedValue([{ id: 'p1', title: 'Watch' }]);
      mockGoogleMerchant.insertProduct.mockRejectedValue({ status: 409, message: 'duplicate' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/googleMerchant.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/products/sync-to-google', headers: { authorization: 'Bearer superadmin' } });
      expect(res.json().results.skipped).toBe(1);
    });

    it('returns 403 for non-superadmin', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/googleMerchant.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/products/sync-to-google', headers: { authorization: 'Bearer user' } });
      expect(res.statusCode).toBe(403);
    });

    it('handles developer registration error', async () => {
      mockGoogleMerchant.ensureDeveloperRegistration.mockRejectedValue(new Error('Not registered'));
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/googleMerchant.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/products/sync-to-google', headers: { authorization: 'Bearer superadmin' } });
      expect(res.statusCode).toBe(500);
    });

    it('returns message when no approved products', async () => {
      mockGoogleMerchant.ensureDeveloperRegistration.mockResolvedValue({});
      mockGoogleMerchant.findOrCreateDataSource.mockResolvedValue({ name: 'ds1' });
      mockPrisma.product.findMany.mockResolvedValue([]);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/googleMerchant.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/products/sync-to-google', headers: { authorization: 'Bearer superadmin' } });
      expect(res.json().message).toContain('No Approved products');
    });
  });
});
