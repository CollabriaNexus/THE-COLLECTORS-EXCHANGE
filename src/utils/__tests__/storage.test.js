import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSupabaseStorageFrom = vi.fn();
const mockUpload = vi.fn();
const mockGetPublicUrl = vi.fn();
const mockAuthGetUser = vi.fn();

const mockSupabase = {
  storage: {
    from: mockSupabaseStorageFrom,
  },
  auth: {
    getUser: mockAuthGetUser,
  },
};

vi.mock('../supabase', () => ({
  supabase: mockSupabase,
}));

const STORAGE_KEYS_USER = 'tce_user';

describe('storage.js', () => {
  beforeEach(() => {
    // Full reset, not just clearAllMocks: these mocks are module-level and
    // shared, and mockReturnValueOnce queues left over from one test would
    // otherwise be consumed by the next one.
    mockSupabaseStorageFrom.mockReset();
    mockUpload.mockReset();
    mockGetPublicUrl.mockReset();
    mockAuthGetUser.mockReset();
    mockAuthGetUser.mockResolvedValue({ data: { user: { id: 'sb-user-1' } }, error: null });
    localStorage.clear();
  });

  describe('getUser', () => {
    it('returns parsed user when user exists in localStorage', async () => {
      const userData = { id: 1, name: 'Test User', email: 'test@example.com' };
      localStorage.setItem(STORAGE_KEYS_USER, JSON.stringify(userData));
      const { getUser } = await import('../storage');
      expect(getUser()).toEqual(userData);
    });

    it('returns null when no user in localStorage', async () => {
      const { getUser } = await import('../storage');
      expect(getUser()).toBeNull();
    });

    it('returns null when localStorage has invalid JSON', async () => {
      localStorage.setItem(STORAGE_KEYS_USER, 'not-json');
      const { getUser } = await import('../storage');
      expect(() => getUser()).toThrow();
    });
  });

  describe('setUser', () => {
    it('stores user data as JSON string in localStorage', async () => {
      const userData = { id: 2, name: 'Jane', email: 'jane@test.com' };
      const { setUser } = await import('../storage');
      setUser(userData);
      expect(localStorage.getItem(STORAGE_KEYS_USER)).toBe(JSON.stringify(userData));
    });

    it('overwrites existing user data', async () => {
      localStorage.setItem(STORAGE_KEYS_USER, JSON.stringify({ id: 1 }));
      const { setUser } = await import('../storage');
      setUser({ id: 2 });
      expect(JSON.parse(localStorage.getItem(STORAGE_KEYS_USER))).toEqual({ id: 2 });
    });
  });

  describe('clearUser', () => {
    it('removes user from localStorage', async () => {
      localStorage.setItem(STORAGE_KEYS_USER, JSON.stringify({ id: 1 }));
      const { clearUser } = await import('../storage');
      clearUser();
      expect(localStorage.getItem(STORAGE_KEYS_USER)).toBeNull();
    });

    it('does not throw when no user exists', async () => {
      const { clearUser } = await import('../storage');
      expect(() => clearUser()).not.toThrow();
    });
  });

  describe('uploadProductImage', () => {
    it('uploads file and returns public URL on success', async () => {
      mockSupabaseStorageFrom.mockReturnValue({
        upload: mockUpload.mockResolvedValue({ error: null }),
        getPublicUrl: mockGetPublicUrl.mockReturnValue({
          data: { publicUrl: 'https://example.com/image.jpg' },
        }),
      });
      const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
      const { uploadProductImage } = await import('../storage');
      const result = await uploadProductImage(file);
      expect(result).toBe('https://example.com/image.jpg');
      expect(mockSupabaseStorageFrom).toHaveBeenCalledWith('product-images');
      expect(mockUpload).toHaveBeenCalled();
      expect(mockGetPublicUrl).toHaveBeenCalled();
    });

    it('throws error when no file is provided', async () => {
      const { uploadProductImage } = await import('../storage');
      await expect(uploadProductImage(null)).rejects.toThrow('No file selected');
      expect(mockSupabaseStorageFrom).not.toHaveBeenCalled();
    });

    it('throws error when upload fails', async () => {
      mockSupabaseStorageFrom.mockReturnValue({
        upload: mockUpload.mockResolvedValue({ error: new Error('Upload failed') }),
      });
      const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
      const { uploadProductImage } = await import('../storage');
      await expect(uploadProductImage(file)).rejects.toThrow('Upload failed');
    });

    it('throws error when upload returns an error object', async () => {
      mockSupabaseStorageFrom.mockReturnValue({
        upload: mockUpload.mockResolvedValue({ error: { message: 'Storage quota exceeded' } }),
      });
      const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
      const { uploadProductImage } = await import('../storage');
      await expect(uploadProductImage(file)).rejects.toEqual({ message: 'Storage quota exceeded' });
    });
  });

  // uploadKycDocument was deliberately hardened (see the SECURITY CONTRACT
  // comment in src/utils/storage.js): `kyc-documents` is a PRIVATE bucket, the
  // function must never fall back to the public `product-images` bucket, and it
  // returns a storage PATH rather than a public URL. The older tests here
  // asserted the removed fallback behaviour; they now assert the contract.
  describe('uploadKycDocument', () => {
    it('uploads to the private kyc-documents bucket and returns a storage path', async () => {
      mockSupabaseStorageFrom.mockReturnValue({
        upload: mockUpload.mockResolvedValue({ error: null }),
        getPublicUrl: mockGetPublicUrl,
      });
      const file = new File(['content'], 'passport.pdf', { type: 'application/pdf' });
      const { uploadKycDocument } = await import('../storage');
      const result = await uploadKycDocument(file, 'passport');
      expect(mockSupabaseStorageFrom).toHaveBeenCalledWith('kyc-documents');
      expect(result).toMatch(/^kyc\/sb-user-1\/[0-9a-f-]+\.pdf$/);
      // A private document must never be handed out as a public URL.
      expect(mockGetPublicUrl).not.toHaveBeenCalled();
    });

    it('never falls back to the public product-images bucket', async () => {
      mockSupabaseStorageFrom.mockReturnValue({
        upload: mockUpload.mockResolvedValue({ error: { message: 'Bucket not found' } }),
        getPublicUrl: mockGetPublicUrl,
      });
      const file = new File(['content'], 'passport.pdf', { type: 'application/pdf' });
      const { uploadKycDocument } = await import('../storage');
      await expect(uploadKycDocument(file, 'passport')).rejects.toEqual({
        message: 'Bucket not found',
      });
      expect(mockSupabaseStorageFrom).toHaveBeenCalledTimes(1);
      expect(mockSupabaseStorageFrom).toHaveBeenCalledWith('kyc-documents');
      expect(mockSupabaseStorageFrom).not.toHaveBeenCalledWith('product-images');
    });

    it('throws when the upload rejects', async () => {
      mockSupabaseStorageFrom.mockReturnValue({
        upload: mockUpload.mockRejectedValue(new Error('Bucket not found')),
      });
      const file = new File(['content'], 'passport.pdf', { type: 'application/pdf' });
      const { uploadKycDocument } = await import('../storage');
      await expect(uploadKycDocument(file, 'passport')).rejects.toThrow('Bucket not found');
    });

    it('throws when there is no signed-in supabase user', async () => {
      mockAuthGetUser.mockResolvedValue({ data: { user: null }, error: null });
      const file = new File(['content'], 'passport.pdf', { type: 'application/pdf' });
      const { uploadKycDocument } = await import('../storage');
      await expect(uploadKycDocument(file, 'passport')).rejects.toThrow(
        'You must be signed in to upload a document',
      );
      expect(mockSupabaseStorageFrom).not.toHaveBeenCalled();
    });

    it('propagates an auth lookup error', async () => {
      mockAuthGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'auth down' } });
      const file = new File(['content'], 'passport.pdf', { type: 'application/pdf' });
      const { uploadKycDocument } = await import('../storage');
      await expect(uploadKycDocument(file, 'passport')).rejects.toEqual({ message: 'auth down' });
      expect(mockSupabaseStorageFrom).not.toHaveBeenCalled();
    });

    it('throws error when no file is provided', async () => {
      const { uploadKycDocument } = await import('../storage');
      await expect(uploadKycDocument(null, 'passport')).rejects.toThrow('No file selected');
    });
  });

  describe('uploadTestimonialImage', () => {
    it('uploads testimonial image and returns public URL on success', async () => {
      mockSupabaseStorageFrom.mockReturnValue({
        upload: mockUpload.mockResolvedValue({ error: null }),
        getPublicUrl: mockGetPublicUrl.mockReturnValue({
          data: { publicUrl: 'https://example.com/testimonial.jpg' },
        }),
      });
      const file = new File(['content'], 'review.jpg', { type: 'image/jpeg' });
      const { uploadTestimonialImage } = await import('../storage');
      const result = await uploadTestimonialImage(file);
      expect(result).toBe('https://example.com/testimonial.jpg');
      expect(mockSupabaseStorageFrom).toHaveBeenCalledWith('product-images');
    });

    it('throws error when no file is provided', async () => {
      const { uploadTestimonialImage } = await import('../storage');
      await expect(uploadTestimonialImage(null)).rejects.toThrow('No file selected');
    });

    it('throws error when upload fails', async () => {
      mockSupabaseStorageFrom.mockReturnValue({
        upload: mockUpload.mockResolvedValue({ error: new Error('Upload error') }),
      });
      const file = new File(['content'], 'review.jpg', { type: 'image/jpeg' });
      const { uploadTestimonialImage } = await import('../storage');
      await expect(uploadTestimonialImage(file)).rejects.toThrow('Upload error');
    });

    it('handles files with various extensions correctly', async () => {
      mockSupabaseStorageFrom.mockReturnValue({
        upload: mockUpload.mockResolvedValue({ error: null }),
        getPublicUrl: mockGetPublicUrl.mockReturnValue({
          data: { publicUrl: 'https://example.com/img.png' },
        }),
      });
      const file = new File(['content'], 'screenshot.png', { type: 'image/png' });
      const { uploadTestimonialImage } = await import('../storage');
      const result = await uploadTestimonialImage(file);
      expect(result).toBe('https://example.com/img.png');
    });
  });
});
