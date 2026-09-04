import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// jsdom gaps that every suite needs.
// jsdom implements neither IntersectionObserver nor window.scrollTo, so any
// component using scroll-reveal motion or a "back to top" control blows up (or
// spams "Error: Not implemented") unless we provide them here.
// ---------------------------------------------------------------------------

// Registry of live observer instances so a test can drive intersection changes
// without reaching into the component. Cleared between tests.
const observers = new Set();

class MockIntersectionObserver {
  constructor(callback, options = {}) {
    this.callback = callback;
    this.options = options;
    this.root = options.root ?? null;
    this.rootMargin = options.rootMargin ?? '0px';
    this.thresholds = Array.isArray(options.threshold)
      ? options.threshold
      : [options.threshold ?? 0];
    this.elements = new Set();
    observers.add(this);
  }

  observe(element) {
    this.elements.add(element);
  }

  unobserve(element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
    observers.delete(this);
  }

  takeRecords() {
    return [];
  }

  /** Test helper: fire the observer callback for everything it is watching. */
  trigger(isIntersecting = true) {
    const entries = [...this.elements].map((target) => ({
      target,
      isIntersecting,
      intersectionRatio: isIntersecting ? 1 : 0,
      boundingClientRect: target.getBoundingClientRect?.() ?? {},
      intersectionRect: {},
      rootBounds: null,
      time: 0,
    }));
    this.callback(entries, this);
  }
}

/**
 * Fire the intersection callback on every live observer. Lets a test flip
 * scroll-reveal content into view: `triggerIntersection()`.
 */
export function triggerIntersection(isIntersecting = true) {
  observers.forEach((observer) => observer.trigger(isIntersecting));
}

function installIntersectionObserver() {
  // A spy wrapper so tests can assert on the constructor args (thresholds etc.)
  // while still getting real observe/unobserve/disconnect behaviour.
  const spy = vi.fn((callback, options) => new MockIntersectionObserver(callback, options));
  // `new IntersectionObserver(...)` must work, so keep it constructible: a
  // vi.fn() returning an object from a constructor call yields that object.
  globalThis.IntersectionObserver = spy;
  window.IntersectionObserver = spy;
}

function installResizeObserver() {
  class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = MockResizeObserver;
  window.ResizeObserver = MockResizeObserver;
}

function installScroll() {
  // jsdom throws "Not implemented" for these; components call them freely.
  window.scrollTo = vi.fn();
  window.scroll = vi.fn();
  window.scrollBy = vi.fn();
  Element.prototype.scrollTo = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
}

beforeEach(() => {
  observers.clear();
  installIntersectionObserver();
  installResizeObserver();
  installScroll();
});

afterEach(() => {
  observers.clear();
});

// Install once up-front too, so module-level code that runs at import time
// (before the first beforeEach) still finds them.
installIntersectionObserver();
installResizeObserver();
installScroll();
