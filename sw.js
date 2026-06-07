// MOVI KIDS - Service Worker 1.7.12

const SW_VERSION = '1.7.73';

const NETWORK_FIRST = [
  'script.google.com',
  'index.html',
  'acompanhar.html',
  'foto-moldura.html',
  'mk-version.js',
  'gas-endpoint.json',
  'mk-auth.js',
  'mk-update.js',
  'mk-design.css',
  'mk-app.css',
  'mk-stale-sync.js',
  'mk-cache-bust.js',
  'mk-firebase.js',
  'mk-api.js',
  'mk-sync.js',
  'mk-sessao.js',
  'mk-nova.js',
  'mk-drawer.js',
  'mk-operacao.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    clients.forEach(c => {
      try { c.postMessage({ type: 'MK_UPDATE_READY', version: SW_VERSION }); } catch (e) {}
    });
  })());
});

self.addEventListener('fetch', event => {
  const url = event.request.url;
  if (NETWORK_FIRST.some(p => url.includes(p)) || event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }
  event.respondWith(fetch(event.request));
});
