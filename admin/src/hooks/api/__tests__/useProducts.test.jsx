import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProducts, useProductDetail, useReviewProduct, useApproveProduct, useRejectProduct, useDeleteProduct, useUpdateProduct, useBrands, useMarkProductAsSold, useUpdateAuthenticityStatus, useTCEProducts, useCreateProduct, useEditProduct } from '../useProducts';

const mockGet = vi.fn();
const mockPatch = vi.fn();
const mockPost = vi.fn();
const mockDelete = vi.fn();

vi.mock('../apiClient', () => ({
  default: {
    get: (...args) => mockGet(...args),
    patch: (...args) => mockPatch(...args),
    post: (...args) => mockPost(...args),
    delete: (...args) => mockDelete(...args),
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

describe('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches products with no filters', async () => {
    mockGet.mockResolvedValue({ data: [{ id: 1, title: 'Product A' }] });
    const { result } = renderHook(() => useProducts({}), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGet).toHaveBeenCalledWith('/admin/products?');
    expect(result.current.data).toEqual([{ id: 1, title: 'Product A' }]);
  });

  it('fetches products with category, status, and search filters', async () => {
    mockGet.mockResolvedValue({ data: [] });
    const { result } = renderHook(() => useProducts({ category: 'Timepieces', status: 'Pending', search: 'watch' }), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGet).toHaveBeenCalledWith('/admin/products?category=Timepieces&status=Pending&search=watch');
  });

  it('returns loading state', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useProducts({}), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
  });

  it('handles error state', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useProducts({}), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useProductDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches product detail when id is provided', async () => {
    mockGet.mockResolvedValue({ data: { id: '123', title: 'Test Product' } });
    const { result } = renderHook(() => useProductDetail('123'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGet).toHaveBeenCalledWith('/admin/products/123');
    expect(result.current.data).toEqual({ id: '123', title: 'Test Product' });
  });

  it('is disabled when id is falsy', () => {
    const { result } = renderHook(() => useProductDetail(null), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useReviewProduct', () => {
  it('mutates and invalidates queries', async () => {
    mockPatch.mockResolvedValue({ data: { success: true } });
    const { result } = renderHook(() => useReviewProduct(), { wrapper: createWrapper() });
    result.current.mutate('123');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPatch).toHaveBeenCalledWith('/admin/products/123/review');
  });
});

describe('useApproveProduct', () => {
  it('mutates and invalidates queries', async () => {
    mockPatch.mockResolvedValue({ data: { success: true } });
    const { result } = renderHook(() => useApproveProduct(), { wrapper: createWrapper() });
    result.current.mutate('123');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPatch).toHaveBeenCalledWith('/admin/products/123/approve');
  });
});

describe('useRejectProduct', () => {
  it('mutates with id and reason', async () => {
    mockPatch.mockResolvedValue({ data: { success: true } });
    const { result } = renderHook(() => useRejectProduct(), { wrapper: createWrapper() });
    result.current.mutate({ id: '123', reason: 'Bad quality' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPatch).toHaveBeenCalledWith('/admin/products/123/reject', { reason: 'Bad quality' });
  });
});

describe('useDeleteProduct', () => {
  it('mutates with id', async () => {
    mockDelete.mockResolvedValue({ data: { success: true } });
    const { result } = renderHook(() => useDeleteProduct(), { wrapper: createWrapper() });
    result.current.mutate('123');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockDelete).toHaveBeenCalledWith('/admin/products/123');
  });
});

describe('useUpdateProduct', () => {
  it('mutates with id and fields', async () => {
    mockPatch.mockResolvedValue({ data: { success: true } });
    const { result } = renderHook(() => useUpdateProduct(), { wrapper: createWrapper() });
    result.current.mutate({ id: '123', brand: 'Rolex', listingCategory: 'featured' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPatch).toHaveBeenCalledWith('/admin/products/123', { brand: 'Rolex', listingCategory: 'featured' });
  });
});

describe('useBrands', () => {
  it('fetches brands', async () => {
    mockGet.mockResolvedValue({ data: ['Rolex', 'Omega'] });
    const { result } = renderHook(() => useBrands(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGet).toHaveBeenCalledWith('/admin/brands');
    expect(result.current.data).toEqual(['Rolex', 'Omega']);
  });
});

describe('useMarkProductAsSold', () => {
  it('mutates with id', async () => {
    mockPatch.mockResolvedValue({ data: { success: true } });
    const { result } = renderHook(() => useMarkProductAsSold(), { wrapper: createWrapper() });
    result.current.mutate('123');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPatch).toHaveBeenCalledWith('/admin/products/123/sold');
  });
});

describe('useUpdateAuthenticityStatus', () => {
  it('mutates with id and status', async () => {
    mockPatch.mockResolvedValue({ data: { success: true } });
    const { result } = renderHook(() => useUpdateAuthenticityStatus(), { wrapper: createWrapper() });
    result.current.mutate({ id: '123', status: 'Verified' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPatch).toHaveBeenCalledWith('/admin/products/123/authenticity', { status: 'Verified' });
  });
});

describe('useTCEProducts', () => {
  it('fetches TCE store products', async () => {
    mockGet.mockResolvedValue({ data: { products: [{ id: 1 }] } });
    const { result } = renderHook(() => useTCEProducts(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGet).toHaveBeenCalledWith('/admin/products/tce-store');
  });
});

describe('useCreateProduct', () => {
  it('creates a product', async () => {
    mockPost.mockResolvedValue({ data: { id: 1 } });
    const { result } = renderHook(() => useCreateProduct(), { wrapper: createWrapper() });
    result.current.mutate({ title: 'New' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPost).toHaveBeenCalledWith('/admin/products', { title: 'New' });
  });
});

describe('useEditProduct', () => {
  it('edits a product', async () => {
    mockPatch.mockResolvedValue({ data: { success: true } });
    const { result } = renderHook(() => useEditProduct(), { wrapper: createWrapper() });
    result.current.mutate({ id: '123', title: 'Updated' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPatch).toHaveBeenCalledWith('/admin/products/123', { title: 'Updated' });
  });
});
