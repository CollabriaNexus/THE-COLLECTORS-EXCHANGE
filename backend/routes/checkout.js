import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import {
  CreateOrderSchema,
  VerifyPaymentSchema,
  ValidateCouponSchema,
} from '../schemas/checkout.js';

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

    if (!keyId || !keySecret || keyId.includes('xxxx') || keySecret.includes('your-')) {
      // Simulated/Mock mode fallback
      return null;
    }

    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  };

  // Validate coupon against cart items (no order needed)
  fastify.post(
    '/validate-coupon',
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      const { code, items } = ValidateCouponSchema.parse(request.body);

      const coupon = await prisma.coupon.findUnique({ where: { code } });
      if (!coupon) {
        return reply.status(404).send({ valid: false, error: 'Coupon not found' });
      }
      if (!coupon.isActive) {
        return reply.status(422).send({ valid: false, error: 'Coupon is no longer active' });
      }
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return reply.status(422).send({ valid: false, error: 'Coupon has expired' });
      }

      let eligibleTotal = 0;
      for (const item of items) {
        if (!coupon.productId || item.productId === coupon.productId) {
          eligibleTotal += item.price * (item.quantity || 1);
        }
      }

      if (eligibleTotal === 0) {
        return reply
          .status(422)
          .send({ valid: false, error: 'Coupon does not apply to any items in your cart' });
      }

      if (coupon.minPurchase > 0 && eligibleTotal < coupon.minPurchase) {
        return reply.status(422).send({
          valid: false,
          error: `Minimum purchase of ₹${coupon.minPurchase.toLocaleString('en-IN')} required`,
        });
      }

      const discountPercent = coupon.discountPercent;
      const discountAmount = Math.round(((eligibleTotal * discountPercent) / 100) * 100) / 100;

      return {
        valid: true,
        couponCode: coupon.code,
        discountPercent,
        discountAmount,
        eligibleTotal,
      };
    },
  );

  // Create payment order
  fastify.post(
    '/create-order',
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      const dbUser = request.dbUser;
      if (!dbUser) {
        return reply.status(401).send({ error: 'User profile not synchronized' });
      }

      const { shippingAddress, city, state, zipCode, phone, items, paymentMethod, couponCode } =
        CreateOrderSchema.parse(request.body);

      // Fetch user's cart to cross-reference against submitted items
      const cartItems = await prisma.cartItem.findMany({
        where: { userId: dbUser.id },
        include: { product: true },
      });
      const cartProductIds = new Set(cartItems.map((ci) => ci.productId));

      // Calculate total amount on backend to prevent fraud
      let totalAmount = 0;
      let totalPlatformFee = 0;
      let discountPercent = 0;
      let discountAmount = 0;
      const orderItemsData = [];

      let dbOrder;
      try {
        dbOrder = await prisma.$transaction(async (tx) => {
          for (const item of items) {
            const product = await tx.product.findUnique({
              where: { id: item.productId },
            });

            if (!product) {
              throw new OrderError(404, `Product not found: ${item.productId}`);
            }

            if (product.status === 'Sold') {
              throw new OrderError(422, `Product not available: ${product.title}`);
            }

            // Only approved listings can be purchased
            if (product.status !== 'Approved') {
              throw new OrderError(422, `Product not available for purchase: ${product.title}`);
            }

            // Verify item is in user's cart
            if (!cartProductIds.has(product.id)) {
              throw new OrderError(422, `Product ${product.title} is not in your cart`);
            }

            // Prevent seller buying their own product
            if (product.sellerId === dbUser.id) {
              throw new OrderError(422, 'You cannot purchase your own product');
            }

            // Listings are unique one-of-a-kind items — never trust a client
            // quantity; a single order line can only ever be one unit.
            const qty = 1;
            const itemPrice = product.price;
            const commPct = product.commissionPercent ?? 10;
            const fee = Math.round(((itemPrice * commPct) / 100) * 100) / 100; // round to 2 decimals

            totalAmount += itemPrice * qty;
            totalPlatformFee += fee * qty;
            orderItemsData.push({
              productId: product.id,
              quantity: qty,
              price: itemPrice,
              commissionPercent: commPct,
              platformFee: fee,
            });
          }

          // Validate & apply coupon inside the transaction so an invalid coupon
          // rolls back the order (no orphaned Pending order) and the discount is
          // computed against eligible items only. Usage is recorded later, on
          // successful payment (verify-payment), so an abandoned checkout never
          // consumes a limited-use coupon.
          let couponData = {};
          if (couponCode) {
            const coupon = await tx.coupon.findUnique({ where: { code: couponCode } });
            if (!coupon) {
              throw new OrderError(404, 'Coupon not found');
            }
            if (!coupon.isActive) {
              throw new OrderError(422, 'Coupon is no longer active');
            }
            if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
              throw new OrderError(422, 'Coupon has expired');
            }
            if (coupon.maxUses > 0) {
              const usageCount = await tx.couponUsage.count({ where: { couponId: coupon.id } });
              if (usageCount >= coupon.maxUses) {
                throw new OrderError(422, 'Coupon usage limit reached');
              }
            }
            if (coupon.maxUsesPerUser > 0) {
              const userUsageCount = await tx.couponUsage.count({
                where: { couponId: coupon.id, userId: dbUser.id },
              });
              if (userUsageCount >= coupon.maxUsesPerUser) {
                throw new OrderError(
                  422,
                  'You have already used this coupon the maximum number of times',
                );
              }
            }

            // Discount applies only to items the coupon is scoped to
            let eligibleTotal = 0;
            for (const oi of orderItemsData) {
              if (!coupon.productId || oi.productId === coupon.productId) {
                eligibleTotal += oi.price * oi.quantity;
              }
            }
            if (eligibleTotal === 0) {
              throw new OrderError(422, 'Coupon does not apply to any items in your cart');
            }
            if (coupon.minPurchase > 0 && eligibleTotal < coupon.minPurchase) {
              throw new OrderError(
                422,
                `Minimum purchase of ₹${coupon.minPurchase.toLocaleString('en-IN')} required`,
              );
            }

            discountPercent = coupon.discountPercent;
            discountAmount = Math.round(((eligibleTotal * discountPercent) / 100) * 100) / 100;
            const couponFinalAmount = Math.max(0, totalAmount - discountAmount);
            couponData = {
              couponId: coupon.id,
              discountPercent,
              discountAmount,
              subtotalBeforeDiscount: totalAmount,
              totalAmount: couponFinalAmount,
            };
          }

          // Generate sequential display ID (HOR00001, HOR00002, ...)
          const lastOrder = await tx.order.findFirst({
            orderBy: { displayId: 'desc' },
            select: { displayId: true },
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
              ...couponData,
              items: {
                create: orderItemsData,
              },
            },
            include: {
              items: true,
            },
          });
        });
      } catch (err) {
        if (err instanceof OrderError) {
          return reply.status(err.statusCode).send({ error: err.message });
        }
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
          request.log.error(
            { prismaCode: err.code, prismaMeta: err.meta, route: 'create-order' },
            'Prisma error in checkout',
          );
          return reply.status(409).send({
            error: 'Database Error',
            message: 'Could not create order. Please try again.',
          });
        }
        throw err;
      }

      // Coupon (if any) was validated and applied atomically inside the transaction
      // above. Usage is recorded on successful payment (verify-payment), not here,
      // so an abandoned checkout never consumes a limited-use coupon.
      const finalAmount = Math.max(0, totalAmount - discountAmount);

      // Initialize Razorpay Order (skip for COD)
      const razorpay = getRazorpayInstance();
      let razorpayOrderId = null;

      if (paymentMethod === 'cod') {
        razorpayOrderId = null;
      } else if (razorpay) {
        try {
          const options = {
            amount: Math.round(finalAmount * 100),
            currency: 'INR',
            receipt: `receipt_order_${dbOrder.id}`,
          };
          const rpOrder = await razorpay.orders.create(options);
          razorpayOrderId = rpOrder.id;

          await prisma.order.update({
            where: { id: dbOrder.id },
            data: { paymentOrderId: razorpayOrderId },
          });
        } catch (err) {
          request.log.error(err);
          return reply.status(500).send({ error: 'Failed to create payment gateway order' });
        }
      } else if (process.env.NODE_ENV === 'production') {
        return reply.status(500).send({ error: 'Payment gateway not configured' });
      } else {
        razorpayOrderId = `order_mock_${Math.random().toString(36).substring(2, 11)}`;
        await prisma.order.update({
          where: { id: dbOrder.id },
          data: { paymentOrderId: razorpayOrderId },
        });
      }

      return {
        success: true,
        orderId: dbOrder.id,
        amount: finalAmount,
        platformFee: totalPlatformFee,
        razorpayOrderId,
        isMock: !razorpay && paymentMethod !== 'cod',
        isCOD: paymentMethod === 'cod',
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
        couponApplied: !!couponCode,
        discountPercent,
        discountAmount,
        user: {
          name: dbUser.name,
          email: dbUser.email,
          phone: phone || dbUser.phone || '',
        },
      };
    },
  );

  // Verify payment signature
  fastify.post(
    '/verify-payment',
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      const dbUser = request.dbUser;
      if (!dbUser) {
        return reply.status(401).send({ error: 'User profile not synchronized' });
      }

      const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
        VerifyPaymentSchema.parse(request.body);

      const dbOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
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
        hmac.update(razorpayOrderId + '|' + razorpayPaymentId);
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature !== razorpaySignature) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: 'Failed',
            },
          });
          return reply.status(400).send({ error: 'Invalid payment signature' });
        }
      } else if (process.env.NODE_ENV === 'production') {
        return reply.status(500).send({ error: 'Payment gateway not configured' });
      } else {
        // Mock verification (dev only)
        console.log(`[SIMULATION] Verification bypassed for order ${orderId} (Mock Mode)`);
      }

      const isCOD = dbOrder.paymentMethod === 'cod';

      // Atomically claim each unique item BEFORE finalizing the order, so the same
      // one-of-a-kind product can never be sold twice by two racing checkouts. The
      // guarded updateMany only flips Approved -> Sold; a count of 0 means another
      // paid order already claimed the item.
      const claimedProductIds = [];
      const soldOutProductIds = [];
      for (const item of dbOrder.items || []) {
        const claim = await prisma.product.updateMany({
          where: { id: item.productId, status: 'Approved' },
          data: { status: 'Sold' },
        });
        if (claim.count === 1) claimedProductIds.push(item.productId);
        else soldOutProductIds.push(item.productId);
      }

      if (soldOutProductIds.length > 0) {
        // Release anything we did manage to claim so it returns to the pool
        if (claimedProductIds.length > 0) {
          await prisma.product.updateMany({
            where: { id: { in: claimedProductIds } },
            data: { status: 'Approved' },
          });
        }
        // The order can't be fulfilled — cancel it and flag captured payment for refund
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'Cancelled',
            paymentStatus: isCOD ? 'Failed' : 'Refunded',
          },
        });
        await prisma.notification.create({
          data: {
            userId: dbUser.id,
            title: 'Order Could Not Be Completed',
            message: isCOD
              ? 'One or more items in your order were no longer available, so the order was cancelled.'
              : 'One or more items in your order were no longer available. Your payment will be refunded.',
          },
        });
        return reply.status(409).send({
          error: 'One or more items in your order are no longer available',
          soldOut: soldOutProductIds,
          refundRequired: !isCOD,
        });
      }

      // All items claimed — finalize the order (COD keeps Pending payment, online marks Paid)
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: isCOD ? 'Pending' : 'Paid',
          status: 'Processing',
          paymentId: isCOD
            ? null
            : razorpayPaymentId || `pay_mock_${Math.random().toString(36).substring(2, 11)}`,
          paymentSignature: isCOD
            ? null
            : razorpaySignature || `sig_mock_${Math.random().toString(36).substring(2, 11)}`,
        },
        include: { items: true },
      });

      // Remove claimed items from every user's cart and wishlist
      for (const productId of claimedProductIds) {
        await prisma.cartItem.deleteMany({ where: { productId } });
        await prisma.wishlistItem.deleteMany({ where: { productId } });
      }

      // Record coupon usage (if coupon was applied)
      if (updatedOrder.couponId) {
        const existingUsage = await prisma.couponUsage.findFirst({
          where: { couponId: updatedOrder.couponId, orderId: updatedOrder.id },
        });
        if (!existingUsage) {
          await prisma.couponUsage.create({
            data: {
              couponId: updatedOrder.couponId,
              orderId: updatedOrder.id,
              userId: dbUser.id,
            },
          });
        }
      }

      // Notify buyer that order is confirmed
      await prisma.notification.create({
        data: {
          userId: dbUser.id,
          title: 'Order Confirmed',
          message: isCOD
            ? 'Your order has been placed. Keep cash ready — payment will be collected on delivery.'
            : 'Your order has been placed and payment received. We will process it shortly.',
        },
      });

      return {
        success: true,
        message: isCOD
          ? 'Order placed successfully. Pay on delivery.'
          : 'Payment verified and order is now being processed',
        order: updatedOrder,
      };
    },
  );
}
