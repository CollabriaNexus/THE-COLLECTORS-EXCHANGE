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
 * into a private bucket 403s. So ALL THREE have to be normalised to an object
 * path and exchanged for a short-lived signed URL via
 * `GET /admin/kyc/:userId/signed-url?path=...`, which is service-role only.
 * The only references that still resolve directly are URLs pointing somewhere
 * OTHER than this bucket.
 *
 * Mirror of `src/utils/kycDocuments.js` (user app) and
 * `backend/lib/kycDocuments.js` (server) - keep the three in sync.
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
 * displayed. Drives whether a preview can render synchronously.
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
 * The one place that turns a stored reference into something openable.
 *
 * @param {string} value  URL or storage path
 * @param {(path: string) => Promise<string>} [signPath]  resolver for a
 *   KYC-bucket object (see `createKycDocumentResolver`).
 * @returns {Promise<string|null>} an openable URL, or null when the reference
 *   needs signing and no resolver was supplied.
 */
export const resolveKycDocumentUrl = async (value, signPath) => {
  if (!isKycDocumentRef(value)) return null;

  const path = kycStoragePathFromReference(value);
  if (path === null) {
    // Not in the KYC bucket. A URL pointing elsewhere is used untouched;
    // anything else is not a document reference at all.
    return isLegacyPublicKycUrl(value) ? value.trim() : null;
  }

  if (typeof signPath !== 'function') return null;
  return signPath(path);
};

/**
 * Build a resolver bound to one user, backed by the admin signed-url endpoint.
 *
 * @param {string} userId  the DB user id whose KYC record is being reviewed
 * @param {{ get: Function }} client  an axios-like client (admin `apiClient`)
 */
export const createKycDocumentResolver = (userId, client) => async (path) => {
  const { data } = await client.get(`/admin/kyc/${encodeURIComponent(userId)}/signed-url`, {
    params: { path },
  });
  if (!data?.url) throw new Error('No signed URL returned');
  return data.url;
};
