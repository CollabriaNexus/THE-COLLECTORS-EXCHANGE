import { ensureDeveloperRegistration, findOrCreateDataSource, insertProduct } from '../lib/googleMerchant.js';

export default async function googleMerchantRoutes(fastify) {
    const { prisma } = fastify;

    fastify.post('/products/sync-to-google', { preValidation: [fastify.authenticateSuperAdmin] }, async (request, reply) => {
        const baseUrl = process.env.FRONTEND_URL || 'https://thecollectorsexchange.in';

        try {
            await ensureDeveloperRegistration();
        } catch (err) {
            if (!err.message?.includes('already') && !err.message?.includes('registered')) {
                return reply.status(500).send({
                    error: 'GCP project not registered with Merchant Center.',
                    detail: err.message,
                    hint: 'Run this curl command to register:\n\ncurl -X POST "https://merchantapi.googleapis.com/accounts/v1/accounts/5812107292/developerRegistration:registerGcp" -H "Authorization: Bearer YOUR_ACCESS_TOKEN" -H "Content-Type: application/json"\n\nOr visit: https://console.cloud.google.com/apis/credentials?project=emerald-bastion-484309-j8',
                });
            }
        }

        let dataSource;
        try {
            dataSource = await findOrCreateDataSource();
        } catch (err) {
            return reply.status(500).send({
                error: 'Failed to find or create API data source in Merchant Center.',
                detail: err.message,
                hint: 'Go to Merchant Center → Settings → Data Sources → Add Data Source → select "API" → create one named "API Products". Then retry.',
            });
        }

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
    });
}
