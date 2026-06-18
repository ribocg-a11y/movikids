const fs = require('fs');
const p = require('path').join(__dirname, '..', 'ponto-mockup.html');
const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
const out = lines.slice(0, 381).concat([
  '  <div class="mock-footer">Mockup FASE 15 · <a href="assets/gestao-pessoas-mockup-gestor.html">Visão gestor →</a></div>',
  '',
  '  <script src="mk-gestao-pessoas-ui.js?v=1.8.43"></script>',
  '</body>',
  '</html>',
  ''
]).join('\n');
fs.writeFileSync(p, out);
console.log('truncated', p);
