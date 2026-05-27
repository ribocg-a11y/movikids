// MOVI KIDS — Service Worker v1.3.0
// Estratégia: network-first para tudo (sem cache de HTML)
const CACHE = 'movikids-v1.3.0';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Sempre busca da rede — sem cache de documentos
  if (e.request.destination === 'document' || 
      e.request.url.includes('script.google.com') ||
      e.request.url.includes('index.html')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // Imagens e fontes: cache-first
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(r => {
        if (r && r.status === 200) {
          const c = r.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, c));
        }
        return r;
      });
    })
  );
});
