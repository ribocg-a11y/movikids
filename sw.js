// MOVI KIDS - Service Worker 1.7.12

const SW_VERSION = '1.8.119';

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
  'mk-sessao.js',
  'mk-nova.js',
  'mk-drawer.js',
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

function mkSwIsGasApi_(url) {
  return url.includes('script.google.com') || url.includes('googleusercontent.com');
}

async function mkSwNetworkFirst_(request) {
  try {
    return await fetch(request);
  } catch (e) {
    const cached = await caches.match(request);
    if (cached) return cached;
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
    return new Response('', { status: 503, statusText: 'Offline' });
  }));
});
