const GRAPH_API_VERSION = 'v26.0';
const CATALOG_ID = '1730162018100619';
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

let _token = null;

/**
 * Load the Meta System User access token: env var first (local dev), then
 * AWS SSM Parameter Store (Lambda runtime) — mirrors the credential chain
 * used for GOOGLE_MERCHANT_KEY, minus the JSON/base64 step since this is a
 * plain token string, not a service-account key.
 *
 * @returns {Promise<string>} Meta Graph API access token.
 */
async function loadAccessToken() {
  if (_token) return _token;

  const envToken = process.env.META_CATALOG_ACCESS_TOKEN;
  if (envToken) {
    _token = envToken;
    return _token;
  }

  if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
    try {
      const { SSMClient, GetParameterCommand } = await import('@aws-sdk/client-ssm');
      const client = new SSMClient();
      const res = await client.send(
        new GetParameterCommand({
          Name: '/thecollectorsexchange/META_CATALOG_ACCESS_TOKEN',
          WithDecryption: true,
        }),
      );
      _token = res.Parameter.Value;
      return _token;
    } catch (err) {
      console.error('Failed to load META_CATALOG_ACCESS_TOKEN from SSM:', err.message);
    }
  }

  throw new Error('Meta Catalog access token not found.');
}

async function api(method, path, body) {
  const token = await loadAccessToken();
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${GRAPH_BASE}/${path}`, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    const msg = data.error?.message || `Graph API responded ${res.status}`;
    const e = new Error(`Meta Catalog API: ${msg}`);
    e.status = res.status;
    e.raw = data.error;
    throw e;
  }
  return data;
}

/**
 * Map the marketplace condition label to Meta's condition enum.
 * All catalogue grades except an explicit "New" represent pre-owned goods.
 *
 * @param {string | null | undefined} condition Marketplace condition label.
 * @returns {'new' | 'used'} Meta Catalog condition value.
 */
export function mapCondition(condition) {
  return typeof condition === 'string' && condition.trim().toLowerCase() === 'new' ? 'new' : 'used';
}

/**
 * Map product state to Meta's availability enum. Unlike Google Merchant,
 * Meta has a dedicated `mark_as_sold` state built for one-of-a-kind resale
 * items, and a `discontinued` state for delisted-but-previously-live items —
 * so the catalog entry is upserted in place rather than deleted.
 *
 * @param {{status?: string, isPublished?: boolean}} product Product record.
 * @returns {'in stock' | 'mark_as_sold' | 'discontinued'} Meta availability value.
 */
export function mapAvailability(product) {
  if (product?.status === 'Sold') return 'mark_as_sold';
  if (product?.status === 'Approved' && product?.isPublished === true) return 'in stock';
  return 'discontinued';
}

/**
 * Upsert one product into the Meta Catalog, keyed by our own product id as
 * the retailer_id. Safe to call on every relevant lifecycle transition
 * (listed, sold, unpublished, restocked) — Meta updates the existing entry
 * in place rather than creating a duplicate.
 *
 * Meta's Commerce Policies prohibit real money — cash, cash-equivalent
 * instruments, and coins — even when graded as collectibles, regardless of
 * the marketplace category it's filed under (a coin can sit under
 * Collectibles or Antiques just as easily as a dedicated Coins category).
 * That can't be reliably caught by a category or keyword filter here, so
 * this stays an admin-approval-time judgment call: don't approve+publish a
 * currency/coin listing if Meta sync is enabled for its category.
 *
 * @param {object} product Product record.
 * @param {string} baseUrl Public storefront base URL.
 * @returns {Promise<{id: string}>} Meta Catalog API response.
 */
export async function syncProductToMeta(product, baseUrl) {
  const storefrontBaseUrl = baseUrl.replace(/\/+$/, '');
  const brand = typeof product.brand === 'string' ? product.brand.trim() : '';

  const payload = {
    retailer_id: product.id,
    name: (product.title || '').slice(0, 150),
    description: (product.description || '').slice(0, 5000),
    url: `${storefrontBaseUrl}/product/${product.id}/`,
    image_url: product.image || product.images?.[0] || '',
    availability: mapAvailability(product),
    condition: mapCondition(product.condition),
    price: Math.round(product.price * 100),
    currency: 'INR',
    ...(brand ? { brand } : {}),
  };

  return api('POST', `${CATALOG_ID}/products`, payload);
}

/**
 * Fire-and-forget variant for call sites that must not block their HTTP
 * response (checkout, admin actions) on a third-party API round trip.
 * Failures are logged, never thrown.
 *
 * @param {object} product Product record.
 * @param {string} [baseUrl] Public storefront base URL.
 * @returns {void}
 */
export function syncProductToMetaAsync(
  product,
  baseUrl = process.env.FRONTEND_URL || 'https://thecollectorsexchange.in',
) {
  syncProductToMeta(product, baseUrl).catch((err) => {
    console.error(`Meta Catalog sync failed for product ${product.id}:`, err.message);
  });
}

export { CATALOG_ID };
