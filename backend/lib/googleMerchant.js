import { readFileSync, existsSync } from 'fs';
import { GoogleAuth } from 'google-auth-library';
import path from 'path';
import { fileURLToPath } from 'url';

// In CJS bundle __dirname is global; in ESM use import.meta.url
const baseDir = path.dirname(
  typeof __dirname !== 'undefined'
    ? __dirname + '/googleMerchant.js'
    : fileURLToPath(import.meta.url),
);
const ACCOUNT_ID = '5812107292';
const BASE = 'https://merchantapi.googleapis.com';
const SCOPE = 'https://www.googleapis.com/auth/content';

let _credentials = null;

async function loadCredentials() {
  if (_credentials) return _credentials;

  // 1. Environment variable (works locally and if set in Lambda)
  const envKey = process.env.GOOGLE_MERCHANT_KEY;
  if (envKey) {
    _credentials = JSON.parse(Buffer.from(envKey, 'base64').toString('utf8'));
    return _credentials;
  }

  // 2. AWS SSM Parameter Store (Lambda runtime)
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
    try {
      const { SSMClient, GetParameterCommand } = await import('@aws-sdk/client-ssm');
      const client = new SSMClient();
      const res = await client.send(
        new GetParameterCommand({
          Name: '/thecollectorsexchange/GOOGLE_MERCHANT_KEY',
          WithDecryption: true,
        }),
      );
      _credentials = JSON.parse(Buffer.from(res.Parameter.Value, 'base64').toString('utf8'));
      return _credentials;
    } catch (err) {
      console.error('Failed to load GOOGLE_MERCHANT_KEY from SSM:', err.message);
    }
  }

  // 3. Local file fallback
  const filePath =
    process.env.GOOGLE_MERCHANT_KEY_PATH || path.join(baseDir, '..', 'google-merchant-key.json');
  if (existsSync(filePath)) {
    _credentials = JSON.parse(readFileSync(filePath, 'utf8'));
    return _credentials;
  }

  throw new Error('Google Merchant key not found.');
}

async function getAccessToken() {
  const credentials = await loadCredentials();
  const auth = new GoogleAuth({ credentials, scopes: [SCOPE] });
  const client = await auth.getClient();
  const res = await client.getAccessToken();
  if (!res?.token) throw new Error('Failed to obtain access token');
  return res.token;
}

async function api(method, fullUrl, body) {
  const token = await getAccessToken();
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(fullUrl, opts);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg = typeof data === 'string' ? data : data.error?.message || JSON.stringify(data);
    const e = new Error(`Merchant API ${res.status}: ${msg}`);
    e.status = res.status;
    e.raw = typeof data === 'string' ? data : data.error;
    throw e;
  }
  return data;
}

export async function ensureDeveloperRegistration() {
  return api(
    'POST',
    `${BASE}/accounts/v1/accounts/${ACCOUNT_ID}/developerRegistration:registerGcp`,
  );
}

export async function findOrCreateDataSource() {
  const list = await api(
    'GET',
    `${BASE}/datasources/v1/accounts/${ACCOUNT_ID}/dataSources?pageSize=100`,
  );
  const name = 'API Products';
  const existing = list.dataSources?.find((ds) => ds.displayName === name);
  if (existing) return existing;
  return api('POST', `${BASE}/datasources/v1/accounts/${ACCOUNT_ID}/dataSources`, {
    displayName: name,
    primaryProductDataSource: { countries: ['IN'] },
  });
}

/**
 * Map the marketplace condition label to Google Merchant's condition enum.
 * All catalogue grades except an explicit "New" represent pre-owned goods.
 *
 * @param {string | null | undefined} condition Marketplace condition label.
 * @returns {'NEW' | 'USED'} Google Merchant condition value.
 */
export function mapCondition(condition) {
  return typeof condition === 'string' && condition.trim().toLowerCase() === 'new' ? 'NEW' : 'USED';
}

/**
 * Determine whether a product may be submitted to Merchant Center.
 *
 * @param {{status?: string, isPublished?: boolean}} product Product record.
 * @returns {boolean} True only for public, approved inventory.
 */
export function isMerchantEligible(product) {
  return product?.status === 'Approved' && product?.isPublished === true;
}

/**
 * Submit one eligible product to the Merchant API data source.
 *
 * @param {object} product Product record.
 * @param {string} dataSourceName Merchant data-source resource name.
 * @param {string} baseUrl Public storefront base URL.
 * @returns {Promise<object>} Merchant API response.
 */
export async function insertProduct(product, dataSourceName, baseUrl) {
  if (!isMerchantEligible(product)) {
    throw new Error(
      `Product ${product?.id || '(unknown)'} is not eligible for Merchant sync: it must be Approved and published.`,
    );
  }

  const priceMicros = String(Math.round(product.price * 100) * 10000);
  const brand = typeof product.brand === 'string' ? product.brand.trim() : '';
  const storefrontBaseUrl = baseUrl.replace(/\/+$/, '');
  const payload = {
    contentLanguage: 'en',
    feedLabel: 'IN',
    offerId: product.id,
    productAttributes: {
      title: (product.title || '').slice(0, 150),
      description: (product.description || '').slice(0, 5000),
      link: `${storefrontBaseUrl}/product/${product.id}/`,
      imageLink: product.image || product.images?.[0] || '',
      additionalImageLinks: product.images?.slice(1) || [],
      availability: product.status === 'Sold' ? 'OUT_OF_STOCK' : 'IN_STOCK',
      condition: mapCondition(product.condition),
      price: {
        amountMicros: priceMicros,
        currencyCode: 'INR',
      },
      ...(brand ? { brand } : {}),
    },
  };
  const url = `${BASE}/products/v1/accounts/${ACCOUNT_ID}/productInputs:insert?dataSource=${encodeURIComponent(dataSourceName)}`;
  return api('POST', url, payload);
}

/**
 * Delete a product input from the primary Merchant data source.
 * The v1 API recommends an unpadded base64url product-input identifier.
 *
 * @param {string} offerId Marketplace product identifier used as the Merchant offer id.
 * @param {string} dataSourceName Full Merchant data-source resource name.
 * @returns {Promise<object | string>} Merchant API response.
 */
export async function deleteProduct(offerId, dataSourceName) {
  const productInputId = Buffer.from(`en~IN~${offerId}`).toString('base64url');
  const url = `${BASE}/products/v1/accounts/${ACCOUNT_ID}/productInputs/${productInputId}?dataSource=${encodeURIComponent(dataSourceName)}`;
  return api('DELETE', url);
}
