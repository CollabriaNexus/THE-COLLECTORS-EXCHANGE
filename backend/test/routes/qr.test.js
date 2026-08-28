import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import { ZodError } from 'zod';

const FALLBACK = 'https://thecollectorsexchange.in';

function buildApp(mockPrisma) {
  const fastify = Fastify();
  fastify.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: 'Validation Error' });
    }
    reply.status(error.statusCode || 500).send({ error: error.message });
  });
  fastify.decorate('prisma', mockPrisma);
  fastify.decorate('authenticate', async (req) => {
    req.dbUser = { id: 'admin-id', role: 'admin' };
  });
  fastify.decorate('authenticateAdmin', async () => {});
  return fastify;
}

describe('public QR redirect routes', () => {
  let mockPrisma;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no network in tests')));
    mockPrisma = {
      qrCode: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        findMany: vi.fn(),
      },
      qrScan: { create: vi.fn().mockResolvedValue({}) },
      $queryRaw: vi.fn(),
    };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const loadRoutes = async () => {
    const app = buildApp(mockPrisma);
    await app.register((await import('../../routes/qr.js')).default);
    await app.ready();
    return app;
  };

  it('redirects to the configured target URL and records the scan', async () => {
    mockPrisma.qrCode.findUnique.mockResolvedValue({
      id: 'qr1',
      slug: 'poster',
      targetUrl: 'https://thecollectorsexchange.in/exchange',
      active: true,
    });
    const app = await loadRoutes();
    const res = await app.inject({
      method: 'GET',
      url: '/poster',
      headers: {
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/605.1.15',
      },
    });
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('https://thecollectorsexchange.in/exchange');
    expect(mockPrisma.qrScan.create).toHaveBeenCalledTimes(1);
    const data = mockPrisma.qrScan.create.mock.calls[0][0].data;
    expect(data.qrCodeId).toBe('qr1');
    expect(data.deviceType).toBe('mobile');
    expect(data.os).toContain('iOS');
  });

  it('issues a visitor cookie on first scan and reuses it later', async () => {
    mockPrisma.qrCode.findUnique.mockResolvedValue({
      id: 'qr1',
      slug: 'poster',
      targetUrl: FALLBACK,
      active: true,
    });
    const app = await loadRoutes();
    const first = await app.inject({ method: 'GET', url: '/poster' });
    expect(first.headers['set-cookie']).toContain('tce_qid=');

    const cookie = first.cookies[0];
    mockPrisma.qrScan.create.mockClear();
    await app.inject({
      method: 'GET',
      url: '/poster',
      cookies: { [cookie.name]: cookie.value },
    });
    expect(mockPrisma.qrScan.create.mock.calls[0][0].data.visitorId).toBe(cookie.value);
  });

  it('falls back to the site for unknown or inactive slugs without recording', async () => {
    mockPrisma.qrCode.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'qr2',
        slug: 'old',
        targetUrl: 'https://example.com',
        active: false,
      });
    const app = await loadRoutes();

    const missing = await app.inject({ method: 'GET', url: '/ghost' });
    expect(missing.statusCode).toBe(302);
    expect(missing.headers.location).toBe(FALLBACK);

    const inactive = await app.inject({ method: 'GET', url: '/old' });
    expect(inactive.statusCode).toBe(302);
    expect(inactive.headers.location).toBe(FALLBACK);

    expect(mockPrisma.qrScan.create).not.toHaveBeenCalled();
  });

  it('still redirects when the scan insert fails', async () => {
    mockPrisma.qrCode.findUnique.mockResolvedValue({
      id: 'qr1',
      slug: 'poster',
      targetUrl: FALLBACK,
      active: true,
    });
    mockPrisma.qrScan.create.mockRejectedValue(new Error('db down'));
    const app = await loadRoutes();
    const res = await app.inject({ method: 'GET', url: '/poster' });
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe(FALLBACK);
  });
});

describe('admin QR management + stats routes', () => {
  let mockPrisma;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma = {
      qrCode: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      qrScan: { create: vi.fn() },
      $queryRaw: vi.fn().mockResolvedValue([]),
    };
  });

  const loadRoutes = async () => {
    const app = buildApp(mockPrisma);
    await app.register((await import('../../routes/qrAdmin.js')).default);
    await app.ready();
    return app;
  };

  it('lists codes with lifetime scan aggregates merged in', async () => {
    mockPrisma.qrCode.findMany.mockResolvedValue([
      { id: 'a', title: 'Poster A', slug: 'poster-a', totalScans: undefined },
      { id: 'b', title: 'Poster B', slug: 'poster-b' },
    ]);
    mockPrisma.$queryRaw.mockResolvedValue([
      { qrCodeId: 'b', totalScans: 7, lastScanAt: new Date('2026-08-20') },
    ]);
    const app = await loadRoutes();
    const res = await app.inject({
      method: 'GET',
      url: '/codes',
      headers: { authorization: 'Bearer admin' },
    });
    const body = res.json();
    expect(res.statusCode).toBe(200);
    expect(body.data[0].totalScans).toBe(0);
    expect(body.data[1].totalScans).toBe(7);
    expect(body.data[1].lastScanAt).toBeTruthy();
  });

  it('creates a code with a generated slug', async () => {
    mockPrisma.qrCode.create.mockImplementation(async ({ data }) => ({ id: 'new', ...data }));
    const app = await loadRoutes();
    const res = await app.inject({
      method: 'POST',
      url: '/codes',
      headers: { authorization: 'Bearer admin' },
      payload: { title: 'Mumbai Expo Poster', targetUrl: 'https://thecollectorsexchange.in' },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().data.slug).toBe('mumbai-expo-poster');
  });

  it('rejects invalid create payloads', async () => {
    const app = await loadRoutes();
    const res = await app.inject({
      method: 'POST',
      url: '/codes',
      headers: { authorization: 'Bearer admin' },
      payload: { title: '', targetUrl: 'not-a-url' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('updates a code and maps unique-slug conflicts to 409', async () => {
    const Prisma = (await import('@prisma/client')).Prisma;
    mockPrisma.qrCode.update
      .mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('dup', { code: 'P2002', clientVersion: 'test' }),
      )
      .mockResolvedValueOnce({ id: 'a', title: 'Updated' });
    const app = await loadRoutes();

    const conflict = await app.inject({
      method: 'PATCH',
      url: '/codes/a',
      headers: { authorization: 'Bearer admin' },
      payload: { slug: 'taken' },
    });
    expect(conflict.statusCode).toBe(409);

    const ok = await app.inject({
      method: 'PATCH',
      url: '/codes/a',
      headers: { authorization: 'Bearer admin' },
      payload: { title: 'Updated' },
    });
    expect(ok.statusCode).toBe(200);
    expect(ok.json().data.title).toBe('Updated');
  });

  it('returns stats from aggregate queries', async () => {
    mockPrisma.$queryRaw
      .mockResolvedValueOnce([{ total: 20, uniqueDevices: 16, totalUsers: 12 }])
      .mockResolvedValue([]);
    const app = await loadRoutes();
    const res = await app.inject({
      method: 'GET',
      url: '/stats?from=2026-08-16&to=2026-08-23',
      headers: { authorization: 'Bearer admin' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.totals.total).toBe(20);
    expect(body.totals.uniqueDevices).toBe(16);
    expect(Array.isArray(body.timeline)).toBe(true);
    expect(Array.isArray(body.locations)).toBe(true);
  });

  it('exposes distinct filter values', async () => {
    mockPrisma.$queryRaw
      .mockResolvedValueOnce([{ value: 'India' }])
      .mockResolvedValueOnce([{ value: 'Bengaluru' }])
      .mockResolvedValueOnce([{ value: 'mobile' }])
      .mockResolvedValueOnce([{ value: 'Android 14' }]);
    const app = await loadRoutes();
    const res = await app.inject({
      method: 'GET',
      url: '/filters',
      headers: { authorization: 'Bearer admin' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      countries: ['India'],
      cities: ['Bengaluru'],
      deviceTypes: ['mobile'],
      operatingSystems: ['Android 14'],
    });
  });
});
