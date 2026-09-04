import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import { renderWithProviders } from '../../test/utils';
import Contact from '../Contact';

vi.mock('../../hooks/api/apiClient', () => ({
  default: { post: vi.fn() },
}));

const renderContact = () => renderWithProviders(<Contact />);

const getForm = () => document.querySelector('form');

// The form fields are all `required`, so a bare click on the submit button is
// swallowed by constraint validation — fill everything in first.
const fillForm = () => {
  const form = getForm();
  const inputs = form.querySelectorAll('input');
  fireEvent.change(inputs[0], { target: { value: 'Test User' } });
  fireEvent.change(inputs[1], { target: { value: 'test@example.com' } });
  fireEvent.change(inputs[2], { target: { value: 'Hello' } });
  fireEvent.change(form.querySelector('textarea'), { target: { value: 'A message' } });
  return form;
};

describe('Contact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Contact Us heading', () => {
    renderContact();
    expect(screen.getByRole('heading', { level: 1, name: 'Contact Us' })).toBeInTheDocument();
  });

  it('renders info cards', () => {
    renderContact();
    // "Email" is both an info-card heading and a form label; match the heading.
    expect(screen.getByRole('heading', { name: 'Email' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Response Time' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Partnerships' })).toBeInTheDocument();
  });

  it('renders form with name field', () => {
    renderContact();
    expect(within(getForm()).getByText('Name')).toBeInTheDocument();
  });

  it('renders form with email field', () => {
    renderContact();
    expect(within(getForm()).getByText('Email')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    renderContact();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('submits form successfully', async () => {
    const apiClient = (await import('../../hooks/api/apiClient')).default;
    apiClient.post.mockResolvedValue({ data: { success: true } });
    renderContact();
    fireEvent.submit(fillForm());

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/contact', {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Hello',
        message: 'A message',
      });
    });
  });

  it('shows sent state', async () => {
    const apiClient = (await import('../../hooks/api/apiClient')).default;
    apiClient.post.mockResolvedValue({ data: { success: true } });
    renderContact();
    fireEvent.submit(fillForm());

    await waitFor(() => {
      expect(screen.getByText('Message Sent')).toBeInTheDocument();
    });
  });
});

describe('Contact accessibility', () => {
  it('associates every form control with a label', () => {
    renderContact();
    expect(screen.getByLabelText('Name')).toHaveAttribute('id', 'contact-name');
    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'contact-email');
    expect(screen.getByLabelText('Subject')).toHaveAttribute('id', 'contact-subject');
    expect(screen.getByLabelText('Message')).toHaveAttribute('id', 'contact-message');
  });

  it('sets autocomplete and input mode on the identity fields', () => {
    renderContact();
    expect(screen.getByLabelText('Name')).toHaveAttribute('autocomplete', 'name');
    const email = screen.getByLabelText('Email');
    expect(email).toHaveAttribute('autocomplete', 'email');
    expect(email).toHaveAttribute('inputmode', 'email');
  });

  // The three info cards used to be <h3>s sitting between the page <h1> and
  // the form's <h2>, so the outline read h1 -> h3 -> h2.
  it('keeps the heading outline in order', () => {
    renderContact();
    const levels = screen.getAllByRole('heading').map((h) => Number(h.tagName.replace('H', '')));
    expect(levels[0]).toBe(1);
    levels.slice(1).forEach((level, i) => {
      expect(level).toBeLessThanOrEqual(levels[i] + 1);
    });
  });

  it('returns home through the router rather than a full page load', async () => {
    const apiClient = (await import('../../hooks/api/apiClient')).default;
    apiClient.post.mockResolvedValue({ data: { success: true } });
    renderContact();
    fireEvent.submit(fillForm());

    await waitFor(() => {
      expect(screen.getByText('Message Sent')).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: /return home/i })).toHaveAttribute('href', '/');
  });
});
