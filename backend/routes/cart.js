/**
 * Cart Routes
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function cartRoutes(fastify) {
  const { prisma } = fastify;

  // Get user cart
  fastify.get('/:userId', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const { userId } = request.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || user.supabaseId !== request.user.sub) {
      return reply
        .status(403)
        .send({ error: 'You do not have permission to access this resource' });
    }

    const cart = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });
    return cart;
  });

  // Add to cart
  fastify.post('/', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const { userId, productId } = request.body || {};
    if (!userId || !productId) {
      return reply.status(400).send({ error: 'userId and productId are required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || user.supabaseId !== request.user.sub) {
      return reply
        .status(403)
        .send({ error: 'You do not have permission to access this resource' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return reply.status(404).send({ error: 'Product not found' });
    }
    if (product.status === 'Sold') {
      return reply.status(422).send({ error: 'Product is no longer available' });
    }
    if (product.status !== 'Approved') {
      return reply.status(422).send({ error: 'Product is not available for purchase' });
    }
    // `status` and `isPublished` are set independently, so an Approved product
    // can still be deliberately pulled from the storefront. Without this check a
    // known id could be added straight to a cart/wishlist even though the public
    // catalogue no longer lists it.
    if (!product.isPublished) {
      return reply.status(422).send({ error: 'Product is not available for purchase' });
    }

    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId: { userId, productId },
      },
      update: {},
      create: { userId, productId },
    });
    return reply.status(201).send(cartItem);
  });

  // Remove from cart
  fastify.delete('/', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const { userId, productId } = request.body || {};
    if (!userId || !productId) {
      return reply.status(400).send({ error: 'userId and productId are required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || user.supabaseId !== request.user.sub) {
      return reply
        .status(403)
        .send({ error: 'You do not have permission to access this resource' });
    }

    // Idempotent: removing an item that's already gone (e.g. purged after a sale
    // or removed in another tab) must succeed, not throw P2025 -> 409.
    await prisma.cartItem.deleteMany({
      where: { userId, productId },
    });
    return reply.status(204).send();
  });
}
