import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ToastProvider, useToast } from '../Toast'

vi.useFakeTimers()

const TestConsumer = () => {
  const showToast = useToast()
  return (
    <div>
      <button onClick={() => showToast('Success!', 'success')}>add success</button>
      <button onClick={() => showToast('Error!', 'error')}>add error</button>
      <button onClick={() => showToast('Info!', 'info')}>add info</button>
      <button onClick={() => showToast('Warning!', 'warning')}>add warning</button>
    </div>
  )
}

describe('Toast', () => {
  afterEach(() => {
    vi.clearAllTimers()
  })

  it('renders children', () => {
    render(<ToastProvider><div>child</div></ToastProvider>)
    expect(screen.getByText('child')).toBeInTheDocument()
  })

  it('adds and displays a toast', () => {
    render(<ToastProvider><TestConsumer /></ToastProvider>)
    fireEvent.click(screen.getByText('add success'))
    expect(screen.getByText('Success!')).toBeInTheDocument()
  })

  it('adds error toast', () => {
    render(<ToastProvider><TestConsumer /></ToastProvider>)
    fireEvent.click(screen.getByText('add error'))
    expect(screen.getByText('Error!')).toBeInTheDocument()
  })

  it('adds info toast', () => {
    render(<ToastProvider><TestConsumer /></ToastProvider>)
    fireEvent.click(screen.getByText('add info'))
    expect(screen.getByText('Info!')).toBeInTheDocument()
  })

  it('adds warning toast', () => {
    render(<ToastProvider><TestConsumer /></ToastProvider>)
    fireEvent.click(screen.getByText('add warning'))
    expect(screen.getByText('Warning!')).toBeInTheDocument()
  })

  it('auto-dismisses toast after duration', () => {
    render(<ToastProvider><TestConsumer /></ToastProvider>)
    fireEvent.click(screen.getByText('add success'))
    expect(screen.getByText('Success!')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(4200) })
    expect(screen.queryByText('Success!')).not.toBeInTheDocument()
  })

  it('closes toast on dismiss button click', () => {
    render(<ToastProvider><TestConsumer /></ToastProvider>)
    fireEvent.click(screen.getByText('add success'))
    const dismissBtn = screen.getByRole('button', { name: /close notification/i })
    fireEvent.click(dismissBtn)
    act(() => { vi.advanceTimersByTime(200) })
    expect(screen.queryByText('Success!')).not.toBeInTheDocument()
  })

  it('renders toast container with role alert', () => {
    render(<ToastProvider><TestConsumer /></ToastProvider>)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})

describe('useToast outside provider', () => {
  it('returns null when used outside provider', () => {
    const TestOutside = () => {
      const result = useToast()
      return <div data-testid="toast-value">{result === null ? 'null' : 'not-null'}</div>
    }
    render(<TestOutside />)
    expect(screen.getByTestId('toast-value').textContent).toBe('null')
  })
})
