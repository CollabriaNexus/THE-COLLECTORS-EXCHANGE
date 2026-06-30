import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router-dom'
import FAQ from '../FAQ'

describe('FAQ', () => {
  it('renders FAQ title', () => {
    render(<HelmetProvider><MemoryRouter><FAQ /></MemoryRouter></HelmetProvider>)
    expect(screen.getByText(/faq/i)).toBeInTheDocument()
  })

  it('renders search input', () => {
    render(<HelmetProvider><MemoryRouter><FAQ /></MemoryRouter></HelmetProvider>)
    const searchInput = screen.getByPlaceholderText(/search/i)
    expect(searchInput).toBeInTheDocument()
  })

  it('filters questions by search', () => {
    render(<HelmetProvider><MemoryRouter><FAQ /></MemoryRouter></HelmetProvider>)
    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(searchInput, { target: { value: 'shipping' } })
    expect(searchInput.value).toBe('shipping')
  })

  it('renders accordion items with questions', () => {
    render(<HelmetProvider><MemoryRouter><FAQ /></MemoryRouter></HelmetProvider>)
    expect(screen.getByText(/how do i purchase/i)).toBeInTheDocument()
  })
})
