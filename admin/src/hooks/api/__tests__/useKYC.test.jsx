import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useKYCRequests, useKYCDetail, useApproveKYC, useRejectKYC } from '../useKYC';

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

describe('useKYCRequests', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('fetches KYC requests with no filters', async () => {
    mockGet.mockResolvedValue({ data: [{ id: 1, name: 'John' }] });
    const { result } = renderHook(() => useKYCRequests({}), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGet).toHaveBeenCalledWith('/admin/kyc/requests?');
    expect(result.current.data).toEqual([{ id: 1, name: 'John' }]);
  });

  it('fetches KYC requests with status and search filters', async () => {
    mockGet.mockResolvedValue({ data: [] });
    const { result } = renderHook(() => useKYCRequests({ status: 'pending', search: 'test' }), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGet).toHaveBeenCalledWith('/admin/kyc/requests?status=pending&search=test');
  });

  it('handles error state', async () => {
    mockGet.mockRejectedValue(new Error('Failed'));
    const { result } = renderHook(() => useKYCRequests({}), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useKYCDetail', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('fetches KYC detail when id is provided', async () => {
    mockGet.mockResolvedValue({ data: { id: '123', name: 'Jane' } });
    const { result } = renderHook(() => useKYCDetail('123'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGet).toHaveBeenCalledWith('/admin/kyc/requests/123');
  });

  it('is disabled when id is falsy', () => {
    const { result } = renderHook(() => useKYCDetail(null), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useApproveKYC', () => {
  it('mutates with id and notes', async () => {
    mockPatch.mockResolvedValue({ data: { success: true } });
    const { result } = renderHook(() => useApproveKYC(), { wrapper: createWrapper() });
    result.current.mutate({ id: '123', notes: 'Looks good' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPatch).toHaveBeenCalledWith('/admin/kyc/requests/123/approve', { notes: 'Looks good' });
  });
});

describe('useRejectKYC', () => {
  it('mutates with id and reason', async () => {
    mockPatch.mockResolvedValue({ data: { success: true } });
    const { result } = renderHook(() => useRejectKYC(), { wrapper: createWrapper() });
    result.current.mutate({ id: '123', reason: 'Invalid docs' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPatch).toHaveBeenCalledWith('/admin/kyc/requests/123/reject', { reason: 'Invalid docs' });
  });
});
