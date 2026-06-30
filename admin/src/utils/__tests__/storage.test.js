import { vi, describe, it, expect, beforeEach } from 'vitest';
import { getUser, setUser, clearUser, getAuthToken, setAuthToken, clearAuthToken, uploadProductImage, uploadGalleryImage } from '../storage';

const { mockUpload, mockGetPublicUrl, mockFrom } = vi.hoisted(() => {
  const mockUpload = vi.fn();
  const mockGetPublicUrl = vi.fn(() => ({ data: { publicUrl: 'https://cdn.example.com/img.jpg' } }));
  const mockFrom = vi.fn(() => ({
    upload: mockUpload,
    getPublicUrl: mockGetPublicUrl,
  }));
  return { mockUpload, mockGetPublicUrl, mockFrom };
});

vi.mock('../supabase', () => ({
  supabase: {
    storage: {
      from: mockFrom,
    },
  },
}));

describe('storage.js', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('user storage', () => {
    it('getUser returns null when no user stored', () => {
      expect(getUser()).toBeNull();
    });

    it('setUser stores and getUser retrieves the user', () => {
      const user = { id: 1, name: 'Admin', role: 'admin' };
      setUser(user);
      expect(getUser()).toEqual(user);
    });

    it('clearUser removes the stored user', () => {
      setUser({ id: 1 });
      clearUser();
      expect(getUser()).toBeNull();
    });

    it('getUser returns null for invalid JSON', () => {
      localStorage.setItem('tce_admin_user', 'not-json');
      expect(getUser()).toBeNull();
    });
  });

  describe('auth token storage', () => {
    it('getAuthToken returns null when no token', () => {
      expect(getAuthToken()).toBeNull();
    });

    it('setAuthToken stores and getAuthToken retrieves the token', () => {
      setAuthToken('my-jwt-token');
      expect(getAuthToken()).toBe('my-jwt-token');
    });

    it('clearAuthToken removes the stored token', () => {
      setAuthToken('token');
      clearAuthToken();
      expect(getAuthToken()).toBeNull();
    });
  });

  describe('uploadProductImage', () => {
    it('throws error when no file provided', async () => {
      await expect(uploadProductImage(null)).rejects.toThrow('No file selected');
    });

    it('uploads a file and returns public URL', async () => {
      mockUpload.mockResolvedValue({ error: null });
      const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
      const url = await uploadProductImage(file);
      expect(mockFrom).toHaveBeenCalledWith('product-images');
      expect(mockUpload).toHaveBeenCalledOnce();
      expect(mockGetPublicUrl).toHaveBeenCalledOnce();
      expect(url).toBe('https://cdn.example.com/img.jpg');
    });

    it('throws on upload error', async () => {
      mockUpload.mockResolvedValue({ error: new Error('Upload failed') });
      const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
      await expect(uploadProductImage(file)).rejects.toThrow('Upload failed');
    });
  });

  describe('uploadGalleryImage', () => {
    it('throws error when no file provided', async () => {
      await expect(uploadGalleryImage(null)).rejects.toThrow('No file selected');
    });

    it('uploads a file to gallery path and returns public URL', async () => {
      mockUpload.mockResolvedValue({ error: null });
      const file = new File(['test'], 'gallery.jpg', { type: 'image/jpeg' });
      const url = await uploadGalleryImage(file);
      expect(mockFrom).toHaveBeenCalledWith('product-images');
      expect(mockUpload.mock.calls[0][0]).toContain('gallery/');
      expect(url).toBe('https://cdn.example.com/img.jpg');
    });

    it('throws on upload error', async () => {
      mockUpload.mockResolvedValue({ error: new Error('Upload failed') });
      const file = new File(['test'], 'gallery.jpg', { type: 'image/jpeg' });
      await expect(uploadGalleryImage(file)).rejects.toThrow('Upload failed');
    });
  });
});
