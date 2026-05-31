/**
 * Wishlist Routes
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function wishlistRoutes(fastify) {
    const { prisma } = fastify;

    // Get user wishlist
    fastify.get('/:userId', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { userId } = request.params;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user || user.supabaseId !== request.user.sub) {
            return reply.status(403).send({ error: 'You do not have permission to access this resource' });
        }

        const wishlist = await prisma.wishlistItem.findMany({
            where: { userId },
            include: { product: true },
        });
        return wishlist;
    });

    // Add to wishlist
    fastify.post('/', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { userId, productId } = request.body;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user || user.supabaseId !== request.user.sub) {
            return reply.status(403).send({ error: 'You do not have permission to access this resource' });
        }

        const wishlistItem = await prisma.wishlistItem.upsert({
            where: {
                userId_productId: { userId, productId },
            },
            update: {},
            create: { userId, productId },
        });
        return reply.status(201).send(wishlistItem);
    });

    // Remove from wishlist
    fastify.delete('/', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { userId, productId } = request.body;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user || user.supabaseId !== request.user.sub) {
            return reply.status(403).send({ error: 'You do not have permission to access this resource' });
        }

        await prisma.wishlistItem.delete({
            where: {
                userId_productId: { userId, productId },
            },
        });
        return reply.status(204).send();
    });
}

