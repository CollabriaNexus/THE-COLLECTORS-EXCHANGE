import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import GalleryArticle from '../GalleryArticle'

describe('GalleryArticle', () => {
  it('renders the article title', () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/gallery/article/art-of-time']}>
          <Routes>
            <Route path="/gallery/article/:slug" element={<GalleryArticle />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    )
    expect(screen.getByText(/art of time/i)).toBeInTheDocument()
  })

  it('renders article content', () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/gallery/article/art-of-time']}>
          <Routes>
            <Route path="/gallery/article/:slug" element={<GalleryArticle />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    )
    expect(screen.getByText(/horology/i)).toBeInTheDocument()
  })
})
