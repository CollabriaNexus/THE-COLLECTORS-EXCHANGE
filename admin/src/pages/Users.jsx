import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { useUsers } from '../hooks/api/useUsers';
import Table from '../components/ui/Table';
import StatusBadge from '../components/ui/StatusBadge';
import ErrorState from '../components/ui/ErrorState';

function Users() {
  const navigate = useNavigate();
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: users,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useUsers({
    role: roleFilter !== 'all' ? roleFilter : undefined,
    search: searchQuery || undefined,
  });

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
      key: 'phone',
      label: 'Phone',
      render: (phone) => phone || 'N/A',
    },
    {
      key: 'type',
      label: 'Type',
      render: (type) => <span className="capitalize">{type || 'Individual'}</span>,
    },
    {
      key: 'role',
      label: 'Role',
      render: (role) => <StatusBadge status={role} />,
    },
    {
      key: 'kycStatus',
      label: 'KYC',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      // The API already returns `banned`; without a column an operator
      // had to open each profile to find out who was locked out.
      key: 'banned',
      label: 'Account',
      render: (banned) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${banned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
        >
          {banned ? 'Banned' : 'Active'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Registered',
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  const handleRowClick = (row) => {
    navigate(`/users/${row.id}`);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-serif font-bold text-heritage-charcoal">User Management</h2>
        <p className="text-gray-600 mt-2">View and manage all registered users</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-heritage p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-luxury-gold focus:border-transparent outline-none"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="curator">Curator</option>
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
      {isError ? (
        <ErrorState
          error={error}
          title="Could not load users"
          onRetry={refetch}
          isRetrying={isFetching}
        />
      ) : (
        <Table
          columns={columns}
          data={users}
          loading={isLoading}
          onRowClick={handleRowClick}
          emptyMessage="No users found"
        />
      )}
    </div>
  );
}

export default Users;
