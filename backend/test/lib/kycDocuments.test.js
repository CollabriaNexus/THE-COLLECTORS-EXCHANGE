import { describe, it, expect } from 'vitest';
import {
  KYC_BUCKET,
  collectKycDocumentPaths,
  kycPathOwnerId,
  kycStoragePathFromReference,
} from '../../lib/kycDocuments.js';

const HOST = 'https://rvamybeqoyznlgzglqqx.supabase.co';
const LEGACY_PATH = 'kyc/aadhaar-1756543210987-k3j9xq.jpg';
const CURRENT_PATH =
  'kyc/8f1a2b3c-4d5e-6f70-8192-a3b4c5d6e7f8/9f0c2c4e-0d0a-4c3d-9d6b-1f2a3b4c5d6e.pdf';

describe('kycStoragePathFromReference', () => {
  it('exports the bucket name it keys off', () => {
    expect(KYC_BUCKET).toBe('kyc-documents');
  });

  it('returns a bare kyc/ path unchanged', () => {
    expect(kycStoragePathFromReference(CURRENT_PATH)).toBe(CURRENT_PATH);
    expect(kycStoragePathFromReference(LEGACY_PATH)).toBe(LEGACY_PATH);
  });

  it('extracts the path from a legacy public object URL', () => {
    expect(
      kycStoragePathFromReference(`${HOST}/storage/v1/object/public/${KYC_BUCKET}/${LEGACY_PATH}`),
    ).toBe(LEGACY_PATH);
  });

  it('extracts the path from a render/image URL and drops the query string', () => {
    expect(
      kycStoragePathFromReference(
        `${HOST}/storage/v1/render/image/public/${KYC_BUCKET}/${LEGACY_PATH}?width=400&quality=70`,
      ),
    ).toBe(LEGACY_PATH);
  });

  it('extracts the path from object/sign and object/authenticated URLs', () => {
    expect(
      kycStoragePathFromReference(
        `${HOST}/storage/v1/object/sign/${KYC_BUCKET}/${LEGACY_PATH}?token=abc.def.ghi`,
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
      kycStoragePathFromReference(
        `${HOST}/storage/v1/object/public/${KYC_BUCKET}/kyc/pan%20scan-1.pdf`,
      ),
    ).toBe('kyc/pan scan-1.pdf');
  });

  it('strips a leading slash and a trailing query on a bare path', () => {
    expect(kycStoragePathFromReference('/kyc/x.pdf')).toBe('kyc/x.pdf');
    expect(kycStoragePathFromReference('kyc/x.pdf?v=2')).toBe('kyc/x.pdf');
  });

  it('returns null for a URL pointing at a different bucket or host', () => {
    expect(
      kycStoragePathFromReference(`${HOST}/storage/v1/object/public/product-images/photo.jpg`),
    ).toBeNull();
    expect(kycStoragePathFromReference('https://example.com/aadhaar.jpg')).toBeNull();
  });

  it('returns null for free text, so kycData prose cannot pose as a reference', () => {
    expect(kycStoragePathFromReference('My Store')).toBeNull();
    expect(kycStoragePathFromReference('ABCDE1234F')).toBeNull();
    expect(kycStoragePathFromReference('other/kyc/x.pdf')).toBeNull();
  });

  it('returns null for empty, non-string and malformed values', () => {
    expect(kycStoragePathFromReference('')).toBeNull();
    expect(kycStoragePathFromReference('   ')).toBeNull();
    expect(kycStoragePathFromReference(null)).toBeNull();
    expect(kycStoragePathFromReference(42)).toBeNull();
    expect(kycStoragePathFromReference('http://')).toBeNull();
  });

  it('returns null for a bucket URL with nothing after the bucket segment', () => {
    expect(
      kycStoragePathFromReference(`${HOST}/storage/v1/object/public/${KYC_BUCKET}/`),
    ).toBeNull();
  });
});

describe('collectKycDocumentPaths', () => {
  it('collects every KYC-bucket reference regardless of shape', () => {
    const paths = collectKycDocumentPaths({
      aadhaarDoc: `${HOST}/storage/v1/object/public/${KYC_BUCKET}/${LEGACY_PATH}`,
      panDoc: CURRENT_PATH,
      gstDoc: `${HOST}/storage/v1/render/image/public/${KYC_BUCKET}/kyc/gst-1.png?width=200`,
      companyName: 'My Store',
      aadhaar: '123412341234',
      agreementAccepted: true,
    });
    expect([...paths].sort()).toEqual([CURRENT_PATH, 'kyc/gst-1.png', LEGACY_PATH].sort());
  });

  it('walks nested objects and arrays', () => {
    const paths = collectKycDocumentPaths({
      extra: { scans: [CURRENT_PATH, 'not a path'] },
    });
    expect(paths.has(CURRENT_PATH)).toBe(true);
    expect(paths.size).toBe(1);
  });

  it('returns an empty set for null / non-object kycData', () => {
    expect(collectKycDocumentPaths(null).size).toBe(0);
    expect(collectKycDocumentPaths(undefined).size).toBe(0);
    expect(collectKycDocumentPaths('nope').size).toBe(0);
  });

  it('does not hang on a cyclic object', () => {
    const node = { aadhaarDoc: CURRENT_PATH };
    node.self = node;
    expect(collectKycDocumentPaths(node).has(CURRENT_PATH)).toBe(true);
  });
});

describe('kycPathOwnerId', () => {
  it('returns the folder id for a user-scoped path', () => {
    expect(kycPathOwnerId(CURRENT_PATH)).toBe('8f1a2b3c-4d5e-6f70-8192-a3b4c5d6e7f8');
  });

  it('returns null for a flat legacy path', () => {
    expect(kycPathOwnerId(LEGACY_PATH)).toBeNull();
  });

  it('returns null for a non-kyc path or a non-string', () => {
    expect(kycPathOwnerId('other/a/b.pdf')).toBeNull();
    expect(kycPathOwnerId(null)).toBeNull();
  });
});
