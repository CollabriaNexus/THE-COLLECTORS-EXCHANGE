import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router-dom'
import Contact from '../Contact'

vi.mock('../../hooks/api/apiClient', () => ({
  default: { post: vi.fn() }
}))

const renderContact = () => render(
  <HelmetProvider>
    <MemoryRouter>
      <Contact />
    </MemoryRouter>
  </HelmetProvider>
)

describe('Contact', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Contact Us heading', () => {
    renderContact()
    expect(screen.getByText('Contact Us')).toBeInTheDocument()
  })

  it('renders info cards', () => {
    renderContact()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Response Time')).toBeInTheDocument()
  })

  it('renders form with name field', () => {
    renderContact()
    expect(screen.getByText('Name')).toBeInTheDocument()
  })

  it('renders form with email field', () => {
    renderContact()
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    renderContact()
    expect(screen.getByText('Send Message')).toBeInTheDocument()
  })

  it('submits form successfully', async () => {
    const apiClient = (await import('../../hooks/api/apiClient')).default
    apiClient.post.mockResolvedValue({ data: { success: true } })
    renderContact()
    fireEvent.click(screen.getByText('Send Message'))
    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalled()
    })
  })

  it('shows sent state', async () => {
    const apiClient = (await import('../../hooks/api/apiClient')).default
    apiClient.post.mockResolvedValue({ data: { success: true } })
    renderContact()
    fireEvent.click(screen.getByText('Send Message'))
    await waitFor(() => {
      expect(screen.getByText('Message Sent')).toBeInTheDocument()
    })
  })
})
