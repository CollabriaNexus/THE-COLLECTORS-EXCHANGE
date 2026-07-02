import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
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

describe('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useProducts', () => {
    it('fetches all products without filters', async () => {
      const products = [{ id: '1', name: 'Product 1' }]
      mockApiClient.get.mockResolvedValue({ data: products })
      const { useProducts } = await import('../useProducts')
      const { result } = renderHook(() => useProducts(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(products)
      expect(mockApiClient.get).toHaveBeenCalledWith('/products?page=1&limit=12')
    })

    it('fetches products with category filter', async () => {
      mockApiClient.get.mockResolvedValue({ data: [] })
      const { useProducts } = await import('../useProducts')
      renderHook(() => useProducts('art'), { wrapper: createWrapper() })
      await waitFor(() => expect(mockApiClient.get).toHaveBeenCalled())
      expect(mockApiClient.get).toHaveBeenCalledWith('/products?category=art&page=1&limit=12')
    })

    it('does not include category when it is "all"', async () => {
      mockApiClient.get.mockResolvedValue({ data: [] })
      const { useProducts } = await import('../useProducts')
      renderHook(() => useProducts('all'), { wrapper: createWrapper() })
      await waitFor(() => expect(mockApiClient.get).toHaveBeenCalled())
      expect(mockApiClient.get).toHaveBeenCalledWith('/products?page=1&limit=12')
    })

    it('includes search parameter when provided', async () => {
      mockApiClient.get.mockResolvedValue({ data: [] })
      const { useProducts } = await import('../useProducts')
      renderHook(() => useProducts(null, 'vase'), { wrapper: createWrapper() })
      await waitFor(() => expect(mockApiClient.get).toHaveBeenCalled())
      expect(mockApiClient.get).toHaveBeenCalledWith('/products?search=vase&page=1&limit=12')
    })

    it('includes listingCategory parameter when provided', async () => {
      mockApiClient.get.mockResolvedValue({ data: [] })
      const { useProducts } = await import('../useProducts')
      renderHook(() => useProducts(null, null, 1, 12, 'premium'), { wrapper: createWrapper() })
      await waitFor(() => expect(mockApiClient.get).toHaveBeenCalled())
      expect(mockApiClient.get).toHaveBeenCalledWith('/products?listingCategory=premium&page=1&limit=12')
    })

    it('includes condition parameter when provided', async () => {
      mockApiClient.get.mockResolvedValue({ data: [] })
      const { useProducts } = await import('../useProducts')
      renderHook(() => useProducts(null, null, 1, 12, null, 'Excellent'), { wrapper: createWrapper() })
      await waitFor(() => expect(mockApiClient.get).toHaveBeenCalled())
      expect(mockApiClient.get).toHaveBeenCalledWith('/products?condition=Excellent&page=1&limit=12')
    })

    it('uses custom page and pageSize', async () => {
      mockApiClient.get.mockResolvedValue({ data: [] })
      const { useProducts } = await import('../useProducts')
      renderHook(() => useProducts(null, null, 3, 24), { wrapper: createWrapper() })
      await waitFor(() => expect(mockApiClient.get).toHaveBeenCalled())
      expect(mockApiClient.get).toHaveBeenCalledWith('/products?page=3&limit=24')
    })

    it('handles API error', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'))
      const { useProducts } = await import('../useProducts')
      const { result } = renderHook(() => useProducts(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(result.current.error.message).toBe('Network error')
    })

    it('uses placeholderData to keep previous data', async () => {
      const products1 = [{ id: '1', name: 'First' }]
      mockApiClient.get.mockResolvedValue({ data: products1 })
      const { useProducts } = await import('../useProducts')
      const { result } = renderHook(() => useProducts(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toEqual(products1))
    })
  })

  describe('useProduct', () => {
    it('fetches a single product by id', async () => {
      const product = { id: '123', name: 'Test Product' }
      mockApiClient.get.mockResolvedValue({ data: product })
      const { useProduct } = await import('../useProducts')
      const { result } = renderHook(() => useProduct('123'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(product)
      expect(mockApiClient.get).toHaveBeenCalledWith('/products/123')
    })

    it('does not fetch when id is empty string', async () => {
      const { useProduct } = await import('../useProducts')
      const { result } = renderHook(() => useProduct(''), { wrapper: createWrapper() })
      expect(result.current.isFetching).toBe(false)
    })

    it('does not fetch when id is null', async () => {
      const { useProduct } = await import('../useProducts')
      const { result } = renderHook(() => useProduct(null), { wrapper: createWrapper() })
      expect(result.current.isFetching).toBe(false)
    })

    it('handles API error', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Not found'))
      const { useProduct } = await import('../useProducts')
      const { result } = renderHook(() => useProduct('999'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useAddProduct', () => {
    it('posts product data and invalidates queries on success', async () => {
      const productData = { name: 'New Product', price: 100 }
      mockApiClient.post.mockResolvedValue({ data: { id: '1', ...productData } })
      const { useAddProduct } = await import('../useProducts')
      const { result } = renderHook(() => useAddProduct(), { wrapper: createWrapper() })
      result.current.mutate(productData)
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockApiClient.post).toHaveBeenCalledWith('/products', productData)
    })

    it('handles API error on add', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Validation failed'))
      const { useAddProduct } = await import('../useProducts')
      const { result } = renderHook(() => useAddProduct(), { wrapper: createWrapper() })
      result.current.mutate({ name: 'Bad' })
      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useUpdateProduct', () => {
    it('sends put request with id and product data', async () => {
      const productData = { name: 'Updated' }
      mockApiClient.put.mockResolvedValue({ data: { id: '1', ...productData } })
      const { useUpdateProduct } = await import('../useProducts')
      const { result } = renderHook(() => useUpdateProduct(), { wrapper: createWrapper() })
      result.current.mutate({ id: '1', productData })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockApiClient.put).toHaveBeenCalledWith('/products/1', productData)
    })

    it('handles API error on update', async () => {
      mockApiClient.put.mockRejectedValue(new Error('Update failed'))
      const { useUpdateProduct } = await import('../useProducts')
      const { result } = renderHook(() => useUpdateProduct(), { wrapper: createWrapper() })
      result.current.mutate({ id: '1', productData: {} })
      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useDeleteProduct', () => {
    it('sends delete request with product id', async () => {
      mockApiClient.delete.mockResolvedValue({ data: { success: true } })
      const { useDeleteProduct } = await import('../useProducts')
      const { result } = renderHook(() => useDeleteProduct(), { wrapper: createWrapper() })
      result.current.mutate('1')
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockApiClient.delete).toHaveBeenCalledWith('/products/1')
    })

    it('handles API error on delete', async () => {
      mockApiClient.delete.mockRejectedValue(new Error('Delete failed'))
      const { useDeleteProduct } = await import('../useProducts')
      const { result } = renderHook(() => useDeleteProduct(), { wrapper: createWrapper() })
      result.current.mutate('999')
      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useAddBulkProducts', () => {
    it('sends post request with bulk products array', async () => {
      const products = [{ name: 'Bulk 1' }, { name: 'Bulk 2' }]
      mockApiClient.post.mockResolvedValue({ data: { created: 2 } })
      const { useAddBulkProducts } = await import('../useProducts')
      const { result } = renderHook(() => useAddBulkProducts(), { wrapper: createWrapper() })
      result.current.mutate(products)
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockApiClient.post).toHaveBeenCalledWith('/products/bulk', { products })
    })

    it('handles API error on bulk add', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Bulk add failed'))
      const { useAddBulkProducts } = await import('../useProducts')
      const { result } = renderHook(() => useAddBulkProducts(), { wrapper: createWrapper() })
      result.current.mutate([])
      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useMarkAsSold', () => {
    it('sends patch request to mark product as sold', async () => {
      mockApiClient.patch.mockResolvedValue({ data: { id: '1', status: 'sold' } })
      const { useMarkAsSold } = await import('../useProducts')
      const { result } = renderHook(() => useMarkAsSold(), { wrapper: createWrapper() })
      result.current.mutate('1')
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockApiClient.patch).toHaveBeenCalledWith('/products/1/sold')
    })

    it('handles API error on mark as sold', async () => {
      mockApiClient.patch.mockRejectedValue(new Error('Sold failed'))
      const { useMarkAsSold } = await import('../useProducts')
      const { result } = renderHook(() => useMarkAsSold(), { wrapper: createWrapper() })
      result.current.mutate('999')
      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })
})
