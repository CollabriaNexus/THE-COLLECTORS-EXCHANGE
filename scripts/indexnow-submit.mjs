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

async function collectSitemapUrls() {
  const sitemaps = [
    `${SITE_URL}/sitemap.xml`,
    `${SITE_URL}/products/sitemap.xml`,
    `${SITE_URL}/api/blog/sitemap.xml`,
  ];
  const urls = new Set();
  for (const sitemapUrl of sitemaps) {
    try {
      const res = await fetch(sitemapUrl);
      if (!res.ok) continue;
      const xml = await res.text();
      for (const match of xml.matchAll(/<loc>(.*?)<\/loc>/g)) {
        urls.add(match[1]);
      }
    } catch (err) {
      console.error(`[indexnow] Could not fetch ${sitemapUrl}:`, err.message);
    }
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
