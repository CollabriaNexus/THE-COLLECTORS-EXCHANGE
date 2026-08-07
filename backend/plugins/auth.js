import fp from 'fastify-plugin';
import { createRemoteJWKSet, jwtVerify } from 'jose';

export default fp(async function authPlugin(fastify, options) {
  const { prisma } = fastify;
  const SUPABASE_URL = process.env.SUPABASE_URL;

  if (!SUPABASE_URL) {
    throw new Error('SUPABASE_URL is required in environment variables');
  }

  const JWKS = createRemoteJWKSet(new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`));

  // Base authentication
  fastify.decorate('authenticate', async function (request, reply) {
    try {
      const token = request.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new Error('No token provided');
      }

      const { payload } = await jwtVerify(token, JWKS);
      request.user = payload; // Supabase payload containing .sub (supabaseId)

      // Resolve DB User
      const dbUser = await prisma.user.findUnique({
        where: { supabaseId: payload.sub },
        include: { vendor: true },
      });

      if (!dbUser) {
        request.dbUser = null;
      } else {
        if (dbUser.banned) {
          return reply
            .code(403)
            .send({ error: 'Your account has been banned. Please contact support.' });
        }
        request.dbUser = dbUser;
      }
    } catch (err) {
      request.log.error(err);
      return reply.code(401).send({ error: err.message });
    }
  });

  // Enforce verified DB user exists
  fastify.decorate('requireDbUser', async function (request, reply) {
    if (!request.dbUser) {
      return reply.code(401).send({ error: 'User profile not synchronized' });
    }
  });

  // Enforce admin role
  fastify.decorate('authenticateAdmin', async function (request, reply) {
    await fastify.authenticate(request, reply);
    if (reply.sent) return;

    if (!request.dbUser || (request.dbUser.role !== 'admin' && request.dbUser.role !== 'curator')) {
      return reply.code(403).send({ error: 'Access denied: Admin or Curator role required' });
    }
  });

  // Enforce super admin role (role === 'admin' strictly, not curators)
  fastify.decorate('authenticateSuperAdmin', async function (request, reply) {
    await fastify.authenticate(request, reply);
    if (reply.sent) return;

    if (!request.dbUser || request.dbUser.role !== 'admin') {
      return reply.code(403).send({ error: 'Access denied: Super Admin role required' });
    }
  });

  // Enforce approved vendor role
  fastify.decorate('authenticateVendor', async function (request, reply) {
    await fastify.authenticate(request, reply);
    if (reply.sent) return;

    if (!request.dbUser || !request.dbUser.vendor) {
      return reply.code(403).send({ error: 'Access denied: Vendor account required' });
    }

    if (request.dbUser.vendor.status !== 'APPROVED') {
      return reply.code(403).send({
        error: `Vendor account is not approved. Current status: ${request.dbUser.vendor.status}`,
      });
    }
  });
});
