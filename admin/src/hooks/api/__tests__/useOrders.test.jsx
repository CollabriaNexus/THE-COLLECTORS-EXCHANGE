import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOrders, useOrderDetail, useUpdateOrderStatus, useShipOrder } from '../useOrders';

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

describe('useOrders', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('fetches orders with no filters', async () => {
    mockGet.mockResolvedValue({ data: [{ id: 1 }] });
    const { result } = renderHook(() => useOrders({}), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGet).toHaveBeenCalledWith('/admin/orders?');
  });

  it('fetches orders with status filter (not all) and search', async () => {
    mockGet.mockResolvedValue({ data: [] });
    const { result } = renderHook(() => useOrders({ status: 'Pending', search: 'test' }), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGet).toHaveBeenCalledWith('/admin/orders?status=Pending&search=test');
  });

  it('does not pass status when value is "all"', async () => {
    mockGet.mockResolvedValue({ data: [] });
    const { result } = renderHook(() => useOrders({ status: 'all', search: '' }), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGet).toHaveBeenCalledWith('/admin/orders?');
  });

  it('handles error state', async () => {
    mockGet.mockRejectedValue(new Error('Failed'));
    const { result } = renderHook(() => useOrders({}), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useOrderDetail', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('fetches order detail when id is provided', async () => {
    mockGet.mockResolvedValue({ data: { id: '123' } });
    const { result } = renderHook(() => useOrderDetail('123'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGet).toHaveBeenCalledWith('/admin/orders/123');
  });

  it('is disabled when id is falsy', () => {
    const { result } = renderHook(() => useOrderDetail(null), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useUpdateOrderStatus', () => {
  it('mutates with id and status', async () => {
    mockPatch.mockResolvedValue({ data: { success: true } });
    const { result } = renderHook(() => useUpdateOrderStatus(), { wrapper: createWrapper() });
    result.current.mutate({ id: '123', status: 'Shipped' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPatch).toHaveBeenCalledWith('/admin/orders/123/status', { status: 'Shipped' });
  });
});

describe('useShipOrder', () => {
  it('mutates with id and trackingID', async () => {
    mockPatch.mockResolvedValue({ data: { success: true } });
    const { result } = renderHook(() => useShipOrder(), { wrapper: createWrapper() });
    result.current.mutate({ id: '123', trackingID: 'TRACK123' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPatch).toHaveBeenCalledWith('/admin/orders/123/ship', { trackingID: 'TRACK123' });
  });
});
