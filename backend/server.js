import Fastify from 'fastify';
import dotenv from 'dotenv';
import cors from '@fastify/cors';
import prismaPlugin from './plugins/prisma.js';
import productRoutes from './routes/products.js';
import galleryRoutes from './routes/gallery.js';
import cartRoutes from './routes/cart.js';
import userRoutes from './routes/users.js';

import { createRemoteJWKSet, jwtVerify } from 'jose';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
if (!SUPABASE_URL) {
    console.error('Missing SUPABASE_URL environment variable');
    process.exit(1);
}

const JWKS = createRemoteJWKSet(new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`));

const fastify = Fastify({
    logger: true,
});

// Register Plugins
fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
});

fastify.decorate("authenticate", async function (request, reply) {
    try {
        const token = request.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new Error('No token provided');
        }

        const { payload } = await jwtVerify(token, JWKS);
        request.user = payload;
    } catch (err) {
        request.log.error(err);
        reply.code(401).send({ error: 'Unauthorized', message: err.message });
    }
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
