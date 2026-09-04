/**
 * Session helpers — the cached backend user record, kept in localStorage.
 *
 * THIS FILE MUST HAVE ZERO IMPORTS. That is the whole point of it existing.
 *
 * `Header.jsx` (and ProductCard, Home, Category — everything that renders for
 * an anonymous visitor) needs `getUser()` and nothing else. When these three
 * `localStorage` one-liners lived in `storage.js` next to the image-upload
 * helpers, the module-scope `import { supabase } from './supabase'` that those
 * uploads need dragged the entire `@supabase/supabase-js` client (GoTrue auth,
 * realtime, postgrest, storage) into the entry chunk of every page load — for
 * a visitor who may never sign in. Keeping this file import-free is what keeps
 * it out.
 *
 * `storage.js` re-exports these so existing importers keep working unchanged.
 */

export const STORAGE_KEYS = {
  USER: 'tce_user',
};

export const getUser = () => {
  const user = localStorage.getItem(STORAGE_KEYS.USER);
  return user ? JSON.parse(user) : null;
};

export const setUser = (userData) => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
};

export const clearUser = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};

/**
 * True when this browser has a persisted Supabase auth session.
 *
 * supabase-js persists under `sb-<project-ref>-auth-token` (see
 * `@supabase/supabase-js` — the key is built as
 * `` `sb-${baseUrl.hostname.split('.')[0]}-auth-token` ``). Probing localStorage
 * for that key lets a caller decide whether it is worth downloading the auth
 * client at all, WITHOUT importing it.
 *
 * Deliberately NOT keyed on `tce_user`: that record is only written once the
 * Account page has round-tripped the backend `registerUser` sync, and that very
 * request needs a bearer token. Gating on `tce_user` would strip the header off
 * the first authenticated call after login and break sign-in.
 */
export const hasStoredSupabaseSession = () => {
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) return true;
    }
  } catch {
    // Private mode / storage disabled: assume no session rather than throwing.
    return false;
  }
  return false;
};
