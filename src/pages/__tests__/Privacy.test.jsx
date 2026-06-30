import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import Privacy from '../Privacy'

describe('Privacy', () => {
  it('renders privacy policy heading', () => {
    render(<HelmetProvider><Privacy /></HelmetProvider>)
    expect(screen.getByText(/privacy.*discretion.*policy/i)).toBeInTheDocument()
  })
})
