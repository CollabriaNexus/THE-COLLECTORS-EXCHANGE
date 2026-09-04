import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import { ZodError } from 'zod';

const mockCreateSignedUrl = vi.fn();
const mockFrom = vi.fn(() => ({ createSignedUrl: mockCreateSignedUrl }));

// The route imports the service-role client at module load; lib/supabase.js
// would otherwise throw on a missing SUPABASE_URL in the test environment.
vi.mock('../../lib/supabase.js', () => ({
  supabaseAdmin: { storage: { from: (...args) => mockFrom(...args) } },
  supabaseAnon: {},
}));

function buildApp(mockPrisma) {
  const fastify = Fastify();
  fastify.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Request validation failed',
        issues: error.issues,
      });
    }
    reply.status(error.statusCode || 500).send({ error: error.message });
  });
  fastify.decorate('prisma', mockPrisma);
  fastify.decorate('authenticate', async (req, reply) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return reply.status(401).send({ error: 'No token provided' });
    req.user = { sub: 'sb-admin' };
    req.dbUser =
      token === 'admin'
        ? { id: 'admin-id', role: 'admin' }
        : token === 'curator'
          ? { id: 'curator-id', role: 'curator' }
          : { id: 'user-id', role: 'user' };
  });
  fastify.decorate('authenticateAdmin', async (req, reply) => {
    await fastify.authenticate(req, reply);
    if (reply.sent) return;
    if (!req.dbUser || (req.dbUser.role !== 'admin' && req.dbUser.role !== 'curator')) {
      return reply.status(403).send({ error: 'Access denied: Admin or Curator role required' });
    }
  });
  return fastify;
}

const HOST = 'https://rvamybeqoyznlgzglqqx.supabase.co';

// Current shape: user-scoped path written by uploadKycDocument().
const CURRENT_PATH = 'kyc/sb-user-1/9f0c2c4e-0d0a-4c3d-9d6b-1f2a3b4c5d6e.pdf';
// Legacy shape: a public URL whose object key carries NO user id at all.
const LEGACY_PATH = 'kyc/aadhaar-1756543210987-k3j9xq.jpg';
const LEGACY_URL = `${HOST}/storage/v1/object/public/kyc-documents/${LEGACY_PATH}`;
const LEGACY_RENDER_PATH = 'kyc/pan-1756543299111-zz12ab.png';
const LEGACY_RENDER_URL = `${HOST}/storage/v1/render/image/public/kyc-documents/${LEGACY_RENDER_PATH}?width=400`;

const TARGET_USER = {
  id: 'db-user-1',
  supabaseId: 'sb-user-1',
  kycData: {
    aadhaarDoc: LEGACY_URL,
    panDoc: LEGACY_RENDER_URL,
    gstDoc: CURRENT_PATH,
    companyName: 'My Store',
  },
};

async function buildRoutes(mockPrisma) {
  const app = buildApp(mockPrisma);
  const adminKycRoutes = (await import('../../routes/adminKyc.js')).default;
  await app.register(adminKycRoutes, { prefix: '/api/admin' });
  await app.ready();
  return app;
}

function url(userId, path) {
  return `/api/admin/kyc/${userId}/signed-url?path=${encodeURIComponent(path)}`;
}

describe('admin KYC signed-url route', () => {
  let mockPrisma;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma = { user: { findUnique: vi.fn() } };
    mockFrom.mockReturnValue({ createSignedUrl: mockCreateSignedUrl });
  });

  describe('access control', () => {
    it('returns 401 without a token', async () => {
      const app = await buildRoutes(mockPrisma);
      const res = await app.inject({ method: 'GET', url: url('db-user-1', CURRENT_PATH) });
      expect(res.statusCode).toBe(401);
      expect(mockCreateSignedUrl).not.toHaveBeenCalled();
    });

    it('returns 403 for a non-admin', async () => {
      const app = await buildRoutes(mockPrisma);
      const res = await app.inject({
        method: 'GET',
        url: url('db-user-1', CURRENT_PATH),
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(403);
      expect(mockCreateSignedUrl).not.toHaveBeenCalled();
    });

    it('allows a curator', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(TARGET_USER);
      mockCreateSignedUrl.mockResolvedValue({ data: { signedUrl: 'https://s/x' }, error: null });
      const app = await buildRoutes(mockPrisma);
      const res = await app.inject({
        method: 'GET',
        url: url('db-user-1', CURRENT_PATH),
        headers: { authorization: 'Bearer curator' },
      });
      expect(res.statusCode).toBe(200);
    });

    it('returns 404 when the user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const app = await buildRoutes(mockPrisma);
      const res = await app.inject({
        method: 'GET',
        url: url('nope', 'kyc/nope/doc.pdf'),
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(404);
      expect(mockCreateSignedUrl).not.toHaveBeenCalled();
    });
  });

  describe('signing a current, user-scoped reference', () => {
    it('signs it and returns url + a short expiresAt', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(TARGET_USER);
      mockCreateSignedUrl.mockResolvedValue({
        data: { signedUrl: 'https://storage.example/signed?token=abc' },
        error: null,
      });

      const app = await buildRoutes(mockPrisma);
      const res = await app.inject({
        method: 'GET',
        url: url('db-user-1', CURRENT_PATH),
        headers: { authorization: 'Bearer admin' },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.url).toBe('https://storage.example/signed?token=abc');
      expect(Number.isNaN(Date.parse(body.expiresAt))).toBe(false);
      expect(Date.parse(body.expiresAt) - Date.now()).toBeLessThanOrEqual(5 * 60 * 1000);
      expect(mockFrom).toHaveBeenCalledWith('kyc-documents');
      expect(mockCreateSignedUrl).toHaveBeenCalledWith(CURRENT_PATH, 120);
    });

    it('reads kycData so the allowlist can be built', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(TARGET_USER);
      mockCreateSignedUrl.mockResolvedValue({ data: { signedUrl: 'https://s/x' }, error: null });
      const app = await buildRoutes(mockPrisma);
      await app.inject({
        method: 'GET',
        url: url('db-user-1', CURRENT_PATH),
        headers: { authorization: 'Bearer admin' },
      });
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'db-user-1' },
        select: { id: true, supabaseId: true, kycData: true },
      });
    });
  });

  describe('signing a legacy reference (no user id in the object path)', () => {
    it('signs the path extracted from a legacy public URL', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(TARGET_USER);
      mockCreateSignedUrl.mockResolvedValue({
        data: { signedUrl: 'https://s/legacy' },
        error: null,
      });
      const app = await buildRoutes(mockPrisma);
      const res = await app.inject({
        method: 'GET',
        url: url('db-user-1', LEGACY_PATH),
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().url).toBe('https://s/legacy');
      expect(mockCreateSignedUrl).toHaveBeenCalledWith(LEGACY_PATH, 120);
    });

    it('signs the path extracted from a legacy render/image URL', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(TARGET_USER);
      mockCreateSignedUrl.mockResolvedValue({
        data: { signedUrl: 'https://s/render' },
        error: null,
      });
      const app = await buildRoutes(mockPrisma);
      const res = await app.inject({
        method: 'GET',
        url: url('db-user-1', LEGACY_RENDER_PATH),
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
      expect(mockCreateSignedUrl).toHaveBeenCalledWith(LEGACY_RENDER_PATH, 120);
    });

    it("refuses a legacy path stored on a DIFFERENT user's record", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(TARGET_USER);
      const app = await buildRoutes(mockPrisma);
      const res = await app.inject({
        method: 'GET',
        url: url('db-user-1', 'kyc/aadhaar-1700000000000-someoneelse.jpg'),
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(403);
      expect(mockCreateSignedUrl).not.toHaveBeenCalled();
    });
  });

  describe('authorisation gate 1 - stored-value allowlist', () => {
    it('refuses a path this user record does not reference, even in their own folder', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(TARGET_USER);
      const app = await buildRoutes(mockPrisma);
      const res = await app.inject({
        method: 'GET',
        url: url('db-user-1', 'kyc/sb-user-1/not-referenced.pdf'),
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(403);
      expect(mockCreateSignedUrl).not.toHaveBeenCalled();
    });

    it("refuses another user's document", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(TARGET_USER);
      const app = await buildRoutes(mockPrisma);
      const res = await app.inject({
        method: 'GET',
        url: url('db-user-1', 'kyc/sb-user-2/secret.pdf'),
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(403);
      expect(mockCreateSignedUrl).not.toHaveBeenCalled();
    });

    it('refuses when the user has no kycData at all', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'db-user-1',
        supabaseId: 'sb-user-1',
        kycData: null,
      });
      const app = await buildRoutes(mockPrisma);
      const res = await app.inject({
        method: 'GET',
        url: url('db-user-1', CURRENT_PATH),
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(403);
      expect(mockCreateSignedUrl).not.toHaveBeenCalled();
    });

    it('does not treat a free-text kycData field as a document reference', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'db-user-1',
        supabaseId: 'sb-user-1',
        kycData: { companyName: 'kyc-documents' },
      });
      const app = await buildRoutes(mockPrisma);
      const res = await app.inject({
        method: 'GET',
        url: url('db-user-1', 'kyc/anything.pdf'),
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(403);
      expect(mockCreateSignedUrl).not.toHaveBeenCalled();
    });
  });

  describe('authorisation gate 2 - folder ownership (defence in depth)', () => {
    it("refuses a planted path scoped to another user's folder even though it is stored", async () => {
      // A hostile user CAN write whatever they like into their own kycData, so
      // the allowlist alone would accept this. The folder check rejects it.
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'db-user-1',
        supabaseId: 'sb-user-1',
        kycData: { aadhaarDoc: 'kyc/sb-victim/private.pdf' },
      });
      const app = await buildRoutes(mockPrisma);
      const res = await app.inject({
        method: 'GET',
        url: url('db-user-1', 'kyc/sb-victim/private.pdf'),
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(403);
      expect(mockCreateSignedUrl).not.toHaveBeenCalled();
    });

    it('accepts a folder scoped by the DB user id as well as the supabase id', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'db-user-1',
        supabaseId: 'sb-user-1',
        kycData: { aadhaarDoc: 'kyc/db-user-1/doc.pdf' },
      });
      mockCreateSignedUrl.mockResolvedValue({ data: { signedUrl: 'https://s/x' }, error: null });
      const app = await buildRoutes(mockPrisma);
      const res = await app.inject({
        method: 'GET',
        url: url('db-user-1', 'kyc/db-user-1/doc.pdf'),
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('path shape validation', () => {
    it('rejects a traversal path', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(TARGET_USER);
      const app = await buildRoutes(mockPrisma);
      const res = await app.inject({
        method: 'GET',
        url: url('db-user-1', 'kyc/sb-user-1/../sb-user-2/secret.pdf'),
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(400);
      expect(mockCreateSignedUrl).not.toHaveBeenCalled();
    });

    it('rejects an absolute URL as the path', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(TARGET_USER);
      const app = await buildRoutes(mockPrisma);
      const res = await app.inject({
        method: 'GET',
        url: url('db-user-1', LEGACY_URL),
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(400);
      expect(mockCreateSignedUrl).not.toHaveBeenCalled();
    });

    it('rejects a path outside the kyc/ namespace', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(TARGET_USER);
      const app = await buildRoutes(mockPrisma);
      const res = await app.inject({
        method: 'GET',
        url: url('db-user-1', 'other/sb-user-1/secret.pdf'),
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(400);
      expect(mockCreateSignedUrl).not.toHaveBeenCalled();
    });

    it('rejects a missing path', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(TARGET_USER);
      const app = await buildRoutes(mockPrisma);
      const res = await app.inject({
        method: 'GET',
        url: '/api/admin/kyc/db-user-1/signed-url',
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(400);
      expect(mockCreateSignedUrl).not.toHaveBeenCalled();
    });
  });

  describe('failure handling', () => {
    it('returns 502 when Supabase fails to sign, without echoing its error', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(TARGET_USER);
      mockCreateSignedUrl.mockResolvedValue({ data: null, error: { message: 'Object not found' } });
      const app = await buildRoutes(mockPrisma);
      const res = await app.inject({
        method: 'GET',
        url: url('db-user-1', CURRENT_PATH),
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(502);
      expect(res.json().error).toBe('Could not generate document link');
      expect(res.body).not.toContain('Object not found');
    });

    it('never echoes the rejected path back to the client', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(TARGET_USER);
      const app = await buildRoutes(mockPrisma);
      const res = await app.inject({
        method: 'GET',
        url: url('db-user-1', 'kyc/sb-user-9/doc.pdf'),
        headers: { authorization: 'Bearer admin' },
      });
      expect(res.statusCode).toBe(403);
      expect(res.body).not.toContain('sb-user-9');
    });
  });
});
