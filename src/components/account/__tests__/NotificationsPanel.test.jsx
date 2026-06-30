import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import NotificationsPanel from '../NotificationsPanel'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('../../../hooks/api/useNotifications', () => ({
  useNotifications: vi.fn(() => ({ data: [], isLoading: false })),
  useMarkNotificationRead: vi.fn(() => ({ mutate: vi.fn() })),
  useMarkAllNotificationsRead: vi.fn(() => ({ mutate: vi.fn() }))
}))

vi.mock('../../../hooks/api/apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() }
}))

vi.mock('../../../utils/storage', () => ({
  getUser: vi.fn(() => ({ id: 'user1' }))
}))

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

const renderNotifications = () => render(
  <QueryClientProvider client={queryClient}>
    <NotificationsPanel />
  </QueryClientProvider>
)

describe('NotificationsPanel', () => {
  beforeEach(() => {
    queryClient.clear()
  })

  it('renders heading', () => {
    renderNotifications()
    expect(screen.getByText('Notifications')).toBeInTheDocument()
  })

  it('shows empty state when no notifications', () => {
    renderNotifications()
    expect(screen.getByText('No notifications yet.')).toBeInTheDocument()
  })

  it('renders notification items', () => {
    const { useNotifications } = require('../../../hooks/api/useNotifications')
    useNotifications.mockReturnValue({
      data: [{ id: '1', title: 'Test Notification', message: 'Hello', read: false, createdAt: '2024-01-01' }],
      isLoading: false
    })
    renderNotifications()
    expect(screen.getByText('Test Notification')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    const { useNotifications } = require('../../../hooks/api/useNotifications')
    useNotifications.mockReturnValue({ data: [], isLoading: true })
    renderNotifications()
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('shows mark all read button when unread exist', () => {
    const { useNotifications } = require('../../../hooks/api/useNotifications')
    useNotifications.mockReturnValue({
      data: [{ id: '1', title: 'Unread', message: 'Test', read: false, createdAt: '2024-01-01' }],
      isLoading: false
    })
    renderNotifications()
    expect(screen.getByText('Mark All Read')).toBeInTheDocument()
  })
})
