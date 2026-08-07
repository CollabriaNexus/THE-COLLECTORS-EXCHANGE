import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma Plugin for Fastify
 * In Lambda, we reuse the PrismaClient across warm invocations.
 * In standalone mode, we disconnect on server close.
 * @param {import('fastify').FastifyInstance} fastify
 * @param {Object} options
 */
async function prismaPlugin(fastify, options) {
  const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

  // Reuse existing client in Lambda (module-level caching)
  if (!globalThis.__prisma) {
    globalThis.__prisma = new PrismaClient({
      // Product.adminNotes holds admin-only free-text values for admin-defined
      // custom columns. Omit it globally so it can never leak through the
      // public catalogue, seller dashboards, cart/wishlist/order includes or
      // any product feed. Admin-only routes opt back in per query with
      // `omit: { adminNotes: false }`.
      omit: {
        product: { adminNotes: true },
      },
    });
  }
  const prisma = globalThis.__prisma;

  await prisma.$connect();

  fastify.decorate('prisma', prisma);

  if (!isLambda) {
    fastify.addHook('onClose', async (fastify) => {
      await fastify.prisma.$disconnect();
    });
  }
}

export default fp(prismaPlugin);
