// ParkBites service worker. Parks have bad signal, so everything the app needs is cached after the first visit.
// Strategy: navigations and static assets are stale-while-revalidate; nothing cross-origin is cached.
// Bump CACHE when this file's logic changes so old caches are dropped on activate.
const CACHE = 'parkbites-v1';

// Precache the shell plus the hashed JS/CSS the page references, so a first-time visitor can go offline immediately.
async function precache() {
  const cache = await caches.open(CACHE);
  const html = await (await fetch('/', { cache: 'reload' })).text();
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(m => m[1]);
  await cache.addAll(['/', '/manifest.webmanifest', '/icon-192.png', ...assets]);
}

self.addEventListener('install', e => {
  e.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  e.respondWith(
    caches.open(CACHE).then(async cache => {
      // ignoreVary: servers send 'Vary: Origin' and module scripts carry an Origin header the precache fetch lacked,
      // so a strict match misses and the app boots to a blank page offline.
      const cached = await cache.match(req, { ignoreSearch: req.mode === 'navigate', ignoreVary: true });
      const network = fetch(req)
        .then(res => { if (res.ok) cache.put(req.mode === 'navigate' ? '/' : req, res.clone()); return res; })
        .catch(() => cached);
      // Serve the cached copy immediately when we have one; the network refreshes it for next time.
      return cached || network;
    }),
  );
});
