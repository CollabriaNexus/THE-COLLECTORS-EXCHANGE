import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { HelmetProvider } from 'react-helmet-async';

function App() {
  return (
    <HelmetProvider>
    <BrowserRouter>
      <ErrorBoundary>
      <ToastProvider>
      <Routes>
        <Route path="/THE-COLLECTORS-EXCHANGE/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about-us" element={<AboutUs />} />
          <Route path="/THE-COLLECTORS-EXCHANGE/about" element={<About />} />
          <Route path="/THE-COLLECTORS-EXCHANGE/category" element={<Category />} />
          <Route path="/THE-COLLECTORS-EXCHANGE/auction" element={<Auction />} />
          <Route path="/THE-COLLECTORS-EXCHANGE/vision" element={<Vision />} />
          <Route path="/THE-COLLECTORS-EXCHANGE/wishlist" element={<Wishlist />} />
          <Route path="/THE-COLLECTORS-EXCHANGE/account" element={<Account />} />
          <Route path="/THE-COLLECTORS-EXCHANGE/cart" element={<Cart />} />
          <Route path="/THE-COLLECTORS-EXCHANGE/privacy" element={<Privacy />} />
          <Route path="/THE-COLLECTORS-EXCHANGE/terms" element={<Terms />} />
          <Route path="/THE-COLLECTORS-EXCHANGE/founders-note" element={<FoundersNote />} />
          <Route path="/THE-COLLECTORS-EXCHANGE/product/:id" element={<ProductDetail />} />
          <Route path="/THE-COLLECTORS-EXCHANGE/gallery" element={<GalleryPage />} />
          <Route path="/THE-COLLECTORS-EXCHANGE/gallery/:id" element={<GalleryDetail />} />
          <Route path="/THE-COLLECTORS-EXCHANGE/gallery/article/:slug" element={<GalleryArticle />} />
          <Route path="/THE-COLLECTORS-EXCHANGE/seller-agreement" element={<SellerAgreement />} />
          <Route path="/THE-COLLECTORS-EXCHANGE/checkout" element={<Checkout />} />
          <Route path="/THE-COLLECTORS-EXCHANGE/vendor-dashboard" element={<VendorDashboard />} />
          <Route path="*" element={<div className="container mx-auto py-12 px-6 text-center font-serif text-2xl">404 - Not Found</div>} />
        </Route>
      </Routes>
      </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
