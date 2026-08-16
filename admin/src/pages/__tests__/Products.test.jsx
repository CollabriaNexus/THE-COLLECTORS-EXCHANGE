import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Products from '../Products';

const mockNavigate = vi.fn();
const mockGet = vi.fn();
const mockPatch = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../hooks/api/apiClient', () => ({
  default: {
    get: (...args) => mockGet(...args),
    patch: (...args) => mockPatch(...args),
  },
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

describe('Products', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title', () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<Products />, { wrapper: createWrapper() });
    expect(screen.getByText('Product Management')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<Products />, { wrapper: createWrapper() });
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows empty message when no products', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<Products />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('No products found')).toBeInTheDocument();
    });
  });

  it('renders product data in table', async () => {
    mockGet.mockResolvedValue({
      data: [
        {
          id: 1,
          title: 'Vintage Watch',
          category: 'Timepieces',
          price: 50000,
          seller: { name: 'Seller1' },
          status: 'Pending',
          isPublished: false,
          createdAt: '2024-01-01',
          image: 'http://example.com/img.jpg',
        },
      ],
    });
    render(<Products />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Vintage Watch')).toBeInTheDocument();
      expect(screen.getAllByText('Timepieces')[0]).toBeInTheDocument();
      expect(screen.getByText('Hidden')).toBeInTheDocument();
    });
  });

  it('toggles product visibility', async () => {
    mockGet.mockResolvedValue({
      data: [
        {
          id: 1,
          title: 'Product A',
          category: 'Collectibles',
          price: 100,
          seller: { name: 'Seller' },
          status: 'Approved',
          isPublished: true,
          createdAt: '2024-01-01',
          image: '',
        },
      ],
    });
    mockPatch.mockResolvedValue({ data: {} });
    render(<Products />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Public')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Public'));
    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith('/admin/products/1', { isPublished: false });
    });
  });

  it('renders the seller unpublish remark for hidden products', async () => {
    mockGet.mockResolvedValue({
      data: [
        {
          id: 1,
          title: 'Product A',
          category: 'Collectibles',
          price: 100,
          seller: { name: 'Seller' },
          status: 'Approved',
          isPublished: false,
          unpublishRemark: 'Sold offline at an exhibition',
          createdAt: '2024-01-01',
          image: '',
        },
      ],
    });
    render(<Products />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Sold offline at an exhibition')).toBeInTheDocument();
    });
  });

  it('navigates to product detail on row click', async () => {
    mockGet.mockResolvedValue({
      data: [
        {
          id: 1,
          title: 'Product A',
          category: 'Collectibles',
          price: 100,
          seller: { name: 'Seller' },
          status: 'Approved',
          isPublished: true,
          createdAt: '2024-01-01',
          image: '',
        },
      ],
    });
    render(<Products />, { wrapper: createWrapper() });
    await waitFor(() => {
      fireEvent.click(screen.getByText('Product A'));
    });
    expect(mockNavigate).toHaveBeenCalledWith('/products/1');
  });

  it('updates search input', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<Products />, { wrapper: createWrapper() });
    const searchInput = screen.getByPlaceholderText('Search by title or description...');
    fireEvent.change(searchInput, { target: { value: 'watch' } });
    expect(searchInput.value).toBe('watch');
  });

  it('changes category filter', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<Products />, { wrapper: createWrapper() });
    const select = screen.getByDisplayValue('All Categories');
    fireEvent.change(select, { target: { value: 'Timepieces' } });
    await waitFor(() => {
      expect(screen.getByDisplayValue('Timepieces')).toBeInTheDocument();
    });
  });

  it('changes status filter', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<Products />, { wrapper: createWrapper() });
    const select = screen.getByDisplayValue('All Statuses');
    fireEvent.change(select, { target: { value: 'Pending' } });
    await waitFor(() => {
      expect(screen.getByDisplayValue('Pending')).toBeInTheDocument();
    });
  });
});
