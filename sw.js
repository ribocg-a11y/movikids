// MOVI KIDS - Service Worker 1.6.58
// Hotfix: nao manter cache persistente do app. Rede sempre primeiro.
const SW_VERSION = '1.6.58';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    clients.forEach(client => client.postMessage({ type: 'MK_UPDATE_READY', version: SW_VERSION }));
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    fetch(req, { cache: 'no-store' }).catch(() => caches.match(req))
  );
});
