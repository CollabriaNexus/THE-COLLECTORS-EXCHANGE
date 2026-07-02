import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { ConfirmProvider } from './components/ConfirmDialog';
import { HelmetProvider } from 'react-helmet-async';
import { pageview } from './utils/gtag';

const Home = lazy(() => import('./pages/Home'));
const Category = lazy(() => import('./pages/Category'));
const Auction = lazy(() => import('./pages/Auction'));
const Account = lazy(() => import('./pages/Account'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Cart = lazy(() => import('./pages/Cart'));
const About = lazy(() => import('./pages/About'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Vision = lazy(() => import('./pages/Vision'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const FoundersNote = lazy(() => import('./pages/FoundersNote'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const SellerAgreement = lazy(() => import('./pages/SellerAgreement'));
const Checkout = lazy(() => import('./pages/Checkout'));
const VendorDashboard = lazy(() => import('./pages/VendorDashboard'));
const Contact = lazy(() => import('./pages/Contact'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Returns = lazy(() => import('./pages/Returns'));
const Links = lazy(() => import('./pages/Links'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function GATracker() {
  const { pathname } = useLocation();
  useEffect(() => { pageview(pathname); }, [pathname]);
  return null;
}

function App() {
  return (
    <HelmetProvider>
    <BrowserRouter>
      <ScrollToTop />
      <GATracker />
      <ErrorBoundary>
      <ToastProvider>
      <ConfirmProvider>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 font-serif text-lg italic">Loading the archive...</p>
          </div>
        </div>
      }>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about-us" element={<AboutUs />} />
          <Route path="/about" element={<About />} />
          <Route path="/category" element={<Category />} />
          <Route path="/auction" element={<Auction />} />
          <Route path="/vision" element={<Vision />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/account" element={<Account />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/founders-note" element={<FoundersNote />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/archive" element={<BlogPage />} />
          <Route path="/archive/:slug" element={<BlogPost />} />
          <Route path="/seller-agreement" element={<SellerAgreement />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/vendor-dashboard" element={<VendorDashboard />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/links" element={<Links />} />
          <Route path="*" element={
            <div className="container mx-auto py-24 px-6 text-center">
              <h1 className="text-6xl font-serif text-luxury-gold mb-6">404</h1>
              <p className="text-xl text-gray-500 mb-8">This archive record could not be located.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/" className="bg-black text-white px-8 py-4 text-sm uppercase tracking-widest hover:bg-luxury-gold transition-colors">Return Home</Link>
                <Link to="/category" className="border border-black px-8 py-4 text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-colors">Browse The Exchange</Link>
              </div>
            </div>
          } />
        </Route>
      </Routes>
      </Suspense>
      </ConfirmProvider>
      </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
