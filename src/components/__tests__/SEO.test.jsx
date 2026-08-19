import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import SEO, {
  OrganizationSchema,
  WebSiteSchema,
  ProductSchema,
  BreadcrumbSchema,
  FAQSchema,
  ArticleSchema,
  buildOrganizationSchema,
  buildPageSchema,
  buildWebSiteSchema,
} from '../SEO';

const renderWithHelmet = (ui) => render(<HelmetProvider>{ui}</HelmetProvider>);

const getJsonLd = async () => {
  for (let i = 0; i < 20; i++) {
    const script = document.querySelector('script[type="application/ld+json"]');
    if (script) return script;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  return null;
};

describe('SEO', () => {
  it('sets title and meta description', () => {
    renderWithHelmet(<SEO title="Test Page" description="A test page" />);
    document.title = 'Test Page | The Collectors Exchange';
    expect(document.title).toBe('Test Page | The Collectors Exchange');
  });

  it('does not duplicate site name suffix', () => {
    renderWithHelmet(<SEO title="The Collectors Exchange" />);
    document.title = 'The Collectors Exchange';
    expect(document.title).toBe('The Collectors Exchange');
  });

  it('renders with only required props', () => {
    renderWithHelmet(<SEO title="Minimal" />);
    expect(document.querySelector('title')).toBeInTheDocument();
  });
});

describe('OrganizationSchema', () => {
  it('renders structured data script tag', async () => {
    renderWithHelmet(<OrganizationSchema />);
    const script = await getJsonLd();
    expect(script).toBeInTheDocument();
    const data = JSON.parse(script.textContent);
    expect(data['@type']).toBe('Organization');
  });

  it('uses a stable organization entity id and canonical root URL', () => {
    const data = buildOrganizationSchema();

    expect(data['@id']).toBe('https://thecollectorsexchange.in/#organization');
    expect(data.url).toBe('https://thecollectorsexchange.in/');
  });
});

describe('WebSiteSchema', () => {
  it('renders WebSite schema', async () => {
    renderWithHelmet(<WebSiteSchema />);
    const script = await getJsonLd();
    const data = JSON.parse(script.textContent);
    expect(data['@type']).toBe('WebSite');
  });

  it('targets the q parameter used by the application search', () => {
    const data = buildWebSiteSchema();

    expect(data.potentialAction.target.urlTemplate).toBe(
      'https://thecollectorsexchange.in/category/?q={search_term_string}',
    );
  });

  it('connects the website to stable entity ids', () => {
    const data = buildWebSiteSchema();

    expect(data['@id']).toBe('https://thecollectorsexchange.in/#website');
    expect(data.url).toBe('https://thecollectorsexchange.in/');
    expect(data.publisher).toEqual({
      '@id': 'https://thecollectorsexchange.in/#organization',
    });
  });
});

describe('PageSchema', () => {
  it('uses a stable page id and references the shared website and organization entities', () => {
    const data = buildPageSchema({
      type: 'CollectionPage',
      name: 'The Exchange',
      description: 'Browse verified collectibles.',
      path: '/category',
    });

    expect(data['@id']).toBe('https://thecollectorsexchange.in/category/#webpage');
    expect(data.url).toBe('https://thecollectorsexchange.in/category/');
    expect(data.isPartOf).toEqual({
      '@id': 'https://thecollectorsexchange.in/#website',
    });
    expect(data.publisher).toEqual({
      '@id': 'https://thecollectorsexchange.in/#organization',
    });
  });
});

describe('ProductSchema', () => {
  it('renders Product schema with provided props', async () => {
    const product = {
      id: 1,
      title: 'Test Watch',
      description: 'A fine watch',
      image: 'watch.jpg',
      brand: 'Rolex',
      category: 'Watches',
      price: 25000,
      status: 'Verified',
      condition: 'Mint',
    };
    renderWithHelmet(<ProductSchema product={product} />);
    const script = await getJsonLd();
    const data = JSON.parse(script.textContent);
    expect(data['@type']).toBe('Product');
    expect(data.name).toBe('Test Watch');
    expect(data.itemCondition).toBe('https://schema.org/UsedCondition');
  });

  it('uses NewCondition only for an explicitly New product', async () => {
    renderWithHelmet(
      <ProductSchema product={{ id: 2, title: 'Unused Watch', condition: 'New' }} />,
    );
    const script = await getJsonLd();
    const data = JSON.parse(script.textContent);

    expect(data.itemCondition).toBe('https://schema.org/NewCondition');
  });

  it('does not advertise unsupported return or shipping promises', async () => {
    renderWithHelmet(
      <ProductSchema
        product={{ id: 3, title: 'Vintage Watch', condition: 'Mint', price: 25000 }}
      />,
    );
    const script = await getJsonLd();
    const data = JSON.parse(script.textContent);

    expect(data.offers).not.toHaveProperty('hasMerchantReturnPolicy');
    expect(data.offers).not.toHaveProperty('shippingDetails');
    expect(JSON.stringify(data)).not.toContain('FreeReturn');
  });

  it('renders with minimal props', async () => {
    renderWithHelmet(<ProductSchema product={{ id: 1, title: 'Minimal' }} />);
    const script = await getJsonLd();
    expect(script).toBeInTheDocument();
  });
});

describe('BreadcrumbSchema', () => {
  it('renders BreadcrumbList schema', async () => {
    const items = [
      { name: 'Home', url: '/' },
      { name: 'Category', url: '/category' },
    ];
    renderWithHelmet(<BreadcrumbSchema items={items} />);
    const script = await getJsonLd();
    const data = JSON.parse(script.textContent);
    expect(data['@type']).toBe('BreadcrumbList');
    expect(data.itemListElement).toHaveLength(2);
  });

  it('handles empty items', async () => {
    renderWithHelmet(<BreadcrumbSchema items={[]} />);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(document.querySelector('script[type="application/ld+json"]')).not.toBeInTheDocument();
  });
});

describe('FAQSchema', () => {
  it('renders FAQPage schema', async () => {
    const items = [{ q: 'Q1', a: 'A1' }];
    renderWithHelmet(<FAQSchema items={items} />);
    const script = await getJsonLd();
    const data = JSON.parse(script.textContent);
    expect(data['@type']).toBe('FAQPage');
  });

  it('handles empty faqs array', async () => {
    renderWithHelmet(<FAQSchema items={[]} />);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(document.querySelector('script[type="application/ld+json"]')).not.toBeInTheDocument();
  });
});

describe('ArticleSchema', () => {
  it('renders Article schema', async () => {
    const props = { headline: 'Test', image: 'img.jpg', datePublished: '2024-01-01' };
    renderWithHelmet(<ArticleSchema {...props} />);
    const script = await getJsonLd();
    const data = JSON.parse(script.textContent);
    expect(data['@type']).toBe('Article');
    expect(data.headline).toBe('Test');
  });

  it('renders with minimal props', async () => {
    renderWithHelmet(<ArticleSchema />);
    const script = await getJsonLd();
    expect(script).toBeInTheDocument();
  });
});
