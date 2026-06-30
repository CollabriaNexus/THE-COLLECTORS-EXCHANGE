import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminLayout from '../AdminLayout';

const { mockSignOut, mockNavigate } = vi.hoisted(() => ({
  mockSignOut: vi.fn(),
  mockNavigate: vi.fn(),
}));

vi.mock('../../utils/supabase', () => ({
  supabase: { auth: { signOut: (...args) => mockSignOut(...args) } },
}));

vi.mock('../../utils/storage', () => ({
  getUser: vi.fn(),
  clearUser: vi.fn(),
  clearAuthToken: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import { getUser, clearUser, clearAuthToken } from '../../utils/storage';

describe('AdminLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the layout with user greeting', () => {
    getUser.mockReturnValue({ name: 'Admin User', email: 'admin@test.com' });
    render(
      <MemoryRouter>
        <AdminLayout>
          <div>Page Content</div>
        </AdminLayout>
      </MemoryRouter>
    );
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome back, Admin User')).toBeInTheDocument();
    expect(screen.getByText('admin@test.com')).toBeInTheDocument();
    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });

  it('renders welcome with email when name is absent', () => {
    getUser.mockReturnValue({ email: 'admin@test.com' });
    render(
      <MemoryRouter>
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      </MemoryRouter>
    );
    expect(screen.getByText('Welcome back, admin@test.com')).toBeInTheDocument();
  });

  it('handles logout successfully', async () => {
    getUser.mockReturnValue({ name: 'Admin' });
    mockSignOut.mockResolvedValue({});
    render(
      <MemoryRouter>
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText('Logout'));
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(clearUser).toHaveBeenCalled();
      expect(clearAuthToken).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });
  });

  it('handles logout when signOut throws', async () => {
    getUser.mockReturnValue({ name: 'Admin' });
    mockSignOut.mockRejectedValue(new Error('Sign out failed'));
    render(
      <MemoryRouter>
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText('Logout'));
    await waitFor(() => {
      expect(clearUser).toHaveBeenCalled();
      expect(clearAuthToken).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });
  });

  it('renders sidebar', () => {
    getUser.mockReturnValue({ name: 'Admin' });
    render(
      <MemoryRouter>
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      </MemoryRouter>
    );
    expect(screen.getByText('TCE ADMIN')).toBeInTheDocument();
  });
});
