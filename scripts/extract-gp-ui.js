const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'ponto-mockup.html'), 'utf8').split(/\r?\n/);
let script = src.slice(384, 1033).join('\n');
script = script.replace(
  "function colabSair() { colabLogado=null; go('s-home'); }",
  "function colabSair() { colabSairProd(); }"
);
script = script.replace(
  `    if (MK_GP_PROD) {
      document.getElementById('mock-banner').innerHTML = 'GESTÃO DE PESSOAS <strong>v1.8.39</strong> · produção · planilha + GAS v1.5.98';
      document.title = 'MOVI KIDS — Gestão de Pessoas';
    }`,
  `    if (MK_GP_PROD) {
      document.title = 'MOVI KIDS — Colaboradores';
      var tb = document.getElementById('gp-topbar-title');
      if (tb) tb.textContent = 'Colaboradores · v' + (global.MK_VERSION || '');
    }`
);
script = script.replace(
  /\/\* ── INIT ── \*\/[\s\S]*$/,
  ''
);
const out = `/* MOVI KIDS — Gestão de Pessoas UI (colaborador) */
(function (global) {
'use strict';
${script}

function gpVoltarInicio() {
  var v = global.MK_VERSION || '1.8.43';
  global.location.href = 'index.html?force=' + encodeURIComponent(v);
}
function colabSairProd() {
  colabLogado = null;
  gpSessionPin = '';
  if (MK_GP_PROD) { gpVoltarInicio(); return; }
  go('s-home');
}
function initGpUi() {
  if (MK_GP_PROD) {
    document.documentElement.classList.add('gp-prod');
    ['mock-banner', 'url-warn', 'wrong-host-block'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    document.querySelectorAll('.mock-footer,.mock-only,#s-home,#s-balcao,#s-adm-pin,#s-adm-hub,#mock-adm-alert').forEach(function (el) {
      el.style.display = 'none';
    });
    var hint = document.getElementById('colab-mock-hint');
    if (hint) hint.style.display = 'none';
    document.querySelectorAll('.gp-back-index').forEach(function (btn) {
      btn.onclick = function (e) { e.preventDefault(); gpVoltarInicio(); };
    });
  }
  if (document.getElementById('adm-pin')) {
    adminPins = buildPinRow('adm-pin', typeof admEntrar === 'function' ? admEntrar : null);
  }
  document.getElementById('colab-btn-entrar').addEventListener('click', colabEntrar);
  document.getElementById('colab-picks').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-uid]');
    if (btn) colabPick(btn.dataset.uid);
  });
  global.go = go;
  global.colabPick = colabPick;
  global.colabEntrar = colabEntrar;
  global.colabCancelPin = colabCancelPin;
  setInterval(function () {
    var el = document.getElementById('ponto-clock');
    if (el && document.getElementById('s-ponto').classList.contains('active')) el.textContent = fmtTime();
  }, 1000);
  if (MK_GP_PROD) {
    document.querySelectorAll('.mock-screen').forEach(function (s) { s.classList.remove('active'); });
    var login = document.getElementById('s-colab-login');
    if (login) login.classList.add('active');
    renderColabLogin();
    return;
  }
  if (location.hostname && location.hostname.indexOf('ribocg-a11y') === -1 && location.protocol !== 'file:') {
    var w = document.getElementById('wrong-host-block');
    if (w) {
      w.style.display = 'block';
      document.getElementById('wrong-host-name').textContent = location.hostname;
    }
    var uw = document.getElementById('url-warn');
    if (uw) uw.hidden = false;
  }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initGpUi);
else initGpUi();
})(typeof window !== 'undefined' ? window : globalThis);
`;
fs.writeFileSync(path.join(root, 'mk-gestao-pessoas-ui.js'), out, 'utf8');
console.log('OK mk-gestao-pessoas-ui.js', out.length);
