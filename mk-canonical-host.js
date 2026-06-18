/* MOVI KIDS — host canônico + URLs legadas FASE 15 */
(function () {
  var h = location.hostname || '';
  if (h.indexOf('ribocg.a11y') >= 0) {
    location.replace(location.href.replace(/ribocg\.a11y/g, 'ribocg-a11y'));
    return;
  }
  var path = location.pathname || '';
  var q = location.search || '';
  if (q.indexOf('prod=1') >= 0) {
    var mockPaths = ['ponto-mockup', 'ponto_mockup', 'gestao-pessoas-mockup', 'mock-gestao', 'mock-ponto'];
    for (var i = 0; i < mockPaths.length; i++) {
      if (path.indexOf(mockPaths[i]) >= 0) {
        location.replace('gestao-pessoas.html?_=' + Date.now());
        return;
      }
    }
  }
})();
