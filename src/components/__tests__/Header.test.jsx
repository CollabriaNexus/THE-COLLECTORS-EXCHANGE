import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, within, act } from '@testing-library/react';
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

const hamburger = () => screen.getByRole('button', { name: 'Toggle menu' });
const drawer = () => screen.queryByRole('dialog', { name: /navigation menu/i });

// The drawer stays mounted for its exit animation, then unmounts.
const flushDrawerExit = () =>
  act(() => {
    vi.advanceTimersByTime(400);
  });

describe('Header', () => {
  it('renders the logo', () => {
    renderHeader();
    // The wordmark appears in the mobile bar and the desktop bar (and, while
    // the drawer is open, in the drawer footer too).
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
    const menuBtn = hamburger();
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

  it('gives the mobile crest link an accessible name', () => {
    renderHeader();
    // The crest is an <img alt="">, so without an aria-label this is an
    // unnamed link at the very top of the tab order.
    expect(screen.getByRole('link', { name: /the collectors exchange — home/i })).toHaveAttribute(
      'href',
      '/',
    );
  });
});

describe('Header mobile drawer', () => {
  it('is not mounted at all while closed, so it cannot be tabbed into', () => {
    renderHeader();
    expect(drawer()).toBeNull();
    expect(screen.queryByRole('button', { name: 'Close menu' })).toBeNull();
    expect(screen.queryByRole('navigation', { name: /mobile menu/i })).toBeNull();
  });

  it('is a labelled modal dialog when open', () => {
    renderHeader();
    fireEvent.click(hamburger());
    const panel = drawer();
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveAttribute('aria-modal', 'true');
    // aria-modal is only defined on dialog/alertdialog — it used to be applied
    // permanently, and without role="dialog".
    expect(panel).toHaveAttribute('role', 'dialog');
    expect(within(panel).getByRole('navigation', { name: /mobile menu/i })).toBeInTheDocument();
  });

  it('moves focus into the drawer on open', () => {
    renderHeader();
    fireEvent.click(hamburger());
    const closeBtn = screen.getByRole('button', { name: 'Close menu' });
    expect(document.activeElement).toBe(closeBtn);
  });

  it('closes on Escape and returns focus to the hamburger', () => {
    renderHeader();
    const menuBtn = hamburger();
    fireEvent.click(menuBtn);
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(menuBtn);
  });

  it('returns focus to the hamburger when closed with the close button', () => {
    renderHeader();
    const menuBtn = hamburger();
    fireEvent.click(menuBtn);
    fireEvent.click(screen.getByRole('button', { name: 'Close menu' }));
    expect(document.activeElement).toBe(menuBtn);
  });

  it('cycles Tab within the drawer instead of escaping to the page behind', () => {
    renderHeader();
    fireEvent.click(hamburger());
    const panel = drawer();
    const focusables = Array.from(panel.querySelectorAll('a[href], button:not([disabled])'));
    expect(focusables.length).toBeGreaterThan(1);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it('locks body scroll while open and restores it on close', () => {
    renderHeader();
    expect(document.body.style.overflow).toBe('');
    fireEvent.click(hamburger());
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.body.style.overflow).toBe('');
  });

  it('unmounts the drawer once the exit animation has run', () => {
    vi.useFakeTimers();
    try {
      renderHeader();
      fireEvent.click(hamburger());
      expect(drawer()).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape' });
      // Still painted while animating out, but marked inert/aria-hidden.
      expect(drawer()).toBeNull();
      const closingPanel = document.querySelector('[role="dialog"]');
      expect(closingPanel).toHaveAttribute('aria-hidden', 'true');
      expect(closingPanel).toHaveAttribute('inert');

      flushDrawerExit();
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});
