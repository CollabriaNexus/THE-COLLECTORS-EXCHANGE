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

function mapCondition(cond) {
  const map = {
    Mint: 'NEW',
    New: 'NEW',
    Excellent: 'USED',
    'Very Good': 'USED',
    Good: 'USED',
    Fair: 'USED',
    Poor: 'USED',
  };
  return map[cond] || 'USED';
}

export async function insertProduct(product, dataSourceName, baseUrl) {
  const priceMicros = String(Math.round(product.price * 100) * 10000);
  const payload = {
    contentLanguage: 'en',
    feedLabel: 'IN',
    offerId: product.id,
    productAttributes: {
      title: (product.title || '').slice(0, 150),
      description: (product.description || '').slice(0, 5000),
      link: `${baseUrl}/product/${product.id}`,
      imageLink: product.image || product.images?.[0] || '',
      additionalImageLinks: product.images?.slice(1) || [],
      availability: product.status === 'Sold' ? 'OUT_OF_STOCK' : 'IN_STOCK',
      condition: mapCondition(product.condition),
      price: {
        amountMicros: priceMicros,
        currencyCode: 'INR',
      },
      brand: product.brand || 'The Collectors Exchange',
    },
  };
  const url = `${BASE}/products/v1/accounts/${ACCOUNT_ID}/productInputs:insert?dataSource=${encodeURIComponent(dataSourceName)}`;
  return api('POST', url, payload);
}
