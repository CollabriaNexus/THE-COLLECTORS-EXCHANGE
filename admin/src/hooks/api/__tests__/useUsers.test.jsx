import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUsers, useUserDetail, useUpdateUserRole, useAdminAnalytics, useAdminStats, useToggleVendorType, useBanUser, useUnbanUser } from '../useUsers';

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

describe('useUsers', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('fetches users with no filters', async () => {
    mockGet.mockResolvedValue({ data: [{ id: 1, name: 'John' }] });
    const { result } = renderHook(() => useUsers({}), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGet).toHaveBeenCalledWith('/admin/users?');
    expect(result.current.data).toEqual([{ id: 1, name: 'John' }]);
  });

  it('fetches users with role and search filters', async () => {
    mockGet.mockResolvedValue({ data: [] });
    const { result } = renderHook(() => useUsers({ role: 'admin', search: 'test' }), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGet).toHaveBeenCalledWith('/admin/users?role=admin&search=test');
  });

  it('handles error state', async () => {
    mockGet.mockRejectedValue(new Error('Failed'));
    const { result } = renderHook(() => useUsers({}), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('returns loading state', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useUsers({}), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
  });
});

describe('useUserDetail', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('fetches user detail when id is provided', async () => {
    mockGet.mockResolvedValue({ data: { id: '123', name: 'Jane' } });
    const { result } = renderHook(() => useUserDetail('123'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGet).toHaveBeenCalledWith('/admin/users/123');
  });

  it('is disabled when id is falsy', () => {
    const { result } = renderHook(() => useUserDetail(null), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useUpdateUserRole', () => {
  it('mutates with id and role', async () => {
    mockPatch.mockResolvedValue({ data: { success: true } });
    const { result } = renderHook(() => useUpdateUserRole(), { wrapper: createWrapper() });
    result.current.mutate({ id: '123', role: 'admin' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPatch).toHaveBeenCalledWith('/admin/users/123/role', { role: 'admin' });
  });
});

describe('useAdminAnalytics', () => {
  it('fetches analytics data', async () => {
    mockGet.mockResolvedValue({ data: { revenueData: [] } });
    const { result } = renderHook(() => useAdminAnalytics(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGet).toHaveBeenCalledWith('/admin/stats/analytics');
  });
});

describe('useAdminStats', () => {
  it('fetches stats overview', async () => {
    mockGet.mockResolvedValue({ data: { totalUsers: 10 } });
    const { result } = renderHook(() => useAdminStats(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGet).toHaveBeenCalledWith('/admin/stats/overview');
    expect(result.current.data.totalUsers).toBe(10);
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

describe('useBanUser', () => {
  it('mutates with user id', async () => {
    mockPatch.mockResolvedValue({ data: { success: true } });
    const { result } = renderHook(() => useBanUser(), { wrapper: createWrapper() });
    result.current.mutate('123');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPatch).toHaveBeenCalledWith('/admin/users/123/ban');
  });
});

describe('useUnbanUser', () => {
  it('mutates with user id', async () => {
    mockPatch.mockResolvedValue({ data: { success: true } });
    const { result } = renderHook(() => useUnbanUser(), { wrapper: createWrapper() });
    result.current.mutate('123');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPatch).toHaveBeenCalledWith('/admin/users/123/unban');
  });
});
