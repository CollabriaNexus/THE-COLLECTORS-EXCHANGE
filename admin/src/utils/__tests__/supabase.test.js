import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

const mockCreateClient = vi.fn(() => ({ auth: {}, storage: {} }));

vi.mock('@supabase/supabase-js', () => ({
  createClient: (...args) => mockCreateClient(...args),
}));

describe('supabase.js', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('throws an error when VITE_SUPABASE_URL is missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key');
    await expect(() => import('../supabase')).rejects.toThrow('Missing Supabase environment variables');
  });

  it('throws an error when VITE_SUPABASE_ANON_KEY is missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    await expect(() => import('../supabase')).rejects.toThrow('Missing Supabase environment variables');
  });

  it('throws when both env vars are missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    await expect(() => import('../supabase')).rejects.toThrow('Missing Supabase environment variables');
  });

  it('creates a supabase client when both env vars are present', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
    const mod = await import('../supabase');
    expect(mockCreateClient).toHaveBeenCalledWith('https://test.supabase.co', 'test-anon-key');
    expect(mod.supabase).toBeDefined();
  });
});
