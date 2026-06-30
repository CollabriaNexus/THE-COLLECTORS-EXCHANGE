import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';

function buildApp(mockPrisma) {
  const fastify = Fastify();
  fastify.decorate('prisma', mockPrisma);
  fastify.decorate('authenticate', async (req, reply) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return reply.status(401).send({ error: 'No token provided' });
    req.user = { sub: 'sb-123' };
    req.dbUser = token === 'admin' ? { id: 'admin-id', role: 'admin' }
      : { id: 'user-id', role: 'user' };
  });
  return fastify;
}

describe('gallery routes', () => {
  let mockPrisma;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma = {
      galleryItem: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
  });

  describe('GET /', () => {
    it('returns all gallery items', async () => {
      mockPrisma.galleryItem.findMany.mockResolvedValue([{ id: 'g1', title: 'Art' }]);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/gallery.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'GET', url: '/' });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('GET /:id', () => {
    it('returns single gallery item', async () => {
      mockPrisma.galleryItem.findUnique.mockResolvedValue({ id: 'g1', title: 'Art' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/gallery.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'GET', url: '/g1' });
      expect(res.statusCode).toBe(200);
    });

    it('returns 404 when not found', async () => {
      mockPrisma.galleryItem.findUnique.mockResolvedValue(null);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/gallery.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'GET', url: '/nonexistent' });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /', () => {
    const valid = { title: 'Art', teaser: 'Beautiful', description: 'Desc', origin: 'India', timePeriod: 'Mughal', institution: 'Museum', significance: 'Rare', theme: 'History' };

    it('creates gallery item as admin', async () => {
      mockPrisma.galleryItem.create.mockResolvedValue({ id: 'g1', ...valid, images: [] });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/gallery.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/', payload: valid, headers: { authorization: 'Bearer admin' } });
      expect(res.statusCode).toBe(201);
    });

    it('returns 403 for non-admin', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/gallery.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/', payload: valid, headers: { authorization: 'Bearer user' } });
      expect(res.statusCode).toBe(403);
    });

    it('returns 401 without auth', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/gallery.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/', payload: valid });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /:id', () => {
    it('updates gallery item as admin', async () => {
      mockPrisma.galleryItem.findUnique.mockResolvedValue({ id: 'g1', title: 'Old' });
      mockPrisma.galleryItem.update.mockResolvedValue({ id: 'g1', title: 'Updated' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/gallery.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'PUT', url: '/g1', payload: { title: 'Updated' }, headers: { authorization: 'Bearer admin' } });
      expect(res.statusCode).toBe(200);
    });

    it('returns 403 for non-admin', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/gallery.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'PUT', url: '/g1', payload: { title: 'Updated' }, headers: { authorization: 'Bearer user' } });
      expect(res.statusCode).toBe(403);
    });

    it('returns 404 when not found', async () => {
      mockPrisma.galleryItem.findUnique.mockResolvedValue(null);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/gallery.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'PUT', url: '/nonexistent', payload: { title: 'Updated' }, headers: { authorization: 'Bearer admin' } });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /:id', () => {
    it('deletes gallery item as admin', async () => {
      mockPrisma.galleryItem.findUnique.mockResolvedValue({ id: 'g1' });
      mockPrisma.galleryItem.delete.mockResolvedValue({});
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/gallery.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'DELETE', url: '/g1', headers: { authorization: 'Bearer admin' } });
      expect(res.statusCode).toBe(204);
    });

    it('returns 403 for non-admin', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/gallery.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'DELETE', url: '/g1', headers: { authorization: 'Bearer user' } });
      expect(res.statusCode).toBe(403);
    });

    it('returns 404 when not found', async () => {
      mockPrisma.galleryItem.findUnique.mockResolvedValue(null);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/gallery.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'DELETE', url: '/nonexistent', headers: { authorization: 'Bearer admin' } });
      expect(res.statusCode).toBe(404);
    });
  });
});
