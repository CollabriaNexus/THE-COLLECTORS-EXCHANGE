import { describe, it, expect, vi, beforeEach } from 'vitest'
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

describe('useUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useUser', () => {
    it('fetches a user profile by id', async () => {
      const user = { id: 'user-1', name: 'John', email: 'john@test.com' }
      mockApiClient.get.mockResolvedValue({ data: user })
      const { useUser } = await import('../useUser')
      const { result } = renderHook(() => useUser('user-1'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(user)
      expect(mockApiClient.get).toHaveBeenCalledWith('/users/user-1')
    })

    it('does not fetch when id is empty string', async () => {
      const { useUser } = await import('../useUser')
      const { result } = renderHook(() => useUser(''), { wrapper: createWrapper() })
      expect(result.current.isFetching).toBe(false)
    })

    it('does not fetch when id is null', async () => {
      const { useUser } = await import('../useUser')
      const { result } = renderHook(() => useUser(null), { wrapper: createWrapper() })
      expect(result.current.isFetching).toBe(false)
    })

    it('handles API error', async () => {
      mockApiClient.get.mockRejectedValue(new Error('User not found'))
      const { useUser } = await import('../useUser')
      const { result } = renderHook(() => useUser('nonexistent'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useMe', () => {
    it('fetches the current authenticated user from /users/me', async () => {
      const me = { id: 'user-1', name: 'Me', email: 'me@test.com' }
      mockApiClient.get.mockResolvedValue({ data: me })
      const { useMe } = await import('../useUser')
      const { result } = renderHook(() => useMe(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(me)
      expect(mockApiClient.get).toHaveBeenCalledWith('/users/me')
    })

    it('has retry set to false', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Auth required'))
      const { useMe } = await import('../useUser')
      const { result } = renderHook(() => useMe(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(result.current.failureCount).toBe(1)
    })
  })

  describe('useRegisterUser', () => {
    it('sends post request with user data to register', async () => {
      const userData = { email: 'new@test.com', password: 'secret' }
      mockApiClient.post.mockResolvedValue({ data: { id: 'new-user', ...userData } })
      const { useRegisterUser } = await import('../useUser')
      const { result } = renderHook(() => useRegisterUser(), { wrapper: createWrapper() })
      result.current.mutate(userData)
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockApiClient.post).toHaveBeenCalledWith('/users/register', userData)
    })

    it('handles API error on register', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Email already exists'))
      const { useRegisterUser } = await import('../useUser')
      const { result } = renderHook(() => useRegisterUser(), { wrapper: createWrapper() })
      result.current.mutate({ email: 'existing@test.com' })
      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useSubmitKyc', () => {
    it('sends post request with KYC data', async () => {
      const kycData = { documentType: 'passport', documentUrl: 'https://example.com/doc.pdf' }
      mockApiClient.post.mockResolvedValue({ data: { status: 'pending' } })
      const { useSubmitKyc } = await import('../useUser')
      const { result } = renderHook(() => useSubmitKyc(), { wrapper: createWrapper() })
      result.current.mutate({ kycData })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockApiClient.post).toHaveBeenCalledWith('/users/kyc', { kycData })
    })

    it('handles API error on KYC submit', async () => {
      mockApiClient.post.mockRejectedValue(new Error('KYC submission failed'))
      const { useSubmitKyc } = await import('../useUser')
      const { result } = renderHook(() => useSubmitKyc(), { wrapper: createWrapper() })
      result.current.mutate({ kycData: {} })
      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useUpdateProfile', () => {
    it('sends patch request with profile data', async () => {
      const profileData = { name: 'Updated Name', bio: 'Collector' }
      mockApiClient.patch.mockResolvedValue({ data: { ...profileData } })
      const { useUpdateProfile } = await import('../useUser')
      const { result } = renderHook(() => useUpdateProfile(), { wrapper: createWrapper() })
      result.current.mutate(profileData)
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockApiClient.patch).toHaveBeenCalledWith('/users/me', profileData)
    })

    it('handles API error on profile update', async () => {
      mockApiClient.patch.mockRejectedValue(new Error('Update failed'))
      const { useUpdateProfile } = await import('../useUser')
      const { result } = renderHook(() => useUpdateProfile(), { wrapper: createWrapper() })
      result.current.mutate({})
      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })
})
