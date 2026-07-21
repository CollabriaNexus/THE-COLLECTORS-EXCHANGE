const SITE_URL = 'https://thecollectorsexchange.in';
const API_URL = 'https://07u78lzel7.execute-api.ap-south-1.amazonaws.com';

export async function onRequest() {
  try {
    const res = await fetch(`${API_URL}/api/blog?limit=1000`);
    if (!res.ok) {
      return new Response('Failed to fetch blogs', { status: 502 });
    }

    const { posts } = await res.json();

    const urls = posts
      .filter((p) => p.status === 'PUBLISHED' && p.slug)
      .map((post) => {
        const lastmod = post.updatedAt || post.publishedAt || post.createdAt;
        const lastmodDate = lastmod ? new Date(lastmod).toISOString().split('T')[0] : '';
        return `  <url>
    <loc>${SITE_URL}/archive/${post.slug}</loc>${lastmodDate ? `\n    <lastmod>${lastmodDate}</lastmod>` : ''}
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
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
    return new Response('Internal error generating sitemap', { status: 500 });
  }
}
