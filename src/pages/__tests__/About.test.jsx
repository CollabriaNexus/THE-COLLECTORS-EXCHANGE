import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router-dom'
import About from '../About'

describe('About', () => {
  it('renders hero section with authorized badge', () => {
    render(<HelmetProvider><MemoryRouter><About /></MemoryRouter></HelmetProvider>)
    expect(screen.getByText(/authorized.*premium/i)).toBeInTheDocument()
  })

  it('renders milestones section', () => {
    render(<HelmetProvider><MemoryRouter><About /></MemoryRouter></HelmetProvider>)
    expect(screen.getByText(/milestones/i)).toBeInTheDocument()
  })

  it('renders values section', () => {
    render(<HelmetProvider><MemoryRouter><About /></MemoryRouter></HelmetProvider>)
    expect(screen.getByText(/values/i)).toBeInTheDocument()
  })

  it('renders SVG bullets', () => {
    render(<HelmetProvider><MemoryRouter><About /></MemoryRouter></HelmetProvider>)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })
})
