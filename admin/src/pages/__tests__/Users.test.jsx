import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Users from '../Users';

const mockNavigate = vi.fn();
const mockGet = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../hooks/api/apiClient', () => ({
  default: { get: (...args) => mockGet(...args) },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }) => (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
};

describe('Users', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders the page title', () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<Users />, { wrapper: createWrapper() });
    expect(screen.getByText('User Management')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<Users />, { wrapper: createWrapper() });
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows empty message when no users', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<Users />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });

  it('renders users data in table', async () => {
    mockGet.mockResolvedValue({
      data: [{ id: 1, name: 'Alice', email: 'alice@test.com', phone: '1234567890', type: 'Individual', role: 'user', kycStatus: 'verified', createdAt: '2024-01-01' }],
    });
    render(<Users />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('alice@test.com')).toBeInTheDocument();
    });
  });

  it('navigates to user detail on row click', async () => {
    mockGet.mockResolvedValue({ data: [{ id: 'u1', name: 'Bob', email: 'bob@test.com', role: 'user', kycStatus: 'none', createdAt: '2024-01-01' }] });
    render(<Users />, { wrapper: createWrapper() });
    await waitFor(() => {
      fireEvent.click(screen.getByText('Bob'));
    });
    expect(mockNavigate).toHaveBeenCalledWith('/users/u1');
  });

  it('changes role filter', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<Users />, { wrapper: createWrapper() });
    const select = screen.getByDisplayValue('All Roles');
    fireEvent.change(select, { target: { value: 'admin' } });
    await waitFor(() => {
      expect(screen.getByDisplayValue('Admin')).toBeInTheDocument();
    });
  });

  it('searches by query', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<Users />, { wrapper: createWrapper() });
    const searchInput = screen.getByPlaceholderText('Search by name or email...');
    fireEvent.change(searchInput, { target: { value: 'alice' } });
    expect(searchInput.value).toBe('alice');
  });
});
