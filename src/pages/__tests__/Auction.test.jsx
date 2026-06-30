import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router-dom'
import Auction from '../Auction'

describe('Auction', () => {
  it('renders coming soon badge', () => {
    render(<HelmetProvider><MemoryRouter><Auction /></MemoryRouter></HelmetProvider>)
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument()
  })

  it('renders The Auction House heading', () => {
    render(<HelmetProvider><MemoryRouter><Auction /></MemoryRouter></HelmetProvider>)
    expect(screen.getByText(/the auction house/i)).toBeInTheDocument()
  })

  it('renders SEO title', () => {
    render(<HelmetProvider><MemoryRouter><Auction /></MemoryRouter></HelmetProvider>)
    expect(document.title).toContain('Auctions')
  })
})
