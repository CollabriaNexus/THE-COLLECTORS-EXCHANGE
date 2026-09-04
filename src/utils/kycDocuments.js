/**
 * Shared handling for KYC document references stored in `User.kycData`.
 *
 * THREE shapes exist in production data, and all three point at objects in the
 * PRIVATE `kyc-documents` bucket:
 *
 *  1. LEGACY PUBLIC URL, written before the bucket was locked down:
 *     `https://<ref>.supabase.co/storage/v1/object/public/kyc-documents/kyc/<docType>-<ts>-<rand>.<ext>`
 *  2. RENDER URL, the image-transform variant of the same object:
 *     `.../storage/v1/render/image/public/kyc-documents/<path>?width=...`
 *  3. STORAGE PATH, what `uploadKycDocument` writes now:
 *     `kyc/<supabase auth uid>/<uuid>.<ext>`
 *
 * Once the bucket is private, shapes (1) and (2) stop resolving - a public URL
 * into a private bucket 403s. All three therefore have to be normalised to an
 * object path and exchanged for a short-lived, service-role-signed URL.
 *
 * The user-facing app cannot mint one: the storage RLS policy grants no SELECT
 * to `anon` or `authenticated`, and there is no user-facing signing endpoint -
 * reads are admin-only by design. So here every KYC-bucket reference resolves
 * to `null` and the UI shows a non-linked "uploaded" state. Only a URL pointing
 * somewhere OTHER than this bucket is still openable.
 *
 * Mirror of `admin/src/utils/kycDocuments.js` (admin app, which does have a
 * resolver) and `backend/lib/kycDocuments.js` (server) - keep the three in sync.
 */

export const KYC_BUCKET = 'kyc-documents';

const BUCKET_MARKER = `/${KYC_BUCKET}/`;

/** True for any non-empty reference, URL or storage path. */
export const isKycDocumentRef = (value) => typeof value === 'string' && value.trim().length > 0;

/** True for a full-URL reference of any kind. */
export const isLegacyPublicKycUrl = (value) =>
  typeof value === 'string' && /^https?:\/\//i.test(value.trim());

/**
 * Reduce a stored reference to a bare object path inside `kyc-documents`.
 *
 * @param {unknown} value
 * @returns {string|null} the object path, or null when the value is not an
 *   object in the KYC bucket (free text, or a URL pointing elsewhere).
 */
export const kycStoragePathFromReference = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (!/^https?:\/\//i.test(trimmed)) {
    // Already a storage path. Only the bucket's own `kyc/` namespace counts, so
    // free-text kycData fields cannot masquerade as document references.
    const path = trimmed.split(/[?#]/)[0].replace(/^\/+/, '');
    return path.startsWith('kyc/') ? path : null;
  }

  let pathname;
  try {
    pathname = new URL(trimmed).pathname;
  } catch {
    return null;
  }

  // Keys off the bucket segment, not the access mode in front of it, so this
  // matches `/object/public/`, `/object/sign/`, `/object/authenticated/` and
  // `/render/image/public/` alike. URL.pathname has already dropped the query
  // string, so render params and signed-URL tokens never enter the path.
  const index = pathname.indexOf(BUCKET_MARKER);
  if (index === -1) return null;

  const raw = pathname.slice(index + BUCKET_MARKER.length);
  if (!raw) return null;

  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    // Malformed percent-encoding: keep the raw segment rather than throwing.
  }

  return decoded.replace(/^\/+/, '') || null;
};

/**
 * True when a reference must be exchanged for a signed URL before it can be
 * displayed - which, in this app, means it cannot be displayed at all.
 */
export const needsSignedKycUrl = (value) => kycStoragePathFromReference(value) !== null;

/** File extension of a reference, lowercased and without the dot ('' if none). */
export const kycDocumentExtension = (value) => {
  if (!isKycDocumentRef(value)) return '';
  const withoutQuery = value.trim().split(/[?#]/)[0];
  const lastSegment = withoutQuery.split('/').pop() || '';
  const dot = lastSegment.lastIndexOf('.');
  return dot === -1 ? '' : lastSegment.slice(dot + 1).toLowerCase();
};

/** True when the reference points at a PDF (drives icon/label choice). */
export const isPdfKycDocument = (value) => kycDocumentExtension(value) === 'pdf';

/**
 * Best-effort href for a KYC document reference in the user-facing app.
 *
 * @returns {string|null} the URL for a reference outside the KYC bucket,
 *   otherwise null - a KYC-bucket object (path OR legacy public URL) is not
 *   openable from here now that the bucket is private.
 */
export const resolveKycDocumentHref = (value) => {
  if (!isKycDocumentRef(value)) return null;
  if (needsSignedKycUrl(value)) return null;
  return isLegacyPublicKycUrl(value) ? value.trim() : null;
};
