// MOVI KIDS - Service Worker 1.6.70
// Hotfix: nao manter cache persistente do app. Rede sempre primeiro.
const SW_VERSION = '1.6.70';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const url = event.request.url;
  if (
    url.includes('script.google.com') ||
    url.includes('index.html') ||
    url.includes('acompanhar.html') ||
    event.request.mode === 'navigate'
  ) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }
  event.respondWith(fetch(event.request));
});
