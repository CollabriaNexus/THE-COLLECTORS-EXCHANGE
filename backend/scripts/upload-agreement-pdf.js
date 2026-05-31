import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BUCKET = 'seller-agreements';
const FILE_NAME = 'seller-agreement-template.pdf';

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
    });
    if (error) throw error;
    console.log(`Created bucket "${BUCKET}"`);
  } else {
    console.log(`Bucket "${BUCKET}" already exists`);
  }
}

async function uploadPdf() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const filePath = resolve(__dirname, '..', 'seller-agreement.pdf');
  const fileBuffer = await readFile(filePath);

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(FILE_NAME, fileBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(FILE_NAME);

  console.log(`Uploaded successfully!`);
  console.log(`Public URL: ${publicUrlData.publicUrl}`);
  return publicUrlData.publicUrl;
}

async function main() {
  try {
    await ensureBucket();
    const url = await uploadPdf();
    console.log(`\nAdd this to your backend .env:`);
    console.log(`SELLER_AGREEMENT_PDF_URL=${url}`);
  } catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
  }
}

main();
