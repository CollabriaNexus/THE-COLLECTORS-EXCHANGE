import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

vi.mock('../utils/gtag', () => ({
  pageview: vi.fn(),
}));

vi.mock('../hooks/api/useProducts', () => ({
  useProducts: vi.fn(() => ({ data: { products: [] }, isLoading: false })),
}));

vi.mock('../hooks/api/useCart', () => ({
  useCart: vi.fn(() => ({ data: [], isLoading: false })),
  useAddToCart: vi.fn(() => ({ mutate: vi.fn(), isLoading: false })),
  useRemoveFromCart: vi.fn(() => ({ mutate: vi.fn(), isLoading: false })),
}));

vi.mock('../hooks/api/useWishlist', () => ({
  useWishlist: vi.fn(() => ({ data: [], isLoading: false })),
  useAddToWishlist: vi.fn(() => ({ mutate: vi.fn(), isLoading: false })),
  useRemoveFromWishlist: vi.fn(() => ({ mutate: vi.fn(), isLoading: false })),
}));

vi.mock('../utils/storage', () => ({
  getUser: vi.fn(() => null),
}));

vi.mock('../hooks/useInView', () => ({
  useInView: () => [null, true],
}));

vi.mock('../hooks/useMediaQuery', () => ({
  useMediaQuery: () => true,
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading fallback while lazy routes load', () => {
    render(<App />);
    expect(screen.getByText(/loading the archive/i)).toBeInTheDocument();
  });

  it('redirects unknown routes to home', async () => {
    window.history.pushState({}, '', '/nonexistent');
    render(<App />);
    await vi.waitFor(
      () => {
        expect(window.location.pathname).toBe('/');
      },
      { timeout: 5000 },
    );
  });

  it('renders home page at root with header', async () => {
    window.history.pushState({}, '', '/');
    render(<App />);
    const exchangeText = await screen.findByText(/explore the exchange/i, {}, { timeout: 5000 });
    expect(exchangeText).toBeInTheDocument();
  });
});
