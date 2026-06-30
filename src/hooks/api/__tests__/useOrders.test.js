import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

const mockApiClient = {
  get: vi.fn(),
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

describe('useOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useMyOrders', () => {
    it('fetches current user orders from /users/orders', async () => {
      const orders = [{ id: 'ord-1', total: 100, status: 'delivered' }]
      mockApiClient.get.mockResolvedValue({ data: orders })
      const { useMyOrders } = await import('../useOrders')
      const { result } = renderHook(() => useMyOrders(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(orders)
      expect(mockApiClient.get).toHaveBeenCalledWith('/users/orders')
    })

    it('has retry set to false', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Fetch failed'))
      const { useMyOrders } = await import('../useOrders')
      const { result } = renderHook(() => useMyOrders(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(result.current.failureCount).toBe(1)
    })

    it('handles API error', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Orders fetch failed'))
      const { useMyOrders } = await import('../useOrders')
      const { result } = renderHook(() => useMyOrders(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.isError).toBe(true))
    })

    it('returns empty array when no orders exist', async () => {
      mockApiClient.get.mockResolvedValue({ data: [] })
      const { useMyOrders } = await import('../useOrders')
      const { result } = renderHook(() => useMyOrders(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual([])
    })
  })
})
