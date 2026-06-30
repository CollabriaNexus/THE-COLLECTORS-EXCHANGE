import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import Returns from '../Returns'

describe('Returns', () => {
  it('renders returns policy heading', () => {
    render(<HelmetProvider><Returns /></HelmetProvider>)
    expect(screen.getByText(/returns.*refunds.*shipping/i)).toBeInTheDocument()
  })
})
