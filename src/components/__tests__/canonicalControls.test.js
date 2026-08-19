import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readPublicFile = (name) => readFileSync(resolve(process.cwd(), 'public', name), 'utf8');

describe('Cloudflare cache controls', () => {
  it('caches hashed assets immutably without applying that policy globally', () => {
    const headers = readPublicFile('_headers');
    const globalBlock = headers.match(/^\/\*\r?\n((?:[ \t].*\r?\n?)*)/m)?.[1] || '';
    const assetBlock = headers.match(/^\/assets\/\*\r?\n((?:[ \t].*\r?\n?)*)/m)?.[1] || '';

    expect(assetBlock).toContain('Cache-Control: public, max-age=31536000, immutable');
    expect(globalBlock).not.toContain('immutable');
    expect(globalBlock).not.toContain('Cache-Control:');
  });
});

describe('llms.txt canonical links', () => {
  it('uses trailing slashes for every first-party page URL', () => {
    const llms = readPublicFile('llms.txt');
    const firstPartyUrls = llms.match(/https:\/\/thecollectorsexchange\.in\/\S*/g) || [];

    expect(firstPartyUrls.length).toBeGreaterThan(0);
    expect(firstPartyUrls.every((url) => url.endsWith('/'))).toBe(true);
  });
});
