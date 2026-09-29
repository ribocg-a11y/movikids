/* MOVI KIDS — boot Colaboradores (gestao-pessoas.html · Safari / PWA) */
(function () {
  var v = window.MK_VERSION || '1.8.108';
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', function (event) {
      if (event.data && event.data.type === 'MK_UPDATE_READY' && event.data.version && event.data.version !== v) {
        if (!location.search.includes('force=' + event.data.version)) {
          location.replace(location.pathname + '?force=' + event.data.version + '&t=' + Date.now());
        }
      }
    });
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/movikids/sw.js?v=' + encodeURIComponent(v)).catch(function () {});
    });
  }
  function applyUnidadeBranding_() {
    try {
      var q = new URLSearchParams(location.search || '');
      var uid = q.get('unidade') || q.get('unit') || '';
      if (uid && typeof mkUnidadeSet_ === 'function') {
        var r = mkUnidadeSet_(uid);
        if (!r || !r.ok) { /* La Ville ainda bloqueada — mantém golden */ }
      }
      var label = (typeof mkUnidadeLabel_ === 'function') ? mkUnidadeLabel_() : '';
      if (!label) return;
      document.querySelectorAll('.gp-unidade-sub').forEach(function (el) {
        var base = (el.textContent || '').replace(/^.*·\s*/, '').trim() || 'Colaboradores';
        if (/pr[eé]-visualiza/i.test(base)) el.textContent = label + ' · Pré-visualização';
        else el.textContent = label + ' · Colaboradores';
      });
    } catch (e) { /* ignore */ }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyUnidadeBranding_);
  } else {
    applyUnidadeBranding_();
  }
})();
