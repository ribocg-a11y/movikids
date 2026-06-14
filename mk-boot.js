/* MOVI KIDS - boot PWA + auth (Pacote M.17) */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof mkAuthBoot === 'function') {
    mkAuthBoot().catch(e => {
      console.error('[mk-auth]', e);
      const el = document.getElementById('mk-login-err');
      if (el) { el.textContent = (e && e.message) || 'Erro ao iniciar login'; el.style.display = 'block'; }
    });
  } else if (typeof init === 'function') init();
  if (typeof mkApplyComunicacaoModoUi_ === 'function') mkApplyComunicacaoModoUi_();
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data && event.data.type === 'MK_UPDATE_READY') {
      const swVersion = event.data.version || '';
      if (swVersion && swVersion !== APP_VERSION && typeof mkApplyAppUpdate === 'function') {
        mkApplyAppUpdate(swVersion);
      }
    }
  });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/movikids/sw.js?v=' + APP_VERSION)
      .then(reg => console.log('SW registrado:', reg.scope))
      .catch(err => console.warn('SW erro:', err));
  });
}
