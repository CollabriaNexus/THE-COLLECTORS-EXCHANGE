import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Wishlist from '../Wishlist'

vi.mock('../../hooks/api/useWishlist', () => ({
  useWishlist: vi.fn(() => ({
    data: [{ id: '1', product: { id: 'p1', title: 'Wishlist Watch', price: 20000, images: ['img.jpg'], category: 'watches', condition: 'Mint', listingCategory: 'premium' } }],
    isLoading: false
  })),
  useRemoveFromWishlist: vi.fn(() => ({ mutate: vi.fn(), isLoading: false }))
}))

vi.mock('../../hooks/api/useCart', () => ({
  useCart: vi.fn(() => ({ data: [], isLoading: false })),
  useAddToCart: vi.fn(() => ({ mutate: vi.fn(), isLoading: false }))
}))

vi.mock('../../utils/storage', () => ({
  getUser: vi.fn(() => ({ id: 'user1' }))
}))

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

describe('Wishlist', () => {
  it('renders My Wishlist heading', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter>
            <Wishlist />
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>
    )
    expect(screen.getByText('My Wishlist')).toBeInTheDocument()
  })

  it('renders wishlist items', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter>
            <Wishlist />
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>
    )
    expect(screen.getByText('Wishlist Watch')).toBeInTheDocument()
  })

  it('renders add to cart button', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter>
            <Wishlist />
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>
    )
    expect(screen.getByText(/add to cart/i)).toBeInTheDocument()
  })
})
