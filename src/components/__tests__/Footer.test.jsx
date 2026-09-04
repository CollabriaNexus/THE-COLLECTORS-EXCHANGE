import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from '../Footer';

describe('Footer', () => {
  it('renders the footer', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    expect(screen.getByText(/the collectors exchange/i)).toBeInTheDocument();
  });

  it('renders the link column headings', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    // The columns are Company / Support / Legal — there is no "Quick Links".
    expect(screen.getByRole('heading', { name: 'Company' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Support' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Legal' })).toBeInTheDocument();
  });

  it('renders contact details', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    // "Contact Us" is both a label in the brand block and a link in Support,
    // so match the link specifically.
    expect(screen.getByRole('link', { name: 'Contact Us' })).toHaveAttribute('href', '/contact');
    expect(screen.getByText('support@thecollectorsexchange.in')).toBeInTheDocument();
  });

  it('renders social media links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText(/instagram/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/facebook/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/linkedin/i)).toBeInTheDocument();
  });

  it('renders copyright notice', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument();
  });
});
