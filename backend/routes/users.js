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

    // Get current authenticated user
    fastify.get('/me', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const supabaseId = request.user.sub;

        const user = await prisma.user.findUnique({
            where: { supabaseId },
            include: {
                products: true,
                cart: { include: { product: true } },
                wishlist: { include: { product: true } },
                orders: {
                    include: { items: { include: { product: true } } },
                    orderBy: { createdAt: 'desc' },
                },
                vendor: { include: { subscription: true } },
            },
        });

        if (!user) {
            return reply.status(404).send({ error: 'User not found' });
        }

        return user;
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

    // Get current authenticated user's orders
    fastify.get('/orders', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const supabaseId = request.user.sub;

        const user = await prisma.user.findUnique({
            where: { supabaseId },
            select: { id: true }
        });

        if (!user) {
            return reply.status(404).send({ error: 'User not found' });
        }

        const orders = await prisma.order.findMany({
            where: { userId: user.id },
            include: {
                items: { include: { product: true } }
            },
            orderBy: { createdAt: 'desc' },
        });

        return orders;
    });

    // Update current user's profile
    fastify.patch('/me', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const supabaseId = request.user.sub;
        const { name, phone } = request.body;

        const existingUser = await prisma.user.findUnique({ where: { supabaseId } });
        if (!existingUser) {
            return reply.status(404).send({ error: 'User not found' });
        }

        const data = {};
        if (name !== undefined) data.name = name;
        if (phone !== undefined) data.phone = phone;

        const updatedUser = await prisma.user.update({
            where: { supabaseId },
            data,
        });

        return updatedUser;
    });

    // ============== NOTIFICATIONS ==============

    // Get user notifications
    fastify.get('/notifications', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const supabaseId = request.user.sub;
        const user = await prisma.user.findUnique({ where: { supabaseId }, select: { id: true } });
        if (!user) return reply.status(404).send({ error: 'User not found' });

        const notifications = await prisma.notification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        return notifications;
    });

    // Mark all notifications as read — MUST be before /:id/read to avoid route conflict
    fastify.patch('/notifications/read-all', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const supabaseId = request.user.sub;
        const user = await prisma.user.findUnique({ where: { supabaseId }, select: { id: true } });
        if (!user) return reply.status(404).send({ error: 'User not found' });

        await prisma.notification.updateMany({
            where: { userId: user.id, read: false },
            data: { read: true },
        });

        return { message: 'All notifications marked as read' };
    });

    // Mark a single notification as read
    fastify.patch('/notifications/:id/read', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params;
        const supabaseId = request.user.sub;
        const user = await prisma.user.findUnique({ where: { supabaseId }, select: { id: true } });
        if (!user) return reply.status(404).send({ error: 'User not found' });

        const notification = await prisma.notification.findUnique({ where: { id } });
        if (!notification || notification.userId !== user.id) {
            return reply.status(404).send({ error: 'Notification not found' });
        }

        const updated = await prisma.notification.update({
            where: { id },
            data: { read: true },
        });

        return updated;
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

    // Accept Seller Agreement (digital signature)
    fastify.post('/seller-agreement/accept', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { userId, signedByName } = request.body;

        if (!userId || !signedByName) {
            return reply.status(400).send({ error: 'userId and signedByName are required' });
        }

        const existingUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!existingUser) {
            return reply.status(404).send({ error: 'User not found' });
        }

        const currentKycData = typeof existingUser.kycData === 'object' && existingUser.kycData !== null
            ? existingUser.kycData
            : {};

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                kycData: {
                    ...currentKycData,
                    agreementAccepted: true,
                    agreementSignedByName: signedByName,
                    agreementSignedAt: new Date().toISOString(),
                },
            },
        });

        return {
            message: 'Seller Agreement accepted successfully',
            signedByName,
            signedAt: new Date().toISOString(),
            user: updatedUser,
        };
    });

    // --- Phone Verification ---

    // Send OTP
    fastify.post('/otp/send', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { phone } = request.body; // Simple validation: check if provided
        if (!phone || phone.length < 10) return reply.status(400).send({ error: 'Invalid phone number' });

        // 1. Check uniqueness
        const existingUser = await prisma.user.findFirst({ where: { phone } });
        // Allow re-verification if it's the SAME user
        if (existingUser && existingUser.supabaseId !== request.user.sub) {
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
        const supabaseId = request.user.sub;

        const updatedUser = await prisma.user.update({
            where: { supabaseId },
            data: { phone },
        });

        // 3. Cleanup OTP
        await prisma.phoneVerification.delete({ where: { phone } });

        return { message: 'Phone verified successfully', user: updatedUser };
    });
}
