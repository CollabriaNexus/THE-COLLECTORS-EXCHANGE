import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MissionValues from '../MissionValues'

describe('MissionValues', () => {
  it('renders the mission badge', () => {
    render(<MissionValues />)
    expect(screen.getByText('02 / MISSION')).toBeInTheDocument()
  })

  it('renders the main heading', () => {
    render(<MissionValues />)
    expect(screen.getByText(/reviving the soul/i)).toBeInTheDocument()
  })

  it('renders value cards with titles', () => {
    render(<MissionValues />)
    expect(screen.getByText(/the heritage lifejacket/i)).toBeInTheDocument()
    expect(screen.getByText(/educating the vanguard/i)).toBeInTheDocument()
  })
})
