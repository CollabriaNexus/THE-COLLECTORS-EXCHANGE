import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, RefreshCw, BadgeIndianRupee, Plus } from 'lucide-react';
import { useProducts, useUpdateProduct } from '../hooks/api/useProducts';
import { useCreateManualOrder } from '../hooks/api/useOrders';
import Table from '../components/ui/Table';
import StatusBadge from '../components/ui/StatusBadge';
import ManualOrderModal from '../components/ManualOrderModal';
import ListingCategorySelect from '../components/ListingCategorySelect';
import CustomNoteCell from '../components/CustomNoteCell';
import CustomColumnHeader from '../components/CustomColumnHeader';
import { useCustomColumns } from '../hooks/useCustomColumns';
import apiClient from '../hooks/api/apiClient';
import { getUser } from '../utils/storage';

function Products() {
  const navigate = useNavigate();
  const isSuperAdmin = getUser()?.role === 'admin';
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState(null);
  const [syncingId, setSyncingId] = useState(null);
  const [punchModalProduct, setPunchModalProduct] = useState(null);
  const [punchError, setPunchError] = useState('');
  const [punchSuccess, setPunchSuccess] = useState('');
  const createManualOrderMutation = useCreateManualOrder();
  const updateProductMutation = useUpdateProduct();
  const { columns: customColumns, addColumn, renameColumn, removeColumn } = useCustomColumns();

  const { data: products, isLoading } = useProducts({
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: searchQuery || undefined,
  });

  const handleSyncToGoogle = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await apiClient.post('/products/sync-to-google');
      setSyncMsg({
        type: 'success',
        text: res.data.message || `Synced ${res.data.results?.synced || 0} products`,
      });
    } catch (err) {
      const msg =
        err.response?.data?.detail || err.response?.data?.error || err.message || 'Sync failed';
      setSyncMsg({ type: 'error', text: msg });
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncSingleProduct = async (product, e) => {
    e.stopPropagation();
    setSyncingId(product.id);
    try {
      const res = await apiClient.post(`/products/${product.id}/sync-to-google`);
      setSyncMsg({ type: 'success', text: res.data.message });
    } catch (err) {
      const msg =
        err.response?.data?.detail || err.response?.data?.error || err.message || 'Sync failed';
      setSyncMsg({ type: 'error', text: msg });
    } finally {
      setSyncingId(null);
    }
  };

  const handlePunchOrder = async (orderData) => {
    setPunchError('');
    try {
      await createManualOrderMutation.mutateAsync(orderData);
      setPunchSuccess('Order punched successfully!');
      setPunchModalProduct(null);
      setTimeout(() => setPunchSuccess(''), 3000);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to create order';
      setPunchError(msg);
    }
  };

  /** Placement selector — saves immediately so admins can work down the list. */
  const handleListingCategorySave = (productId, listingCategory) =>
    updateProductMutation.mutateAsync({ id: productId, listingCategory });

  /**
   * Custom-column values live together on `product.adminNotes`, so a write has
   * to merge into the existing object rather than replace it — otherwise
   * editing one column would wipe the others on that row.
   */
  const handleNoteSave = (product, columnId, text) => {
    const nextNotes = { ...(product.adminNotes || {}) };
    if (text) {
      nextNotes[columnId] = text;
    } else {
      delete nextNotes[columnId];
    }
    return updateProductMutation.mutateAsync({ id: product.id, adminNotes: nextNotes });
  };

  const columns = [
    {
      key: 'image',
      label: 'Image',
      render: (image) => (
        <img src={image} alt="Product" className="w-16 h-16 object-cover rounded" />
      ),
    },
    {
      key: 'title',
      label: 'Title',
      render: (title) => <div className="max-w-xs truncate">{title}</div>,
    },
    {
      key: 'category',
      label: 'Category',
    },
    {
      key: 'price',
      label: 'Price',
      render: (price) => `₹${price?.toLocaleString()}`,
    },
    {
      key: 'quantity',
      label: 'Qty',
      render: (qty) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-gray-100 text-gray-700">
          {qty ?? 1}
        </span>
      ),
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
      key: 'listingCategory',
      label: 'Placement',
      render: (listingCategory, row) => (
        <ListingCategorySelect
          value={listingCategory}
          onSave={(next) => handleListingCategorySave(row.id, next)}
        />
      ),
    },
    {
      key: 'isPublished',
      label: 'Visibility',
      render: (isPublished) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
        >
          {isPublished ? 'Public' : 'Hidden'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date Submitted',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (id, row) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {isSuperAdmin && row.status === 'Approved' && (
            <button
              type="button"
              onClick={() => setPunchModalProduct(row)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-luxury-gold text-black hover:bg-luxury-gold/80 rounded transition-colors font-medium"
              title="Punch manual order"
            >
              <BadgeIndianRupee size={12} />
              Punch
            </button>
          )}
          <button
            type="button"
            onClick={(e) => handleSyncSingleProduct(row, e)}
            disabled={syncingId === id}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded transition-colors font-medium disabled:opacity-50"
          >
            <RefreshCw size={12} className={syncingId === id ? 'animate-spin' : ''} />
            {syncingId === id ? 'Syncing...' : 'Sync'}
          </button>
        </div>
      ),
    },
  ];

  /**
   * Admin-defined columns are spliced in just before Actions so the controls
   * stay pinned to the right-hand edge as columns are added.
   */
  const customTableColumns = customColumns.map((col) => ({
    key: col.id,
    label: <CustomColumnHeader column={col} onRename={renameColumn} onRemove={removeColumn} />,
    // Table calls render(row[column.key], row); adminNotes is keyed by column id,
    // so read the value off the row rather than the (undefined) top-level key.
    render: (_unused, row) => (
      <CustomNoteCell
        value={row.adminNotes?.[col.id] || ''}
        onSave={(text) => handleNoteSave(row, col.id, text)}
      />
    ),
  }));

  const actionsColumn = columns[columns.length - 1];
  const tableColumns = [...columns.slice(0, -1), ...customTableColumns, actionsColumn];

  const handleRowClick = (row) => {
    navigate(`/products/${row.id}`);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-serif font-bold text-heritage-charcoal">Product Management</h2>
        <p className="text-gray-600 mt-2">Review and verify product listings</p>
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
              <option value="Timepieces">Timepieces</option>
              <option value="Accessories">Accessories</option>
              <option value="Collectibles">Collectibles</option>
              <option value="Antiques">Antiques</option>
              <option value="Toys & Pop Culture">Toys & Pop Culture</option>
              <option value="Jewelry">Jewelry</option>
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

      {/* Google Merchant Sync */}
      <div className="bg-white rounded-lg shadow-heritage p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold text-heritage-charcoal">Google Merchant Sync</h3>
            <p className="text-sm text-gray-500 mt-1">
              Sync all Approved products to Google Merchant Center
            </p>
            {syncMsg && (
              <p
                className={`text-sm mt-2 ${syncMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
              >
                {syncMsg.text}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleSyncToGoogle}
            disabled={syncing}
            className="flex items-center gap-2 px-5 py-2.5 text-sm bg-black text-white hover:bg-gray-800 rounded-md transition-colors font-medium disabled:opacity-50"
          >
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync to Google'}
          </button>
        </div>
      </div>

      {/* Custom columns toolbar */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        <p className="text-sm text-gray-500">
          {customColumns.length > 0
            ? `${customColumns.length} custom column${customColumns.length === 1 ? '' : 's'} — click a heading to rename it.`
            : 'Add your own columns to keep private notes against each product.'}
        </p>
        <button
          type="button"
          onClick={() => addColumn('New column')}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-heritage-charcoal text-white hover:bg-black rounded-md transition-colors font-medium"
        >
          <Plus size={15} />
          Add column
        </button>
      </div>

      {/* Table */}
      <Table
        columns={tableColumns}
        data={products}
        loading={isLoading}
        onRowClick={handleRowClick}
        emptyMessage="No products found"
      />

      {/* Punch Order Success/Error */}
      {punchSuccess && (
        <div className="fixed bottom-6 right-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50">
          {punchSuccess}
        </div>
      )}
      {punchError && (
        <div className="fixed bottom-6 right-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
          {punchError}
        </div>
      )}

      {/* Manual Order Modal */}
      <ManualOrderModal
        key={punchModalProduct?.id || 'closed'}
        isOpen={!!punchModalProduct}
        onClose={() => {
          setPunchModalProduct(null);
          setPunchError('');
        }}
        product={punchModalProduct}
        isBackfill={false}
        onSubmit={handlePunchOrder}
        isPending={createManualOrderMutation.isPending}
      />
    </div>
  );
}

export default Products;
