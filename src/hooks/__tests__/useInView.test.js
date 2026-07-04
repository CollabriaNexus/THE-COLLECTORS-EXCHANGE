import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

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
    const unobserve = vi.fn();
    const disconnect = vi.fn();
    global.IntersectionObserver = vi.fn(() => ({
      observe: (el) => {
        observe(el);
      },
      unobserve,
      disconnect,
    }));

    const { useInView } = await import('../useInView');
    let ref;
    function TestComponent() {
      const [r] = useInView();
      ref = r;
      return null;
    }
    const { rerender } = renderHook(() => TestComponent());
    const div = document.createElement('div');
    ref.current = div;
    rerender();
    expect(observe).toHaveBeenCalledWith(div);
  });

  it('sets inView to true when element becomes intersecting', async () => {
    let callback;
    global.IntersectionObserver = vi.fn((cb) => {
      callback = cb;
      return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
    });

    const { useInView } = await import('../useInView');
    let ref;
    function TestComponent() {
      const [r] = useInView();
      ref = r;
      return null;
    }
    const { result, rerender } = renderHook(() => TestComponent());
    const div = document.createElement('div');
    ref.current = div;
    rerender();
    act(() => {
      callback([{ isIntersecting: true }]);
    });
    expect(result.current[1]).toBe(true);
  });

  it('does not set inView when element is not intersecting', async () => {
    let callback;
    global.IntersectionObserver = vi.fn((cb) => {
      callback = cb;
      return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
    });

    const { useInView } = await import('../useInView');
    let ref;
    function TestComponent() {
      const [r] = useInView();
      ref = r;
      return null;
    }
    const { result, rerender } = renderHook(() => TestComponent());
    const div = document.createElement('div');
    ref.current = div;
    rerender();
    act(() => {
      callback([{ isIntersecting: false }]);
    });
    expect(result.current[1]).toBe(false);
  });

  it('disconnects observer on unmount', async () => {
    const disconnect = vi.fn();
    global.IntersectionObserver = vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect,
    }));

    const { useInView } = await import('../useInView');
    const { unmount } = renderHook(() => useInView());
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
    renderHook(() => useInView());
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
    renderHook(() => useInView({ rootMargin: '10px' }));
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
    renderHook(() => useInView({ threshold: 0.5 }));
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
