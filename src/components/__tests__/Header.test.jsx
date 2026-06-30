import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Header from '../Header'

vi.mock('../../hooks/api/useCart', () => ({
  useCart: vi.fn(() => ({ data: [], isLoading: false }))
}))

vi.mock('../../hooks/api/useWishlist', () => ({
  useWishlist: vi.fn(() => ({ data: [], isLoading: false }))
}))

vi.mock('../../utils/storage', () => ({
  getUser: vi.fn(() => null)
}))

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

const renderHeader = () => render(
  <QueryClientProvider client={queryClient}>
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  </QueryClientProvider>
)

describe('Header', () => {
  beforeEach(() => {
    queryClient.clear()
  })

  it('renders the logo', () => {
    renderHeader()
    expect(screen.getByText(/the collectors exchange/i)).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    renderHeader()
    expect(screen.getByText(/home/i)).toBeInTheDocument()
  })

  it('renders cart icon with count', () => {
    renderHeader()
    expect(screen.getByLabelText(/cart/i)).toBeInTheDocument()
  })

  it('renders wishlist icon with count', () => {
    renderHeader()
    expect(screen.getByLabelText(/wishlist/i)).toBeInTheDocument()
  })

  it('toggles mobile menu', () => {
    renderHeader()
    const menuBtn = screen.getByLabelText(/menu/i)
    fireEvent.click(menuBtn)
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
  })

  it('renders login link when no user', () => {
    renderHeader()
    expect(screen.getByText(/login/i)).toBeInTheDocument()
  })
})
