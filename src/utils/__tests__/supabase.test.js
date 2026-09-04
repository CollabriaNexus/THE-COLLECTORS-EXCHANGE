import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreateClient = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}));

const envUrl = 'https://testproject.supabase.co';
const envKey = 'test-anon-key';

describe('supabase.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // supabase.js calls createClient at module scope, so the module has to be
    // re-evaluated for each case — otherwise the second import is served from
    // the module cache and createClient is never called again.
    vi.resetModules();
  });

  it('creates supabase client with URL and anon key from env vars', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', envUrl);
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', envKey);
    const mockClient = { auth: {}, storage: {} };
    mockCreateClient.mockReturnValue(mockClient);
    const mod = await import('../supabase');
    expect(mockCreateClient).toHaveBeenCalledWith(envUrl, envKey);
    expect(mod.supabase).toBe(mockClient);
    vi.unstubAllEnvs();
  });

  it('handles missing env vars gracefully', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', undefined);
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', undefined);
    mockCreateClient.mockReturnValue({ auth: {}, storage: {} });
    const mod = await import('../supabase');
    expect(mockCreateClient).toHaveBeenCalledWith(undefined, undefined);
    expect(mod.supabase).toBeDefined();
    vi.unstubAllEnvs();
  });
});
