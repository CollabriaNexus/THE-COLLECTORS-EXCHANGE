import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import KYCRequests from '../KYCRequests';

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

describe('KYCRequests', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders the page title', () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<KYCRequests />, { wrapper: createWrapper() });
    expect(screen.getByText('KYC Requests')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<KYCRequests />, { wrapper: createWrapper() });
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows empty message when no requests', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<KYCRequests />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('No KYC requests found')).toBeInTheDocument();
    });
  });

  it('renders KYC requests in table', async () => {
    mockGet.mockResolvedValue({
      data: [{ id: 'u1', name: 'Alice', email: 'alice@test.com', phone: '1234567890', type: 'Individual', kycStatus: 'pending', createdAt: '2024-01-01' }],
    });
    render(<KYCRequests />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('alice@test.com')).toBeInTheDocument();
    });
  });

  it('navigates to KYC detail on row click', async () => {
    mockGet.mockResolvedValue({ data: [{ id: 'kyc1', name: 'Bob', email: 'bob@test.com', kycStatus: 'pending', createdAt: '2024-01-01' }] });
    render(<KYCRequests />, { wrapper: createWrapper() });
    await waitFor(() => {
      fireEvent.click(screen.getByText('Bob'));
    });
    expect(mockNavigate).toHaveBeenCalledWith('/kyc/kyc1');
  });

  it('changes status filter', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<KYCRequests />, { wrapper: createWrapper() });
    const select = screen.getByDisplayValue('All Statuses');
    fireEvent.change(select, { target: { value: 'verified' } });
    await waitFor(() => {
      expect(screen.getByDisplayValue('Verified')).toBeInTheDocument();
    });
  });

  it('searches by query', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<KYCRequests />, { wrapper: createWrapper() });
    const searchInput = screen.getByPlaceholderText('Search by name or email...');
    fireEvent.change(searchInput, { target: { value: 'alice' } });
    expect(searchInput.value).toBe('alice');
  });
});
