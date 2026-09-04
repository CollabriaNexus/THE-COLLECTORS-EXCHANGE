import { vi, describe, it, expect, beforeEach } from 'vitest';

// apiClient now reads the LIVE Supabase session on every request instead of a
// static token from localStorage, and clears only the admin session state on a
// 401. Mock every export it actually imports.
const mockGetSession = vi.fn();

vi.mock('../../../utils/supabase', () => ({
  supabase: { auth: { getSession: mockGetSession } },
}));

vi.mock('../../../utils/storage', () => ({
  getAuthToken: vi.fn(),
  clearUser: vi.fn(),
  clearAuthToken: vi.fn(),
}));

import { clearUser, clearAuthToken } from '../../../utils/storage';

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null } });
    delete window.location;
    // The 401 handler reads location.pathname to avoid a redirect loop.
    window.location = { href: '', pathname: '/orders' };
    localStorage.clear();
  });

  it('creates an axios instance with the correct base URL', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.test.com/api');
    const mod = await import('../apiClient');
    expect(mod.default.defaults.baseURL).toBe('https://api.test.com/api');
    vi.unstubAllEnvs();
  });

  it('attaches Authorization header when a supabase session exists', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { access_token: 'test-token' } } });
    const mod = await import('../apiClient');
    const interceptor = mod.default.interceptors.request.handlers[0];
    const result = await interceptor.fulfilled({ headers: {} });
    expect(result.headers.Authorization).toBe('Bearer test-token');
  });

  it('does not attach Authorization header when there is no session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    const mod = await import('../apiClient');
    const interceptor = mod.default.interceptors.request.handlers[0];
    const result = await interceptor.fulfilled({ headers: {} });
    expect(result.headers.Authorization).toBeUndefined();
  });

  it('request interceptor rejects on error', async () => {
    const mod = await import('../apiClient');
    const interceptor = mod.default.interceptors.request.handlers[0];
    const err = new Error('Request error');
    await expect(interceptor.rejected(err)).rejects.toThrow('Request error');
  });

  it('response interceptor clears session state and redirects on 401', async () => {
    const mod = await import('../apiClient');
    const interceptor = mod.default.interceptors.response.handlers[0];
    const err = { response: { status: 401 } };
    await expect(interceptor.rejected(err)).rejects.toEqual(err);
    expect(clearUser).toHaveBeenCalled();
    expect(clearAuthToken).toHaveBeenCalled();
    expect(window.location.href).toBe('/login');
  });

  it('response interceptor does not redirect when already on /login', async () => {
    window.location = { href: '', pathname: '/login' };
    const mod = await import('../apiClient');
    const interceptor = mod.default.interceptors.response.handlers[0];
    const err = { response: { status: 401 } };
    await expect(interceptor.rejected(err)).rejects.toEqual(err);
    expect(clearUser).toHaveBeenCalled();
    expect(window.location.href).toBe('');
  });

  it('response interceptor passes through successful responses', async () => {
    const mod = await import('../apiClient');
    const interceptor = mod.default.interceptors.response.handlers[0];
    const response = { data: 'ok' };
    expect(interceptor.fulfilled(response)).toEqual(response);
  });

  it('response interceptor does not redirect on non-401 errors', async () => {
    const mod = await import('../apiClient');
    const interceptor = mod.default.interceptors.response.handlers[0];
    const err = { response: { status: 500 } };
    await expect(interceptor.rejected(err)).rejects.toEqual(err);
    expect(clearUser).not.toHaveBeenCalled();
  });
});
