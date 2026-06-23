import { z } from 'zod';

export default async function testimonialsRoutes(fastify) {
    const { prisma } = fastify;
    // Public: get approved testimonials
    fastify.get('/', async (request, reply) => {
        try {
            const testimonials = await prisma.testimonial.findMany({
                where: { status: 'APPROVED' },
                orderBy: { createdAt: 'desc' },
            });
            return testimonials;
        } catch (err) {
            request.log.error({ prismaError: err.message, stack: err.stack }, 'Testimonials query failed');
            return reply.status(500).send({ error: err.message });
        }
    });

    // Authenticated user: submit a testimonial (must have purchased something)
    fastify.post('/', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { authorName, content, rating, images } = request.body;
        const userId = request.dbUser.id;

        if (!content || content.trim().length < 10) {
            return reply.status(400).send({ error: 'Testimonial must be at least 10 characters' });
        }
        if (rating && (rating < 1 || rating > 5)) {
            return reply.status(400).send({ error: 'Rating must be between 1 and 5' });
        }

        // Verify user has at least one paid order
        const paidOrder = await prisma.order.findFirst({
            where: { userId, paymentStatus: 'Paid' },
            select: { id: true },
        });
        if (!paidOrder) {
            return reply.status(403).send({ error: 'Only verified purchasers can submit testimonials' });
        }

        const testimonial = await prisma.testimonial.create({
            data: {
                userId,
                authorName: authorName || request.dbUser.name || 'Anonymous',
                content: content.trim(),
                rating: rating || 5,
                images: images || [],
                status: 'PENDING',
            },
        });

        return testimonial;
    });

    // Admin routes
    // Get all testimonials (for admin panel)
    fastify.get('/all', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        if (request.dbUser.role !== 'admin' && request.dbUser.role !== 'curator') {
            return reply.status(403).send({ error: 'Admin only' });
        }
        const { status } = request.query;
        const where = status ? { status } : {};
        const testimonials = await prisma.testimonial.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        return testimonials;
    });

    // Approve testimonial
    fastify.patch('/:id/approve', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        if (request.dbUser.role !== 'admin' && request.dbUser.role !== 'curator') {
            return reply.status(403).send({ error: 'Admin only' });
        }
        const { id } = request.params;
        const updated = await prisma.testimonial.update({ where: { id }, data: { status: 'APPROVED' } });
        return updated;
    });

    // Reject testimonial
    fastify.patch('/:id/reject', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        if (request.dbUser.role !== 'admin' && request.dbUser.role !== 'curator') {
            return reply.status(403).send({ error: 'Admin only' });
        }
        const { id } = request.params;
        const updated = await prisma.testimonial.update({ where: { id }, data: { status: 'REJECTED' } });
        return updated;
    });

    // Delete testimonial
    fastify.delete('/:id', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        if (request.dbUser.role !== 'admin' && request.dbUser.role !== 'curator') {
            return reply.status(403).send({ error: 'Admin only' });
        }
        const { id } = request.params;
        await prisma.testimonial.delete({ where: { id } });
        return { message: 'Deleted' };
    });
};
