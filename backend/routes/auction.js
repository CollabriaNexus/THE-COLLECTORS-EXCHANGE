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
        const where = {};
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
                product: { select: { id: true, title: true, image: true, category: true, description: true } },
                bids: {
                    orderBy: { amount: 'desc' },
                    include: { user: { select: { name: true } } },
                },
            },
        });

        if (!auction) {
            return reply.status(404).send({ error: 'Auction not found' });
        }

        return auction;
    });

    // Place a bid
    fastify.post('/:id/bid', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params;
        const { amount } = BidSchema.parse(request.body);
        const userId = request.dbUser.id;

        const auction = await prisma.auction.findUnique({ where: { id } });
        if (!auction) {
            return reply.status(404).send({ error: 'Auction not found' });
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

        const minBid = auction.currentBid || auction.startingBid;
        if (amount <= minBid) {
            return reply.status(400).send({
                error: 'Bid too low',
                message: `Bid must be greater than current bid of ₹${minBid}`,
            });
        }

        const [bid] = await Promise.all([
            prisma.auctionBid.create({
                data: { auctionId: id, userId, amount },
                include: { user: { select: { name: true } } },
            }),
            prisma.auction.update({
                where: { id },
                data: { currentBid: amount },
            }),
        ]);

        return bid;
    });
}