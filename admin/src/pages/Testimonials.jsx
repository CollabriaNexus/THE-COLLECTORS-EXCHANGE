import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Loader2, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import apiClient from '../hooks/api/apiClient';

function Testimonials() {
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState('');

    const { data: testimonials, isLoading } = useQuery({
        queryKey: ['admin', 'testimonials', statusFilter],
        queryFn: async () => {
            const params = statusFilter ? `?status=${statusFilter}` : '';
            const { data } = await apiClient.get(`/testimonials/all${params}`);
            return data;
        },
    });

    const approveMutation = useMutation({
        mutationFn: async (id) => {
            const { data } = await apiClient.patch(`/testimonials/${id}/approve`);
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] }),
    });

    const rejectMutation = useMutation({
        mutationFn: async (id) => {
            const { data } = await apiClient.patch(`/testimonials/${id}/reject`);
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] }),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { data } = await apiClient.delete(`/testimonials/${id}`);
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] }),
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-serif mb-1">Testimonials</h2>
                    <p className="text-sm text-gray-500">Manage customer testimonials</p>
                </div>
                <div className="flex gap-2">
                    {['', 'PENDING', 'APPROVED', 'REJECTED'].map(s => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-2 text-sm rounded-md transition-colors ${statusFilter === s ? 'bg-heritage-charcoal text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                            {s || 'All'}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-gray-400" /></div>
            ) : testimonials?.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 border border-dashed border-gray-200">
                    <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-serif">No testimonials found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {testimonials?.map(t => (
                        <div key={t.id} className="bg-white border border-gray-100 p-6 flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="font-serif font-bold text-heritage-charcoal">{t.authorName}</span>
                                    <div className="flex gap-0.5">
                                        {[1,2,3,4,5].map(i => (
                                            <span key={i} className={`text-sm ${i <= t.rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                                        ))}
                                    </div>
                                    <span className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">{t.content}</p>
                                {t.images?.length > 0 && (
                                    <div className="flex gap-2 mt-2">
                                        {t.images.map((img, i) => (
                                            <img key={i} src={img} alt="" className="w-14 h-14 object-cover rounded border border-gray-200" />
                                        ))}
                                    </div>
                                )}
                                <p className="text-xs text-gray-400 mt-2">
                                    Status: <span className={`font-medium ${t.status === 'APPROVED' ? 'text-green-600' : t.status === 'REJECTED' ? 'text-red-600' : 'text-amber-600'}`}>{t.status}</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                                {t.status === 'PENDING' && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => approveMutation.mutate(t.id)}
                                            disabled={approveMutation.isPending}
                                            className="p-2 bg-green-50 text-green-600 rounded hover:bg-green-100"
                                            title="Approve"
                                        ><CheckCircle size={18} /></button>
                                        <button
                                            type="button"
                                            onClick={() => rejectMutation.mutate(t.id)}
                                            disabled={rejectMutation.isPending}
                                            className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                                            title="Reject"
                                        ><XCircle size={18} /></button>
                                    </>
                                )}
                                <button
                                    type="button"
                                    onClick={() => { if (window.confirm('Delete this testimonial?')) deleteMutation.mutate(t.id); }}
                                    className="p-2 bg-gray-50 text-gray-500 rounded hover:bg-red-50 hover:text-red-600"
                                    title="Delete"
                                ><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Testimonials;
