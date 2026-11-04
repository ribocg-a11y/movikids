// MOVI KIDS - Service Worker 1.7.12 · I187 shell cache

const SW_VERSION = '1.9.192';
const MK_SHELL_CACHE = 'mk-shell-' + SW_VERSION;

const NETWORK_FIRST = [
  'index.html',
  'acompanhar.html',
  'foto-moldura.html',
  'qr-balcao-imprimir.html',
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
  'mk-idb-store.js',
  'mk-offline-queue.js',
  'mk-local-snapshot.js',
  'mk-sessao.js',
  'mk-nova.js',
  'mk-drawer.js',
  'mk-enc-extra.js',
  'mk-operacao.js',
  'mk-home.js',
  'mk-meta-operador.js',
  'mk-nav.js',
  'mk-admin.js',
  'mk-historico.js',
  'mk-relacionamento.js',
  'mk-custos.js',
  'mk-avulso.js',
  'mk-core.js',
  'mk-globals.js',
  'mk-gestao-pessoas.js',
  'mk-gestao-pessoas-ui.js',
  'mk-gestao-pessoas-admin.js',
  'mk-gp-boot.js',
  'gestao-pessoas.html',
];

function mkSwBasePath_() {
  try {
    const u = new URL(self.registration.scope);
    return u.pathname.endsWith('/') ? u.pathname : (u.pathname + '/');
  } catch (e) {
    return '/movikids/';
  }
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(MK_SHELL_CACHE);
      const base = mkSwBasePath_();
      const urls = NETWORK_FIRST.map(function (f) {
        return base + f + (f.indexOf('?') >= 0 ? '&' : '?') + 'v=' + SW_VERSION;
      });
      urls.push(base);
      urls.push(base + 'index.html?v=' + SW_VERSION);
      await Promise.all(urls.map(function (u) {
        return cache.add(u).catch(function () { /* asset opcional */ });
      }));
    } catch (e) { /* precache best-effort */ }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(function (k) {
      if (k === MK_SHELL_CACHE) return Promise.resolve();
      return caches.delete(k);
    }));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    clients.forEach(c => {
      try { c.postMessage({ type: 'MK_UPDATE_READY', version: SW_VERSION }); } catch (e) {}
    });
  })());
});

function mkSwIsGasApi_(url) {
  return url.includes('script.google.com') || url.includes('googleusercontent.com');
}

async function mkSwNetworkFirst_(request) {
  try {
    const res = await fetch(request);
    if (res && res.ok && request.method === 'GET') {
      try {
        const cache = await caches.open(MK_SHELL_CACHE);
        cache.put(request, res.clone());
      } catch (eC) { /* ignore */ }
    }
    return res;
  } catch (e) {
    const cached = await caches.match(request);
    if (cached) return cached;
    const byUrl = await caches.match(request.url);
    if (byUrl) return byUrl;
    return new Response('{"ok":false,"erro":"Sem conexao com o servidor"}', {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

self.addEventListener('fetch', event => {
  const url = event.request.url;
  /* GAS: não interceptar — redirect googleusercontent + iOS PWA quebrava com respondWith null */
  if (mkSwIsGasApi_(url)) return;
  if (NETWORK_FIRST.some(p => url.includes(p)) || event.request.mode === 'navigate') {
    event.respondWith(mkSwNetworkFirst_(event.request));
    return;
  }
  event.respondWith(fetch(event.request).catch(function () {
    return caches.match(event.request).then(function (c) {
      return c || new Response('', { status: 503, statusText: 'Offline' });
    });
  }));
});
