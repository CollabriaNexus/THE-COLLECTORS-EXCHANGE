import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockKohinoorImg = '/assets/kohinoor.webp'
const mockKohinoorHistImg = '/assets/kohinoor-hist.webp'
const mockTipuTigerImg = '/assets/tipu-tiger.jpg'
const mockFabergeEggImg = '/assets/faberge-egg.jpg'
const mockRosettaStoneImg = '/assets/rosetta-stone.avif'

vi.mock('../assets/kohinoor.webp', () => ({ default: '/assets/kohinoor.webp' }))
vi.mock('../assets/Kohinoor-OpIndia-e1684573231572.webp', () => ({ default: '/assets/kohinoor-hist.webp' }))
vi.mock("../assets/Tipu's Tiger.jpg", () => ({ default: '/assets/tipu-tiger.jpg' }))
vi.mock('../assets/Faberge_pearl_egg_gallery.jpg', () => ({ default: '/assets/faberge-egg.jpg' }))
vi.mock('../assets/rosetta-stone_gallery.avif', () => ({ default: '/assets/rosetta-stone.avif' }))

const GALLERY_STORAGE_KEY = 'the_collectors_exchange_gallery'

function getCuratorItems() {
  return [
    {
      id: 'kohinoor-history',
      title: 'The Koh-i-Noor Diamond',
      images: [mockKohinoorImg, mockKohinoorHistImg],
      theme: 'Indian Heritage',
    },
    {
      id: 'faberge-eggs',
      title: 'The Imperial Fabergé Eggs',
      images: [mockFabergeEggImg],
      theme: 'World Heritage',
    },
    {
      id: 'tipu-sultan-tiger',
      title: 'Tipu\'s Tiger',
      images: [mockTipuTigerImg],
      theme: 'Indian Heritage',
    },
    {
      id: 'rosseta-stone',
      title: 'The Rosetta Stone',
      images: [mockRosettaStoneImg],
      theme: 'World Heritage',
    },
  ]
}

describe('galleryStorage.js', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('getGalleryItems', () => {
    it('returns saved items from localStorage when they exist', async () => {
      const savedItems = [{ id: 'custom-1', title: 'Custom', theme: 'Custom Theme' }]
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(savedItems))
      const { getGalleryItems } = await import('../galleryStorage')
      const items = getGalleryItems()
      expect(items).toEqual(savedItems)
    })

    it('returns default curator items when localStorage is empty', async () => {
      const { getGalleryItems } = await import('../galleryStorage')
      const items = getGalleryItems()
      expect(items).toHaveLength(4)
      expect(items[0].id).toBe('kohinoor-history')
      expect(items[1].id).toBe('faberge-eggs')
    })
  })

  describe('getGalleryItemById', () => {
    it('returns the item when id matches', async () => {
      const { getGalleryItemById } = await import('../galleryStorage')
      const item = getGalleryItemById('kohinoor-history')
      expect(item).toBeDefined()
      expect(item.id).toBe('kohinoor-history')
      expect(item.title).toBe('The Koh-i-Noor Diamond')
    })

    it('returns undefined when id does not match any item', async () => {
      const { getGalleryItemById } = await import('../galleryStorage')
      const item = getGalleryItemById('nonexistent-id')
      expect(item).toBeUndefined()
    })

    it('returns undefined when id is null', async () => {
      const { getGalleryItemById } = await import('../galleryStorage')
      const item = getGalleryItemById(null)
      expect(item).toBeUndefined()
    })

    it('returns undefined when id is empty string', async () => {
      const { getGalleryItemById } = await import('../galleryStorage')
      const item = getGalleryItemById('')
      expect(item).toBeUndefined()
    })
  })

  describe('getGalleryItemsByTheme', () => {
    it('returns items matching the given theme', async () => {
      const { getGalleryItemsByTheme } = await import('../galleryStorage')
      const items = getGalleryItemsByTheme('Indian Heritage')
      expect(items).toHaveLength(2)
      expect(items.map(i => i.id)).toEqual(['kohinoor-history', 'tipu-sultan-tiger'])
    })

    it('returns empty array when no items match the theme', async () => {
      const { getGalleryItemsByTheme } = await import('../galleryStorage')
      const items = getGalleryItemsByTheme('European Art')
      expect(items).toEqual([])
    })

    it('returns empty array when theme is null', async () => {
      const { getGalleryItemsByTheme } = await import('../galleryStorage')
      const items = getGalleryItemsByTheme(null)
      expect(items).toEqual([])
    })

    it('returns empty array when theme is empty string', async () => {
      const { getGalleryItemsByTheme } = await import('../galleryStorage')
      const items = getGalleryItemsByTheme('')
      expect(items).toEqual([])
    })
  })

  describe('initializeStorage', () => {
    it('saves default curator items when localStorage is empty', async () => {
      await import('../galleryStorage')
      const saved = JSON.parse(localStorage.getItem(GALLERY_STORAGE_KEY))
      expect(saved).toHaveLength(4)
    })

    it('preserves saved items when they already exist and are up-to-date', async () => {
      const existingItems = getCuratorItems()
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(existingItems))
      await import('../galleryStorage')
      const saved = JSON.parse(localStorage.getItem(GALLERY_STORAGE_KEY))
      expect(saved).toEqual(existingItems)
    })

    it('updates kohinoor-history images when the first image is incorrect', async () => {
      const existingItems = getCuratorItems()
      existingItems[0].images = ['https://example.com/old.jpg', 'https://example.com/another.jpg']
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(existingItems))
      await import('../galleryStorage')
      const saved = JSON.parse(localStorage.getItem(GALLERY_STORAGE_KEY))
      const kohinoor = saved.find(i => i.id === 'kohinoor-history')
      expect(kohinoor.images[0]).toBe(mockKohinoorImg)
      expect(kohinoor.images[1]).toBe(mockKohinoorHistImg)
    })

    it('updates tipu-sultan-tiger images when the first image is incorrect', async () => {
      const existingItems = getCuratorItems()
      existingItems[2].images = ['https://example.com/old-tiger.jpg']
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(existingItems))
      await import('../galleryStorage')
      const saved = JSON.parse(localStorage.getItem(GALLERY_STORAGE_KEY))
      const tipu = saved.find(i => i.id === 'tipu-sultan-tiger')
      expect(tipu.images[0]).toBe(mockTipuTigerImg)
    })

    it('updates faberge-eggs images when the first image is incorrect', async () => {
      const existingItems = getCuratorItems()
      existingItems[1].images = ['https://example.com/old-faberge.jpg']
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(existingItems))
      await import('../galleryStorage')
      const saved = JSON.parse(localStorage.getItem(GALLERY_STORAGE_KEY))
      const faberge = saved.find(i => i.id === 'faberge-eggs')
      expect(faberge.images[0]).toBe(mockFabergeEggImg)
    })

    it('updates rosseta-stone images when the first image is incorrect', async () => {
      const existingItems = getCuratorItems()
      existingItems[3].images = ['https://example.com/old-rosetta.jpg']
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(existingItems))
      await import('../galleryStorage')
      const saved = JSON.parse(localStorage.getItem(GALLERY_STORAGE_KEY))
      const rosetta = saved.find(i => i.id === 'rosseta-stone')
      expect(rosetta.images[0]).toBe(mockRosettaStoneImg)
    })

    it('filters out unsplash and kohinoor references from additional images during update', async () => {
      const existingItems = getCuratorItems()
      existingItems[0].images = ['https://example.com/old.jpg', 'https://images.unsplash.com/old', '/assets/kohinoor-old.webp', 'https://valid.com/extra.jpg']
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(existingItems))
      await import('../galleryStorage')
      const saved = JSON.parse(localStorage.getItem(GALLERY_STORAGE_KEY))
      const kohinoor = saved.find(i => i.id === 'kohinoor-history')
      expect(kohinoor.images).toEqual([mockKohinoorImg, mockKohinoorHistImg, 'https://valid.com/extra.jpg'])
    })

    it('replaces empty images array for kohinoor with defaults', async () => {
      const existingItems = getCuratorItems()
      existingItems[0].images = []
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(existingItems))
      await import('../galleryStorage')
      const saved = JSON.parse(localStorage.getItem(GALLERY_STORAGE_KEY))
      const kohinoor = saved.find(i => i.id === 'kohinoor-history')
      expect(kohinoor.images[0]).toBe(mockKohinoorImg)
      expect(kohinoor.images[1]).toBe(mockKohinoorHistImg)
    })
  })
})
