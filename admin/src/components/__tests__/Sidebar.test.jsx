import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../Sidebar';

describe('Sidebar', () => {
  it('renders all navigation items', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Sidebar />
      </MemoryRouter>,
    );
    expect(screen.getByText('TCE ADMIN')).toBeInTheDocument();
    expect(screen.getByText('Management Portal')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('KYC Requests')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Vendors')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('TCE Store')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Payouts')).toBeInTheDocument();
    expect(screen.getByText('Testimonials')).toBeInTheDocument();
    expect(screen.getByText('Phone Verification')).toBeInTheDocument();
  });

  it('highlights the active route for "/"', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Sidebar />
      </MemoryRouter>,
    );
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink.className).toContain('bg-luxury-gold');
  });

  it('highlights sub-route like "/products/123"', () => {
    render(
      <MemoryRouter initialEntries={['/products/123']}>
        <Sidebar />
      </MemoryRouter>,
    );
    const productsLink = screen.getByText('Products').closest('a');
    expect(productsLink.className).toContain('bg-luxury-gold');
  });

  it('does not highlight root route for non-root paths', () => {
    render(
      <MemoryRouter initialEntries={['/users']}>
        <Sidebar />
      </MemoryRouter>,
    );
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink.className).not.toContain('bg-luxury-gold');
  });

  it('renders all nav links with correct hrefs', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Sidebar />
      </MemoryRouter>,
    );
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText('KYC Requests').closest('a')).toHaveAttribute('href', '/kyc');
    expect(screen.getByText('Users').closest('a')).toHaveAttribute('href', '/users');
    expect(screen.getByText('Vendors').closest('a')).toHaveAttribute('href', '/vendors');
    expect(screen.getByText('Products').closest('a')).toHaveAttribute('href', '/products');
    expect(screen.getByText('TCE Store').closest('a')).toHaveAttribute('href', '/tce-store');
    expect(screen.getByText('Orders').closest('a')).toHaveAttribute('href', '/orders');
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText('Payouts').closest('a')).toHaveAttribute('href', '/payouts');
    expect(screen.getByText('Testimonials').closest('a')).toHaveAttribute('href', '/testimonials');
    expect(screen.getByText('Phone Verification').closest('a')).toHaveAttribute(
      'href',
      '/phone-verifications',
    );
  });

  it('shows copyright footer', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Sidebar />
      </MemoryRouter>,
    );
    expect(screen.getByText('© 2026 The Collectors Exchange')).toBeInTheDocument();
  });
});
