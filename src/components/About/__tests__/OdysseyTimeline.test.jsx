import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import OdysseyTimeline from '../OdysseyTimeline'

describe('OdysseyTimeline', () => {
  it('renders the odyssey badge', () => {
    render(<OdysseyTimeline />)
    expect(screen.getByText(/the odyssey/i)).toBeInTheDocument()
  })

  it('renders three timeline steps', () => {
    render(<OdysseyTimeline />)
    expect(screen.getByText('Exploration')).toBeInTheDocument()
    expect(screen.getByText('Curation')).toBeInTheDocument()
    expect(screen.getByText('Delivery')).toBeInTheDocument()
  })

  it('renders numbered steps', () => {
    render(<OdysseyTimeline />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})
