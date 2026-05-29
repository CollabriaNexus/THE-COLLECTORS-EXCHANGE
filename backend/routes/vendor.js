/**
 * Vendor Routes
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function vendorRoutes(fastify) {
    const { prisma } = fastify;

    // Get current logged-in user's vendor profile
    fastify.get('/profile', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const dbUser = request.dbUser;
        if (!dbUser) {
            return reply.status(401).send({ error: 'Unauthorized', message: 'User profile not synchronized' });
        }

        const vendor = await prisma.vendor.findUnique({
            where: { userId: dbUser.id },
            include: { subscription: true }
        });

        if (!vendor) {
            return reply.status(404).send({ error: 'Vendor profile not found', message: 'You must complete KYC first.' });
        }

        // Fetch active listing count
        const activeCount = await prisma.product.count({
            where: {
                sellerId: dbUser.id,
                status: { in: ['Pending', 'In Review', 'Approved'] },
            }
        });

        return {
            ...vendor,
            activeCount,
        };
    });

    // Get vendor specific sales statistics
    fastify.get('/stats', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const dbUser = request.dbUser;
        if (!dbUser) {
            return reply.status(401).send({ error: 'Unauthorized', message: 'User profile not synchronized' });
        }

        const vendor = await prisma.vendor.findUnique({
            where: { userId: dbUser.id }
        });

        if (!vendor) {
            return reply.status(404).send({ error: 'Vendor profile not found' });
        }

        // Fetch all products sold by this seller
        const products = await prisma.product.findMany({
            where: { sellerId: dbUser.id },
            select: { id: true }
        });

        const productIds = products.map(p => p.id);

        // Fetch order items matching this vendor's products
        const orderItems = await prisma.orderItem.findMany({
            where: {
                productId: { in: productIds },
                order: { status: { not: 'Cancelled' } }
            },
            include: { order: true }
        });

        // Calculate statistics
        const totalSales = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const totalItemsSold = orderItems.reduce((acc, item) => acc + item.quantity, 0);
        const uniqueOrders = new Set(orderItems.map(item => item.orderId)).size;

        return {
            totalSales,
            totalItemsSold,
            uniqueOrders,
        };
    });

    // Helper: compute date filter from period string
    function getPeriodFilter(period) {
        const now = new Date();
        switch (period) {
            case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            case '10d': return new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
            case '15d': return new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
            case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            case 'quarterly': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            case '6m': return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
            case '1y': return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            default: return null;
        }
    }

    // Get vendor analytics overview
    fastify.get('/analytics/overview', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const dbUser = request.dbUser;
        const { period = '30d' } = request.query;
        const dateFilter = getPeriodFilter(period);

        const vendor = await prisma.vendor.findUnique({ where: { userId: dbUser.id } });
        if (!vendor) return reply.status(404).send({ error: 'Vendor profile not found' });

        const productIds = (await prisma.product.findMany({
            where: { sellerId: dbUser.id },
            select: { id: true }
        })).map(p => p.id);

        const orderWhere = {
            productId: { in: productIds },
            ...(dateFilter ? { createdAt: { gte: dateFilter } } : {}),
        };

        const orderItems = await prisma.orderItem.findMany({
            where: {
                ...orderWhere,
                order: { status: { not: 'Cancelled' } }
            },
            include: { order: true }
        });

        const totalRevenue = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const totalItemsSold = orderItems.reduce((acc, item) => acc + item.quantity, 0);
        const uniqueOrders = new Set(orderItems.map(item => item.orderId)).size;

        const paidItems = orderItems.filter(item => item.order.paymentStatus === 'Paid');
        const paidRevenue = paidItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        const pendingPayouts = await prisma.payout.aggregate({
            where: { vendorId: vendor.id, status: { in: ['PENDING', 'PROCESSING'] } },
            _sum: { amount: true }
        });

        const totalListings = await prisma.product.count({ where: { sellerId: dbUser.id } });
        const activeListings = await prisma.product.count({
            where: { sellerId: dbUser.id, status: 'Approved', isPublished: true }
        });

        return {
            orderCount: uniqueOrders,
            saleCount: totalItemsSold,
            totalRevenue,
            paidRevenue,
            pendingPayout: pendingPayouts._sum.amount || 0,
            totalListings,
            activeListings,
        };
    });

    // Get customer interest funnel
    fastify.get('/analytics/interest', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const dbUser = request.dbUser;
        const { period = '30d' } = request.query;
        const dateFilter = getPeriodFilter(period);

        const productIds = (await prisma.product.findMany({
            where: { sellerId: dbUser.id },
            select: { id: true }
        })).map(p => p.id);

        const eventWhere = {
            productId: { in: productIds },
            ...(dateFilter ? { createdAt: { gte: dateFilter } } : {}),
        };

        const [totalViews, uniqueViewers, cartAdds, checkoutStarts] = await Promise.all([
            prisma.productView.count({ where: eventWhere }),
            prisma.productView.groupBy({
                by: ['sessionId'],
                where: { ...eventWhere, sessionId: { not: null } },
                _count: true,
            }).then(r => r.length),
            prisma.cartEvent.count({ where: { ...eventWhere, action: 'ADD' } }),
            prisma.checkoutEvent.count({ where: eventWhere }),
        ]);

        return { totalViews, uniqueViewers, cartAdds, checkoutStarts };
    });

    // Get sales graph data (time-series grouped by day)
    fastify.get('/analytics/sales-graph', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const dbUser = request.dbUser;
        const { period = '30d' } = request.query;
        const dateFilter = getPeriodFilter(period);

        const productIds = (await prisma.product.findMany({
            where: { sellerId: dbUser.id },
            select: { id: true }
        })).map(p => p.id);

        const orderItems = await prisma.orderItem.findMany({
            where: {
                productId: { in: productIds },
                ...(dateFilter ? { createdAt: { gte: dateFilter } } : {}),
                order: { status: { not: 'Cancelled' } }
            },
            include: { order: true },
            orderBy: { createdAt: 'asc' }
        });

        const useMonthly = !period || period === 'all' || period === '1y' || period === '6m';
        const groupMap = new Map();
        for (const item of orderItems) {
            const key = useMonthly
                ? item.createdAt.toISOString().slice(0, 7) // YYYY-MM
                : item.createdAt.toISOString().split('T')[0]; // day
            if (!groupMap.has(key)) {
                groupMap.set(key, { date: key, sales: 0, orders: new Set(), items: 0 });
            }
            const entry = groupMap.get(key);
            entry.sales += item.price * item.quantity;
            entry.orders.add(item.orderId);
            entry.items += item.quantity;
        }

        const graphData = Array.from(groupMap.values()).map(d => ({
            date: d.date,
            sales: d.sales,
            orders: d.orders.size,
            items: d.items,
        }));

        return graphData;
    });

    // Get top-selling products
    fastify.get('/analytics/top-products', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const dbUser = request.dbUser;
        const { period = '30d', limit = 10 } = request.query;
        const dateFilter = getPeriodFilter(period);

        const productIds = (await prisma.product.findMany({
            where: { sellerId: dbUser.id },
            select: { id: true }
        })).map(p => p.id);

        const orderItems = await prisma.orderItem.findMany({
            where: {
                productId: { in: productIds },
                ...(dateFilter ? { createdAt: { gte: dateFilter } } : {}),
                order: { status: { not: 'Cancelled' } }
            },
            include: { product: true },
        });

        const productMap = new Map();
        for (const item of orderItems) {
            if (!productMap.has(item.productId)) {
                productMap.set(item.productId, {
                    id: item.productId,
                    title: item.product.title,
                    image: item.product.image,
                    price: item.product.price,
                    totalRevenue: 0,
                    quantitySold: 0,
                    orderCount: new Set(),
                });
            }
            const entry = productMap.get(item.productId);
            entry.totalRevenue += item.price * item.quantity;
            entry.quantitySold += item.quantity;
            entry.orderCount.add(item.orderId);
        }

        const topProducts = Array.from(productMap.values())
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, parseInt(limit))
            .map(p => ({ ...p, orderCount: p.orderCount.size }));

        return topProducts;
    });

    // Get vendor payouts with filters
    fastify.get('/payouts', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const dbUser = request.dbUser;
        const { status, from, to, page = 1, limit = 20 } = request.query;

        const vendor = await prisma.vendor.findUnique({ where: { userId: dbUser.id } });
        if (!vendor) return reply.status(404).send({ error: 'Vendor profile not found' });

        const where = { vendorId: vendor.id };
        if (status) where.status = status;
        if (from || to) {
            where.createdAt = {};
            if (from) where.createdAt.gte = new Date(from);
            if (to) where.createdAt.lte = new Date(to);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [payouts, total] = await Promise.all([
            prisma.payout.findMany({
                where,
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

    // Vendor requests a payout
    fastify.post('/payouts/request', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const dbUser = request.dbUser;
        const { amount } = request.body;

        if (!amount || amount <= 0) {
            return reply.status(400).send({ error: 'Valid amount is required' });
        }

        const vendor = await prisma.vendor.findUnique({ where: { userId: dbUser.id } });
        if (!vendor) return reply.status(404).send({ error: 'Vendor profile not found' });

        const payout = await prisma.payout.create({
            data: {
                vendorId: vendor.id,
                amount: parseFloat(amount),
                status: 'PENDING',
                periodStart: new Date(),
                periodEnd: new Date(),
                note: 'Requested by vendor',
            }
        });

        await prisma.notification.create({
            data: {
                userId: dbUser.id,
                title: 'Payout Requested',
                message: `Your payout request of $${parseFloat(amount).toLocaleString()} has been submitted. An admin will review it shortly.`,
            }
        });

        return { message: 'Payout request submitted', payout };
    });

    // Purchase/Verify bulk vendor subscription (simulated Razorpay callback / direct payment)
    fastify.post('/subscribe', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const dbUser = request.dbUser;
        const { paymentId, plan } = request.body; // e.g. "BULK_MONTHLY", "BULK_YEARLY"

        if (!dbUser) {
            return reply.status(401).send({ error: 'Unauthorized', message: 'User profile not synchronized' });
        }

        const vendor = await prisma.vendor.findUnique({
            where: { userId: dbUser.id }
        });

        if (!vendor) {
            return reply.status(404).send({ error: 'Vendor profile not found' });
        }

        const currentPeriodEnd = new Date();
        if (plan === 'BULK_YEARLY') {
            currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
        } else {
            currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
        }

        const updatedVendor = await prisma.$transaction(async (tx) => {
            // Update vendor type to BULK and maxListings to unlimited (999999)
            const v = await tx.vendor.update({
                where: { userId: dbUser.id },
                data: {
                    type: 'BULK',
                    maxListings: 999999,
                }
            });

            // Upsert the subscription
            await tx.vendorSubscription.upsert({
                where: { vendorId: v.id },
                update: {
                    plan: plan || 'BULK_MONTHLY',
                    status: 'active',
                    paymentId,
                    currentPeriodEnd,
                },
                create: {
                    vendorId: v.id,
                    plan: plan || 'BULK_MONTHLY',
                    status: 'active',
                    paymentId,
                    currentPeriodEnd,
                }
            });

            return v;
        });

        return { message: 'Subscription activated successfully', vendor: updatedVendor };
    });
}
