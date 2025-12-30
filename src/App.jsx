import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Category from './pages/Category';
import Auction from './pages/Auction';
import Account from './pages/Account';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import About from './pages/About';
import Vision from './pages/Vision';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="category" element={<Category />} />
          <Route path="auction" element={<Auction />} />
          <Route path="vision" element={<Vision />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="account" element={<Account />} />
          <Route path="cart" element={<Cart />} />
          <Route path="privacy" element={<div className="container mx-auto py-12 px-6 text-center font-serif text-2xl">Privacy Policy (Coming Soon)</div>} />
          <Route path="terms" element={<div className="container mx-auto py-12 px-6 text-center font-serif text-2xl">Terms and Conditions (Coming Soon)</div>} />
          <Route path="founders-note" element={<div className="container mx-auto py-12 px-6 text-center font-serif text-2xl">Founders Note (Coming Soon)</div>} />
          <Route path="*" element={<div className="container mx-auto py-12 px-6 text-center font-serif text-2xl">404 - Not Found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
