import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QueryError from '../QueryError';

describe('QueryError', () => {
  it('renders as an alert with default, non-technical copy', () => {
    render(<QueryError />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByText(/we couldn't load this/i)).toBeInTheDocument();
    expect(screen.getByText(/slow or dropped connection/i)).toBeInTheDocument();
  });

  it('renders caller-supplied copy', () => {
    render(<QueryError title="We couldn't load these listings" message="Give it another try." />);
    expect(screen.getByText("We couldn't load these listings")).toBeInTheDocument();
    expect(screen.getByText('Give it another try.')).toBeInTheDocument();
  });

  it('calls onRetry when the retry button is pressed', () => {
    const onRetry = vi.fn();
    render(<QueryError onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('passes no arguments to onRetry (react-query refetch treats them as options)', () => {
    const onRetry = vi.fn();
    render(<QueryError onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledWith();
  });

  it('omits the button entirely when there is nothing to retry', () => {
    render(<QueryError />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('disables the button and switches copy while a retry is in flight', () => {
    const onRetry = vi.fn();
    render(<QueryError onRetry={onRetry} isRetrying />);
    const button = screen.getByRole('button', { name: /retrying/i });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onRetry).not.toHaveBeenCalled();
  });

  it('never leaks a raw error object to the shopper', () => {
    render(<QueryError />);
    expect(screen.getByRole('alert').textContent).not.toMatch(/error|status|500|axios|undefined/i);
  });

  it('supports a dark tone for placement on dark sections', () => {
    const { container } = render(<QueryError tone="dark" onRetry={vi.fn()} />);
    expect(container.firstChild.className).toContain('border-white/10');
  });
});
