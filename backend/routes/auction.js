import { z } from 'zod';

const BidSchema = z.object({
  amount: z.number().positive(),
});

/**
 * Auction Routes
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function auctionRoutes(fastify) {
  const { prisma } = fastify;

  // Get all auctions
  fastify.get('/', async (request, reply) => {
    const { status } = request.query;
    // Auctions join Product, so an unfiltered listing exposes title/image/
    // category for products the storefront deliberately does not publish.
    // Gate on the same visibility rule the public catalogue uses.
    const where = { product: { isPublished: true, status: { in: ['Approved', 'Sold'] } } };
    if (status) where.status = status;

    const auctions = await prisma.auction.findMany({
      where,
      orderBy: { startDate: 'desc' },
      include: {
        product: { select: { id: true, title: true, image: true, category: true } },
        _count: { select: { bids: true } },
      },
    });
    return auctions;
  });

  // Get single auction
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params;
    const auction = await prisma.auction.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            image: true,
            category: true,
            description: true,
            status: true,
            isPublished: true,
          },
        },
        bids: {
          orderBy: { amount: 'desc' },
          include: { user: { select: { name: true } } },
        },
      },
    });

    // Same visibility rule as the listing above. 404 rather than 403: an
    // unpublished product's existence is not something to confirm to a caller.
    if (
      !auction ||
      !auction.product?.isPublished ||
      !['Approved', 'Sold'].includes(auction.product?.status)
    ) {
      return reply.status(404).send({ error: 'Auction not found' });
    }

    return auction;
  });

  // Place a bid
  fastify.post(
    '/:id/bid',
    { preValidation: [fastify.authenticate, fastify.requireDbUser] },
    async (request, reply) => {
      const { id } = request.params;
      const { amount } = BidSchema.parse(request.body);
      const userId = request.dbUser.id;

      const auction = await prisma.auction.findUnique({
        where: { id },
        include: { product: { select: { sellerId: true } } },
      });
      if (!auction) {
        return reply.status(404).send({ error: 'Auction not found' });
      }

      // A seller cannot bid on their own auctioned item (shill bidding).
      if (auction.product?.sellerId === userId) {
        return reply.status(422).send({ error: 'You cannot bid on your own auction' });
      }

      if (auction.status !== 'ACTIVE') {
        return reply.status(400).send({ error: 'Auction is not active' });
      }

      if (new Date() > new Date(auction.endDate)) {
        return reply.status(400).send({ error: 'Auction has ended' });
      }

      if (new Date() < new Date(auction.startDate)) {
        return reply.status(400).send({ error: 'Auction has not started' });
      }

      const bid = await prisma.$transaction(async (tx) => {
        const freshAuction = await tx.auction.findUnique({ where: { id } });
        const minBid = freshAuction.currentBid || freshAuction.startingBid;
        if (amount <= minBid) {
          return { error: `Bid must be greater than current bid of ₹${minBid}` };
        }

        // Atomically claim the higher bid: the update only succeeds if currentBid
        // is still what we validated against. Under concurrent bids the loser's
        // guarded update matches 0 rows, so it can't silently undercut the winner.
        const claim = await tx.auction.updateMany({
          where:
            freshAuction.currentBid === null
              ? { id, currentBid: null }
              : { id, currentBid: freshAuction.currentBid },
          data: { currentBid: amount },
        });
        if (claim.count === 0) {
          return { error: 'Another higher bid was just placed. Please try again.' };
        }

        const newBid = await tx.auctionBid.create({
          data: { auctionId: id, userId, amount },
          include: { user: { select: { name: true } } },
        });

        return newBid;
      });

      if (bid.error) {
        return reply.status(400).send({ error: bid.error });
      }

      return bid;
    },
  );
}
