export function canCacheRequest(request, origin, assets) {
  const url = new URL(request.url);
  return (
    request.method === "GET" &&
    !request.headers.has("Authorization") &&
    url.origin === origin &&
    !url.search &&
    assets.includes(url.pathname)
  );
}
