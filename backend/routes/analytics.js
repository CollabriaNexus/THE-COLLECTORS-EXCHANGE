export default async function analyticsRoutes(fastify) {
    const { prisma } = fastify;

    fastify.post('/view', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { productId, sessionId } = request.body;
        const dbUser = request.dbUser || null;

        if (!productId) {
            return reply.status(400).send({ error: 'productId is required' });
        }

        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return reply.status(404).send({ error: 'Product not found' });
        }

        await prisma.productView.create({
            data: {
                productId,
                userId: dbUser?.id || null,
                sessionId: sessionId || null,
            }
        });

        return { success: true };
    });

    fastify.post('/cart', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const dbUser = request.dbUser;
        const { productId, action } = request.body;

        if (!productId || !action) {
            return reply.status(400).send({ error: 'productId and action are required' });
        }

        if (!['ADD', 'REMOVE'].includes(action)) {
            return reply.status(400).send({ error: 'action must be ADD or REMOVE' });
        }

        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return reply.status(404).send({ error: 'Product not found' });
        }

        await prisma.cartEvent.create({
            data: {
                productId,
                userId: dbUser.id,
                action,
            }
        });

        return { success: true };
    });

    fastify.post('/checkout', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const dbUser = request.dbUser;
        const { productId, orderId } = request.body;

        if (!productId) {
            return reply.status(400).send({ error: 'productId is required' });
        }

        await prisma.checkoutEvent.create({
            data: {
                productId,
                userId: dbUser.id,
                orderId: orderId || null,
            }
        });

        return { success: true };
    });
}
