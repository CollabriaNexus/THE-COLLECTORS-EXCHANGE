import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGalleryItems, useCreateGalleryItem, useUpdateGalleryItem, useDeleteGalleryItem } from '../useGallery';

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();

vi.mock('../apiClient', () => ({
  default: {
    get: (...args) => mockGet(...args),
    post: (...args) => mockPost(...args),
    put: (...args) => mockPut(...args),
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

describe('useGalleryItems', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('fetches gallery items', async () => {
    mockGet.mockResolvedValue({ data: [{ id: 1, title: 'Art' }] });
    const { result } = renderHook(() => useGalleryItems(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGet).toHaveBeenCalledWith('/gallery');
    expect(result.current.data).toEqual([{ id: 1, title: 'Art' }]);
  });

  it('handles error state', async () => {
    mockGet.mockRejectedValue(new Error('Failed'));
    const { result } = renderHook(() => useGalleryItems(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useCreateGalleryItem', () => {
  it('creates a gallery item', async () => {
    mockPost.mockResolvedValue({ data: { id: 1 } });
    const { result } = renderHook(() => useCreateGalleryItem(), { wrapper: createWrapper() });
    result.current.mutate({ title: 'New Item' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPost).toHaveBeenCalledWith('/gallery', { title: 'New Item' });
  });
});

describe('useUpdateGalleryItem', () => {
  it('updates a gallery item with id and data', async () => {
    mockPut.mockResolvedValue({ data: { success: true } });
    const { result } = renderHook(() => useUpdateGalleryItem(), { wrapper: createWrapper() });
    result.current.mutate({ id: '123', title: 'Updated' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPut).toHaveBeenCalledWith('/gallery/123', { title: 'Updated' });
  });
});

describe('useDeleteGalleryItem', () => {
  it('deletes a gallery item', async () => {
    mockDelete.mockResolvedValue({});
    const { result } = renderHook(() => useDeleteGalleryItem(), { wrapper: createWrapper() });
    result.current.mutate('123');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockDelete).toHaveBeenCalledWith('/gallery/123');
  });
});
