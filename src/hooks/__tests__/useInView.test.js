import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, renderHook, act } from '@testing-library/react';

/**
 * useInView only wires up the IntersectionObserver when its ref is actually
 * attached to a DOM node — the effect runs once on mount and bails out if
 * `ref.current` is null. `renderHook` never attaches the ref to anything, and
 * assigning `result.current[0].current` afterwards + `rerender()` does not
 * re-run a `[]`-dep effect, so nothing was ever observed.
 *
 * This probe component attaches the ref during the commit phase, before
 * effects run, which is how the hook is used in real components.
 */
function makeProbe(useInView) {
  return function Probe({ options }) {
    const [ref, inView] = useInView(options);
    return React.createElement('div', {
      ref,
      'data-testid': 'probe',
      'data-inview': String(inView),
    });
  };
}

const inView = () =>
  document.querySelector('[data-testid="probe"]').getAttribute('data-inview') === 'true';

describe('useInView', () => {
  it('returns [ref, false] initially', async () => {
    const observe = vi.fn();
    const unobserve = vi.fn();
    const disconnect = vi.fn();
    global.IntersectionObserver = vi.fn(() => ({ observe, unobserve, disconnect }));

    const { useInView } = await import('../useInView');
    const { result } = renderHook(() => useInView());
    expect(result.current[0]).toBeDefined();
    expect(result.current[0].current).toBeNull();
    expect(result.current[1]).toBe(false);
  });

  it('calls observe with the ref element', async () => {
    const observe = vi.fn();
    global.IntersectionObserver = vi.fn(() => ({
      observe,
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    const { useInView } = await import('../useInView');
    const Probe = makeProbe(useInView);
    const { getByTestId } = render(React.createElement(Probe));
    expect(observe).toHaveBeenCalledWith(getByTestId('probe'));
  });

  it('sets inView to true when element becomes intersecting', async () => {
    let callback;
    global.IntersectionObserver = vi.fn((cb) => {
      callback = cb;
      return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
    });

    const { useInView } = await import('../useInView');
    const Probe = makeProbe(useInView);
    render(React.createElement(Probe));
    act(() => {
      callback([{ isIntersecting: true }]);
    });
    expect(inView()).toBe(true);
  });

  it('does not set inView when element is not intersecting', async () => {
    let callback;
    global.IntersectionObserver = vi.fn((cb) => {
      callback = cb;
      return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
    });

    const { useInView } = await import('../useInView');
    const Probe = makeProbe(useInView);
    render(React.createElement(Probe));
    act(() => {
      callback([{ isIntersecting: false }]);
    });
    expect(inView()).toBe(false);
  });

  it('disconnects observer on unmount', async () => {
    const disconnect = vi.fn();
    global.IntersectionObserver = vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect,
    }));

    const { useInView } = await import('../useInView');
    const Probe = makeProbe(useInView);
    const { unmount } = render(React.createElement(Probe));
    unmount();
    expect(disconnect).toHaveBeenCalled();
  });

  it('passes default threshold to IntersectionObserver', async () => {
    global.IntersectionObserver = vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    const { useInView } = await import('../useInView');
    const Probe = makeProbe(useInView);
    render(React.createElement(Probe));
    expect(IntersectionObserver).toHaveBeenCalledWith(expect.any(Function), {
      threshold: 0.15,
    });
  });

  it('merges custom options with default threshold', async () => {
    global.IntersectionObserver = vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    const { useInView } = await import('../useInView');
    const Probe = makeProbe(useInView);
    render(React.createElement(Probe, { options: { rootMargin: '10px' } }));
    expect(IntersectionObserver).toHaveBeenCalledWith(expect.any(Function), {
      threshold: 0.15,
      rootMargin: '10px',
    });
  });

  it('overrides threshold when provided in options', async () => {
    global.IntersectionObserver = vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    const { useInView } = await import('../useInView');
    const Probe = makeProbe(useInView);
    render(React.createElement(Probe, { options: { threshold: 0.5 } }));
    expect(IntersectionObserver).toHaveBeenCalledWith(expect.any(Function), {
      threshold: 0.5,
    });
  });

  it('handles null ref element gracefully', async () => {
    const observe = vi.fn();
    global.IntersectionObserver = vi.fn(() => ({
      observe,
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    const { useInView } = await import('../useInView');
    renderHook(() => useInView());
    expect(observe).not.toHaveBeenCalled();
  });
});
