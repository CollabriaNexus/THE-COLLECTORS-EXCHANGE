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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
