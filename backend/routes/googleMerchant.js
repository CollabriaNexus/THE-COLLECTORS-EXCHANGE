import { ensureDeveloperRegistration, findOrCreateDataSource, insertProduct } from '../lib/googleMerchant.js';

async function ensureMerchantSetup() {
    const baseUrl = process.env.FRONTEND_URL || 'https://thecollectorsexchange.in';

    try {
        await ensureDeveloperRegistration();
    } catch (err) {
        if (!err.message?.includes('already') && !err.message?.includes('registered')) {
            throw { statusCode: 500, error: 'GCP project not registered with Merchant Center.', detail: err.message };
        }
    }

    let dataSource;
    try {
        dataSource = await findOrCreateDataSource();
    } catch (err) {
        throw { statusCode: 500, error: 'Failed to find or create API data source in Merchant Center.', detail: err.message };
    }

    return { dataSource, baseUrl };
}

export default async function googleMerchantRoutes(fastify) {
    const { prisma } = fastify;

    fastify.post('/products/sync-to-google', { preValidation: [fastify.authenticateSuperAdmin] }, async (request, reply) => {
        try {
            const { dataSource, baseUrl } = await ensureMerchantSetup();

            const approved = await prisma.product.findMany({
                where: { status: 'Approved' },
            });

            if (approved.length === 0) {
                return { synced: 0, skipped: 0, errors: [], message: 'No Approved products to sync.' };
            }

            const results = { synced: 0, skipped: 0, errors: [] };

            for (const product of approved) {
                try {
                    await insertProduct(product, dataSource.name, baseUrl);
                    results.synced++;
                } catch (err) {
                    if (err.status === 409 || err.message?.includes('duplicate') || err.message?.includes('already exists')) {
                        results.skipped++;
                    } else {
                        results.errors.push({ id: product.id, title: product.title, error: err.message });
                    }
                }
            }

            return {
                message: `Synced ${results.synced}, skipped ${results.skipped} (duplicates), ${results.errors.length} failed`,
                results,
                dataSource: dataSource.name,
            };
        } catch (err) {
            return reply.status(err.statusCode || 500).send({ error: err.error || 'Sync failed', detail: err.detail || err.message });
        }
    });

    fastify.post('/products/:id/sync-to-google', { preValidation: [fastify.authenticateSuperAdmin] }, async (request, reply) => {
        try {
            const { dataSource, baseUrl } = await ensureMerchantSetup();
            const { id } = request.params;

            const product = await prisma.product.findUnique({ where: { id } });
            if (!product) {
                return reply.status(404).send({ error: 'Product not found' });
            }

            await insertProduct(product, dataSource.name, baseUrl);

            return { message: `"${product.title}" synced to Google Merchant Center`, product: { id: product.id, title: product.title } };
        } catch (err) {
            return reply.status(err.statusCode || 500).send({ error: err.error || 'Sync failed', detail: err.detail || err.message });
        }
    });
}
