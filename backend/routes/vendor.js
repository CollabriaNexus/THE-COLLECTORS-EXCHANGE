import {
  orderTotalFromItems,
  payoutFromItems,
  platformFeeFromItems,
  toRupees,
  toPaise,
} from '../lib/money.js';

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
      return reply.status(401).send({ error: 'User profile not synchronized' });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: dbUser.id },
      include: {},
    });

    if (!vendor) {
      return reply
        .status(404)
        .send({ error: 'Vendor profile not found. You must complete KYC first.' });
    }

    // Fetch active listing count
    const activeCount = await prisma.product.count({
      where: {
        sellerId: dbUser.id,
        status: { in: ['Pending', 'In_Review', 'Approved'] },
      },
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
      return reply.status(401).send({ error: 'User profile not synchronized' });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: dbUser.id },
    });

    if (!vendor) {
      return reply.status(404).send({ error: 'Vendor profile not found' });
    }

    // Fetch all products sold by this seller
    const products = await prisma.product.findMany({
      where: { sellerId: dbUser.id },
      select: { id: true },
    });

    const productIds = products.map((p) => p.id);

    // Fetch order items matching this vendor's products & offline-sold products
    const [orderItems, offlineSold] = await Promise.all([
      prisma.orderItem.findMany({
        where: {
          productId: { in: productIds },
          order: { status: { not: 'Cancelled' } },
        },
        include: { order: true },
      }),
      getOfflineSold(prisma, dbUser.id, null),
    ]);

    // Calculate statistics including both online order items and unrecorded offline sales
    const offlineRevenue = toRupees(offlineSold.reduce((sum, p) => sum + toPaise(p.price), 0));
    const offlineCount = offlineSold.length;

    const orderSales = orderTotalFromItems(orderItems);
    const totalSales = toRupees(toPaise(orderSales) + toPaise(offlineRevenue));
    const totalPlatformFees = platformFeeFromItems(orderItems);
    const totalItemsSold = orderItems.reduce((acc, item) => acc + item.quantity, 0) + offlineCount;
    const uniqueOrders = new Set(orderItems.map((item) => item.orderId)).size + offlineCount;

    return {
      totalSales,
      totalPlatformFees,
      netEarnings: payoutFromItems(orderItems),
      totalItemsSold,
      uniqueOrders,
      offlineSaleCount: offlineCount,
      offlineRevenue,
    };
  });

  // Helper: compute date filter from period string
  function getPeriodFilter(period) {
    const now = new Date();
    switch (period) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '10d':
        return new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
      case '15d':
        return new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'quarterly':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '6m':
        return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return null;
    }
  }

  // Helper: get offline-sold products (marked Sold by admin, no order items)
  async function getOfflineSold(prisma, sellerId, dateFilter) {
    const where = {
      sellerId,
      status: 'Sold',
      orderItems: { none: {} },
    };
    if (dateFilter) where.updatedAt = { gte: dateFilter };
    return prisma.product.findMany({ where });
  }

  // Get vendor analytics overview
  fastify.get(
    '/analytics/overview',
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      const dbUser = request.dbUser;
      const { period = '30d' } = request.query;
      const dateFilter = getPeriodFilter(period);

      const vendor = await prisma.vendor.findUnique({ where: { userId: dbUser.id } });
      if (!vendor) return reply.status(404).send({ error: 'Vendor profile not found' });

      const productIds = (
        await prisma.product.findMany({
          where: { sellerId: dbUser.id },
          select: { id: true },
        })
      ).map((p) => p.id);

      const orderWhere = {
        productId: { in: productIds },
        ...(dateFilter ? { createdAt: { gte: dateFilter } } : {}),
      };

      const [orderItems, offlineSold] = await Promise.all([
        prisma.orderItem.findMany({
          where: {
            ...orderWhere,
            order: { status: { not: 'Cancelled' } },
          },
          include: { order: true },
        }),
        getOfflineSold(prisma, dbUser.id, dateFilter),
      ]);

      // Same rule as /stats: every figure comes off the item rows, and netEarnings
      // is the payout formula itself — never `revenue - fees`.
      const orderRevenue = orderTotalFromItems(orderItems);
      const orderPlatformFees = platformFeeFromItems(orderItems);
      const orderNetEarnings = payoutFromItems(orderItems);
      const orderItemsSold = orderItems.reduce((acc, item) => acc + item.quantity, 0);
      const uniqueOrders = new Set(orderItems.map((item) => item.orderId)).size;

      const paidItems = orderItems.filter((item) => item.order.paymentStatus === 'Paid');
      const paidRevenue = orderTotalFromItems(paidItems);
      const paidPlatformFees = platformFeeFromItems(paidItems);

      const offlineRevenue = toRupees(offlineSold.reduce((sum, p) => sum + toPaise(p.price), 0));
      const offlineCount = offlineSold.length;

      const pendingPayouts = await prisma.payout.aggregate({
        where: { vendorId: vendor.id, status: { in: ['PENDING', 'PROCESSING'] } },
        _sum: { amount: true },
      });

      const totalListings = await prisma.product.count({ where: { sellerId: dbUser.id } });
      const activeListings = await prisma.product.count({
        where: { sellerId: dbUser.id, status: 'Approved', isPublished: true },
      });

      return {
        orderCount: uniqueOrders + offlineCount,
        saleCount: orderItemsSold + offlineCount,
        totalRevenue: toRupees(toPaise(orderRevenue) + toPaise(offlineRevenue)),
        totalPlatformFees: orderPlatformFees,
        netEarnings: orderNetEarnings,
        paidRevenue: toRupees(toPaise(paidRevenue) + toPaise(offlineRevenue)),
        paidPlatformFees,
        pendingPayout: pendingPayouts._sum.amount || 0,
        totalListings,
        activeListings,
        offlineSaleCount: offlineCount,
        offlineRevenue,
      };
    },
  );

  // Get customer interest funnel
  fastify.get(
    '/analytics/interest',
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      const dbUser = request.dbUser;
      const { period = '30d' } = request.query;
      const dateFilter = getPeriodFilter(period);

      const productIds = (
        await prisma.product.findMany({
          where: { sellerId: dbUser.id },
          select: { id: true },
        })
      ).map((p) => p.id);

      const eventWhere = {
        productId: { in: productIds },
        ...(dateFilter ? { createdAt: { gte: dateFilter } } : {}),
      };

      const [totalViews, uniqueViewers, cartAdds, checkoutStarts] = await Promise.all([
        prisma.productView.count({ where: eventWhere }),
        prisma.productView
          .groupBy({
            by: ['sessionId'],
            where: { ...eventWhere, sessionId: { not: null } },
            _count: true,
          })
          .then((r) => r.length),
        prisma.cartEvent.count({ where: { ...eventWhere, action: 'ADD' } }),
        prisma.checkoutEvent.count({ where: eventWhere }),
      ]);

      return { totalViews, uniqueViewers, cartAdds, checkoutStarts };
    },
  );

  // Get sales graph data (time-series grouped by day)
  fastify.get(
    '/analytics/sales-graph',
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      const dbUser = request.dbUser;
      const { period = '30d' } = request.query;
      const dateFilter = getPeriodFilter(period);

      const productIds = (
        await prisma.product.findMany({
          where: { sellerId: dbUser.id },
          select: { id: true },
        })
      ).map((p) => p.id);

      const [orderItems, offlineSold] = await Promise.all([
        prisma.orderItem.findMany({
          where: {
            productId: { in: productIds },
            ...(dateFilter ? { createdAt: { gte: dateFilter } } : {}),
            order: { status: { not: 'Cancelled' } },
          },
          include: { order: true },
          orderBy: { createdAt: 'asc' },
        }),
        getOfflineSold(prisma, dbUser.id, dateFilter),
      ]);

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

      // Add offline-sold products to graph
      for (const product of offlineSold) {
        const key = useMonthly
          ? product.updatedAt.toISOString().slice(0, 7)
          : product.updatedAt.toISOString().split('T')[0];
        if (!groupMap.has(key)) {
          groupMap.set(key, { date: key, sales: 0, orders: new Set(), items: 0 });
        }
        const entry = groupMap.get(key);
        entry.sales += product.price;
        entry.orders.add(`offline-${product.id}`);
        entry.items += 1;
      }

      const graphData = Array.from(groupMap.values()).map((d) => ({
        date: d.date,
        sales: d.sales,
        orders: d.orders.size,
        items: d.items,
      }));

      return graphData;
    },
  );

  // Get top-selling products
  fastify.get(
    '/analytics/top-products',
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      const dbUser = request.dbUser;
      const { period = '30d', limit = 10 } = request.query;
      const dateFilter = getPeriodFilter(period);

      const productIds = (
        await prisma.product.findMany({
          where: { sellerId: dbUser.id },
          select: { id: true },
        })
      ).map((p) => p.id);

      const [orderItems, offlineSold] = await Promise.all([
        prisma.orderItem.findMany({
          where: {
            productId: { in: productIds },
            ...(dateFilter ? { createdAt: { gte: dateFilter } } : {}),
            order: { status: { not: 'Cancelled' } },
          },
          include: { product: true },
        }),
        getOfflineSold(prisma, dbUser.id, dateFilter),
      ]);

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

      // Add offline-sold products
      for (const product of offlineSold) {
        if (!productMap.has(product.id)) {
          productMap.set(product.id, {
            id: product.id,
            title: product.title,
            image: product.image,
            price: product.price,
            totalRevenue: 0,
            quantitySold: 0,
            orderCount: new Set(),
          });
        }
        const entry = productMap.get(product.id);
        entry.totalRevenue += product.price;
        entry.quantitySold += 1;
        entry.orderCount.add(`offline-${product.id}`);
      }

      const topProducts = Array.from(productMap.values())
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, parseInt(limit, 10))
        .map((p) => ({ ...p, orderCount: p.orderCount.size }));

      return topProducts;
    },
  );

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

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [payouts, total] = await Promise.all([
      prisma.payout.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit, 10),
      }),
      prisma.payout.count({ where }),
    ]);

    return {
      payouts,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    };
  });

  // Update vendor pickup address
  fastify.patch(
    '/pickup-address',
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      const dbUser = request.dbUser;
      const { pickupAddress, pickupCity, pickupState, pickupZip, pickupContactName, pickupPhone } =
        request.body || {};

      const vendor = await prisma.vendor.findUnique({ where: { userId: dbUser.id } });
      if (!vendor) return reply.status(404).send({ error: 'Vendor profile not found' });

      const updatedVendor = await prisma.vendor.update({
        where: { userId: dbUser.id },
        data: {
          ...(pickupAddress !== undefined && { pickupAddress }),
          ...(pickupCity !== undefined && { pickupCity }),
          ...(pickupState !== undefined && { pickupState }),
          ...(pickupZip !== undefined && { pickupZip }),
          ...(pickupContactName !== undefined && { pickupContactName }),
          ...(pickupPhone !== undefined && { pickupPhone }),
        },
      });

      return { message: 'Pickup address updated', vendor: updatedVendor };
    },
  );

  // Rate a vendor (buyers after purchase, one rating per user)
  fastify.post('/rate', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const dbUser = request.dbUser;
    const { vendorId, rating } = request.body;

    if (!vendorId || !rating || rating < 1 || rating > 5) {
      return reply.status(400).send({ error: 'Valid vendorId and rating (1-5) required' });
    }

    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) return reply.status(404).send({ error: 'Vendor not found' });

    // Check user purchased from this vendor
    const vendorProductIds = (
      await prisma.product.findMany({
        where: { sellerId: vendor.userId },
        select: { id: true },
      })
    ).map((p) => p.id);

    const purchasedItem = await prisma.orderItem.findFirst({
      where: {
        productId: { in: vendorProductIds },
        order: { userId: dbUser.id, paymentStatus: 'Paid', status: { not: 'Cancelled' } },
      },
    });
    if (!purchasedItem) {
      return reply.status(403).send({ error: 'You must purchase from this vendor before rating' });
    }

    // Check for existing rating
    const existingRating = await prisma.rating.findUnique({
      where: { userId_vendorId: { userId: dbUser.id, vendorId } },
    });
    if (existingRating) {
      return reply.status(422).send({ error: 'You have already rated this vendor' });
    }

    await prisma.$transaction(async (tx) => {
      const currentVendor = await tx.vendor.findUnique({ where: { id: vendorId } });
      await tx.rating.create({
        data: { userId: dbUser.id, vendorId, rating },
      });
      const prevRating = currentVendor.rating * currentVendor.ratingCount;
      const newCount = currentVendor.ratingCount + 1;
      const newRating = (prevRating + rating) / newCount;
      await tx.vendor.update({
        where: { id: vendorId },
        data: { rating: newRating, ratingCount: newCount },
      });
    });

    return { message: 'Rating submitted' };
  });

  // Get vendor's sold orders (orders containing vendor's products)
  fastify.get('/orders', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const dbUser = request.dbUser;
    const productIds = (
      await prisma.product.findMany({
        where: { sellerId: dbUser.id },
        select: { id: true },
      })
    ).map((p) => p.id);

    const orderItems = await prisma.orderItem.findMany({
      where: { productId: { in: productIds } },
      include: {
        order: { include: { user: { select: { name: true } } } },
        product: { select: { id: true, title: true, image: true, price: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orderItems;
  });

  // Vendor marks order item as shipped with tracking ID
  fastify.patch(
    '/orders/:orderItemId/ship',
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      const { orderItemId } = request.params;
      const { trackingID } = request.body;
      const dbUser = request.dbUser;

      const orderItem = await prisma.orderItem.findUnique({
        where: { id: orderItemId },
        include: { product: true, order: { include: { items: true } } },
      });

      if (!orderItem) return reply.status(404).send({ error: 'Order item not found' });
      if (orderItem.product.sellerId !== dbUser.id)
        return reply.status(403).send({ error: 'Not your product' });
      if (orderItem.status === 'Shipped')
        return reply.status(422).send({ error: 'Already marked as shipped' });

      // The order must be a confirmed, non-terminal order. Blocks shipping an
      // unpaid/unconfirmed (Pending) order and reviving a Cancelled/Delivered one.
      if (orderItem.order.status === 'Pending') {
        return reply
          .status(422)
          .send({ error: 'Cannot ship: this order has not been paid/confirmed yet' });
      }
      if (['Cancelled', 'Delivered'].includes(orderItem.order.status)) {
        return reply
          .status(422)
          .send({ error: `Cannot ship a ${orderItem.order.status.toLowerCase()} order` });
      }

      // Update the individual order item status only
      await prisma.orderItem.update({
        where: { id: orderItemId },
        data: { status: 'Shipped', trackingID: trackingID || null },
      });

      // Roll the order up to Shipped only once every item is shipped AND the order
      // is still in Processing (re-checked so a concurrent cancel isn't overwritten).
      const allItems = await prisma.orderItem.findMany({
        where: { orderId: orderItem.orderId },
      });
      const allShipped = allItems.every((item) => item.status === 'Shipped');
      if (allShipped) {
        const freshOrder = await prisma.order.findUnique({
          where: { id: orderItem.orderId },
          select: { status: true },
        });
        if (freshOrder?.status === 'Processing') {
          await prisma.order.update({
            where: { id: orderItem.orderId },
            data: { status: 'Shipped' },
          });
        }
      }

      return { message: 'Marked as shipped', trackingID };
    },
  );
}
