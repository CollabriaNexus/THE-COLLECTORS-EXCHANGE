import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Package, Eye, EyeOff, Clock, MessageSquare, Trash2, Plus, Edit3, BadgeIndianRupee } from 'lucide-react';
import { useProductDetail, useApproveProduct, useRejectProduct, useReviewProduct, useUpdateAuthenticityStatus, useDeleteProduct, useUpdateProduct, useBrands, useMarkProductAsSold } from '../hooks/api/useProducts';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [editBrand, setEditBrand] = useState('');
    const [editListingCategory, setEditListingCategory] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [brandInputMode, setBrandInputMode] = useState(false);
    const [customBrand, setCustomBrand] = useState('');
    const [isEditingCategory, setIsEditingCategory] = useState(false);

    const { data: product, isLoading } = useProductDetail(id);
    const { data: brands = [] } = useBrands();
    const approveMutation = useApproveProduct();
    const rejectMutation = useRejectProduct();
    const reviewMutation = useReviewProduct();
    const updateStatusMutation = useUpdateAuthenticityStatus();
    const deleteMutation = useDeleteProduct();
    const updateProductMutation = useUpdateProduct();
    const markAsSoldMutation = useMarkProductAsSold();

    const handleMarkAsSold = async () => {
        if (!window.confirm(`Mark "${product.title}" as sold? This will unpublish the listing.`)) return;
        setError('');
        try {
            await markAsSoldMutation.mutateAsync(id);
            setSuccess('Product marked as sold');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to mark as sold');
        }
    };

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

    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [imageFeedback, setImageFeedback] = useState('');

    const allImages = product?.image
        ? [product.image, ...(product?.images?.filter(img => img !== product.image) || [])]
        : (product?.images || []);

    useEffect(() => {
        if (lightboxIndex === null) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') setLightboxIndex(null);
            if (e.key === 'ArrowLeft' && lightboxIndex > 0) setLightboxIndex(lightboxIndex - 1);
            if (e.key === 'ArrowRight' && lightboxIndex < allImages.length - 1) setLightboxIndex(lightboxIndex + 1);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [lightboxIndex, allImages.length]);

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

    const handleDelete = async () => {
        setError('');
        try {
            await deleteMutation.mutateAsync(id);
            setSuccess('Product deleted');
            setTimeout(() => navigate('/products'), 1500);
        } catch (err) {
            setError(err.message || 'Failed to delete product');
        }
    };

    const handleUpdateProduct = async () => {
        setError('');
        try {
            const fields = {};
            const finalBrand = brandInputMode ? customBrand : editBrand;
            if (finalBrand !== (product.brand || '')) fields.brand = finalBrand;
            if (editListingCategory !== product.listingCategory) fields.listingCategory = editListingCategory;
            if (Object.keys(fields).length === 0) {
                setShowEditModal(false);
                return;
            }
            await updateProductMutation.mutateAsync({ id, ...fields });
            setSuccess('Product updated successfully');
            setShowEditModal(false);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to update product');
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

    const handleOpenEditModal = () => {
        setEditBrand(product.brand || '');
        setEditListingCategory(product.listingCategory || 'normal');
        setBrandInputMode(false);
        setCustomBrand('');
        setShowEditModal(true);
    };

    const handleBrandSelect = (value) => {
        if (value === '__custom__') {
            setBrandInputMode(true);
            setCustomBrand('');
            setEditBrand('');
        } else {
            setBrandInputMode(false);
            setEditBrand(value);
        }
    };

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
                        {product.image ? (
                            <img
                                src={product.image}
                                alt={product.title}
                                className="w-full h-96 object-contain rounded-lg bg-gray-50 cursor-zoom-in"
                                onClick={() => setLightboxIndex(0)}
                            />
                        ) : (
                            <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg text-gray-400">
                                <Package size={64} strokeWidth={1} />
                            </div>
                        )}
                        {allImages.length > 1 && (
                            <div className="flex gap-2 mt-3 overflow-x-auto">
                                {allImages.map((img, i) => (
                                    <img
                                        key={i}
                                        src={img}
                                        alt=""
                                        className={`w-16 h-16 object-cover rounded border-2 cursor-pointer flex-shrink-0 ${i === 0 ? 'border-luxury-gold' : 'border-gray-200 hover:border-gray-400'}`}
                                        onClick={() => setLightboxIndex(i)}
                                        onError={(e) => { e.target.style.display = 'none' }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="bg-white rounded-lg shadow-heritage p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 pb-6 border-b border-gray-100">
                            <div>
                                <dt className="text-xs uppercase tracking-wider font-semibold text-gray-500">Price</dt>
                                <dd className="text-xl font-bold text-luxury-gold mt-1">₹{product.price}</dd>
                            </div>
                            <div>
                                <dt className="text-xs uppercase tracking-wider font-semibold text-gray-500">Category</dt>
                                <dd className="text-sm font-medium text-heritage-charcoal mt-1">{product.category}</dd>
                            </div>
                            <div>
                                <dt className="text-xs uppercase tracking-wider font-semibold text-gray-500">Brand</dt>
                                <dd className="text-sm font-medium text-heritage-charcoal mt-1">{product.brand || 'Not set'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs uppercase tracking-wider font-semibold text-gray-500">Listing</dt>
                                <dd className="text-sm font-medium mt-1">
                                    {isEditingCategory ? (
                                        <div className="flex gap-2">
                                            <select
                                                value={editListingCategory}
                                                onChange={(e) => setEditListingCategory(e.target.value)}
                                                className="px-2 py-1 border border-gray-300 rounded text-xs outline-none focus:ring-2 focus:ring-luxury-gold"
                                                autoFocus
                                            >
                                                <option value="normal">Normal</option>
                                                <option value="featured">Featured</option>
                                                <option value="most_rare">Most Rare</option>
                                            </select>
                                            <button
                                                onClick={async () => {
                                                    if (editListingCategory !== (product.listingCategory || 'normal')) {
                                                        await updateProductMutation.mutateAsync({ id, listingCategory: editListingCategory });
                                                    }
                                                    setIsEditingCategory(false);
                                                }}
                                                className="text-xs text-green-600 hover:underline font-medium"
                                            >Save</button>
                                            <button
                                                onClick={() => {
                                                    setEditListingCategory(product.listingCategory || 'normal');
                                                    setIsEditingCategory(false);
                                                }}
                                                className="text-xs text-gray-500 hover:underline"
                                            >Cancel</button>
                                        </div>
                                    ) : (
                                        <span
                                            onClick={() => {
                                                setEditListingCategory(product.listingCategory || 'normal');
                                                setIsEditingCategory(true);
                                            }}
                                            className={`cursor-pointer inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold ${product.listingCategory === 'most_rare' ? 'bg-purple-100 text-purple-800' : product.listingCategory === 'featured' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                                        >
                                            {product.listingCategory || 'normal'}
                                            <Edit3 size={12} className="opacity-50 group-hover:opacity-100" />
                                        </span>
                                    )}
                                </dd>
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

                            <div className="pt-4 border-t space-y-3">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Product Settings</p>
                                <button
                                    onClick={handleOpenEditModal}
                                    className="w-full flex items-center justify-center gap-2 bg-amber-50 text-amber-700 py-3 rounded-md font-medium hover:bg-amber-100 transition-colors"
                                >
                                    Edit Brand & Category
                                </button>
                                <button
                                    onClick={handleMarkAsSold}
                                    disabled={markAsSoldMutation.isPending || product.status === 'Sold'}
                                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-md font-medium transition-colors ${product.status === 'Sold'
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    }`}
                                >
                                    <BadgeIndianRupee size={18} />
                                    {markAsSoldMutation.isPending ? 'Updating...' : product.status === 'Sold' ? 'Already Sold' : 'Mark as Sold'}
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-700 py-3 rounded-md font-medium hover:bg-red-100 transition-colors"
                                >
                                    <Trash2 size={18} />
                                    Delete Product
                                </button>
                            </div>

                            <div className="pt-4 border-t space-y-3">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Listing Review</p>
                                <textarea
                                    value={imageFeedback}
                                    onChange={(e) => setImageFeedback(e.target.value)}
                                    placeholder="e.g., Blurry image, poor lighting, missing details, incorrect category..."
                                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-luxury-gold outline-none resize-none"
                                ></textarea>
                                <button
                                    onClick={() => {
                                        if (!imageFeedback.trim()) return;
                                        setRejectionReason(imageFeedback);
                                        setShowRejectModal(true);
                                    }}
                                    disabled={!imageFeedback.trim() || rejectMutation.isPending}
                                    className="w-full flex items-center justify-center gap-2 bg-orange-50 text-orange-700 py-2.5 rounded-md text-sm font-medium hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <XCircle size={16} />
                                    Send Remarks & Reject
                                </button>
                                <p className="text-[10px] text-gray-400 leading-relaxed">
                                    Reject with these remarks. The seller will see them on their dashboard and can fix the issues to resubmit for review. For queries, sellers can contact <a href="mailto:support@collectorsexchange.in" className="text-luxury-gold hover:underline">support@collectorsexchange.in</a>.
                                </p>
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
                            <div>
                                <dt className="text-xs font-semibold text-gray-500 uppercase">Seller ID</dt>
                                <dd className="text-xs text-gray-500 mt-1 font-mono">{product.seller?.id || 'N/A'}</dd>
                            </div>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="bg-white rounded-lg shadow-heritage p-6">
                        <h3 className="text-lg font-serif font-bold text-heritage-charcoal mb-4 border-b pb-2">
                            Product Info
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <dt className="text-xs font-semibold text-gray-500 uppercase mb-1">Keywords</dt>
                                <dd className="flex flex-wrap gap-1">
                                    {product.keywords?.length > 0 ? product.keywords.map((kw, i) => (
                                        <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{kw}</span>
                                    )) : <span className="text-sm text-gray-400">None</span>}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold text-gray-500 uppercase mb-1">Images</dt>
                                <dd className="text-sm text-gray-700">{product.images?.length || 1} image(s)</dd>
                                {product.images?.length > 0 && (
                                    <div className="flex gap-1 mt-2 overflow-x-auto">
                                        {product.images.slice(0, 5).map((img, i) => (
                                            <img key={i} src={img} alt="" className="w-12 h-12 object-cover rounded border border-gray-100 flex-shrink-0" onError={(e) => { e.target.style.display = 'none' }} />
                                        ))}
                                        {product.images.length > 5 && (
                                            <span className="w-12 h-12 flex items-center justify-center text-xs text-gray-400 bg-gray-50 rounded border border-gray-100 flex-shrink-0">+{product.images.length - 5}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div>
                                <dt className="text-xs font-semibold text-gray-500 uppercase mb-1">Timeline</dt>
                                <div className="space-y-2 text-xs text-gray-600">
                                    <div className="flex justify-between"><span>Created</span><span>{new Date(product.createdAt).toLocaleString()}</span></div>
                                    <div className="flex justify-between"><span>Last Updated</span><span>{new Date(product.updatedAt).toLocaleString()}</span></div>
                                    {product.reviewedAt && <div className="flex justify-between"><span>Reviewed</span><span>{new Date(product.reviewedAt).toLocaleString()}</span></div>}
                                </div>
                            </div>
                            {product.authenticityStatus !== 'Pending' && (
                                <div>
                                    <dt className="text-xs font-semibold text-gray-500 uppercase mb-1">Authenticity</dt>
                                    <dd className="text-sm">
                                        <StatusBadge status={product.authenticityStatus} />
                                        {product.reviewedBy && <span className="text-xs text-gray-400 ml-2">by {product.reviewedBy}</span>}
                                    </dd>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Lightbox */}
            {lightboxIndex !== null && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
                    onClick={() => setLightboxIndex(null)}
                >
                    <button
                        onClick={() => setLightboxIndex(null)}
                        className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
                    >
                        <XCircle size={32} />
                    </button>
                    <span className="absolute top-4 left-4 text-white/60 text-sm font-mono">
                        {lightboxIndex + 1} / {allImages.length}
                    </span>
                    {lightboxIndex > 0 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
                            className="absolute left-4 text-white/80 hover:text-white"
                        >
                            <ArrowLeft size={36} />
                        </button>
                    )}
                    <img
                        src={allImages[lightboxIndex]}
                        alt=""
                        className="max-w-[90vw] max-h-[90vh] object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                    {lightboxIndex < allImages.length - 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
                            className="absolute right-4 text-white/80 hover:text-white"
                        >
                            <ArrowLeft size={36} className="rotate-180" />
                        </button>
                    )}
                </div>
            )}

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

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Product"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Are you sure you want to delete <strong>{product.title}</strong>? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-end pt-4">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                            className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                        >
                            {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Edit Brand & Listing Category Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Product Settings"
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Brand</label>
                        {brandInputMode ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={customBrand}
                                    onChange={(e) => setCustomBrand(e.target.value)}
                                    placeholder="Enter brand name..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-luxury-gold outline-none"
                                    autoFocus
                                />
                                <button
                                    onClick={() => setBrandInputMode(false)}
                                    className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <select
                                    value={brands.includes(editBrand) ? editBrand : (editBrand ? '__custom__' : '')}
                                    onChange={(e) => handleBrandSelect(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-luxury-gold outline-none"
                                >
                                    <option value="">No brand</option>
                                    {brands.filter(Boolean).map(b => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                    <option value="__custom__">+ Add New Brand...</option>
                                </select>
                                {editBrand && !brands.includes(editBrand) && (
                                    <span className="text-xs text-amber-600 self-center">(custom)</span>
                                )}
                            </div>
                        )}
                        {brandInputMode && (
                            <div className="mt-2 flex gap-2">
                                <button
                                    onClick={() => {
                                        setBrandInputMode(false);
                                        if (customBrand.trim()) {
                                            setEditBrand(customBrand.trim());
                                        }
                                    }}
                                    className="flex items-center gap-1 text-xs text-luxury-gold hover:underline font-medium"
                                >
                                    <Plus size={14} /> Add "{customBrand || 'new brand'}"
                                </button>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Listing Category</label>
                        <select
                            value={editListingCategory}
                            onChange={(e) => setEditListingCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-luxury-gold outline-none"
                        >
                            <option value="normal">Normal</option>
                            <option value="featured">Featured</option>
                            <option value="most_rare">Most Rare</option>
                        </select>
                    </div>
                    <div className="flex gap-3 justify-end pt-4">
                        <button
                            onClick={() => setShowEditModal(false)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpdateProduct}
                            disabled={updateProductMutation.isPending}
                            className="px-6 py-2 bg-luxury-gold text-white rounded-md hover:bg-luxury-gold/90 disabled:opacity-50"
                        >
                            {updateProductMutation.isPending ? 'Saving...' : 'Save Changes'}
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
