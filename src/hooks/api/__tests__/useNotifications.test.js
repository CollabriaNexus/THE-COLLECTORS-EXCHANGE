import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}

vi.mock('../apiClient', () => ({
  default: mockApiClient,
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useNotifications', () => {
  let originalNotification
  let originalServiceWorkerDescriptor
  let originalPushManagerDescriptor

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    originalNotification = global.Notification
    originalServiceWorkerDescriptor = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker')
    originalPushManagerDescriptor = Object.getOwnPropertyDescriptor(window, 'PushManager')
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    global.Notification = originalNotification
    if (originalServiceWorkerDescriptor) {
      Object.defineProperty(navigator, 'serviceWorker', originalServiceWorkerDescriptor)
    } else {
      delete navigator.serviceWorker
    }
    if (originalPushManagerDescriptor) {
      Object.defineProperty(window, 'PushManager', originalPushManagerDescriptor)
    } else {
      delete window.PushManager
    }
    vi.unstubAllEnvs()
  })

  describe('useNotifications', () => {
    it('fetches notifications when enabled', async () => {
      const notifications = [{ id: 'n1', title: 'Test', message: 'Hello', read: false }]
      mockApiClient.get.mockResolvedValue({ data: notifications })
      const { useNotifications } = await import('../useNotifications')
      const { result } = renderHook(() => useNotifications(true), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(notifications)
      expect(mockApiClient.get).toHaveBeenCalledWith('/users/notifications')
    })

    it('does not fetch when disabled', async () => {
      const { useNotifications } = await import('../useNotifications')
      const { result } = renderHook(() => useNotifications(false), { wrapper: createWrapper() })
      expect(result.current.isFetching).toBe(false)
    })

    it('has retry set to false', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Fetch failed'))
      const { useNotifications } = await import('../useNotifications')
      const { result } = renderHook(() => useNotifications(true), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(result.current.failureCount).toBe(1)
    })

    it('shows browser notification when new unread notifications arrive and permission is granted', async () => {
      global.Notification = vi.fn()
      global.Notification.permission = 'granted'

      const initialNotifications = [{ id: 'old', title: 'Old', message: 'Old msg', read: true }]
      mockApiClient.get.mockResolvedValueOnce({ data: initialNotifications })
      const { useNotifications } = await import('../useNotifications')
      const { result } = renderHook(() => useNotifications(true), { wrapper: createWrapper() })
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
        expect(result.current.data).toHaveLength(1)
      })

      const newNotifications = [
        { id: 'new1', title: 'New Alert', message: 'You have a new message', read: false },
        { id: 'new2', title: 'Sale!', message: 'Your item sold', read: false },
        { id: 'old', title: 'Old', message: 'Old msg', read: true },
      ]
      mockApiClient.get.mockResolvedValueOnce({ data: newNotifications })
      result.current.refetch()
      await waitFor(() => {
        expect(result.current.data).toHaveLength(3)
        expect(global.Notification).toHaveBeenCalledTimes(2)
      })
      expect(global.Notification).toHaveBeenCalledWith('New Alert', expect.objectContaining({ body: 'You have a new message' }))
      expect(global.Notification).toHaveBeenCalledWith('Sale!', expect.objectContaining({ body: 'Your item sold' }))
    })

    it('does not show browser notification when Notification is not in window', async () => {
      delete global.Notification
      const notifications = [{ id: 'n1', title: 'T', message: 'M', read: false }]
      mockApiClient.get.mockResolvedValue({ data: notifications })
      const { useNotifications } = await import('../useNotifications')
      const { result } = renderHook(() => useNotifications(true), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(notifications)
    })

    it('does not show browser notification when permission is denied', async () => {
      global.Notification = vi.fn()
      global.Notification.permission = 'denied'
      const initialNotifications = [{ id: 'old', title: 'Old', message: 'Old msg', read: true }]
      mockApiClient.get.mockResolvedValueOnce({ data: initialNotifications })
      const { useNotifications } = await import('../useNotifications')
      const { result } = renderHook(() => useNotifications(true), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      const newNotifs = [{ id: 'new1', title: 'New', message: 'Msg', read: false }]
      mockApiClient.get.mockResolvedValueOnce({ data: newNotifs })
      result.current.refetch()
      await waitFor(() => expect(result.current.data).toHaveLength(1))
      expect(global.Notification).not.toHaveBeenCalled()
    })
  })

  describe('useMarkNotificationRead', () => {
    it('sends patch request to mark a single notification as read', async () => {
      mockApiClient.patch.mockResolvedValue({ data: { success: true } })
      const { useMarkNotificationRead } = await import('../useNotifications')
      const { result } = renderHook(() => useMarkNotificationRead(), { wrapper: createWrapper() })
      result.current.mutate('n1')
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockApiClient.patch).toHaveBeenCalledWith('/users/notifications/n1/read')
    })

    it('handles API error', async () => {
      mockApiClient.patch.mockRejectedValue(new Error('Mark read failed'))
      const { useMarkNotificationRead } = await import('../useNotifications')
      const { result } = renderHook(() => useMarkNotificationRead(), { wrapper: createWrapper() })
      result.current.mutate('n1')
      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useMarkAllNotificationsRead', () => {
    it('sends patch request to mark all notifications as read', async () => {
      mockApiClient.patch.mockResolvedValue({ data: { success: true } })
      const { useMarkAllNotificationsRead } = await import('../useNotifications')
      const { result } = renderHook(() => useMarkAllNotificationsRead(), { wrapper: createWrapper() })
      result.current.mutate()
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockApiClient.patch).toHaveBeenCalledWith('/users/notifications/read-all')
    })

    it('handles API error', async () => {
      mockApiClient.patch.mockRejectedValue(new Error('Mark all read failed'))
      const { useMarkAllNotificationsRead } = await import('../useNotifications')
      const { result } = renderHook(() => useMarkAllNotificationsRead(), { wrapper: createWrapper() })
      result.current.mutate()
      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('requestNotificationPermission', () => {
    it('returns false when Notification is not in window', async () => {
      delete global.Notification
      const { requestNotificationPermission } = await import('../useNotifications')
      const result = await requestNotificationPermission()
      expect(result).toBe(false)
    })

    it('returns true when permission is already granted', async () => {
      global.Notification = { permission: 'granted' }
      const { requestNotificationPermission } = await import('../useNotifications')
      const result = await requestNotificationPermission()
      expect(result).toBe(true)
    })

    it('returns false when permission is denied', async () => {
      global.Notification = { permission: 'denied' }
      const { requestNotificationPermission } = await import('../useNotifications')
      const result = await requestNotificationPermission()
      expect(result).toBe(false)
    })

    it('requests permission when not determined and returns granted result', async () => {
      global.Notification = {
        permission: 'default',
        requestPermission: vi.fn().mockResolvedValue('granted'),
      }
      const { requestNotificationPermission } = await import('../useNotifications')
      const result = await requestNotificationPermission()
      expect(result).toBe(true)
      expect(global.Notification.requestPermission).toHaveBeenCalled()
    })

    it('returns false when requestPermission returns denied', async () => {
      global.Notification = {
        permission: 'default',
        requestPermission: vi.fn().mockResolvedValue('denied'),
      }
      const { requestNotificationPermission } = await import('../useNotifications')
      const result = await requestNotificationPermission()
      expect(result).toBe(false)
    })
  })

  describe('usePushSubscription', () => {
    it('returns not supported message when serviceWorker is not in navigator', async () => {
      delete navigator.serviceWorker
      const { usePushSubscription } = await import('../useNotifications')
      const { result } = renderHook(() => usePushSubscription(), { wrapper: createWrapper() })
      result.current.mutate()
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ message: 'Push not supported' })
    })

    it('returns not supported message when PushManager is not in window', async () => {
      Object.defineProperty(navigator, 'serviceWorker', { value: {}, configurable: true, writable: true })
      delete window.PushManager
      const { usePushSubscription } = await import('../useNotifications')
      const { result } = renderHook(() => usePushSubscription(), { wrapper: createWrapper() })
      result.current.mutate()
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ message: 'Push not supported' })
    })

    it('returns not configured message when VAPID key is missing', async () => {
      vi.stubEnv('VITE_VAPID_PUBLIC_KEY', undefined)
      Object.defineProperty(navigator, 'serviceWorker', { value: {}, configurable: true, writable: true })
      window.PushManager = vi.fn()
      const { usePushSubscription } = await import('../useNotifications')
      const { result } = renderHook(() => usePushSubscription(), { wrapper: createWrapper() })
      result.current.mutate()
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ message: 'Push not configured: missing VAPID public key' })
      vi.unstubAllEnvs()
    })

    it('registers service worker and sends push subscription', async () => {
      vi.stubEnv('VITE_VAPID_PUBLIC_KEY', 'test-vapid-key')
      const mockSubscribe = vi.fn().mockResolvedValue({
        toJSON: () => ({ endpoint: 'https://push.example.com' }),
      })
      const mockPushManager = { subscribe: mockSubscribe }
      Object.defineProperty(navigator, 'serviceWorker', {
        value: { register: vi.fn().mockResolvedValue({ pushManager: mockPushManager }) },
        configurable: true, writable: true,
      })
      window.PushManager = vi.fn()
      mockApiClient.post.mockResolvedValue({ data: { subscribed: true } })
      const { usePushSubscription } = await import('../useNotifications')
      const { result } = renderHook(() => usePushSubscription(), { wrapper: createWrapper() })
      result.current.mutate()
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ subscribed: true })
      expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js')
      expect(mockSubscribe).toHaveBeenCalledWith({
        userVisibleOnly: true,
        applicationServerKey: expect.any(Uint8Array),
      })
      expect(mockApiClient.post).toHaveBeenCalledWith('/users/push-subscribe', { endpoint: 'https://push.example.com' })
      vi.unstubAllEnvs()
    })

    it('handles API error on push subscription', async () => {
      vi.stubEnv('VITE_VAPID_PUBLIC_KEY', 'test-vapid-key')
      Object.defineProperty(navigator, 'serviceWorker', {
        value: { register: vi.fn().mockResolvedValue({ pushManager: { subscribe: vi.fn().mockResolvedValue({ toJSON: () => ({}) }) } }) },
        configurable: true, writable: true,
      })
      window.PushManager = vi.fn()
      mockApiClient.post.mockRejectedValue(new Error('Push subscribe failed'))
      const { usePushSubscription } = await import('../useNotifications')
      const { result } = renderHook(() => usePushSubscription(), { wrapper: createWrapper() })
      result.current.mutate()
      await waitFor(() => expect(result.current.isError).toBe(true))
      vi.unstubAllEnvs()
    })
  })
})
