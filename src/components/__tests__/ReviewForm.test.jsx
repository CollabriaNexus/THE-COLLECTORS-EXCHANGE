import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ReviewForm from '../ReviewForm';

const mutation = {
  mutateAsync: vi.fn(),
  isPending: false,
  isSuccess: false,
  isError: false,
  error: null,
};

vi.mock('../../hooks/api/useReviews', () => ({
  useCreateReview: () => mutation,
}));

const renderForm = () =>
  render(<ReviewForm orderId="o1" productId="p1" productName="A pocket watch" />);

describe('ReviewForm star rating', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Five icon-only buttons with no name were announced as
  // "button, button, button, button, button".
  it('names every star button', () => {
    renderForm();
    expect(screen.getByRole('button', { name: '1 star' })).toBeInTheDocument();
    [2, 3, 4, 5].forEach((n) => {
      expect(screen.getByRole('button', { name: `${n} stars` })).toBeInTheDocument();
    });
  });

  it('exposes the selected rating with aria-pressed', () => {
    renderForm();
    const four = screen.getByRole('button', { name: '4 stars' });
    expect(four).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(four);
    expect(four).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '3 stars' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('groups the stars under a single accessible name', () => {
    renderForm();
    expect(screen.getByRole('group', { name: 'Rating' })).toBeInTheDocument();
  });

  it('names the comment field', () => {
    renderForm();
    expect(screen.getByLabelText(/your review/i)).toBeInTheDocument();
  });

  it('keeps the submit button disabled until a rating is chosen', () => {
    renderForm();
    const submit = screen.getByRole('button', { name: /submit review/i });
    expect(submit).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: '5 stars' }));
    expect(submit).not.toBeDisabled();
  });
});
