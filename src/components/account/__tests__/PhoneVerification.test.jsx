import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PhoneVerification from '../PhoneVerification';

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      post: vi.fn(),
      interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
    })),
  },
}));

vi.mock('../../../hooks/api/apiClient', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('PhoneVerification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders phone input', () => {
    render(<PhoneVerification />);
    expect(screen.getByPlaceholderText(/phone/i)).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<PhoneVerification />);
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('submits phone number', async () => {
    const { default: apiClient } = await import('../../../hooks/api/apiClient');
    apiClient.post.mockResolvedValue({ data: { success: true } });
    render(<PhoneVerification />);
    fireEvent.change(screen.getByPlaceholderText(/phone/i), { target: { value: '1234567890' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/users/phone/submit', { phone: '1234567890' });
    });
  });

  it('shows success state after submission', async () => {
    const { default: apiClient } = await import('../../../hooks/api/apiClient');
    apiClient.post.mockResolvedValue({ data: { success: true } });
    render(<PhoneVerification />);
    fireEvent.change(screen.getByPlaceholderText(/phone/i), { target: { value: '1234567890' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByText(/submitted/i)).toBeInTheDocument();
    });
  });
});
