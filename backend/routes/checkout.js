import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import {
  CreateOrderSchema,
  VerifyPaymentSchema,
  ValidateCouponSchema,
} from '../schemas/checkout.js';
import {
  applyDiscountToItems,
  orderTotalFromItems,
  platformFeeFromItems,
  toPaise,
} from '../lib/money.js';
import { claimCouponUse, OrderError } from '../lib/coupon.js';

/**
 * Last line of defence for the money invariant:
 *
 *     sum(item payouts) + sum(platformFee) == Order.totalAmount
 *
 * Payout is `price - platformFee` per unit, so this reduces to
 * `sum(price * qty) == totalAmount` (the fee term cancels — see lib/money.js).
 * Checked in paise. If it ever trips, the order is refused rather than written:
 * a failed checkout is recoverable, an order that quietly disburses more than it
 * collected is not.
 */
function assertOrderReconciles(totalAmount, items) {
  const itemsPaise = items.reduce((sum, i) => sum + toPaise(i.price) * i.quantity, 0);
  if (itemsPaise !== toPaise(totalAmount)) {
    throw new OrderError(
      500,
      'Order failed an internal consistency check and was not created. Please try again.',
    );
  }
}

// Every order is priced and captured in this currency; the gateway is asked to
// confirm it back to us on verification.
const CURRENCY = 'INR';

// Constant-time comparison of two hex signatures. A plain !== leaks how many
// leading bytes matched, which is enough to forge a signature byte by byte.
const signaturesMatch = (a, b) => {
  const bufA = Buffer.from(String(a ?? ''), 'utf8');
  const bufB = Buffer.from(String(b ?? ''), 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

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
          // computed against eligible items only.
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

            await claimCouponUse(tx, coupon, dbUser.id);

            // Discount applies only to items the coupon is scoped to
            const isEligible = (oi) => !coupon.productId || oi.productId === coupon.productId;
            let eligibleTotal = 0;
            for (const oi of orderItemsData) {
              if (isEligible(oi)) eligibleTotal += oi.price * oi.quantity;
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

            // Push the discount down into the item rows. Writing it only onto
            // Order.totalAmount (what this used to do) made it invisible to the
            // payout, which reads price/platformFee off the ITEM — the platform
            // then collected the discounted total but disbursed against the full
            // undiscounted price, losing the discount on every couponed sale.
            const discounted = applyDiscountToItems(orderItemsData, discountAmount, isEligible);
            orderItemsData.splice(0, orderItemsData.length, ...discounted);
            totalPlatformFee = platformFeeFromItems(orderItemsData);

            // The items are now the single source of truth for what the buyer
            // owes, so derive the total from them rather than re-deriving it.
            const couponFinalAmount = orderTotalFromItems(orderItemsData);
            assertOrderReconciles(couponFinalAmount, orderItemsData);

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

      // Coupon (if any) was validated, limit-checked and applied atomically inside
      // the transaction above; the order now holds the coupon's use. The
      // CouponUsage audit row is still written on successful payment.
      //
      // Derive the amount the gateway is asked for from the item rows — the same
      // source the order total and the payouts come from — so the buyer can never
      // be charged something the ledger doesn't reconcile to.
      const finalAmount = orderTotalFromItems(orderItemsData);
      assertOrderReconciles(finalAmount, orderItemsData);

      // Initialize Razorpay Order (skip for COD)
      const razorpay = getRazorpayInstance();
      let razorpayOrderId = null;

      if (paymentMethod === 'cod') {
        razorpayOrderId = null;
      } else if (razorpay) {
        try {
          const options = {
            amount: Math.round(finalAmount * 100),
            currency: CURRENCY,
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
      const isCOD = dbOrder.paymentMethod === 'cod';

      if (isCOD) {
        // COD orders: skip signature verification, mark as confirmed
        console.log(`[COD] Payment on delivery confirmed for order ${orderId}`);
      } else if (razorpay) {
        // Live verification.
        //
        // The signature only proves the gateway signed *some* (gateway order,
        // payment) pair — it says nothing about WHICH order was paid. Bind the
        // payment to the gateway order we created for this db order first, or a
        // genuine signature from a cheap order can be replayed to pay off an
        // expensive one.
        if (!dbOrder.paymentOrderId || razorpayOrderId !== dbOrder.paymentOrderId) {
          request.log.error(
            { orderId, razorpayOrderId, expected: dbOrder.paymentOrderId },
            'Payment order id does not match the order being verified',
          );
          return reply.status(400).send({ error: 'Payment does not belong to this order' });
        }

        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        const hmac = crypto.createHmac('sha256', keySecret);
        hmac.update(razorpayOrderId + '|' + razorpayPaymentId);
        const generatedSignature = hmac.digest('hex');

        if (!signaturesMatch(generatedSignature, razorpaySignature)) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: 'Failed',
            },
          });
          return reply.status(400).send({ error: 'Invalid payment signature' });
        }

        // A valid signature still doesn't prove money moved, or how much. Ask the
        // gateway what it actually captured. Deliberately done BEFORE the
        // transaction below — an external HTTP call inside an interactive
        // transaction would burn the (5s) transaction timeout.
        let payment;
        try {
          payment = await razorpay.payments.fetch(razorpayPaymentId);
        } catch (err) {
          request.log.error(
            { err, orderId, razorpayPaymentId },
            'Could not fetch payment from gateway during verification',
          );
          return reply.status(400).send({ error: 'Could not confirm payment with the gateway' });
        }

        // Gateway amounts are in the minor unit (paise) — mirror the exact
        // conversion create-order used when the gateway order was opened.
        const expectedAmount = Math.round(dbOrder.totalAmount * 100);
        if (
          payment?.status !== 'captured' ||
          Number(payment?.amount) !== expectedAmount ||
          payment?.currency !== CURRENCY ||
          payment?.order_id !== dbOrder.paymentOrderId
        ) {
          // Leave the order Pending: this is a real payment that simply doesn't
          // match, so ops need to see it rather than have it silently marked Failed.
          request.log.error(
            {
              orderId,
              razorpayPaymentId,
              expected: {
                status: 'captured',
                amount: expectedAmount,
                currency: CURRENCY,
                order_id: dbOrder.paymentOrderId,
              },
              actual: {
                status: payment?.status,
                amount: payment?.amount,
                currency: payment?.currency,
                order_id: payment?.order_id,
              },
            },
            'Captured payment does not match the order — refusing to mark it paid',
          );
          return reply.status(400).send({ error: 'Payment does not match this order' });
        }
      } else if (process.env.NODE_ENV === 'production') {
        return reply.status(500).send({ error: 'Payment gateway not configured' });
      } else {
        // Mock verification (dev only)
        console.log(`[SIMULATION] Verification bypassed for order ${orderId} (Mock Mode)`);
      }

      // Claim every one-of-a-kind item AND finalize the order in a single
      // transaction. The guarded order update is the idempotency gate: only a
      // Pending/Pending order can be finalized, so of two racing verifies exactly
      // one does the work and the other claims nothing and simply reports the
      // order that is already paid. Any failure (sold-out item, or the unique
      // paymentId constraint rejecting a replayed payment) rolls back the claims
      // too, so no product is ever stranded as Sold.
      const soldOutProductIds = [];
      let alreadyFinalized = false;
      let updatedOrder = null;

      try {
        updatedOrder = await prisma.$transaction(async (tx) => {
          const gate = await tx.order.updateMany({
            where: { id: orderId, status: 'Pending', paymentStatus: 'Pending' },
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
          });

          if (gate.count === 0) {
            // Someone else finalized this order between our read and this write.
            const current = await tx.order.findUnique({
              where: { id: orderId },
              include: { items: true },
            });
            if (!current || current.status === 'Cancelled') {
              throw new OrderError(422, 'Order has already been processed');
            }
            alreadyFinalized = true;
            return current;
          }

          for (const item of dbOrder.items || []) {
            // Only flips Approved -> Sold; a count of 0 means another paid order
            // already claimed this item.
            const claim = await tx.product.updateMany({
              where: { id: item.productId, status: 'Approved' },
              data: { status: 'Sold' },
            });
            if (claim.count !== 1) soldOutProductIds.push(item.productId);
          }

          if (soldOutProductIds.length > 0) {
            // Roll the whole thing back — the finalize and every claim we just made.
            throw new OrderError(409, 'One or more items in your order are no longer available');
          }

          // Remove claimed items from every user's cart and wishlist
          for (const item of dbOrder.items || []) {
            await tx.cartItem.deleteMany({ where: { productId: item.productId } });
            await tx.wishlistItem.deleteMany({ where: { productId: item.productId } });
          }

          const finalOrder = await tx.order.findUnique({
            where: { id: orderId },
            include: { items: true },
          });

          // Record coupon usage (if coupon was applied)
          if (finalOrder?.couponId) {
            const existingUsage = await tx.couponUsage.findFirst({
              where: { couponId: finalOrder.couponId, orderId: finalOrder.id },
            });
            if (!existingUsage) {
              await tx.couponUsage.create({
                data: {
                  couponId: finalOrder.couponId,
                  orderId: finalOrder.id,
                  userId: dbUser.id,
                },
              });
            }
          }

          return finalOrder;
        });
      } catch (err) {
        if (err instanceof OrderError) {
          if (err.statusCode !== 409) {
            return reply.status(err.statusCode).send({ error: err.message });
          }
          // Sold out — fall through to the refund/cancel path below.
        } else if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          // paymentId is unique — this payment has already been applied elsewhere.
          request.log.error(
            { prismaCode: err.code, prismaMeta: err.meta, orderId, route: 'verify-payment' },
            'Payment has already been used for another order',
          );
          return reply.status(400).send({ error: 'This payment has already been used' });
        } else {
          throw err;
        }
      }

      if (soldOutProductIds.length > 0) {
        // The transaction rolled back, so nothing is claimed and the order is still
        // Pending — but the buyer's money is already captured. Refund it for real
        // before touching the ledger; never write "Refunded" over money we still hold.
        let paymentStatus = 'Failed';
        let refundPending = false;

        if (!isCOD) {
          paymentStatus = 'Refunded';
          if (razorpay && razorpayPaymentId) {
            try {
              await razorpay.payments.refund(razorpayPaymentId, {
                notes: { orderId, reason: 'Item no longer available' },
              });
            } catch (refundErr) {
              // We still hold the money, so "Refunded" would be a lie. Leave the
              // order Paid + Cancelled — a deliberately inconsistent pair ops can
              // query for — and shout about it in the logs.
              request.log.error(
                { err: refundErr, orderId, paymentId: razorpayPaymentId },
                'REFUND FAILED for sold-out order — payment is still captured, order left Paid and needs a manual refund',
              );
              paymentStatus = 'Paid';
              refundPending = true;
            }
          }
        }

        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'Cancelled',
            paymentStatus,
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
          refundPending,
        });
      }

      // Notify buyer that order is confirmed. Skipped when a concurrent verify
      // already finalized (and already notified) — this call is just a no-op echo.
      if (!alreadyFinalized) {
        await prisma.notification.create({
          data: {
            userId: dbUser.id,
            title: 'Order Confirmed',
            message: isCOD
              ? 'Your order has been placed. Keep cash ready — payment will be collected on delivery.'
              : 'Your order has been placed and payment received. We will process it shortly.',
          },
        });
      }

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
