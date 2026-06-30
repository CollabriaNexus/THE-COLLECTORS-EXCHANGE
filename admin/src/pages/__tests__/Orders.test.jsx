import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Orders from '../Orders';

const mockNavigate = vi.fn();
const mockGet = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../hooks/api/apiClient', () => ({
  default: { get: (...args) => mockGet(...args) },
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

describe('Orders', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders the page title', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Orders Management')).toBeInTheDocument();
    });
  });

  it('shows loading spinner', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<Orders />, { wrapper: createWrapper() });
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows empty state when no orders', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('No orders found')).toBeInTheDocument();
    });
  });

  it('renders orders table with data', async () => {
    mockGet.mockResolvedValue({
      data: [{ id: 'order123', user: { name: 'John', email: 'john@test.com' }, createdAt: '2024-01-01T00:00:00Z', totalAmount: 1500.50, status: 'Pending' }],
    });
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText(/1500\.50/)).toBeInTheDocument();
    });
  });

  it('navigates to order detail on row click', async () => {
    mockGet.mockResolvedValue({
      data: [{ id: 'order456', user: { name: 'Jane', email: 'jane@test.com' }, createdAt: '2024-01-01T00:00:00Z', totalAmount: 500, status: 'Shipped' }],
    });
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => {
      fireEvent.click(screen.getByText('Jane'));
    });
    expect(mockNavigate).toHaveBeenCalledWith('/orders/order456');
  });

  it('filters by status', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<Orders />, { wrapper: createWrapper() });
    const select = await screen.findByDisplayValue('All Statuses');
    fireEvent.change(select, { target: { value: 'Delivered' } });
    await waitFor(() => {
      expect(screen.getByDisplayValue('Delivered')).toBeInTheDocument();
    });
  });

  it('searches by query', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<Orders />, { wrapper: createWrapper() });
    const searchInput = await screen.findByPlaceholderText('Search by Order ID or customer...');
    fireEvent.change(searchInput, { target: { value: 'John' } });
    expect(searchInput.value).toBe('John');
  });
});
