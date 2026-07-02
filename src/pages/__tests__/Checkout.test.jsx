import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Checkout from '../Checkout'

vi.mock('../../hooks/api/useCheckout', () => ({
  useCreateOrder: vi.fn(() => ({ mutateAsync: vi.fn(() => ({ id: 'order1', amount: 15000 })), isLoading: false })),
  useVerifyPayment: vi.fn(() => ({ mutateAsync: vi.fn(), isLoading: false }))
}))

vi.mock('../../hooks/api/useCart', () => ({
  useCart: vi.fn(() => ({
    data: [{ id: '1', product: { id: 'p1', title: 'Checkout Watch', price: 15000, images: ['img.jpg'], commissionPercent: 20, condition: 'Mint' }, quantity: 1 }],
    isLoading: false
  }))
}))

vi.mock('../../utils/storage', () => ({
  getUser: vi.fn(() => ({ id: 'user1', name: 'Test User', email: 'test@test.com', phone: '1234567890' }))
}))

vi.mock('../../components/Toast', () => ({
  useToast: vi.fn(() => vi.fn())
}))

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

describe('Checkout', () => {
  beforeEach(() => {
    queryClient.clear()
    vi.clearAllMocks()
  })

  it('renders checkout heading', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter>
            <Checkout />
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>
    )
    expect(screen.getByText(/checkout/i)).toBeInTheDocument()
  })

  it('renders order summary with product', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter>
            <Checkout />
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>
    )
    expect(screen.getByText('Checkout Watch')).toBeInTheDocument()
  })

  it('renders shipping address field', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter>
            <Checkout />
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>
    )
    expect(screen.getByText(/recipient name/i)).toBeInTheDocument()
  })

  it('renders place order button', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter>
            <Checkout />
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>
    )
    expect(screen.getByRole('button', { name: /place order/i })).toBeInTheDocument()
  })

  it('displays Platform Contribution in order summary', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter>
            <Checkout />
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>
    )
    expect(screen.getByText('Platform Contribution')).toBeInTheDocument()
  })

  it('shows commission percent breakdown per item', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter>
            <Checkout />
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>
    )
    expect(screen.getByText('20%')).toBeInTheDocument()
  })

  it('displays GST @ 18% in order summary', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter>
            <Checkout />
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>
    )
    expect(screen.getByText('GST @ 18%')).toBeInTheDocument()
    expect(screen.getByText(/540/)).toBeInTheDocument()
  })
})
