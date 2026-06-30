import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProductDetail from '../ProductDetail'

vi.mock('../../hooks/api/useProducts', () => ({
  useProduct: vi.fn((id) => ({
    data: id ? { id, title: 'Detail Watch', price: 25000, images: ['img1.jpg', 'img2.jpg'], category: 'watches', description: 'A **fine** watch', condition: 'Mint', listingCategory: 'premium' } : null,
    isLoading: false
  })),
  useProducts: vi.fn(() => ({ data: { products: [] }, isLoading: false }))
}))

vi.mock('../../hooks/api/useCart', () => ({
  useCart: vi.fn(() => ({ data: [], isLoading: false })),
  useAddToCart: vi.fn(() => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isLoading: false }))
}))

vi.mock('../../hooks/api/useWishlist', () => ({
  useWishlist: vi.fn(() => ({ data: [], isLoading: false })),
  useAddToWishlist: vi.fn(() => ({ mutate: vi.fn(), isLoading: false })),
  useRemoveFromWishlist: vi.fn(() => ({ mutate: vi.fn(), isLoading: false }))
}))

vi.mock('../../utils/storage', () => ({
  getUser: vi.fn(() => ({ id: 'user1' }))
}))

vi.mock('../../components/Toast', () => ({
  useToast: vi.fn(() => vi.fn())
}))

vi.mock('../../components/ConfirmDialog', () => ({
  useConfirm: vi.fn(() => vi.fn(() => Promise.resolve(true)))
}))

vi.mock('../../hooks/api/apiClient', () => ({
  default: { post: vi.fn() }
}))

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

describe('ProductDetail', () => {
  it('renders product title', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter initialEntries={['/product/1']}>
            <Routes>
              <Route path="/product/:id" element={<ProductDetail />} />
            </Routes>
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>
    )
    expect(screen.getByText('Detail Watch')).toBeInTheDocument()
  })

  it('renders product price', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter initialEntries={['/product/1']}>
            <Routes>
              <Route path="/product/:id" element={<ProductDetail />} />
            </Routes>
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>
    )
    expect(screen.getByText(/25,000/)).toBeInTheDocument()
  })

  it('renders product images', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter initialEntries={['/product/1']}>
            <Routes>
              <Route path="/product/:id" element={<ProductDetail />} />
            </Routes>
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>
    )
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(0)
  })

  it('renders add to cart button', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter initialEntries={['/product/1']}>
            <Routes>
              <Route path="/product/:id" element={<ProductDetail />} />
            </Routes>
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>
    )
    expect(screen.getByText(/add to cart/i)).toBeInTheDocument()
  })
})
