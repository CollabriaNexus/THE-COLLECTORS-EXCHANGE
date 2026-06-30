import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
}

vi.mock('../apiClient', () => ({
  default: mockApiClient,
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useWishlist', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useWishlist', () => {
    it('fetches wishlist items for a given userId', async () => {
      const wishlistItems = [{ id: 'w1', productId: 'p1' }]
      mockApiClient.get.mockResolvedValue({ data: wishlistItems })
      const { useWishlist } = await import('../useWishlist')
      const { result } = renderHook(() => useWishlist('user-123'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(wishlistItems)
      expect(mockApiClient.get).toHaveBeenCalledWith('/wishlist/user-123')
    })

    it('does not fetch when userId is empty string', async () => {
      const { useWishlist } = await import('../useWishlist')
      const { result } = renderHook(() => useWishlist(''), { wrapper: createWrapper() })
      expect(result.current.isFetching).toBe(false)
    })

    it('does not fetch when userId is null', async () => {
      const { useWishlist } = await import('../useWishlist')
      const { result } = renderHook(() => useWishlist(null), { wrapper: createWrapper() })
      expect(result.current.isFetching).toBe(false)
    })

    it('handles API error', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Wishlist fetch failed'))
      const { useWishlist } = await import('../useWishlist')
      const { result } = renderHook(() => useWishlist('user-123'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useAddToWishlist', () => {
    it('sends post request with userId and productId', async () => {
      mockApiClient.post.mockResolvedValue({ data: { success: true } })
      const { useAddToWishlist } = await import('../useWishlist')
      const { result } = renderHook(() => useAddToWishlist(), { wrapper: createWrapper() })
      result.current.mutate({ userId: 'user-1', productId: 'prod-1' })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockApiClient.post).toHaveBeenCalledWith('/wishlist', { userId: 'user-1', productId: 'prod-1' })
    })

    it('handles API error', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Add to wishlist failed'))
      const { useAddToWishlist } = await import('../useWishlist')
      const { result } = renderHook(() => useAddToWishlist(), { wrapper: createWrapper() })
      result.current.mutate({ userId: 'user-1', productId: 'prod-1' })
      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useRemoveFromWishlist', () => {
    it('sends delete request with userId and productId in data', async () => {
      mockApiClient.delete.mockResolvedValue({ data: { success: true } })
      const { useRemoveFromWishlist } = await import('../useWishlist')
      const { result } = renderHook(() => useRemoveFromWishlist(), { wrapper: createWrapper() })
      result.current.mutate({ userId: 'user-1', productId: 'prod-1' })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockApiClient.delete).toHaveBeenCalledWith('/wishlist', { data: { userId: 'user-1', productId: 'prod-1' } })
    })

    it('handles API error', async () => {
      mockApiClient.delete.mockRejectedValue(new Error('Remove from wishlist failed'))
      const { useRemoveFromWishlist } = await import('../useWishlist')
      const { result } = renderHook(() => useRemoveFromWishlist(), { wrapper: createWrapper() })
      result.current.mutate({ userId: 'user-1', productId: 'prod-1' })
      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })
})
