import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';

process.env.SUPABASE_URL = 'https://test.supabase.co';

vi.mock('jose', () => ({
  createRemoteJWKSet: vi.fn(() => 'mock-jwks'),
  jwtVerify: vi.fn(),
}));

const mockPrisma = {
  user: { findUnique: vi.fn() },
};

async function buildAuthenticatedApp(routeHandler) {
  const fastify = Fastify();
  fastify.decorate('prisma', mockPrisma);
  const authPlugin = (await import('../../plugins/auth.js')).default;
  await fastify.register(authPlugin);
  fastify.get(
    '/test-auth',
    { preValidation: [fastify.authenticate] },
    routeHandler || (async (req) => ({ ok: true, dbUser: req.dbUser })),
  );
  await fastify.ready();
  return fastify;
}

describe('auth plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authenticate', () => {
    it('returns 401 with no token', async () => {
      const app = await buildAuthenticatedApp();
      const res = await app.inject({ method: 'GET', url: '/test-auth' });
      expect(res.statusCode).toBe(401);
      expect(res.json().error).toBe('No token provided');
    });

    it('returns 401 with invalid token', async () => {
      const { jwtVerify } = await import('jose');
      jwtVerify.mockRejectedValue(new Error('invalid token'));
      const app = await buildAuthenticatedApp();
      const res = await app.inject({
        method: 'GET',
        url: '/test-auth',
        headers: { authorization: 'Bearer bad-token' },
      });
      expect(res.statusCode).toBe(401);
    });

    it('returns 403 when user is banned', async () => {
      const { jwtVerify } = await import('jose');
      jwtVerify.mockResolvedValue({ payload: { sub: 'sb-123' } });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        supabaseId: 'sb-123',
        banned: true,
        vendor: null,
      });
      const app = await buildAuthenticatedApp();
      const res = await app.inject({
        method: 'GET',
        url: '/test-auth',
        headers: { authorization: 'Bearer good-token' },
      });
      expect(res.statusCode).toBe(403);
      expect(res.json().error).toContain('banned');
    });

    it('sets request.dbUser when user exists and is not banned', async () => {
      const { jwtVerify } = await import('jose');
      jwtVerify.mockResolvedValue({ payload: { sub: 'sb-123' } });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        supabaseId: 'sb-123',
        banned: false,
        vendor: null,
      });
      const app = await buildAuthenticatedApp(async (req) => ({ dbUser: req.dbUser }));
      const res = await app.inject({
        method: 'GET',
        url: '/test-auth',
        headers: { authorization: 'Bearer good-token' },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().dbUser.id).toBe('u1');
    });

    it('sets request.dbUser to null when DB user not found', async () => {
      const { jwtVerify } = await import('jose');
      jwtVerify.mockResolvedValue({ payload: { sub: 'sb-unknown' } });
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const app = await buildAuthenticatedApp(async (req) => ({ dbUser: req.dbUser }));
      const res = await app.inject({
        method: 'GET',
        url: '/test-auth',
        headers: { authorization: 'Bearer good-token' },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().dbUser).toBeNull();
    });
  });

  describe('requireDbUser', () => {
    it('returns 401 when dbUser is null', async () => {
      const { jwtVerify } = await import('jose');
      jwtVerify.mockResolvedValue({ payload: { sub: 'sb-unknown' } });
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const fastify = Fastify();
      fastify.decorate('prisma', mockPrisma);
      const authPlugin = (await import('../../plugins/auth.js')).default;
      await fastify.register(authPlugin);
      fastify.get(
        '/test-req-db',
        { preValidation: [fastify.authenticate, fastify.requireDbUser] },
        async () => ({ ok: true }),
      );
      await fastify.ready();
      const res = await fastify.inject({
        method: 'GET',
        url: '/test-req-db',
        headers: { authorization: 'Bearer token' },
      });
      expect(res.statusCode).toBe(401);
      expect(res.json().error).toBe('User profile not synchronized');
    });
  });

  describe('authenticateAdmin', () => {
    it('returns 403 when user is not admin or curator', async () => {
      const { jwtVerify } = await import('jose');
      jwtVerify.mockResolvedValue({ payload: { sub: 'sb-123' } });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        supabaseId: 'sb-123',
        banned: false,
        role: 'user',
        vendor: null,
      });
      const fastify = Fastify();
      fastify.decorate('prisma', mockPrisma);
      const authPlugin = (await import('../../plugins/auth.js')).default;
      await fastify.register(authPlugin);
      fastify.get('/test-admin', { preValidation: [fastify.authenticateAdmin] }, async () => ({
        ok: true,
      }));
      await fastify.ready();
      const res = await fastify.inject({
        method: 'GET',
        url: '/test-admin',
        headers: { authorization: 'Bearer token' },
      });
      expect(res.statusCode).toBe(403);
      expect(res.json().error).toContain('Admin or Curator');
    });

    it('allows admin role', async () => {
      const { jwtVerify } = await import('jose');
      jwtVerify.mockResolvedValue({ payload: { sub: 'sb-123' } });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        supabaseId: 'sb-123',
        banned: false,
        role: 'admin',
        vendor: null,
      });
      const fastify = Fastify();
      fastify.decorate('prisma', mockPrisma);
      const authPlugin = (await import('../../plugins/auth.js')).default;
      await fastify.register(authPlugin);
      fastify.get('/test-admin2', { preValidation: [fastify.authenticateAdmin] }, async () => ({
        ok: true,
      }));
      await fastify.ready();
      const res = await fastify.inject({
        method: 'GET',
        url: '/test-admin2',
        headers: { authorization: 'Bearer token' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('allows curator role', async () => {
      const { jwtVerify } = await import('jose');
      jwtVerify.mockResolvedValue({ payload: { sub: 'sb-123' } });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        supabaseId: 'sb-123',
        banned: false,
        role: 'curator',
        vendor: null,
      });
      const fastify = Fastify();
      fastify.decorate('prisma', mockPrisma);
      const authPlugin = (await import('../../plugins/auth.js')).default;
      await fastify.register(authPlugin);
      fastify.get('/test-admin3', { preValidation: [fastify.authenticateAdmin] }, async () => ({
        ok: true,
      }));
      await fastify.ready();
      const res = await fastify.inject({
        method: 'GET',
        url: '/test-admin3',
        headers: { authorization: 'Bearer token' },
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('authenticateSuperAdmin', () => {
    it('denies curator', async () => {
      const { jwtVerify } = await import('jose');
      jwtVerify.mockResolvedValue({ payload: { sub: 'sb-123' } });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        supabaseId: 'sb-123',
        banned: false,
        role: 'curator',
        vendor: null,
      });
      const fastify = Fastify();
      fastify.decorate('prisma', mockPrisma);
      const authPlugin = (await import('../../plugins/auth.js')).default;
      await fastify.register(authPlugin);
      fastify.get('/test-super', { preValidation: [fastify.authenticateSuperAdmin] }, async () => ({
        ok: true,
      }));
      await fastify.ready();
      const res = await fastify.inject({
        method: 'GET',
        url: '/test-super',
        headers: { authorization: 'Bearer token' },
      });
      expect(res.statusCode).toBe(403);
      expect(res.json().error).toContain('Super Admin');
    });

    it('allows admin role', async () => {
      const { jwtVerify } = await import('jose');
      jwtVerify.mockResolvedValue({ payload: { sub: 'sb-123' } });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        supabaseId: 'sb-123',
        banned: false,
        role: 'admin',
        vendor: null,
      });
      const fastify = Fastify();
      fastify.decorate('prisma', mockPrisma);
      const authPlugin = (await import('../../plugins/auth.js')).default;
      await fastify.register(authPlugin);
      fastify.get(
        '/test-super2',
        { preValidation: [fastify.authenticateSuperAdmin] },
        async () => ({ ok: true }),
      );
      await fastify.ready();
      const res = await fastify.inject({
        method: 'GET',
        url: '/test-super2',
        headers: { authorization: 'Bearer token' },
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('authenticateVendor', () => {
    it('denies when no vendor profile', async () => {
      const { jwtVerify } = await import('jose');
      jwtVerify.mockResolvedValue({ payload: { sub: 'sb-123' } });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        supabaseId: 'sb-123',
        banned: false,
        role: 'user',
        vendor: null,
      });
      const fastify = Fastify();
      fastify.decorate('prisma', mockPrisma);
      const authPlugin = (await import('../../plugins/auth.js')).default;
      await fastify.register(authPlugin);
      fastify.get('/test-vendor', { preValidation: [fastify.authenticateVendor] }, async () => ({
        ok: true,
      }));
      await fastify.ready();
      const res = await fastify.inject({
        method: 'GET',
        url: '/test-vendor',
        headers: { authorization: 'Bearer token' },
      });
      expect(res.statusCode).toBe(403);
      expect(res.json().error).toContain('Vendor account required');
    });

    it('denies when vendor not approved', async () => {
      const { jwtVerify } = await import('jose');
      jwtVerify.mockResolvedValue({ payload: { sub: 'sb-123' } });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        supabaseId: 'sb-123',
        banned: false,
        role: 'user',
        vendor: { id: 'v1', status: 'PENDING' },
      });
      const fastify = Fastify();
      fastify.decorate('prisma', mockPrisma);
      const authPlugin = (await import('../../plugins/auth.js')).default;
      await fastify.register(authPlugin);
      fastify.get('/test-vendor2', { preValidation: [fastify.authenticateVendor] }, async () => ({
        ok: true,
      }));
      await fastify.ready();
      const res = await fastify.inject({
        method: 'GET',
        url: '/test-vendor2',
        headers: { authorization: 'Bearer token' },
      });
      expect(res.statusCode).toBe(403);
      expect(res.json().error).toContain('not approved');
    });

    it('allows approved vendor', async () => {
      const { jwtVerify } = await import('jose');
      jwtVerify.mockResolvedValue({ payload: { sub: 'sb-123' } });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        supabaseId: 'sb-123',
        banned: false,
        role: 'user',
        vendor: { id: 'v1', status: 'APPROVED' },
      });
      const fastify = Fastify();
      fastify.decorate('prisma', mockPrisma);
      const authPlugin = (await import('../../plugins/auth.js')).default;
      await fastify.register(authPlugin);
      fastify.get('/test-vendor3', { preValidation: [fastify.authenticateVendor] }, async () => ({
        ok: true,
      }));
      await fastify.ready();
      const res = await fastify.inject({
        method: 'GET',
        url: '/test-vendor3',
        headers: { authorization: 'Bearer token' },
      });
      expect(res.statusCode).toBe(200);
    });
  });
});
