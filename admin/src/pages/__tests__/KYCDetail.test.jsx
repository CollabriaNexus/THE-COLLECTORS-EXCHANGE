import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import KYCDetail from '../KYCDetail';

const mockNavigate = vi.fn();
const mockGet = vi.fn();
const mockPatch = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate, useParams: () => ({ id: 'kyc123' }) };
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

const mockUser = {
  id: 'kyc123', name: 'John Doe', email: 'john@test.com', phone: '9999999999',
  type: 'Individual', role: 'user', kycStatus: 'pending',
  createdAt: '2024-01-01T00:00:00Z',
  kycData: { aadhaarDoc: 'https://example.com/aadhaar.jpg', businessName: 'My Store' },
};

describe('KYCDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ data: mockUser });
  });

  it('shows loading spinner', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<KYCDetail />, { wrapper: createWrapper() });
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders KYC detail page', async () => {
    render(<KYCDetail />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('KYC Request Detail')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@test.com')).toBeInTheDocument();
    });
  });

  it('shows "User not found" when user is null', async () => {
    mockGet.mockResolvedValue({ data: null });
    render(<KYCDetail />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });

  it('shows approve and reject buttons for pending KYC', async () => {
    render(<KYCDetail />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Approve KYC')).toBeInTheDocument();
      expect(screen.getByText('Reject KYC')).toBeInTheDocument();
    });
  });

  it('does not show action buttons for non-pending KYC', async () => {
    mockGet.mockResolvedValue({ data: { ...mockUser, kycStatus: 'verified' } });
    render(<KYCDetail />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.queryByText('Approve KYC')).not.toBeInTheDocument();
      expect(screen.queryByText('Reject KYC')).not.toBeInTheDocument();
    });
  });

  it('opens approve modal and approves KYC', async () => {
    mockPatch.mockResolvedValue({ data: {} });
    render(<KYCDetail />, { wrapper: createWrapper() });
    await waitFor(() => {
      fireEvent.click(screen.getByText('Approve KYC'));
    });
    fireEvent.click(screen.getByText('Approve'));
    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith('/admin/kyc/requests/kyc123/approve', { notes: '' });
    });
  });

  it('opens reject modal and rejects KYC', async () => {
    mockPatch.mockResolvedValue({ data: {} });
    render(<KYCDetail />, { wrapper: createWrapper() });
    await waitFor(() => {
      fireEvent.click(screen.getByText('Reject KYC'));
    });
    const textarea = screen.getByPlaceholderText('Enter reason for rejection...');
    fireEvent.change(textarea, { target: { value: 'Invalid documents' } });
    fireEvent.click(screen.getByText('Reject'));
    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith('/admin/kyc/requests/kyc123/reject', { reason: 'Invalid documents' });
    });
  });

  it('shows error when rejecting without a reason', async () => {
    render(<KYCDetail />, { wrapper: createWrapper() });
    await waitFor(() => {
      fireEvent.click(screen.getByText('Reject KYC'));
    });
    fireEvent.click(screen.getByText('Reject'));
    await waitFor(() => {
      expect(screen.getByText('Rejection reason is required')).toBeInTheDocument();
    });
  });

  it('shows KYC data display component', async () => {
    render(<KYCDetail />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('KYC Data')).toBeInTheDocument();
      expect(screen.getByText('Uploaded Documents')).toBeInTheDocument();
    });
  });

  it('shows success message after approval', async () => {
    mockPatch.mockResolvedValue({ data: {} });
    render(<KYCDetail />, { wrapper: createWrapper() });
    await waitFor(() => {
      fireEvent.click(screen.getByText('Approve KYC'));
    });
    fireEvent.click(screen.getByText('Approve'));
    await waitFor(() => {
      expect(screen.getByText('KYC request approved successfully!')).toBeInTheDocument();
    });
  });
});
