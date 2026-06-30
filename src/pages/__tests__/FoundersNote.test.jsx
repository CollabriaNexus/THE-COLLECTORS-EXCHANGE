import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import FoundersNote from '../FoundersNote'

describe('FoundersNote', () => {
  it('renders founder message heading', () => {
    render(<HelmetProvider><FoundersNote /></HelmetProvider>)
    expect(screen.getByText(/founder.s message/i)).toBeInTheDocument()
  })

  it('renders A Letter from Our Founder heading', () => {
    render(<HelmetProvider><FoundersNote /></HelmetProvider>)
    expect(screen.getByText(/letter from/i)).toBeInTheDocument()
  })
})
