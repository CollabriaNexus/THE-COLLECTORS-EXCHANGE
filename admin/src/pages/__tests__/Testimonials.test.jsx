import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Testimonials from '../Testimonials';

const mockGet = vi.fn();
const mockPatch = vi.fn();
const mockDelete = vi.fn();

vi.mock('../../hooks/api/apiClient', () => ({
  default: {
    get: (...args) => mockGet(...args),
    patch: (...args) => mockPatch(...args),
    delete: (...args) => mockDelete(...args),
  },
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

describe('Testimonials', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders page title', () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<Testimonials />, { wrapper: createWrapper() });
    expect(screen.getByText('Testimonials')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<Testimonials />, { wrapper: createWrapper() });
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows empty state', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<Testimonials />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('No testimonials found.')).toBeInTheDocument();
    });
  });

  it('renders testimonials with content', async () => {
    mockGet.mockResolvedValue({
      data: [{ id: 't1', authorName: 'Alice', rating: 5, content: 'Great service!', status: 'PENDING', createdAt: '2024-01-01T00:00:00Z', images: [] }],
    });
    render(<Testimonials />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Great service!')).toBeInTheDocument();
    });
  });

  it('approves a pending testimonial', async () => {
    mockPatch.mockResolvedValue({ data: {} });
    mockGet.mockResolvedValue({
      data: [{ id: 't1', authorName: 'Bob', rating: 4, content: 'Nice', status: 'PENDING', createdAt: '2024-01-01T00:00:00Z', images: [] }],
    });
    render(<Testimonials />, { wrapper: createWrapper() });
    await waitFor(() => {
      const approveButtons = document.querySelectorAll('[title="Approve"]');
      fireEvent.click(approveButtons[0]);
    });
    expect(mockPatch).toHaveBeenCalledWith('/testimonials/t1/approve');
  });

  it('rejects a pending testimonial', async () => {
    mockPatch.mockResolvedValue({ data: {} });
    mockGet.mockResolvedValue({
      data: [{ id: 't1', authorName: 'Bob', rating: 3, content: 'Okay', status: 'PENDING', createdAt: '2024-01-01T00:00:00Z', images: [] }],
    });
    render(<Testimonials />, { wrapper: createWrapper() });
    await waitFor(() => {
      const rejectButtons = document.querySelectorAll('[title="Reject"]');
      fireEvent.click(rejectButtons[0]);
    });
    expect(mockPatch).toHaveBeenCalledWith('/testimonials/t1/reject');
  });

  it('deletes a testimonial', async () => {
    mockDelete.mockResolvedValue({ data: {} });
    mockGet.mockResolvedValue({
      data: [{ id: 't1', authorName: 'Alice', rating: 5, content: 'Great!', status: 'APPROVED', createdAt: '2024-01-01T00:00:00Z', images: [] }],
    });
    render(<Testimonials />, { wrapper: createWrapper() });
    await waitFor(() => {
      const deleteButtons = document.querySelectorAll('[title="Delete"]');
      fireEvent.click(deleteButtons[0]);
    });
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('/testimonials/t1');
    });
  });

  it('filters by status', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<Testimonials />, { wrapper: createWrapper() });
    fireEvent.click(screen.getByText('APPROVED'));
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalled();
    });
  });

  it('shows rating stars', async () => {
    mockGet.mockResolvedValue({
      data: [{ id: 't1', authorName: 'Alice', rating: 5, content: 'Great!', status: 'APPROVED', createdAt: '2024-01-01T00:00:00Z', images: [] }],
    });
    render(<Testimonials />, { wrapper: createWrapper() });
    await waitFor(() => {
      const stars = screen.getAllByText('★');
      expect(stars.length).toBeGreaterThanOrEqual(5);
    });
  });

  it('renders testimonial images', async () => {
    mockGet.mockResolvedValue({
      data: [{ id: 't1', authorName: 'Alice', rating: 5, content: 'Nice', status: 'APPROVED', createdAt: '2024-01-01T00:00:00Z', images: ['img1.jpg', 'img2.jpg'] }],
    });
    render(<Testimonials />, { wrapper: createWrapper() });
    await waitFor(() => {
      const imgs = document.querySelectorAll('img');
      expect(imgs.length).toBe(2);
    });
  });
});
