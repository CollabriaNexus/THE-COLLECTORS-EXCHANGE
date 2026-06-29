import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ShoppingBag } from 'lucide-react';
import { useOrders } from '../hooks/api/useOrders';
import Table from '../components/ui/Table';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';

function Orders() {
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: orders, isLoading } = useOrders({
        status: statusFilter,
        search: searchQuery,
    });

    const columns = [
        {
            key: 'id',
            label: 'Order ID',
            render: (id) => <span className="font-mono text-xs text-gray-500">#{id.slice(-8).toUpperCase()}</span>,
        },
        {
            key: 'user',
            label: 'Customer',
            render: (user) => (
                <div>
                    <div className="font-medium text-heritage-charcoal">{user?.name}</div>
                    <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
            ),
        },
        {
            key: 'createdAt',
            label: 'Date',
            render: (date) => new Date(date).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }),
        },
        {
            key: 'totalAmount',
            label: 'Total',
            render: (amount) => `₹${amount?.toFixed(2)}`,
        },
        {
            key: 'paymentMethod',
            label: 'Payment',
            render: (method) => (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${method === 'cod' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                    {method === 'cod' ? 'COD' : 'Online'}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (status) => <StatusBadge status={status} />,
        },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-heritage-charcoal">
                        Orders Management
                    </h2>
                    <p className="text-gray-600 mt-2">
                        Fulfill and track customer orders
                    </p>
                </div>
            </div>

            {/* Filters & Actions */}
            <div className="bg-white p-4 rounded-lg shadow-heritage flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-1 gap-4 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Order ID or customer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-luxury-gold focus:border-transparent outline-none"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="text-gray-400" size={18} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-luxury-gold focus:border-transparent outline-none"
                        >
                            <option value="all">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-heritage overflow-hidden">
                {orders?.length > 0 ? (
                    <Table
                        columns={columns}
                        data={orders}
                        onRowClick={(order) => navigate(`/orders/${order.id}`)}
                    />
                ) : (
                    <div className="text-center py-20 bg-gray-50">
                        <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
                        <p className="text-gray-500">When customers buy products, they will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Orders;
