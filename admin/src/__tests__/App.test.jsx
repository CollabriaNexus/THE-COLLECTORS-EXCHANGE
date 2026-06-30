import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

vi.mock('../utils/supabase', () => ({
  supabase: { auth: {} },
}));

vi.mock('../utils/storage', () => ({
  getUser: vi.fn(),
  clearUser: vi.fn(),
  clearAuthToken: vi.fn(),
}));

vi.mock('../hooks/api/apiClient', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../pages/Login', () => ({
  default: () => <div>Login Page</div>,
}));

vi.mock('../pages/Dashboard', () => ({
  default: () => <div>Dashboard Page</div>,
}));

vi.mock('../pages/KYCRequests', () => ({
  default: () => <div>KYC Requests Page</div>,
}));

vi.mock('../pages/KYCDetail', () => ({
  default: () => <div>KYC Detail Page</div>,
}));

vi.mock('../pages/Users', () => ({
  default: () => <div>Users Page</div>,
}));

vi.mock('../pages/UserDetail', () => ({
  default: () => <div>User Detail Page</div>,
}));

vi.mock('../pages/Products', () => ({
  default: () => <div>Products Page</div>,
}));

vi.mock('../pages/ProductDetail', () => ({
  default: () => <div>Product Detail Page</div>,
}));

vi.mock('../pages/Orders', () => ({
  default: () => <div>Orders Page</div>,
}));

vi.mock('../pages/OrderDetail', () => ({
  default: () => <div>Order Detail Page</div>,
}));

vi.mock('../pages/Vendors', () => ({
  default: () => <div>Vendors Page</div>,
}));

vi.mock('../pages/GalleryManager', () => ({
  default: () => <div>Gallery Page</div>,
}));

vi.mock('../pages/Payouts', () => ({
  default: () => <div>Payouts Page</div>,
}));

vi.mock('../pages/TCEStore', () => ({
  default: () => <div>TCE Store Page</div>,
}));

vi.mock('../pages/Testimonials', () => ({
  default: () => <div>Testimonials Page</div>,
}));

vi.mock('../pages/PhoneVerifications', () => ({
  default: () => <div>Phone Verifications Page</div>,
}));

vi.mock('../components/AdminLayout', () => ({
  default: ({ children }) => <div>Admin Layout: {children}</div>,
}));

import { getUser } from '../utils/storage';

function renderApp(initialRoute) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login page when not authenticated', () => {
    getUser.mockReturnValue(null);
    renderApp('/login');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders login page when user is not admin', () => {
    getUser.mockReturnValue({ role: 'user' });
    renderApp('/login');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects to login when accessing protected route without auth', () => {
    getUser.mockReturnValue(null);
    renderApp('/');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders dashboard for authenticated admin', () => {
    getUser.mockReturnValue({ role: 'admin', name: 'Admin' });
    renderApp('/');
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });

  it('renders KYC Requests page for admin', () => {
    getUser.mockReturnValue({ role: 'admin' });
    renderApp('/kyc');
    expect(screen.getByText('KYC Requests Page')).toBeInTheDocument();
  });

  it('renders KYC Detail page for admin', () => {
    getUser.mockReturnValue({ role: 'admin' });
    renderApp('/kyc/123');
    expect(screen.getByText('KYC Detail Page')).toBeInTheDocument();
  });

  it('renders Users page for admin', () => {
    getUser.mockReturnValue({ role: 'admin' });
    renderApp('/users');
    expect(screen.getByText('Users Page')).toBeInTheDocument();
  });

  it('renders User Detail page for admin', () => {
    getUser.mockReturnValue({ role: 'admin' });
    renderApp('/users/123');
    expect(screen.getByText('User Detail Page')).toBeInTheDocument();
  });

  it('renders Products page for admin', () => {
    getUser.mockReturnValue({ role: 'admin' });
    renderApp('/products');
    expect(screen.getByText('Products Page')).toBeInTheDocument();
  });

  it('renders Product Detail page for admin', () => {
    getUser.mockReturnValue({ role: 'admin' });
    renderApp('/products/123');
    expect(screen.getByText('Product Detail Page')).toBeInTheDocument();
  });

  it('renders Orders page for admin', () => {
    getUser.mockReturnValue({ role: 'admin' });
    renderApp('/orders');
    expect(screen.getByText('Orders Page')).toBeInTheDocument();
  });

  it('renders Order Detail page for admin', () => {
    getUser.mockReturnValue({ role: 'admin' });
    renderApp('/orders/123');
    expect(screen.getByText('Order Detail Page')).toBeInTheDocument();
  });

  it('renders Vendors page for admin', () => {
    getUser.mockReturnValue({ role: 'admin' });
    renderApp('/vendors');
    expect(screen.getByText('Vendors Page')).toBeInTheDocument();
  });

  it('renders Gallery page for admin', () => {
    getUser.mockReturnValue({ role: 'admin' });
    renderApp('/gallery');
    expect(screen.getByText('Gallery Page')).toBeInTheDocument();
  });

  it('renders Payouts page for admin', () => {
    getUser.mockReturnValue({ role: 'admin' });
    renderApp('/payouts');
    expect(screen.getByText('Payouts Page')).toBeInTheDocument();
  });

  it('renders TCE Store page for admin', () => {
    getUser.mockReturnValue({ role: 'admin' });
    renderApp('/tce-store');
    expect(screen.getByText('TCE Store Page')).toBeInTheDocument();
  });

  it('renders Testimonials page for admin', () => {
    getUser.mockReturnValue({ role: 'admin' });
    renderApp('/testimonials');
    expect(screen.getByText('Testimonials Page')).toBeInTheDocument();
  });

  it('renders Phone Verifications page for admin', () => {
    getUser.mockReturnValue({ role: 'admin' });
    renderApp('/phone-verifications');
    expect(screen.getByText('Phone Verifications Page')).toBeInTheDocument();
  });

  it('redirects unknown routes to dashboard for admin', () => {
    getUser.mockReturnValue({ role: 'admin' });
    renderApp('/unknown-route');
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });
});
