import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test/utils';
import Account from '../Account';

vi.mock('../../hooks/api/useUser', () => ({
  useMe: vi.fn(() => ({
    data: { id: 'user1', name: 'Test User', email: 'test@test.com' },
    isLoading: false,
  })),
  useUpdateProfile: vi.fn(() => ({ mutate: vi.fn(), isLoading: false })),
  useSubmitKyc: vi.fn(() => ({ mutate: vi.fn(), isLoading: false })),
  useRegisterUser: vi.fn(() => ({ mutate: vi.fn(), isLoading: false })),
}));

vi.mock('../../hooks/api/useCart', () => ({
  useCart: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock('../../hooks/api/useWishlist', () => ({
  useWishlist: vi.fn(() => ({ data: [], isLoading: false })),
  useAddToWishlist: vi.fn(() => ({ mutate: vi.fn(), isLoading: false })),
  useRemoveFromWishlist: vi.fn(() => ({ mutate: vi.fn(), isLoading: false })),
}));

vi.mock('../../hooks/api/useOrders', () => ({
  useMyOrders: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock('../../hooks/api/useNotifications', () => ({
  useNotifications: vi.fn(() => ({ data: [], isLoading: false })),
  useMarkNotificationRead: vi.fn(() => ({ mutate: vi.fn() })),
  useMarkAllNotificationsRead: vi.fn(() => ({ mutate: vi.fn() })),
}));

vi.mock('../../hooks/api/useProducts', () => ({
  useAddProduct: vi.fn(() => ({ mutate: vi.fn(), isLoading: false })),
  useDeleteProduct: vi.fn(() => ({ mutate: vi.fn(), isLoading: false })),
  useAddBulkProducts: vi.fn(() => ({ mutate: vi.fn(), isLoading: false })),
  useUpdateProduct: vi.fn(() => ({ mutate: vi.fn(), isLoading: false })),
  useMarkAsSold: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(() => Promise.resolve()),
    isLoading: false,
  })),
}));

vi.mock('../../hooks/api/useVendor', () => ({
  useVendorProfile: vi.fn(() => ({ data: null, isLoading: false })),
  useVendorStats: vi.fn(() => ({ data: null, isLoading: false })),
}));

vi.mock('../../hooks/api/useTestimonials', () => ({
  useTestimonials: vi.fn(() => ({ data: [], isLoading: false })),
  useSubmitTestimonial: vi.fn(() => ({ mutate: vi.fn(), isLoading: false })),
}));

vi.mock('../../utils/storage', () => ({
  getUser: vi.fn(() => ({ id: 'user1', name: 'Test User' })),
  setUser: vi.fn(),
  clearUser: vi.fn(),
  uploadProductImage: vi.fn(),
  uploadKycDocument: vi.fn(),
  uploadTestimonialImage: vi.fn(),
}));

vi.mock('../../components/Toast', () => ({
  useToast: vi.fn(() => vi.fn()),
}));

vi.mock('../../components/ConfirmDialog', () => ({
  useConfirm: vi.fn(() => vi.fn(() => Promise.resolve(true))),
}));

vi.mock('../../utils/supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithOAuth: vi.fn(() => Promise.resolve({ data: null, error: null })),
      updateUser: vi.fn(() => Promise.resolve({ data: null, error: null })),
    },
  },
}));

vi.mock('../../hooks/api/apiClient', () => ({
  default: { post: vi.fn(), get: vi.fn() },
}));

const renderAccount = () => renderWithProviders(<Account />, { route: '/account' });

describe('Account', () => {
  // Account gates its UI behind an async Supabase session check
  // ("Authenticating Profile..."), so every assertion has to wait for it.
  it('renders the account shell once the session check resolves', async () => {
    renderAccount();
    expect(await screen.findByRole('heading', { name: /collector profile/i })).toBeInTheDocument();
  });

  it('renders tab navigation', async () => {
    renderAccount();
    // Section labels come from the `sections` list in Account.jsx. They are
    // rendered twice (desktop sidebar + mobile section index), so match all.
    expect((await screen.findAllByText('My Orders')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Listings').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Notifications').length).toBeGreaterThan(0);
  });

  it('renders edit profile section', async () => {
    renderAccount();
    // The profile card is headed "Collector Profile" (there is no
    // "Personal Information" heading in the current markup).
    expect(await screen.findByRole('heading', { name: /collector profile/i })).toBeInTheDocument();
  });
});
