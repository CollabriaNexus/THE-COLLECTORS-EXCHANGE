import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn((url, key, opts) => ({ url, key, opts })),
}));

describe('supabase lib', () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_ANON_KEY;
  });

  it('throws when SUPABASE_URL is missing', async () => {
    await expect(async () => {
      await import('../../lib/supabase.js');
    }).rejects.toThrow('SUPABASE_URL');
  });

  it('exports supabaseAdmin as null when SERVICE_ROLE_KEY is missing', async () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    const mod = await import('../../lib/supabase.js');
    expect(mod.supabaseAdmin).toBeNull();
    expect(mod.supabaseAnon).toBeDefined();
  });

  it('creates supabaseAdmin when SERVICE_ROLE_KEY is present', async () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';
    const mod = await import('../../lib/supabase.js');
    expect(mod.supabaseAdmin).toBeDefined();
    expect(mod.supabaseAdmin.url).toBe('https://test.supabase.co');
    expect(mod.supabaseAdmin.key).toBe('service-key');
  });

  it('creates supabaseAnon with anon key', async () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'anon-key';
    const mod = await import('../../lib/supabase.js');
    expect(mod.supabaseAnon).toBeDefined();
    expect(mod.supabaseAnon.key).toBe('anon-key');
  });
});
