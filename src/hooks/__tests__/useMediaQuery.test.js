import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

describe('useMediaQuery', () => {
  let addEventListenerSpy;
  let removeEventListenerSpy;
  let mockMatchMedia;

  beforeEach(() => {
    addEventListenerSpy = vi.fn();
    removeEventListenerSpy = vi.fn();
    mockMatchMedia = vi.fn();
    window.matchMedia = mockMatchMedia;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when the media query matches initially', async () => {
    mockMatchMedia.mockReturnValue({
      matches: true,
      addEventListener: addEventListenerSpy,
      removeEventListener: removeEventListenerSpy,
    });
    const { useMediaQuery } = await import('../useMediaQuery');
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('returns false when the media query does not match initially', async () => {
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: addEventListenerSpy,
      removeEventListener: removeEventListenerSpy,
    });
    const { useMediaQuery } = await import('../useMediaQuery');
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);
  });

  it('updates matches when the media query change event fires', async () => {
    let changeHandler = null;
    addEventListenerSpy.mockImplementation((event, handler) => {
      changeHandler = handler;
    });
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: addEventListenerSpy,
      removeEventListener: removeEventListenerSpy,
    });
    const { useMediaQuery } = await import('../useMediaQuery');
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);
    act(() => {
      changeHandler({ matches: true });
    });
    expect(result.current).toBe(true);
  });

  it('removes event listener on unmount', async () => {
    let changeHandler = null;
    addEventListenerSpy.mockImplementation((event, handler) => {
      changeHandler = handler;
    });
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: addEventListenerSpy,
      removeEventListener: removeEventListenerSpy,
    });
    const { useMediaQuery } = await import('../useMediaQuery');
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('change', changeHandler);
  });

  it('queries the correct media query string', async () => {
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: addEventListenerSpy,
      removeEventListener: removeEventListenerSpy,
    });
    const { useMediaQuery } = await import('../useMediaQuery');
    renderHook(() => useMediaQuery('(max-width: 600px)'));
    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 600px)');
  });

  it('re-registers listener when query changes', async () => {
    let firstHandler = null;
    let secondHandler = null;
    addEventListenerSpy
      .mockImplementationOnce((event, handler) => {
        firstHandler = handler;
      })
      .mockImplementationOnce((event, handler) => {
        secondHandler = handler;
      });
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: addEventListenerSpy,
      removeEventListener: removeEventListenerSpy,
    });
    const { useMediaQuery } = await import('../useMediaQuery');
    const { rerender } = renderHook(({ query }) => useMediaQuery(query), {
      initialProps: { query: '(min-width: 768px)' },
    });
    rerender({ query: '(min-width: 1024px)' });
    expect(mockMatchMedia).toHaveBeenCalledWith('(min-width: 1024px)');
    expect(removeEventListenerSpy).toHaveBeenCalledWith('change', firstHandler);
    expect(addEventListenerSpy).toHaveBeenCalledWith('change', secondHandler);
  });

  // A truly undefined `window` can't be exercised through renderHook: React
  // DOM needs a document to mount into, and the hook's effect (which runs only
  // when there IS a DOM) dereferences `window.matchMedia`. The reachable
  // no-media-query environment is a browser/runtime without matchMedia, which
  // both the lazy initializer and the effect guard against.
  it('defaults to false when matchMedia is unavailable', async () => {
    window.matchMedia = undefined;
    const { useMediaQuery } = await import('../useMediaQuery');
    const { result, unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);
    expect(() => unmount()).not.toThrow();
  });
});
