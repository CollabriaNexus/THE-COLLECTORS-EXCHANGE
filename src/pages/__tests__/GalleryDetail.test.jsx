import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import GalleryDetail from '../GalleryDetail'

vi.mock('../../utils/galleryStorage', () => ({
  getGalleryItemById: vi.fn((id) => {
    if (id === 'kohinoor-history') {
      return {
        id: 'kohinoor-history',
        title: 'Koh-i-Noor Diamond',
        description: 'A famous diamond',
        images: ['img1.jpg', 'img2.jpg'],
        origin: 'India',
        timePeriod: '13th Century',
        institution: 'Tower of London'
      }
    }
    return null
  })
}))

describe('GalleryDetail', () => {
  it('renders item title when found', async () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/gallery/kohinoor-history']}>
          <Routes>
            <Route path="/gallery/:id" element={<GalleryDetail />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    )
    expect(await screen.findByText('Koh-i-Noor Diamond')).toBeInTheDocument()
  })

  it('renders item origin', async () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/gallery/kohinoor-history']}>
          <Routes>
            <Route path="/gallery/:id" element={<GalleryDetail />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    )
    expect(await screen.findByText(/India/)).toBeInTheDocument()
  })

  it('renders image navigation', async () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/gallery/kohinoor-history']}>
          <Routes>
            <Route path="/gallery/:id" element={<GalleryDetail />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    )
    const images = await screen.findAllByRole('img')
    expect(images.length).toBeGreaterThan(0)
  })
})
