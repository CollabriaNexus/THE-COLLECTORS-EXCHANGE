import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-black text-white pt-20 pb-10 border-t border-gray-900">
            <div className="container mx-auto px-6 md:px-12 lg:px-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">

                    {/* Column 1: Company (Left) */}
                    <div className="flex flex-col space-y-6 text-left">
                        <h3 className="text-xl font-serif font-semibold text-luxury-gold uppercase tracking-wider">Company</h3>
                        <div className="flex flex-col space-y-3 font-light text-gray-400">
                            <Link to="/THE-COLLECTORS-EXCHANGE/about" className="hover:text-white transition-colors duration-300">About Us</Link>
                            <Link to="/THE-COLLECTORS-EXCHANGE/vision" className="hover:text-white transition-colors duration-300">Our Vision</Link>
                            <Link to="/THE-COLLECTORS-EXCHANGE/founders-note" className="hover:text-white transition-colors duration-300">Founder’s Note</Link>
                            <Link to="/THE-COLLECTORS-EXCHANGE/terms" className="hover:text-white transition-colors duration-300">Terms & Conditions</Link>
                            <Link to="/THE-COLLECTORS-EXCHANGE/privacy" className="hover:text-white transition-colors duration-300">Privacy Policy</Link>
                        </div>
                    </div>

                    {/* Column 2: Brand (Center) */}
                    <div className="flex flex-col space-y-6 text-center items-center">
                        <div>
                            <h2 className="text-2xl font-serif font-bold tracking-widest mb-2">THE COLLECTORS EXCHANGE</h2>
                            <div className="w-16 h-0.5 bg-luxury-gold mx-auto opacity-70"></div>
                        </div>

                        <p className="text-gray-400 font-light leading-relaxed max-w-xs mx-auto">
                            A curated marketplace for verified pre-owned collectibles, antiques, and limited pieces.
                        </p>

                        <p className="font-serif italic text-white text-lg">
                            Preserving Value. Celebrating Authenticity.
                        </p>

                        <div className="pt-4">
                            <p className="text-xs uppercase tracking-widest text-luxury-gold mb-2">Contact Us</p>
                            <a href="mailto:support@collectorsexchange.com" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                                <Mail size={16} />
                                support@collectorsexchange.com
                            </a>
                        </div>
                    </div>

                    {/* Column 3: Follow Us (Right) */}
                    <div className="flex flex-col space-y-6 md:text-right md:items-end">
                        <h3 className="text-xl font-serif font-semibold text-luxury-gold uppercase tracking-wider">Follow Us</h3>

                        <div className="flex gap-6">
                            <a href="https://www.instagram.com/the_collectors_exchange/?utm_source=ig_web_button_share_sheet" target="_blank" rel="noopener noreferrer" className="text-white hover:text-luxury-gold transition-colors duration-300">
                                <Instagram size={24} strokeWidth={1.5} />
                            </a>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-luxury-gold transition-colors duration-300">
                                <Facebook size={24} strokeWidth={1.5} />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-luxury-gold transition-colors duration-300">
                                <Twitter size={24} strokeWidth={1.5} />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-luxury-gold transition-colors duration-300">
                                <Linkedin size={24} strokeWidth={1.5} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-900 mt-20 pt-8 text-center">
                    <p className="text-gray-600 text-sm font-light tracking-wide">
                        &copy; {new Date().getFullYear()} The Collectors’ Exchange. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
