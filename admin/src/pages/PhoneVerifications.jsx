import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Phone, Loader2, CheckCircle, XCircle } from 'lucide-react';
import apiClient from '../hooks/api/apiClient';

function PhoneVerifications() {
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState('pending');

    const { data: users, isLoading } = useQuery({
        queryKey: ['admin', 'phone-verifications', statusFilter],
        queryFn: async () => {
            const params = statusFilter ? `?status=${statusFilter}` : '';
            const { data } = await apiClient.get(`/users/phone/verifications${params}`);
            return data;
        },
    });

    const approveMutation = useMutation({
        mutationFn: async (userId) => {
            const { data } = await apiClient.patch(`/users/phone/${userId}/approve`);
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'phone-verifications'] }),
    });

    const rejectMutation = useMutation({
        mutationFn: async (userId) => {
            const { data } = await apiClient.patch(`/users/phone/${userId}/reject`);
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'phone-verifications'] }),
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-serif mb-1">Phone Verifications</h2>
                    <p className="text-sm text-gray-500">Manually verify user phone numbers</p>
                </div>
                <div className="flex gap-2">
                    {['pending', 'verified', 'rejected', ''].map(s => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-2 text-sm rounded-md transition-colors ${statusFilter === s ? 'bg-heritage-charcoal text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-gray-400" /></div>
            ) : users?.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 border border-dashed border-gray-200">
                    <Phone size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-serif">No phone verifications found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {users?.map(u => (
                        <div key={u.id} className="bg-white border border-gray-100 p-6 flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="font-serif font-bold text-heritage-charcoal">{u.name || 'Unknown'}</span>
                                    <span className="text-xs text-gray-400">{u.email}</span>
                                </div>
                                <p className="text-sm text-gray-700">
                                    <span className="font-medium">Phone:</span> {u.phone || 'N/A'}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                    Status: <span className={`font-medium ${u.phoneVerificationStatus === 'verified' ? 'text-green-600' : u.phoneVerificationStatus === 'rejected' ? 'text-red-600' : 'text-amber-600'}`}>{u.phoneVerificationStatus}</span>
                                    &nbsp;· Submitted {new Date(u.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            {u.phoneVerificationStatus === 'pending' && (
                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        type="button"
                                        onClick={() => approveMutation.mutate(u.id)}
                                        disabled={approveMutation.isPending}
                                        className="p-2 bg-green-50 text-green-600 rounded hover:bg-green-100"
                                        title="Approve"
                                    ><CheckCircle size={18} /></button>
                                    <button
                                        type="button"
                                        onClick={() => rejectMutation.mutate(u.id)}
                                        disabled={rejectMutation.isPending}
                                        className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                                        title="Reject"
                                    ><XCircle size={18} /></button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PhoneVerifications;
