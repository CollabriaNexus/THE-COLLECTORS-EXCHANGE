import { ProductSchema, ProductIdParam } from '../schemas/product.js';

/**
 * Product Routes
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function productRoutes(fastify) {
    const { prisma } = fastify;

    // Get all products
    fastify.get('/', async (request, reply) => {
        const { category } = request.query;
        const where = category && category !== 'all' ? { category: { equals: category, mode: 'insensitive' } } : {};
        const products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        return products;
    });

    // Get product by ID
    fastify.get('/:id', async (request, reply) => {
        const { id } = ProductIdParam.parse(request.params);
        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            return reply.status(404).send({ error: 'Product not found' });
        }

        return product;
    });

    // Add new product
    fastify.post('/', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const productData = ProductSchema.parse(request.body);
        const newProduct = await prisma.product.create({
            data: {
                ...productData,
                images: productData.images || [],
                keywords: productData.keywords || [],
                authenticityStatus: 'Pending',
            },
        });
        return reply.status(201).send(newProduct);
    });
}
