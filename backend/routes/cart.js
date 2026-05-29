/**
 * Cart Routes
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function cartRoutes(fastify) {
    const { prisma } = fastify;

    // Get user cart
    fastify.get('/:userId', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { userId } = request.params;
        
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user || user.supabaseId !== request.user.sub) {
            return reply.status(403).send({ error: 'Forbidden', message: 'You do not have permission to access this resource' });
        }

        const cart = await prisma.cartItem.findMany({
            where: { userId },
            include: { product: true },
        });
        return cart;
    });

    // Add to cart
    fastify.post('/', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { userId, productId } = request.body;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user || user.supabaseId !== request.user.sub) {
            return reply.status(403).send({ error: 'Forbidden', message: 'You do not have permission to access this resource' });
        }

        const cartItem = await prisma.cartItem.upsert({
            where: {
                userId_productId: { userId, productId },
            },
            update: {},
            create: { userId, productId },
        });
        return reply.status(201).send(cartItem);
    });

    // Remove from cart
    fastify.delete('/', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { userId, productId } = request.body;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user || user.supabaseId !== request.user.sub) {
            return reply.status(403).send({ error: 'Forbidden', message: 'You do not have permission to access this resource' });
        }

        await prisma.cartItem.delete({
            where: {
                userId_productId: { userId, productId },
            },
        });
        return reply.status(204).send();
    });
}

