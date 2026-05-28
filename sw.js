// MOVI KIDS — Service Worker v1.6.7
const CACHE = 'movikids-v1.6.7';

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
  // GAS: sempre vai para rede — sem cache, sem fallback
  // caches.match para GAS retorna undefined (sem cache) = resposta inválida = erro
  if (e.request.url.includes('script.google.com') ||
      e.request.url.includes('script.googleusercontent.com')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Documentos e index.html: rede primeiro
  if (e.request.destination === 'document' ||
      e.request.url.includes('index.html')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // Assets estáticos: cache first
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
