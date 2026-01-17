import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { useKYCRequests } from '../hooks/api/useKYC';
import Table from '../components/ui/Table';
import StatusBadge from '../components/ui/StatusBadge';

function KYCRequests() {
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: requests, isLoading } = useKYCRequests({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined,
    });

    const columns = [
        {
            key: 'name',
            label: 'Name',
        },
        {
            key: 'email',
            label: 'Email',
        },
        {
            key: 'phone',
            label: 'Phone',
            render: (phone) => phone || 'N/A',
        },
        {
            key: 'type',
            label: 'Account Type',
            render: (type) => (
                <span className="capitalize">{type || 'Individual'}</span>
            ),
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
    ];

    const handleRowClick = (row) => {
        navigate(`/kyc/${row.id}`);
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-3xl font-serif font-bold text-heritage-charcoal">
                    KYC Requests
                </h2>
                <p className="text-gray-600 mt-2">
                    Review and manage user KYC submissions
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-heritage p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter size={20} className="text-gray-500" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-luxury-gold focus:border-transparent outline-none"
                        >
                            <option value="all">All Statuses</option>
                            <option value="none">Not Submitted</option>
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                        </select>
                    </div>

                    {/* Search */}
                    <div className="flex-1 flex items-center gap-2">
                        <Search size={20} className="text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-luxury-gold focus:border-transparent outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                data={requests}
                loading={isLoading}
                onRowClick={handleRowClick}
                emptyMessage="No KYC requests found"
            />
        </div>
    );
}

export default KYCRequests;
