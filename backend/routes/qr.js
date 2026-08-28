import crypto from 'node:crypto';
import { parseBrowser, parseDeviceType, parseOs } from '../lib/userAgent.js';
import { hashId, lookupLocation, normalizeIp } from '../lib/geo.js';

const VISITOR_COOKIE = 'tce_qid';
const COOKIE_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

function readVisitorId(request) {
  const raw = request.headers.cookie;
  if (!raw) return null;
  for (const part of raw.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const name = part.slice(0, idx).trim();
    if (name === VISITOR_COOKIE) {
      try {
        return decodeURIComponent(part.slice(idx + 1).trim());
      } catch {
        return part.slice(idx + 1).trim();
      }
    }
  }
  return null;
}

function buildCookieHeader(visitorId, isHttps) {
  const parts = [
    `${VISITOR_COOKIE}=${encodeURIComponent(visitorId)}`,
    'Path=/',
    'SameSite=Lax',
    `Max-Age=${COOKIE_MAX_AGE_SECONDS}`,
  ];
  if (isHttps) parts.push('Secure');
  return parts.join('; ');
}

export default async function qrRoutes(fastify) {
  // Public tracking pixel-style endpoint: record the scan, then bounce the
  // visitor to the configured destination as fast as possible (302, never cached).
  fastify.get(
    '/:slug',
    {
      config: { rateLimit: { max: 300, timeWindow: '1 minute' } },
      schema: { hide: true },
    },
    async (request, reply) => {
      const { slug } = request.params;
      const fallbackUrl = process.env.FRONTEND_URL || 'https://thecollectorsexchange.in';

      let code = null;
      try {
        code = await fastify.prisma.qrCode.findUnique({ where: { slug } });
      } catch (err) {
        request.log.error({ err: err.message }, 'QR code lookup failed');
      }

      if (!code || !code.active) {
        return reply.redirect(fallbackUrl, 302);
      }

      const ip = normalizeIp(request.headers['x-forwarded-for'] || request.ip || '');
      const userAgent = String(request.headers['user-agent'] || '');
      let visitorId = readVisitorId(request);
      const isNewVisitor = !visitorId;
      if (isNewVisitor) visitorId = crypto.randomUUID();

      const deviceType = parseDeviceType(userAgent);
      const os = parseOs(userAgent);
      const browser = parseBrowser(userAgent);
      const ipHash = ip ? hashId(ip) : null;
      const deviceHash = hashId(`${visitorId}|${userAgent}|${ip || ''}`);

      // Geo lookup is capped internally (~900ms worst case) and never throws.
      const location = await lookupLocation(ip);

      try {
        await fastify.prisma.qrScan.create({
          data: {
            qrCodeId: code.id,
            visitorId,
            deviceHash,
            ipHash,
            country: location.country,
            countryCode: location.countryCode,
            region: location.region,
            city: location.city,
            latitude: location.latitude,
            longitude: location.longitude,
            deviceType,
            os,
            browser,
          },
        });
      } catch (err) {
        request.log.error({ err: err.message }, 'Failed to record QR scan');
      }

      if (isNewVisitor) {
        const isHttps =
          request.headers['x-forwarded-proto'] === 'https' ||
          (request.raw?.socket?.encrypted ?? false);
        reply.header('set-cookie', buildCookieHeader(visitorId, isHttps));
      }

      reply.header('cache-control', 'no-store, max-age=0');
      return reply.redirect(code.targetUrl, 302);
    },
  );
}
