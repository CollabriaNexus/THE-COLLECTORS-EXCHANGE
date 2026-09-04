import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import { renderWithProviders } from '../../test/utils';
import { PRIMARY_NAV } from '../../config/seo-pages';
import Header from '../Header';

vi.mock('../../hooks/api/useCart', () => ({
  useCart: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock('../../hooks/api/useWishlist', () => ({
  useWishlist: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock('../../utils/storage', () => ({
  getUser: vi.fn(() => null),
}));

const renderHeader = () => renderWithProviders(<Header />);

describe('Header', () => {
  it('renders the logo', () => {
    renderHeader();
    // The wordmark appears in the mobile bar, the desktop bar and the drawer
    // footer — all three are in the DOM at once under jsdom.
    expect(screen.getAllByText(/the collectors exchange/i).length).toBeGreaterThan(0);
  });

  it('renders navigation links', () => {
    renderHeader();
    const nav = screen.getByRole('navigation', { name: /main navigation/i });
    // Driven by PRIMARY_NAV in src/config/seo-pages.js — assert against the
    // config rather than hardcoding, so nav additions/removals don't drift.
    PRIMARY_NAV.forEach((item) => {
      expect(within(nav).getByRole('link', { name: item.name })).toBeInTheDocument();
    });
  });

  it('renders cart icon with count', () => {
    renderHeader();
    expect(screen.getByLabelText(/cart/i)).toBeInTheDocument();
  });

  it('renders wishlist icon with count', () => {
    renderHeader();
    expect(screen.getByLabelText(/wishlist/i)).toBeInTheDocument();
  });

  it('toggles mobile menu', () => {
    renderHeader();
    // "Toggle menu", "Close menu" and "Navigation menu" all match /menu/i.
    const menuBtn = screen.getByRole('button', { name: 'Toggle menu' });
    expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(menuBtn);
    expect(menuBtn).toHaveAttribute('aria-expanded', 'true');
  });

  it('links to the account page when no user is signed in', () => {
    renderHeader();
    // The header has no dedicated "Login" link; signed-out users reach the
    // login screen through the Account entry point.
    const accountLinks = screen.getAllByRole('link', { name: /account/i });
    expect(accountLinks.length).toBeGreaterThan(0);
    accountLinks.forEach((link) => expect(link).toHaveAttribute('href', '/account'));
  });
});
