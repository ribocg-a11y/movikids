/* MOVI KIDS — Auto-atualização segura (preserva login operador/admin) */
(function () {
  const PERSIST_KEY = 'mk_auth_session_persist_v1';
  const PERSIST_AT = 'mk_auth_session_persist_at';
  const PERSIST_TTL_MS = 24 * 60 * 60 * 1000;
  const CHECK_MS = 45000;
  let _updateBusy = false;

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

  window.mkPersistAuthSession = persistAuthSession_;
  window.mkRestoreAuthSession = restoreAuthSession_;

  window.mkApplyAppUpdate = function mkApplyAppUpdate(newVersion) {
    if (_updateBusy) return;
    _updateBusy = true;
    persistAuthSession_();
    try {
      localStorage.setItem('mk_loaded_version', newVersion || '');
    } catch (e) { /* ignore */ }
    const path = location.pathname || '/movikids/';
    const base = location.origin + path;
    const q = '?force=' + encodeURIComponent(newVersion || '') + '&t=' + Date.now();
    location.replace(base + q);
  };

  async function fetchRemoteVersion_() {
    const url = (location.origin + (location.pathname || '/movikids/')) + '?nocache=' + Date.now();
    const r = await fetch(url, { cache: 'no-store' });
    const html = await r.text();
    const m = html.match(/MK_VERSION\s*=\s*'([^']+)'/)
      || html.match(/APP_VERSION\s*=\s*'([^']+)'/);
    return m ? m[1] : null;
  }

  window.verificarNovaVersao = async function verificarNovaVersao() {
    if (_updateBusy || document.visibilityState === 'hidden') return;
    const localVer = typeof APP_VERSION !== 'undefined' ? APP_VERSION : '';
    try {
      const remote = await fetchRemoteVersion_();
      if (!remote || remote === localVer) return;
      if (hasActiveTimerSession_()) {
        if (typeof toast === 'function') {
          toast('Nova versao ' + remote + ' — atualiza ao encerrar timers ou em 2 min', 'warning');
        }
        setTimeout(() => {
          if (!_updateBusy) window.mkApplyAppUpdate(remote);
        }, 120000);
        return;
      }
      const banner = document.getElementById('update-banner');
      if (banner) {
        banner.style.display = 'flex';
        const cd = document.getElementById('update-countdown');
        let secs = 5;
        if (cd) cd.textContent = secs;
        const iv = setInterval(() => {
          secs--;
          if (cd) cd.textContent = Math.max(0, secs);
          if (secs <= 0) {
            clearInterval(iv);
            window.mkApplyAppUpdate(remote);
          }
        }, 1000);
        return;
      }
      window.mkApplyAppUpdate(remote);
    } catch (e) { /* silencioso */ }
  };

  restoreAuthSession_();
  persistAuthSession_();
  setInterval(persistAuthSession_, 15000);
  window.addEventListener('pagehide', persistAuthSession_);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') persistAuthSession_();
  });
})();
