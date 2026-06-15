import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Category from './pages/Category';
import Auction from './pages/Auction';
import Account from './pages/Account';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import About from './pages/About';
import AboutUs from "./pages/AboutUs";
import Vision from './pages/Vision';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import FoundersNote from './pages/FoundersNote';
import ProductDetail from './pages/ProductDetail';
import GalleryPage from './pages/GalleryPage';
import GalleryDetail from './pages/GalleryDetail';
import GalleryArticle from './pages/GalleryArticle';
import SellerAgreement from './pages/SellerAgreement';
import Checkout from './pages/Checkout';
import VendorDashboard from './pages/VendorDashboard';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Returns from './pages/Returns';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { HelmetProvider } from 'react-helmet-async';
import { pageview } from './utils/gtag';

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
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/gallery/:id" element={<GalleryDetail />} />
          <Route path="/gallery/article/:slug" element={<GalleryArticle />} />
          <Route path="/seller-agreement" element={<SellerAgreement />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/vendor-dashboard" element={<VendorDashboard />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/returns" element={<Returns />} />
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
      </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
