import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Package, Eye, EyeOff, Clock, MessageSquare } from 'lucide-react';
import { useProductDetail, useApproveProduct, useRejectProduct, useReviewProduct, useUpdateAuthenticityStatus } from '../hooks/api/useProducts';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { data: product, isLoading } = useProductDetail(id);
    const approveMutation = useApproveProduct();
    const rejectMutation = useRejectProduct();
    const reviewMutation = useReviewProduct();
    const updateStatusMutation = useUpdateAuthenticityStatus();

    const handleReview = async () => {
        setError('');
        try {
            await reviewMutation.mutateAsync(id);
            setSuccess('Product is now under review');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to start review');
        }
    };

    const handleApprove = async () => {
        setError('');
        try {
            await approveMutation.mutateAsync(id);
            setSuccess('Product approved and published successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to approve product');
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            setError('Please provide a reason for rejection');
            return;
        }

        setError('');
        try {
            await rejectMutation.mutateAsync({ id, reason: rejectionReason });
            setSuccess('Product rejected');
            setShowRejectModal(false);
            setRejectionReason('');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to reject product');
        }
    };

    const handleUpdateAuthStatus = async () => {
        if (!selectedStatus) return;

        setError('');
        try {
            await updateStatusMutation.mutateAsync({ id, status: selectedStatus });
            setSuccess('Authenticity status updated!');
            setShowStatusModal(false);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to update status');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">Product not found</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/products')}
                    className="flex items-center gap-2 text-gray-600 hover:text-luxury-gold transition-colors mb-4"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Products</span>
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-heritage-charcoal">
                            {product.title}
                        </h2>
                        <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-gray-500">ID: {product.id}</span>
                            <div className="flex gap-2">
                                <StatusBadge status={product.status} />
                                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${product.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {product.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                                    {product.isPublished ? 'Live on Site' : 'Hidden'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
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
                {/* Product Image & Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Rejection Reason Alert */}
                    {product.status === 'Rejected' && product.rejectionReason && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                            <div className="flex items-start gap-3">
                                <MessageSquare className="text-red-500 mt-1" size={18} />
                                <div>
                                    <h4 className="font-bold text-red-800">Rejection Reason</h4>
                                    <p className="text-red-700 mt-1">{product.rejectionReason}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Image */}
                    <div className="bg-white rounded-lg shadow-heritage p-6">
                        <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-96 object-contain rounded-lg bg-gray-50"
                        />
                    </div>

                    {/* Details */}
                    <div className="bg-white rounded-lg shadow-heritage p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 pb-6 border-b border-gray-100">
                            <div>
                                <dt className="text-xs uppercase tracking-wider font-semibold text-gray-500">Price</dt>
                                <dd className="text-xl font-bold text-luxury-gold mt-1">${product.price}</dd>
                            </div>
                            <div>
                                <dt className="text-xs uppercase tracking-wider font-semibold text-gray-500">Category</dt>
                                <dd className="text-sm font-medium text-heritage-charcoal mt-1">{product.category}</dd>
                            </div>
                            <div>
                                <dt className="text-xs uppercase tracking-wider font-semibold text-gray-500">Condition</dt>
                                <dd className="text-sm font-medium text-heritage-charcoal mt-1">{product.condition}</dd>
                            </div>
                            <div>
                                <dt className="text-xs uppercase tracking-wider font-semibold text-gray-500">Submitted</dt>
                                <dd className="text-sm font-medium text-heritage-charcoal mt-1">
                                    {new Date(product.createdAt).toLocaleDateString()}
                                </dd>
                            </div>
                        </div>

                        <div>
                            <dt className="text-sm font-semibold text-heritage-dark mb-2">Description</dt>
                            <dd className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {product.description}
                            </dd>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Verification Progress */}
                    <div className="bg-white rounded-lg shadow-heritage p-6">
                        <h3 className="text-lg font-serif font-bold text-heritage-charcoal mb-4 border-b pb-2">
                            Verification Panel
                        </h3>

                        <div className="space-y-4">
                            {/* Status Buttons */}
                            <div className="flex flex-col gap-2">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Actions</p>

                                {product.status === 'Pending' && (
                                    <button
                                        onClick={handleReview}
                                        disabled={reviewMutation.isPending}
                                        className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-3 rounded-md font-medium hover:bg-blue-100 transition-colors"
                                    >
                                        <Clock size={18} />
                                        {reviewMutation.isPending ? 'Updating...' : 'Start Review'}
                                    </button>
                                )}

                                <button
                                    onClick={handleApprove}
                                    disabled={approveMutation.isPending || product.status === 'Approved'}
                                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-md font-medium transition-colors ${product.status === 'Approved'
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                                        }`}
                                >
                                    <CheckCircle size={18} />
                                    {approveMutation.isPending ? 'Processing...' : 'Approve & Publish'}
                                </button>

                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    disabled={rejectMutation.isPending || product.status === 'Rejected'}
                                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-md font-medium transition-colors ${product.status === 'Rejected'
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                                        }`}
                                >
                                    <XCircle size={18} />
                                    Reject Product
                                </button>
                            </div>

                            <div className="pt-4 border-t">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Authenticity Info</p>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-gray-600">Current Level</span>
                                    <StatusBadge status={product.authenticityStatus} />
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedStatus(product.authenticityStatus);
                                        setShowStatusModal(true);
                                    }}
                                    className="w-full text-xs text-luxury-gold hover:underline font-medium text-center"
                                >
                                    Change Authenticity Status Manually
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Seller Info */}
                    <div className="bg-white rounded-lg shadow-heritage p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Package className="w-5 h-5 text-luxury-gold" />
                            <h3 className="text-lg font-serif font-bold text-heritage-charcoal">
                                Seller Information
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <dt className="text-xs font-semibold text-gray-500 uppercase">Name</dt>
                                <dd className="text-sm font-bold text-heritage-charcoal mt-1">
                                    {product.seller?.name || 'N/A'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold text-gray-500 uppercase">Email</dt>
                                <dd className="text-sm text-luxury-gold mt-1 break-all">
                                    <a href={`mailto:${product.seller?.email}`}>{product.seller?.email}</a>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold text-gray-500 uppercase">Phone</dt>
                                <dd className="text-sm text-heritage-charcoal mt-1">
                                    {product.seller?.phone ? (
                                        <a href={`tel:${product.seller?.phone}`}>{product.seller?.phone}</a>
                                    ) : 'Not provided'}
                                </dd>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            <Modal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                title="Reason for Rejection"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Please provide a specific reason for rejecting this product. This reason will be visible to the seller on their dashboard.
                    </p>

                    <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="e.g., Image quality too low, missing required details, authenticity could not be verified..."
                        className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none resize-none"
                    ></textarea>

                    <div className="flex gap-3 justify-end pt-4">
                        <button
                            onClick={() => setShowRejectModal(false)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleReject}
                            disabled={rejectMutation.isPending}
                            className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                        >
                            {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Status Modal (Legacy/Manual) */}
            <Modal
                isOpen={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                title="Update Authenticity Status"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        {['Pending', 'Verified', 'Rejected', 'Under Review'].map((status) => (
                            <label
                                key={status}
                                className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer ${selectedStatus === status
                                    ? 'border-luxury-gold bg-luxury-gold/5'
                                    : 'border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="status"
                                    value={status}
                                    checked={selectedStatus === status}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="accent-luxury-gold"
                                />
                                <span className="font-medium">{status}</span>
                            </label>
                        ))}
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                        <button
                            onClick={() => setShowStatusModal(false)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpdateAuthStatus}
                            disabled={updateStatusMutation.isPending}
                            className="px-6 py-2 bg-luxury-gold text-white rounded-md hover:bg-luxury-gold/90 disabled:opacity-50"
                        >
                            {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default ProductDetail;
