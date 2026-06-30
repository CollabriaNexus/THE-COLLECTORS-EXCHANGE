import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('gtag.js', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
    delete window.gtag
  })

  describe('pageview', () => {
    it('calls window.gtag with config and measurement ID when gtag exists', async () => {
      const mockGtag = vi.fn()
      window.gtag = mockGtag
      const { pageview } = await import('../gtag')
      pageview('/home')
      expect(mockGtag).toHaveBeenCalledWith('config', 'G-MFQBH0YJ0K', { page_path: '/home' })
    })

    it('does not throw when window.gtag is not defined', async () => {
      const { pageview } = await import('../gtag')
      expect(() => pageview('/about')).not.toThrow()
    })

    it('handles undefined path gracefully', async () => {
      window.gtag = vi.fn()
      const { pageview } = await import('../gtag')
      pageview(undefined)
      expect(window.gtag).toHaveBeenCalledWith('config', 'G-MFQBH0YJ0K', { page_path: undefined })
    })
  })

  describe('event', () => {
    it('calls window.gtag with event data when gtag exists', async () => {
      const mockGtag = vi.fn()
      window.gtag = mockGtag
      const { event } = await import('../gtag')
      event({ action: 'click', category: 'button', label: 'signup', value: 1 })
      expect(mockGtag).toHaveBeenCalledWith('event', 'click', {
        event_category: 'button',
        event_label: 'signup',
        value: 1,
      })
    })

    it('does not throw when window.gtag is not defined', async () => {
      const { event } = await import('../gtag')
      expect(() => event({ action: 'test' })).not.toThrow()
    })

    it('handles partial event properties gracefully', async () => {
      window.gtag = vi.fn()
      const { event } = await import('../gtag')
      event({ action: 'purchase' })
      expect(window.gtag).toHaveBeenCalledWith('event', 'purchase', {
        event_category: undefined,
        event_label: undefined,
        value: undefined,
      })
    })

    it('handles missing action gracefully', async () => {
      window.gtag = vi.fn()
      const { event } = await import('../gtag')
      event({})
      expect(window.gtag).toHaveBeenCalledWith('event', undefined, {
        event_category: undefined,
        event_label: undefined,
        value: undefined,
      })
    })

    it('throws TypeError when event parameter is null due to destructuring', async () => {
      window.gtag = vi.fn()
      const { event } = await import('../gtag')
      expect(() => event(null)).toThrow(TypeError)
    })
  })

  it('uses custom GA_MEASUREMENT_ID from env when provided', async () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-CUSTOM')
    vi.resetModules()
    window.gtag = vi.fn()
    const { pageview } = await import('../gtag')
    pageview('/')
    expect(window.gtag).toHaveBeenCalledWith('config', 'G-CUSTOM', { page_path: '/' })
    vi.unstubAllEnvs()
  })
})
