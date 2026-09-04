import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Loader2, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import apiClient from '../hooks/api/apiClient';
import { useVendorRankings } from '../hooks/api/useVendors';
import { useConfirm } from '../components/ConfirmDialog';
import ErrorState from '../components/ui/ErrorState';
import { getErrorMessage } from '../utils/apiError';

const STATUS_COLORS = {
  PENDING: 'bg-amber-100 text-amber-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  PAID: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
};

const INR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

function Payouts() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    vendorId: '',
    amount: '',
    periodStart: '',
    periodEnd: '',
    note: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    data,
    isLoading,
    isError,
    error: queryError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['admin', 'payouts', statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await apiClient.get(`/admin/payouts?${params.toString()}`);
      return data;
    },
  });

  // Payouts are keyed by Vendor.id, which is NOT the user id and is not shown
  // anywhere else in this dashboard. The rankings endpoint is the only admin
  // route that exposes it alongside a human-readable name, so it backs the
  // picker — typing a raw database id by hand was the previous UX.
  const { data: vendorRankings, isLoading: vendorsLoading } = useVendorRankings('listings', 200);
  const vendorOptions = vendorRankings?.data ?? [];

  const notifyError = (err, fallback) => {
    setSuccess('');
    setError(getErrorMessage(err, fallback));
  };

  const notifySuccess = (message) => {
    setError('');
    setSuccess(message);
    setTimeout(() => setSuccess(''), 5000);
  };

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const { data } = await apiClient.patch(`/admin/payouts/${id}/status`, { status });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payouts'] });
      notifySuccess(`Payout marked ${variables.status}.`);
    },
    onError: (err) => notifyError(err, 'Failed to update the payout status.'),
  });

  const createPayoutMutation = useMutation({
    mutationFn: async (form) => {
      const { data } = await apiClient.post('/admin/payouts', form);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payouts'] });
      setShowCreate(false);
      setCreateForm({ vendorId: '', amount: '', periodStart: '', periodEnd: '', note: '' });
      notifySuccess(`Payout of ${INR(data?.payout?.amount)} created.`);
    },
    onError: (err) => notifyError(err, 'Failed to create the payout.'),
  });

  const autoCreateMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/admin/payouts/auto-create');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payouts'] });
      const skippedDetail = (data.skipped ?? [])
        .map((s) => `${s.sellerId}: ${s.reason}`)
        .join(', ');
      notifySuccess(
        `Auto-created ${data.created?.length ?? 0} payout(s), skipped ${data.skipped?.length ?? 0}` +
          (skippedDetail ? ` — ${skippedDetail}` : '.'),
      );
    },
    onError: (err) => notifyError(err, 'Auto-create failed.'),
  });

  const handleAutoCreate = async () => {
    const confirmed = await confirm(
      'Auto-create payouts for every delivered, paid order item that is 7+ days old and not yet paid out? ' +
        'This creates PENDING payout records and notifies each vendor. It cannot be undone from this screen.',
    );
    if (!confirmed) return;
    autoCreateMutation.mutate();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const amount = Number(createForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter a payout amount greater than zero.');
      return;
    }
    if (new Date(createForm.periodEnd) < new Date(createForm.periodStart)) {
      setError('The period end date cannot be before the period start date.');
      return;
    }

    const vendorName =
      vendorOptions.find((v) => v.vendor.vendorId === createForm.vendorId)?.vendor.name ||
      createForm.vendorId;
    const confirmed = await confirm(
      `Create a ${INR(amount)} payout for ${vendorName}? The vendor is notified immediately.`,
    );
    if (!confirmed) return;

    // The API validates `amount` as a NUMBER (CreatePayoutSchema). An
    // <input type="number"> still hands back a string, so posting the raw
    // form value made every single create fail zod validation with a 400.
    createPayoutMutation.mutate({
      ...createForm,
      amount,
      note: createForm.note || undefined,
    });
  };

  const handleStatusChange = async (payout, status) => {
    const wording = {
      PROCESSING: `Move the ${INR(payout.amount)} payout for ${payout.vendor?.user?.name || 'this vendor'} to PROCESSING?`,
      PAID: `Mark the ${INR(payout.amount)} payout for ${payout.vendor?.user?.name || 'this vendor'} as PAID? This is final — it stamps a paid date and tells the vendor the money has been sent.`,
      FAILED: `Mark the ${INR(payout.amount)} payout for ${payout.vendor?.user?.name || 'this vendor'} as FAILED? This is final and tells the vendor their payout failed.`,
    };
    const confirmed = await confirm(wording[status] ?? `Set this payout to ${status}?`);
    if (!confirmed) return;
    updateStatusMutation.mutate({ id: payout.id, status });
  };

  const pendingStatusId = updateStatusMutation.isPending
    ? updateStatusMutation.variables?.id
    : null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-serif font-bold text-heritage-charcoal">Payouts</h2>
          <p className="text-gray-600 mt-2">Manage vendor payouts</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAutoCreate}
            disabled={autoCreateMutation.isPending}
            className="bg-green-700 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-green-800 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {autoCreateMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            {autoCreateMutation.isPending ? 'Creating...' : 'Auto-Create'}
          </button>
          <button
            onClick={() => {
              setShowCreate(!showCreate);
              setError('');
            }}
            className="bg-heritage-charcoal text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-luxury-gold transition-colors flex items-center gap-2"
          >
            <DollarSign size={16} />
            {showCreate ? 'Cancel' : 'New Payout'}
          </button>
        </div>
      </div>

      {success && (
        <div
          role="status"
          className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-6 flex items-start gap-2"
        >
          <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-start gap-2"
        >
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {showCreate && (
        <div className="bg-white rounded-lg shadow-heritage p-6 mb-6 border border-gray-100">
          <h3 className="text-lg font-serif font-bold text-heritage-charcoal mb-4">
            Create Payout
          </h3>
          <form
            onSubmit={handleCreateSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div>
              <label
                htmlFor="payout-vendor"
                className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2"
              >
                Vendor
              </label>
              <select
                id="payout-vendor"
                required
                value={createForm.vendorId}
                onChange={(e) => setCreateForm({ ...createForm, vendorId: e.target.value })}
                className="w-full p-3 border border-gray-200 bg-white"
              >
                <option value="">
                  {vendorsLoading ? 'Loading vendors...' : 'Select a vendor'}
                </option>
                {vendorOptions.map((row) => (
                  <option key={row.vendor.vendorId} value={row.vendor.vendorId}>
                    {row.vendor.name} — {row.vendor.email}
                  </option>
                ))}
              </select>
              {!vendorsLoading && vendorOptions.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  No KYC-approved vendors found. Approve a vendor&apos;s KYC first.
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="payout-amount"
                className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2"
              >
                Amount (₹)
              </label>
              <input
                id="payout-amount"
                type="number"
                required
                min="1"
                step="0.01"
                value={createForm.amount}
                onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                className="w-full p-3 border border-gray-200"
              />
            </div>
            <div>
              <label
                htmlFor="payout-start"
                className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2"
              >
                Period Start
              </label>
              <input
                id="payout-start"
                type="date"
                required
                value={createForm.periodStart}
                onChange={(e) => setCreateForm({ ...createForm, periodStart: e.target.value })}
                className="w-full p-3 border border-gray-200"
              />
            </div>
            <div>
              <label
                htmlFor="payout-end"
                className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2"
              >
                Period End
              </label>
              <input
                id="payout-end"
                type="date"
                required
                value={createForm.periodEnd}
                onChange={(e) => setCreateForm({ ...createForm, periodEnd: e.target.value })}
                className="w-full p-3 border border-gray-200"
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="payout-note"
                className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2"
              >
                Note (optional)
              </label>
              <input
                id="payout-note"
                type="text"
                value={createForm.note}
                onChange={(e) => setCreateForm({ ...createForm, note: e.target.value })}
                className="w-full p-3 border border-gray-200"
                placeholder="Payment reference or note"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={createPayoutMutation.isPending}
                className="bg-black text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-luxury-gold transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {createPayoutMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                {createPayoutMutation.isPending ? 'Creating...' : 'Create Payout'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {['', 'PENDING', 'PROCESSING', 'PAID', 'FAILED'].map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-colors ${statusFilter === s ? 'bg-heritage-charcoal text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-luxury-gold" size={32} />
        </div>
      ) : isError ? (
        <ErrorState
          error={queryError}
          title="Could not load payouts"
          onRetry={refetch}
          isRetrying={isFetching}
        />
      ) : !data?.payouts?.length ? (
        <div className="bg-white rounded-lg shadow-heritage p-12 text-center border border-gray-100">
          <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-serif text-lg">No payouts found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-heritage border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                    Vendor
                  </th>
                  <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                    Amount
                  </th>
                  <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                    Period
                  </th>
                  <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                    Status
                  </th>
                  <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                    Note
                  </th>
                  <th className="text-right p-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.payouts?.map((payout) => {
                  const busy = pendingStatusId === payout.id;
                  return (
                    <tr key={payout.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <p className="text-sm font-medium text-heritage-charcoal">
                          {payout.vendor?.user?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">{payout.vendor?.user?.email}</p>
                      </td>
                      <td className="p-4 text-sm font-bold">{INR(payout.amount)}</td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(payout.periodStart).toLocaleDateString()} —{' '}
                        {new Date(payout.periodEnd).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold uppercase tracking-wider rounded-full ${STATUS_COLORS[payout.status] || 'bg-gray-100 text-gray-600'}`}
                        >
                          {payout.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500 max-w-[200px] truncate">
                        {payout.note || '—'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          {payout.status === 'PENDING' && (
                            <>
                              <button
                                disabled={busy}
                                onClick={() => handleStatusChange(payout, 'PROCESSING')}
                                className="px-3 py-1.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
                              >
                                {busy ? 'Saving...' : 'Process'}
                              </button>
                              <button
                                disabled={busy}
                                onClick={() => handleStatusChange(payout, 'FAILED')}
                                className="px-3 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                              >
                                Fail
                              </button>
                            </>
                          )}
                          {payout.status === 'PROCESSING' && (
                            <>
                              <button
                                disabled={busy}
                                onClick={() => handleStatusChange(payout, 'PAID')}
                                className="px-3 py-1.5 text-xs font-semibold bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
                              >
                                {busy ? 'Saving...' : 'Mark Paid'}
                              </button>
                              <button
                                disabled={busy}
                                onClick={() => handleStatusChange(payout, 'FAILED')}
                                className="px-3 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                              >
                                Fail
                              </button>
                            </>
                          )}
                          {(payout.status === 'PAID' || payout.status === 'FAILED') && (
                            <span className="text-xs text-gray-400 italic">Final</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {data?.pagination?.pages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-100">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded ${page <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Previous
              </button>
              <span className="text-xs text-gray-500">
                Page {data.pagination.page} of {data.pagination.pages} · {data.pagination.total}{' '}
                payout{data.pagination.total === 1 ? '' : 's'}
              </span>
              <button
                disabled={page >= data.pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded ${page >= data.pagination.pages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Payouts;
