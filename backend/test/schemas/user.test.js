import { describe, it, expect } from 'vitest';
import { UserSchema, UserRegistrationSchema, UserKycSchema, UpdateProfileSchema } from '../../schemas/user.js';

describe('UserSchema', () => {
  const validUser = {
    email: 'test@example.com',
    password: 'Test1234',
    type: 'individual',
    role: 'user',
    kycStatus: 'none',
  };

  it('passes with valid minimal data', () => {
    expect(() => UserSchema.parse(validUser)).not.toThrow();
  });

  it('passes with all optional fields', () => {
    const data = { ...validUser, id: 'abc123', name: 'John', phone: '+911234567890', kycData: { pan: 'ABCDE1234F' } };
    expect(() => UserSchema.parse(data)).not.toThrow();
  });

  it('fails when email is missing', () => {
    const { email, ...rest } = validUser;
    expect(() => UserSchema.parse(rest)).toThrow();
  });

  it('fails with invalid email', () => {
    expect(() => UserSchema.parse({ ...validUser, email: 'not-an-email' })).toThrow();
  });

  it('fails when password is missing', () => {
    const { password, ...rest } = validUser;
    expect(() => UserSchema.parse(rest)).toThrow();
  });

  it('fails with short password (< 8 chars)', () => {
    expect(() => UserSchema.parse({ ...validUser, password: 'Ab1' })).toThrow();
  });

  it('fails with password missing uppercase', () => {
    expect(() => UserSchema.parse({ ...validUser, password: 'test1234' })).toThrow();
  });

  it('fails with password missing lowercase', () => {
    expect(() => UserSchema.parse({ ...validUser, password: 'TEST1234' })).toThrow();
  });

  it('fails with password missing number', () => {
    expect(() => UserSchema.parse({ ...validUser, password: 'Testtest' })).toThrow();
  });

  it('fails with invalid type', () => {
    expect(() => UserSchema.parse({ ...validUser, type: 'invalid' })).toThrow();
  });

  it('fails with invalid role', () => {
    expect(() => UserSchema.parse({ ...validUser, role: 'superadmin' })).toThrow();
  });

  it('fails with invalid kycStatus', () => {
    expect(() => UserSchema.parse({ ...validUser, kycStatus: 'invalid' })).toThrow();
  });

  it('uses defaults for type, role, kycStatus', () => {
    const result = UserSchema.parse({ email: 'a@b.com', password: 'Valid1234' });
    expect(result.type).toBe('individual');
    expect(result.role).toBe('user');
    expect(result.kycStatus).toBe('none');
  });
});

describe('UserRegistrationSchema', () => {
  const valid = { email: 'test@example.com' };

  it('passes with required email only', () => {
    expect(() => UserRegistrationSchema.parse(valid)).not.toThrow();
  });

  it('passes with all optional fields', () => {
    expect(() => UserRegistrationSchema.parse({ ...valid, name: 'John', phone: '1234567890', type: 'company', supabaseId: 'sb-123' })).not.toThrow();
  });

  it('fails without email', () => {
    expect(() => UserRegistrationSchema.parse({})).toThrow();
  });

  it('fails with bad email', () => {
    expect(() => UserRegistrationSchema.parse({ email: 'bad' })).toThrow();
  });

  it('defaults type to individual', () => {
    const result = UserRegistrationSchema.parse(valid);
    expect(result.type).toBe('individual');
  });
});

describe('UserKycSchema', () => {
  it('passes with valid kycData', () => {
    expect(() => UserKycSchema.parse({ kycData: { pan: 'ABCDE1234F', aadhaar: '123456789012' } })).not.toThrow();
  });

  it('fails without kycData', () => {
    expect(() => UserKycSchema.parse({})).toThrow();
  });
});

describe('UpdateProfileSchema', () => {
  it('passes with valid name', () => {
    expect(() => UpdateProfileSchema.parse({ name: 'John' })).not.toThrow();
  });

  it('passes with valid phone', () => {
    expect(() => UpdateProfileSchema.parse({ phone: '1234567890' })).not.toThrow();
  });

  it('passes with empty object (all optional)', () => {
    expect(() => UpdateProfileSchema.parse({})).not.toThrow();
  });

  it('fails with empty name', () => {
    expect(() => UpdateProfileSchema.parse({ name: '' })).toThrow();
  });

  it('fails with short phone (< 10)', () => {
    expect(() => UpdateProfileSchema.parse({ phone: '123' })).toThrow();
  });
});
