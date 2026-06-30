import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';

function buildApp(mockPrisma) {
  const fastify = Fastify();
  fastify.decorate('prisma', mockPrisma);
  fastify.decorate('authenticate', async (req, reply) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return reply.status(401).send({ error: 'No token provided' });
    req.user = { sub: 'sb-123' };
    req.dbUser = token === 'admin' ? { id: 'admin-id', role: 'admin', name: 'Admin' }
      : token === 'curator' ? { id: 'curator-id', role: 'curator', name: 'Curator' }
      : { id: 'user-id', role: 'user', name: 'User' };
  });
  return fastify;
}

describe('testimonials routes', () => {
  let mockPrisma;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma = {
      testimonial: {
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      order: { findFirst: vi.fn() },
    };
  });

  describe('GET /', () => {
    it('returns approved testimonials', async () => {
      mockPrisma.testimonial.findMany.mockResolvedValue([{ id: 't1', content: 'Great!' }]);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/testimonials.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'GET', url: '/' });
      expect(res.statusCode).toBe(200);
    });

    it('returns 500 on error', async () => {
      mockPrisma.testimonial.findMany.mockRejectedValue(new Error('DB error'));
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/testimonials.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'GET', url: '/' });
      expect(res.statusCode).toBe(500);
    });
  });

  describe('POST /', () => {
    it('creates a testimonial', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({ id: 'o1' });
      mockPrisma.testimonial.create.mockResolvedValue({ id: 't1', content: 'Great experience!', status: 'PENDING' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/testimonials.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/', payload: { content: 'Great experience!' }, headers: { authorization: 'Bearer user' } });
      expect(res.statusCode).toBe(200);
    });

    it('returns 400 with short content', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/testimonials.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/', payload: { content: 'Short' }, headers: { authorization: 'Bearer user' } });
      expect(res.statusCode).toBe(400);
    });

    it('returns 400 with invalid rating', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/testimonials.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/', payload: { content: 'Great experience!', rating: 6 }, headers: { authorization: 'Bearer user' } });
      expect(res.statusCode).toBe(400);
    });

    it('returns 403 without paid order', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(null);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/testimonials.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'POST', url: '/', payload: { content: 'Great experience!' }, headers: { authorization: 'Bearer user' } });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /all', () => {
    it('returns all testimonials for admin', async () => {
      mockPrisma.testimonial.findMany.mockResolvedValue([]);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/testimonials.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'GET', url: '/all', headers: { authorization: 'Bearer admin' } });
      expect(res.statusCode).toBe(200);
    });

    it('returns 403 for non-admin', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/testimonials.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'GET', url: '/all', headers: { authorization: 'Bearer user' } });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('PATCH /:id/approve', () => {
    it('approves testimonial as admin', async () => {
      mockPrisma.testimonial.update.mockResolvedValue({ id: 't1', status: 'APPROVED' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/testimonials.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'PATCH', url: '/t1/approve', headers: { authorization: 'Bearer admin' } });
      expect(res.statusCode).toBe(200);
    });

    it('returns 403 for non-admin', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/testimonials.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'PATCH', url: '/t1/approve', headers: { authorization: 'Bearer user' } });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('PATCH /:id/reject', () => {
    it('rejects testimonial as admin', async () => {
      mockPrisma.testimonial.update.mockResolvedValue({ id: 't1', status: 'REJECTED' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/testimonials.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'PATCH', url: '/t1/reject', headers: { authorization: 'Bearer admin' } });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('DELETE /:id', () => {
    it('deletes testimonial as admin', async () => {
      mockPrisma.testimonial.delete.mockResolvedValue({});
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/testimonials.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'DELETE', url: '/t1', headers: { authorization: 'Bearer admin' } });
      expect(res.statusCode).toBe(200);
    });

    it('returns 403 for non-admin', async () => {
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/testimonials.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'DELETE', url: '/t1', headers: { authorization: 'Bearer user' } });
      expect(res.statusCode).toBe(403);
    });
  });
});
