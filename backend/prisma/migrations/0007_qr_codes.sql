-- ============================================================
-- TCE-007: QR code scan tracking.
--
-- QrCode holds a short slug -> target URL mapping for physical/print
-- QR codes; QrScan records one row per scan (device/geo/browser,
-- hashed rather than raw IP for privacy) so admin can see engagement
-- per code without ever storing a scanner's raw IP address.
--
-- These tables already exist in the live database (created via
-- `prisma db push` during development, ahead of this migration file
-- being written) — every statement below is written idempotent
-- (IF NOT EXISTS) so re-running it against that database is a no-op.
-- ============================================================

CREATE TABLE IF NOT EXISTS "QrCode" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QrCode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "QrCode_slug_key" ON "QrCode"("slug");

CREATE TABLE IF NOT EXISTS "QrScan" (
    "id" TEXT NOT NULL,
    "qrCodeId" TEXT NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitorId" TEXT,
    "deviceHash" TEXT,
    "ipHash" TEXT,
    "country" TEXT,
    "countryCode" TEXT,
    "region" TEXT,
    "city" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "deviceType" TEXT,
    "os" TEXT,
    "browser" TEXT,

    CONSTRAINT "QrScan_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "QrScan_qrCodeId_scannedAt_idx" ON "QrScan"("qrCodeId", "scannedAt");
CREATE INDEX IF NOT EXISTS "QrScan_country_idx" ON "QrScan"("country");
CREATE INDEX IF NOT EXISTS "QrScan_city_idx" ON "QrScan"("city");
CREATE INDEX IF NOT EXISTS "QrScan_deviceType_idx" ON "QrScan"("deviceType");
CREATE INDEX IF NOT EXISTS "QrScan_os_idx" ON "QrScan"("os");

DO $$ BEGIN
    ALTER TABLE "QrScan" ADD CONSTRAINT "QrScan_qrCodeId_fkey"
        FOREIGN KEY ("qrCodeId") REFERENCES "QrCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
