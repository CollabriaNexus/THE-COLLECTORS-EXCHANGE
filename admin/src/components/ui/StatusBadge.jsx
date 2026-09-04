import React from 'react';

/**
 * @param {string}  status        drives the colour AND, by default, the text
 * @param {string} [overrideLabel] show this text instead of `status` while
 *   keeping `status`'s colour. Callers (e.g. ContactMessages) use a colour-
 *   carrying status like "Approved" to render a domain label like "REPLIED".
 */
function StatusBadge({ status, className = '', overrideLabel }) {
  const getStatusStyles = () => {
    switch (status?.toLowerCase()) {
      case 'verified':
      case 'approved':
      case 'active':
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'shipped':
      case 'in review':
      case 'in_review':
      case 'under review':
      case 'under_review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected':
      case 'blocked':
      case 'cancelled':
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'none':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyles()} ${className}`}
    >
      {overrideLabel || status || 'Unknown'}
    </span>
  );
}

export default StatusBadge;
