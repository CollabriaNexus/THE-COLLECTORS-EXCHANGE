import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import WhatsAppIcon from './WhatsAppIcon';
import { ScrollProgress } from './Motion';
import { OrganizationSchema, SiteNavigationSchema } from './SEO';

const Layout = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  // Mirrors Header.jsx's own check: the mobile bottom tab bar hides itself
  // while an Account section is open, so the space <main> reserves for it
  // should collapse too, instead of leaving a dead gap at the bottom.
  const isAccountSectionOpen = location.pathname === '/account' && searchParams.has('tab');

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="min-h-screen flex flex-col bg-secondary-bg">
      <OrganizationSchema />
      <SiteNavigationSchema />
      <ScrollProgress />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:text-obsidian focus:px-6 focus:py-3 focus:text-sm focus:uppercase focus:tracking-widest focus:shadow-lg"
      >
        Skip to main content
      </a>
      <Header />
      <main
        id="main-content"
        className={`flex-grow ${isAccountSectionOpen ? 'pb-4' : 'pb-24'} lg:pb-0`}
      >
        <div key={location.pathname} className="animate-page-enter">
          <Outlet />
        </div>
      </main>
      <div className="hidden lg:block">
        <Footer />
      </div>
      <a
        href="https://wa.me/916362771355?text=Hi%2C%20I%27m%20interested%20in%20The%20Collectors%20Exchange."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-24 lg:bottom-8 right-6 z-50 w-12 h-12 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20BD5A] transition-all duration-300 flex items-center justify-center hover:scale-110"
      >
        <WhatsAppIcon size={22} />
      </a>
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={`fixed bottom-24 lg:bottom-8 right-6 z-50 w-12 h-12 rounded-full bg-obsidian text-white shadow-lg hover:bg-luxury-gold hover:text-obsidian transition-all duration-300 flex items-center justify-center ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      >
        <ArrowUp size={20} strokeWidth={2} />
      </button>
    </div>
  );
};

export default Layout;
