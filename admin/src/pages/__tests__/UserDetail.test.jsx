import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserDetail from '../UserDetail';
import { ConfirmProvider } from '../../components/ConfirmDialog';

const mockNavigate = vi.fn();
const mockGet = vi.fn();
const mockPatch = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate, useParams: () => ({ id: 'user123' }) };
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
      <QueryClientProvider client={queryClient}>
        <ConfirmProvider>{children}</ConfirmProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

const mockUser = {
  id: 'user123',
  name: 'John Doe',
  email: 'john@test.com',
  phone: '9999999999',
  type: 'Individual',
  role: 'user',
  kycStatus: 'verified',
  banned: false,
  createdAt: '2024-01-01T00:00:00Z',
  products: [{ id: 'p1', title: 'Product A', image: 'img.jpg', price: 100 }],
  cart: [{ id: 'c1' }],
  wishlist: [{ id: 'w1' }],
  vendor: { type: 'SINGLE', status: 'active', maxListings: 5 },
};

describe('UserDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ data: mockUser });
  });

  it('shows loading spinner', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<UserDetail />, { wrapper: createWrapper() });
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders user details', async () => {
    render(<UserDetail />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('User Details')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@test.com')).toBeInTheDocument();
    });
  });

  it('shows "User not found" when user is null', async () => {
    mockGet.mockResolvedValue({ data: null });
    render(<UserDetail />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });

  it('displays user stats', async () => {
    render(<UserDetail />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText(/Listed Products \(1\)/)).toBeInTheDocument();
      expect(screen.getByText(/Cart \(1\)/)).toBeInTheDocument();
      expect(screen.getByText(/Wishlist \(1\)/)).toBeInTheDocument();
    });
  });

  it('opens role modal and changes role', async () => {
    mockPatch.mockResolvedValue({ data: {} });
    render(<UserDetail />, { wrapper: createWrapper() });
    await waitFor(() => {
      fireEvent.click(screen.getByText('Change Role'));
    });
    fireEvent.click(screen.getByLabelText('admin'));
    fireEvent.click(screen.getByText('Update Role'));
    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith('/admin/users/user123/role', { role: 'admin' });
    });
  });

  it('does not ban until the confirmation is accepted', async () => {
    mockPatch.mockResolvedValue({ data: {} });
    render(<UserDetail />, { wrapper: createWrapper() });
    await waitFor(() => {
      fireEvent.click(screen.getByText('Ban User'));
    });
    // The dialog must name who is being locked out.
    await screen.findByText(/Ban John Doe\?/);
    expect(mockPatch).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Cancel'));
    await waitFor(() => {
      expect(screen.queryByText(/Ban John Doe\?/)).not.toBeInTheDocument();
    });
    expect(mockPatch).not.toHaveBeenCalled();
  });

  it('bans a user once confirmed', async () => {
    mockPatch.mockResolvedValue({ data: {} });
    render(<UserDetail />, { wrapper: createWrapper() });
    await waitFor(() => {
      fireEvent.click(screen.getByText('Ban User'));
    });
    fireEvent.click(await screen.findByText('Confirm'));
    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith('/admin/users/user123/ban');
    });
  });

  it('surfaces the server reason when a ban fails', async () => {
    mockPatch.mockRejectedValue({ response: { data: { error: 'User not found' } } });
    render(<UserDetail />, { wrapper: createWrapper() });
    await waitFor(() => {
      fireEvent.click(screen.getByText('Ban User'));
    });
    fireEvent.click(await screen.findByText('Confirm'));
    // Not axios's "Request failed with status code 404".
    expect(await screen.findByText('User not found')).toBeInTheDocument();
  });

  it('unbans a banned user', async () => {
    mockGet.mockResolvedValue({ data: { ...mockUser, banned: true } });
    mockPatch.mockResolvedValue({ data: {} });
    render(<UserDetail />, { wrapper: createWrapper() });
    await waitFor(() => {
      fireEvent.click(screen.getByText('Unban User'));
    });
    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith('/admin/users/user123/unban');
    });
  });

  it('toggles vendor type for KYC verified users', async () => {
    mockPatch.mockResolvedValue({ data: {} });
    render(<UserDetail />, { wrapper: createWrapper() });
    await waitFor(() => {
      fireEvent.click(screen.getByText('Set to Bulk Lister'));
    });
    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith('/admin/vendor/user123/type', { type: 'BULK' });
    });
  });

  it('shows success message after role update', async () => {
    mockPatch.mockResolvedValue({ data: {} });
    render(<UserDetail />, { wrapper: createWrapper() });
    await waitFor(() => {
      fireEvent.click(screen.getByText('Change Role'));
    });
    fireEvent.click(screen.getByLabelText('curator'));
    fireEvent.click(screen.getByText('Update Role'));
    await waitFor(() => {
      expect(screen.getByText('User role updated successfully!')).toBeInTheDocument();
    });
  });
});
