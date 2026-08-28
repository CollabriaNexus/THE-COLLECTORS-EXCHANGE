import { createHash } from 'node:crypto';

const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const LOOKUP_TIMEOUT_MS = Number(process.env.QR_GEO_TIMEOUT_MS || 900);
const MAX_CACHE_ENTRIES = 5000;

const geoCache = new Map();

export function hashId(value) {
  return createHash('sha256').update(String(value)).digest('hex');
}

function isPrivateIp(ip) {
  if (!ip) return true;
  if (ip === '::1' || ip.startsWith('fc') || ip.startsWith('fd')) return true;
  if (ip.startsWith('fe80:') || ip.startsWith('169.254.') || ip.startsWith('127.')) return true;
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4) return false;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

export function normalizeIp(rawIp) {
  if (!rawIp) return null;
  let ip = String(rawIp).trim();
  // Handle IPv4-mapped IPv6 (::ffff:1.2.3.4)
  const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (mapped) return mapped[1];
  // x-forwarded-for may contain multiple entries; first is the client
  if (ip.includes(',')) [ip] = ip.split(',');
  return ip.trim() || null;
}

/**
 * Approximate geolocation for an IP via a free lookup service.
 * Never throws — returns nulls on any failure so the redirect stays fast.
 */
export async function lookupLocation(ip) {
  const normalized = normalizeIp(ip);
  if (!normalized || isPrivateIp(normalized)) {
    return {
      country: null,
      countryCode: null,
      region: null,
      city: null,
      latitude: null,
      longitude: null,
    };
  }

  const cached = geoCache.get(normalized);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  if (cached) geoCache.delete(normalized);

  const url = `http://ip-api.com/json/${encodeURIComponent(normalized)}?fields=status,message,country,countryCode,regionName,city,lat,lon`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`geo status ${res.status}`);
    const body = await res.json();
    if (body.status !== 'success') throw new Error(body.message || 'geo lookup failed');

    const data = {
      country: body.country || null,
      countryCode: body.countryCode || null,
      region: body.regionName || null,
      city: body.city || null,
      latitude: typeof body.lat === 'number' ? body.lat : null,
      longitude: typeof body.lon === 'number' ? body.lon : null,
    };

    if (geoCache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = geoCache.keys().next().value;
      geoCache.delete(oldestKey);
    }
    geoCache.set(normalized, { data, expires: Date.now() + CACHE_TTL_MS });
    return data;
  } catch {
    return {
      country: null,
      countryCode: null,
      region: null,
      city: null,
      latitude: null,
      longitude: null,
    };
  }
}
