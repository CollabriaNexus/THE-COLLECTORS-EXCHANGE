import { readFileSync, existsSync } from 'fs';
import { GoogleAuth } from 'google-auth-library';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ACCOUNT_ID = '5812107292';
const BASE_URL = 'https://merchantapi.googleapis.com';
const SCOPE = 'https://www.googleapis.com/auth/content';

let _credentials = null;

function loadCredentials() {
    if (_credentials) return _credentials;
    const envKey = process.env.GOOGLE_MERCHANT_KEY;
    if (envKey) {
        _credentials = JSON.parse(Buffer.from(envKey, 'base64').toString('utf8'));
        return _credentials;
    }
    const filePath = process.env.GOOGLE_MERCHANT_KEY_PATH || path.join(__dirname, '..', 'google-merchant-key.json');
    if (existsSync(filePath)) {
        _credentials = JSON.parse(readFileSync(filePath, 'utf8'));
        return _credentials;
    }
    throw new Error('Google Merchant key not found. Set GOOGLE_MERCHANT_KEY env var (base64) or place google-merchant-key.json in backend/');
}

async function getAccessToken() {
    const credentials = loadCredentials();
    const auth = new GoogleAuth({ credentials, scopes: [SCOPE] });
    const client = await auth.getClient();
    const res = await client.getAccessToken();
    if (!res?.token) throw new Error('Failed to obtain access token');
    return res.token;
}

export async function api(method, endpoint, body) {
    const token = await getAccessToken();
    const url = `${BASE_URL}${endpoint}`;
    const opts = {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    const data = await res.json();
    if (!res.ok) {
        const err = data.error?.message || JSON.stringify(data);
        const e = new Error(`Merchant API ${res.status}: ${err}`);
        e.status = res.status;
        e.code = data.error?.code;
        e.details = data.error?.details;
        throw e;
    }
    return data;
}

export async function ensureDeveloperRegistration() {
    return api('POST', `/accounts/v1/accounts/${ACCOUNT_ID}/developerRegistration:registerGcp`);
}

export async function findOrCreateDataSource() {
    const name = 'API Products';
    const list = await api('GET', `/accounts/v1/accounts/${ACCOUNT_ID}/dataSources?pageSize=100`);
    const existing = list.dataSources?.find(ds => ds.displayName === name || ds.type === 'DATA_SOURCE_TYPE_API');
    if (existing) return existing;
    return api('POST', `/accounts/v1/accounts/${ACCOUNT_ID}/dataSources`, {
        name: `accounts/${ACCOUNT_ID}/dataSources/api-products`,
        displayName: name,
        type: 'DATA_SOURCE_TYPE_API',
        input: 'API',
    });
}

function mapCondition(cond) {
    const map = { Mint: 'new', New: 'new', Excellent: 'used', 'Very Good': 'used', Good: 'used', Fair: 'used', Poor: 'used' };
    return map[cond] || 'used';
}

export function buildProductPayload(product, baseUrl) {
    const priceInPaise = Math.round(product.price * 100);
    return {
        name: `accounts/${ACCOUNT_ID}/products/online:en:IN:${product.id}`,
        offerId: product.id,
        title: (product.title || '').slice(0, 150),
        description: (product.description || '').slice(0, 5000),
        link: `${baseUrl}/product/${product.id}`,
        imageLink: product.image || product.images?.[0] || '',
        additionalImageLinks: product.images?.slice(1) || [],
        contentLanguage: 'en',
        targetCountry: 'IN',
        channel: 'online',
        availability: product.status === 'Sold' ? 'out_of_stock' : 'in_stock',
        condition: mapCondition(product.condition),
        price: {
            amountMicros: String(priceInPaise * 10000),
            currencyCode: 'INR',
        },
        brand: product.brand || 'The Collectors Exchange',
    };
}

export async function insertProduct(product, dataSourceName, baseUrl) {
    const payload = buildProductPayload(product, baseUrl);
    return api('POST', `/accounts/v1/accounts/${ACCOUNT_ID}/products:insert?dataSource=${encodeURIComponent(dataSourceName)}`, payload);
}
