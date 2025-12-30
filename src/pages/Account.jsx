import React, { useState } from 'react';
import { User, FileText, Package, Heart, LogOut } from 'lucide-react';

const Account = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [sellerType, setSellerType] = useState('individual'); // 'individual' or 'company'
    const [kycStatus, setKycStatus] = useState('pending'); // 'none', 'pending', 'verified'

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="bg-white p-8 shadow-sm border border-gray-100">
                        <h3 className="text-2xl font-serif mb-6">Profile Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                <input type="text" defaultValue="John Doe" className="w-full p-3 border border-gray-300 focus:outline-none focus:border-luxury-gold" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                <input type="email" defaultValue="john@example.com" className="w-full p-3 border border-gray-300 focus:outline-none focus:border-luxury-gold" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                <input type="tel" defaultValue="+1 234 567 8900" className="w-full p-3 border border-gray-300 focus:outline-none focus:border-luxury-gold" />
                            </div>
                        </div>
                        <button className="mt-6 bg-black text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-luxury-gold transition-colors">
                            Save Changes
                        </button>
                    </div>
                );
            case 'seller':
                return (
                    <div className="bg-white p-8 shadow-sm border border-gray-100">
                        <h3 className="text-2xl font-serif mb-6">Seller Verification</h3>

                        {kycStatus === 'verified' && (
                            <div className="bg-green-50 text-green-700 p-4 border border-green-200 mb-6">
                                Your seller account is verified. You can now list products.
                            </div>
                        )}

                        <div className="flex gap-6 mb-8 border-b border-gray-200 pb-2">
                            <button
                                onClick={() => setSellerType('individual')}
                                className={`text-sm uppercase tracking-widest pb-2 ${sellerType === 'individual' ? 'border-b-2 border-black font-semibold' : 'text-gray-400'}`}
                            >
                                Individual Seller
                            </button>
                            <button
                                onClick={() => setSellerType('company')}
                                className={`text-sm uppercase tracking-widest pb-2 ${sellerType === 'company' ? 'border-b-2 border-black font-semibold' : 'text-gray-400'}`}
                            >
                                Company Seller
                            </button>
                        </div>

                        <form className="space-y-6">
                            {sellerType === 'individual' ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Aadhaar / ID Number</label>
                                        <input type="text" placeholder="Enter ID Number" className="w-full p-3 border border-gray-300 focus:outline-none focus:border-luxury-gold" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Upload PAN Card</label>
                                        <input type="file" className="w-full p-2 border border-gray-300" />
                                    </div>
                                    <p className="text-xs text-gray-500">Individual sellers are limited to 5 active listings.</p>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
                                        <input type="text" placeholder="Registered Company Name" className="w-full p-3 border border-gray-300 focus:outline-none focus:border-luxury-gold" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">GST Number</label>
                                        <input type="text" placeholder="GST Number" className="w-full p-3 border border-gray-300 focus:outline-none focus:border-luxury-gold" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Incorporation Certificate</label>
                                        <input type="file" className="w-full p-2 border border-gray-300" />
                                    </div>
                                    <p className="text-xs text-gray-500">Company sellers must be approved before listing limitless items.</p>
                                </>
                            )}
                            <button className="bg-black text-white px-8 py-3 text-sm uppercase tracking-widest hover:bg-luxury-gold transition-colors">
                                Submit for Verification
                            </button>
                        </form>
                    </div>
                );
            case 'listings':
                return (
                    <div className="bg-white p-8 shadow-sm border border-gray-100 text-center py-20">
                        <Package size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-serif text-gray-600">No Active Listings</h3>
                        <p className="text-gray-400 mb-6">Complete verification to start selling.</p>
                        <button
                            onClick={() => setActiveTab('seller')}
                            className="text-luxury-gold font-semibold hover:underline"
                        >
                            Go to Verification
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto py-12 px-6">
            <h1 className="text-4xl font-serif mb-8">My Account</h1>
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full md:w-1/4 bg-white shadow-sm border border-gray-100 h-fit">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="font-semibold">John Doe</p>
                                <p className="text-xs text-gray-500">Individual</p>
                            </div>
                        </div>
                    </div>
                    <nav className="p-4">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`flex items-center gap-3 w-full p-3 rounded-md text-left transition-colors ${activeTab === 'profile' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <User size={18} /> Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('seller')}
                            className={`flex items-center gap-3 w-full p-3 rounded-md text-left transition-colors ${activeTab === 'seller' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <FileText size={18} /> Verification
                        </button>
                        <button
                            onClick={() => setActiveTab('listings')}
                            className={`flex items-center gap-3 w-full p-3 rounded-md text-left transition-colors ${activeTab === 'listings' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Package size={18} /> My Listings
                        </button>
                        <button className="flex items-center gap-3 w-full p-3 rounded-md text-left text-red-500 hover:bg-red-50 transition-colors mt-4">
                            <LogOut size={18} /> Logout
                        </button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="w-full md:w-3/4">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Account;
