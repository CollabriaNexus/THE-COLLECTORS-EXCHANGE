import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma Plugin for Fastify
 * @param {import('fastify').FastifyInstance} fastify
 * @param {Object} options
 */
async function prismaPlugin(fastify, options) {
    const prisma = new PrismaClient();

    await prisma.$connect();

    fastify.decorate('prisma', prisma);

    fastify.addHook('onClose', async (fastify) => {
        await fastify.prisma.$disconnect();
    });
}

export default fp(prismaPlugin);
