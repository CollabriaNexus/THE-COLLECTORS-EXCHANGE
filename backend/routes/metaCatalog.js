import { syncProductToMeta } from '../lib/metaCatalog.js';

/**
 * Register Meta Catalog admin routes.
 *
 * @param {import('fastify').FastifyInstance} fastify Fastify instance.
 * @returns {Promise<void>}
 */
export default async function metaCatalogRoutes(fastify) {
  const { prisma } = fastify;

  fastify.post(
    '/products/sync-to-meta',
    { preValidation: [fastify.authenticateSuperAdmin] },
    async (request, reply) => {
      const baseUrl = process.env.FRONTEND_URL || 'https://thecollectorsexchange.in';

      const [live, reconcile] = await Promise.all([
        prisma.product.findMany({ where: { status: 'Approved', isPublished: true } }),
        prisma.product.findMany({
          where: { OR: [{ status: 'Sold' }, { status: 'Approved', isPublished: false }] },
        }),
      ]);

      if (live.length === 0 && reconcile.length === 0) {
        return { synced: 0, errors: [], message: 'No products to sync.' };
      }

      const results = { synced: 0, errors: [] };
      for (const product of [...live, ...reconcile]) {
        try {
          await syncProductToMeta(product, baseUrl);
          results.synced++;
        } catch (err) {
          results.errors.push({ id: product.id, title: product.title, error: err.message });
        }
      }

      return {
        message: `Synced ${results.synced}, ${results.errors.length} failed`,
        results,
      };
    },
  );

  fastify.post(
    '/products/:id/sync-to-meta',
    { preValidation: [fastify.authenticateSuperAdmin] },
    async (request, reply) => {
      const { id } = request.params;
      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) {
        return reply.status(404).send({ error: 'Product not found' });
      }

      const baseUrl = process.env.FRONTEND_URL || 'https://thecollectorsexchange.in';
      try {
        await syncProductToMeta(product, baseUrl);
        return {
          message: `"${product.title}" synced to Meta Catalog`,
          product: { id: product.id, title: product.title },
        };
      } catch (err) {
        return reply
          .status(err.status || 500)
          .send({ error: 'Sync failed', detail: err.raw?.message || err.message });
      }
    },
  );
}
