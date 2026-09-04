import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Payouts from '../Payouts';
import { ConfirmProvider } from '../../components/ConfirmDialog';

const { mockGet, mockPost, mockPatch } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPatch: vi.fn(),
}));

vi.mock('../../hooks/api/apiClient', () => ({
  default: {
    get: (...args) => mockGet(...args),
    post: (...args) => mockPost(...args),
    patch: (...args) => mockPatch(...args),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }) => (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <ConfirmProvider>{children}</ConfirmProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('Payouts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title', () => {
    mockGet.mockResolvedValue({ data: {} });
    render(<Payouts />, { wrapper: createWrapper() });
    expect(screen.getByText('Payouts')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<Payouts />, { wrapper: createWrapper() });
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows empty state when no payouts', async () => {
    mockGet.mockResolvedValue({ data: { payouts: [] } });
    render(<Payouts />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('No payouts found')).toBeInTheDocument();
    });
  });

  it('renders payout rows with data', async () => {
    mockGet.mockResolvedValue({
      data: {
        payouts: [
          {
            id: 'p1',
            vendor: { user: { name: 'Vendor A', email: 'v@test.com' } },
            amount: 5000,
            periodStart: '2024-01-01',
            periodEnd: '2024-01-31',
            status: 'PENDING',
            note: '',
          },
        ],
        pagination: { page: 1, pages: 1 },
      },
    });
    render(<Payouts />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Vendor A')).toBeInTheDocument();
      expect(screen.getByText(/5,000/)).toBeInTheDocument();
      expect(screen.getAllByText('PENDING').length).toBeGreaterThan(0);
    });
  });

  it('filters by status', async () => {
    mockGet.mockResolvedValue({ data: { payouts: [] } });
    render(<Payouts />, { wrapper: createWrapper() });
    fireEvent.click(screen.getByText('PAID'));
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalled();
    });
  });

  const mockVendorList = () =>
    mockGet.mockImplementation((url) =>
      url.startsWith('/admin/stats/vendor-rankings')
        ? Promise.resolve({
            data: { data: [{ vendor: { vendorId: 'v1', name: 'Vendor A', email: 'v@test.com' } }] },
          })
        : Promise.resolve({ data: { payouts: [] } }),
    );

  const fillCreateForm = async () => {
    fireEvent.click(screen.getByText('New Payout'));
    await waitFor(() => {
      expect(screen.getAllByText('Create Payout').length).toBeGreaterThan(0);
    });
    // Wait for the vendor list before selecting, or the <option> does not exist yet.
    await screen.findByText('Vendor A — v@test.com');
    fireEvent.change(screen.getByLabelText('Vendor'), { target: { value: 'v1' } });
    fireEvent.change(screen.getByLabelText(/Amount/), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText('Period Start'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText('Period End'), { target: { value: '2024-01-31' } });
    fireEvent.submit(screen.getByRole('button', { name: /Create Payout/ }).closest('form'));
  };

  it('offers a vendor picker instead of a raw database id field', async () => {
    // Payout.vendorId is Vendor.id, which is surfaced nowhere else in the
    // dashboard — the form used to require typing it from memory.
    mockVendorList();
    render(<Payouts />, { wrapper: createWrapper() });
    fireEvent.click(screen.getByText('New Payout'));
    await waitFor(() => {
      expect(screen.getAllByText('Create Payout').length).toBeGreaterThan(0);
    });
    expect(screen.queryByPlaceholderText('Vendor ID from DB')).not.toBeInTheDocument();
    expect(await screen.findByText('Vendor A — v@test.com')).toBeInTheDocument();
  });

  it('posts the amount as a NUMBER, which the API schema requires', async () => {
    // The form sent the raw <input type="number"> string, so CreatePayoutSchema
    // (amount: z.number()) rejected every create with a 400 — silently.
    mockPost.mockResolvedValue({ data: { payout: { amount: 1000 } } });
    mockVendorList();
    render(<Payouts />, { wrapper: createWrapper() });
    await fillCreateForm();
    fireEvent.click(await screen.findByText('Confirm'));
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        '/admin/payouts',
        expect.objectContaining({ vendorId: 'v1', amount: 1000 }),
      );
    });
    expect(typeof mockPost.mock.calls[0][1].amount).toBe('number');
  });

  it('confirms before creating a payout', async () => {
    mockPost.mockResolvedValue({ data: {} });
    mockVendorList();
    render(<Payouts />, { wrapper: createWrapper() });
    await fillCreateForm();
    await screen.findByText(/payout for Vendor A/);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('shows the server reason when creating a payout fails', async () => {
    mockPost.mockRejectedValue({ response: { data: { error: 'Vendor not found' } } });
    mockVendorList();
    render(<Payouts />, { wrapper: createWrapper() });
    await fillCreateForm();
    fireEvent.click(await screen.findByText('Confirm'));
    expect(await screen.findByText('Vendor not found')).toBeInTheDocument();
  });

  it('shows Auto-Create button', () => {
    mockGet.mockResolvedValue({ data: { payouts: [] } });
    render(<Payouts />, { wrapper: createWrapper() });
    expect(screen.getByText('Auto-Create')).toBeInTheDocument();
  });

  it('shows pagination when multiple pages', async () => {
    mockGet.mockResolvedValue({
      data: {
        payouts: [
          {
            id: 'p1',
            vendor: { user: { name: 'Vendor' } },
            amount: 100,
            periodStart: '2024-01-01',
            periodEnd: '2024-01-31',
            status: 'PENDING',
            note: '',
          },
        ],
        pagination: { page: 1, pages: 3 },
      },
    });
    render(<Payouts />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
    });
  });

  const renderWithPendingPayout = () => {
    mockGet.mockImplementation((url) =>
      url.startsWith('/admin/stats/vendor-rankings')
        ? Promise.resolve({ data: { data: [] } })
        : Promise.resolve({
            data: {
              payouts: [
                {
                  id: 'p1',
                  vendor: { user: { name: 'Vendor' } },
                  amount: 100,
                  periodStart: '2024-01-01',
                  periodEnd: '2024-01-31',
                  status: 'PENDING',
                  note: '',
                },
              ],
              pagination: { page: 1, pages: 1 },
            },
          }),
    );
    render(<Payouts />, { wrapper: createWrapper() });
  };

  it('handles payout status update once confirmed', async () => {
    mockPatch.mockResolvedValue({ data: {} });
    renderWithPendingPayout();
    await waitFor(() => {
      fireEvent.click(screen.getByText('Process'));
    });
    fireEvent.click(await screen.findByText('Confirm'));
    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith('/admin/payouts/p1/status', { status: 'PROCESSING' });
    });
  });

  it('does not move money without a confirmation', async () => {
    mockPatch.mockResolvedValue({ data: {} });
    renderWithPendingPayout();
    await waitFor(() => {
      fireEvent.click(screen.getByText('Process'));
    });
    await screen.findByText(/payout for Vendor to PROCESSING/);
    expect(mockPatch).not.toHaveBeenCalled();
  });

  it('shows the server reason when a status update fails', async () => {
    mockPatch.mockRejectedValue({ response: { data: { error: 'Payout is already paid' } } });
    renderWithPendingPayout();
    await waitFor(() => {
      fireEvent.click(screen.getByText('Process'));
    });
    fireEvent.click(await screen.findByText('Confirm'));
    expect(await screen.findByText('Payout is already paid')).toBeInTheDocument();
  });

  it('shows an error state, not an empty list, when the payouts query fails', async () => {
    mockGet.mockRejectedValue({ response: { data: { error: 'Boom' } } });
    render(<Payouts />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Could not load payouts')).toBeInTheDocument();
    });
    expect(screen.queryByText('No payouts found')).not.toBeInTheDocument();
  });
});
