import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShieldCheck, Star } from 'lucide-react';
import { useVendors, useWhitelistVendor } from '../hooks/api/useVendors';
import { useUserDetail } from '../hooks/api/useUsers';
import Table from '../components/ui/Table';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';

// Inline whitelist action — opens a confirmation modal
function WhitelistModal({ userId, userName, onClose, onSuccess }) {
    const whitelistMutation = useWhitelistVendor();
    const [plan, setPlan] = useState('CUSTOM_APPROVED');
    const [error, setError] = useState('');

    const handleConfirm = async () => {
        setError('');
        try {
            await whitelistMutation.mutateAsync({ userId, plan });
            onSuccess();
        } catch (err) {
            setError(err?.response?.data?.error || err.message || 'Failed to whitelist vendor');
        }
    };

    return (
        <Modal isOpen onClose={onClose} title="Whitelist Vendor">
            <div className="space-y-4">
                <p className="text-gray-700">
                    Grant <strong>{userName}</strong> unlimited bulk vendor access?
                </p>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Plan</label>
                    <select
                        value={plan}
                        onChange={e => setPlan(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-luxury-gold outline-none"
                    >
                        <option value="CUSTOM_APPROVED">Custom Approved (10 years)</option>
                        <option value="BULK_YEARLY">Bulk Yearly</option>
                        <option value="BULK_MONTHLY">Bulk Monthly</option>
                    </select>
                </div>

                {error && (
                    <p className="text-red-600 text-sm">{error}</p>
                )}

                <div className="flex gap-3 justify-end pt-2">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={whitelistMutation.isPending}
                        className="px-6 py-2 bg-luxury-gold text-white rounded-md hover:bg-luxury-gold/90 disabled:opacity-50"
                    >
                        {whitelistMutation.isPending ? 'Whitelisting...' : 'Confirm Whitelist'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

function Vendors() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [whitelistTarget, setWhitelistTarget] = useState(null); // { id, name }
    const [successMsg, setSuccessMsg] = useState('');

    const { data: vendors = [], isLoading, refetch } = useVendors({
        search: searchQuery || undefined,
    });

    const handleWhitelistSuccess = () => {
        setWhitelistTarget(null);
        setSuccessMsg('Vendor whitelisted successfully!');
        refetch();
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const columns = [
        {
            key: 'name',
            label: 'Name',
            render: (name) => name || 'N/A',
        },
        {
            key: 'email',
            label: 'Email',
        },
        {
            key: 'type',
            label: 'Account Type',
            render: (type) => <span className="capitalize">{type || 'Individual'}</span>,
        },
        {
            key: 'kycStatus',
            label: 'KYC Status',
            render: (status) => <StatusBadge status={status} />,
        },
        {
            key: 'createdAt',
            label: 'Registered',
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            key: 'id',
            label: 'Actions',
            render: (id, row) => (
                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    <button
                        onClick={() => navigate(`/users/${id}`)}
                        className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                        View
                    </button>
                    {row.kycStatus === 'verified' && (
                        <button
                            onClick={() => setWhitelistTarget({ id, name: row.name || row.email })}
                            className="px-3 py-1 text-xs bg-luxury-gold text-white rounded hover:bg-luxury-gold/90 transition-colors flex items-center gap-1"
                        >
                            <Star size={12} />
                            Whitelist
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-3xl font-serif font-bold text-heritage-charcoal">
                    Vendor Management
                </h2>
                <p className="text-gray-600 mt-2">
                    Manage KYC-verified sellers and bulk vendor subscriptions
                </p>
            </div>

            {successMsg && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
                    <ShieldCheck size={16} />
                    {successMsg}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-heritage p-5">
                    <p className="text-sm text-gray-500 font-medium">Total Sellers</p>
                    <p className="text-3xl font-bold text-heritage-charcoal mt-1">{vendors.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-heritage p-5">
                    <p className="text-sm text-gray-500 font-medium">KYC Verified</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">
                        {vendors.filter(v => v.kycStatus === 'verified').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-heritage p-5">
                    <p className="text-sm text-gray-500 font-medium">Pending Review</p>
                    <p className="text-3xl font-bold text-yellow-600 mt-1">
                        {vendors.filter(v => v.kycStatus === 'pending').length}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg shadow-heritage p-6 mb-6">
                <div className="flex items-center gap-2">
                    <Search size={20} className="text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-luxury-gold focus:border-transparent outline-none"
                    />
                </div>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                data={vendors}
                loading={isLoading}
                emptyMessage="No vendors found"
            />

            {/* Whitelist Modal */}
            {whitelistTarget && (
                <WhitelistModal
                    userId={whitelistTarget.id}
                    userName={whitelistTarget.name}
                    onClose={() => setWhitelistTarget(null)}
                    onSuccess={handleWhitelistSuccess}
                />
            )}
        </div>
    );
}

export default Vendors;
