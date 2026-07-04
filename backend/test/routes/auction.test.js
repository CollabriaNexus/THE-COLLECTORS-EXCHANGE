import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';

function buildApp(mockPrisma) {
  const fastify = Fastify();
  fastify.decorate('prisma', mockPrisma);
  fastify.decorate('authenticate', async (req, reply) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return reply.status(401).send({ error: 'No token provided' });
    req.user = { sub: 'sb-123' };
    req.dbUser = { id: 'user-id', role: 'user' };
  });
  fastify.decorate('requireDbUser', async (req, reply) => {
    if (!req.dbUser) return reply.status(401).send({ error: 'User profile not synchronized' });
  });
  return fastify;
}

describe('auction routes', () => {
  let mockPrisma;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma = {
      auction: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      auctionBid: {
        create: vi.fn(),
      },
      $transaction: vi.fn(),
    };
  });

  function setupBidTransaction() {
    mockPrisma.$transaction.mockImplementation(async (cb) => {
      const tx = {
        auction: {
          findUnique: vi.fn().mockResolvedValue({ id: 'a1', currentBid: 100, startingBid: 50 }),
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
        auctionBid: {
          create: vi.fn().mockResolvedValue({ id: 'b1', amount: 150, user: { name: 'Bidder' } }),
        },
      };
      return cb(tx);
    });
  }

  describe('GET /', () => {
    it('returns all auctions', async () => {
      mockPrisma.auction.findMany.mockResolvedValue([
        { id: 'a1', product: {}, _count: { bids: 0 } },
      ]);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/auction.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'GET', url: '/' });
      expect(res.statusCode).toBe(200);
    });

    it('filters by status', async () => {
      mockPrisma.auction.findMany.mockResolvedValue([]);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/auction.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'GET', url: '/?status=ACTIVE' });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('GET /:id', () => {
    it('returns single auction', async () => {
      mockPrisma.auction.findUnique.mockResolvedValue({ id: 'a1', product: {}, bids: [] });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/auction.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'GET', url: '/a1' });
      expect(res.statusCode).toBe(200);
    });

    it('returns 404 when not found', async () => {
      mockPrisma.auction.findUnique.mockResolvedValue(null);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/auction.js')).default);
      await app.ready();
      const res = await app.inject({ method: 'GET', url: '/nonexistent' });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /:id/bid', () => {
    it('places a bid successfully', async () => {
      mockPrisma.auction.findUnique.mockResolvedValue({
        id: 'a1',
        status: 'ACTIVE',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2099-12-31'),
        currentBid: 100,
        startingBid: 50,
      });
      setupBidTransaction();
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/auction.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/a1/bid',
        payload: { amount: 150 },
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().amount).toBe(150);
    });

    it('returns 404 when auction not found', async () => {
      mockPrisma.auction.findUnique.mockResolvedValue(null);
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/auction.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/nonexistent/bid',
        payload: { amount: 150 },
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(404);
    });

    it('rejects a seller bidding on their own auction', async () => {
      mockPrisma.auction.findUnique.mockResolvedValue({
        id: 'a1',
        status: 'ACTIVE',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2099-12-31'),
        currentBid: 100,
        startingBid: 50,
        product: { sellerId: 'user-id' },
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/auction.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/a1/bid',
        payload: { amount: 150 },
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(422);
    });

    it('rejects a bid that lost the atomic claim (concurrent higher bid)', async () => {
      mockPrisma.auction.findUnique.mockResolvedValue({
        id: 'a1',
        status: 'ACTIVE',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2099-12-31'),
        currentBid: 100,
        startingBid: 50,
      });
      mockPrisma.$transaction.mockImplementation(async (cb) => {
        const tx = {
          auction: {
            findUnique: vi.fn().mockResolvedValue({ id: 'a1', currentBid: 100, startingBid: 50 }),
            updateMany: vi.fn().mockResolvedValue({ count: 0 }), // another bid moved currentBid
          },
          auctionBid: { create: vi.fn() },
        };
        return cb(tx);
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/auction.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/a1/bid',
        payload: { amount: 150 },
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(400);
    });

    it('returns 400 when auction not active', async () => {
      mockPrisma.auction.findUnique.mockResolvedValue({ id: 'a1', status: 'ENDED' });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/auction.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/a1/bid',
        payload: { amount: 150 },
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(400);
    });

    it('returns 400 when auction has ended', async () => {
      mockPrisma.auction.findUnique.mockResolvedValue({
        id: 'a1',
        status: 'ACTIVE',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2020-06-01'),
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/auction.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/a1/bid',
        payload: { amount: 150 },
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(400);
    });

    it('returns 400 when auction has not started', async () => {
      mockPrisma.auction.findUnique.mockResolvedValue({
        id: 'a1',
        status: 'ACTIVE',
        startDate: new Date('2099-01-01'),
        endDate: new Date('2099-12-31'),
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/auction.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/a1/bid',
        payload: { amount: 150 },
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(400);
    });

    it('returns 400 when bid too low', async () => {
      mockPrisma.auction.findUnique.mockResolvedValue({
        id: 'a1',
        status: 'ACTIVE',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2099-12-31'),
        currentBid: 100,
        startingBid: 50,
      });
      mockPrisma.$transaction.mockImplementation(async (cb) => {
        const tx = {
          auction: {
            findUnique: vi.fn().mockResolvedValue({ id: 'a1', currentBid: 100, startingBid: 50 }),
          },
          auctionBid: { create: vi.fn() },
        };
        return cb(tx);
      });
      const app = buildApp(mockPrisma);
      await app.register((await import('../../routes/auction.js')).default);
      await app.ready();
      const res = await app.inject({
        method: 'POST',
        url: '/a1/bid',
        payload: { amount: 50 },
        headers: { authorization: 'Bearer user' },
      });
      expect(res.statusCode).toBe(400);
    });
  });
});
