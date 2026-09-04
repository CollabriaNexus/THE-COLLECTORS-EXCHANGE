import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

const ProblemChild = () => {
  throw new Error('test error');
};

const RELOAD_KEY = 'tce_error_reload_at';

describe('ErrorBoundary', () => {
  let originalLocation;

  const stubReload = () => {
    const reload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, reload },
      writable: true,
      configurable: true,
    });
    return reload;
  };

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    originalLocation = window.location;
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.sessionStorage.clear();
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>safe child</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('safe child')).toBeInTheDocument();
  });

  // First crash: auto-reload is the recovery path for transient failures (a
  // stale chunk after a deploy), so nothing is rendered - the page is going away.
  it('reloads once and renders nothing on the first error', () => {
    const reload = stubReload();
    const { container } = render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>,
    );
    expect(reload).toHaveBeenCalledTimes(1);
    expect(container).toBeEmptyDOMElement();
  });

  // The regression guard: before the cooldown existed, a deterministic error
  // reloaded straight back into itself forever on a blank page.
  it('does not reload again when it crashes right after a reload', () => {
    window.sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    const reload = stubReload();

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>,
    );

    expect(reload).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('offers a way out when it gives up', () => {
    window.sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    stubReload();

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go home/i })).toHaveAttribute('href', '/');
  });

  // A stale marker must not permanently disable auto-recovery.
  it('reloads again once the cooldown has passed', () => {
    window.sessionStorage.setItem(RELOAD_KEY, String(Date.now() - 60_000));
    const reload = stubReload();

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>,
    );

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('still reloads when sessionStorage is unavailable', () => {
    vi.spyOn(window.sessionStorage, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    vi.spyOn(window.sessionStorage, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });
    const reload = stubReload();

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>,
    );

    expect(reload).toHaveBeenCalledTimes(1);
  });
});
