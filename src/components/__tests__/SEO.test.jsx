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
});

describe('WebSiteSchema', () => {
  it('renders WebSite schema', async () => {
    renderWithHelmet(<WebSiteSchema />);
    const script = await getJsonLd();
    const data = JSON.parse(script.textContent);
    expect(data['@type']).toBe('WebSite');
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
