import Fastify from 'fastify';
import dotenv from 'dotenv';
import cors from '@fastify/cors';
import prismaPlugin from './plugins/prisma.js';
import productRoutes from './routes/products.js';
import galleryRoutes from './routes/gallery.js';
import cartRoutes from './routes/cart.js';
import userRoutes from './routes/users.js';

dotenv.config();

const fastify = Fastify({
    logger: true,
});

// Register Plugins
fastify.register(cors, {
    origin: true, // In production, this should be the specific frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
});
fastify.register(prismaPlugin);

// Register Routes
fastify.register(productRoutes, { prefix: '/api/products' });
fastify.register(galleryRoutes, { prefix: '/api/gallery' });
fastify.register(cartRoutes, { prefix: '/api/cart' });
fastify.register(userRoutes, { prefix: '/api/users' });

// Health Check
fastify.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});

/**
 * Start the server
 */
const start = async () => {
    try {
        const port = process.env.PORT || 3000;
        await fastify.listen({ port, host: '0.0.0.0' });
        fastify.log.info(`Server listening on port ${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
