/**
 * Pull the message the SERVER actually sent out of an axios error.
 *
 * Fastify routes in `backend/routes/admin.js` reply with `{ error: '...' }` on
 * every 4xx (e.g. "Cannot approve a sold product", "This product was just sold
 * by another order"). Reading `err.message` instead — which most admin pages
 * used to do — throws that away and shows the operator axios's own useless
 * "Request failed with status code 422".
 *
 * @param {unknown} err     the caught error
 * @param {string} fallback shown when nothing usable can be extracted
 * @returns {string}
 */
export const getErrorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
  const data = err?.response?.data;

  if (typeof data === 'string' && data.trim()) return data.trim();

  if (data && typeof data === 'object') {
    if (typeof data.error === 'string' && data.error.trim()) return data.error.trim();
    if (typeof data.message === 'string' && data.message.trim()) return data.message.trim();
    // Zod / Fastify validation failures come back as an issues array.
    if (Array.isArray(data.issues) && data.issues.length > 0) {
      const detail = data.issues
        .map((i) => (i?.path?.length ? `${i.path.join('.')}: ${i.message}` : i?.message))
        .filter(Boolean)
        .join('; ');
      if (detail) return detail;
    }
  }

  // Network failure — the request never reached the server.
  if (err?.response === undefined && err?.request) {
    return 'Could not reach the server. Check your connection and try again.';
  }

  if (typeof err?.message === 'string' && err.message.trim()) return err.message.trim();

  return fallback;
};

export default getErrorMessage;
