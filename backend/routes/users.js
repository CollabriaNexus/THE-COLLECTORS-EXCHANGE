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

    // ============== PUSH NOTIFICATIONS ==============

    // Save push subscription
    fastify.post('/push-subscribe', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const supabaseId = request.user.sub;
        const user = await prisma.user.findUnique({ where: { supabaseId }, select: { id: true } });
        if (!user) return reply.status(404).send({ error: 'User not found' });

        const { endpoint, keys } = request.body;
        if (!endpoint || !keys?.p256dh || !keys?.auth) {
            return reply.status(400).send({ error: 'Invalid subscription' });
        }

        await prisma.pushSubscription.upsert({
            where: { userId_endpoint: { userId: user.id, endpoint } },
            update: { p256dh: keys.p256dh, auth: keys.auth },
            create: {
                userId: user.id,
                endpoint,
                p256dh: keys.p256dh,
                auth: keys.auth,
            },
        });

        return { message: 'Subscribed' };
    });

    // Unsubscribe
    fastify.delete('/push-subscribe', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const supabaseId = request.user.sub;
        const user = await prisma.user.findUnique({ where: { supabaseId }, select: { id: true } });
        if (!user) return reply.status(404).send({ error: 'User not found' });

        const { endpoint } = request.body;
        if (endpoint) {
            await prisma.pushSubscription.deleteMany({
                where: { userId: user.id, endpoint }
            });
        } else {
            await prisma.pushSubscription.deleteMany({
                where: { userId: user.id }
            });
        }

        return { message: 'Unsubscribed' };
    });

    // --- Manual Phone Verification (WhatsApp) ---

    // User submits phone for manual verification
    fastify.post('/phone/submit', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { phone } = request.body;
        if (!phone || phone.length < 10) return reply.status(400).send({ error: 'Invalid phone number' });

        const supabaseId = request.user.sub;

        // Check uniqueness - allow if same user
        const existingUser = await prisma.user.findFirst({ where: { phone } });
        if (existingUser && existingUser.supabaseId !== supabaseId) {
            return reply.status(409).send({ error: 'Phone number already registered' });
        }

        // Save phone with pending status
        const updated = await prisma.user.update({
            where: { supabaseId },
            data: { phone, phoneVerificationStatus: 'pending' },
            select: { id: true, phone: true, phoneVerificationStatus: true },
        });

        return { message: 'Phone submitted for verification', user: updated };
    });

    // Admin: get pending phone verifications
    fastify.get('/phone/verifications', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        if (request.dbUser.role !== 'admin' && request.dbUser.role !== 'curator') {
            return reply.status(403).send({ error: 'Admin only' });
        }
        const { status } = request.query;
        const where = status ? { phoneVerificationStatus: status } : { phoneVerificationStatus: { not: 'none' } };
        const users = await prisma.user.findMany({
            where,
            select: { id: true, name: true, email: true, phone: true, phoneVerificationStatus: true, createdAt: true },
            orderBy: { updatedAt: 'desc' },
        });
        return users;
    });

    // Admin: approve phone verification
    fastify.patch('/phone/:userId/approve', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        if (request.dbUser.role !== 'admin' && request.dbUser.role !== 'curator') {
            return reply.status(403).send({ error: 'Admin only' });
        }
        const { userId } = request.params;
        const updated = await prisma.user.update({
            where: { id: userId },
            data: { phoneVerificationStatus: 'verified' },
            select: { id: true, name: true, phone: true, phoneVerificationStatus: true },
        });
        return { message: 'Phone verified', user: updated };
    });

    // Admin: reject phone verification
    fastify.patch('/phone/:userId/reject', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        if (request.dbUser.role !== 'admin' && request.dbUser.role !== 'curator') {
            return reply.status(403).send({ error: 'Admin only' });
        }
        const { userId } = request.params;
        const updated = await prisma.user.update({
            where: { id: userId },
            data: { phoneVerificationStatus: 'rejected' },
            select: { id: true, name: true, phone: true, phoneVerificationStatus: true },
        });
        return { message: 'Phone rejected', user: updated };
    });
}
