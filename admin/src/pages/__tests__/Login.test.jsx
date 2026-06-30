import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Login';

const mockNavigate = vi.fn();
const mockSignInWithPassword = vi.fn();
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
      signInWithPassword: (...args) => mockSignInWithPassword(...args),
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

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUser.mockReturnValue(null);
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
    delete window.location;
    window.location = { href: '', origin: 'http://localhost' };
  });

  it('renders the login form', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByText('THE COLLECTORS EXCHANGE')).toBeInTheDocument();
    expect(screen.getByText('Admin Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
  });

  it('updates email and password fields', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    const emailInput = screen.getByPlaceholderText('admin@example.com');
    const passInput = screen.getByPlaceholderText('••••••••');
    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
    fireEvent.change(passInput, { target: { value: 'secret' } });
    expect(emailInput.value).toBe('admin@test.com');
    expect(passInput.value).toBe('secret');
  });

  it('shows error when login fails', async () => {
    mockSignInWithPassword.mockRejectedValue(new Error('Invalid credentials'));
    render(<MemoryRouter><Login /></MemoryRouter>);
    fireEvent.change(screen.getByPlaceholderText('admin@example.com'), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByText('Sign In'));
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('shows error for non-admin role after auto-register', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { session: { access_token: 'token123' } },
      error: null,
    });
    mockGet.mockRejectedValue({ response: { status: 404 } });
    mockPost.mockResolvedValue({ data: { role: 'user' } });
    render(<MemoryRouter><Login /></MemoryRouter>);
    fireEvent.change(screen.getByPlaceholderText('admin@example.com'), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password' } });
    fireEvent.click(screen.getByText('Sign In'));
    await waitFor(() => {
      expect(screen.getByText('Access denied. Admin privileges required.')).toBeInTheDocument();
    });
  });

  it('successfully logs in admin user', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { session: { access_token: 'token123' } },
      error: null,
    });
    mockGet.mockResolvedValue({ data: { role: 'admin', name: 'Admin' } });

    render(<MemoryRouter><Login /></MemoryRouter>);
    fireEvent.change(screen.getByPlaceholderText('admin@example.com'), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password' } });
    fireEvent.click(screen.getByText('Sign In'));
    await waitFor(() => {
      expect(setAuthToken).toHaveBeenCalledWith('token123');
      expect(setUser).toHaveBeenCalledWith({ role: 'admin', name: 'Admin' });
    });
  });

  it('disables button while loading', () => {
    mockSignInWithPassword.mockReturnValue(new Promise(() => {}));
    render(<MemoryRouter><Login /></MemoryRouter>);
    fireEvent.change(screen.getByPlaceholderText('admin@example.com'), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'p' } });
    fireEvent.click(screen.getByText('Sign In'));
    expect(screen.getByText('Signing in...')).toBeInTheDocument();
  });

  it('handles Google login', async () => {
    mockSignInWithOAuth.mockResolvedValue({
      data: { url: 'https://accounts.google.com/o/oauth2/auth' },
      error: null,
    });
    render(<MemoryRouter><Login /></MemoryRouter>);
    fireEvent.click(screen.getByText('Sign in with Google'));
    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalled();
    });
  });
});
