import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Login';

// The admin login is Google-OAuth only — the email/password form was removed,
// so the old placeholder-based tests ('admin@example.com', '••••••••',
// 'Sign In') no longer describe the page. It also gates its whole UI behind an
// async session check ("Verifying session..."), so assertions must await it.

const mockNavigate = vi.fn();
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }));
const mockSignOut = vi.fn();
const mockSignInWithOAuth = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../utils/supabase', () => ({
  supabase: {
    auth: {
      getSession: (...args) => mockGetSession(...args),
      onAuthStateChange: (...args) => mockOnAuthStateChange(...args),
      signOut: (...args) => mockSignOut(...args),
      signInWithOAuth: (...args) => mockSignInWithOAuth(...args),
    },
  },
}));

vi.mock('../../utils/storage', () => ({
  getUser: vi.fn(() => null),
  setUser: vi.fn(),
  setAuthToken: vi.fn(),
}));

const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock('../../hooks/api/apiClient', () => ({
  default: {
    get: (...args) => mockGet(...args),
    post: (...args) => mockPost(...args),
  },
}));

import { getUser, setUser, setAuthToken } from '../../utils/storage';

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );

const activeSession = {
  access_token: 'token123',
  user: { email: 'admin@test.com' },
};

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUser.mockReturnValue(null);
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
    mockSignOut.mockResolvedValue({ error: null });
    delete window.location;
    window.location = { href: '', origin: 'http://localhost' };
  });

  it('shows the session-check state before rendering the form', () => {
    renderLogin();
    expect(screen.getByText(/verifying session/i)).toBeInTheDocument();
  });

  it('renders the login form', async () => {
    renderLogin();
    expect(await screen.findByText('THE COLLECTORS EXCHANGE')).toBeInTheDocument();
    expect(screen.getByText('Admin Login')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
  });

  it('shows error for non-admin role after auto-register', async () => {
    mockGetSession.mockResolvedValue({ data: { session: activeSession } });
    mockGet.mockRejectedValue({ response: { status: 404 } });
    mockPost.mockResolvedValue({ data: { role: 'user' } });
    renderLogin();
    expect(
      await screen.findByText('Access denied. Admin privileges required.'),
    ).toBeInTheDocument();
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('shows error for a non-admin existing account', async () => {
    mockGetSession.mockResolvedValue({ data: { session: activeSession } });
    mockGet.mockResolvedValue({ data: { role: 'user', name: 'Someone' } });
    renderLogin();
    expect(
      await screen.findByText('Access denied. Admin privileges required.'),
    ).toBeInTheDocument();
    expect(setUser).not.toHaveBeenCalled();
  });

  it('successfully logs in an admin user from an existing session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: activeSession } });
    mockGet.mockResolvedValue({ data: { role: 'admin', name: 'Admin' } });
    renderLogin();
    await waitFor(() => {
      expect(setAuthToken).toHaveBeenCalledWith('token123');
      expect(setUser).toHaveBeenCalledWith({ role: 'admin', name: 'Admin' });
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('redirects straight to the dashboard for an already-stored admin', async () => {
    getUser.mockReturnValue({ role: 'admin', name: 'Admin' });
    renderLogin();
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
    expect(mockGetSession).not.toHaveBeenCalled();
  });

  it('handles Google login', async () => {
    mockSignInWithOAuth.mockResolvedValue({
      data: { url: 'https://accounts.google.com/o/oauth2/auth' },
      error: null,
    });
    renderLogin();
    fireEvent.click(await screen.findByRole('button', { name: /sign in with google/i }));
    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: { redirectTo: 'http://localhost/login' },
      });
    });
    expect(window.location.href).toBe('https://accounts.google.com/o/oauth2/auth');
  });

  it('shows an error when Google login fails', async () => {
    mockSignInWithOAuth.mockResolvedValue({ data: null, error: new Error('OAuth blew up') });
    renderLogin();
    fireEvent.click(await screen.findByRole('button', { name: /sign in with google/i }));
    expect(await screen.findByText('OAuth blew up')).toBeInTheDocument();
  });
});
