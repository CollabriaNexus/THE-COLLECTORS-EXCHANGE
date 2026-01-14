import { UserRegistrationSchema, UserKycSchema } from '../schemas/user.js';

/**
 * User Routes
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function userRoutes(fastify) {
    const { prisma } = fastify;

    // Register user
    fastify.post('/register', async (request, reply) => {
        const userData = UserRegistrationSchema.parse(request.body);

        // Simple mock password for now since we don't have auth yet
        const newUser = await prisma.user.create({
            data: {
                ...userData,
                password: 'temp_password', // Should be hashed in prod
            },
        });

        return reply.status(201).send(newUser);
    });

    // Get user by ID
    fastify.get('/:id', async (request, reply) => {
        const { id } = request.params;
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                products: true,
                cart: { include: { product: true } },
                wishlist: { include: { product: true } },
            },
        });

        if (!user) {
            return reply.status(404).send({ error: 'User not found' });
        }

        return user;
    });

    // Submit KYC
    fastify.post('/kyc', async (request, reply) => {
        const { userId, kycData } = UserKycSchema.parse(request.body);

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                kycData,
                kycStatus: 'verified', // Auto-verify for now
            },
        });

        return updatedUser;
    });
}
