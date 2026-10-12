import { canCacheRequest } from "./cache-policy.js";
const ASSETS = [];
const CACHE = "dentus-static-dev";
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("dentus-static-") && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (
    request.mode === "navigate" &&
    request.method === "GET" &&
    !request.headers.has("Authorization") &&
    new URL(request.url).origin === self.location.origin
  ) {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE);
        return (await cache.match("/index.html")) || Response.error();
      }),
    );
    return;
  }
  if (!canCacheRequest(request, self.location.origin, ASSETS)) return;
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const saved = await cache.match(request);
      return saved || fetch(request);
    }),
  );
});
// No skipWaiting or forced reload: updates activate after all previous clients close.
