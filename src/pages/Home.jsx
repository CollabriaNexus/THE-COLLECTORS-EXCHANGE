import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, UserCheck, Star, ArrowRight, Wallet, Archive } from 'lucide-react';

const Home = () => {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="bg-primary-bg py-20 md:py-32 px-6 text-center border-b border-gray-100">
                <div className="container mx-auto max-w-4xl">
                    <h5 className="text-luxury-gold tracking-[0.2em] font-sans text-sm font-semibold uppercase mb-4">
                        Authorized & Premium
                    </h5>
                    <h1 className="text-5xl md:text-7xl font-serif text-text-main font-bold mb-6 leading-tight">
                        A Marketplace for Authentic <span className="italic">Collectibles</span> & Timeless Antiques
                    </h1>
                    <p className="text-xl text-gray-600 font-sans font-light mb-10 max-w-2xl mx-auto">
                        Verified. Original. Limited. Discover a curated world of rare finds and verified sellers.
                    </p>
                    <div className="flex flex-col md:flex-row justify-center gap-6">
                        <Link to="/category" className="bg-black text-white px-8 py-4 font-sans text-sm tracking-widest hover:bg-luxury-gold transition-colors duration-300">
                            EXPLORE CATEGORIES
                        </Link>
                        <Link to="/auction" className="bg-white text-black border border-black px-8 py-4 font-sans text-sm tracking-widest hover:bg-black hover:text-white transition-colors duration-300">
                            VIEW AUCTIONS
                        </Link>
                    </div>
                </div>
            </section>

            {/* Marketplace Overview */}
            <section className="py-20 px-6 bg-secondary-bg">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div className="p-8 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                            <Archive className="mx-auto text-luxury-gold mb-6" size={48} />
                            <h3 className="text-2xl font-serif mb-4">Curated Collection</h3>
                            <p className="text-gray-600 font-sans font-light">
                                From vintage artifacts to limited edition luxury goods, every item is hand-picked for its uniqueness.
                            </p>
                        </div>
                        <div className="p-8 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                            <ShieldCheck className="mx-auto text-luxury-gold mb-6" size={48} />
                            <h3 className="text-2xl font-serif mb-4">Authenticity Verified</h3>
                            <p className="text-gray-600 font-sans font-light">
                                We verify products with brands and experts to ensure 100% originality. No replicas, no fakes.
                            </p>
                        </div>
                        <div className="p-8 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                            <UserCheck className="mx-auto text-luxury-gold mb-6" size={48} />
                            <h3 className="text-2xl font-serif mb-4">Trusted Sellers</h3>
                            <p className="text-gray-600 font-sans font-light">
                                Sellers are strictly vetted with mandatory KYC and compliance checks before they can list.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Verification Works */}
            <section className="py-20 px-6 bg-primary-bg">
                <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-16">
                    <div className="md:w-1/2">
                        <h2 className="text-4xl font-serif mb-6 leading-tight">The Standard of <br /> <span className="text-luxury-gold">Authenticity</span></h2>
                        <p className="text-gray-600 mb-6 font-light leading-relaxed">
                            At The Collectors Exchange, trust is our currency. Our rigorous verification process ensures that every item you purchase is genuine.
                        </p>
                        <ul className="space-y-4 font-sans text-gray-700">
                            <li className="flex items-center gap-4">
                                <div className="w-2 h-2 bg-luxury-gold rounded-full"></div>
                                Direct verification with respective brands
                            </li>
                            <li className="flex items-center gap-4">
                                <div className="w-2 h-2 bg-luxury-gold rounded-full"></div>
                                Expert appraisal for antiques
                            </li>
                            <li className="flex items-center gap-4">
                                <div className="w-2 h-2 bg-luxury-gold rounded-full"></div>
                                Transparent history and provenance
                            </li>
                        </ul>
                    </div>
                    <div className="md:w-1/2 bg-secondary-bg p-12 text-center border border-gray-100">
                        <ShieldCheck size={100} className="text-black mx-auto opacity-10" />
                        <p className="mt-4 text-sm tracking-widest uppercase text-gray-500">Verified & Secure</p>
                    </div>
                </div>
            </section>

            {/* Seller Policy Summary */}
            <section className="py-20 px-6 bg-black text-white text-center">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-3xl md:text-4xl font-serif mb-8">Sell with Confidence</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left bg-gray-900 p-10 border border-gray-800">
                        <div>
                            <h4 className="text-xl font-serif text-luxury-gold mb-2">Individual Sellers</h4>
                            <ul className="text-gray-400 space-y-2 text-sm">
                                <li>• Mandatory KYC (Aadhaar/PAN)</li>
                                <li>• Limit of 5 listings per account</li>
                                <li>• Strict manual approval</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xl font-serif text-luxury-gold mb-2">Company Sellers</h4>
                            <ul className="text-gray-400 space-y-2 text-sm">
                                <li>• GST & Founder verification required</li>
                                <li>• Company profile approval</li>
                                <li>• Unlimited listings (post-approval)</li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-10">
                        <Link to="/account" className="inline-flex items-center gap-2 text-white border-b border-luxury-gold pb-1 hover:text-luxury-gold transition-colors">
                            Start Selling <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
