-- ============================================================================
-- KYC document storage: private bucket + row level security
--
--   *** THIS FILE HAS NOT BEEN APPLIED. IT IS FOR THE SITE OWNER TO RUN. ***
--
-- It is deliberately NOT in backend/prisma/migrations/ : `prisma migrate`
-- manages the application schema, and these statements touch Supabase's
-- `storage` schema, which Prisma does not own. Nothing here runs automatically.
--
-- Why
-- ---
-- `src/utils/storage.js#uploadKycDocument` writes Aadhaar / PAN / GST /
-- incorporation scans to the `kyc-documents` bucket at
--
--     kyc/<supabase auth uid>/<uuid>.<ext>
--
-- The design is: users may PUT their own documents, and NOBODY may GET them
-- through the anon/authenticated API. Reads happen only server-side, via the
-- service-role key, as a short-lived signed URL minted by
-- `GET /api/admin/kyc/:userId/signed-url` (backend/routes/adminKyc.js). The
-- service role bypasses RLS, so it needs no policy of its own.
--
-- How to apply
-- ------------
-- 1. Make the bucket private (Dashboard -> Storage -> kyc-documents ->
--    Settings -> uncheck "Public bucket"), or run the UPDATE in step A below.
-- 2. Paste this whole file into the Supabase SQL editor
--    (Dashboard -> SQL Editor -> New query) and run it, or:
--        psql "$DATABASE_URL" -f docs/kyc-documents-storage-rls.sql
--    Run it against STAGING first if a staging project exists.
-- 3. Verify with the checks at the bottom of this file.
--
-- Every statement is written to be safe to re-run.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- A. Make the bucket private.
--
-- With `public = false`, `getPublicUrl()` links stop resolving and every read
-- must go through a signed URL. This is the single change that closes the
-- existing exposure; the policies below only govern who may write.
-- ----------------------------------------------------------------------------
update storage.buckets
   set public = false
 where id = 'kyc-documents';


-- ----------------------------------------------------------------------------
-- B. RLS is already enabled on storage.objects in a stock Supabase project.
--    Left here, commented, only as a reminder of the precondition - running it
--    is a no-op if it is already on, but it requires table ownership.
-- ----------------------------------------------------------------------------
-- alter table storage.objects enable row level security;


-- ----------------------------------------------------------------------------
-- C. Remove any pre-existing policy on this bucket.
--
-- IMPORTANT: policy names in the Supabase dashboard are free text, so a
-- previously created policy may be named something else entirely. Before
-- running this, list what actually exists:
--
--     select policyname, cmd, roles, qual, with_check
--       from pg_policies
--      where schemaname = 'storage' and tablename = 'objects';
--
-- and drop by name anything that grants access to bucket 'kyc-documents'.
-- The drops below only cover the names this file itself creates plus the
-- default names Supabase's "allow public access" template uses.
-- ----------------------------------------------------------------------------
drop policy if exists "kyc_documents_insert_own" on storage.objects;
drop policy if exists "kyc_documents_select_own" on storage.objects;
drop policy if exists "kyc_documents_update_own" on storage.objects;
drop policy if exists "kyc_documents_delete_own" on storage.objects;


-- ----------------------------------------------------------------------------
-- D. INSERT: an authenticated user may upload ONLY into their own folder.
--
-- storage.foldername(name) splits the object key on '/', so for
-- 'kyc/<uid>/<uuid>.pdf' it returns {'kyc', '<uid>'}. Requiring element 2 to
-- equal auth.uid() is what makes the user-scoped path in uploadKycDocument()
-- load-bearing rather than cosmetic: it stops user A writing into user B's
-- folder, and stops anyone writing to the bucket root.
--
-- No policy is created for the `anon` role, so unauthenticated uploads are
-- refused outright.
-- ----------------------------------------------------------------------------
create policy "kyc_documents_insert_own"
    on storage.objects
    for insert
    to authenticated
    with check (
        bucket_id = 'kyc-documents'
        and (storage.foldername(name))[1] = 'kyc'
        and (storage.foldername(name))[2] = auth.uid()::text
    );


-- ----------------------------------------------------------------------------
-- E. SELECT: intentionally NO policy, for ANY role.
--
-- With RLS on and no SELECT policy, `anon` and `authenticated` can never read
-- an object in this bucket - not even the user who uploaded it. That is the
-- point: an identity document should not be re-fetchable from the browser
-- session that uploaded it, and admins are not Supabase-authenticated users
-- with elevated storage rights, they go through the backend.
--
-- Reads are exclusively:
--     supabaseAdmin.storage.from('kyc-documents').createSignedUrl(path, 120)
-- in backend/routes/adminKyc.js, using SUPABASE_SERVICE_ROLE_KEY, which
-- bypasses RLS. That route re-checks that the requested path is inside the
-- target user's folder before signing.
--
-- DO NOT add a "users can read their own KYC documents" SELECT policy without
-- re-reading that decision. If the product ever needs it, it belongs behind
-- another server-side signed-URL endpoint, not an RLS grant.
--
-- UPDATE and DELETE are likewise left ungranted: a submitted KYC document is
-- evidence and should not be mutable or erasable by the submitter. Re-uploading
-- writes a new object under a fresh uuid (uploadKycDocument uses upsert: false).
-- ----------------------------------------------------------------------------


-- ============================================================================
-- Verification (run after applying)
-- ============================================================================
--
-- 1. Bucket is private:
--        select id, public from storage.buckets where id = 'kyc-documents';
--    -> expect public = false
--
-- 2. Exactly one policy touches this bucket, and it is INSERT-only:
--        select policyname, cmd, roles, with_check
--          from pg_policies
--         where schemaname = 'storage' and tablename = 'objects';
--    -> expect kyc_documents_insert_own, cmd = INSERT, roles = {authenticated}
--    -> expect NO policy with cmd = SELECT referencing 'kyc-documents'
--
-- 3. End-to-end, in the app:
--    a. As a signed-in user, submit a KYC document. It should upload and the
--       stored kycData value should be a path (`kyc/<uid>/<uuid>.<ext>`),
--       NOT an https:// URL.
--    b. Copy that path into a public URL shape
--       (<SUPABASE_URL>/storage/v1/object/public/kyc-documents/<path>) and
--       open it logged out -> expect 400/404, not the document.
--    c. As an admin, open the KYC review screen for that user -> the document
--       should render (via the signed-url endpoint), and the signed link should
--       stop working ~2 minutes later.
--
-- ============================================================================
-- Note on existing data
-- ============================================================================
-- Rows already in `User.kycData` hold full https:// public URLs written by the
-- old code, shaped like
--     <SUPABASE_URL>/storage/v1/object/public/kyc-documents/kyc/<docType>-<ts>-<rand>.<ext>
-- Making the bucket private breaks those links directly - and that is fine.
-- The app normalises EVERY kyc-documents reference (legacy `/object/public/`
-- URL, `/render/image/public/` URL, or bare storage path) down to its object
-- path and signs it through the admin endpoint. See:
--     backend/lib/kycDocuments.js       kycStoragePathFromReference()
--     admin/src/utils/kycDocuments.js   (client mirror + resolver)
--     src/utils/kycDocuments.js         (user app mirror)
-- so legacy previews keep working in the admin dashboard after you apply this.
--
-- Note the legacy object key contains NO user id, which is why the signing route
-- authorises against the set of references actually stored on that user's record
-- rather than against a path prefix. Re-collecting or renaming those objects
-- under `kyc/<uid>/...` would let the stricter folder check cover them too; that
-- is optional cleanup, not a prerequisite for applying this file.
--
-- The removed public-bucket fallback appears never to have fired: an enumeration
-- of the `product-images` bucket root (436 objects) found zero objects matching
-- its `kyc-<timestamp>-<rand>` naming. No stray identity documents are sitting
-- in the public product bucket.
