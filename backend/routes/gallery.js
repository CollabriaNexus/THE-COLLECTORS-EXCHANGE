/**
 * Gallery Routes
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function galleryRoutes(fastify) {
    const { prisma } = fastify;

    // Get all gallery items
    fastify.get('/', async (request, reply) => {
        const items = await prisma.galleryItem.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return items;
    });

    // Get gallery item by ID
    fastify.get('/:id', async (request, reply) => {
        const { id } = request.params;
        const item = await prisma.galleryItem.findUnique({
            where: { id },
        });

        if (!item) {
            return reply.status(404).send({ error: 'Gallery item not found' });
        }

        return item;
    });
}
