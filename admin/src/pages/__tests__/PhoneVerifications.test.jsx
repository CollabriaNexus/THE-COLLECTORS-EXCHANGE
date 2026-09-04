import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PhoneVerifications from '../PhoneVerifications';
import { ConfirmProvider } from '../../components/ConfirmDialog';

const mockGet = vi.fn();
const mockPatch = vi.fn();

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

describe('PhoneVerifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title', () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<PhoneVerifications />, { wrapper: createWrapper() });
    expect(screen.getByText('Phone Verifications')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<PhoneVerifications />, { wrapper: createWrapper() });
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows empty state', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<PhoneVerifications />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('No phone verifications found.')).toBeInTheDocument();
    });
  });

  it('renders verification requests', async () => {
    mockGet.mockResolvedValue({
      data: [
        {
          id: 'u1',
          name: 'Alice',
          email: 'alice@test.com',
          phone: '9999999999',
          phoneVerificationStatus: 'pending',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ],
    });
    render(<PhoneVerifications />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('9999999999')).toBeInTheDocument();
    });
  });

  it('approves a verification', async () => {
    mockPatch.mockResolvedValue({ data: {} });
    mockGet.mockResolvedValue({
      data: [
        {
          id: 'u1',
          name: 'Bob',
          email: 'bob@test.com',
          phone: '8888888888',
          phoneVerificationStatus: 'pending',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ],
    });
    render(<PhoneVerifications />, { wrapper: createWrapper() });
    await waitFor(() => {
      const approveButtons = document.querySelectorAll('[title="Approve"]');
      fireEvent.click(approveButtons[0]);
    });
    expect(mockPatch).toHaveBeenCalledWith('/users/phone/u1/approve');
  });

  it('rejects a verification once confirmed', async () => {
    mockPatch.mockResolvedValue({ data: {} });
    mockGet.mockResolvedValue({
      data: [
        {
          id: 'u1',
          name: 'Bob',
          email: 'bob@test.com',
          phone: '8888888888',
          phoneVerificationStatus: 'pending',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ],
    });
    render(<PhoneVerifications />, { wrapper: createWrapper() });
    await waitFor(() => {
      const rejectButtons = document.querySelectorAll('[title="Reject"]');
      fireEvent.click(rejectButtons[0]);
    });
    // Rejecting forces the user to resubmit, so it asks first and names them.
    fireEvent.click(await screen.findByText('Confirm'));
    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith('/users/phone/u1/reject');
    });
  });

  it('surfaces the server reason when an approval fails', async () => {
    mockGet.mockResolvedValue({
      data: [
        {
          id: 'u1',
          name: 'Bob',
          email: 'bob@test.com',
          phone: '8888888888',
          phoneVerificationStatus: 'pending',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ],
    });
    mockPatch.mockRejectedValue({ response: { data: { error: 'Admin only' } } });
    render(<PhoneVerifications />, { wrapper: createWrapper() });
    await waitFor(() => {
      const approveButtons = document.querySelectorAll('[title="Approve"]');
      fireEvent.click(approveButtons[0]);
    });
    expect(await screen.findByText('Admin only')).toBeInTheDocument();
  });

  it('does not show action buttons for non-pending status', async () => {
    mockGet.mockResolvedValue({
      data: [
        {
          id: 'u1',
          name: 'Alice',
          email: 'alice@test.com',
          phone: '9999999999',
          phoneVerificationStatus: 'verified',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ],
    });
    render(<PhoneVerifications />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(document.querySelectorAll('[title="Approve"]').length).toBe(0);
    });
  });

  it('filters by status', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<PhoneVerifications />, { wrapper: createWrapper() });
    fireEvent.click(screen.getByText('Verified'));
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalled();
    });
  });
});
