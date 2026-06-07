/* MOVI KIDS — anti-stale sync (Pacote M.2)
 * Deve carregar ANTES de mk-version.js — XHR síncrono à mk-version.js remota.
 */
(function () {
  var KEY = 'mk_loaded_version';
  function verParts(v) {
    return String(v || '0.0').split('.').map(function (n) { return parseInt(n, 10) || 0; });
  }
  function verNewer(a, b) {
    var pa = verParts(a), pb = verParts(b);
    for (var i = 0; i < 3; i++) {
      if (pa[i] > pb[i]) return true;
      if (pa[i] < pb[i]) return false;
    }
    return false;
  }
  function precisaIrPara(remote) {
    if (!remote) return false;
    var stored = '';
    try { stored = localStorage.getItem(KEY) || ''; } catch (e) {}
    var urlM = location.search.match(/force[=:\-]+([0-9]+\.[0-9]+)/i);
    var urlVer = urlM ? urlM[1] : '';
    return !stored || stored !== remote || verNewer(remote, stored) || verNewer(remote, urlVer) || (urlVer && urlVer !== remote);
  }
  function aplicarAtualizacao(remote) {
    try {
      var _s = sessionStorage.getItem('mk_auth_session_v1');
      if (_s) {
        localStorage.setItem('mk_auth_session_persist_v1', _s);
        localStorage.setItem('mk_auth_session_persist_at', String(Date.now()));
      }
    } catch (e) {}
    try { localStorage.setItem(KEY, remote); } catch (e) {}
    try {
      if (window.caches) caches.keys().then(function (keys) { keys.forEach(function (k) { caches.delete(k); }); });
      if ('serviceWorker' in navigator) navigator.serviceWorker.getRegistrations().then(function (regs) { regs.forEach(function (r) { r.unregister(); }); });
    } catch (e) {}
    if (!location.search.includes('force=' + remote)) {
      location.replace(location.pathname + '?force=' + remote + '&t=' + Date.now());
    }
  }
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'mk-version.js?nocache=' + Date.now(), false);
    try { xhr.setRequestHeader('Cache-Control', 'no-cache'); } catch (e) {}
    xhr.send(null);
    if (xhr.status >= 200 && xhr.status < 300) {
      var m = xhr.responseText.match(/MK_VERSION\s*=\s*'([^']+)'/);
      var REMOTE = m ? m[1] : '';
      if (REMOTE && precisaIrPara(REMOTE)) aplicarAtualizacao(REMOTE);
    }
  } catch (e) {}
})();
