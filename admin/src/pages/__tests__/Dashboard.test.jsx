import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';

const mockGet = vi.fn();

vi.mock('../../hooks/api/apiClient', () => ({
  default: { get: (...args) => mockGet(...args) },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  // The unread-messages card links to /contact-messages with react-router's
  // <Link> (a plain <a> used to hard-reload the whole SPA), so the tree needs
  // a router in place — same as in the real app.
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard title', () => {
    mockGet.mockResolvedValue({ data: {} });
    render(<Dashboard />, { wrapper: createWrapper() });
    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
    expect(screen.getByText('Monitor and manage your platform')).toBeInTheDocument();
  });

  it('shows loading state for stats', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<Dashboard />, { wrapper: createWrapper() });
    // Every stat card shows '...' while the stats query is in flight. The
    // dashboard has grown well past the original four cards, so assert a
    // floor rather than an exact count.
    const loadingDots = screen.getAllByText('...');
    expect(loadingDots.length).toBeGreaterThanOrEqual(4);
  });

  it('renders stat cards with data', async () => {
    mockGet.mockResolvedValue({
      data: { totalUsers: 100, pendingKyc: 5, totalProducts: 50, totalOrders: 25 },
    });
    render(<Dashboard />, { wrapper: createWrapper() });
    const hundreds = await screen.findAllByText('100');
    expect(hundreds.length).toBeGreaterThanOrEqual(1);
  });

  it('renders stat cards with zeros when data is empty', async () => {
    mockGet.mockResolvedValue({ data: {} });
    render(<Dashboard />, { wrapper: createWrapper() });
    const zeros = await screen.findAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(2);
  });

  it('renders chart sections', () => {
    mockGet.mockResolvedValue({ data: {} });
    render(<Dashboard />, { wrapper: createWrapper() });
    expect(screen.getByText('Revenue (Last 30 Days)')).toBeInTheDocument();
    expect(screen.getByText('New Users (Last 30 Days)')).toBeInTheDocument();
    expect(screen.getByText('Orders by Status')).toBeInTheDocument();
    expect(screen.getByText('Products by Category')).toBeInTheDocument();
  });

  it('shows "No revenue data yet" when revenueData is empty', async () => {
    mockGet.mockResolvedValue({
      data: { revenueData: [], userGrowth: [], ordersByStatus: [], productsByCategory: [] },
    });
    render(<Dashboard />, { wrapper: createWrapper() });
    const texts = await screen.findAllByText('No revenue data yet');
    expect(texts.length).toBeGreaterThanOrEqual(0);
  });

  it('renders stat card icons', () => {
    mockGet.mockResolvedValue({ data: {} });
    render(<Dashboard />, { wrapper: createWrapper() });
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Pending KYC')).toBeInTheDocument();
    expect(screen.getByText('Total Products')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
  });
});
