import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Wishlist from '../Wishlist';
import { useWishlist } from '../../hooks/api/useWishlist';

vi.mock('../../hooks/api/useWishlist', () => ({
  useWishlist: vi.fn(() => ({
    data: [
      {
        id: '1',
        product: {
          id: 'p1',
          title: 'Wishlist Watch',
          price: 20000,
          images: ['img.jpg'],
          category: 'watches',
          condition: 'Mint',
          listingCategory: 'premium',
        },
      },
    ],
    isLoading: false,
  })),
  useRemoveFromWishlist: vi.fn(() => ({ mutate: vi.fn(), isLoading: false })),
}));

vi.mock('../../hooks/api/useCart', () => ({
  useCart: vi.fn(() => ({ data: [], isLoading: false })),
  useAddToCart: vi.fn(() => ({ mutate: vi.fn(), isLoading: false })),
}));

vi.mock('../../utils/storage', () => ({
  getUser: vi.fn(() => ({ id: 'user1' })),
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('Wishlist', () => {
  it('renders My Wishlist heading', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter>
            <Wishlist />
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>,
    );
    expect(screen.getByText('My Wishlist')).toBeInTheDocument();
  });

  it('renders wishlist items', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter>
            <Wishlist />
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>,
    );
    expect(screen.getByText('Wishlist Watch')).toBeInTheDocument();
  });

  it('renders add to cart button', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter>
            <Wishlist />
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>,
    );
    expect(screen.getByText(/add to cart/i)).toBeInTheDocument();
  });
});

// Same defect as the category grid: a failed /wishlist read left `data`
// undefined, the page defaulted it to [], and the shopper was told they had
// saved nothing.
describe('Wishlist - failed query', () => {
  const defaultUseWishlist = vi.mocked(useWishlist).getMockImplementation();

  afterEach(() => {
    vi.mocked(useWishlist).mockImplementation(defaultUseWishlist);
  });

  const renderWishlist = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter>
            <Wishlist />
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>,
    );

  it('shows a retryable error instead of "your wishlist is empty"', () => {
    const refetch = vi.fn();
    vi.mocked(useWishlist).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      isFetching: false,
      refetch,
    });

    renderWishlist();

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/we couldn't load your wishlist/i)).toBeInTheDocument();
    expect(screen.queryByText(/your wishlist is empty/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
