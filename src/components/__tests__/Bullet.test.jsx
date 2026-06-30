import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Bullet from '../Bullet'

describe('Bullet', () => {
  it('renders an SVG', () => {
    const { container } = render(<Bullet />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('applies className prop', () => {
    const { container } = render(<Bullet className="custom" />)
    expect(container.querySelector('.custom')).toBeInTheDocument()
  })
})
