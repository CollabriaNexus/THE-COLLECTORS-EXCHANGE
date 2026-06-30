import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Genesis from '../Genesis'

describe('Genesis', () => {
  it('renders the genesis badge', () => {
    render(<Genesis />)
    expect(screen.getByText(/genesis/i)).toBeInTheDocument()
  })

  it('renders the main heading', () => {
    render(<Genesis />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/restless curiosity/i)
  })

  it('renders narrative paragraph', () => {
    render(<Genesis />)
    expect(screen.getByText(/deep.rooted passion/i)).toBeInTheDocument()
  })
})
