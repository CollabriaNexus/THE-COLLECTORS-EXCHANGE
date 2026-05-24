import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { useProducts } from '../hooks/api/useProducts';
import Table from '../components/ui/Table';
import StatusBadge from '../components/ui/StatusBadge';

function Products() {
    const navigate = useNavigate();
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: products, isLoading } = useProducts({
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined,
    });

    const columns = [
        {
            key: 'image',
            label: 'Image',
            render: (image) => (
                <img
                    src={image}
                    alt="Product"
                    className="w-16 h-16 object-cover rounded"
                />
            ),
        },
        {
            key: 'title',
            label: 'Title',
            render: (title) => (
                <div className="max-w-xs truncate">{title}</div>
            ),
        },
        {
            key: 'category',
            label: 'Category',
        },
        {
            key: 'price',
            label: 'Price',
            render: (price) => `$${price}`,
        },
        {
            key: 'seller',
            label: 'Seller',
            render: (seller) => seller?.name || seller?.email || 'Unknown',
        },
        {
            key: 'status',
            label: 'Status',
            render: (status) => <StatusBadge status={status} />,
        },
        {
            key: 'isPublished',
            label: 'Visibility',
            render: (isPublished) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {isPublished ? 'Public' : 'Hidden'}
                </span>
            ),
        },
        {
            key: 'createdAt',
            label: 'Date Submitted',
            render: (date) => new Date(date).toLocaleDateString(),
        },
    ];

    const handleRowClick = (row) => {
        navigate(`/products/${row.id}`);
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-3xl font-serif font-bold text-heritage-charcoal">
                    Product Management
                </h2>
                <p className="text-gray-600 mt-2">
                    Review and verify product listings
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-heritage p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Category Filter */}
                    <div className="flex items-center gap-2">
                        <Filter size={20} className="text-gray-500" />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-luxury-gold focus:border-transparent outline-none"
                        >
                            <option value="all">All Categories</option>
                            <option value="Collectables">Collectables</option>
                            <option value="Timepieces">Timepieces</option>
                            <option value="Sneakers">Sneakers</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-luxury-gold focus:border-transparent outline-none"
                        >
                            <option value="all">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="In Review">In Review</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>

                    {/* Search */}
                    <div className="flex-1 flex items-center gap-2">
                        <Search size={20} className="text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by title or description..."
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
                data={products}
                loading={isLoading}
                onRowClick={handleRowClick}
                emptyMessage="No products found"
            />
        </div>
    );
}

export default Products;
