import { CreateCouponSchema, UpdateCouponSchema, ApplyCouponSchema, CouponIdParam } from '../schemas/coupon.js';

export default async function couponRoutes(fastify) {
    const { prisma } = fastify;

    // ============== ADMIN COUPON MANAGEMENT ==============

    // Generate a coupon for a product (expires old ones, one-time use, auto-generated code)
    fastify.post('/admin/coupons/generate', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const { productId, discountPercent } = request.body || {};
        if (!productId) {
            return reply.status(400).send({ error: 'productId is required' });
        }

        // Deactivate any existing active coupons for this product
        await prisma.coupon.updateMany({
            where: { productId, isActive: true },
            data: { isActive: false },
        });

        // Generate a unique code
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code;
        let attempts = 0;
        do {
            code = '';
            for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
            attempts++;
        } while (await prisma.coupon.findUnique({ where: { code } }) && attempts < 10);

        const coupon = await prisma.coupon.create({
            data: {
                code,
                discountPercent: discountPercent || 10,
                productId,
                maxUses: 1,
                maxUsesPerUser: 1,
                isActive: true,
                createdById: request.dbUser.id,
            },
        });

        return { message: 'Coupon generated', coupon };
    });

    fastify.post('/admin/coupons', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const data = CreateCouponSchema.parse(request.body);

        const existing = await prisma.coupon.findUnique({ where: { code: data.code } });
        if (existing) {
            return reply.status(409).send({ error: 'Coupon code already exists' });
        }

        const coupon = await prisma.coupon.create({
            data: {
                code: data.code,
                description: data.description,
                discountPercent: data.discountPercent,
                productId: data.productId || null,
                minPurchase: data.minPurchase,
                maxUses: data.maxUses,
                maxUsesPerUser: data.maxUsesPerUser,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
                createdById: request.dbUser.id,
            },
        });

        return { message: 'Coupon created successfully', coupon };
    });

    fastify.get('/admin/coupons', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const { page = 1, limit = 20, productId } = request.query;
        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

        const where = {};
        if (productId) where.productId = productId;

        const [coupons, total] = await Promise.all([
            prisma.coupon.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit, 10),
                include: { _count: { select: { usages: true } } },
            }),
            prisma.coupon.count({ where }),
        ]);

        return {
            coupons,
            pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total, pages: Math.ceil(total / parseInt(limit, 10)) },
        };
    });

    fastify.get('/admin/coupons/:id', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const { id } = CouponIdParam.parse(request.params);

        const coupon = await prisma.coupon.findUnique({
            where: { id },
            include: {
                usages: {
                    include: { user: { select: { name: true, email: true } } },
                    orderBy: { usedAt: 'desc' },
                },
            },
        });

        if (!coupon) {
            return reply.status(404).send({ error: 'Coupon not found' });
        }

        return coupon;
    });

    fastify.patch('/admin/coupons/:id', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const { id } = CouponIdParam.parse(request.params);
        const data = UpdateCouponSchema.parse(request.body);

        const existing = await prisma.coupon.findUnique({ where: { id } });
        if (!existing) {
            return reply.status(404).send({ error: 'Coupon not found' });
        }

        if (data.code !== undefined && data.code !== existing.code) {
            const conflict = await prisma.coupon.findUnique({ where: { code: data.code } });
            if (conflict) {
                return reply.status(409).send({ error: 'Coupon code already exists' });
            }
        }

        const updateData = {};
        if (data.code !== undefined) updateData.code = data.code;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.discountPercent !== undefined) updateData.discountPercent = data.discountPercent;
        if (data.productId !== undefined) updateData.productId = data.productId;
        if (data.minPurchase !== undefined) updateData.minPurchase = data.minPurchase;
        if (data.maxUses !== undefined) updateData.maxUses = data.maxUses;
        if (data.maxUsesPerUser !== undefined) updateData.maxUsesPerUser = data.maxUsesPerUser;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;
        if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

        const coupon = await prisma.coupon.update({
            where: { id },
            data: updateData,
        });

        return { message: 'Coupon updated successfully', coupon };
    });

    fastify.delete('/admin/coupons/:id', { preValidation: [fastify.authenticateAdmin] }, async (request, reply) => {
        const { id } = CouponIdParam.parse(request.params);

        const existing = await prisma.coupon.findUnique({ where: { id } });
        if (!existing) {
            return reply.status(404).send({ error: 'Coupon not found' });
        }

        await prisma.coupon.delete({ where: { id } });

        return { message: 'Coupon deleted successfully' };
    });

    // ============== APPLY COUPON TO ORDER ==============

    async function validateCoupon(coupon, userId) {
        if (!coupon.isActive) {
            return { valid: false, error: 'Coupon is no longer active' };
        }
        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
            return { valid: false, error: 'Coupon has expired' };
        }
        if (coupon.maxUses > 0) {
            const usageCount = await prisma.couponUsage.count({ where: { couponId: coupon.id } });
            if (usageCount >= coupon.maxUses) {
                return { valid: false, error: 'Coupon usage limit reached' };
            }
        }
        if (coupon.maxUsesPerUser > 0 && userId) {
            const userUsageCount = await prisma.couponUsage.count({ where: { couponId: coupon.id, userId } });
            if (userUsageCount >= coupon.maxUsesPerUser) {
                return { valid: false, error: 'You have already used this coupon the maximum number of times' };
            }
        }
        return { valid: true };
    }

    fastify.post('/apply-coupon', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const dbUser = request.dbUser;
        if (!dbUser) {
            return reply.status(401).send({ error: 'User profile not synchronized' });
        }

        const { code, orderId } = ApplyCouponSchema.parse(request.body);

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { product: true } } },
        });

        if (!order) {
            return reply.status(404).send({ error: 'Order not found' });
        }
        if (order.userId !== dbUser.id) {
            return reply.status(403).send({ error: 'This order does not belong to you' });
        }
        if (order.paymentStatus === 'Paid') {
            return reply.status(422).send({ error: 'Order has already been paid' });
        }
        if (['Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(order.status)) {
            return reply.status(422).send({ error: 'Order has already been processed' });
        }
        if (order.couponId) {
            return reply.status(422).send({ error: 'A coupon has already been applied to this order' });
        }

        const coupon = await prisma.coupon.findUnique({ where: { code } });
        if (!coupon) {
            return reply.status(404).send({ error: 'Coupon not found' });
        }

        const validation = await validateCoupon(coupon, dbUser.id);
        if (!validation.valid) {
            return reply.status(422).send({ error: validation.error });
        }

        // Calculate eligible items for this coupon
        let eligibleTotal = 0;
        for (const item of order.items) {
            if (!coupon.productId || item.productId === coupon.productId) {
                eligibleTotal += item.price * item.quantity;
            }
        }

        if (eligibleTotal === 0) {
            return reply.status(422).send({ error: 'Coupon does not apply to any items in this order' });
        }

        if (coupon.minPurchase > 0 && eligibleTotal < coupon.minPurchase) {
            return reply.status(422).send({
                error: `Minimum purchase of ₹${coupon.minPurchase.toLocaleString('en-IN')} required for this coupon`,
            });
        }

        const discountAmount = Math.round(eligibleTotal * coupon.discountPercent / 100 * 100) / 100;
        const newTotal = Math.max(0, order.totalAmount - discountAmount);

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                couponId: coupon.id,
                discountPercent: coupon.discountPercent,
                discountAmount,
                subtotalBeforeDiscount: order.totalAmount,
                totalAmount: newTotal,
            },
        });

        return {
            message: 'Coupon applied successfully',
            order: updatedOrder,
            discountPercent: coupon.discountPercent,
            discountAmount,
            newTotal,
        };
    });
}
