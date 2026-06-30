import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Vendors from '../Vendors';

const mockNavigate = vi.fn();
const mockGet = vi.fn();
const mockPatch = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../hooks/api/apiClient', () => ({
  default: {
    get: (...args) => mockGet(...args),
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

const mockVendors = [
  { id: 'v1', name: 'Vendor A', email: 'a@test.com', kycStatus: 'verified', createdAt: '2024-01-01', vendor: { type: 'SINGLE' } },
  { id: 'v2', name: 'Vendor B', email: 'b@test.com', kycStatus: 'pending', createdAt: '2024-01-02', vendor: { type: 'BULK' } },
];

describe('Vendors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ data: mockVendors });
  });

  it('renders the page title', async () => {
    render(<Vendors />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Vendor Management')).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<Vendors />, { wrapper: createWrapper() });
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders vendor data in table', async () => {
    render(<Vendors />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Vendor A')).toBeInTheDocument();
      expect(screen.getByText('Vendor B')).toBeInTheDocument();
    });
  });

  it('renders stats cards', async () => {
    render(<Vendors />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Total Sellers')).toBeInTheDocument();
      expect(screen.getByText('KYC Verified')).toBeInTheDocument();
      expect(screen.getByText('Pending Review')).toBeInTheDocument();
    });
  });

  it('renders action buttons for verified vendors', async () => {
    render(<Vendors />, { wrapper: createWrapper() });
    await waitFor(() => {
      const setBulkButtons = screen.getAllByText('Set Bulk');
      expect(setBulkButtons.length).toBe(1);
    });
  });

  it('toggles vendor type on button click', async () => {
    mockPatch.mockResolvedValue({ data: {} });
    render(<Vendors />, { wrapper: createWrapper() });
    await waitFor(() => {
      fireEvent.click(screen.getByText('Set Bulk'));
    });
    expect(mockPatch).toHaveBeenCalledWith('/admin/vendor/v1/type', { type: 'BULK' });
  });

  it('navigates to user detail on View click', async () => {
    render(<Vendors />, { wrapper: createWrapper() });
    await waitFor(() => {
      const viewButtons = screen.getAllByText('View');
      fireEvent.click(viewButtons[0]);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/users/v1');
  });

  it('filters by search query', async () => {
    render(<Vendors />, { wrapper: createWrapper() });
    const searchInput = screen.getByPlaceholderText('Search by name or email...');
    fireEvent.change(searchInput, { target: { value: 'Vendor A' } });
    expect(searchInput.value).toBe('Vendor A');
  });

  it('shows empty state when no vendors', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<Vendors />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('No vendors found')).toBeInTheDocument();
    });
  });
});
