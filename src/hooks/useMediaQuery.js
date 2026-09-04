import { useState, useEffect } from 'react';

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    // Guarded the same way as the lazy initializer above. Unreachable today
    // (effects need a DOM), but the deferred SSR/hydrateRoot work would make an
    // unguarded `window` here a crash rather than a graceful no-op.
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
