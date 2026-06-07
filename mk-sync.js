/* MOVI KIDS — syncController + merge Firebase/GAS (Pacote M.4)
 * Carregar após o script inline principal (sessions, renderCards, etc.).
 */
const _POLL_ACTIVE = 5000;
const _POLL_IDLE   = 15000;
let   _mainPollTimer = null;

function agendarProximoPoll() {
  clearTimeout(_mainPollTimer);
  const temAtivos = Array.isArray(sessions) && sessions.some(s =>
    (typeof sessaoTimerIniciado_ === 'function' ? sessaoTimerIniciado_(s) : (s.started && s.status === 'Ativa'))
  );
  const intervalo = temAtivos ? _POLL_ACTIVE : _POLL_IDLE;
  _mainPollTimer = setTimeout(() => {
    if (document.visibilityState !== 'hidden') syncController();
    agendarProximoPoll();
  }, intervalo);
}

let _syncFailCount  = 0;
let _syncInFlight   = false;
let _syncPending    = false;
let _syncDebounce   = null;
let _syncBackoffMs  = 0;
let _lastSyncAt     = 0;
let _lastActivity   = Date.now();
let _wasHiddenAt    = null;
let _smsStatusSweepAt = 0;
const _FAIL_THRESH  = 3;
const _BACKOFF_MAX  = 60000;
let _lastFailAt     = 0;
let _syncSafetyTimer = null;
const _IDLE_MS      = 5 * 60 * 1000;

function syncController(force = false, delayMs = 0) {
  if (delayMs > 0) {
    clearTimeout(_syncDebounce);
    _syncDebounce = setTimeout(() => syncController(force, 0), delayMs);
    return;
  }
  if (_syncInFlight) {
    if (force) _syncPending = true;
    return;
  }
  sincronizarServidor(force);
}

['click','keydown','touchstart','scroll','mousemove'].forEach(ev =>
  document.addEventListener(ev, () => { _lastActivity = Date.now(); }, { passive: true })
);

async function sincronizarServidor(force = false) {
  if (_syncInFlight) {
    if (force) _syncPending = true;
    return;
  }
  _syncInFlight = true;
  clearTimeout(_syncSafetyTimer);
  _syncSafetyTimer = setTimeout(() => {
    if (_syncInFlight) {
      console.warn('[Sync] safety timeout — liberando lock travado');
      _syncInFlight = false;
      _syncFailCount++;
      _lastFailAt = Date.now();
      _syncBackoffMs = Math.min(_syncBackoffMs ? _syncBackoffMs * 2 : 5000, _BACKOFF_MAX);
    }
  }, 35000);

  try {
    const CACHE_KEY = 'mk_inicio_cache';
    const CACHE_TTL = 5000;

    if (!force) {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        try {
          const { data, ts } = JSON.parse(raw);
          const age = Date.now() - ts;
          _lastSyncAt = Math.max(_lastSyncAt, ts);
          if (age < CACHE_TTL) {
            aplicarDadosInicio(data);
            setStatus(true);
            _syncInFlight = false;
            return;
          }
          aplicarDadosInicio(data);
          setStatus(true);
        } catch(e) {}
      }
    } else {
      try { localStorage.removeItem(CACHE_KEY); } catch(e) {}
    }

    if (_syncBackoffMs > 0) {
      const sinceLastFail = Date.now() - (_lastFailAt || 0);
      if (sinceLastFail < _syncBackoffMs) return;
    }

    if (_syncFailCount > 0) setStatus(null);

    const d = await api({ action: 'carregarInicio', ...apiParamsComAuth_() });

    if (!d.ok) {
      _syncFailCount++;
      _lastFailAt   = Date.now();
      _syncBackoffMs = Math.min(_syncBackoffMs ? _syncBackoffMs * 2 : 5000, _BACKOFF_MAX);
      if (_syncFailCount >= _FAIL_THRESH) setStatus(false);
      return;
    }

    _syncFailCount = 0;
    _syncBackoffMs = 0;
    _lastSyncAt    = Date.now();
    if (typeof agendarProximoPoll === 'function') agendarProximoPoll();
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data: d, ts: Date.now() })); } catch(e) {}
    setStatus(true);
    aplicarDadosInicio(d);

  } catch(e) {
    _syncFailCount++;
    _lastFailAt   = Date.now();
    _syncBackoffMs = Math.min(_syncBackoffMs ? _syncBackoffMs * 2 : 5000, _BACKOFF_MAX);
    console.error('[Sync]', e.message || e);
    if (_syncFailCount >= _FAIL_THRESH) setStatus(false);

  } finally {
    clearTimeout(_syncSafetyTimer);
    _syncInFlight = false;
    if (_syncPending) {
      _syncPending = false;
      setTimeout(() => sincronizarServidor(true), 300);
    }
  }
}

function mergeSessaoCanonica(serverSession, localSession = {}) {
  const hasServerExtMins = Object.prototype.hasOwnProperty.call(serverSession, 'extendedMins');
  const hasServerExtValor = Object.prototype.hasOwnProperty.call(serverSession, 'extendedValor');
  const extendedMins = Number(hasServerExtMins ? serverSession.extendedMins || 0 : localSession.extendedMins || 0);
  const extendedValor = Number(hasServerExtValor ? serverSession.extendedValor || 0 : localSession.extendedValor || 0);
  const canonIn = Object.assign({}, serverSession, {
    extendedMins,
    extendedValor,
    originalMins: serverSession.originalMins != null
      ? serverSession.originalMins
      : Math.max(0, Number(serverSession.mins || 0) - extendedMins)
  });
  const canon = typeof canonSessao_ === 'function' ? canonSessao_(canonIn) : canonIn;
  let status = canon.status;
  let startTimestamp = canon.startTimestamp;
  let isAtiva = status === 'Ativa';

  if (localSession._iniciandoTimer && localSession.started && localSession.status === 'Ativa') {
    if (!isAtiva || !startTimestamp || startTimestamp < 1e12) {
      status = 'Ativa';
      isAtiva = true;
      startTimestamp = Number(localSession._localTimerStart || localSession.startTimestamp || 0);
    }
  }

  const localStart = Number(localSession._localTimerStart || 0);
  if (localStart >= 1e12 && isAtiva && startTimestamp >= 1e12) {
    if (startTimestamp > localStart && startTimestamp - localStart <= 120000) {
      startTimestamp = localStart;
    }
  }

  return {
    ...serverSession,
    status,
    startTimestamp,
    _localTimerStart: localStart >= 1e12 ? localStart : localSession._localTimerStart,
    _iniciandoTimer: localSession._iniciandoTimer,
    mins: canon.mins,
    originalMins: canon.originalMins,
    extendedMins: canon.extendedMins,
    extendedValor,
    started: typeof sessaoTimerIniciado_ === 'function' ? sessaoTimerIniciado_(canon) : (isAtiva && startTimestamp >= 1e12),
    alertFired5: Boolean(localSession.alertFired5) || Boolean(serverSession.smsFlags && serverSession.smsFlags.alerta),
    alertFiredExp: Boolean(localSession.alertFiredExp) || Boolean(serverSession.smsFlags && serverSession.smsFlags.esgotado),
    extraWaSentAt: localSession.extraWaSentAt || localStorage.getItem(extraWaKey_(serverSession)) ||
      (serverSession.smsFlags && serverSession.smsFlags.esgotado ? Date.now() : null),
    smsStatus: higienizarSmsStatusSessao_(serverSession.smsStatus || localSession.smsStatus || null),
    smsFlags: serverSession.smsFlags || localSession.smsFlags || null
  };
}

function sanitizarDadosInicioOperador_(d) {
  if (!d || mkExibirFinanceiro_()) return d;
  if (d.statsHoje) d.statsHoje = { n: d.statsHoje.n };
  if (Array.isArray(d.encHoje)) {
    d.encHoje = d.encHoje.map(e => {
      const o = Object.assign({}, e);
      delete o.valorTotal;
      return o;
    });
  }
  if (Array.isArray(d.ativos)) {
    d.ativos = d.ativos.map(s => {
      const o = Object.assign({}, s);
      delete o.valorPlano;
      delete o.adicionalPorMin;
      return o;
    });
  }
  return d;
}

function aplicarDadosInicio(d) {
  try {
    if (!d || !Array.isArray(d.ativos)) return;
    if (d.operacaoConfig) aplicarOperacaoConfig_(d.operacaoConfig);
    d = sanitizarDadosInicioOperador_(d);
    window._lastSyncSource = d.fonte || 'gas';
    window._lastCanonicalRows = d.ativos.length;
    if (d.fonte === 'firebase') window._fbLastUpdate = Date.now();

    const stored = JSON.parse(localStorage.getItem('mk_sessions') || '[]');
    const storedMap = {};
    stored.forEach(s => storedMap[s.rowIndex] = s);

    const serverRows = new Set(d.ativos.map(s => s.rowIndex));
    const cleanedStored = stored.filter(s => serverRows.has(s.rowIndex));
    if (cleanedStored.length !== stored.length) {
      try { localStorage.setItem('mk_sessions', JSON.stringify(cleanedStored)); } catch(e) {}
    }

    sessions = d.ativos.map(s => mergeSessaoCanonica(s, storedMap[s.rowIndex] || {}));
    saveSessions();

    if (d.statsHoje) {
      statsHoje.n = d.statsHoje.n;
      if (mkExibirFinanceiro_()) statsHoje.fat = Number(d.statsHoje.fat) || 0;
      else statsHoje.fat = 0;
    }

    renderCards();
    updateStats();

    if (d.encHoje && d.fonte !== 'firebase') renderEncHoje(d.encHoje);
    atualizarVeiculoGrid();

    if (d.custosHoje) { custosHoje = d.custosHoje; renderCustos(); }
    else loadCustosHoje();
    agendarProximoPoll();
  } catch(e) {
    console.error('aplicarDadosInicio:', e);
    setStatus(false);
  }
}
window.aplicarDadosInicio = aplicarDadosInicio;

function setStatus(online) {
  const dot = document.getElementById('status-dot');
  const txt = document.getElementById('status-txt');
  const efectivo = (online === false && _syncFailCount < _FAIL_THRESH) ? null : online;
  if (dot && txt) {
    if (efectivo===null) { dot.className='dot-online';dot.style.background='#FFB74D';txt.textContent='Verificando...'; }
    else if (efectivo)   { dot.className='dot-online';dot.style.background='';txt.textContent='Online'; }
    else                 { dot.className='dot-offline';dot.style.background='';txt.textContent='Offline'; }
  }
  if (typeof syncSidebarStatus === 'function') syncSidebarStatus(efectivo);
}

function mkSyncWireEvents_() {
  try {
    const bc = new BroadcastChannel('movikids_sync');
    bc.onmessage = (e) => {
      if (e.data === 'invalidate' || e.data === 'sync') syncController(true, 0);
    };
    window._bc = bc;
  } catch(e) {}
  window.broadcastInvalidate = () => { try { window._bc?.postMessage('invalidate'); } catch(e) {} };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      _wasHiddenAt = Date.now();
    } else {
      const hiddenMs = _wasHiddenAt ? Date.now() - _wasHiddenAt : 0;
      _wasHiddenAt = null;
      if (hiddenMs > 30000) syncController(true, 0);
      else syncController(false, 500);
    }
  });

  window.addEventListener('focus', () => {
    const sinceLastSync = Date.now() - (_lastSyncAt || 0);
    if (sinceLastSync > 20000) syncController(false, 2000);
  });

  setInterval(() => {
    const dashPage = document.getElementById('page-dashboard');
    if (dashPage && dashPage.classList.contains('active') &&
        document.visibilityState === 'visible') {
      syncController(false, 0);
    }
  }, 60000);

  setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    const idleMs = Date.now() - _lastActivity;
    if (idleMs > _IDLE_MS) {
      _lastActivity = Date.now();
      if (_syncBackoffMs === 0) syncController(true, 0);
      else syncController(false, 0);
    }
  }, 60000);

  setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    syncController(true, 0);
  }, 30000);
}

window.syncController = syncController;
window.agendarProximoPoll = agendarProximoPoll;
window.sincronizarServidor = sincronizarServidor;
window.setStatus = setStatus;
