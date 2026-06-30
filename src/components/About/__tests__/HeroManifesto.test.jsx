import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import HeroManifesto from '../HeroManifesto'

describe('HeroManifesto', () => {
  it('renders the section badge', () => {
    render(<HeroManifesto />)
    expect(screen.getByText(/purpose/i)).toBeInTheDocument()
  })

  it('renders the main heading', () => {
    render(<HeroManifesto />)
    expect(screen.getByText(/preserving the pieces/i)).toBeInTheDocument()
  })

  it('renders an image', () => {
    render(<HeroManifesto />)
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(0)
  })
})
