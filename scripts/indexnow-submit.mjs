// Submits URLs to the IndexNow protocol (Bing, Yandex, and other participating
// search engines pick these up — much faster than waiting for a natural crawl).
// Usage:
//   node scripts/indexnow-submit.mjs https://thecollectorsexchange.in/product/abc123 [...more urls]
//   node scripts/indexnow-submit.mjs --sitemap   (submits every URL currently in the sitemaps)
//
// Key file lives at public/<key>.txt and must already be deployed (IndexNow
// verifies key ownership by fetching https://<host>/<key>.txt).

const SITE_URL = 'https://thecollectorsexchange.in';
const INDEXNOW_KEY = '62ee34b0915ad2d7d694fd2343b032da';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

/**
 * Discovers sub-sitemaps from sitemap-index.xml rather than hardcoding paths,
 * so this can't silently drift out of sync when a sitemap route changes.
 * (An earlier hardcoded list pointed at /products/sitemap.xml instead of
 * /api/products/sitemap.xml and silently skipped every product page.)
 */
async function collectSitemapUrls() {
  const urls = new Set();

  const readLocs = async (url) => {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`[indexnow] ${url} -> HTTP ${res.status}`);
        return [];
      }
      const xml = await res.text();
      return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].trim());
    } catch (err) {
      console.error(`[indexnow] Could not fetch ${url}:`, err.message);
      return [];
    }
  };

  const subSitemaps = await readLocs(`${SITE_URL}/sitemap-index.xml`);
  if (subSitemaps.length === 0) {
    throw new Error('sitemap-index.xml returned no sub-sitemaps — aborting.');
  }

  for (const sitemapUrl of subSitemaps) {
    const locs = await readLocs(sitemapUrl);
    console.log(`[indexnow] ${sitemapUrl} -> ${locs.length} URLs`);
    locs.forEach((u) => urls.add(u));
  }

  return [...urls];
}

async function submit(urlList) {
  if (urlList.length === 0) {
    console.log('[indexnow] No URLs to submit.');
    return;
  }
  if (urlList.length > 10000) {
    throw new Error(`[indexnow] ${urlList.length} URLs exceeds the 10,000-per-request limit.`);
  }

  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: new URL(SITE_URL).host,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList,
    }),
  });

  console.log(`[indexnow] Submitted ${urlList.length} URL(s). Response: ${res.status}`);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error('[indexnow] Response body:', body);
    process.exitCode = 1;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const urls = args.includes('--sitemap') ? await collectSitemapUrls() : args;
  await submit(urls);
}

main();
