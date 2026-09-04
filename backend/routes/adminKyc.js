import { supabaseAdmin } from '../lib/supabase.js';
import { KYC_BUCKET, collectKycDocumentPaths, kycPathOwnerId } from '../lib/kycDocuments.js';
import { KYCSignedUrlParams, KYCSignedUrlQuery } from '../schemas/admin.js';

/**
 * Admin KYC document access.
 *
 * `kyc-documents` is a PRIVATE Supabase storage bucket with no SELECT grant for
 * `anon` or `authenticated`, so an admin browser cannot load an identity
 * document directly any more. This route is the only read path: it mints a
 * short-lived signed URL with the service-role key, after proving that the
 * requested object actually belongs to the user whose KYC record is being
 * reviewed.
 *
 * Registered under the `/api/admin` prefix (see server.js), i.e.
 * `GET /api/admin/kyc/:userId/signed-url?path=kyc/<uid>/<uuid>.pdf`.
 *
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function adminKycRoutes(fastify) {
  const { prisma } = fastify;

  // Deliberately short: the URL is handed to a browser to render one document
  // and must not survive being pasted into a ticket, chat or log.
  const SIGNED_URL_TTL_SECONDS = 120;

  fastify.get(
    '/kyc/:userId/signed-url',
    { preValidation: [fastify.authenticateAdmin] },
    async (request, reply) => {
      const { userId } = KYCSignedUrlParams.parse(request.params);
      const { path } = KYCSignedUrlQuery.parse(request.query);

      if (!supabaseAdmin) {
        request.log.error('SUPABASE_SERVICE_ROLE_KEY is not configured; cannot sign KYC documents');
        return reply.status(503).send({ error: 'Document storage is not configured' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, supabaseId: true, kycData: true },
      });

      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      // ---- Authorisation gate 1 (authoritative): stored-value allowlist ----
      //
      // The requested path must be one of the KYC-bucket references actually
      // stored on THIS user's record. That is strictly tighter than matching a
      // path prefix - it is an allowlist of real references rather than a
      // namespace pattern - and it is the only rule that can authorise a legacy
      // object, whose path (`kyc/<docType>-<ts>-<rand>.<ext>`) contains no user
      // id at all.
      const storedPaths = collectKycDocumentPaths(user.kycData);

      if (!storedPaths.has(path)) {
        request.log.warn(
          { adminId: request.dbUser?.id, targetUserId: userId },
          'Rejected KYC signed-url request: path is not referenced by this user record',
        );
        return reply.status(403).send({ error: 'Document does not belong to this user' });
      }

      // ---- Authorisation gate 2 (defence in depth): folder ownership ----
      //
      // `kycData` is submitted wholesale by the user, so gate 1 alone would let
      // user A plant user B's document path in their own record. For a
      // user-scoped path (`kyc/<id>/<file>`, what every current upload writes)
      // the folder must belong to this user, which makes planting impossible.
      //
      // A flat legacy path has no folder to check and passes on gate 1 alone;
      // it is logged so those signings stay auditable. That residual risk is
      // inherent to the legacy naming (a planted value would have to guess a
      // Date.now() + Math.random() filename) and only disappears once the legacy
      // objects are re-collected or renamed under a user-scoped path.
      const pathOwner = kycPathOwnerId(path);

      if (pathOwner) {
        const ownIds = [user.supabaseId, user.id].filter(
          (id) => typeof id === 'string' && id.length > 0,
        );
        if (!ownIds.includes(pathOwner)) {
          request.log.warn(
            { adminId: request.dbUser?.id, targetUserId: userId },
            'Rejected KYC signed-url request: path is scoped to a different user',
          );
          return reply.status(403).send({ error: 'Document does not belong to this user' });
        }
      } else {
        request.log.info(
          { adminId: request.dbUser?.id, targetUserId: userId },
          'Signing a legacy (non user-scoped) KYC document path',
        );
      }

      const { data, error } = await supabaseAdmin.storage
        .from(KYC_BUCKET)
        .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

      if (error || !data?.signedUrl) {
        request.log.error(
          { err: error?.message, targetUserId: userId },
          'Failed to create KYC document signed URL',
        );
        return reply.status(502).send({ error: 'Could not generate document link' });
      }

      return {
        url: data.signedUrl,
        expiresAt: new Date(Date.now() + SIGNED_URL_TTL_SECONDS * 1000).toISOString(),
      };
    },
  );
}
