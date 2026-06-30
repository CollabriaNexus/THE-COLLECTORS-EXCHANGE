import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import Terms from '../Terms'

describe('Terms', () => {
  it('renders custodianship agreement heading', () => {
    render(<HelmetProvider><Terms /></HelmetProvider>)
    expect(screen.getByText(/custodianship agreement/i)).toBeInTheDocument()
  })
})
