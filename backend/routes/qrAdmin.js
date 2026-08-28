import { Prisma } from '@prisma/client';
import {
  CreateQrCodeSchema,
  QrIdParamSchema,
  QrStatsQuerySchema,
  UpdateQrCodeSchema,
  slugify,
} from '../schemas/qr.js';

function buildWhere(query) {
  const conditions = [];
  if (query.codeId) conditions.push(Prisma.sql`"QrScan"."qrCodeId" = ${query.codeId}`);
  if (query.from) conditions.push(Prisma.sql`"QrScan"."scannedAt" >= ${query.from}`);
  if (query.to) conditions.push(Prisma.sql`"QrScan"."scannedAt" <= ${query.to}`);
  if (query.country) conditions.push(Prisma.sql`"QrScan"."country" = ${query.country}`);
  if (query.city) conditions.push(Prisma.sql`"QrScan"."city" = ${query.city}`);
  if (query.deviceType) conditions.push(Prisma.sql`"QrScan"."deviceType" = ${query.deviceType}`);
  if (query.os) conditions.push(Prisma.sql`"QrScan"."os" = ${query.os}`);
  return conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty;
}

function slugVariants(base) {
  const suffix = Math.random().toString(36).slice(2, 6);
  return base ? `${base}-${suffix}` : `code-${suffix}`;
}

export default async function qrAdminRoutes(fastify) {
  const { prisma } = fastify;
  const adminAuth = { preValidation: [fastify.authenticateAdmin] };

  // ---------- QR code management ----------
  fastify.get('/codes', adminAuth, async () => {
    const [codes, scanAggregates] = await Promise.all([
      prisma.qrCode.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.$queryRaw`
        SELECT "qrCodeId",
               COUNT(*)::int AS totalScans,
               MAX("scannedAt") AS "lastScanAt"
        FROM "QrScan"
        GROUP BY "qrCodeId"`,
    ]);
    const aggByCode = new Map(scanAggregates.map((row) => [row.qrCodeId, row]));
    return {
      data: codes.map((code) => ({
        ...code,
        totalScans: Number(aggByCode.get(code.id)?.totalScans ?? 0),
        lastScanAt: aggByCode.get(code.id)?.lastScanAt ?? null,
      })),
    };
  });

  fastify.post('/codes', adminAuth, async (request, reply) => {
    const body = CreateQrCodeSchema.parse(request.body);
    let slug = body.slug || slugify(body.title);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        const code = await prisma.qrCode.create({
          data: { title: body.title, slug, targetUrl: body.targetUrl, active: body.active },
        });
        return reply.status(201).send({ data: code });
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          slug = slugVariants(body.slug ? body.slug : slugify(body.title));
          continue;
        }
        throw err;
      }
    }
    return reply.status(409).send({ error: 'Could not generate a unique slug. Try a custom one.' });
  });

  fastify.patch('/codes/:id', adminAuth, async (request, reply) => {
    const { id } = QrIdParamSchema.parse(request.params);
    const body = UpdateQrCodeSchema.parse(request.body);
    if (!Object.keys(body).length) {
      return reply.status(400).send({ error: 'No fields to update' });
    }

    try {
      const code = await prisma.qrCode.update({ where: { id }, data: body });
      return reply.send({ data: code });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        return reply.status(409).send({ error: 'That slug is already in use' });
      }
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        return reply.status(404).send({ error: 'QR code not found' });
      }
      throw err;
    }
  });

  fastify.delete('/codes/:id', adminAuth, async (request, reply) => {
    const { id } = QrIdParamSchema.parse(request.params);
    try {
      await prisma.qrCode.delete({ where: { id } });
      return reply.send({ success: true });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        return reply.status(404).send({ error: 'QR code not found' });
      }
      throw err;
    }
  });

  // ---------- Scan statistics ----------
  fastify.get('/stats', adminAuth, async (request) => {
    const query = QrStatsQuerySchema.parse(request.query);
    const where = buildWhere(query);
    const dayExpr = Prisma.sql`("QrScan"."scannedAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')`;

    const [totalsRow, timeline, hourly, locations, devices, operatingSystems, browsers] =
      await Promise.all([
        prisma.$queryRaw`
          SELECT COUNT(*)::int AS total,
                 COUNT(DISTINCT "deviceHash")::int AS "uniqueDevices",
                 COUNT(DISTINCT "visitorId")::int AS "totalUsers"
          FROM "QrScan" ${where}`,
        prisma.$queryRaw`
          SELECT ${dayExpr}::date AS day,
                 COUNT(*)::int AS total,
                 COUNT(DISTINCT "deviceHash")::int AS "uniqueDevices"
          FROM "QrScan" ${where}
          GROUP BY day
          ORDER BY day ASC`,
        prisma.$queryRaw`
          SELECT EXTRACT(HOUR FROM ${dayExpr})::int AS hour,
                 COUNT(*)::int AS total,
                 COUNT(DISTINCT "deviceHash")::int AS "uniqueDevices"
          FROM "QrScan" ${where}
          GROUP BY hour
          ORDER BY hour ASC`,
        prisma.$queryRaw`
          SELECT COALESCE(NULLIF("country", ''), 'Unknown') AS country,
                 COALESCE("countryCode", '') AS "countryCode",
                 COALESCE(NULLIF("city", ''), 'Unknown') AS city,
                 COUNT(*)::int AS scans,
                 COUNT(DISTINCT "visitorId")::int AS users
          FROM "QrScan" ${where}
          GROUP BY 1, 2, 3
          ORDER BY scans DESC`,
        prisma.$queryRaw`
          SELECT COALESCE(NULLIF("deviceType", ''), 'Unknown') AS name,
                 COUNT(*)::int AS scans,
                 COUNT(DISTINCT "visitorId")::int AS users
          FROM "QrScan" ${where}
          GROUP BY 1
          ORDER BY scans DESC`,
        prisma.$queryRaw`
          SELECT COALESCE(NULLIF("os", ''), 'Unknown') AS name,
                 COUNT(*)::int AS scans,
                 COUNT(DISTINCT "visitorId")::int AS users
          FROM "QrScan" ${where}
          GROUP BY 1
          ORDER BY scans DESC`,
        prisma.$queryRaw`
          SELECT COALESCE(NULLIF("browser", ''), 'Unknown') AS name,
                 COUNT(*)::int AS scans,
                 COUNT(DISTINCT "visitorId")::int AS users
          FROM "QrScan" ${where}
          GROUP BY 1
          ORDER BY scans DESC`,
      ]);

    return {
      totals: totalsRow[0] ?? { total: 0, uniqueDevices: 0, totalUsers: 0 },
      timeline,
      hourly,
      locations,
      devices,
      operatingSystems,
      browsers,
    };
  });

  // Distinct values to populate the filter dropdowns
  fastify.get('/filters', adminAuth, async () => {
    const [countries, cities, deviceTypes, oses] = await Promise.all([
      prisma.$queryRaw`SELECT DISTINCT "country" AS value FROM "QrScan" WHERE "country" IS NOT NULL AND "country" <> '' ORDER BY value`,
      prisma.$queryRaw`SELECT DISTINCT "city" AS value FROM "QrScan" WHERE "city" IS NOT NULL AND "city" <> '' ORDER BY value`,
      prisma.$queryRaw`SELECT DISTINCT "deviceType" AS value FROM "QrScan" WHERE "deviceType" IS NOT NULL AND "deviceType" <> '' ORDER BY value`,
      prisma.$queryRaw`SELECT DISTINCT "os" AS value FROM "QrScan" WHERE "os" IS NOT NULL AND "os" <> '' ORDER BY value`,
    ]);
    return {
      countries: countries.map((r) => r.value),
      cities: cities.map((r) => r.value),
      deviceTypes: deviceTypes.map((r) => r.value),
      operatingSystems: oses.map((r) => r.value),
    };
  });
}
