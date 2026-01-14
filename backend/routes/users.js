import { UserRegistrationSchema, UserKycSchema } from '../schemas/user.js';

/**
 * User Routes
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function userRoutes(fastify) {
    const { prisma } = fastify;

    // Register or Sync user
    fastify.post('/register', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const userData = UserRegistrationSchema.parse(request.body);

        // request.user will contain the decoded Supabase JWT payload (sub is the userId)
        const supabaseId = request.user.sub;

        // Find existing user by email or supabaseId
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: userData.email },
                    { supabaseId }
                ]
            }
        });

        if (existingUser) {
            // Update existing user with supabaseId if missing
            const updatedUser = await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    supabaseId: supabaseId,
                    name: userData.name || existingUser.name,
                }
            });
            return updatedUser;
        }

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                ...userData,
                supabaseId: supabaseId,
                password: null, // No local password needed if using Supabase
            },
        });

        return reply.status(201).send(newUser);
    });

    // Get user by ID
    fastify.get('/:id', { preValidation: [fastify.authenticate] }, async (request, reply) => {
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
    fastify.post('/kyc', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { userId, kycData } = UserKycSchema.parse(request.body);

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                kycData,
                kycStatus: 'pending', // Pending manual review
            },
        });

        return updatedUser;
    });
}
