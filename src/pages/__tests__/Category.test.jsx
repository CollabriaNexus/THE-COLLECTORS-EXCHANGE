import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Category from '../Category'

vi.mock('../../hooks/api/useProducts', () => ({
  useProducts: vi.fn(() => ({
    data: { products: [{ id: '1', title: 'Category Product', price: 5000, images: ['img.jpg'], category: 'watches', condition: 'Good', listingCategory: 'standard' }] },
    isLoading: false
  }))
}))

vi.mock('../../hooks/api/useCart', () => ({
  useCart: vi.fn(() => ({ data: [], isLoading: false })),
  useAddToCart: vi.fn(() => ({ mutate: vi.fn(), isLoading: false }))
}))

vi.mock('../../hooks/api/useWishlist', () => ({
  useWishlist: vi.fn(() => ({ data: [], isLoading: false })),
  useAddToWishlist: vi.fn(() => ({ mutate: vi.fn(), isLoading: false })),
  useRemoveFromWishlist: vi.fn(() => ({ mutate: vi.fn(), isLoading: false }))
}))

vi.mock('../../utils/storage', () => ({
  getUser: vi.fn(() => null)
}))

vi.mock('../../components/Toast', () => ({
  useToast: vi.fn(() => vi.fn())
}))

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

describe('Category', () => {
  it('renders category filter buttons', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter>
            <Category />
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>
    )
    expect(screen.getByText(/all/i)).toBeInTheDocument()
  })

  it('renders product grid', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter>
            <Category />
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>
    )
    expect(screen.getByText('Category Product')).toBeInTheDocument()
  })

  it('renders category names', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter>
            <Category />
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>
    )
    expect(screen.getByText('Timepieces')).toBeInTheDocument()
  })
})
