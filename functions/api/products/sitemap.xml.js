const SITE_URL = 'https://thecollectorsexchange.in';
const API_URL = 'https://07u78lzel7.execute-api.ap-south-1.amazonaws.com';

export async function onRequest() {
  try {
    const res = await fetch(`${API_URL}/api/products?limit=1000`);
    if (!res.ok) {
      return new Response('Failed to fetch products', { status: 502 });
    }

    const data = await res.json();
    const products = data.products || data || [];

    const urls = products
      .filter((p) => p.id && p.isPublished)
      .map((product) => {
        const lastmod = product.updatedAt || product.createdAt;
        const lastmodDate = lastmod ? new Date(lastmod).toISOString().split('T')[0] : '';
        return `  <url>
    <loc>${SITE_URL}/product/${product.id}</loc>${lastmodDate ? `\n    <lastmod>${lastmodDate}</lastmod>` : ''}
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch {
    return new Response('Internal error generating product sitemap', { status: 500 });
  }
}
