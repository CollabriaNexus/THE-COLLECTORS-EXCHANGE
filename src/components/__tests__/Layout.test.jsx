import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '../../test/utils';
import Layout from '../Layout';

// Layout renders <Header/>, which reads the cart/wishlist via react-query.
vi.mock('../../hooks/api/useCart', () => ({
  useCart: vi.fn(() => ({ data: [], isLoading: false })),
}));
vi.mock('../../hooks/api/useWishlist', () => ({
  useWishlist: vi.fn(() => ({ data: [], isLoading: false })),
}));
vi.mock('../../utils/storage', () => ({
  getUser: vi.fn(() => null),
}));

// The test supplies its own <Routes>, so let renderWithProviders own the
// router (Helmet + QueryClient come from the same wrapper).
const renderLayout = (child = <div>page content</div>) =>
  renderWithProviders(
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={child} />
      </Route>
    </Routes>,
  );

describe('Layout', () => {
  it('renders Header, Outlet and Footer', () => {
    renderLayout();
    expect(screen.getByText('page content')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders skip-to-content link', () => {
    renderLayout(<div />);
    expect(screen.getByRole('link', { name: /skip to main content/i })).toBeInTheDocument();
  });

  it('shows scroll-to-top button when scrolled', () => {
    renderLayout(<div style={{ height: '2000px' }} />);
    fireEvent.scroll(window, { target: { scrollY: 500 } });
    expect(screen.getByLabelText(/scroll to top/i)).toBeInTheDocument();
  });

  it('scrolls to top on button click', () => {
    // window.scrollTo is stubbed in src/test/setup.js (jsdom has no impl).
    renderLayout(<div />);
    fireEvent.scroll(window, { target: { scrollY: 500 } });
    fireEvent.click(screen.getByLabelText(/scroll to top/i));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
