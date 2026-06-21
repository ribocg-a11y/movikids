/* MOVI KIDS — api() + guards I15 (Pacote M.3)
 * Carregar após mk-version.js (MK_GAS_EXEC_URL).
 * POST no browser quebra lançamento no tablet — escritas críticas = somente GET.
 */
const WEBAPP_URL = (typeof window !== 'undefined' && window.MK_GAS_EXEC_URL) ? window.MK_GAS_EXEC_URL
  : 'https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec';
const WEBAPP_URL_DEAD_PREFIX = 'AKfycbzc';
let _gasUrlResolved = null;

function mkAppBasePath_() {
  const p = location.pathname || '/movikids/';
  const i = p.lastIndexOf('/');
  return i >= 0 ? p.slice(0, i + 1) : '/movikids/';
}

async function resolveGasUrl_() {
  if (_gasUrlResolved) return _gasUrlResolved;
  let url = WEBAPP_URL;
  try {
    const r = await fetch(location.origin + mkAppBasePath_() + 'gas-endpoint.json?_=' + Date.now(), { cache: 'no-store' });
    if (r.ok) {
      const j = await r.json();
      if (j && j.url && String(j.url).indexOf(WEBAPP_URL_DEAD_PREFIX) < 0) url = j.url;
    }
  } catch (e) { /* fallback WEBAPP_URL */ }
  _gasUrlResolved = url;
  return url;
}

const MK_WRITE_ACTIONS = new Set([
  'salvarLocacao', 'editarLocacao', 'cancelarLocacao', 'encerrarLocacao', 'estenderLocacao'
]);

/** Pacote J (T1): bloqueia POST no browser para escritas criticas — incidente P0 05/06/2026. */
function mkGuardEscritaBrowser_(action, method) {
  const act = String(action || '').trim();
  const m = String(method || 'GET').toUpperCase();
  if (!MK_WRITE_ACTIONS.has(act) || m === 'GET' || m === 'HEAD') return;
  const msg = 'Escritas criticas bloqueadas via ' + m + ' no browser (use GET). Ver docs/arquivo/incidentes/INCIDENTE_POST_BROWSER_LANCAMENTO_2026-06-05.md';
  console.error('[MK_GUARD]', msg, { action: act, method: m });
  throw new Error(msg);
}

function mkActionFromApiUrl_(url) {
  try {
    const u = new URL(String(url), typeof location !== 'undefined' ? location.href : 'https://local/');
    return u.searchParams.get('action') || '';
  } catch (e) {
    const m = String(url).match(/[?&]action=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : '';
  }
}

function mkRequireOperadorEscrita_() {
  const op = typeof operadorApiParams_ === 'function' ? operadorApiParams_() : {};
  if (op.operador) return op;
  toast('Faça login no balcão antes de lançar.', 'error');
  return null;
}

function mkApiFetchJson_(url, init, timeoutMs) {
  const method = String((init && init.method) || 'GET').toUpperCase();
  mkGuardEscritaBrowser_(mkActionFromApiUrl_(url), method);
  const fetchInit = Object.assign({ cache: 'no-store' }, init || {});
  const fetchP = fetch(url, fetchInit)
    .then(async r => {
      const text = await r.text();
      let data;
      try { data = JSON.parse(text); } catch (e) {
        throw new Error('Resposta invalida do GAS (nao-JSON). Publique Nova versao da Web App.');
      }
      if (!r.ok && !data.erro) throw new Error('HTTP ' + r.status);
      return data;
    });
  const timer = new Promise((_, rej) =>
    setTimeout(() => rej(new Error('timeout-' + timeoutMs + 'ms')), timeoutMs));
  return Promise.race([fetchP, timer]);
}

/** Resolve URL GAS cedo — evita latência na 1ª api(). */
function mkApiWarm_() {
  resolveGasUrl_().catch(function () { /* fallback WEBAPP_URL */ });
}

async function api(params, timeoutMs = 25000, fetchInit) {
  const gasUrl = await resolveGasUrl_();
  const action = String((params && params.action) || '');
  const init = Object.assign({ method: 'GET', redirect: 'follow', cache: 'no-store' }, fetchInit || {});
  mkGuardEscritaBrowser_(action, init.method);
  const payload = Object.assign({ _t: Date.now() }, params);
  if (MK_WRITE_ACTIONS.has(action) && typeof operadorApiParams_ === 'function') {
    Object.assign(payload, operadorApiParams_());
  }
  const qs = new URLSearchParams(payload).toString();
  return mkApiFetchJson_(`${gasUrl}?${qs}`, init, timeoutMs);
}
window.api = api;
window.mkApiWarm_ = mkApiWarm_;
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mkApiWarm_);
  } else {
    mkApiWarm_();
  }
}
