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

describe('useCart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useCart', () => {
    it('fetches cart items for a given userId', async () => {
      const cartItems = [{ id: '1', productId: 'p1', quantity: 2 }]
      mockApiClient.get.mockResolvedValue({ data: cartItems })
      const { useCart } = await import('../useCart')
      const { result } = renderHook(() => useCart('user-123'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(cartItems)
      expect(mockApiClient.get).toHaveBeenCalledWith('/cart/user-123')
    })

    it('does not fetch when userId is empty string', async () => {
      const { useCart } = await import('../useCart')
      const { result } = renderHook(() => useCart(''), { wrapper: createWrapper() })
      expect(result.current.isFetching).toBe(false)
    })

    it('does not fetch when userId is null', async () => {
      const { useCart } = await import('../useCart')
      const { result } = renderHook(() => useCart(null), { wrapper: createWrapper() })
      expect(result.current.isFetching).toBe(false)
    })

    it('handles API error', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Cart fetch failed'))
      const { useCart } = await import('../useCart')
      const { result } = renderHook(() => useCart('user-123'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useAddToCart', () => {
    it('sends post request with userId and productId', async () => {
      mockApiClient.post.mockResolvedValue({ data: { success: true } })
      const { useAddToCart } = await import('../useCart')
      const { result } = renderHook(() => useAddToCart(), { wrapper: createWrapper() })
      result.current.mutate({ userId: 'user-1', productId: 'prod-1' })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockApiClient.post).toHaveBeenCalledWith('/cart', { userId: 'user-1', productId: 'prod-1' })
    })

    it('handles API error', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Add to cart failed'))
      const { useAddToCart } = await import('../useCart')
      const { result } = renderHook(() => useAddToCart(), { wrapper: createWrapper() })
      result.current.mutate({ userId: 'user-1', productId: 'prod-1' })
      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useRemoveFromCart', () => {
    it('sends delete request with userId and productId in data', async () => {
      mockApiClient.delete.mockResolvedValue({ data: { success: true } })
      const { useRemoveFromCart } = await import('../useCart')
      const { result } = renderHook(() => useRemoveFromCart(), { wrapper: createWrapper() })
      result.current.mutate({ userId: 'user-1', productId: 'prod-1' })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockApiClient.delete).toHaveBeenCalledWith('/cart', { data: { userId: 'user-1', productId: 'prod-1' } })
    })

    it('handles API error', async () => {
      mockApiClient.delete.mockRejectedValue(new Error('Remove from cart failed'))
      const { useRemoveFromCart } = await import('../useCart')
      const { result } = renderHook(() => useRemoveFromCart(), { wrapper: createWrapper() })
      result.current.mutate({ userId: 'user-1', productId: 'prod-1' })
      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })
})
