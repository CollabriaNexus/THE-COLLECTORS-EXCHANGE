import {
  deleteProduct,
  ensureDeveloperRegistration,
  findOrCreateDataSource,
  insertProduct,
} from '../lib/googleMerchant.js';

const DEFAULT_RECONCILIATION_LIMIT = 10;
const MAX_RECONCILIATION_LIMIT = 50;

/**
 * Parse and cap the optional reconciliation batch limit.
 *
 * @param {unknown} value Query-string limit.
 * @returns {number} Safe reconciliation batch size.
 */
function getReconciliationLimit(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return DEFAULT_RECONCILIATION_LIMIT;
  return Math.min(parsed, MAX_RECONCILIATION_LIMIT);
}

/**
 * Normalize the optional product-id cursor.
 *
 * @param {unknown} value Query-string cursor.
 * @returns {string | null} Cursor id or null when absent/invalid.
 */
function getReconciliationCursor(value) {
  if (typeof value !== 'string') return null;
  const cursor = value.trim();
  return cursor || null;
}

/**
 * Ensure the Merchant account and API data source are ready for a sync.
 *
 * @returns {Promise<{dataSource: object, baseUrl: string}>} Merchant sync context.
 */
async function ensureMerchantSetup() {
  const baseUrl = process.env.FRONTEND_URL || 'https://thecollectorsexchange.in';

  try {
    await ensureDeveloperRegistration();
  } catch (err) {
    if (!err.message?.includes('already') && !err.message?.includes('registered')) {
      throw {
        statusCode: 500,
        error: 'GCP project not registered with Merchant Center.',
        detail: err.message,
      };
    }
  }

  let dataSource;
  try {
    dataSource = await findOrCreateDataSource();
  } catch (err) {
    throw {
      statusCode: 500,
      error: 'Failed to find or create API data source in Merchant Center.',
      detail: err.message,
    };
  }

  return { dataSource, baseUrl };
}

/**
 * Convert a product that must not be submitted into an actionable reconciliation record.
 *
 * @param {object} product Product record.
 * @returns {{id: string, title: string, status: string, isPublished: boolean, reason: string}}
 * Reconciliation summary.
 */
function toReconciliationItem(product) {
  return {
    id: product.id,
    title: product.title,
    status: product.status,
    isPublished: product.isPublished,
    reason: product.status === 'Sold' ? 'sold' : 'unpublished',
  };
}

/**
 * Identify deletion failures that mean the Merchant input is already absent.
 *
 * @param {{status?: number, message?: string}} error Merchant API error.
 * @returns {boolean} True when deletion is already complete from the desired-state perspective.
 */
function isNotFoundError(error) {
  return error?.status === 404 || /not[ -]?found/i.test(error?.message || '');
}

/**
 * Register Google Merchant admin routes.
 *
 * @param {import('fastify').FastifyInstance} fastify Fastify instance.
 * @returns {Promise<void>}
 */
export default async function googleMerchantRoutes(fastify) {
  const { prisma } = fastify;

  fastify.post(
    '/products/sync-to-google',
    { preValidation: [fastify.authenticateSuperAdmin] },
    async (request, reply) => {
      try {
        const reconciliationLimit = getReconciliationLimit(request.query?.limit);
        const reconciliationCursor = getReconciliationCursor(request.query?.cursor);
        const reconciliationQuery = {
          where: {
            OR: [{ status: 'Sold' }, { status: 'Approved', isPublished: false }],
          },
          orderBy: { id: 'asc' },
          take: reconciliationLimit + 1,
          ...(reconciliationCursor ? { cursor: { id: reconciliationCursor }, skip: 1 } : {}),
        };
        const [approved, reconciliationProducts] = await Promise.all([
          prisma.product.findMany({
            where: { status: 'Approved', isPublished: true },
          }),
          prisma.product.findMany(reconciliationQuery),
        ]);
        const hasMoreReconciliation = reconciliationProducts.length > reconciliationLimit;
        const reconciliationCandidates = reconciliationProducts
          .slice(0, reconciliationLimit)
          .map(toReconciliationItem);
        const nextCursor = hasMoreReconciliation
          ? reconciliationCandidates[reconciliationCandidates.length - 1].id
          : null;

        if (approved.length === 0 && reconciliationCandidates.length === 0) {
          return {
            synced: 0,
            skipped: 0,
            errors: [],
            reconciliation: {
              deleted: 0,
              skipped: 0,
              errors: [],
              processed: 0,
              limit: reconciliationLimit,
              nextCursor,
            },
            message: 'No Approved and published products to sync.',
          };
        }

        const { dataSource, baseUrl } = await ensureMerchantSetup();

        const results = { synced: 0, skipped: 0, errors: [] };
        const reconciliation = {
          deleted: 0,
          skipped: 0,
          errors: [],
          processed: reconciliationCandidates.length,
          limit: reconciliationLimit,
          nextCursor,
        };

        for (const product of approved) {
          try {
            await insertProduct(product, dataSource.name, baseUrl);
            results.synced++;
          } catch (err) {
            if (
              err.status === 409 ||
              err.message?.includes('duplicate') ||
              err.message?.includes('already exists')
            ) {
              results.skipped++;
            } else {
              results.errors.push({ id: product.id, title: product.title, error: err.message });
            }
          }
        }

        for (const product of reconciliationCandidates) {
          try {
            await deleteProduct(product.id, dataSource.name);
            reconciliation.deleted++;
          } catch (err) {
            if (isNotFoundError(err)) {
              reconciliation.skipped++;
            } else {
              reconciliation.errors.push({
                id: product.id,
                title: product.title,
                error: err.message,
              });
            }
          }
        }

        return {
          message: `Synced ${results.synced}, skipped ${results.skipped} (duplicates), ${results.errors.length} failed; reconciled ${reconciliation.deleted} deleted, ${reconciliation.skipped} already absent, ${reconciliation.errors.length} failed`,
          results,
          reconciliation,
          dataSource: dataSource.name,
        };
      } catch (err) {
        return reply
          .status(err.statusCode || 500)
          .send({ error: err.error || 'Sync failed', detail: err.detail || err.message });
      }
    },
  );

  fastify.post(
    '/products/:id/sync-to-google',
    { preValidation: [fastify.authenticateSuperAdmin] },
    async (request, reply) => {
      try {
        const { id } = request.params;

        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) {
          return reply.status(404).send({ error: 'Product not found' });
        }
        if (product.status !== 'Approved' || product.isPublished !== true) {
          const reasons = [];
          if (product.status !== 'Approved') reasons.push('not approved');
          if (product.isPublished !== true) reasons.push('not published');
          return reply.status(422).send({
            error: 'Product is not eligible for Merchant sync',
            detail: `Product is ${reasons.join(' and ')}.`,
          });
        }

        const { dataSource, baseUrl } = await ensureMerchantSetup();

        await insertProduct(product, dataSource.name, baseUrl);

        return {
          message: `"${product.title}" synced to Google Merchant Center`,
          product: { id: product.id, title: product.title },
        };
      } catch (err) {
        return reply
          .status(err.statusCode || 500)
          .send({ error: err.error || 'Sync failed', detail: err.detail || err.message });
      }
    },
  );
}
