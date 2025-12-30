import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-black text-white pt-16 pb-8">
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Brand Column */}
                <div className="flex flex-col space-y-4">
                    <h2 className="text-2xl font-serif font-bold">THE COLLECTORS EXCHANGE</h2>
                    <p className="text-gray-400 italic">"Preserving Value. Celebrating Authenticity."</p>
                </div>

                {/* Links Column */}
                <div className="flex flex-col space-y-2">
                    <h3 className="text-lg font-serif font-semibold mb-2 text-luxury-gold">Explore</h3>
                    <Link to="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link>
                    <Link to="/category" className="text-gray-300 hover:text-white transition-colors">Categories</Link>
                    <Link to="/auction" className="text-gray-300 hover:text-white transition-colors">Auctions</Link>
                    <Link to="/vision" className="text-gray-300 hover:text-white transition-colors">Our Vision</Link>
                </div>

                {/* Policies / Contact */}
                <div className="flex flex-col space-y-2">
                    <h3 className="text-lg font-serif font-semibold mb-2 text-luxury-gold">Legal & Support</h3>
                    <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</Link>
                    <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">Terms and Conditions</Link>
                    <Link to="/founders-note" className="text-gray-300 hover:text-white transition-colors">Founders Note</Link>
                </div>
            </div>

            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} The Collectors Exchange. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
