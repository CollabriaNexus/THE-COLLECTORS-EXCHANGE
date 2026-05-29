import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-black text-white pt-20 pb-16 lg:pb-10 border-t border-gray-900">
            <div className="container mx-auto px-6 md:px-12 lg:px-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left: Brand */}
                    <div className="lg:col-span-5 flex flex-col space-y-6 text-left">
                        <div>
                            <h2 className="text-2xl font-serif font-bold tracking-widest mb-2">THE COLLECTORS EXCHANGE</h2>
                            <div className="w-16 h-0.5 bg-luxury-gold opacity-70"></div>
                        </div>
                        <p className="text-gray-400 font-light leading-relaxed max-w-sm text-sm">
                            A curated marketplace for verified pre-owned collectibles, antiques, and limited pieces.
                        </p>
                        <p className="font-serif italic text-white text-lg">
                            Preserving Value. Celebrating Authenticity.
                        </p>
                        <div className="pt-2">
                            <p className="text-[10px] uppercase tracking-widest text-luxury-gold mb-2">Contact Us</p>
                            <a href="mailto:support@collectorsexchange.com" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                                <Mail size={14} />
                                support@collectorsexchange.com
                            </a>
                        </div>
                    </div>

                    {/* Right: Links */}
                    <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
                        <div className="flex flex-col space-y-6">
                            <h3 className="text-lg font-serif font-semibold text-luxury-gold uppercase tracking-wider">Company</h3>
                            <div className="flex flex-col space-y-3 font-light text-gray-400 text-sm">
                                <Link to="/THE-COLLECTORS-EXCHANGE/about" className="hover:text-white transition-colors duration-300">About Us</Link>
                                <Link to="/THE-COLLECTORS-EXCHANGE/vision" className="hover:text-white transition-colors duration-300">Our Vision</Link>
                                <Link to="/THE-COLLECTORS-EXCHANGE/founders-note" className="hover:text-white transition-colors duration-300">Founder&rsquo;s Note</Link>
                            </div>
                        </div>
                        <div className="flex flex-col space-y-6">
                            <h3 className="text-lg font-serif font-semibold text-luxury-gold uppercase tracking-wider">Support</h3>
                            <div className="flex flex-col space-y-3 font-light text-gray-400 text-sm">
                                <Link to="/THE-COLLECTORS-EXCHANGE/contact" className="hover:text-white transition-colors duration-300">Contact Us</Link>
                                <Link to="/THE-COLLECTORS-EXCHANGE/faq" className="hover:text-white transition-colors duration-300">FAQ</Link>
                                <Link to="/THE-COLLECTORS-EXCHANGE/seller-agreement" className="hover:text-white transition-colors duration-300">Seller Agreement</Link>
                            </div>
                        </div>
                        <div className="flex flex-col space-y-6">
                            <h3 className="text-lg font-serif font-semibold text-luxury-gold uppercase tracking-wider">Legal</h3>
                            <div className="flex flex-col space-y-3 font-light text-gray-400 text-sm">
                                <Link to="/THE-COLLECTORS-EXCHANGE/terms" className="hover:text-white transition-colors duration-300">Terms &amp; Conditions</Link>
                                <Link to="/THE-COLLECTORS-EXCHANGE/privacy" className="hover:text-white transition-colors duration-300">Privacy Policy</Link>
                                <Link to="/THE-COLLECTORS-EXCHANGE/account" className="hover:text-white transition-colors duration-300">My Account</Link>
                            </div>
                            <div className="flex gap-4 pt-2">
                                <a href="https://www.instagram.com/the_collectors_exchange/?utm_source=ig_web_button_share_sheet" target="_blank" rel="noopener noreferrer" className="text-white hover:text-luxury-gold transition-colors duration-300">
                                    <Instagram size={20} strokeWidth={1.5} />
                                </a>
                                <a href="https://www.facebook.com/share/18mue4rLC4/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-luxury-gold transition-colors duration-300">
                                    <Facebook size={20} strokeWidth={1.5} />
                                </a>
                                <a href="https://x.com/TCE_store" target="_blank" rel="noopener noreferrer" className="text-white hover:text-luxury-gold transition-colors duration-300">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" stroke="none"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                </a>
                                <a href="https://www.linkedin.com/company/thecollectorsexchange" target="_blank" rel="noopener noreferrer" className="text-white hover:text-luxury-gold transition-colors duration-300">
                                    <Linkedin size={20} strokeWidth={1.5} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-900 mt-16 pt-8 text-center">
                    <p className="text-gray-600 text-sm font-light tracking-wide">
                        &copy; {new Date().getFullYear()} The Collectors&rsquo; Exchange. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
