/**
 * Cart Routes
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function cartRoutes(fastify) {
    const { prisma } = fastify;

    // Get user cart
    fastify.get('/:userId', async (request, reply) => {
        const { userId } = request.params;
        const cart = await prisma.cartItem.findMany({
            where: { userId },
            include: { product: true },
        });
        return cart;
    });

    // Add to cart
    fastify.post('/', async (request, reply) => {
        const { userId, productId } = request.body;
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
    fastify.delete('/', async (request, reply) => {
        const { userId, productId } = request.body;
        await prisma.cartItem.delete({
            where: {
                userId_productId: { userId, productId },
            },
        });
        return reply.status(204).send();
    });
}
