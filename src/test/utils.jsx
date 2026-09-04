import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Build a QueryClient tuned for tests: no retries, no caching between tests,
 * no background refetching. Every call returns a fresh client so state never
 * leaks from one test into the next.
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
}

/**
 * Wrap a tree in the providers the real app mounts under.
 *
 * Almost every page/component in this app touches at least one of:
 *  - react-query (`useCart`, `useProducts`, ...) -> QueryClientProvider
 *  - `<SEO />` / `<Helmet>`                      -> HelmetProvider
 *  - `<Link>` / `useNavigate`                    -> Router
 *
 * Without them the component throws before rendering anything ("No QueryClient
 * set", or helmet-async's "Cannot read properties of undefined (reading 'add')").
 *
 * Options:
 *   route          initial URL for the MemoryRouter (default '/')
 *   routerEntries  full initialEntries array (overrides `route`)
 *   router         set false when the caller supplies its own router
 *   queryClient    reuse a specific client (e.g. to seed data)
 */
export function renderWithProviders(ui, options = {}) {
  const {
    route = '/',
    routerEntries,
    router = true,
    queryClient = createTestQueryClient(),
    ...renderOptions
  } = options;

  const Wrapper = ({ children }) => {
    const withRouter = router ? (
      <MemoryRouter initialEntries={routerEntries ?? [route]}>{children}</MemoryRouter>
    ) : (
      children
    );
    return (
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>{withRouter}</QueryClientProvider>
      </HelmetProvider>
    );
  };

  return { queryClient, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
