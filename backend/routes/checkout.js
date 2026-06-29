import Razorpay from 'razorpay';
import crypto from 'crypto';
import { CreateOrderSchema, VerifyPaymentSchema } from '../schemas/checkout.js';

class OrderError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

/**
 * Checkout and Payment Routes
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function checkoutRoutes(fastify) {
    const { prisma } = fastify;

    // Helper to get Razorpay instance
    const getRazorpayInstance = () => {
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
            // Simulated/Mock mode fallback
            return null;
        }

        return new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });
    };

    // Create payment order
    fastify.post('/create-order', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const dbUser = request.dbUser;
        if (!dbUser) {
            return reply.status(401).send({ error: 'User profile not synchronized' });
        }

        const { shippingAddress, city, state, zipCode, phone, items, paymentMethod } = CreateOrderSchema.parse(request.body);

        // Fetch user's cart to cross-reference against submitted items
        const cartItems = await prisma.cartItem.findMany({
            where: { userId: dbUser.id },
            include: { product: true }
        });
        const cartProductIds = new Set(cartItems.map(ci => ci.productId));

        // Calculate total amount on backend to prevent fraud
        let totalAmount = 0;
        const orderItemsData = [];

        let dbOrder;
        try {
            dbOrder = await prisma.$transaction(async (tx) => {
            for (const item of items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId }
                });

                if (!product) {
                    throw new OrderError(404, `Product not found: ${item.productId}`);
                }

                if (product.status === 'Sold') {
                    throw new OrderError(422, `Product not available: ${product.title}`);
                }

                // Verify item is in user's cart
                if (!cartProductIds.has(product.id)) {
                    throw new OrderError(422, `Product ${product.title} is not in your cart`);
                }

                // Prevent seller buying their own product
                if (product.sellerId === dbUser.id) {
                    throw new OrderError(422, 'You cannot purchase your own product');
                }

                totalAmount += product.price * (item.quantity || 1);
                orderItemsData.push({
                    productId: product.id,
                    quantity: item.quantity || 1,
                    price: product.price,
                });
            }

            // Generate sequential display ID (HOR00001, HOR00002, ...)
            const lastOrder = await tx.order.findFirst({
                orderBy: { displayId: 'desc' },
                select: { displayId: true }
            });
            let nextSeq = 1;
            if (lastOrder?.displayId) {
                const num = parseInt(lastOrder.displayId.replace('HOR', ''), 10);
                if (!isNaN(num)) nextSeq = num + 1;
            }
            const displayId = 'HOR' + String(nextSeq).padStart(5, '0');

            return await tx.order.create({
                data: {
                    userId: dbUser.id,
                    displayId,
                    status: 'Pending',
                    totalAmount,
                    shippingAddress,
                    city,
                    state,
                    zipCode,
                    phone,
                    paymentStatus: 'Pending',
                    paymentMethod: paymentMethod || 'online',
                    items: {
                        create: orderItemsData
                    }
                },
                include: {
                    items: true
                }
            });
            });
        } catch (err) {
            if (err instanceof OrderError) {
                return reply.status(err.statusCode).send({ error: err.message });
            }
            throw err;
        }

        // Initialize Razorpay Order (skip for COD)
        const razorpay = getRazorpayInstance();
        let razorpayOrderId = null;

        if (paymentMethod === 'cod') {
            // COD: No Razorpay order needed
            razorpayOrderId = null;
        } else if (razorpay) {
            try {
                // Razorpay expects amount in paise (1 INR = 100 paise)
                const options = {
                    amount: Math.round(totalAmount * 100),
                    currency: 'INR',
                    receipt: `receipt_order_${dbOrder.id}`,
                };
                const rpOrder = await razorpay.orders.create(options);
                razorpayOrderId = rpOrder.id;

                // Save Razorpay order ID to the order record
                await prisma.order.update({
                    where: { id: dbOrder.id },
                    data: { paymentOrderId: razorpayOrderId }
                });
            } catch (err) {
                request.log.error(err);
                return reply.status(500).send({ error: 'Failed to create payment gateway order' });
            }
        } else if (process.env.NODE_ENV === 'production') {
            return reply.status(500).send({ error: 'Payment gateway not configured' });
        } else {
            // Simulated/Mock Mode (dev only)
            razorpayOrderId = `order_mock_${Math.random().toString(36).substring(2, 11)}`;
            await prisma.order.update({
                where: { id: dbOrder.id },
                data: { paymentOrderId: razorpayOrderId }
            });
        }

        return {
            success: true,
            orderId: dbOrder.id,
            amount: totalAmount,
            razorpayOrderId,
            isMock: !razorpay && paymentMethod !== 'cod',
            isCOD: paymentMethod === 'cod',
            keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
            user: {
                name: dbUser.name,
                email: dbUser.email,
                phone: phone || dbUser.phone || '',
            }
        };
    });

    // Verify payment signature
    fastify.post('/verify-payment', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const dbUser = request.dbUser;
        if (!dbUser) {
            return reply.status(401).send({ error: 'User profile not synchronized' });
        }

        const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = VerifyPaymentSchema.parse(request.body);

        const dbOrder = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!dbOrder) {
            return reply.status(404).send({ error: 'Order not found' });
        }

        if (dbOrder.userId !== dbUser.id) {
            return reply.status(403).send({ error: 'This order does not belong to you' });
        }

        if (dbOrder.paymentStatus === 'Paid') {
            return reply.status(422).send({ error: 'Order has already been paid' });
        }

        // Prevent re-processing an order that's already been confirmed
        if (['Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(dbOrder.status)) {
            return reply.status(422).send({ error: 'Order has already been processed' });
        }

        const razorpay = getRazorpayInstance();

        if (dbOrder.paymentMethod === 'cod') {
            // COD orders: skip signature verification, mark as confirmed
            console.log(`[COD] Payment on delivery confirmed for order ${orderId}`);
        } else if (razorpay) {
            // Live verification
            const keySecret = process.env.RAZORPAY_KEY_SECRET;
            const hmac = crypto.createHmac('sha256', keySecret);
            hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
            const generatedSignature = hmac.digest('hex');

            if (generatedSignature !== razorpaySignature) {
                await prisma.order.update({
                    where: { id: orderId },
                    data: {
                        paymentStatus: 'Failed',
                    }
                });
                return reply.status(400).send({ error: 'Invalid payment signature' });
            }
        } else if (process.env.NODE_ENV === 'production') {
            return reply.status(500).send({ error: 'Payment gateway not configured' });
        } else {
            // Mock verification (dev only)
            console.log(`[SIMULATION] Verification bypassed for order ${orderId} (Mock Mode)`);
        }

        // Update DB Order — COD keeps Pending payment status, online marks as Paid
        const isCOD = dbOrder.paymentMethod === 'cod';
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                paymentStatus: isCOD ? 'Pending' : 'Paid',
                status: 'Processing',
                paymentId: isCOD
                    ? null
                    : (razorpayPaymentId || `pay_mock_${Math.random().toString(36).substring(2, 11)}`),
                paymentSignature: isCOD
                    ? null
                    : (razorpaySignature || `sig_mock_${Math.random().toString(36).substring(2, 11)}`),
            },
            include: { items: true }
        });

        // Mark purchased products as Sold
        for (const item of updatedOrder.items || []) {
            await prisma.product.update({
                where: { id: item.productId },
                data: {
                    status: 'Sold',
                }
            });
            // Remove from all users' carts
            await prisma.cartItem.deleteMany({
                where: { productId: item.productId }
            });
            // Remove from all users' wishlists
            await prisma.wishlistItem.deleteMany({
                where: { productId: item.productId }
            });
        }

        // Notify buyer that order is confirmed
        await prisma.notification.create({
            data: {
                userId: dbUser.id,
                title: 'Order Confirmed',
                message: isCOD
                    ? 'Your order has been placed. Keep cash ready — payment will be collected on delivery.'
                    : 'Your order has been placed and payment received. We will process it shortly.',
            }
        });

        return {
            success: true,
            message: isCOD ? 'Order placed successfully. Pay on delivery.' : 'Payment verified and order is now being processed',
            order: updatedOrder
        };
    });
}
