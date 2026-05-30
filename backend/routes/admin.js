import { KYCRequestIdParam, KYCApprovalSchema, KYCRejectionSchema } from '../schemas/admin.js';

/**
 * Admin Routes
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function adminRoutes(fastify) {
    const { prisma } = fastify;

    // ============== DASHBOARD STATS ==============

    // Get dashboard stats
    fastify.get('/stats/overview', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const [totalUsers, pendingKyc, totalProducts, totalOrders] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { kycStatus: 'pending' } }),
            prisma.product.count(),
            prisma.order.count(),
        ]);

        return {
            totalUsers,
            pendingKyc,
            totalProducts,
            totalOrders,
        };
    });

    // Get analytics data for dashboard charts
    fastify.get('/stats/analytics', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const [revenueData, userGrowth, ordersByStatus, productsByCategory] = await Promise.all([
            // Daily revenue for last 30 days
            prisma.$queryRaw`
                SELECT DATE(o."createdAt") as date, SUM(o."totalAmount") as revenue
                FROM "Order" o
                WHERE o."paymentStatus" = 'Paid' AND o."createdAt" >= NOW() - INTERVAL '30 days'
                GROUP BY DATE(o."createdAt")
                ORDER BY date ASC
            `,
            // User signups per day for last 30 days
            prisma.$queryRaw`
                SELECT DATE(u."createdAt") as date, COUNT(*) as count
                FROM "User" u
                WHERE u."createdAt" >= NOW() - INTERVAL '30 days'
                GROUP BY DATE(u."createdAt")
                ORDER BY date ASC
            `,
            // Orders by status
            prisma.$queryRaw`
                SELECT o."status", COUNT(*) as count
                FROM "Order" o
                GROUP BY o."status"
            `,
            // Products by category
            prisma.$queryRaw`
                SELECT p."category", COUNT(*) as count
                FROM "Product" p
                GROUP BY p."category"
            `,
        ]);

        return { revenueData, userGrowth, ordersByStatus, productsByCategory };
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

        const existingUser = await prisma.user.findUnique({
            where: { id }
        });
        if (!existingUser) {
            return reply.status(404).send({ error: 'User not found' });
        }

        const updatedUser = await prisma.$transaction(async (tx) => {
            const currentKycData = typeof existingUser.kycData === 'object' && existingUser.kycData !== null 
                ? existingUser.kycData 
                : {};

            const user = await tx.user.update({
                where: { id },
                data: {
                    kycStatus: 'verified',
                    kycData: {
                        ...currentKycData,
                        adminNotes: notes || '',
                        approvedAt: new Date().toISOString(),
                    },
                },
            });

            // Auto-upsert Vendor Profile
            await tx.vendor.upsert({
                where: { userId: id },
                update: { status: 'APPROVED' },
                create: {
                    userId: id,
                    type: user.type === 'company' ? 'BULK' : 'SINGLE',
                    status: 'APPROVED',
                    maxListings: user.type === 'company' ? 999999 : 5,
                    companyName: user.type === 'company' ? (currentKycData.companyName || null) : null,
                    gst: user.type === 'company' ? (currentKycData.gst || null) : null,
                    founderName: user.type === 'company' ? (currentKycData.founderName || null) : null,
                    aadhaar: user.type === 'individual' ? (currentKycData.aadhaar || null) : null,
                    pan: user.type === 'individual' ? (currentKycData.pan || null) : null,
                    aadhaarDoc: currentKycData.aadhaarDoc || null,
                    panDoc: currentKycData.panDoc || null,
                    gstDoc: currentKycData.gstDoc || null,
                    incorporationDoc: currentKycData.incorporationDoc || null,
                    agreementAccepted: currentKycData.agreementAccepted === true,
                    agreementSignedAt: currentKycData.agreementSignedAt ? new Date(currentKycData.agreementSignedAt) : null,
                    agreementSignedByName: currentKycData.agreementSignedByName || null,
                }
            });

            return user;
        });

        // Send KYC approved notification
        await prisma.notification.create({
            data: {
                userId: id,
                title: 'KYC Verified ✓',
                message: 'Your identity has been verified. You can now list items on The Collectors Exchange.',
            }
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

        // Send KYC rejected notification
        await prisma.notification.create({
            data: {
                userId: id,
                title: 'KYC Verification Update',
                message: `Your verification was not approved. Reason: ${reason}. Please resubmit with correct documents.`,
            }
        });

        return {
            message: 'KYC request rejected',
            user: updatedUser
        };
    });

    // ============== USER MANAGEMENT ==============

    // Ban user
    fastify.patch('/users/:id/ban', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const { id } = request.params;

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return reply.status(404).send({ error: 'User not found' });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { banned: true },
        });

        await prisma.notification.create({
            data: {
                userId: id,
                title: 'Account Banned',
                message: 'Your account has been banned. Please contact support for more information.',
            }
        });

        return { message: 'User banned successfully', user: updatedUser };
    });

    // Unban user
    fastify.patch('/users/:id/unban', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const { id } = request.params;

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return reply.status(404).send({ error: 'User not found' });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { banned: false },
        });

        await prisma.notification.create({
            data: {
                userId: id,
                title: 'Account Unbanned',
                message: 'Your account has been reinstated. You can now use The Collectors Exchange normally.',
            }
        });

        return { message: 'User unbanned successfully', user: updatedUser };
    });

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
                banned: true,
                createdAt: true,
                updatedAt: true,
                vendor: {
                    select: {
                        id: true,
                        type: true,
                        status: true,
                        maxListings: true,
                        subscription: {
                            select: {
                                plan: true,
                                status: true,
                                currentPeriodEnd: true,
                            }
                        }
                    }
                }
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
                vendor: { include: { subscription: true } },
            },
        });

        if (!user) {
            return reply.status(404).send({ error: 'User not found' });
        }

        return user;
    });

    // Whitelist Vendor (manual subscription bypass / upgrade)
    fastify.post('/vendor/:userId/whitelist', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const { userId } = request.params;
        const { plan } = request.body || {};

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return reply.status(404).send({ error: 'User not found' });
        }

        const updatedVendor = await prisma.$transaction(async (tx) => {
            // Ensure vendor record exists
            const v = await tx.vendor.upsert({
                where: { userId },
                update: {
                    type: 'BULK',
                    maxListings: 999999,
                    status: 'APPROVED',
                },
                create: {
                    userId,
                    type: 'BULK',
                    maxListings: 999999,
                    status: 'APPROVED',
                }
            });

            // Upsert the subscription
            const currentPeriodEnd = new Date();
            currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 10); // 10 years bypass

            await tx.vendorSubscription.upsert({
                where: { vendorId: v.id },
                update: {
                    plan: plan || 'CUSTOM_APPROVED',
                    status: 'active',
                    currentPeriodEnd,
                },
                create: {
                    vendorId: v.id,
                    plan: plan || 'CUSTOM_APPROVED',
                    status: 'active',
                    currentPeriodEnd,
                }
            });

            // Log action
            await tx.auditLog.create({
                data: {
                    adminId: request.dbUser?.id || 'SYSTEM',
                    action: 'WHITELIST_VENDOR',
                    targetType: 'Vendor',
                    targetId: v.id,
                    details: `Whitelisted user ${userId} to Bulk Vendor via plan ${plan || 'CUSTOM_APPROVED'}`
                }
            });

            return v;
        });

        return { message: 'Vendor whitelisted successfully', vendor: updatedVendor };
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

    // Approve product (Publish) — super admin only
    fastify.patch('/products/:id/approve', { preValidation: [fastify.authenticateSuperAdmin] }, async (request, reply) => {
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

        // Notify seller
        await prisma.notification.create({
            data: {
                userId: updatedProduct.sellerId,
                title: 'Listing Approved ✓',
                message: `Your item "${updatedProduct.title}" has been verified and is now live on The Exchange.`,
            }
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

        // Notify seller
        await prisma.notification.create({
            data: {
                userId: updatedProduct.sellerId,
                title: 'Listing Requires Attention',
                message: `Your item "${updatedProduct.title}" was not approved. Reason: ${reason}. Please update and resubmit.`,
            }
        });

        return { message: 'Product rejected', product: updatedProduct };
    });

    // Update authenticity status — super admin only
    fastify.patch('/products/:id/authenticity', { preValidation: [fastify.authenticateSuperAdmin] }, async (request, reply) => {
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

    // Delete product
    fastify.delete('/products/:id', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const { id } = request.params;

        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing) {
            return reply.status(404).send({ error: 'Product not found' });
        }

        await prisma.product.delete({ where: { id } });

        return { message: 'Product deleted successfully' };
    });

    // Update product (brand, listingCategory, etc.)
    fastify.patch('/products/:id', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const { id } = request.params;
        const { brand, listingCategory, category, title, description, price, condition, image, images, keywords } = request.body;

        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing) {
            return reply.status(404).send({ error: 'Product not found' });
        }

        const data = {};
        if (brand !== undefined) data.brand = brand;
        if (listingCategory !== undefined) data.listingCategory = listingCategory;
        if (category !== undefined) data.category = category;
        if (title !== undefined) data.title = title;
        if (description !== undefined) data.description = description;
        if (price !== undefined) data.price = parseFloat(price);
        if (condition !== undefined) data.condition = condition;
        if (image !== undefined) data.image = image;
        if (images !== undefined) data.images = images;
        if (keywords !== undefined) data.keywords = keywords;

        const updated = await prisma.product.update({ where: { id }, data });

        return { message: 'Product updated successfully', product: updated };
    });
    });

    // Get all unique brands
    fastify.get('/brands', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const products = await prisma.product.findMany({
            where: { brand: { not: null } },
            select: { brand: true },
            distinct: ['brand'],
        });

        const brands = products.map(p => p.brand).filter(Boolean);
        return brands;
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

        // Notify the buyer of status change
        const statusMessages = {
            Processing: 'Your order is being processed and will be shipped soon.',
            Shipped: 'Your order has been shipped! Track it in your account.',
            Delivered: 'Your order has been delivered. Thank you for your acquisition.',
            Cancelled: 'Your order has been cancelled. Contact support if you have questions.',
        };
        if (statusMessages[status]) {
            await prisma.notification.create({
                data: {
                    userId: updatedOrder.userId,
                    title: `Order ${status}`,
                    message: statusMessages[status],
                }
            });
        }

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

        // Notify buyer with tracking ID
        await prisma.notification.create({
            data: {
                userId: updatedOrder.userId,
                title: 'Your Order Has Shipped 📦',
                message: `Your order is on its way! Tracking ID: ${trackingID}. Track at delhivery.com.`,
            }
        });

        return { message: 'Order shipped successfully', order: updatedOrder };
    });

    // ============== PAYOUT MANAGEMENT ==============

    // Create a payout for a vendor
    fastify.post('/payouts', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const { vendorId, amount, periodStart, periodEnd, note } = request.body;
        const adminUser = request.dbUser;

        if (!vendorId || !amount || !periodStart || !periodEnd) {
            return reply.status(400).send({ error: 'vendorId, amount, periodStart, and periodEnd are required' });
        }

        const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
        if (!vendor) {
            return reply.status(404).send({ error: 'Vendor not found' });
        }

        const payout = await prisma.payout.create({
            data: {
                vendorId,
                amount: parseFloat(amount),
                periodStart: new Date(periodStart),
                periodEnd: new Date(periodEnd),
                note: note || null,
            }
        });

        await prisma.auditLog.create({
            data: {
                adminId: adminUser?.id || 'SYSTEM',
                action: 'CREATE_PAYOUT',
                targetType: 'Payout',
                targetId: payout.id,
                details: `Created payout of ${amount} for vendor ${vendorId}`,
            }
        });

        await prisma.notification.create({
            data: {
                userId: vendor.userId,
                title: 'New Payout Created',
                message: `A payout of $${parseFloat(amount).toLocaleString()} has been created for ${new Date(periodStart).toLocaleDateString()} — ${new Date(periodEnd).toLocaleDateString()}.`,
            }
        });

        return { message: 'Payout created successfully', payout };
    });

    // Update payout status
    fastify.patch('/payouts/:id/status', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const { id } = request.params;
        const { status } = request.body;
        const adminUser = request.dbUser;

        const validStatuses = ['PENDING', 'PROCESSING', 'PAID', 'FAILED'];
        if (!validStatuses.includes(status)) {
            return reply.status(400).send({ error: 'Invalid payout status' });
        }

        const data = { status };
        if (status === 'PAID') {
            data.paidAt = new Date();
        }

        const payout = await prisma.payout.update({
            where: { id },
            data,
            include: { vendor: true }
        });

        await prisma.auditLog.create({
            data: {
                adminId: adminUser?.id || 'SYSTEM',
                action: 'UPDATE_PAYOUT_STATUS',
                targetType: 'Payout',
                targetId: payout.id,
                details: `Updated payout ${id} status to ${status}`,
            }
        });

        const statusMessages = {
            PROCESSING: 'Your payout is now being processed.',
            PAID: `Your payout of $${payout.amount.toLocaleString()} has been paid.`,
            FAILED: 'Your payout has failed. Please contact support.',
        };
        if (statusMessages[status]) {
            await prisma.notification.create({
                data: {
                    userId: payout.vendor.userId,
                    title: `Payout ${status}`,
                    message: statusMessages[status],
                }
            });
        }

        return { message: 'Payout status updated', payout };
    });

    // List all payouts
    fastify.get('/payouts', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const { status, vendorId, page = 1, limit = 20 } = request.query;

        const where = {};
        if (status) where.status = status;
        if (vendorId) where.vendorId = vendorId;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [payouts, total] = await Promise.all([
            prisma.payout.findMany({
                where,
                include: { vendor: { include: { user: { select: { name: true, email: true } } } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.payout.count({ where }),
        ]);

        return {
            payouts,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
        };
    });

    // Get TCE Store products (listed by super admin)
    fastify.get('/products/tce-store', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const products = await prisma.product.findMany({
            where: { seller: { role: 'admin' } },
            include: { seller: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
        });
        return { products };
    });

    // Create product as TCE (super admin) — auto-verified, auto-published
    fastify.post('/products', { preValidation: [fastify.authenticateSuperAdmin] }, async (request, reply) => {
        const { title, category, description, condition, price, image, images, keywords, brand } = request.body;
        if (!title || !category || !description || !condition || !price) {
            return reply.status(400).send({ error: 'Missing required fields' });
        }
        const product = await prisma.product.create({
            data: {
                title,
                category,
                description,
                condition,
                price: parseFloat(price),
                image: image || '',
                images: images || [],
                keywords: keywords || [],
                brand: brand || null,
                sellerId: request.dbUser.id,
                status: 'Approved',
                isPublished: true,
                isVerified: true,
                authenticityStatus: 'Verified',
            },
        });
        return product;
    });
}
