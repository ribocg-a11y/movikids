// ═══════════════════════════════════════════════════════════
// MOVI KIDS — Service Worker v1.3.0
// Atualizado: força limpeza do cache antigo
// ═══════════════════════════════════════════════════════════

const CACHE_NAME = 'movikids-v1.3.0';
const STATIC_CACHE = [
  '/movikids/',
  '/movikids/index.html',
  '/movikids/manifest.json',
  '/movikids/icon-192.png',
  '/movikids/icon-512.png',
  '/movikids/apple-touch-icon.png',
  '/movikids/track.html',
];

// ── INSTALL ───────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: remove TODOS os caches antigos ─────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] Removendo cache antigo:', k);
          return caches.delete(k);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: network-first para HTML, cache para estáticos ─
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API GAS — sempre da rede
  if (url.hostname.includes('script.google.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // HTML principal — sempre da rede para garantir versão atualizada
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => caches.match('/movikids/index.html'))
    );
    return;
  }

  // Demais estáticos — cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('/movikids/index.html');
        }
      });
    })
  );
});
