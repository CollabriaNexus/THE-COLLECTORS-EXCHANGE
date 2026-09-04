import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { getErrorMessage } from '../../utils/apiError';

/**
 * Shown when a query FAILS, so a failed fetch never gets mistaken for an empty
 * result. Every list in this dashboard used to render its "No X found" empty
 * state on error — an operator looking at "No orders found" has no way to know
 * the request 500'd rather than the business having no orders.
 */
function ErrorState({ error, onRetry, title = 'Could not load this data', isRetrying = false }) {
  return (
    <div
      role="alert"
      className="bg-white rounded-lg shadow-heritage border border-red-100 p-10 text-center"
    >
      <AlertTriangle size={40} className="mx-auto text-red-500 mb-4" />
      <h3 className="text-lg font-serif font-bold text-heritage-charcoal">{title}</h3>
      <p className="text-sm text-gray-600 mt-2 max-w-lg mx-auto break-words">
        {getErrorMessage(error, 'The server did not return a result.')}
      </p>
      <p className="text-xs text-gray-400 mt-2">
        This is a load failure, not an empty list — the data may still exist.
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2 text-sm font-medium bg-heritage-charcoal text-white rounded-md hover:bg-black transition-colors disabled:opacity-50"
        >
          <RefreshCw size={15} className={isRetrying ? 'animate-spin' : ''} />
          {isRetrying ? 'Retrying...' : 'Retry'}
        </button>
      )}
    </div>
  );
}

export default ErrorState;
