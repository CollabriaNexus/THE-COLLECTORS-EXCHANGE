import Razorpay from 'razorpay';
import crypto from 'crypto';

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
            return reply.status(401).send({ error: 'Unauthorized', message: 'User profile not synchronized' });
        }

        const { shippingAddress, city, state, zipCode, phone, items } = request.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return reply.status(400).send({ error: 'Cart is empty or invalid' });
        }

        // Calculate total amount on backend to prevent fraud
        let totalAmount = 0;
        const orderItemsData = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId }
            });

            if (!product) {
                return reply.status(404).send({ error: `Product not found: ${item.productId}` });
            }

            if (!product.isPublished) {
                return reply.status(422).send({ error: `Product not available: ${product.title}` });
            }

            totalAmount += product.price * (item.quantity || 1);
            orderItemsData.push({
                productId: product.id,
                quantity: item.quantity || 1,
                price: product.price,
            });
        }

        // Create order in DB with status "Pending"
        const dbOrder = await prisma.order.create({
            data: {
                userId: dbUser.id,
                status: 'Pending',
                totalAmount,
                shippingAddress,
                city,
                state,
                zipCode,
                phone,
                paymentStatus: 'Pending',
                items: {
                    create: orderItemsData
                }
            },
            include: {
                items: true
            }
        });

        // Initialize Razorpay Order
        const razorpay = getRazorpayInstance();
        let razorpayOrderId = null;

        if (razorpay) {
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
                return reply.status(500).send({ error: 'Failed to create payment gateway order', details: err.message });
            }
        } else {
            // Simulated/Mock Mode
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
            isMock: !razorpay,
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
            return reply.status(401).send({ error: 'Unauthorized', message: 'User profile not synchronized' });
        }

        const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = request.body;

        const dbOrder = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!dbOrder) {
            return reply.status(404).send({ error: 'Order not found' });
        }

        const razorpay = getRazorpayInstance();

        if (razorpay) {
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
                return reply.status(400).send({ success: false, error: 'Invalid payment signature' });
            }
        } else {
            // Mock verification (Always approve mock order transactions)
            console.log(`[SIMULATION] Verification bypassed for order ${orderId} (Mock Mode)`);
        }

        // Update DB Order to Paid and update status to Processing
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                paymentStatus: 'Paid',
                status: 'Processing',
                paymentId: razorpayPaymentId || `pay_mock_${Math.random().toString(36).substring(2, 11)}`,
                paymentSignature: razorpaySignature || `sig_mock_${Math.random().toString(36).substring(2, 11)}`,
            },
            include: { items: true }
        });

        // Clear the user's cart in the DB after successful payment
        await prisma.cartItem.deleteMany({
            where: { userId: dbUser.id }
        });

        // Mark purchased products as Sold and remove from public view
        for (const item of updatedOrder.items || []) {
            await prisma.product.update({
                where: { id: item.productId },
                data: {
                    status: 'Sold',
                    isPublished: false,
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
                message: 'Your order has been placed and payment received. We will process it shortly.',
            }
        });

        return {
            success: true,
            message: 'Payment verified and order is now being processed',
            order: updatedOrder
        };
    });
}
