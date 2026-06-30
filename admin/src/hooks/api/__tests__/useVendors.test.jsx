import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useVendors, useToggleVendorType } from '../useVendors';

const mockGet = vi.fn();
const mockPatch = vi.fn();

vi.mock('../apiClient', () => ({
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
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useVendors', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('fetches users and filters by kycStatus', async () => {
    const users = [
      { id: 1, name: 'Vendor A', kycStatus: 'verified' },
      { id: 2, name: 'Vendor B', kycStatus: 'pending' },
      { id: 3, name: 'User C', kycStatus: 'none' },
    ];
    mockGet.mockResolvedValue({ data: users });
    const { result } = renderHook(() => useVendors({}), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGet).toHaveBeenCalledWith('/admin/users?');
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data[0].name).toBe('Vendor A');
    expect(result.current.data[1].name).toBe('Vendor B');
  });

  it('passes search filter', async () => {
    mockGet.mockResolvedValue({ data: [] });
    const { result } = renderHook(() => useVendors({ search: 'test' }), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGet).toHaveBeenCalledWith('/admin/users?search=test');
  });

  it('handles error state', async () => {
    mockGet.mockRejectedValue(new Error('Failed'));
    const { result } = renderHook(() => useVendors({}), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useToggleVendorType', () => {
  it('mutates with userId and type', async () => {
    mockPatch.mockResolvedValue({ data: { success: true } });
    const { result } = renderHook(() => useToggleVendorType(), { wrapper: createWrapper() });
    result.current.mutate({ userId: '123', type: 'BULK' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPatch).toHaveBeenCalledWith('/admin/vendor/123/type', { type: 'BULK' });
  });
});
