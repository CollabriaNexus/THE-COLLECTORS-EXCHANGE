import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Payouts from '../Payouts';

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
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
};

describe('Payouts', () => {
  beforeEach(() => { vi.clearAllMocks(); });

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
        payouts: [{ id: 'p1', vendor: { user: { name: 'Vendor A', email: 'v@test.com' } }, amount: 5000, periodStart: '2024-01-01', periodEnd: '2024-01-31', status: 'PENDING', note: '' }],
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

  it('shows create payout form when toggled', async () => {
    mockGet.mockResolvedValue({ data: { payouts: [] } });
    render(<Payouts />, { wrapper: createWrapper() });
    await waitFor(() => {
      fireEvent.click(screen.getByText('New Payout'));
    });
    await waitFor(() => {
      expect(screen.getAllByText('Create Payout').length).toBeGreaterThan(0);
    });
    expect(screen.getByPlaceholderText('Vendor ID from DB')).toBeInTheDocument();
  });

  it('creates a new payout via form', async () => {
    mockPost.mockResolvedValue({ data: {} });
    mockGet.mockResolvedValue({ data: { payouts: [] } });
    render(<Payouts />, { wrapper: createWrapper() });
    await waitFor(() => {
      fireEvent.click(screen.getByText('New Payout'));
    });
    fireEvent.change(screen.getByPlaceholderText('Vendor ID from DB'), { target: { value: 'vendor1' } });
    fireEvent.change(screen.getAllByDisplayValue('')[0], { target: { value: '1000' } });
    fireEvent.change(screen.getAllByDisplayValue('')[0], { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getAllByDisplayValue('')[0], { target: { value: '2024-01-31' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Create Payout' }).closest('form'));
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalled();
    });
  });

  it('shows Auto-Create button', () => {
    mockGet.mockResolvedValue({ data: { payouts: [] } });
    render(<Payouts />, { wrapper: createWrapper() });
    expect(screen.getByText('Auto-Create')).toBeInTheDocument();
  });

  it('shows pagination when multiple pages', async () => {
    mockGet.mockResolvedValue({
      data: {
        payouts: [{ id: 'p1', vendor: { user: { name: 'Vendor' } }, amount: 100, periodStart: '2024-01-01', periodEnd: '2024-01-31', status: 'PENDING', note: '' }],
        pagination: { page: 1, pages: 3 },
      },
    });
    render(<Payouts />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });
  });

  it('handles payout status update', async () => {
    mockGet.mockResolvedValue({
      data: {
        payouts: [{ id: 'p1', vendor: { user: { name: 'Vendor' } }, amount: 100, periodStart: '2024-01-01', periodEnd: '2024-01-31', status: 'PENDING', note: '' }],
        pagination: { page: 1, pages: 1 },
      },
    });
    mockPatch.mockResolvedValue({ data: {} });
    render(<Payouts />, { wrapper: createWrapper() });
    await waitFor(() => {
      fireEvent.click(screen.getByText('Process'));
    });
    expect(mockPatch).toHaveBeenCalledWith('/admin/payouts/p1/status', { status: 'PROCESSING' });
  });
});
