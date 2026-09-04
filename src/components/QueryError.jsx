import { RefreshCw } from 'lucide-react';

/**
 * Inline "this failed to load" state for a rejected react-query read.
 *
 * Why this exists: every list surface in the app rendered its EMPTY state when
 * a query rejected (TanStack returns `data === undefined`, the page defaults it
 * to `[]`, `isLoading` flips back to false) — so a timeout or a 500 told the
 * shopper the shop was empty. DESIGN.md §5.2: "Error: Inline error message with
 * retry button, never a blank page."
 *
 * Deliberately says nothing technical. A shopper cannot act on a status code,
 * and on Indian mobile data the honest cause is almost always the connection.
 * The raw error stays in the console/network tab where it belongs.
 *
 * Props:
 *   title      short headline (defaults to a surface-agnostic one)
 *   message    one calm sentence of explanation
 *   onRetry    usually the query's `refetch` — omit to render without a button
 *   isRetrying disables the button and spins the icon while the refetch is in flight
 *   tone       'light' (default) or 'dark' for placement on a dark section
 *   className  extra classes on the wrapper (spacing is caller-owned)
 */
const TONES = {
  light: {
    wrapper: 'bg-heritage-cream border-heritage-beige',
    icon: 'text-heritage-bronze/40',
    title: 'text-heritage-charcoal',
    message: 'text-heritage-charcoal/55',
    button:
      'bg-heritage-charcoal text-white hover:bg-luxury-gold hover:text-heritage-charcoal focus-visible:ring-heritage-charcoal',
  },
  dark: {
    wrapper: 'bg-white/[0.03] border-white/10',
    icon: 'text-luxury-gold/50',
    title: 'text-white',
    message: 'text-white/50',
    button:
      'bg-luxury-gold text-heritage-charcoal hover:brightness-90 focus-visible:ring-luxury-gold',
  },
};

const QueryError = ({
  title = "We couldn't load this",
  message = 'This is usually a slow or dropped connection. Please try again.',
  onRetry,
  isRetrying = false,
  tone = 'light',
  className = '',
}) => {
  const styles = TONES[tone] ?? TONES.light;

  return (
    <div
      role="alert"
      className={`text-center py-12 md:py-20 px-6 rounded-2xl border ${styles.wrapper} ${className}`}
    >
      <RefreshCw
        size={32}
        strokeWidth={1}
        aria-hidden="true"
        className={`md:w-10 md:h-10 mx-auto mb-4 ${styles.icon}`}
      />
      <h3 className={`font-serif text-lg sm:text-xl lg:text-2xl ${styles.title}`}>{title}</h3>
      <p className={`font-sans text-xs sm:text-sm mt-2 max-w-sm mx-auto ${styles.message}`}>
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={() => onRetry()}
          disabled={isRetrying}
          className={`mt-6 inline-flex items-center gap-2 rounded-full px-8 py-3 font-sans text-xs uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${styles.button}`}
        >
          <RefreshCw
            size={14}
            strokeWidth={2}
            aria-hidden="true"
            className={isRetrying ? 'animate-spin' : ''}
          />
          {isRetrying ? 'Retrying' : 'Try again'}
        </button>
      )}
    </div>
  );
};

export default QueryError;
