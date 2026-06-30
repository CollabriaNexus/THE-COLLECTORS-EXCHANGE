import { describe, it, expect } from 'vitest';
import { KYCRequestIdParam, KYCApprovalSchema, KYCRejectionSchema, CreatePayoutSchema, UpdatePayoutStatusSchema } from '../../schemas/admin.js';

describe('KYCRequestIdParam', () => {
  it('passes with valid id', () => {
    expect(() => KYCRequestIdParam.parse({ id: 'abc123' })).not.toThrow();
  });

  it('fails without id', () => {
    expect(() => KYCRequestIdParam.parse({})).toThrow();
  });
});

describe('KYCApprovalSchema', () => {
  it('passes without notes', () => {
    expect(() => KYCApprovalSchema.parse({})).not.toThrow();
  });

  it('passes with notes', () => {
    expect(() => KYCApprovalSchema.parse({ notes: 'All good' })).not.toThrow();
  });
});

describe('KYCRejectionSchema', () => {
  it('passes with reason', () => {
    expect(() => KYCRejectionSchema.parse({ reason: 'Invalid documents' })).not.toThrow();
  });

  it('fails without reason', () => {
    expect(() => KYCRejectionSchema.parse({})).toThrow();
  });

  it('fails with empty reason', () => {
    expect(() => KYCRejectionSchema.parse({ reason: '' })).toThrow();
  });
});

describe('CreatePayoutSchema', () => {
  const valid = {
    vendorId: 'vendor-1',
    amount: 5000,
    periodStart: '2024-01-01',
    periodEnd: '2024-01-31',
  };

  it('passes with valid data', () => {
    expect(() => CreatePayoutSchema.parse(valid)).not.toThrow();
  });

  it('passes with optional note', () => {
    expect(() => CreatePayoutSchema.parse({ ...valid, note: 'Monthly payout' })).not.toThrow();
  });

  it('fails without vendorId', () => {
    const { vendorId, ...rest } = valid;
    expect(() => CreatePayoutSchema.parse(rest)).toThrow();
  });

  it('fails with empty vendorId', () => {
    expect(() => CreatePayoutSchema.parse({ ...valid, vendorId: '' })).toThrow();
  });

  it('fails with zero amount', () => {
    expect(() => CreatePayoutSchema.parse({ ...valid, amount: 0 })).toThrow();
  });

  it('fails with negative amount', () => {
    expect(() => CreatePayoutSchema.parse({ ...valid, amount: -100 })).toThrow();
  });

  it('fails without periodStart', () => {
    const { periodStart, ...rest } = valid;
    expect(() => CreatePayoutSchema.parse(rest)).toThrow();
  });

  it('fails without periodEnd', () => {
    const { periodEnd, ...rest } = valid;
    expect(() => CreatePayoutSchema.parse(rest)).toThrow();
  });
});

describe('UpdatePayoutStatusSchema', () => {
  it('passes with valid status PENDING', () => {
    expect(() => UpdatePayoutStatusSchema.parse({ status: 'PENDING' })).not.toThrow();
  });

  it('passes with PROCESSING', () => {
    expect(() => UpdatePayoutStatusSchema.parse({ status: 'PROCESSING' })).not.toThrow();
  });

  it('passes with PAID', () => {
    expect(() => UpdatePayoutStatusSchema.parse({ status: 'PAID' })).not.toThrow();
  });

  it('passes with FAILED', () => {
    expect(() => UpdatePayoutStatusSchema.parse({ status: 'FAILED' })).not.toThrow();
  });

  it('fails with invalid status', () => {
    expect(() => UpdatePayoutStatusSchema.parse({ status: 'INVALID' })).toThrow();
  });

  it('fails without status', () => {
    expect(() => UpdatePayoutStatusSchema.parse({})).toThrow();
  });
});
