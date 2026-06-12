export default async function contactRoutes(fastify) {
    const { prisma } = fastify;

    fastify.post('/', async (request, reply) => {
        const { name, email, subject, message } = request.body;

        if (!name || !email || !subject || !message) {
            return reply.status(400).send({ error: 'All fields are required' });
        }

        await prisma.contactMessage.create({
            data: { name, email, subject, message }
        });

        return { message: 'Thank you for reaching out. We will respond within 24-48 hours.' };
    });
}
