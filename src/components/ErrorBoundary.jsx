import React from 'react';

// How long an auto-reload "counts for". A second crash inside this window means
// reloading did not help, so we stop and show a real fallback instead.
const RELOAD_COOLDOWN_MS = 10_000;
const RELOAD_KEY = 'tce_error_reload_at';

// sessionStorage throws outright in some privacy modes, so every access is
// guarded. Failing to read the marker degrades to "we have not reloaded yet",
// which is the same behaviour this component had before the loop guard.
const readLastReload = () => {
  try {
    return Number(window.sessionStorage.getItem(RELOAD_KEY)) || 0;
  } catch {
    return 0;
  }
};

const markReloaded = () => {
  try {
    window.sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    // Ignore - worst case we reload one extra time.
  }
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, gaveUp: false };
    // One mount makes ONE recovery decision. componentDidCatch can fire more
    // than once for a single failure (React re-renders the subtree while
    // recovering, and StrictMode double-invokes in development), which without
    // this guard would let the second invocation see the cooldown marker the
    // first one just wrote and immediately give up - turning a recoverable
    // first crash into the fallback screen.
    this.handled = false;
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);

    if (this.handled) return;
    this.handled = true;

    // Auto-reload recovers from transient failures (a stale chunk after a
    // deploy, a one-off network blip) without showing the user anything.
    // But a DETERMINISTIC error reloads straight back into itself: crash ->
    // reload -> crash, forever, on a blank page with no way out. So we only
    // take that gamble once per cooldown window; if we just tried it and are
    // back here, reloading is not the answer and the user gets a real screen.
    if (Date.now() - readLastReload() > RELOAD_COOLDOWN_MS) {
      markReloaded();
      window.location.reload();
      return;
    }

    this.setState({ gaveUp: true });
  }

  handleRetry = () => {
    try {
      window.sessionStorage.removeItem(RELOAD_KEY);
    } catch {
      // Ignore - the reload below still happens.
    }
    window.location.reload();
  };

  render() {
    if (this.state.gaveUp) {
      return (
        <div
          role="alert"
          className="min-h-[60vh] flex items-center justify-center bg-heritage-cream px-6 py-16"
        >
          <div className="max-w-md text-center">
            <h1 className="font-serif text-2xl sm:text-3xl text-heritage-charcoal">
              Something went wrong
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-heritage-charcoal/60">
              This page ran into a problem it could not recover from. Reloading did not help, so we
              have stopped retrying.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleRetry}
                className="inline-flex items-center justify-center rounded-full bg-heritage-charcoal px-8 py-4 font-sans text-xs uppercase tracking-[0.22em] text-white transition-all duration-300 hover:bg-luxury-gold"
              >
                Try again
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-heritage-charcoal/20 px-8 py-4 font-sans text-xs uppercase tracking-[0.22em] text-heritage-charcoal transition-all duration-300 hover:border-luxury-gold hover:text-luxury-gold"
              >
                Go home
              </a>
            </div>
          </div>
        </div>
      );
    }

    // Error caught but we are about to reload - render nothing rather than
    // flashing a fallback the user would only see for a few milliseconds.
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
