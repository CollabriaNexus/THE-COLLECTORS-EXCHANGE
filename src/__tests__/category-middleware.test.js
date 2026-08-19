import { describe, expect, it, vi } from 'vitest';
import { onRequest } from '../../functions/category/_middleware.js';

const htmlResponse = () =>
  new Response('<!doctype html><html><body>Category</body></html>', {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Existing': 'preserved',
    },
  });

describe('category Pages middleware', () => {
  it('adds noindex, follow to non-empty query requests and preserves the response', async () => {
    const next = vi.fn(async () => htmlResponse());

    const response = await onRequest({
      request: { url: 'https://thecollectorsexchange.in/category/?q=hmt&sort=price' },
      next,
    });

    expect(next).toHaveBeenCalledOnce();
    expect(response.status).toBe(200);
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex, follow');
    expect(response.headers.get('X-Existing')).toBe('preserved');
    expect(await response.text()).toContain('Category');
  });

  it('leaves the clean category response indexable', async () => {
    const upstream = htmlResponse();
    const next = vi.fn(async () => upstream);

    const response = await onRequest({
      request: { url: 'https://thecollectorsexchange.in/category/' },
      next,
    });

    expect(response).toBe(upstream);
    expect(response.headers.has('X-Robots-Tag')).toBe(false);
  });
});
