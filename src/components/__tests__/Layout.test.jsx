import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Layout from '../Layout'

describe('Layout', () => {
  it('renders Header, Outlet and Footer', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<div>page content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('page content')).toBeInTheDocument()
  })

  it('renders skip-to-content link', () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<div />} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
    const skipLink = screen.getByText(/skip to content/i)
    expect(skipLink).toBeInTheDocument()
  })

  it('shows scroll-to-top button when scrolled', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<div style={{ height: '2000px' }} />} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
    fireEvent.scroll(window, { target: { scrollY: 500 } })
    const topBtn = screen.getByLabelText(/scroll to top/i)
    expect(topBtn).toBeInTheDocument()
  })

  it('scrolls to top on button click', () => {
    window.scrollTo = vi.fn()
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<div />} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
    fireEvent.scroll(window, { target: { scrollY: 500 } })
    fireEvent.click(screen.getByLabelText(/scroll to top/i))
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })
})
