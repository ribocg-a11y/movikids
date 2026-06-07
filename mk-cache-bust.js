/* MOVI KIDS — cache buster pós mk-version.js (Pacote M.2) */
(function () {
  const CURRENT = (typeof window !== 'undefined' && window.MK_VERSION) ? window.MK_VERSION : '1.7.73';
  const KEY = 'mk_loaded_version';
  function mkVerParts_(v) {
    return String(v || '0.0').split('.').map(function (n) { return parseInt(n, 10) || 0; });
  }
  function mkVerNewer_(a, b) {
    const pa = mkVerParts_(a), pb = mkVerParts_(b);
    for (let i = 0; i < 3; i++) {
      if (pa[i] > pb[i]) return true;
      if (pa[i] < pb[i]) return false;
    }
    return false;
  }
  try {
    const stored = localStorage.getItem(KEY) || '';
    const m = location.search.match(/force[=:\-]+([0-9]+\.[0-9]+)/i);
    const urlVer = m ? m[1] : '';
    const precisaAtualizar = !stored || mkVerNewer_(CURRENT, stored) || stored !== CURRENT || (urlVer && urlVer !== CURRENT);
    if (precisaAtualizar) {
      try {
        var _s = sessionStorage.getItem('mk_auth_session_v1');
        if (_s) {
          localStorage.setItem('mk_auth_session_persist_v1', _s);
          localStorage.setItem('mk_auth_session_persist_at', String(Date.now()));
        }
      } catch (e) {}
      localStorage.setItem(KEY, CURRENT);
      if (window.caches) caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
      if ('serviceWorker' in navigator) navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
      if (!location.search.includes('force=' + CURRENT)) {
        location.replace(location.pathname + '?force=' + CURRENT + '&t=' + Date.now());
      }
    }
  } catch (e) {}
})();
