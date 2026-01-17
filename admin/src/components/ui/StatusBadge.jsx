import React from 'react';

function StatusBadge({ status, className = '' }) {
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
            case 'under review':
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
            {status || 'Unknown'}
        </span>
    );
}

export default StatusBadge;
