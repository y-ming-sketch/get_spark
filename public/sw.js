/* Spark — Service Worker
 *
 * Strategy:
 *   - Cache the app shell on install for instant cold starts.
 *   - Stale-while-revalidate for static assets (/_next/static, /icons).
 *   - Never cache /api/* — chat must always be fresh and streamed.
 *   - Skip waiting + clients.claim() so updates roll out immediately on reload.
 */

const VERSION = "spark-v1";
const PRECACHE = `${VERSION}-precache`;
const RUNTIME = `${VERSION}-runtime`;

const APP_SHELL = [
  "/",
  "/favicon.svg",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => !k.startsWith(VERSION))
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept API/streaming routes
  if (url.pathname.startsWith("/api/")) return;

  // Stale-while-revalidate for static assets
  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".ico");

  if (isStatic) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Network-first for HTML pages with offline fallback to the cached shell
  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req));
  }
});

async function staleWhileRevalidate(req) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(req);
  const networkPromise = fetch(req)
    .then((res) => {
      if (res && res.status === 200) cache.put(req, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || networkPromise;
}

async function networkFirst(req) {
  try {
    const res = await fetch(req);
    const cache = await caches.open(RUNTIME);
    cache.put(req, res.clone());
    return res;
  } catch {
    const cache = await caches.open(PRECACHE);
    return (await cache.match(req)) || (await cache.match("/"));
  }
}
