import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router-dom'
import AboutUs from '../AboutUs'

describe('AboutUs', () => {
  it('renders HeroManifesto with heading', () => {
    render(<HelmetProvider><MemoryRouter><AboutUs /></MemoryRouter></HelmetProvider>)
    expect(screen.getByText(/curating/i)).toBeInTheDocument()
  })

  it('renders MissionValues section', () => {
    render(<HelmetProvider><MemoryRouter><AboutUs /></MemoryRouter></HelmetProvider>)
    expect(screen.getByText(/our mission/i)).toBeInTheDocument()
  })

  it('renders Genesis section', () => {
    render(<HelmetProvider><MemoryRouter><AboutUs /></MemoryRouter></HelmetProvider>)
    expect(screen.getByText(/genesis/i)).toBeInTheDocument()
  })

  it('renders OdysseyTimeline section', () => {
    render(<HelmetProvider><MemoryRouter><AboutUs /></MemoryRouter></HelmetProvider>)
    expect(screen.getByText(/the odyssey/i)).toBeInTheDocument()
  })
})
