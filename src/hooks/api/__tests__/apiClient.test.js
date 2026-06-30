import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockAxiosCreate = vi.fn(() => ({
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('axios', () => ({
  default: {
    create: mockAxiosCreate,
  },
}))

const mockGetSession = vi.fn()
const mockRefreshSession = vi.fn()

vi.mock('../../../utils/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      refreshSession: mockRefreshSession,
    },
  },
}))

describe('apiClient', () => {
  let apiClientModule

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    localStorage.clear()
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api')
    apiClientModule = await import('../apiClient')
  })

  describe('client creation', () => {
    it('creates axios instance with correct config', async () => {
      expect(mockAxiosCreate).toHaveBeenCalledWith({
        baseURL: 'http://localhost:3000/api',
        timeout: 120000,
        headers: { 'Content-Type': 'application/json' },
      })
    })

    it('uses VITE_API_URL env var when provided', async () => {
      vi.resetModules()
      vi.stubEnv('VITE_API_URL', 'https://api.custom.com')
      await import('../apiClient')
      expect(mockAxiosCreate).toHaveBeenCalledWith(expect.objectContaining({
        baseURL: 'https://api.custom.com',
      }))
    })
  })

  describe('request interceptor', () => {
    function getRequestSuccessHandler() {
      const calls = mockAxiosCreate.mock.results
      for (const result of calls) {
        const instance = result.value
        if (instance.interceptors.request.use.mock.calls.length > 0) {
          return instance.interceptors.request.use.mock.calls[0][0]
        }
      }
      return null
    }

    function getRequestErrorHandler() {
      const calls = mockAxiosCreate.mock.results
      for (const result of calls) {
        const instance = result.value
        if (instance.interceptors.request.use.mock.calls.length > 0) {
          return instance.interceptors.request.use.mock.calls[0][1]
        }
      }
      return null
    }

    it('attaches auth token from session to request headers', async () => {
      mockGetSession.mockResolvedValue({ data: { session: { access_token: 'test-token' } } })
      const handler = getRequestSuccessHandler()
      const config = { headers: {} }
      const result = await handler(config)
      expect(result.headers.Authorization).toBe('Bearer test-token')
    })

    it('tries to refresh session when no existing session', async () => {
      mockGetSession.mockResolvedValue({ data: { session: null } })
      mockRefreshSession.mockResolvedValue({ data: { session: { access_token: 'refreshed-token' } } })
      const handler = getRequestSuccessHandler()
      const config = { headers: {} }
      const result = await handler(config)
      expect(mockRefreshSession).toHaveBeenCalled()
      expect(result.headers.Authorization).toBe('Bearer refreshed-token')
    })

    it('does not attach auth header when no session or refreshed session', async () => {
      mockGetSession.mockResolvedValue({ data: { session: null } })
      mockRefreshSession.mockResolvedValue({ data: { session: null } })
      const handler = getRequestSuccessHandler()
      const config = { headers: {} }
      const result = await handler(config)
      expect(result.headers.Authorization).toBeUndefined()
    })

    it('rejects on request interceptor error', async () => {
      const errorHandler = getRequestErrorHandler()
      const testError = new Error('Request failed')
      await expect(errorHandler(testError)).rejects.toThrow('Request failed')
    })
  })

  describe('response interceptor', () => {
    function getResponseSuccessHandler() {
      const calls = mockAxiosCreate.mock.results
      for (const result of calls) {
        const instance = result.value
        if (instance.interceptors.response.use.mock.calls.length > 0) {
          return instance.interceptors.response.use.mock.calls[0][0]
        }
      }
      return null
    }

    function getResponseErrorHandler() {
      const calls = mockAxiosCreate.mock.results
      for (const result of calls) {
        const instance = result.value
        if (instance.interceptors.response.use.mock.calls.length > 0) {
          return instance.interceptors.response.use.mock.calls[0][1]
        }
      }
      return null
    }

    it('returns response as-is on success', async () => {
      const handler = getResponseSuccessHandler()
      const response = { data: 'ok', status: 200 }
      expect(handler(response)).toBe(response)
    })

    it('removes tce_user from localStorage on 401 response', async () => {
      localStorage.setItem('tce_user', JSON.stringify({ id: 1 }))
      const handler = getResponseErrorHandler()
      const error = { response: { status: 401 } }
      await expect(handler(error)).rejects.toBe(error)
      expect(localStorage.getItem('tce_user')).toBeNull()
    })

    it('does not remove tce_user on non-401 errors', async () => {
      localStorage.setItem('tce_user', JSON.stringify({ id: 1 }))
      const handler = getResponseErrorHandler()
      const error = { response: { status: 500 } }
      await expect(handler(error)).rejects.toBe(error)
      expect(localStorage.getItem('tce_user')).toBeTruthy()
    })

    it('does not remove tce_user when no response status', async () => {
      localStorage.setItem('tce_user', JSON.stringify({ id: 1 }))
      const handler = getResponseErrorHandler()
      const error = { message: 'Network error' }
      await expect(handler(error)).rejects.toBe(error)
      expect(localStorage.getItem('tce_user')).toBeTruthy()
    })

    it('rejects the error after handling 401', async () => {
      localStorage.setItem('tce_user', JSON.stringify({ id: 1 }))
      const handler = getResponseErrorHandler()
      const error = { response: { status: 401 } }
      await expect(handler(error)).rejects.toBe(error)
    })
  })
})
