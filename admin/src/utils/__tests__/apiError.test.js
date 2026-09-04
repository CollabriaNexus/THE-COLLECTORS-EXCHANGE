import { describe, it, expect } from 'vitest';
import { getErrorMessage } from '../apiError';

describe('getErrorMessage', () => {
  it('prefers the server error field over axios own message', () => {
    // Admin routes reply { error: '...' } on every 4xx. Reading err.message
    // instead — which most admin pages used to do — showed the operator
    // axios's useless status line.
    const err = {
      message: 'Request failed with status code 422',
      response: { data: { error: 'Cannot approve a sold product' } },
    };
    expect(getErrorMessage(err)).toBe('Cannot approve a sold product');
  });

  it('falls back to the message field', () => {
    const err = { response: { data: { message: 'Vendor not found' } } };
    expect(getErrorMessage(err)).toBe('Vendor not found');
  });

  it('accepts a plain string body', () => {
    expect(getErrorMessage({ response: { data: 'Gateway timeout' } })).toBe('Gateway timeout');
  });

  it('summarises zod validation issues', () => {
    const err = {
      response: {
        data: { issues: [{ path: ['amount'], message: 'Expected number, received string' }] },
      },
    };
    expect(getErrorMessage(err)).toBe('amount: Expected number, received string');
  });

  it('explains a network failure where the request never reached the server', () => {
    expect(getErrorMessage({ request: {} })).toMatch(/Could not reach the server/);
  });

  it('uses err.message when there is no response body', () => {
    expect(getErrorMessage({ message: 'Network Error' })).toBe('Network Error');
  });

  it('uses the caller fallback when nothing is usable', () => {
    expect(getErrorMessage({}, 'Failed to ban user')).toBe('Failed to ban user');
    expect(getErrorMessage({ response: { data: { error: '   ' } } }, 'fallback')).toBe('fallback');
  });
});
