import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { useKYCDetail, useApproveKYC, useRejectKYC } from '../hooks/api/useKYC';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import KYCDataDisplay from '../components/KYCDataDisplay';
import apiClient from '../hooks/api/apiClient';
import { createKycDocumentResolver } from '../utils/kycDocuments';

function KYCDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: user, isLoading } = useKYCDetail(id);

  // `kyc-documents` is private: a stored path has to be exchanged for a
  // short-lived, service-role-signed URL before it can be rendered. Legacy
  // full-URL references bypass this and still resolve directly.
  const resolveDocUrl = useMemo(
    () => (id ? createKycDocumentResolver(id, apiClient) : undefined),
    [id],
  );
  const approveMutation = useApproveKYC();
  const rejectMutation = useRejectKYC();

  const handleApprove = async () => {
    setError('');
    try {
      await approveMutation.mutateAsync({ id, notes });
      setSuccess('KYC request approved successfully!');
      setShowApproveModal(false);
      setNotes('');
      setTimeout(() => navigate('/kyc'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to approve KYC request');
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      setError('Rejection reason is required');
      return;
    }

    setError('');
    try {
      await rejectMutation.mutateAsync({ id, reason });
      setSuccess('KYC request rejected');
      setShowRejectModal(false);
      setReason('');
      setTimeout(() => navigate('/kyc'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to reject KYC request');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">User not found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/kyc')}
          className="flex items-center gap-2 text-gray-600 hover:text-luxury-gold transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back to KYC Requests</span>
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-serif font-bold text-heritage-charcoal">
              KYC Request Detail
            </h2>
            <p className="text-gray-600 mt-2">Review user information and KYC data</p>
          </div>
          <StatusBadge status={user.kycStatus} />
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Information */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-heritage p-6">
          <h3 className="text-xl font-serif font-bold text-heritage-charcoal mb-4">
            User Information
          </h3>

          <div className="space-y-4">
            <div>
              <dt className="text-sm font-semibold text-heritage-dark">Name</dt>
              <dd className="text-sm text-gray-700 mt-1">{user.name || 'N/A'}</dd>
            </div>

            <div>
              <dt className="text-sm font-semibold text-heritage-dark">Email</dt>
              <dd className="text-sm text-gray-700 mt-1">{user.email}</dd>
            </div>

            <div>
              <dt className="text-sm font-semibold text-heritage-dark">Phone</dt>
              <dd className="text-sm text-gray-700 mt-1">{user.phone || 'Not provided'}</dd>
            </div>

            <div>
              <dt className="text-sm font-semibold text-heritage-dark">Account Type</dt>
              <dd className="text-sm text-gray-700 mt-1 capitalize">{user.type || 'Individual'}</dd>
            </div>

            <div>
              <dt className="text-sm font-semibold text-heritage-dark">Role</dt>
              <dd className="text-sm text-gray-700 mt-1 capitalize">{user.role}</dd>
            </div>

            <div>
              <dt className="text-sm font-semibold text-heritage-dark">Registered</dt>
              <dd className="text-sm text-gray-700 mt-1">
                {new Date(user.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </div>
        </div>

        {/* KYC Data */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-heritage p-6">
          <h3 className="text-xl font-serif font-bold text-heritage-charcoal mb-4">KYC Data</h3>

          <KYCDataDisplay kycData={user.kycData} resolveDocUrl={resolveDocUrl} />
        </div>
      </div>

      {/* Actions */}
      {user.kycStatus === 'pending' && (
        <div className="mt-6 flex gap-4 justify-end">
          <button
            onClick={() => setShowRejectModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors font-medium"
          >
            <XCircle size={20} />
            <span>Reject KYC</span>
          </button>

          <button
            onClick={() => setShowApproveModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-luxury-gold text-white rounded-md hover:bg-luxury-gold/90 transition-colors font-medium"
          >
            <CheckCircle size={20} />
            <span>Approve KYC</span>
          </button>
        </div>
      )}

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve KYC Request"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to approve this KYC request for <strong>{user.name}</strong>?
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-luxury-gold focus:border-transparent outline-none"
              placeholder="Add any notes about this approval..."
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowApproveModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApprove}
              disabled={approveMutation.isPending}
              className="px-6 py-2 bg-luxury-gold text-white rounded-md hover:bg-luxury-gold/90 transition-colors disabled:opacity-50"
            >
              {approveMutation.isPending ? 'Approving...' : 'Approve'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject KYC Request"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Please provide a reason for rejecting this KYC request for <strong>{user.name}</strong>.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              placeholder="Enter reason for rejection..."
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowRejectModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={rejectMutation.isPending}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default KYCDetail;
