import { createHash } from 'crypto';

const GRAPH_API_VERSION = 'v26.0';
const PIXEL_ID = '1814649636560455';
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

let _token = null;

/**
 * Same System User token as the Catalog integration — one credential covers
 * both, since both live under the `ads_management`/`business_management`
 * scopes already granted.
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

async function api(path, body) {
  const token = await loadAccessToken();
  const res = await fetch(`${GRAPH_BASE}/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    const msg = data.error?.message || `Graph API responded ${res.status}`;
    const e = new Error(`Meta Conversions API: ${msg}`);
    e.status = res.status;
    e.raw = data.error;
    throw e;
  }
  return data;
}

/**
 * Meta requires PII in user_data to be SHA-256 hashed, lowercase and
 * trimmed first. Never send plaintext email/phone.
 *
 * @param {string | null | undefined} value Raw value to hash.
 * @returns {string | undefined} Hex-encoded SHA-256, or undefined if empty.
 */
function hash(value) {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

/**
 * Build the user_data block for a CAPI event from whatever identity signal
 * is available. All PII fields are hashed here so call sites never handle
 * raw hashes themselves.
 *
 * @param {{email?: string, phone?: string, externalId?: string, ip?: string, userAgent?: string}} identity Raw signals.
 * @returns {object} user_data payload with only the fields that were present.
 */
export function buildUserData({ email, phone, externalId, ip, userAgent } = {}) {
  const userData = {};
  const em = hash(email);
  const ph = hash(phone);
  const externalIdHash = hash(externalId);
  if (em) userData.em = em;
  if (ph) userData.ph = ph;
  if (externalIdHash) userData.external_id = externalIdHash;
  if (ip) userData.client_ip_address = ip;
  if (userAgent) userData.client_user_agent = userAgent;
  return userData;
}

/**
 * Send one server-side event to the Conversions API.
 *
 * @param {object} params
 * @param {string} params.eventName e.g. "Purchase".
 * @param {string} params.eventId Shared with any client-side Pixel event for
 *   the same action, so Meta can deduplicate — safe to always set even if no
 *   client-side event exists yet for this action.
 * @param {string} params.eventSourceUrl Page the action happened on.
 * @param {object} [params.userData] From buildUserData().
 * @param {object} [params.customData] value/currency/content_ids/etc.
 * @param {string} [params.actionSource] Defaults to "website".
 * @param {string} [params.testEventCode] Routes to Events Manager's Test
 *   Events tool instead of live ad-optimization signal.
 * @returns {Promise<object>} Graph API response.
 */
export async function sendConversionEvent({
  eventName,
  eventId,
  eventSourceUrl,
  userData = {},
  customData = {},
  actionSource = 'website',
  testEventCode,
}) {
  const body = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: eventSourceUrl,
        action_source: actionSource,
        user_data: userData,
        custom_data: customData,
      },
    ],
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
  };

  return api(`${PIXEL_ID}/events`, body);
}

/**
 * Fire-and-forget variant for call sites that must not block their HTTP
 * response on a third-party API round trip. Failures are logged, never
 * thrown — mirrors syncProductToMetaAsync in lib/metaCatalog.js.
 *
 * @param {Parameters<typeof sendConversionEvent>[0]} params
 * @returns {void}
 */
export function sendConversionEventAsync(params) {
  sendConversionEvent(params).catch((err) => {
    console.error(`Meta Conversions API event '${params.eventName}' failed:`, err.message);
  });
}

export { PIXEL_ID };
