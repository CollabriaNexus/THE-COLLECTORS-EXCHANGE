import 'dotenv/config';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing from environment');
}

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

async function main() {
  const listRes = await fetch(
    `${SUPABASE_URL}/rest/v1/Product?isPublished=eq.true&select=id,title`,
    { headers },
  );
  if (!listRes.ok) {
    throw new Error(`Failed to list published products: ${listRes.status} ${await listRes.text()}`);
  }
  const published = await listRes.json();

  const backupPath = path.join(__dirname, `unpublished-product-ids-${Date.now()}.json`);
  writeFileSync(backupPath, JSON.stringify(published, null, 2));
  console.log(`Backed up ${published.length} currently-published product IDs to: ${backupPath}`);

  if (published.length === 0) {
    console.log('No published products found. Nothing to do.');
    return;
  }

  const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/Product?isPublished=eq.true`, {
    method: 'PATCH',
    headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify({ isPublished: false }),
  });

  if (!updateRes.ok) {
    throw new Error(`Failed to unpublish products: ${updateRes.status} ${await updateRes.text()}`);
  }

  const updated = await updateRes.json();
  console.log(`Unpublished ${updated.length} product(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
