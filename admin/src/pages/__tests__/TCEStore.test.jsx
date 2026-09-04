import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TCEStore from '../TCEStore';

const { mockGet, mockPost, mockPatch } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPatch: vi.fn(),
}));

vi.mock('../../hooks/api/apiClient', () => ({
  default: {
    get: (...args) => mockGet(...args),
    post: (...args) => mockPost(...args),
    patch: (...args) => mockPatch(...args),
  },
}));

vi.mock('../../utils/storage', () => ({
  uploadProductImage: vi.fn().mockResolvedValue('https://cdn.example.com/product.jpg'),
}));

vi.mock('react-markdown', () => ({ default: ({ children }) => <div>{children}</div> }));
vi.mock('remark-gfm', () => ({ default: {} }));

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

describe('TCEStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title', () => {
    mockGet.mockResolvedValue({ data: { products: [] } });
    render(<TCEStore />, { wrapper: createWrapper() });
    expect(screen.getByText('TCE Store')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<TCEStore />, { wrapper: createWrapper() });
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows empty state', async () => {
    mockGet.mockResolvedValue({ data: { products: [] } });
    render(<TCEStore />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('No TCE Store products yet')).toBeInTheDocument();
    });
  });

  it('renders product cards', async () => {
    mockGet.mockResolvedValue({
      data: {
        products: [
          {
            id: 'p1',
            title: 'Vintage Watch',
            category: 'Timepieces',
            price: 50000,
            image: 'img.jpg',
            images: ['img.jpg'],
            keywords: ['vintage'],
            condition: 'Excellent',
            description: 'A fine watch',
          },
        ],
      },
    });
    render(<TCEStore />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Vintage Watch')).toBeInTheDocument();
      expect(screen.getByText(/50,000/)).toBeInTheDocument();
    });
  });

  it('opens create form when Add Product is clicked', async () => {
    mockGet.mockResolvedValue({ data: { products: [] } });
    render(<TCEStore />, { wrapper: createWrapper() });
    await waitFor(() => {
      fireEvent.click(screen.getByText('Add Product'));
    });
    expect(screen.getByText('New TCE Listing')).toBeInTheDocument();
  });

  it('creates a new product', async () => {
    mockPost.mockResolvedValue({ data: {} });
    mockGet.mockResolvedValue({ data: { products: [] } });
    render(<TCEStore />, { wrapper: createWrapper() });
    await waitFor(() => {
      fireEvent.click(screen.getByText('Add Product'));
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\., 1950s Hans Wegner/), {
      target: { value: 'New Product' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Separate with commas/), {
      target: { value: 'tag1, tag2' },
    });
    const imageInput = screen.getByPlaceholderText('Primary image URL...');
    fireEvent.change(imageInput, { target: { value: 'https://example.com/img.jpg' } });
    fireEvent.change(screen.getAllByDisplayValue('')[0], { target: { value: '1000' } });
    const textareas = document.querySelectorAll('textarea');
    fireEvent.change(textareas[0], { target: { value: 'Description text' } });
    const submitBtn = screen.getByText('Create Product');
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalled();
    });
  });

  it('starts edit when edit button is clicked on a product card', async () => {
    mockPatch.mockResolvedValue({ data: {} });
    mockGet.mockResolvedValue({
      data: {
        products: [
          {
            id: 'p1',
            title: 'Vintage Watch',
            category: 'Timepieces',
            price: 50000,
            image: 'img.jpg',
            images: ['img.jpg'],
            keywords: ['vintage'],
            condition: 'Excellent',
            description: 'Desc',
          },
        ],
      },
    });
    render(<TCEStore />, { wrapper: createWrapper() });
    await waitFor(() => {
      const editButtons = document.querySelectorAll('[title="Edit product"]');
      fireEvent.click(editButtons[0]);
    });
    expect(screen.getByText('Edit TCE Listing')).toBeInTheDocument();
  });

  it('cancels the form', async () => {
    mockGet.mockResolvedValue({ data: { products: [] } });
    render(<TCEStore />, { wrapper: createWrapper() });
    await waitFor(() => {
      fireEvent.click(screen.getByText('Add Product'));
    });
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('New TCE Listing')).not.toBeInTheDocument();
  });

  it('shows a Live badge on a published, approved product', async () => {
    mockGet.mockResolvedValue({
      data: {
        products: [
          {
            id: 'p1',
            title: 'Test Item',
            category: 'Collectibles',
            price: 100,
            image: 'img.jpg',
            images: ['img.jpg'],
            keywords: ['test'],
            condition: 'Mint',
            description: 'Desc',
            status: 'Approved',
            isPublished: true,
          },
        ],
      },
    });
    render(<TCEStore />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Live')).toBeInTheDocument();
    });
  });

  it('does not claim a sold product is live', async () => {
    // The badge was hard-coded to "Verified" for every card, so a Sold or
    // unpublished TCE listing still advertised itself as live and verified.
    mockGet.mockResolvedValue({
      data: {
        products: [
          {
            id: 'p1',
            title: 'Test Item',
            category: 'Collectibles',
            price: 100,
            image: 'img.jpg',
            images: ['img.jpg'],
            keywords: ['test'],
            condition: 'Mint',
            description: 'Desc',
            status: 'Sold',
            isPublished: false,
          },
        ],
      },
    });
    render(<TCEStore />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Sold')).toBeInTheDocument();
    });
    expect(screen.queryByText('Live')).not.toBeInTheDocument();
  });
});
