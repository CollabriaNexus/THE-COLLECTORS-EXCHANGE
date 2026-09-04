import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { renderWithProviders } from '../../test/utils';
import Checkout from '../Checkout';
import { useCreateOrder, useVerifyPayment } from '../../hooks/api/useCheckout';

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
        productId: 'p1',
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

/**
 * A checkout that ends badly is the only place on this site where a buyer can
 * lose money. These cover what they are actually told when it happens: the old
 * code caught every failure with a bare `catch {}` and showed one toast reading
 * "Payment verification failed. Please contact support."
 */
describe('Checkout — payment failures', () => {
  const axiosError = (status, data) =>
    Object.assign(new Error('Request failed'), {
      response: { status, data },
    });

  const fillShippingForm = () => {
    fireEvent.change(screen.getByLabelText(/street address/i), {
      target: { value: '12 Marine Drive' },
    });
    fireEvent.change(screen.getByLabelText(/^city$/i), { target: { value: 'Mumbai' } });
    fireEvent.change(screen.getByLabelText(/^state$/i), { target: { value: 'Maharashtra' } });
    fireEvent.change(screen.getByLabelText(/pin code/i), { target: { value: '400001' } });
  };

  const placeOrder = () => fireEvent.click(screen.getByRole('button', { name: /place order/i }));

  const mockCreateOrder = (data) => {
    const mutateAsync = vi.fn().mockResolvedValue(data);
    vi.mocked(useCreateOrder).mockReturnValue({ mutateAsync, isPending: false });
    return mutateAsync;
  };

  const mockVerifyRejects = (err) => {
    const mutateAsync = vi.fn().mockRejectedValue(err);
    vi.mocked(useVerifyPayment).mockReturnValue({ mutateAsync, isPending: false });
    return mutateAsync;
  };

  const codOrder = {
    orderId: 'ord_1',
    displayId: 'HOR00042',
    amount: 15000,
    isCOD: true,
  };

  // isMock takes the same branch shape as a real gateway payment (isCOD false),
  // without needing the Razorpay script.
  const onlineOrder = {
    orderId: 'ord_1',
    displayId: 'HOR00042',
    amount: 15000,
    isMock: true,
    razorpayOrderId: 'rp_order_1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('names the item and the refund when someone else bought it first', async () => {
    mockCreateOrder(codOrder);
    mockVerifyRejects(
      axiosError(409, {
        error: 'One or more items in your order are no longer available',
        soldOut: ['p1'],
        refundRequired: true,
        refundPending: false,
        displayId: 'HOR00042',
        amount: 15000,
      }),
    );
    renderWithProviders(<Checkout />);
    fillShippingForm();
    placeOrder();

    expect(await screen.findByText(/someone was faster/i)).toBeInTheDocument();
    // The piece they lost, by name — not a product id
    expect(screen.getByText('Checkout Watch')).toBeInTheDocument();
    expect(screen.getByText(/₹15,000 has already been refunded/i)).toBeInTheDocument();
    expect(screen.getByText(/5-7 working days/i)).toBeInTheDocument();
    // Support can always be given the reference
    expect(screen.getByText('HOR00042')).toBeInTheDocument();
  });

  it('says a human is releasing the refund when the automatic one failed', async () => {
    mockCreateOrder(onlineOrder);
    mockVerifyRejects(
      axiosError(409, {
        error: 'One or more items in your order are no longer available',
        soldOut: ['p1'],
        refundRequired: true,
        refundPending: true,
        displayId: 'HOR00042',
        amount: 15000,
      }),
    );
    renderWithProviders(<Checkout />);
    fillShippingForm();
    placeOrder();

    expect(
      await screen.findByText(/refund of ₹15,000 needs a person to release it/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/refund being processed/i)).toBeInTheDocument();
    expect(screen.getAllByText('support@thecollectorsexchange.in').length).toBeGreaterThan(0);
  });

  it('tells a buyer whose payment could not be confirmed NOT to pay again', async () => {
    mockCreateOrder(onlineOrder);
    mockVerifyRejects(axiosError(500, { error: 'Internal Server Error' }));
    renderWithProviders(<Checkout />);
    fillShippingForm();
    placeOrder();

    expect(await screen.findByText(/we could not confirm your payment/i)).toBeInTheDocument();
    // Said twice on purpose — once as the eyebrow above the headline, once in
    // the body where the consequence (being charged twice) is spelled out.
    expect(screen.getAllByText(/please do not pay again/i).length).toBeGreaterThan(1);
    // Quoted in the reference block and again wherever we ask them to email us
    expect(screen.getAllByText(/HOR00042/).length).toBeGreaterThan(0);
  });

  it('surfaces the same screen for a network failure with no response', async () => {
    mockCreateOrder(onlineOrder);
    mockVerifyRejects(new Error('Network Error'));
    renderWithProviders(<Checkout />);
    fillShippingForm();
    placeOrder();

    expect(await screen.findByText(/we could not confirm your payment/i)).toBeInTheDocument();
    expect(screen.getByText('HOR00042')).toBeInTheDocument();
  });

  it('does not tell a COD buyer their order failed to be created — it was', async () => {
    mockCreateOrder(codOrder);
    mockVerifyRejects(axiosError(500, { error: 'Internal Server Error' }));
    renderWithProviders(<Checkout />);
    fillShippingForm();
    placeOrder();

    expect(await screen.findByText(/we could not confirm your order/i)).toBeInTheDocument();
    expect(screen.getByText(/please do not place the order again/i)).toBeInTheDocument();
    expect(screen.getByText(/nothing has been charged/i)).toBeInTheDocument();
    expect(screen.getByText('HOR00042')).toBeInTheDocument();
  });
});

/**
 * The Razorpay modal itself: closing it, and an attempt the bank declined.
 * Both used to be completely silent, and pressing pay again created a second
 * order and a second gateway order.
 */
describe('Checkout — Razorpay modal outcomes', () => {
  let rzpInstance;
  let createOrder;

  const fillShippingForm = () => {
    fireEvent.change(screen.getByLabelText(/street address/i), {
      target: { value: '12 Marine Drive' },
    });
    fireEvent.change(screen.getByLabelText(/^city$/i), { target: { value: 'Mumbai' } });
    fireEvent.change(screen.getByLabelText(/^state$/i), { target: { value: 'Maharashtra' } });
    fireEvent.change(screen.getByLabelText(/pin code/i), { target: { value: '400001' } });
  };

  const openModal = async () => {
    renderWithProviders(<Checkout />);
    // jsdom never fetches the checkout script, so raise its load event by hand.
    const script = document.querySelector('script[src*="checkout.razorpay.com"]');
    fireEvent.load(script);
    fillShippingForm();
    fireEvent.click(screen.getByRole('button', { name: /place order/i }));
    await waitFor(() => expect(window.Razorpay).toHaveBeenCalled());
  };

  beforeEach(() => {
    vi.clearAllMocks();
    createOrder = vi.fn().mockResolvedValue({
      orderId: 'ord_1',
      displayId: 'HOR00042',
      amount: 15000,
      razorpayOrderId: 'rp_order_1',
      keyId: 'rzp_test_key',
      user: { name: 'Test User', email: 'test@test.com', phone: '1234567890' },
    });
    vi.mocked(useCreateOrder).mockReturnValue({ mutateAsync: createOrder, isPending: false });
    window.Razorpay = vi.fn((options) => {
      rzpInstance = {
        options,
        handlers: {},
        on: vi.fn((event, cb) => {
          rzpInstance.handlers[event] = cb;
        }),
        open: vi.fn(),
      };
      return rzpInstance;
    });
  });

  afterEach(() => {
    delete window.Razorpay;
  });

  it('tells the buyer their order is saved when they close the modal', async () => {
    await openModal();
    act(() => rzpInstance.options.modal.ondismiss());

    expect(await screen.findByText(/payment window closed/i)).toBeInTheDocument();
    expect(screen.getByText(/nothing has been charged/i)).toBeInTheDocument();
    expect(screen.getByText(/HOR00042 is saved/i)).toBeInTheDocument();
  });

  it("passes through Razorpay's own reason when an attempt fails", async () => {
    await openModal();
    expect(rzpInstance.on).toHaveBeenCalledWith('payment.failed', expect.any(Function));
    act(() =>
      rzpInstance.handlers['payment.failed']({
        error: { description: 'Your card was declined by the issuing bank.' },
      }),
    );

    expect(await screen.findByText(/that payment did not go through/i)).toBeInTheDocument();
    expect(screen.getByText(/declined by the issuing bank/i)).toBeInTheDocument();
  });

  it('reuses the existing order on retry instead of creating a second one', async () => {
    await openModal();
    expect(createOrder).toHaveBeenCalledTimes(1);

    act(() => rzpInstance.options.modal.ondismiss());
    await screen.findByText(/payment window closed/i);

    // Pressing pay again with an unchanged cart and address must reopen the
    // gateway against the order that already exists.
    fireEvent.click(screen.getByRole('button', { name: /place order/i }));
    await waitFor(() => expect(window.Razorpay).toHaveBeenCalledTimes(2));
    expect(createOrder).toHaveBeenCalledTimes(1);
    expect(rzpInstance.options.order_id).toBe('rp_order_1');
  });

  it('creates a fresh order when the shipping details change between attempts', async () => {
    await openModal();
    act(() => rzpInstance.options.modal.ondismiss());
    await screen.findByText(/payment window closed/i);

    fireEvent.change(screen.getByLabelText(/^city$/i), { target: { value: 'Pune' } });
    fireEvent.click(screen.getByRole('button', { name: /place order/i }));

    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(2));
  });
});
