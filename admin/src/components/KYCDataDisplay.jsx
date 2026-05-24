import React from 'react';

function KYCDataDisplay({ kycData }) {
    if (!kycData || typeof kycData !== 'object') {
        return <p className="text-gray-500">No KYC data available</p>;
    }

    // Handle empty object
    if (Object.keys(kycData).length === 0) {
        return <p className="text-gray-500">No KYC data submitted</p>;
    }

    return (
        <div className="space-y-4">
            {Object.entries(kycData).map(([key, value]) => {
                // Skip internal fields
                if (key.startsWith('_') || key === 'adminNotes' || key === 'rejectionReason') {
                    return null;
                }

                return (
                    <div key={key} className="border-b border-gray-200 pb-3">
                        <dt className="text-sm font-semibold text-heritage-dark capitalize mb-1">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                        </dt>
                        <dd className="text-sm text-gray-700">
                            {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                        </dd>
                    </div>
                );
            })}

            {/* Display admin notes if available */}
            {kycData.adminNotes && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
                    <dt className="text-sm font-semibold text-blue-800 mb-2">
                        Admin Notes
                    </dt>
                    <dd className="text-sm text-blue-700">
                        {kycData.adminNotes}
                    </dd>
                </div>
            )}

            {/* Display rejection reason if available */}
            {kycData.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
                    <dt className="text-sm font-semibold text-red-800 mb-2">
                        Rejection Reason
                    </dt>
                    <dd className="text-sm text-red-700">
                        {kycData.rejectionReason}
                    </dd>
                </div>
            )}
        </div>
    );
}

export default KYCDataDisplay;
