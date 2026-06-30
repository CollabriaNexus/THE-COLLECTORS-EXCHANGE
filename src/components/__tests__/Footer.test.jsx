import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Footer from '../Footer'

describe('Footer', () => {
  it('renders the footer', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>)
    expect(screen.getByText(/the collectors exchange/i)).toBeInTheDocument()
  })

  it('renders quick links section', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>)
    expect(screen.getByText(/quick links/i)).toBeInTheDocument()
  })

  it('renders contact section', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>)
    expect(screen.getByText(/contact/i)).toBeInTheDocument()
  })

  it('renders social media links', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>)
    expect(screen.getByLabelText(/instagram/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/facebook/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/linkedin/i)).toBeInTheDocument()
  })

  it('renders copyright notice', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>)
    expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument()
  })
})
