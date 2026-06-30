import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('../../../utils/storage', () => ({
  getAuthToken: vi.fn(),
}));

import { getAuthToken } from '../../../utils/storage';

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete window.location;
    window.location = { href: '' };
    localStorage.clear();
  });

  it('creates an axios instance with the correct base URL', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.test.com/api');
    const mod = await import('../apiClient');
    expect(mod.default.defaults.baseURL).toBe('https://api.test.com/api');
    vi.unstubAllEnvs();
  });

  it('attaches Authorization header when token exists', async () => {
    getAuthToken.mockReturnValue('test-token');
    const mod = await import('../apiClient');
    const interceptor = mod.default.interceptors.request.handlers[0];
    const config = { headers: {} };
    const result = interceptor.fulfilled(config);
    expect(result.headers.Authorization).toBe('Bearer test-token');
  });

  it('does not attach Authorization header when no token', async () => {
    getAuthToken.mockReturnValue(null);
    const mod = await import('../apiClient');
    const interceptor = mod.default.interceptors.request.handlers[0];
    const config = { headers: {} };
    const result = interceptor.fulfilled(config);
    expect(result.headers.Authorization).toBeUndefined();
  });

  it('request interceptor rejects on error', async () => {
    const mod = await import('../apiClient');
    const interceptor = mod.default.interceptors.request.handlers[0];
    const err = new Error('Request error');
    await expect(interceptor.rejected(err)).rejects.toThrow('Request error');
  });

  it('response interceptor clears storage and redirects on 401', async () => {
    const mod = await import('../apiClient');
    const interceptor = mod.default.interceptors.response.handlers[0];
    localStorage.setItem('tce_admin_user', 'test');
    const err = { response: { status: 401 } };
    await expect(interceptor.rejected(err)).rejects.toEqual(err);
    expect(localStorage.getItem('tce_admin_user')).toBeNull();
    expect(window.location.href).toBe('/login');
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
  });
});
