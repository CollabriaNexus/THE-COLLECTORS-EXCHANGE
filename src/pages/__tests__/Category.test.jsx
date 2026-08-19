import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Category from '../Category';

vi.mock('../../hooks/api/useProducts', () => ({
  useProducts: vi.fn(() => ({
    data: {
      products: [
        {
          id: '1',
          title: 'Category Product',
          price: 5000,
          images: ['img.jpg'],
          category: 'watches',
          condition: 'Good',
          listingCategory: 'standard',
        },
      ],
    },
    isLoading: false,
  })),
}));

vi.mock('../../hooks/api/useCategoryCounts', () => ({
  useCategoryCounts: vi.fn(() => ({ data: { Timepieces: 1 } })),
}));

vi.mock('../../hooks/api/useCart', () => ({
  useCart: vi.fn(() => ({ data: [], isLoading: false })),
  useAddToCart: vi.fn(() => ({ mutate: vi.fn(), isLoading: false })),
}));

vi.mock('../../hooks/api/useWishlist', () => ({
  useWishlist: vi.fn(() => ({ data: [], isLoading: false })),
  useAddToWishlist: vi.fn(() => ({ mutate: vi.fn(), isLoading: false })),
  useRemoveFromWishlist: vi.fn(() => ({ mutate: vi.fn(), isLoading: false })),
}));

vi.mock('../../utils/storage', () => ({
  getUser: vi.fn(() => null),
}));

vi.mock('../../components/Toast', () => ({
  useToast: vi.fn(() => vi.fn()),
}));

vi.mock('../../components/Motion', () => ({
  Reveal: ({ children }) => <div>{children}</div>,
  Stagger: ({ children }) => <div>{children}</div>,
  Tilt: ({ children }) => <div>{children}</div>,
}));

const renderCategory = (initialEntry = '/category') => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Category />
        </MemoryRouter>
      </HelmetProvider>
    </QueryClientProvider>,
  );
};

describe('Category', () => {
  it('renders category filter buttons', () => {
    renderCategory();
    expect(screen.getByText(/all/i)).toBeInTheDocument();
  });

  it('renders product grid', () => {
    renderCategory();
    expect(screen.getByText('Category Product')).toBeInTheDocument();
  });

  it('renders category names', () => {
    renderCategory();
    expect(screen.getAllByText('Timepieces').length).toBeGreaterThan(0);
  });

  it('keeps the clean category hub indexable and self-canonical', async () => {
    renderCategory('/category');

    await waitFor(() => {
      expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
        'href',
        'https://thecollectorsexchange.in/category/',
      );
      expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
        'content',
        'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
      );
    });
  });

  it('noindexes filter, search and sort states while canonicalizing to the clean category', async () => {
    renderCategory('/category?q=hmt&condition=Good&sort=price');

    await waitFor(() => {
      expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
        'href',
        'https://thecollectorsexchange.in/category/',
      );
      expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
        'content',
        'noindex, follow',
      );
    });
  });

  it('uses a future curated category pathname as the clean canonical', async () => {
    renderCategory('/category/timepieces?sort=price');

    await waitFor(() => {
      expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
        'href',
        'https://thecollectorsexchange.in/category/timepieces/',
      );
      expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
        'content',
        'noindex, follow',
      );
    });
  });
});
