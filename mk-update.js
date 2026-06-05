/* MOVI KIDS — Auto-atualização segura (preserva login operador/admin) */
(function () {
  const PERSIST_KEY = 'mk_auth_session_persist_v1';
  const PERSIST_AT = 'mk_auth_session_persist_at';
  const PERSIST_TTL_MS = 24 * 60 * 60 * 1000;
  const CHECK_MS = 45000;
  const ACTIVE_TIMER_DELAY_MS = 30000;
  const IDLE_DELAY_MS = 5000;
  let _updateBusy = false;
  let _updateScheduled = false;

  function persistAuthSession_() {
    try {
      const raw = sessionStorage.getItem('mk_auth_session_v1');
      if (raw) {
        localStorage.setItem(PERSIST_KEY, raw);
        localStorage.setItem(PERSIST_AT, String(Date.now()));
      }
      if (window.isAdmin) localStorage.setItem('mk_admin_ui_persist', '1');
      else localStorage.removeItem('mk_admin_ui_persist');
    } catch (e) { /* ignore */ }
  }

  function restoreAuthSession_() {
    try {
      if (sessionStorage.getItem('mk_auth_session_v1')) return false;
      const raw = localStorage.getItem(PERSIST_KEY);
      const at = Number(localStorage.getItem(PERSIST_AT) || 0);
      if (!raw || !at || Date.now() - at > PERSIST_TTL_MS) return false;
      sessionStorage.setItem('mk_auth_session_v1', raw);
      return true;
    } catch (e) {
      return false;
    }
  }

  function hasActiveTimerSession_() {
    try {
      const raw = localStorage.getItem('mk_sessions');
      if (!raw) return false;
      const list = JSON.parse(raw);
      if (!Array.isArray(list)) return false;
      return list.some(s => s && s.started && String(s.status) === 'Ativa');
    } catch (e) {
      return false;
    }
  }

  function verParts_(v) {
    return String(v || '0.0').split('.').map(n => parseInt(n, 10) || 0);
  }

  function verNewer_(a, b) {
    const pa = verParts_(a);
    const pb = verParts_(b);
    for (let i = 0; i < 3; i++) {
      if (pa[i] > pb[i]) return true;
      if (pa[i] < pb[i]) return false;
    }
    return false;
  }

  function clearCachesAndSw_() {
    try {
      if (window.caches) {
        caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
      }
    } catch (e) { /* ignore */ }
  }

  window.mkPersistAuthSession = persistAuthSession_;
  window.mkRestoreAuthSession = restoreAuthSession_;

  window.mkApplyAppUpdate = function mkApplyAppUpdate(newVersion) {
    if (_updateBusy) return;
    _updateBusy = true;
    persistAuthSession_();
    clearCachesAndSw_();
    try {
      localStorage.setItem('mk_loaded_version', newVersion || '');
    } catch (e) { /* ignore */ }
    const path = location.pathname || '/movikids/';
    const base = location.origin + path;
    const q = '?force=' + encodeURIComponent(newVersion || '') + '&t=' + Date.now();
    location.replace(base + q);
  };

  async function fetchRemoteVersion_() {
    const path = location.pathname || '/movikids/';
    const base = path.endsWith('/') ? path : path.replace(/[^/]+$/, '');
    const url = location.origin + base + 'mk-version.js?nocache=' + Date.now();
    const r = await fetch(url, { cache: 'no-store' });
    const text = await r.text();
    const m = text.match(/MK_VERSION\s*=\s*'([^']+)'/);
    return m ? m[1] : null;
  }

  function scheduleUpdate_(remote, delayMs) {
    if (_updateBusy || _updateScheduled) return;
    _updateScheduled = true;
    window.mkPendingUpdateVersion = remote;
    const banner = document.getElementById('update-banner');
    const cd = document.getElementById('update-countdown');
    const verEl = document.getElementById('update-remote-ver');
    if (banner) banner.style.display = 'flex';
    if (verEl) verEl.textContent = remote;
    let secs = Math.ceil(delayMs / 1000);
    if (cd) cd.textContent = secs;
    const iv = setInterval(() => {
      secs--;
      if (cd) cd.textContent = Math.max(0, secs);
      if (secs <= 0) clearInterval(iv);
    }, 1000);
    setTimeout(() => {
      _updateScheduled = false;
      if (!_updateBusy) window.mkApplyAppUpdate(remote);
    }, delayMs);
  }

  window.verificarNovaVersao = async function verificarNovaVersao() {
    if (_updateBusy || _updateScheduled || document.visibilityState === 'hidden') return;
    const localVer = (typeof APP_VERSION !== 'undefined' && APP_VERSION)
      || (typeof window.MK_VERSION !== 'undefined' && window.MK_VERSION)
      || '';
    try {
      const remote = await fetchRemoteVersion_();
      if (!remote || !verNewer_(remote, localVer)) return;
      const delay = hasActiveTimerSession_() ? ACTIVE_TIMER_DELAY_MS : IDLE_DELAY_MS;
      if (hasActiveTimerSession_() && typeof toast === 'function') {
        toast('Nova versão ' + remote + ' — atualiza em ' + (delay / 1000) + 's', 'warning');
      }
      scheduleUpdate_(remote, delay);
    } catch (e) { /* silencioso */ }
  };

  restoreAuthSession_();
  persistAuthSession_();
  setInterval(persistAuthSession_, 15000);
  window.addEventListener('pagehide', persistAuthSession_);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      persistAuthSession_();
      verificarNovaVersao();
    }
  });
  setTimeout(verificarNovaVersao, 8000);
  setInterval(verificarNovaVersao, CHECK_MS);
})();
