import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import Vision from '../Vision';

describe('Vision', () => {
  it('renders Our Vision heading', () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <Vision />
        </MemoryRouter>
      </HelmetProvider>,
    );
    // "Our vision" also appears in several body paragraphs — target the h1.
    expect(screen.getByRole('heading', { level: 1, name: /our vision/i })).toBeInTheDocument();
  });

  it('renders collective purpose badge', () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <Vision />
        </MemoryRouter>
      </HelmetProvider>,
    );
    expect(screen.getByText(/collective purpose/i)).toBeInTheDocument();
  });

  it('renders the vision statement', () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <Vision />
        </MemoryRouter>
      </HelmetProvider>,
    );
    expect(screen.getByText(/restore integrity/i)).toBeInTheDocument();
  });
});
