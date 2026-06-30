import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GalleryManager from '../GalleryManager';

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();

vi.mock('../../hooks/api/apiClient', () => ({
  default: {
    get: (...args) => mockGet(...args),
    post: (...args) => mockPost(...args),
    put: (...args) => mockPut(...args),
    delete: (...args) => mockDelete(...args),
  },
}));

vi.mock('../../utils/storage', () => ({
  uploadGalleryImage: vi.fn().mockResolvedValue('https://cdn.example.com/gallery.jpg'),
}));

vi.mock('../../components/ConfirmDialog', () => ({
  useConfirm: () => vi.fn().mockResolvedValue(true),
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

const mockItems = [
  { id: 'g1', title: 'Mona Lisa', teaser: 'Famous painting', description: 'Desc', images: ['img.jpg'], origin: 'France', timePeriod: '16th Century', institution: 'Louvre', theme: 'World Heritage', significance: 'Important' },
];

describe('GalleryManager', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading spinner', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<GalleryManager />, { wrapper: createWrapper() });
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders the page title', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<GalleryManager />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Gallery')).toBeInTheDocument();
    });
  });

  it('shows empty state when no items', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<GalleryManager />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('No gallery items yet.')).toBeInTheDocument();
    });
  });

  it('renders gallery items', async () => {
    mockGet.mockResolvedValue({ data: mockItems });
    render(<GalleryManager />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Mona Lisa')).toBeInTheDocument();
      expect(screen.getByText('Famous painting')).toBeInTheDocument();
    });
  });

  it('opens create form when Add Item is clicked', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<GalleryManager />, { wrapper: createWrapper() });
    await waitFor(() => {
      fireEvent.click(screen.getByText('Add Item'));
    });
    expect(screen.getByText('New Gallery Item')).toBeInTheDocument();
    expect(screen.getByText('Create Item')).toBeInTheDocument();
  });

  it('creates a new gallery item', async () => {
    mockPost.mockResolvedValue({ data: {} });
    mockGet.mockResolvedValue({ data: [] });
    render(<GalleryManager />, { wrapper: createWrapper() });
    await waitFor(() => {
      fireEvent.click(screen.getByText('Add Item'));
    });
    fireEvent.change(screen.getByPlaceholderText('Item title'), { target: { value: 'New Item' } });
    fireEvent.change(screen.getByPlaceholderText('Short description for cards'), { target: { value: 'Teaser' } });
    fireEvent.change(screen.getByPlaceholderText('Full archival description...'), { target: { value: 'Description' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. India, France'), { target: { value: 'Italy' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. 18th Century'), { target: { value: '18th Century' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. British Museum'), { target: { value: 'Museum' } });
    fireEvent.change(screen.getByPlaceholderText('Why is this item important?'), { target: { value: 'Important' } });
    const themeSelect = screen.getByDisplayValue('Select theme...');
    fireEvent.change(themeSelect, { target: { value: 'World Heritage' } });
    fireEvent.click(screen.getByText('Create Item'));
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalled();
    });
  });

  it('opens edit form and updates item', async () => {
    mockPut.mockResolvedValue({ data: {} });
    mockGet.mockResolvedValue({ data: mockItems });
    render(<GalleryManager />, { wrapper: createWrapper() });
    await waitFor(() => {
      fireEvent.click(screen.getByText('Edit'));
    });
    expect(screen.getByText('Edit Item')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Update Item'));
    await waitFor(() => {
      expect(mockPut).toHaveBeenCalled();
    });
  });

  it('deletes a gallery item', async () => {
    mockDelete.mockResolvedValue({});
    mockGet.mockResolvedValue({ data: mockItems });
    render(<GalleryManager />, { wrapper: createWrapper() });
    await waitFor(() => {
      fireEvent.click(screen.getByText('Delete'));
    });
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('/gallery/g1');
    });
  });

  it('filters by search', async () => {
    mockGet.mockResolvedValue({ data: mockItems });
    render(<GalleryManager />, { wrapper: createWrapper() });
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search items...');
      fireEvent.change(searchInput, { target: { value: 'Mona' } });
    });
  });

  it('filters by theme', async () => {
    mockGet.mockResolvedValue({ data: mockItems });
    render(<GalleryManager />, { wrapper: createWrapper() });
    await waitFor(() => {
      fireEvent.mouseDown(screen.getByText('All Themes'));
    });
  });
});
