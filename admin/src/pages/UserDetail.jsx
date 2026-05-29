import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Package, ShoppingCart, Heart, Ban, CheckCircle } from 'lucide-react';
import { useUserDetail, useUpdateUserRole, useWhitelistVendor, useBanUser, useUnbanUser } from '../hooks/api/useUsers';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';

function UserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { data: user, isLoading } = useUserDetail(id);
    const updateRoleMutation = useUpdateUserRole();
    const whitelistVendorMutation = useWhitelistVendor();
    const banMutation = useBanUser();
    const unbanMutation = useUnbanUser();

    const handleUpdateRole = async () => {
        if (!selectedRole) return;

        setError('');
        try {
            await updateRoleMutation.mutateAsync({ id, role: selectedRole });
            setSuccess('User role updated successfully!');
            setShowRoleModal(false);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to update role');
        }
    };

    const handleWhitelistVendor = async () => {
        setError('');
        try {
            await whitelistVendorMutation.mutateAsync({ userId: id, plan: 'CUSTOM_APPROVED' });
            setSuccess('User whitelisted as Bulk Vendor successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to whitelist vendor');
        }
    };

    const handleBan = async () => {
        setError('');
        try {
            await banMutation.mutateAsync(id);
            setSuccess('User banned successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to ban user');
        }
    };

    const handleUnban = async () => {
        setError('');
        try {
            await unbanMutation.mutateAsync(id);
            setSuccess('User unbanned successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to unban user');
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
                    onClick={() => navigate('/users')}
                    className="flex items-center gap-2 text-gray-600 hover:text-luxury-gold transition-colors mb-4"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Users</span>
                </button>

                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-heritage-charcoal">
                            User Details
                        </h2>
                        <p className="text-gray-600 mt-2">
                            View and manage user information
                        </p>
                    </div>
                    <StatusBadge status={user.role} />
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
                {/* User Info */}
                <div className="bg-white rounded-lg shadow-heritage p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-heritage-beige p-4 rounded-full">
                            <User className="w-8 h-8 text-heritage-dark" />
                        </div>
                        <div>
                            <h3 className="text-xl font-serif font-bold text-heritage-charcoal">
                                {user.name || 'Unnamed User'}
                            </h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
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
                            <dd className="mt-1"><StatusBadge status={user.role} /></dd>
                        </div>
                        <div>
                            <dt className="text-sm font-semibold text-heritage-dark">KYC Status</dt>
                            <dd className="mt-1"><StatusBadge status={user.kycStatus} /></dd>
                        </div>
                        <div>
                            <dt className="text-sm font-semibold text-heritage-dark">Account Status</dt>
                            <dd className="mt-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.banned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                    {user.banned ? 'Banned' : 'Active'}
                                </span>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-semibold text-heritage-dark">Registered</dt>
                            <dd className="text-sm text-gray-700 mt-1">
                                {new Date(user.createdAt).toLocaleString()}
                            </dd>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                        <button
                            onClick={() => {
                                setSelectedRole(user.role);
                                setShowRoleModal(true);
                            }}
                            className="w-full bg-luxury-gold text-white py-2 rounded-md font-medium hover:bg-luxury-gold/90 transition-colors"
                        >
                            Change Role
                        </button>

                        {/* Ban / Unban Button */}
                    <div className="pt-4 border-t border-gray-200">
                        {user.banned ? (
                            <button
                                onClick={handleUnban}
                                disabled={unbanMutation.isPending}
                                className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2 rounded-md font-medium hover:bg-green-100 transition-colors"
                            >
                                <CheckCircle size={18} />
                                {unbanMutation.isPending ? 'Unbanning...' : 'Unban User'}
                            </button>
                        ) : (
                            <button
                                onClick={handleBan}
                                disabled={banMutation.isPending}
                                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-700 py-2 rounded-md font-medium hover:bg-red-100 transition-colors"
                            >
                                <Ban size={18} />
                                {banMutation.isPending ? 'Banning...' : 'Ban User'}
                            </button>
                        )}
                    </div>

                    {/* Whitelist Vendor Button */}
                        {user.kycStatus === 'verified' && (
                            <div className="pt-4 border-t border-gray-100">
                                <h4 className="text-sm font-semibold text-heritage-charcoal mb-2 font-serif">Vendor Subscription</h4>
                                <div className="bg-gray-50 p-3 rounded border border-gray-100 mb-3 text-xs text-gray-600 space-y-1">
                                    <p><strong>Vendor Status:</strong> <span className="capitalize">{user.vendor?.status || 'None'}</span></p>
                                    <p><strong>Vendor Type:</strong> <span className="capitalize">{user.vendor?.type || 'Not initialized'}</span></p>
                                    <p><strong>Max Listings:</strong> {user.vendor?.maxListings ?? 5}</p>
                                    {user.vendor?.subscription && (
                                        <p><strong>Plan:</strong> {user.vendor.subscription.plan} ({user.vendor.subscription.status})</p>
                                    )}
                                </div>
                                {user.vendor?.type !== 'BULK' && (
                                    <button
                                        onClick={handleWhitelistVendor}
                                        disabled={whitelistVendorMutation.isPending}
                                        className="w-full border border-heritage-charcoal text-heritage-charcoal py-2 rounded-md font-medium hover:bg-heritage-charcoal hover:text-white transition-all text-sm uppercase tracking-wider"
                                    >
                                        {whitelistVendorMutation.isPending ? 'Whitelisting...' : 'Whitelist as Bulk Vendor'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>


                {/* Stats */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Products */}
                    <div className="bg-white rounded-lg shadow-heritage p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Package className="w-5 h-5 text-luxury-gold" />
                            <h3 className="text-lg font-serif font-bold text-heritage-charcoal">
                                Listed Products ({user.products?.length || 0})
                            </h3>
                        </div>
                        {user.products?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {user.products.slice(0, 4).map((product) => (
                                    <div key={product.id} className="flex gap-3 p-3 bg-gray-50 rounded-md">
                                        <img
                                            src={product.image}
                                            alt={product.title}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                        <div>
                                            <p className="font-medium text-sm">{product.title}</p>
                                            <p className="text-xs text-gray-500">₹{product.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No products listed</p>
                        )}
                    </div>

                    {/* Cart & Wishlist */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow-heritage p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <ShoppingCart className="w-5 h-5 text-luxury-gold" />
                                <h3 className="text-lg font-serif font-bold text-heritage-charcoal">
                                    Cart ({user.cart?.length || 0})
                                </h3>
                            </div>
                            <p className="text-gray-500 text-sm">
                                {user.cart?.length || 0} items in cart
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-heritage p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Heart className="w-5 h-5 text-luxury-gold" />
                                <h3 className="text-lg font-serif font-bold text-heritage-charcoal">
                                    Wishlist ({user.wishlist?.length || 0})
                                </h3>
                            </div>
                            <p className="text-gray-500 text-sm">
                                {user.wishlist?.length || 0} items in wishlist
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Role Modal */}
            <Modal
                isOpen={showRoleModal}
                onClose={() => setShowRoleModal(false)}
                title="Change User Role"
            >
                <div className="space-y-4">
                    <p className="text-gray-700">
                        Select a new role for <strong>{user.name || user.email}</strong>:
                    </p>

                    <div className="space-y-2">
                        {['user', 'admin', 'curator'].map((role) => (
                            <label
                                key={role}
                                className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer ${selectedRole === role
                                        ? 'border-luxury-gold bg-luxury-gold/5'
                                        : 'border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="role"
                                    value={role}
                                    checked={selectedRole === role}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="accent-luxury-gold"
                                />
                                <span className="capitalize font-medium">{role}</span>
                            </label>
                        ))}
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                        <button
                            onClick={() => setShowRoleModal(false)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpdateRole}
                            disabled={updateRoleMutation.isPending}
                            className="px-6 py-2 bg-luxury-gold text-white rounded-md hover:bg-luxury-gold/90 disabled:opacity-50"
                        >
                            {updateRoleMutation.isPending ? 'Updating...' : 'Update Role'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default UserDetail;
