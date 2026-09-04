// Image/document upload helpers for The Collectors' Exchange.
//
// The Supabase client is loaded with a DYNAMIC import inside each upload
// function rather than at module scope. Every upload here is already async, so
// awaiting the chunk costs nothing behaviourally — but it keeps
// `@supabase/supabase-js` (GoTrue + realtime + postgrest, ~hundreds of KB) out
// of the entry bundle. Anonymous visitors reach this module only through the
// re-exported session helpers below, and they never upload anything.
//
// Do NOT reintroduce `import { supabase } from './supabase'` at module scope.

// Session helpers live in ./session.js, which has zero imports on purpose.
// Re-exported here so long-standing importers (`import { getUser } from
// '../utils/storage'`) keep working untouched.
export { STORAGE_KEYS, getUser, setUser, clearUser } from './session';

// ============== STORAGE / IMAGES ==============

// Private bucket - no public URLs, reads only via short-lived signed URLs.
export const KYC_BUCKET = 'kyc-documents';

const getSupabase = async () => (await import('./supabase')).supabase;

export const uploadProductImage = async (file) => {
  try {
    if (!file) throw new Error('No file selected');

    const supabase = await getSupabase();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage.from('product-images').upload(filePath, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from('product-images').getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading product image:', error);
    throw error;
  }
};

/**
 * Upload a KYC identity document (Aadhaar / PAN / GST / incorporation scan).
 *
 * SECURITY CONTRACT - read before changing:
 *  - `kyc-documents` is a PRIVATE bucket. This function must NEVER fall back to
 *    a public bucket and must NEVER return a public URL: doing so publishes a
 *    government identity document to anyone who guesses (or is handed) the link.
 *    If the upload fails for any reason, it throws. Failing loudly is correct.
 *  - It returns the STORAGE PATH (`kyc/<supabase user id>/<uuid>.<ext>`), not a
 *    URL. That path is what gets persisted in `User.kycData`; reads go through
 *    a short-lived service-role signed URL (see the admin signed-url endpoint).
 *  - The path is scoped to the authenticated user's Supabase id so that an
 *    ownership-based storage RLS policy is expressible at all.
 *
 * @param {File} file
 * @param {string} docType - 'aadhaar' | 'pan' | 'gst' | 'incorporation' (kept for
 *   caller ergonomics / logging; it is NOT part of the stored path, which is
 *   deliberately opaque).
 * @returns {Promise<string>} storage path inside the `kyc-documents` bucket
 */
export const uploadKycDocument = async (file, docType) => {
  try {
    if (!file) throw new Error('No file selected');

    const supabase = await getSupabase();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user?.id) throw new Error('You must be signed in to upload a document');

    const fileExt = (file.name.split('.').pop() || 'bin').toLowerCase();
    const filePath = `kyc/${user.id}/${crypto.randomUUID()}.${fileExt}`;

    const { error } = await supabase.storage
      .from(KYC_BUCKET)
      .upload(filePath, file, { contentType: file.type || undefined, upsert: false });

    // No fallback. An identity document must never be re-uploaded to a public
    // bucket just because the private one rejected it.
    if (error) throw error;

    return filePath;
  } catch (error) {
    console.error(`Error uploading KYC document (${docType}):`, error);
    throw error;
  }
};

export const uploadBlogImage = async (file) => {
  try {
    if (!file) throw new Error('No file selected');
    const supabase = await getSupabase();
    const fileExt = file.name.split('.').pop();
    const fileName = `blog/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const { error } = await supabase.storage.from('product-images').upload(fileName, file);
    if (error) throw error;
    const {
      data: { publicUrl },
    } = supabase.storage.from('product-images').getPublicUrl(fileName);
    return publicUrl;
  } catch (error) {
    console.error('Error uploading blog image:', error);
    throw error;
  }
};

export const uploadTestimonialImage = async (file) => {
  try {
    if (!file) throw new Error('No file selected');

    const supabase = await getSupabase();
    const fileExt = file.name.split('.').pop();
    const fileName = `testimonials/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage.from('product-images').upload(filePath, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from('product-images').getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading testimonial image:', error);
    throw error;
  }
};
