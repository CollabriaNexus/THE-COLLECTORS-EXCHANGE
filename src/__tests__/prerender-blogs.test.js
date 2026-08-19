import {
  buildArchiveIndexHtml,
  buildCategoryHtml,
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
    expect(html).toContain('href="/category/?cat=Timepieces"');
    expect(html).toContain('href="/product/watch-1/"');
    expect(html).toContain('href="/product/camera-1/"');
    expect(html).toContain('1967 Hand-Wound Watch');
    expect(html).toContain('Condition: Good');
    expect(html).not.toContain('Loading content');
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
