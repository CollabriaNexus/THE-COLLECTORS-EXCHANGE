import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import Links from '../Links';

const renderLinks = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <Links />
      </MemoryRouter>
    </HelmetProvider>,
  );

describe('Links', () => {
  // The page used to start at h3, so it had no h1 and its outline began two
  // levels down.
  it('has a single h1', () => {
    renderLinks();
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(/the collectors exchange/i);
  });

  it('keeps the heading outline in order', () => {
    renderLinks();
    const levels = screen.getAllByRole('heading').map((h) => Number(h.tagName.replace('H', '')));
    expect(levels[0]).toBe(1);
    levels.slice(1).forEach((level, i) => {
      expect(level).toBeLessThanOrEqual(levels[i] + 1);
    });
  });

  it('renders the section groupings', () => {
    renderLinks();
    ['Company', 'Support', 'Legal', 'Connect'].forEach((name) => {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument();
    });
  });

  it('routes internal destinations client-side', () => {
    renderLinks();
    expect(screen.getByRole('link', { name: /our vision/i })).toHaveAttribute('href', '/vision');
    expect(screen.getByRole('link', { name: /^faq$/i })).toHaveAttribute('href', '/faq');
  });
});
