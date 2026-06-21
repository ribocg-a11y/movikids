/* MOVI KIDS — boot Colaboradores (gestao-pessoas.html · Safari / PWA) */
(function () {
  var v = window.MK_VERSION || '1.8.105';
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
})();
