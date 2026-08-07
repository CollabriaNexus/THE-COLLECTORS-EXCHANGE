import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // listings/products don't change second-to-second — serve cache first
      gcTime: 10 * 60 * 1000, // keep data 10 min so back-navigation is instant
      refetchOnWindowFocus: false, // avoid a refetch storm every time the tab regains focus
      retry: 1, // one retry, not the default 3 — fail fast instead of hanging
    },
  },
});

// The build-time prerender (scripts/prerender-blogs.mjs) bakes SEO tags
// directly into each page's static HTML shell for non-JS crawlers and first
// paint. react-helmet-async only manages tags it creates itself (marked
// data-rh) and won't remove these static ones, so without this cleanup every
// page ends up with duplicate meta description/OG/canonical/JSON-LD tags —
// one static (from the prerendered shell) and one dynamic (from Helmet).
// Crawlers reading "the first" instance of a tag would see stale content
// whenever the two disagree (e.g. filtered /category views). Strip the
// static ones before mount so Helmet's tags are the only ones left.
document
  .querySelectorAll(
    [
      'meta[name="description"]',
      'meta[name="keywords"]',
      'meta[name="robots"]',
      'meta[name="application-name"]',
      'meta[property^="og:"]',
      'meta[name^="twitter:"]',
      'link[rel="canonical"]',
      'script[type="application/ld+json"]',
    ].join(','),
  )
  .forEach((el) => el.remove());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
