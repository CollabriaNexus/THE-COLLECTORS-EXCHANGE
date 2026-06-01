import { ProductSchema, ProductIdParam } from '../schemas/product.js';
import { z } from 'zod';

/**
 * Product Routes
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function productRoutes(fastify) {
    const { prisma } = fastify;

    // Get all products (Public catalog)
    fastify.get('/', async (request, reply) => {
        const { category, search, sellerId, page, limit, listingCategory } = request.query;

        const where = {};

        // Public catalog only sees Approved / Published products
        // UNLESS querying own seller listings
        if (sellerId) {
            where.sellerId = sellerId;
            // If requesting own listings, we verify ownership to allow seeing pending/rejected ones.
            const token = request.headers.authorization?.split(' ')[1];
            let isOwner = false;
            if (token) {
                try {
                    await fastify.authenticate(request, reply);
                    if (reply.sent) return;
                    if (request.dbUser && request.dbUser.id === sellerId) {
                        isOwner = true;
                    }
                } catch (e) {
                    // Suppress and treat as guest
                }
            }

            if (!isOwner) {
                where.isPublished = true;
            }
        } else {
            where.isPublished = true;
        }

        if (category && category !== 'all') {
            where.category = { equals: category, mode: 'insensitive' };
        }

        if (listingCategory) {
            where.listingCategory = listingCategory;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = Math.min(parseInt(limit, 10) || 20, 100);

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                include: { seller: { select: { name: true, type: true, role: true, vendor: { select: { id: true, rating: true, ratingCount: true } } } } },
                skip: (pageNum - 1) * limitNum,
                take: limitNum,
            }),
            prisma.product.count({ where }),
        ]);

        return { products, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) };
    });

    // Get product by ID
    fastify.get('/:id', async (request, reply) => {
        const { id } = ProductIdParam.parse(request.params);
        const product = await prisma.product.findFirst({
            where: { id, isPublished: true },
            include: { seller: { select: { name: true, type: true, role: true, vendor: { select: { id: true, rating: true, ratingCount: true } } } } }
        });

        if (!product) {
            return reply.status(404).send({ error: 'Product not found' });
        }

        return product;
    });

    // Add new product
    fastify.post('/', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const productData = ProductSchema.parse(request.body);
        const dbUser = request.dbUser;

        if (!dbUser) {
            return reply.status(401).send({ error: 'User profile not synchronized' });
        }

        // Verify sellerId matches logged-in user CUID
        if (productData.sellerId !== dbUser.id) {
            return reply.status(403).send({ error: 'Seller ID mismatch' });
        }

        // Verify KYC status
        if (dbUser.kycStatus !== 'verified') {
            return reply.status(403).send({ error: 'Seller KYC verification is required to list products.' });
        }

        // Fetch or create vendor profile
        let vendor = dbUser.vendor;
        if (!vendor) {
            vendor = await prisma.vendor.create({
                data: {
                    userId: dbUser.id,
                    type: dbUser.type === 'company' ? 'BULK' : 'SINGLE',
                    status: 'PENDING',
                    maxListings: dbUser.type === 'company' ? 999999 : 5,
                }
            });
        }

        if (vendor.status !== 'APPROVED') {
            return reply.status(403).send({ error: `Vendor account status: ${vendor.status}` });
        }

        // Check active listing count for SINGLE type vendor
        if (vendor.type === 'SINGLE') {
            const activeCount = await prisma.product.count({
                where: {
                    sellerId: dbUser.id,
                    status: { in: ['Pending', 'In_Review', 'Approved'] },
                }
            });

            if (activeCount >= vendor.maxListings) {
                return reply.status(422).send({
                    error: `Listing limit reached. Single sellers can have at most ${vendor.maxListings} active products.`
                });
            }
        }

        const newProduct = await prisma.product.create({
            data: {
                ...productData,
                images: productData.images || [],
                keywords: productData.keywords || [],
                authenticityStatus: 'Pending',
                status: 'Pending',
                isPublished: false,
            },
        });
        return reply.status(201).send(newProduct);
    });

    // Update product
    fastify.put('/:id', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { id } = ProductIdParam.parse(request.params);
        const productData = ProductSchema.partial().parse(request.body);
        const dbUser = request.dbUser;

        if (!dbUser) {
            return reply.status(401).send({ error: 'User profile not synchronized' });
        }

        const existingProduct = await prisma.product.findUnique({
            where: { id }
        });

        if (!existingProduct) {
            return reply.status(404).send({ error: 'Product not found' });
        }

        // Prevent modifying a sold product
        if (existingProduct.status === 'Sold') {
            return reply.status(422).send({ error: 'Cannot modify a sold product' });
        }

        // Ensure user is the owner or an admin
        if (existingProduct.sellerId !== dbUser.id && dbUser.role !== 'admin' && dbUser.role !== 'curator') {
            return reply.status(403).send({ error: 'Not authorized to update this product' });
        }

        // If updated by seller, reset approval status back to Pending
        const { sellerId, ...safeData } = productData;
        const updateData = { ...safeData };
        if (dbUser.role !== 'admin' && dbUser.role !== 'curator') {
            updateData.status = 'Pending';
            updateData.isPublished = false;
            updateData.authenticityStatus = 'Pending';
        }

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: updateData
        });

        return updatedProduct;
    });

    // Delete product
    fastify.delete('/:id', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { id } = ProductIdParam.parse(request.params);
        const dbUser = request.dbUser;

        if (!dbUser) {
            return reply.status(401).send({ error: 'User profile not synchronized' });
        }

        const existingProduct = await prisma.product.findUnique({
            where: { id }
        });

        if (!existingProduct) {
            return reply.status(404).send({ error: 'Product not found' });
        }

        // Ensure user is the owner or an admin
        if (existingProduct.sellerId !== dbUser.id && dbUser.role !== 'admin') {
            return reply.status(403).send({ error: 'Not authorized to delete this product' });
        }

        await prisma.product.delete({
            where: { id }
        });

        return reply.status(204).send();
    });

    // Bulk create products (for BULK vendors)
    fastify.post('/bulk', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { products } = request.body;
        const dbUser = request.dbUser;

        if (!dbUser) {
            return reply.status(401).send({ error: 'User profile not synchronized' });
        }

        if (!Array.isArray(products) || products.length === 0) {
            return reply.status(400).send({ error: 'Products array is required and must not be empty.' });
        }

        if (products.length > 100) {
            return reply.status(422).send({ error: 'Batch limit exceeded. Maximum 100 products per bulk request.' });
        }

        if (dbUser.kycStatus !== 'verified') {
            return reply.status(403).send({ error: 'Seller KYC verification is required.' });
        }

        let vendor = dbUser.vendor || await prisma.vendor.create({
            data: {
                userId: dbUser.id,
                type: 'BULK',
                status: 'PENDING',
                maxListings: 999999,
            }
        });

        if (vendor.type !== 'BULK') {
            return reply.status(403).send({ error: 'Bulk upload is only available for BULK vendors.' });
        }

        const created = [];
        const errors = [];

        for (let i = 0; i < products.length; i++) {
            const item = products[i];
            try {
                const parsed = ProductSchema.parse({
                    ...item,
                    sellerId: dbUser.id,
                    price: parseFloat(item.price),
                    keywords: item.keywords ? (typeof item.keywords === 'string' ? item.keywords.split(',').map(k => k.trim()).filter(Boolean) : item.keywords) : [],
                    images: item.images || (item.image ? [item.image] : []),
                });
                const product = await prisma.product.create({
                    data: {
                        ...parsed,
                        images: parsed.images || [],
                        keywords: parsed.keywords || [],
                        authenticityStatus: 'Pending',
                        status: 'Pending',
                        isPublished: false,
                    },
                });
                created.push(product);
            } catch (err) {
                errors.push({ row: i + 1, title: item.title || '(no title)', error: err.message || 'Validation failed' });
            }
        }

        return { created: created.length, errors, products: created };
    });

    // Mark product as sold
    fastify.patch('/:id/sold', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { id } = ProductIdParam.parse(request.params);
        const dbUser = request.dbUser;
        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing) return reply.status(404).send({ error: 'Product not found' });
        if (existing.sellerId !== dbUser.id) return reply.status(403).send({ error: 'Not your product' });
        if (existing.status === 'Sold') return reply.status(422).send({ error: 'Product is already sold' });
        const updated = await prisma.product.update({ where: { id }, data: { status: 'Sold', isPublished: false } });
        return updated;
    });
}
