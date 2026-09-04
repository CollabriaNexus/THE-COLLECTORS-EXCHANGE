import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import FAQ from '../FAQ';

describe('FAQ', () => {
  it('renders FAQ title', () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <FAQ />
        </MemoryRouter>
      </HelmetProvider>,
    );
    expect(
      screen.getByRole('heading', { level: 1, name: /frequently asked questions/i }),
    ).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <FAQ />
        </MemoryRouter>
      </HelmetProvider>,
    );
    const searchInput = screen.getByPlaceholderText(/search/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('filters questions by search', () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <FAQ />
        </MemoryRouter>
      </HelmetProvider>,
    );
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'shipping' } });
    expect(searchInput.value).toBe('shipping');
  });

  it('renders accordion items with questions', () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <FAQ />
        </MemoryRouter>
      </HelmetProvider>,
    );
    expect(screen.getByText(/how do i purchase/i)).toBeInTheDocument();
  });
});

const renderFAQ = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <FAQ />
      </MemoryRouter>
    </HelmetProvider>,
  );

describe('FAQ accessibility', () => {
  it('labels the search input', () => {
    renderFAQ();
    expect(screen.getByLabelText(/search frequently asked questions/i)).toBeInTheDocument();
  });

  it('exposes the accordion trigger as expandable', () => {
    renderFAQ();
    const trigger = screen.getByRole('button', { name: /how do i purchase/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    const panelId = trigger.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();
    expect(document.getElementById(panelId)).toBeTruthy();

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('reveals the answer only once expanded', () => {
    renderFAQ();
    const trigger = screen.getByRole('button', { name: /how do i purchase/i });
    const panel = document.getElementById(trigger.getAttribute('aria-controls'));
    expect(panel).toHaveAttribute('hidden');
    fireEvent.click(trigger);
    expect(panel).not.toHaveAttribute('hidden');
  });

  // `filtered` drops empty categories, so a no-match search used to render
  // nothing at all: no message and no way back.
  it('shows an empty state with a way to clear a no-match search', () => {
    renderFAQ();
    const searchInput = screen.getByLabelText(/search frequently asked questions/i);
    fireEvent.change(searchInput, { target: { value: 'zzzznotathing' } });

    expect(screen.getByRole('status')).toHaveTextContent(/no answers matched/i);
    fireEvent.click(screen.getByRole('button', { name: /clear search/i }));

    expect(searchInput.value).toBe('');
    expect(screen.getByText(/how do i purchase/i)).toBeInTheDocument();
  });

  it('keeps the open answer attached to its own question across a search', () => {
    renderFAQ();
    // Open a question in the last category, then filter away the earlier
    // categories. Index-based keys used to hand the open state to whatever
    // question happened to land at that index afterwards.
    const trigger = screen.getByRole('button', { name: /how are items shipped/i });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.change(screen.getByLabelText(/search frequently asked questions/i), {
      target: { value: 'shipped' },
    });
    expect(screen.getByRole('button', { name: /how are items shipped/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('routes the Contact Us call to action client-side', () => {
    renderFAQ();
    expect(screen.getByRole('link', { name: /contact us/i })).toHaveAttribute('href', '/contact');
  });
});
