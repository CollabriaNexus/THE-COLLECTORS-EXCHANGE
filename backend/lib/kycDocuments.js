/**
 * Normalisation for KYC document references held in `User.kycData`.
 *
 * Three shapes exist in production data, and all three point at objects in the
 * (now private) `kyc-documents` bucket:
 *
 *   1. LEGACY PUBLIC URL - written before the bucket was locked down:
 *      `https://<ref>.supabase.co/storage/v1/object/public/kyc-documents/kyc/<docType>-<ts>-<rand>.<ext>`
 *      Note there is NO user id in the object path, so nothing about the path
 *      itself proves ownership.
 *   2. RENDER URL - the image-transform variant of the same thing:
 *      `.../storage/v1/render/image/public/kyc-documents/<path>?width=...`
 *   3. CURRENT PATH - what `uploadKycDocument` writes now:
 *      `kyc/<supabase auth uid>/<uuid>.<ext>`
 *
 * All three have to become a bare object path before `createSignedUrl` will
 * take them. Because shape (1) carries no ownership information, the route does
 * not authorise on path shape alone: the authoritative gate is that the
 * requested path is one of the references actually stored on that one user's
 * record (see `collectKycDocumentPaths`).
 *
 * Mirrored on the client in `admin/src/utils/kycDocuments.js` and
 * `src/utils/kycDocuments.js` - keep the three in sync.
 */

export const KYC_BUCKET = 'kyc-documents';

const BUCKET_MARKER = `/${KYC_BUCKET}/`;

/**
 * Reduce a stored reference to a bare object path inside `kyc-documents`.
 *
 * Returns null - meaning "not an object in the KYC bucket, leave it alone" -
 * for anything that is not either a URL into that bucket or a path already
 * inside its `kyc/` namespace. The `kyc/` requirement matters: `kycData` is
 * submitted wholesale by the user, so free-text fields (company name, notes)
 * must not be able to masquerade as document references.
 *
 * @param {unknown} value
 * @returns {string|null}
 */
export function kycStoragePathFromReference(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (!/^https?:\/\//i.test(trimmed)) {
    // Already a storage path. Only the bucket's own `kyc/` namespace counts.
    const path = trimmed.split(/[?#]/)[0].replace(/^\/+/, '');
    return path.startsWith('kyc/') ? path : null;
  }

  let pathname;
  try {
    pathname = new URL(trimmed).pathname;
  } catch {
    return null;
  }

  // Keys off the bucket segment rather than the access mode in front of it, so
  // it matches every Supabase storage URL form - `/object/public/`,
  // `/object/sign/`, `/object/authenticated/` and `/render/image/public/`.
  // URL.pathname has already dropped the query string, so signed-URL tokens and
  // render parameters can never leak into the path.
  const index = pathname.indexOf(BUCKET_MARKER);
  if (index === -1) return null;

  const raw = pathname.slice(index + BUCKET_MARKER.length);
  if (!raw) return null;

  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    // Malformed percent-encoding: keep the raw segment rather than throwing.
    // It simply will not match anything in the allowlist.
  }

  return decoded.replace(/^\/+/, '') || null;
}

/**
 * Every KYC-bucket object path this user's record actually points at.
 *
 * Walks the whole `kycData` blob rather than a hardcoded field list, so a field
 * added later is covered automatically; values that are not KYC-bucket
 * references normalise to null and are skipped.
 *
 * @param {unknown} kycData
 * @returns {Set<string>}
 */
export function collectKycDocumentPaths(kycData) {
  const paths = new Set();
  const seen = new Set();

  const walk = (node, depth) => {
    if (depth > 6 || node === null || node === undefined) return;
    if (typeof node === 'string') {
      const path = kycStoragePathFromReference(node);
      if (path) paths.add(path);
      return;
    }
    if (typeof node !== 'object') return;
    if (seen.has(node)) return; // cycle guard
    seen.add(node);
    for (const child of Array.isArray(node) ? node : Object.values(node)) {
      walk(child, depth + 1);
    }
  };

  walk(kycData, 0);
  return paths;
}

/**
 * True when a path is scoped to a specific uploader, i.e. `kyc/<id>/<file>`.
 *
 * Current uploads are; legacy `kyc/<docType>-<ts>-<rand>.<ext>` objects are not,
 * which is exactly why they cannot be authorised by path shape.
 *
 * @param {string} path
 * @returns {string|null} the owner id segment, or null for a flat legacy path
 */
export function kycPathOwnerId(path) {
  if (typeof path !== 'string') return null;
  const segments = path.split('/');
  if (segments.length < 3 || segments[0] !== 'kyc') return null;
  return segments[1] || null;
}
