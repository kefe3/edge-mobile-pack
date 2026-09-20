/**
 * PWA Service Worker Template
 * Stale-While-Revalidate caching with Background Sync support.
 */
const CACHE_NAME = 'edge-mobile-cache-v1';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  '../src/edge-mobile-pack.css',
  '../src/edge-offline.js',
  '../src/edge-mobile.js',
  '../src/edge-turn-accelerator.js',
  '../src/edge-mobile-pack.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      const network = fetch(event.request).then((res) => {
        if (res && res.status === 200) cache.put(event.request, res.clone());
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'edge-sync-outbox') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach(c => c.postMessage({ type: 'TRIGGER_OFFLINE_SYNC' }));
      })
    );
  }
});
