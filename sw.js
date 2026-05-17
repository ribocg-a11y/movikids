// ═══════════════════════════════════════════════════════════
// MOVI KIDS — Service Worker v1.0
// Habilita comportamento de app nativo (instalável, offline básico)
// ═══════════════════════════════════════════════════════════

const CACHE_NAME = 'movikids-v1.1';
const STATIC_CACHE = [
  '/movikids/',
  '/movikids/index.html',
  '/movikids/manifest.json',
  '/movikids/icon-192.png',
  '/movikids/icon-512.png',
  '/movikids/apple-touch-icon.png',
  '/movikids/track.html',
];

// ── INSTALL: pré-cacheia os arquivos estáticos ────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: remove caches antigos ──────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: network-first para API, cache-first para estáticos ─
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Sempre buscar do servidor para chamadas à API do GAS
  if (url.hostname.includes('script.google.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Para tudo mais: cache-first com fallback de rede
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cacheia respostas válidas
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback
        if (event.request.destination === 'document') {
          return caches.match('/movikids/index.html');
        }
      });
    })
  );
});
