import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Loader2, RefreshCw } from 'lucide-react';
import apiClient from '../hooks/api/apiClient';

const STATUS_COLORS = {
    PENDING: 'bg-amber-100 text-amber-700',
    PROCESSING: 'bg-blue-100 text-blue-700',
    PAID: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700',
};

function Payouts() {
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [showCreate, setShowCreate] = useState(false);
    const [createForm, setCreateForm] = useState({ vendorId: '', amount: '', periodStart: '', periodEnd: '', note: '' });

    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'payouts', statusFilter, page],
        queryFn: async () => {
            const params = new URLSearchParams({ page: page.toString(), limit: '20' });
            if (statusFilter) params.set('status', statusFilter);
            const { data } = await apiClient.get(`/admin/payouts?${params.toString()}`);
            return data;
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }) => {
            const { data } = await apiClient.patch(`/admin/payouts/${id}/status`, { status });
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'payouts'] }),
    });

    const createPayoutMutation = useMutation({
        mutationFn: async (form) => {
            const { data } = await apiClient.post('/admin/payouts', form);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'payouts'] });
            setShowCreate(false);
            setCreateForm({ vendorId: '', amount: '', periodStart: '', periodEnd: '', note: '' });
        },
    });

    const autoCreateMutation = useMutation({
        mutationFn: async () => {
            const { data } = await apiClient.post('/admin/payouts/auto-create');
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'payouts'] });
            alert(`Auto-created ${data.created.length} payout(s), skipped ${data.skipped.length}`);
        },
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-heritage-charcoal">Payouts</h2>
                    <p className="text-gray-600 mt-2">Manage vendor payouts</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => autoCreateMutation.mutate()}
                        disabled={autoCreateMutation.isPending}
                        className="bg-green-700 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-green-800 transition-colors flex items-center gap-2"
                    >
                        {autoCreateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                        Auto-Create
                    </button>
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="bg-heritage-charcoal text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-luxury-gold transition-colors flex items-center gap-2"
                    >
                        <DollarSign size={16} />
                        {showCreate ? 'Cancel' : 'New Payout'}
                    </button>
                </div>
            </div>

            {showCreate && (
                <div className="bg-white rounded-lg shadow-heritage p-6 mb-6 border border-gray-100">
                    <h3 className="text-lg font-serif font-bold text-heritage-charcoal mb-4">Create Payout</h3>
                    <form onSubmit={(e) => { e.preventDefault(); createPayoutMutation.mutate(createForm); }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Vendor ID</label>
                            <input type="text" required value={createForm.vendorId} onChange={(e) => setCreateForm({ ...createForm, vendorId: e.target.value })} className="w-full p-3 border border-gray-200" placeholder="Vendor ID from DB" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Amount (₹)</label>
                            <input type="number" required min="1" step="0.01" value={createForm.amount} onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })} className="w-full p-3 border border-gray-200" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Period Start</label>
                            <input type="date" required value={createForm.periodStart} onChange={(e) => setCreateForm({ ...createForm, periodStart: e.target.value })} className="w-full p-3 border border-gray-200" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Period End</label>
                            <input type="date" required value={createForm.periodEnd} onChange={(e) => setCreateForm({ ...createForm, periodEnd: e.target.value })} className="w-full p-3 border border-gray-200" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Note (optional)</label>
                            <input type="text" value={createForm.note} onChange={(e) => setCreateForm({ ...createForm, note: e.target.value })} className="w-full p-3 border border-gray-200" placeholder="Payment reference or note" />
                        </div>
                        <div className="flex items-end">
                            <button type="submit" disabled={createPayoutMutation.isPending} className="bg-black text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-luxury-gold transition-colors flex items-center gap-2">
                                {createPayoutMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                                Create Payout
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="flex gap-2 mb-6">
                {['', 'PENDING', 'PROCESSING', 'PAID', 'FAILED'].map(s => (
                    <button
                        key={s}
                        onClick={() => { setStatusFilter(s); setPage(1); }}
                        className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-colors ${statusFilter === s ? 'bg-heritage-charcoal text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'}`}
                    >
                        {s || 'All'}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-luxury-gold" size={32} /></div>
            ) : data?.payouts?.length === 0 ? (
                <div className="bg-white rounded-lg shadow-heritage p-12 text-center border border-gray-100">
                    <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-serif text-lg">No payouts found</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-heritage border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-gray-500">Vendor</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-gray-500">Amount</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-gray-500">Period</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-gray-500">Status</th>
                                <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-gray-500">Note</th>
                                <th className="text-right p-4 text-xs font-bold uppercase tracking-widest text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data?.payouts?.map(payout => (
                                <tr key={payout.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <p className="text-sm font-medium text-heritage-charcoal">{payout.vendor?.user?.name || 'Unknown'}</p>
                                        <p className="text-xs text-gray-500">{payout.vendor?.user?.email}</p>
                                    </td>
                                    <td className="p-4 text-sm font-bold">₹{payout.amount?.toLocaleString()}</td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {new Date(payout.periodStart).toLocaleDateString()} — {new Date(payout.periodEnd).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold uppercase tracking-wider rounded-full ${STATUS_COLORS[payout.status] || 'bg-gray-100 text-gray-600'}`}>
                                            {payout.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500 max-w-[200px] truncate">{payout.note || '—'}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {payout.status === 'PENDING' && (
                                                <>
                                                    <button onClick={() => updateStatusMutation.mutate({ id: payout.id, status: 'PROCESSING' })} className="px-3 py-1.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">Process</button>
                                                    <button onClick={() => updateStatusMutation.mutate({ id: payout.id, status: 'FAILED' })} className="px-3 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">Fail</button>
                                                </>
                                            )}
                                            {payout.status === 'PROCESSING' && (
                                                <>
                                                    <button onClick={() => updateStatusMutation.mutate({ id: payout.id, status: 'PAID' })} className="px-3 py-1.5 text-xs font-semibold bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">Mark Paid</button>
                                                    <button onClick={() => updateStatusMutation.mutate({ id: payout.id, status: 'FAILED' })} className="px-3 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">Fail</button>
                                                </>
                                            )}
                                            {(payout.status === 'PAID' || payout.status === 'FAILED') && (
                                                <span className="text-xs text-gray-400 italic">Final</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {data?.pagination?.pages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t border-gray-100">
                            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded ${page <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}>Previous</button>
                            <span className="text-xs text-gray-500">Page {data.pagination.page} of {data.pagination.pages}</span>
                            <button disabled={page >= data.pagination.pages} onClick={() => setPage(p => p + 1)} className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded ${page >= data.pagination.pages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}>Next</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Payouts;
