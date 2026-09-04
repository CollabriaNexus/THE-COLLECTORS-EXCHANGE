import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Cart from '../Cart';

vi.mock('../../hooks/api/useCart', () => ({
  useCart: vi.fn(() => ({
    data: [
      {
        id: '1',
        product: {
          id: 'p1',
          title: 'Cart Watch',
          price: 15000,
          images: ['img.jpg'],
          category: 'watches',
          condition: 'Excellent',
        },
        quantity: 1,
      },
    ],
    isLoading: false,
  })),
  useRemoveFromCart: vi.fn(() => ({ mutate: vi.fn(), isLoading: false })),
}));

vi.mock('../../hooks/api/useProducts', () => ({
  useProducts: vi.fn(() => ({ data: { products: [] }, isLoading: false })),
}));

vi.mock('../../utils/storage', () => ({
  getUser: vi.fn(() => ({ id: 'user1' })),
}));

vi.mock('../../components/ConfirmDialog', () => ({
  useConfirm: vi.fn(() => ({ confirm: vi.fn(() => Promise.resolve(true)) })),
}));

vi.mock('../../components/Toast', () => ({
  useToast: vi.fn(() => vi.fn()),
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('Cart', () => {
  it('renders Shopping Cart heading', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter>
            <Cart />
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>,
    );
    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
  });

  it('renders cart items', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter>
            <Cart />
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>,
    );
    expect(screen.getByText('Cart Watch')).toBeInTheDocument();
  });

  it('renders subtotal', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter>
            <Cart />
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>,
    );
    expect(screen.getByText(/subtotal/i)).toBeInTheDocument();
  });

  it('renders checkout button', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter>
            <Cart />
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>,
    );
    // "checkout" also appears in the reassurance copy under the button.
    expect(screen.getByRole('button', { name: /proceed to checkout/i })).toBeInTheDocument();
  });

  it('renders remove button', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter>
            <Cart />
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>,
    );
    // The remove control is an icon-only button with no accessible name, so
    // find it via the trash icon it renders (see __mocks__/lucide-react.js).
    const removeBtn = screen.getByTestId('lucide-trash2').closest('button');
    expect(removeBtn).toBeInTheDocument();
  });
});
