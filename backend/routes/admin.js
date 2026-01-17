import { KYCRequestIdParam, KYCApprovalSchema, KYCRejectionSchema } from '../schemas/admin.js';

/**
 * Admin Routes
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function adminRoutes(fastify) {
    const { prisma } = fastify;

    // Admin authentication decorator
    fastify.decorate('authenticateAdmin', async function (request, reply) {
        try {
            // First verify JWT token
            await fastify.authenticate(request, reply);

            // Then verify admin role
            if (!request.user) {
                throw new Error('User not authenticated');
            }

            // Get user from database to verify role
            const supabaseId = request.user.sub;
            const user = await prisma.user.findUnique({
                where: { supabaseId },
                select: { role: true },
            });

            if (!user || user.role !== 'admin') {
                return reply.code(403).send({
                    error: 'Forbidden',
                    message: 'Admin access required'
                });
            }
        } catch (err) {
            return reply.code(401).send({
                error: 'Unauthorized',
                message: err.message
            });
        }
    });

    // ============== KYC MANAGEMENT ==============

    // Get all KYC requests with filters
    fastify.get('/kyc/requests', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const { status, search } = request.query;

        // Build filter conditions
        const where = {};

        // Filter by KYC status
        if (status && status !== 'all') {
            where.kycStatus = status;
        }

        // Search by name or email
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                type: true,
                role: true,
                kycStatus: true,
                kycData: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return users;
    });

    // Get single KYC request detail
    fastify.get('/kyc/requests/:id', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const { id } = KYCRequestIdParam.parse(request.params);

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                type: true,
                role: true,
                kycStatus: true,
                kycData: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            return reply.status(404).send({ error: 'User not found' });
        }

        return user;
    });

    // Approve KYC request
    fastify.patch('/kyc/requests/:id/approve', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const { id } = KYCRequestIdParam.parse(request.params);
        const { notes } = KYCApprovalSchema.parse(request.body);

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                kycStatus: 'verified',
                // Optionally store notes in kycData
                kycData: notes ? {
                    ...(typeof request.user.kycData === 'object' ? request.user.kycData : {}),
                    adminNotes: notes,
                    approvedAt: new Date().toISOString(),
                } : undefined,
            },
        });

        return {
            message: 'KYC request approved successfully',
            user: updatedUser
        };
    });

    // Reject KYC request
    fastify.patch('/kyc/requests/:id/reject', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const { id } = KYCRequestIdParam.parse(request.params);
        const { reason } = KYCRejectionSchema.parse(request.body);

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                kycStatus: 'none',
                kycData: {
                    rejectionReason: reason,
                    rejectedAt: new Date().toISOString(),
                },
            },
        });

        return {
            message: 'KYC request rejected',
            user: updatedUser
        };
    });

    // ============== USER MANAGEMENT ==============

    // Get all users with filters
    fastify.get('/users', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const { role, search } = request.query;

        const where = {};

        if (role && role !== 'all') {
            where.role = role;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                type: true,
                role: true,
                kycStatus: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return users;
    });

    // Get single user detail
    fastify.get('/users/:id', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const { id } = request.params;

        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                products: true,
                cart: { include: { product: true } },
                wishlist: { include: { product: true } },
            },
        });

        if (!user) {
            return reply.status(404).send({ error: 'User not found' });
        }

        return user;
    });

    // Update user role
    fastify.patch('/users/:id/role', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const { id } = request.params;
        const { role } = request.body;

        if (!['user', 'admin', 'curator'].includes(role)) {
            return reply.status(400).send({ error: 'Invalid role' });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { role },
        });

        return { message: 'User role updated', user: updatedUser };
    });

    // ============== PRODUCT MANAGEMENT ==============

    // Get all products with filters
    fastify.get('/products', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const { category, status, search } = request.query;

        const where = {};

        if (category && category !== 'all') {
            where.category = { equals: category, mode: 'insensitive' };
        }

        if (status && status !== 'all') {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { seller: { name: { contains: search, mode: 'insensitive' } } },
                { seller: { email: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const products = await prisma.product.findMany({
            where,
            include: {
                seller: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return products;
    });

    // Get single product detail
    fastify.get('/products/:id', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const { id } = request.params;

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                seller: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });

        if (!product) {
            return reply.status(404).send({ error: 'Product not found' });
        }

        return product;
    });

    // Start review
    fastify.patch('/products/:id/review', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const { id } = request.params;

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                status: 'In Review',
                reviewedAt: new Date(),
            },
        });

        return { message: 'Product is now under review', product: updatedProduct };
    });

    // Approve product (Publish)
    fastify.patch('/products/:id/approve', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const { id } = request.params;

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                status: 'Approved',
                isPublished: true,
                isVerified: true,
                authenticityStatus: 'Verified',
                rejectionReason: null,
                reviewedAt: new Date(),
            },
        });

        return { message: 'Product approved and published successfully', product: updatedProduct };
    });

    // Reject product
    fastify.patch('/products/:id/reject', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const { id } = request.params;
        const { reason } = request.body || {};

        if (!reason) {
            return reply.status(400).send({ error: 'Rejection reason is required' });
        }

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                status: 'Rejected',
                isPublished: false,
                isVerified: false,
                authenticityStatus: 'Rejected',
                rejectionReason: reason,
                reviewedAt: new Date(),
            },
        });

        return { message: 'Product rejected', product: updatedProduct };
    });

    // Update authenticity status (legacy support or more granular control)
    fastify.patch('/products/:id/authenticity', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const { id } = request.params;
        const { status: authStatus } = request.body;

        const validStatuses = ['Pending', 'Verified', 'Rejected', 'Under Review'];
        if (!validStatuses.includes(authStatus)) {
            return reply.status(400).send({ error: 'Invalid authenticity status' });
        }

        const data = {
            authenticityStatus: authStatus,
        };

        // Sync with workflow status
        if (authStatus === 'Verified') {
            data.status = 'Approved';
            data.isPublished = true;
            data.isVerified = true;
        } else if (authStatus === 'Rejected') {
            data.status = 'Rejected';
            data.isPublished = false;
            data.isVerified = false;
        }

        const updatedProduct = await prisma.product.update({
            where: { id },
            data,
        });

        return { message: 'Authenticity status updated', product: updatedProduct };
    });

    // ============== ORDER MANAGEMENT ==============

    // Get all orders with filters
    fastify.get('/orders', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const { status, search } = request.query;

        const where = {};

        if (status && status !== 'all') {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { id: { contains: search, mode: 'insensitive' } },
                { user: { name: { contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const orders = await prisma.order.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return orders;
    });

    // Get single order detail
    fastify.get('/orders/:id', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const { id } = request.params;

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                user: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!order) {
            return reply.status(404).send({ error: 'Order not found' });
        }

        return order;
    });

    // Update order status
    fastify.patch('/orders/:id/status', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const { id } = request.params;
        const { status } = request.body;

        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return reply.status(400).send({ error: 'Invalid order status' });
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { status },
        });

        return { message: `Order marked as ${status}`, order: updatedOrder };
    });

    // Ship order (with tracking ID)
    fastify.patch('/orders/:id/ship', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const { id } = request.params;
        const { trackingID } = request.body;

        if (!trackingID) {
            return reply.status(400).send({ error: 'Tracking ID is required for shipping' });
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: {
                status: 'Shipped',
                trackingID,
            },
        });

        return { message: 'Order shipped successfully', order: updatedOrder };
    });
}
