import { z } from 'zod';

const GallerySchema = z.object({
    title: z.string().min(1),
    teaser: z.string().min(1),
    description: z.string().min(1),
    images: z.array(z.string()).optional().default([]),
    origin: z.string().min(1),
    timePeriod: z.string().min(1),
    institution: z.string().min(1),
    significance: z.string().min(1),
    theme: z.string().min(1),
});

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

    // Create gallery item (admin only)
    fastify.post('/', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        if (request.dbUser.role !== 'admin') {
            return reply.status(403).send({ error: 'Forbidden' });
        }

        const data = GallerySchema.parse(request.body);
        const item = await prisma.galleryItem.create({ data });
        return reply.status(201).send(item);
    });

    // Update gallery item (admin only)
    fastify.put('/:id', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        if (request.dbUser.role !== 'admin') {
            return reply.status(403).send({ error: 'Forbidden' });
        }

        const { id } = request.params;
        const data = GallerySchema.partial().parse(request.body);

        const existing = await prisma.galleryItem.findUnique({ where: { id } });
        if (!existing) {
            return reply.status(404).send({ error: 'Gallery item not found' });
        }

        const item = await prisma.galleryItem.update({ where: { id }, data });
        return item;
    });

    // Delete gallery item (admin only)
    fastify.delete('/:id', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        if (request.dbUser.role !== 'admin') {
            return reply.status(403).send({ error: 'Forbidden' });
        }

        const { id } = request.params;
        const existing = await prisma.galleryItem.findUnique({ where: { id } });
        if (!existing) {
            return reply.status(404).send({ error: 'Gallery item not found' });
        }

        await prisma.galleryItem.delete({ where: { id } });
        return reply.status(204).send();
    });
}
