import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
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

describe('useTestimonials', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useTestimonials', () => {
    it('fetches all testimonials from /testimonials', async () => {
      const testimonials = [{ id: 't1', authorName: 'John', content: 'Great!', rating: 5 }]
      mockApiClient.get.mockResolvedValue({ data: testimonials })
      const { useTestimonials } = await import('../useTestimonials')
      const { result } = renderHook(() => useTestimonials(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(testimonials)
      expect(mockApiClient.get).toHaveBeenCalledWith('/testimonials')
    })

    it('handles API error', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Testimonials fetch failed'))
      const { useTestimonials } = await import('../useTestimonials')
      const { result } = renderHook(() => useTestimonials(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.isError).toBe(true))
    })

    it('returns empty array when no testimonials exist', async () => {
      mockApiClient.get.mockResolvedValue({ data: [] })
      const { useTestimonials } = await import('../useTestimonials')
      const { result } = renderHook(() => useTestimonials(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual([])
    })
  })

  describe('useSubmitTestimonial', () => {
    it('sends post request with testimonial data', async () => {
      const testimonialData = { authorName: 'Jane', content: 'Amazing!', rating: 5, images: ['img1.jpg'] }
      mockApiClient.post.mockResolvedValue({ data: { id: 't2', ...testimonialData } })
      const { useSubmitTestimonial } = await import('../useTestimonials')
      const { result } = renderHook(() => useSubmitTestimonial(), { wrapper: createWrapper() })
      result.current.mutate(testimonialData)
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockApiClient.post).toHaveBeenCalledWith('/testimonials', {
        authorName: 'Jane',
        content: 'Amazing!',
        rating: 5,
        images: ['img1.jpg'],
      })
    })

    it('handles testimonial submission without images', async () => {
      mockApiClient.post.mockResolvedValue({ data: { id: 't3' } })
      const { useSubmitTestimonial } = await import('../useTestimonials')
      const { result } = renderHook(() => useSubmitTestimonial(), { wrapper: createWrapper() })
      result.current.mutate({ authorName: 'Bob', content: 'Good', rating: 4 })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockApiClient.post).toHaveBeenCalledWith('/testimonials', {
        authorName: 'Bob',
        content: 'Good',
        rating: 4,
        images: undefined,
      })
    })

    it('handles API error on submit', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Testimonial submit failed'))
      const { useSubmitTestimonial } = await import('../useTestimonials')
      const { result } = renderHook(() => useSubmitTestimonial(), { wrapper: createWrapper() })
      result.current.mutate({ authorName: 'Bad', content: '', rating: 1 })
      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })
})
