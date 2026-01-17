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

    // --- Phone Verification ---

    // Send OTP
    fastify.post('/otp/send', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { phone } = request.body; // Simple validation: check if provided
        if (!phone || phone.length < 10) return reply.status(400).send({ error: 'Invalid phone number' });

        // 1. Check uniqueness
        const existingUser = await prisma.user.findFirst({ where: { phone } });
        // Allow re-verification if it's the SAME user (e.g. they want to verify the number they already lay claim to - though usually for changing number)
        // For now: Strictly unique across OTHER users.
        if (existingUser && existingUser.id !== request.user.sub) {
            return reply.status(409).send({ error: 'Phone number already registered' });
        }

        // 2. Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // 3. Store OTP
        // Upsert to handle retries
        await prisma.phoneVerification.upsert({
            where: { phone },
            update: { code: otp, expiresAt },
            create: { phone, code: otp, expiresAt },
        });

        // 4. Send (Log) OTP
        console.log(`[OTP SIMULATION] Sending OTP ${otp} to ${phone}`);

        return { message: 'OTP sent successfully', simulation: 'Check server console' };
    });

    // Verify OTP
    fastify.post('/otp/verify', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { phone, code } = request.body;
        if (!phone || !code) return reply.status(400).send({ error: 'Missing phone or code' });

        // 1. Find OTP Record
        const record = await prisma.phoneVerification.findUnique({ where: { phone } });

        if (!record) return reply.status(400).send({ error: 'Invalid or expired OTP' });
        if (record.code !== code) return reply.status(400).send({ error: 'Invalid OTP' });
        if (new Date() > record.expiresAt) return reply.status(400).send({ error: 'OTP expired' });

        // 2. Update User
        // request.user.sub comes from the JWT via fastify.authenticate decorator
        const userId = request.user.sub;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { phone },
        });

        // 3. Cleanup OTP
        await prisma.phoneVerification.delete({ where: { phone } });

        return { message: 'Phone verified successfully', user: updatedUser };
    });
}
