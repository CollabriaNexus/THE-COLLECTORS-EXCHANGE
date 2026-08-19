export async function onRequest({ request, next }) {
  const response = await next();
  const query = new URL(request.url).searchParams.toString();

  if (!query) return response;

  const headers = new Headers(response.headers);
  headers.set('X-Robots-Tag', 'noindex, follow');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
