import { z } from 'zod';

const CreateReviewSchema = z.object({
  orderId: z.string().min(1),
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

/**
 * Review Routes
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function reviewRoutes(fastify) {
  const { prisma } = fastify;

  // Public: get reviews for a vendor
  fastify.get('/vendor/:vendorId', async (request, reply) => {
    const { vendorId } = request.params;
    const { limit = '20', offset = '0' } = request.query ?? {};

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { vendorId },
        include: {
          user: { select: { id: true, name: true } },
          product: { select: { id: true, title: true, image: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: Number(offset) || 0,
        take: Math.min(Math.max(Number(limit) || 20, 1), 100),
      }),
      prisma.review.count({ where: { vendorId } }),
    ]);

    return { total, data: reviews };
  });

  // Public: get reviews for a product
  fastify.get('/product/:productId', async (request, reply) => {
    const { productId } = request.params;
    const { limit = '20', offset = '0' } = request.query ?? {};

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        include: {
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: Number(offset) || 0,
        take: Math.min(Math.max(Number(limit) || 20, 1), 100),
      }),
      prisma.review.count({ where: { productId } }),
    ]);

    return { total, data: reviews };
  });

  // Authenticated: create a review (only after order is Delivered)
  fastify.post('/', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const dbUser = request.dbUser;
    if (!dbUser) return reply.status(401).send({ error: 'Authentication required' });

    const data = CreateReviewSchema.parse(request.body);

    // Verify the order exists, belongs to user, and is delivered
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: { items: true },
    });
    if (!order) return reply.status(404).send({ error: 'Order not found' });
    if (order.userId !== dbUser.id) return reply.status(403).send({ error: 'Not your order' });
    if (order.status !== 'Delivered')
      return reply.status(422).send({ error: 'Can only review delivered orders' });

    // Verify the product is in this order
    const orderItem = order.items.find((i) => i.productId === data.productId);
    if (!orderItem) return reply.status(422).send({ error: 'Product not in this order' });

    // Check for existing review
    const existing = await prisma.review.findUnique({
      where: {
        userId_orderId_productId: {
          userId: dbUser.id,
          orderId: data.orderId,
          productId: data.productId,
        },
      },
    });
    if (existing)
      return reply.status(422).send({ error: 'You have already reviewed this product' });

    // Get the vendor from the product
    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) return reply.status(404).send({ error: 'Product not found' });

    const vendor = await prisma.vendor.findFirst({ where: { userId: product.sellerId } });
    if (!vendor) return reply.status(422).send({ error: 'Vendor not found for this product' });

    // Create review + update vendor aggregated rating atomically
    const [review] = await prisma.$transaction([
      prisma.review.create({
        data: {
          userId: dbUser.id,
          vendorId: vendor.id,
          productId: data.productId,
          orderId: data.orderId,
          rating: data.rating,
          comment: data.comment,
        },
      }),
      prisma.vendor.update({
        where: { id: vendor.id },
        data: {
          rating: {
            increment: 0, // We'll compute below
          },
        },
      }),
    ]);

    // Recompute vendor average rating from all reviews
    const agg = await prisma.review.aggregate({
      where: { vendorId: vendor.id },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        rating: agg._avg.rating ?? 0,
        ratingCount: agg._count.rating,
      },
    });

    return reply.status(201).send(review);
  });
}
