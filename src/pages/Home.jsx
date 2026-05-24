import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, UserCheck, Star, ArrowRight, Wallet, Archive } from 'lucide-react';
import Bullet from '../components/Bullet';
import heroVideo from '../assets/hero_section.mp4';
import verificationAuthenticity from '../assets/verification_authenticity.png';

const Home = () => {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative h-[85vh] min-h-[600px] flex flex-col justify-center items-center px-6 text-center overflow-hidden">
                <video
                    src={heroVideo}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                    autoPlay
                    muted
                    playsInline
                />
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-black/50"></div>

                <div className="container mx-auto max-w-4xl relative z-10">
                    <h5 className="text-luxury-gold tracking-[0.2em] font-sans text-sm font-semibold uppercase mb-4">
                        Authorized & Premium
                    </h5>
                    <h1 className="text-5xl md:text-7xl font-serif text-white font-bold mb-6 leading-tight drop-shadow-lg">
                        A Marketplace for Authentic <span className="italic text-luxury-gold">Collectibles</span> & Timeless Antiques
                    </h1>
                    <p className="text-xl text-gray-200 font-sans font-light mb-10 max-w-2xl mx-auto">
                        Verified. Original. Limited. Discover a curated world of rare finds and verified sellers.
                    </p>
                    <div className="flex flex-col md:flex-row justify-center gap-6">
                        <Link to="/THE-COLLECTORS-EXCHANGE/category" className="bg-luxury-gold text-black px-8 py-4 font-sans text-sm tracking-widest hover:bg-white transition-colors duration-300">
                            EXPLORE THE EXCHANGE
                        </Link>
                        <Link to="/THE-COLLECTORS-EXCHANGE/auction" className="bg-transparent text-white border border-white px-8 py-4 font-sans text-sm tracking-widest hover:bg-white hover:text-black transition-colors duration-300">
                            VIEW AUCTIONS
                        </Link>
                    </div>
                </div>
            </section>

            {/* Marketplace Overview */}
            <section className="py-12 sm:py-16 lg:py-20 px-6 bg-secondary-bg">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 text-center">
                        <div className="p-6 sm:p-8 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                            <Archive className="mx-auto text-luxury-gold mb-6 w-10 h-10 sm:w-12 sm:h-12" />
                            <h3 className="text-xl sm:text-2xl font-serif mb-4">Curated Collection</h3>
                            <p className="text-gray-600 font-sans font-light">
                                From vintage artifacts to limited edition luxury goods, every item is hand-picked for its uniqueness.
                            </p>
                        </div>
                        <div className="p-6 sm:p-8 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                            <ShieldCheck className="mx-auto text-luxury-gold mb-6 w-10 h-10 sm:w-12 sm:h-12" />
                            <h3 className="text-xl sm:text-2xl font-serif mb-4">Authenticity Verified</h3>
                            <p className="text-gray-600 font-sans font-light text-sm sm:text-base">
                                We verify products with brands and experts to ensure 100% originality. No replicas, no fakes.
                            </p>
                        </div>
                        <div className="p-6 sm:p-8 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 sm:col-span-2 lg:col-span-1">
                            <UserCheck className="mx-auto text-luxury-gold mb-6 w-10 h-10 sm:w-12 sm:h-12" />
                            <h3 className="text-xl sm:text-2xl font-serif mb-4">Trusted Sellers</h3>
                            <p className="text-gray-600 font-sans font-light">
                                Sellers are strictly vetted with mandatory KYC and compliance checks before they can list.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Verification Works */}
            <section className="py-12 sm:py-16 lg:py-20 px-6 bg-primary-bg">
                <div className="container mx-auto max-w-5xl flex flex-col lg:flex-row items-center gap-10 sm:gap-14 lg:gap-16">
                    <div className="lg:w-1/2">
                        <h2 className="text-3xl sm:text-4xl font-serif mb-6 leading-tight">The Standard of <br /> <span className="text-luxury-gold">Authenticity</span></h2>
                        <p className="text-gray-600 mb-6 font-light leading-relaxed">
                            At The Collectors Exchange, trust is our currency. Our rigorous verification process ensures that every item you purchase is genuine.
                        </p>
                        <ul className="space-y-4 font-sans text-gray-700">
                            <li className="flex items-center gap-4">
                                <Bullet className="text-luxury-gold" />
                                Direct verification with respective brands
                            </li>
                            <li className="flex items-center gap-4">
                                <Bullet className="text-luxury-gold" />
                                Expert appraisal for antiques
                            </li>
                            <li className="flex items-center gap-4">
                                <Bullet className="text-luxury-gold" />
                                Transparent history and provenance
                            </li>
                        </ul>
                    </div>
                    <div className="lg:w-1/2 h-[300px] sm:h-[350px] lg:h-[400px] w-full overflow-hidden rounded-sm shadow-heritage">
                        <img
                            src={verificationAuthenticity}
                            alt="Verification & Authenticity"
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                    </div>
                </div>
            </section>

            {/* Seller Policy Summary */}
            <section className="py-12 sm:py-16 lg:py-20 px-6 bg-black text-white text-center">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif mb-8">Sell with Confidence</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-12 text-left bg-gray-900 p-6 sm:p-10 border border-gray-800">
                        <div>
                            <h4 className="text-xl font-serif text-luxury-gold mb-2">Individual Sellers</h4>
                            <ul className="text-gray-400 space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                    <Bullet className="text-luxury-gold mt-1 w-2 h-2" />
                                    Mandatory KYC (Aadhaar/PAN)
                                </li>
                                <li className="flex items-start gap-2">
                                    <Bullet className="text-luxury-gold mt-1 w-2 h-2" />
                                    Limit of 5 listings per account
                                </li>
                                <li className="flex items-start gap-2">
                                    <Bullet className="text-luxury-gold mt-1 w-2 h-2" />
                                    Strict manual approval
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xl font-serif text-luxury-gold mb-2">Company Sellers</h4>
                            <ul className="text-gray-400 space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                    <Bullet className="text-luxury-gold mt-1 w-2 h-2" />
                                    GST & Founder verification required
                                </li>
                                <li className="flex items-start gap-2">
                                    <Bullet className="text-luxury-gold mt-1 w-2 h-2" />
                                    Company profile approval
                                </li>
                                <li className="flex items-start gap-2">
                                    <Bullet className="text-luxury-gold mt-1 w-2 h-2" />
                                    Unlimited listings (post-approval)
                                </li>
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
