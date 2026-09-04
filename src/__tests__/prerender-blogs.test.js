import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  buildArchiveIndexHtml,
  buildCategoryHtml,
  buildHomeEntityGraph,
  buildProductHtml,
  buildProductMetaTags,
} from '../../scripts/prerender-blogs.mjs';

describe('public HTML prerendering', () => {
  it('renders published article content and crawlable links on the archive index', () => {
    const html = buildArchiveIndexHtml([
      {
        title: 'Inside a Mechanical Movement',
        slug: 'mechanical-movement',
        excerpt: 'A factual guide to the components inside a mechanical watch.',
        category: 'Horology',
        coverImage: 'https://images.example/archive.jpg',
        publishedAt: '2026-08-10T10:30:00.000Z',
        status: 'PUBLISHED',
      },
    ]);

    expect(html).toMatch(/<h1[^>]*>The Archive<\/h1>/);
    expect(html).toContain('href="/archive/mechanical-movement/"');
    expect(html).toContain('Inside a Mechanical Movement');
    expect(html).toContain('A factual guide to the components inside a mechanical watch.');
    expect(html).not.toContain('Loading articles');
  });

  it('renders category filters and crawlable product links on the category hub', () => {
    const html = buildCategoryHtml([
      {
        id: 'watch-1',
        title: '1967 Hand-Wound Watch',
        category: 'Timepieces',
        condition: 'Good',
        price: 42500,
        images: ['https://images.example/watch.jpg'],
      },
      {
        id: 'camera-1',
        title: 'Chrome Rangefinder Camera',
        category: 'Collectibles',
        condition: 'Fair',
        price: 18000,
      },
    ]);

    expect(html).toMatch(/<h1[^>]*>The Exchange<\/h1>/);
    expect(html).toContain('href="/category/timepieces/"');
    expect(html).toContain('href="/product/watch-1/"');
    expect(html).toContain('href="/product/camera-1/"');
    expect(html).toContain('1967 Hand-Wound Watch');
    expect(html).toContain('Condition: Good');
    expect(html).not.toContain('Loading content');
  });

  it('renders a self-canonical static category landing with matching products and schemas', () => {
    const html = buildCategoryHtml(
      [
        {
          id: 'watch-1',
          title: '1967 Hand-Wound Watch',
          category: 'Timepieces',
          condition: 'Good',
          price: 42500,
        },
        {
          id: 'camera-1',
          title: 'Chrome Rangefinder Camera',
          category: 'Collectibles',
          condition: 'Fair',
          price: 18000,
        },
      ],
      'timepieces',
    );

    expect(html).toContain(
      '<link rel="canonical" href="https://thecollectorsexchange.in/category/timepieces/"',
    );
    expect(html).toMatch(/<h1[^>]*>Shop Timepieces<\/h1>/);
    // NOTE: the landing hero used to also print the category tagline
    // ("The Mechanical Heartbeat") and intro paragraph. That line was dropped
    // from buildCategoryHtml in commit 33350ca, and `intro` no longer exists
    // on the entries in src/config/categories.js, so there is nothing to
    // assert here today. See the report note about the thin-content
    // regression on category landing pages.
    expect(html).toContain('href="/product/watch-1/"');
    expect(html).not.toContain('href="/product/camera-1/"');
    expect(html).toContain('"@type":"CollectionPage"');
    expect(html).toContain('"@type":"ItemList"');
    expect(html).toContain('"@type":"BreadcrumbList"');
  });

  it('safely embeds product-controlled values in category JSON-LD', () => {
    const adversarialTitle = '</script><script>alert(1)</script>&\u2028\u2029';
    const html = buildCategoryHtml([
      {
        id: 'hostile-watch',
        title: adversarialTitle,
        category: 'Timepieces',
      },
    ]);
    const jsonLdScripts = [
      ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g),
    ].map((match) => match[1]);
    const itemListJson = jsonLdScripts.find((script) => script.includes('"@type":"ItemList"'));

    expect(html).not.toContain('</script><script>alert(1)</script>');
    expect(itemListJson).toContain(
      '\\u003C/script\\u003E\\u003Cscript\\u003Ealert(1)\\u003C/script\\u003E\\u0026\\u2028\\u2029',
    );
    expect(JSON.parse(itemListJson).itemListElement[0].item.name).toBe(adversarialTitle);
  });

  it('builds the initial home Organization and WebSite graph with client canonical ids', () => {
    const graph = buildHomeEntityGraph();

    expect(graph['@graph']).toHaveLength(2);
    expect(graph['@graph'][0]).toMatchObject({
      '@type': 'Organization',
      '@id': 'https://thecollectorsexchange.in/#organization',
      url: 'https://thecollectorsexchange.in/',
    });
    expect(graph['@graph'][1]).toMatchObject({
      '@type': 'WebSite',
      '@id': 'https://thecollectorsexchange.in/#website',
      publisher: { '@id': 'https://thecollectorsexchange.in/#organization' },
    });
  });

  it('lists every clean category landing in the static sitemap without filter parameters', () => {
    const sitemap = readFileSync(resolve(process.cwd(), 'public', 'sitemap.xml'), 'utf8');

    for (const slug of [
      'timepieces',
      'accessories',
      'collectibles',
      'antiques',
      'toys-and-pop-culture',
      'jewelry',
    ]) {
      expect(sitemap).toContain(`<loc>https://thecollectorsexchange.in/category/${slug}/</loc>`);
    }
    expect(sitemap).not.toContain('?cat=');
  });

  it('renders only provided factual product details and escapes values', () => {
    const product = {
      id: 'watch-1',
      title: 'Omega <Seamaster>',
      category: 'Timepieces',
      condition: 'Very Good',
      price: 97500,
      description: 'Original dial & signed crown.\n\nServiced in 2025.',
      specs: JSON.stringify([
        { key: 'Movement', value: 'Manual <wind>' },
        { key: 'Case size', value: '35 mm' },
      ]),
      isVerified: true,
      authenticityStatus: 'Verified',
    };

    const html = buildProductHtml(product, buildProductMetaTags(product));

    expect(html).toMatch(/<h1[^>]*>Omega &lt;Seamaster&gt;<\/h1>/);
    expect(html).toContain('Original dial &amp; signed crown.');
    expect(html).toContain('Serviced in 2025.');
    expect(html).toMatch(/>Condition<\/dt>\s*<dd>Very Good<\/dd>/);
    expect(html).toMatch(/<h2[^>]*>Specifications<\/h2>/);
    expect(html).toMatch(/>Movement<\/th>\s*<td>Manual &lt;wind&gt;<\/td>/);
    expect(html).toMatch(/>Case size<\/th>\s*<td>35 mm<\/td>/);
    expect(html).toContain('Verified Authentic');
    expect(html).not.toContain('Loading full listing');
    expect(html).not.toContain('<script>alert');
  });

  it('classifies Mint as used and only explicit New as new in Product JSON-LD', () => {
    const mintMeta = buildProductMetaTags({
      id: 'mint-watch',
      title: 'Mint Condition Watch',
      condition: 'Mint',
    });
    const newMeta = buildProductMetaTags({
      id: 'new-watch',
      title: 'New Condition Watch',
      condition: 'New',
    });

    expect(mintMeta).toContain('"itemCondition":"https://schema.org/UsedCondition"');
    expect(mintMeta).not.toContain('https://schema.org/MintCondition');
    expect(newMeta).toContain('"itemCondition":"https://schema.org/NewCondition"');
  });

  it('omits factual product sections when the API did not provide them', () => {
    const product = { id: 'minimal-1', title: 'Untitled Study' };
    const html = buildProductHtml(product, buildProductMetaTags(product));

    expect(html).toMatch(/<h1[^>]*>Untitled Study<\/h1>/);
    expect(html).not.toContain('Specifications');
    expect(html).not.toContain('Verified Authentic');
    expect(html).not.toContain('Condition</dt>');
  });
});
