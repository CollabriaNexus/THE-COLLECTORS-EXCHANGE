import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProductCard from '../ProductCard';

vi.mock('../../hooks/api/useCart', () => ({
  useCart: vi.fn(() => ({ data: [], isLoading: false })),
  useAddToCart: vi.fn(() => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false })),
  useRemoveFromCart: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

vi.mock('../../hooks/api/useWishlist', () => ({
  useWishlist: vi.fn(() => ({ data: [] })),
  useAddToWishlist: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useRemoveFromWishlist: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

vi.mock('../../utils/storage', () => ({
  getUser: vi.fn(() => ({ id: 'user1' })),
}));

vi.mock('../Toast', () => ({
  useToast: vi.fn(() => vi.fn()),
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const mockProduct = {
  id: '1',
  title: 'Test Watch',
  name: 'Test Watch',
  price: 15000,
  image: '/test.jpg',
  images: ['/test.jpg'],
  category: 'watches',
  condition: 'Excellent',
  description: 'A fine watch',
  listingCategory: 'premium',
  isVerified: false,
};

const renderProductCard = (props = {}) =>
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ProductCard product={mockProduct} {...props} />
      </MemoryRouter>
    </QueryClientProvider>,
  );

describe('ProductCard', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('renders product title', () => {
    renderProductCard();
    expect(screen.getByText('Test Watch')).toBeInTheDocument();
  });

  it('renders product price', () => {
    renderProductCard();
    expect(screen.getByText(/15,000/)).toBeInTheDocument();
  });

  it('renders product category', () => {
    renderProductCard();
    expect(screen.getByText(/watches/i)).toBeInTheDocument();
  });

  it('uses a larger mobile-friendly price text size', () => {
    renderProductCard();
    const price = screen.getByText(/15,000/);
    expect(price.className).toContain('text-base');
    expect(price.className).toContain('sm:text-lg');
  });

  it('renders product image', () => {
    renderProductCard();
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
  });

  it('navigates to product detail on click', () => {
    renderProductCard();
    // The card wraps both the image and the title in their own <Link>.
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => expect(link).toHaveAttribute('href', '/product/1'));
  });

  it('renders add to cart button', () => {
    renderProductCard();
    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
  });

  it('renders verified badge when product is verified', () => {
    renderProductCard();
    expect(screen.queryByText('Verified')).not.toBeInTheDocument();
    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ProductCard product={{ ...mockProduct, isVerified: true }} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(getByText('Verified')).toBeInTheDocument();
  });

  it('does not show Promoted badge at default 10% commission', () => {
    renderProductCard();
    expect(screen.queryByText('Promoted')).not.toBeInTheDocument();
    expect(screen.queryByText('Premium')).not.toBeInTheDocument();
  });

  it('shows Promoted badge when commissionPercent >= 20', () => {
    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ProductCard product={{ ...mockProduct, commissionPercent: 20 }} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(getByText('Promoted')).toBeInTheDocument();
  });

  it('shows Premium badge when commissionPercent >= 25', () => {
    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ProductCard product={{ ...mockProduct, commissionPercent: 25 }} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(getByText('Premium')).toBeInTheDocument();
  });

  it('shows both Promoted and Premium when commissionPercent is 25', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ProductCard product={{ ...mockProduct, commissionPercent: 25 }} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByText('Promoted')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
  });
});
