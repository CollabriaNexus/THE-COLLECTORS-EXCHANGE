import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShieldCheck, Star, Users as UsersIcon } from 'lucide-react';
import { useVendors, useToggleVendorType } from '../hooks/api/useVendors';
import Table from '../components/ui/Table';
import StatusBadge from '../components/ui/StatusBadge';

function Vendors() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const { data: vendors = [], isLoading, refetch } = useVendors({
        search: searchQuery || undefined,
    });

    const toggleVendorType = useToggleVendorType();

    const handleToggleType = async (userId, currentType) => {
        const newType = currentType === 'BULK' ? 'SINGLE' : 'BULK';
        try {
            await toggleVendorType.mutateAsync({ userId, type: newType });
            setSuccessMsg(`Vendor type changed to ${newType}`);
            refetch();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error('Failed to toggle vendor type', err);
        }
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
            key: 'vendor.type',
            label: 'Vendor Type',
            render: (_, row) => {
                const type = row.vendor?.type || 'SINGLE';
                return (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${type === 'BULK' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                        {type === 'BULK' ? 'Bulk Lister' : 'Normal'}
                    </span>
                );
            },
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
                            onClick={() => handleToggleType(id, row.vendor?.type || 'SINGLE')}
                            disabled={toggleVendorType.isPending}
                            className={`px-3 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                                row.vendor?.type === 'BULK'
                                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    : 'bg-luxury-gold text-white hover:bg-luxury-gold/90'
                            }`}
                        >
                            <Star size={12} />
                            {row.vendor?.type === 'BULK' ? 'Set Normal' : 'Set Bulk'}
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
                    Manage KYC-verified sellers — mark as Bulk Lister or Normal Vendor
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
        </div>
    );
}

export default Vendors;
