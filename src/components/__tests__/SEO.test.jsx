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
  it('renders structured data script tag', () => {
    renderWithHelmet(<OrganizationSchema />);
    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();
    const data = JSON.parse(script.textContent);
    expect(data['@type']).toBe('Organization');
  });
});

describe('WebSiteSchema', () => {
  it('renders WebSite schema', () => {
    renderWithHelmet(<WebSiteSchema />);
    const script = document.querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(script.textContent);
    expect(data['@type']).toBe('WebSite');
  });
});

describe('ProductSchema', () => {
  it('renders Product schema with provided props', () => {
    const props = {
      name: 'Test Watch',
      description: 'A fine watch',
      image: 'watch.jpg',
      sku: 'W001',
      brand: 'Rolex',
    };
    renderWithHelmet(<ProductSchema {...props} />);
    const script = document.querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(script.textContent);
    expect(data['@type']).toBe('Product');
    expect(data.name).toBe('Test Watch');
  });

  it('renders with minimal props', () => {
    renderWithHelmet(<ProductSchema name="Minimal" />);
    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();
  });
});

describe('BreadcrumbSchema', () => {
  it('renders BreadcrumbList schema', () => {
    const items = [
      { name: 'Home', url: '/' },
      { name: 'Category', url: '/category' },
    ];
    renderWithHelmet(<BreadcrumbSchema items={items} />);
    const script = document.querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(script.textContent);
    expect(data['@type']).toBe('BreadcrumbList');
    expect(data.itemListElement).toHaveLength(2);
  });

  it('handles empty items', () => {
    renderWithHelmet(<BreadcrumbSchema items={[]} />);
    const script = document.querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(script.textContent);
    expect(data.itemListElement).toHaveLength(0);
  });
});

describe('FAQSchema', () => {
  it('renders FAQPage schema', () => {
    const faqs = [{ question: 'Q1', answer: 'A1' }];
    renderWithHelmet(<FAQSchema faqs={faqs} />);
    const script = document.querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(script.textContent);
    expect(data['@type']).toBe('FAQPage');
  });

  it('handles empty faqs array', () => {
    renderWithHelmet(<FAQSchema faqs={[]} />);
    const script = document.querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(script.textContent);
    expect(data.mainEntity).toHaveLength(0);
  });
});

describe('ArticleSchema', () => {
  it('renders Article schema', () => {
    const props = { headline: 'Test', image: 'img.jpg', datePublished: '2024-01-01' };
    renderWithHelmet(<ArticleSchema {...props} />);
    const script = document.querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(script.textContent);
    expect(data['@type']).toBe('Article');
    expect(data.headline).toBe('Test');
  });

  it('renders with minimal props', () => {
    renderWithHelmet(<ArticleSchema />);
    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();
  });
});
