import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import VendorDashboard from '../VendorDashboard'

vi.mock('../../hooks/api/useVendor', () => ({
  useVendorProfile: vi.fn(() => ({ data: { id: 'v1', companyName: 'Test Vendor' }, isLoading: false })),
  useVendorAnalyticsOverview: vi.fn(() => ({ data: { orderCount: 5, saleCount: 10, totalRevenue: 50000, paidRevenue: 40000, pendingPayout: 10000, totalListings: 20, activeListings: 15 }, isLoading: false })),
  useVendorAnalyticsInterest: vi.fn(() => ({ data: { totalViews: 100, uniqueViewers: 50, cartAdds: 20, checkoutStarts: 5 }, isLoading: false })),
  useVendorSalesGraph: vi.fn(() => ({ data: [], isLoading: false })),
  useVendorTopProducts: vi.fn(() => ({ data: [], isLoading: false })),
  useVendorPayouts: vi.fn(() => ({ data: { payouts: [], pagination: { page: 1, pages: 0, total: 0, limit: 20 } }, isLoading: false })),
}))

vi.mock('../../utils/storage', () => ({
  getUser: vi.fn(() => ({ id: 'user1' }))
}))

vi.mock('../../components/Toast', () => ({
  useToast: vi.fn(() => vi.fn())
}))

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

describe('VendorDashboard', () => {
  it('renders vendor dashboard heading', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter>
            <VendorDashboard />
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>
    )
    expect(screen.getByText(/Test Vendor/i)).toBeInTheDocument()
  })

  it('renders stat cards with revenue', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter>
            <VendorDashboard />
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>
    )
    expect(screen.getByText(/50,000/)).toBeInTheDocument()
  })

  it('renders sales trend chart section', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter>
            <VendorDashboard />
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>
    )
    expect(screen.getByText(/Sales Trend/i)).toBeInTheDocument()
  })

  it('renders period filter buttons', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter>
            <VendorDashboard />
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>
    )
    const buttons = screen.getAllByText('30 Days')
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })
})
