import { describe, it, expect, vi } from 'vitest';
import {
  KYC_BUCKET,
  createKycDocumentResolver,
  isKycDocumentRef,
  isLegacyPublicKycUrl,
  isPdfKycDocument,
  kycStoragePathFromReference,
  needsSignedKycUrl,
  resolveKycDocumentUrl,
} from '../kycDocuments';

const HOST = 'https://rvamybeqoyznlgzglqqx.supabase.co';
const LEGACY_PATH = 'kyc/aadhaar-1756543210987-k3j9xq.jpg';
const LEGACY_URL = `${HOST}/storage/v1/object/public/${KYC_BUCKET}/${LEGACY_PATH}`;
const RENDER_URL = `${HOST}/storage/v1/render/image/public/${KYC_BUCKET}/${LEGACY_PATH}?width=400`;
const CURRENT_PATH = 'kyc/sb-user-1/9f0c2c4e-0d0a-4c3d-9d6b-1f2a3b4c5d6e.pdf';

describe('kycStoragePathFromReference', () => {
  it('returns a bare kyc/ path unchanged', () => {
    expect(kycStoragePathFromReference(CURRENT_PATH)).toBe(CURRENT_PATH);
  });

  it('extracts the object path from a legacy public URL', () => {
    expect(kycStoragePathFromReference(LEGACY_URL)).toBe(LEGACY_PATH);
  });

  it('extracts the object path from a render/image URL and drops the query', () => {
    expect(kycStoragePathFromReference(RENDER_URL)).toBe(LEGACY_PATH);
  });

  it('extracts from object/sign and object/authenticated URLs', () => {
    expect(
      kycStoragePathFromReference(
        `${HOST}/storage/v1/object/sign/${KYC_BUCKET}/${LEGACY_PATH}?token=a.b.c`,
      ),
    ).toBe(LEGACY_PATH);
    expect(
      kycStoragePathFromReference(
        `${HOST}/storage/v1/object/authenticated/${KYC_BUCKET}/${CURRENT_PATH}`,
      ),
    ).toBe(CURRENT_PATH);
  });

  it('percent-decodes the extracted path', () => {
    expect(
      kycStoragePathFromReference(`${HOST}/storage/v1/object/public/${KYC_BUCKET}/kyc/a%20b.pdf`),
    ).toBe('kyc/a b.pdf');
  });

  it('returns null for a URL into another bucket or host', () => {
    expect(
      kycStoragePathFromReference(`${HOST}/storage/v1/object/public/product-images/x.jpg`),
    ).toBeNull();
    expect(kycStoragePathFromReference('https://example.com/aadhaar.jpg')).toBeNull();
  });

  it('returns null for free text, so kycData prose cannot pose as a reference', () => {
    expect(kycStoragePathFromReference('My Store')).toBeNull();
    expect(kycStoragePathFromReference('other/kyc/x.pdf')).toBeNull();
  });

  it('returns null for empty, non-string and malformed values', () => {
    expect(kycStoragePathFromReference('')).toBeNull();
    expect(kycStoragePathFromReference(null)).toBeNull();
    expect(kycStoragePathFromReference(7)).toBeNull();
    expect(kycStoragePathFromReference('http://')).toBeNull();
  });
});

describe('predicates', () => {
  it('isKycDocumentRef only accepts non-empty strings', () => {
    expect(isKycDocumentRef(CURRENT_PATH)).toBe(true);
    expect(isKycDocumentRef('   ')).toBe(false);
    expect(isKycDocumentRef(null)).toBe(false);
  });

  it('isLegacyPublicKycUrl only accepts http(s) references', () => {
    expect(isLegacyPublicKycUrl(LEGACY_URL)).toBe(true);
    expect(isLegacyPublicKycUrl(CURRENT_PATH)).toBe(false);
  });

  it('needsSignedKycUrl is true for every KYC-bucket reference, both shapes', () => {
    expect(needsSignedKycUrl(CURRENT_PATH)).toBe(true);
    expect(needsSignedKycUrl(LEGACY_URL)).toBe(true);
    expect(needsSignedKycUrl(RENDER_URL)).toBe(true);
  });

  it('needsSignedKycUrl is false for a URL outside the bucket', () => {
    expect(needsSignedKycUrl('https://example.com/aadhaar.jpg')).toBe(false);
  });

  it('isPdfKycDocument ignores the query string', () => {
    expect(isPdfKycDocument(CURRENT_PATH)).toBe(true);
    expect(isPdfKycDocument(`${HOST}/x/${KYC_BUCKET}/kyc/a.pdf?width=1`)).toBe(true);
    expect(isPdfKycDocument(LEGACY_URL)).toBe(false);
  });
});

describe('resolveKycDocumentUrl', () => {
  it('signs a current storage path', async () => {
    const signPath = vi.fn().mockResolvedValue('https://signed/current');
    await expect(resolveKycDocumentUrl(CURRENT_PATH, signPath)).resolves.toBe(
      'https://signed/current',
    );
    expect(signPath).toHaveBeenCalledWith(CURRENT_PATH);
  });

  it('signs the extracted path of a legacy public URL rather than using it directly', async () => {
    const signPath = vi.fn().mockResolvedValue('https://signed/legacy');
    await expect(resolveKycDocumentUrl(LEGACY_URL, signPath)).resolves.toBe(
      'https://signed/legacy',
    );
    expect(signPath).toHaveBeenCalledWith(LEGACY_PATH);
  });

  it('signs the extracted path of a render/image URL', async () => {
    const signPath = vi.fn().mockResolvedValue('https://signed/render');
    await resolveKycDocumentUrl(RENDER_URL, signPath);
    expect(signPath).toHaveBeenCalledWith(LEGACY_PATH);
  });

  it('passes a non-bucket URL straight through without signing', async () => {
    const signPath = vi.fn();
    await expect(resolveKycDocumentUrl('https://example.com/a.jpg', signPath)).resolves.toBe(
      'https://example.com/a.jpg',
    );
    expect(signPath).not.toHaveBeenCalled();
  });

  it('returns null when a bucket reference has no resolver', async () => {
    await expect(resolveKycDocumentUrl(LEGACY_URL)).resolves.toBeNull();
    await expect(resolveKycDocumentUrl(CURRENT_PATH)).resolves.toBeNull();
  });

  it('returns null for an empty reference', async () => {
    await expect(resolveKycDocumentUrl('', vi.fn())).resolves.toBeNull();
    await expect(resolveKycDocumentUrl(null, vi.fn())).resolves.toBeNull();
  });
});

describe('createKycDocumentResolver', () => {
  it('calls the signed-url endpoint with the path and returns the url', async () => {
    const client = { get: vi.fn().mockResolvedValue({ data: { url: 'https://signed/x' } }) };
    const resolve = createKycDocumentResolver('db user/1', client);
    await expect(resolve(CURRENT_PATH)).resolves.toBe('https://signed/x');
    expect(client.get).toHaveBeenCalledWith('/admin/kyc/db%20user%2F1/signed-url', {
      params: { path: CURRENT_PATH },
    });
  });

  it('throws when the endpoint returns no url', async () => {
    const client = { get: vi.fn().mockResolvedValue({ data: {} }) };
    const resolve = createKycDocumentResolver('u1', client);
    await expect(resolve(CURRENT_PATH)).rejects.toThrow('No signed URL returned');
  });
});
