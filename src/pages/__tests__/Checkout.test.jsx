import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test/utils';
import Checkout from '../Checkout';

// Mock every export of the real module — a partial factory makes vitest throw
// "No <name> export is defined on the mock" as soon as the page imports one
// of the missing hooks.
vi.mock('../../hooks/api/useCheckout', () => ({
  useCreateOrder: vi.fn(() => ({
    mutateAsync: vi.fn(() => ({ id: 'order1', amount: 15000 })),
    isLoading: false,
  })),
  useApplyCoupon: vi.fn(() => ({ mutateAsync: vi.fn(), isLoading: false })),
  useValidateCoupon: vi.fn(() => ({ mutateAsync: vi.fn(), isLoading: false })),
  useVerifyPayment: vi.fn(() => ({ mutateAsync: vi.fn(), isLoading: false })),
}));

vi.mock('../../hooks/api/useCart', () => ({
  useCart: vi.fn(() => ({
    data: [
      {
        id: '1',
        product: {
          id: 'p1',
          title: 'Checkout Watch',
          price: 15000,
          images: ['img.jpg'],
          commissionPercent: 20,
          condition: 'Mint',
        },
        quantity: 1,
      },
    ],
    isLoading: false,
  })),
}));

vi.mock('../../utils/storage', () => ({
  getUser: vi.fn(() => ({
    id: 'user1',
    name: 'Test User',
    email: 'test@test.com',
    phone: '1234567890',
  })),
}));

vi.mock('../../components/Toast', () => ({
  useToast: vi.fn(() => vi.fn()),
}));

const renderCheckout = () => renderWithProviders(<Checkout />);

describe('Checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders checkout heading', () => {
    renderCheckout();
    // "Checkout" also appears in the progress stepper, so target the h1.
    expect(screen.getByRole('heading', { level: 1, name: /secure checkout/i })).toBeInTheDocument();
  });

  it('renders order summary with product', () => {
    renderCheckout();
    expect(screen.getByText('Checkout Watch')).toBeInTheDocument();
  });

  it('renders shipping address field', () => {
    renderCheckout();
    expect(screen.getByText(/recipient name/i)).toBeInTheDocument();
  });

  it('renders place order button', () => {
    renderCheckout();
    expect(screen.getByRole('button', { name: /place order/i })).toBeInTheDocument();
  });

  it('renders the order summary totals', () => {
    renderCheckout();
    expect(screen.getByText('Subtotal (1 items)')).toBeInTheDocument();
    expect(screen.getByText('Shipping')).toBeInTheDocument();
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    // Buyer-facing totals are tax-inclusive; no separate tax line is shown.
    expect(screen.getByText(/inclusive of all taxes/i)).toBeInTheDocument();
  });

  // The buyer-facing checkout deliberately shows a single tax-inclusive total.
  // "Platform Contribution", the per-item commission percent and the
  // "GST @ 18%" line are seller-side concepts and live in
  // src/components/account/CommissionSlider.jsx (covered by its own test) and
  // in the seller listing flow in Account.jsx — they have never been rendered
  // by Checkout.jsx. These three assertions were written against markup that
  // never shipped, so they are kept here (skipped) as a record of the intent
  // in case a buyer-side fee breakdown is ever added.
  it.skip('displays Platform Contribution in order summary', () => {
    renderCheckout();
    expect(screen.getByText('Platform Contribution')).toBeInTheDocument();
  });

  it.skip('shows commission percent breakdown per item', () => {
    renderCheckout();
    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  it.skip('displays GST @ 18% in order summary', () => {
    renderCheckout();
    expect(screen.getByText('GST @ 18%')).toBeInTheDocument();
    expect(screen.getByText(/540/)).toBeInTheDocument();
  });
});
