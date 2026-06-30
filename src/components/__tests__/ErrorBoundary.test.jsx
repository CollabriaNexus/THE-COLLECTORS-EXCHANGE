import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorBoundary from '../ErrorBoundary'

const ProblemChild = () => { throw new Error('test error') }

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('renders children when no error', () => {
    render(<ErrorBoundary><div>safe child</div></ErrorBoundary>)
    expect(screen.getByText('safe child')).toBeInTheDocument()
  })

  it('renders fallback UI on error', () => {
    render(<ErrorBoundary><ProblemChild /></ErrorBoundary>)
    expect(screen.getByText(/unexpected error/i)).toBeInTheDocument()
    expect(screen.getByText(/reload page/i)).toBeInTheDocument()
  })

  it('reloads page on button click', () => {
    const reload = vi.fn()
    Object.defineProperty(window, 'location', { value: { reload }, writable: true })
    render(<ErrorBoundary><ProblemChild /></ErrorBoundary>)
    fireEvent.click(screen.getByRole('button'))
    expect(reload).toHaveBeenCalled()
  })
})
