import fp from 'fastify-plugin';
import { createRemoteJWKSet, jwtVerify } from 'jose';

export default fp(async function authPlugin(fastify, options) {
  const { prisma } = fastify;
  const SUPABASE_URL = process.env.SUPABASE_URL;

  if (!SUPABASE_URL) {
    throw new Error('SUPABASE_URL is required in environment variables');
  }

  const JWKS = createRemoteJWKSet(new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`));

  // Claim validation for Supabase access tokens.
  //
  // `iss` is confirmed against this project's OIDC discovery document
  // (`${SUPABASE_URL}/auth/v1/.well-known/openid-configuration` reports
  // `"issuer": "${SUPABASE_URL}/auth/v1"`).
  //
  // `aud` is GoTrue's standard audience for a signed-in user session token
  // ("authenticated"). Both are overridable via env so a mismatch can be fixed
  // without a redeploy of new code.
  const JWT_ISSUER = process.env.SUPABASE_JWT_ISSUER || `${SUPABASE_URL}/auth/v1`;
  const JWT_AUDIENCE = process.env.SUPABASE_JWT_AUDIENCE || 'authenticated';

  // Base authentication
  fastify.decorate('authenticate', async function (request, reply) {
    try {
      const token = request.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new Error('No token provided');
      }

      const { payload } = await jwtVerify(token, JWKS, {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      });
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
      // A claim mismatch is called out separately because it fails CLOSED for
      // every user at once, not one at a time: if JWT_ISSUER/JWT_AUDIENCE are
      // configured wrong, nobody can authenticate. `aud` in particular was
      // never verified against a real session token (see the note above), so
      // this line is what makes that mistake obvious in one glance at the logs
      // instead of looking like a site-wide outage of unknown cause. The fix is
      // the SUPABASE_JWT_AUDIENCE / SUPABASE_JWT_ISSUER env override — no code
      // deploy needed.
      if (err.code === 'ERR_JWT_CLAIM_VALIDATION_FAILED') {
        request.log.error(
          { claim: err.claim, expected: err.claim === 'aud' ? JWT_AUDIENCE : JWT_ISSUER },
          'JWT claim validation failed - check SUPABASE_JWT_ISSUER / SUPABASE_JWT_AUDIENCE. ' +
            'If this is firing for every request, the configured claim is wrong, not the token.',
        );
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      // Keep the real reason server-side only - the client gets a generic 401 so
      // token/claim internals are never echoed back to an unauthenticated caller.
      request.log.error({ err: err.message, code: err.code }, 'Authentication failed');
      return reply.code(401).send({ error: 'Unauthorized' });
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
