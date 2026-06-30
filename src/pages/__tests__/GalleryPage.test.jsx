import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router-dom'
import GalleryPage from '../GalleryPage'

vi.mock('../../utils/galleryStorage', () => ({
  getGalleryItems: vi.fn(() => [
    { id: 'kohinoor-history', title: 'Kohinoor', theme: 'Indian Heritage', teaser: 'A great diamond', images: ['img.jpg'] },
    { id: 'faberge-eggs', title: 'Faberge Egg', theme: 'World Heritage', teaser: 'A beautiful egg', images: ['img2.jpg'] }
  ])
}))

describe('GalleryPage', () => {
  it('renders gallery heading', () => {
    render(<HelmetProvider><MemoryRouter><GalleryPage /></MemoryRouter></HelmetProvider>)
    expect(screen.getByText(/curator/i)).toBeInTheDocument()
  })

  it('renders gallery theme cards', () => {
    render(<HelmetProvider><MemoryRouter><GalleryPage /></MemoryRouter></HelmetProvider>)
    expect(screen.getByText('Kohinoor')).toBeInTheDocument()
    expect(screen.getByText('Faberge Egg')).toBeInTheDocument()
  })

  it('renders theme sections', () => {
    render(<HelmetProvider><MemoryRouter><GalleryPage /></MemoryRouter></HelmetProvider>)
    expect(screen.getByText('Indian Heritage')).toBeInTheDocument()
    expect(screen.getByText('World Heritage')).toBeInTheDocument()
  })
})
