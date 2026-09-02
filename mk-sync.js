/* MOVI KIDS — syncController + merge Firebase/GAS (Pacote M.4)
 * Carregar após o script inline principal (sessions, renderCards, etc.).
 */
const _POLL_ACTIVE = 5000;
const _POLL_IDLE   = 60000;
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
const MK_INICIO_CACHE_KEY = 'mk_inicio_cache_v2';
const MK_INICIO_CACHE_LEGACY = 'mk_inicio_cache';

/** I89 — invalida cache carregarInicio (v2 + legado). Chamar após ▶, nova loc, cancel, encerrar. */
function mkInvalidateInicioCache_() {
  try { localStorage.removeItem(MK_INICIO_CACHE_KEY); } catch (e) { /* ignore */ }
  try { localStorage.removeItem(MK_INICIO_CACHE_LEGACY); } catch (e) { /* ignore */ }
}

/** I90 — operação ativa: nunca servir cache stale (causa cronômetro louco). */
function mkSyncOperacaoAtiva_() {
  if (window._mkTimerInFlight) return true;
  if (!Array.isArray(sessions)) return false;
  return sessions.some(function (s) {
    return s._iniciandoTimer || s.status === 'Ativa' || s.status === 'Pendente';
  });
}

function mkSyncHomeVisible_() {
  const home = document.getElementById('page-home');
  const painel = document.getElementById('page-painel');
  return (home && home.classList.contains('active')) || (painel && painel.classList.contains('active'));
}

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

/** I122 — timeout dedicado: carregarInicio frio pode passar de 25s; default api() gerava fantasma. */
const MK_INICIO_API_TIMEOUT_MS = 55000;
const MK_INICIO_CACHE_MAX_AGE_MS = 3600000;
/** I148 — listarAtivas ~5–15s vs carregarInicio 25–55s; fallback operacional. */
const MK_LISTAR_ATIVAS_TIMEOUT_MS = 30000;
const MK_BOOT_FAST_PATH_MS = 12000;
let _listarAtivasInFlight = false;

function mkInicioFromListarAtivas_(d) {
  if (!d || !d.ok || !Array.isArray(d.locacoes)) return null;
  return {
    ok: true,
    ativos: d.locacoes.map(function (s) {
      const ext = Number(s.extendedMins || 0);
      const base = Number(s.mins || 0);
      const originalMins = s.originalMins != null ? Number(s.originalMins) : Math.max(0, base - ext);
      return Object.assign({}, s, { originalMins, mins: originalMins + ext });
    }),
    fonte: 'listarAtivas',
    parcial: true
  };
}

async function mkSyncListarAtivasFallback_(opts) {
  opts = opts || {};
  if (_listarAtivasInFlight) return false;
  _listarAtivasInFlight = true;
  try {
    const d = await api({ action: 'listarAtivas' }, opts.timeoutMs || MK_LISTAR_ATIVAS_TIMEOUT_MS);
    const payload = mkInicioFromListarAtivas_(d);
    if (!payload) return false;
    aplicarDadosInicio(payload);
    mkSyncClearBootPending_(true);
    setStatus(true);
    if (payload.ativos.length && typeof toast === 'function' && !opts.silent) {
      toast('Locações carregadas (sync completo em segundo plano).', 'success');
    }
    return true;
  } catch (e) {
    console.warn('[Sync] listarAtivas fallback', e.message || e);
    return false;
  } finally {
    _listarAtivasInFlight = false;
  }
}

function mkSyncBootFastPath_() {
  if (!window._mkSyncBootPending && Array.isArray(sessions) && sessions.length) return;
  mkSyncListarAtivasFallback_({ silent: true });
}
window.mkSyncListarAtivasFallback_ = mkSyncListarAtivasFallback_;
window.mkSyncBootFastPath_ = mkSyncBootFastPath_;

function mkInicioCacheFresh_(raw) {
  try {
    const o = JSON.parse(raw);
    if (!o || !o.data || !o.data.ok || o.ts == null) return null;
    if (Date.now() - Number(o.ts) > MK_INICIO_CACHE_MAX_AGE_MS) return null;
    return o.data;
  } catch (e) { return null; }
}

function mkSyncClearBootPending_(rerender) {
  if (!window._mkSyncBootPending) return;
  window._mkSyncBootPending = false;
  if (rerender !== false && typeof renderCards === 'function') renderCards();
}
window.mkSyncClearBootPending_ = mkSyncClearBootPending_;

async function sincronizarServidor(force = false) {
  if (_syncInFlight) {
    if (force) _syncPending = true;
    return;
  }
  _syncInFlight = true;
  clearTimeout(_syncSafetyTimer);
  // I122: safety > timeout API (não cortar sync legítimo em ~30s)
  _syncSafetyTimer = setTimeout(() => {
    if (_syncInFlight) {
      console.warn('[Sync] safety timeout — liberando lock travado');
      _syncInFlight = false;
      _syncFailCount++;
      _lastFailAt = Date.now();
      _syncBackoffMs = Math.min(_syncBackoffMs ? _syncBackoffMs * 2 : 5000, _BACKOFF_MAX);
    }
  }, MK_INICIO_API_TIMEOUT_MS + 10000);

  try {
    const CACHE_KEY = MK_INICIO_CACHE_KEY;
    // I122: com operação ativa NUNCA reaplicar cache local (fantasma pós-timeout)
    const skipCache = force || mkSyncOperacaoAtiva_();

    if (force) {
      try { localStorage.removeItem(CACHE_KEY); } catch (e) { /* ignore */ }
    }

    if (_syncBackoffMs > 0) {
      const sinceLastFail = Date.now() - (_lastFailAt || 0);
      if (sinceLastFail < _syncBackoffMs) {
        if (!skipCache) {
          const raw = localStorage.getItem(CACHE_KEY);
          const cached = raw ? mkInicioCacheFresh_(raw) : null;
          if (cached) aplicarDadosInicio(cached);
        }
        return;
      }
    }

    if (_syncFailCount > 0) setStatus(null);

    let d;
    try {
      const inicioParams = Object.assign({ action: 'carregarInicio' }, apiParamsComAuth_());
      if (force) inicioParams.force = '1';
      d = await api(inicioParams, MK_INICIO_API_TIMEOUT_MS);
    } catch (apiErr) {
      // I148: carregarInicio lento/timeout — listarAtivas traz sessões ativas mais rápido
      const fbOk = await mkSyncListarAtivasFallback_({ silent: true });
      if (fbOk) {
        setStatus(true);
        return;
      }
      // I122: timeout/erro com loc aberta → NÃO reaplicar mk_inicio_cache (fantasma)
      if (!skipCache) {
        const raw = localStorage.getItem(CACHE_KEY);
        const cached = raw ? mkInicioCacheFresh_(raw) : null;
        if (cached) {
          aplicarDadosInicio(cached);
          setStatus(true);
          return;
        }
        if (typeof mkSnapshotApplyFallback_ === 'function' && mkSnapshotApplyFallback_()) {
          setStatus(true);
          mkSyncClearBootPending_(true);
          return;
        }
      }
      throw apiErr;
    }

    if (!d.ok) {
      _syncFailCount++;
      _lastFailAt   = Date.now();
      _syncBackoffMs = Math.min(_syncBackoffMs ? _syncBackoffMs * 2 : 5000, _BACKOFF_MAX);
      if (_syncFailCount >= _FAIL_THRESH) setStatus(false);
      if (!skipCache) {
        const raw = localStorage.getItem(CACHE_KEY);
        const cached = raw ? mkInicioCacheFresh_(raw) : null;
        if (cached) aplicarDadosInicio(cached);
      }
      return;
    }

    _syncFailCount = 0;
    _syncBackoffMs = 0;
    _lastSyncAt    = Date.now();
    if (typeof agendarProximoPoll === 'function') agendarProximoPoll();
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data: d, ts: Date.now() })); } catch (e) { /* ignore */ }
    setStatus(true);
    aplicarDadosInicio(d);
    mkSyncClearBootPending_(false);
    if (typeof mkOfflineFlush_ === 'function') mkOfflineFlush_().catch(function () { /* ignore */ });

  } catch(e) {
    _syncFailCount++;
    _lastFailAt   = Date.now();
    _syncBackoffMs = Math.min(_syncBackoffMs ? _syncBackoffMs * 2 : 5000, _BACKOFF_MAX);
    console.error('[Sync]', e.message || e);
    if (_syncFailCount >= _FAIL_THRESH) setStatus(false);

  } finally {
    clearTimeout(_syncSafetyTimer);
    _syncInFlight = false;
    mkSyncClearBootPending_(true);
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

  // I89: cache stale pode trazer Pendente logo após ▶ confirmado localmente
  const localTsGuard = Number(localSession._localTimerStart || localSession.startTimestamp || 0);
  if (!isAtiva && status === 'Pendente' && localTsGuard >= 1e12
      && localSession.status === 'Ativa' && Date.now() - localTsGuard < 180000) {
    status = 'Ativa';
    isAtiva = true;
    startTimestamp = localTsGuard;
  }

  // I43: GAS carregarInicio (v1.5.131–135) podia devolver Ativa sem col Y → preservar ts local
  if (isAtiva && (!startTimestamp || startTimestamp < 1e12)) {
    const localTs = Number(localSession._localTimerStart || localSession.startTimestamp || 0);
    if (localTs >= 1e12) startTimestamp = localTs;
  }

  const localStart = Number(localSession._localTimerStart || 0);
  if (localStart >= 1e12 && isAtiva && startTimestamp >= 1e12) {
    if (startTimestamp > localStart && startTimestamp - localStart <= 120000) {
      startTimestamp = localStart;
    }
  }

  const mergedStarted = isAtiva && startTimestamp >= 1e12;

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
    started: mergedStarted,
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
  if (d.statsHoje) d.statsHoje = { n: d.statsHoje.n, nSessoes: d.statsHoje.nSessoes };
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

    if (d.statsHoje) {
      statsHoje.n = d.statsHoje.n;
      statsHoje.nSessoes = Number(d.statsHoje.nSessoes) || 0;
      if (mkExibirFinanceiro_()) statsHoje.fat = Number(d.statsHoje.fat) || 0;
      else statsHoje.fat = 0;
    }

    if (d.encHoje && d.fonte !== 'firebase') {
      if (!statsHoje.nSessoes && d.encHoje.length) statsHoje.nSessoes = d.encHoje.length;
      if (typeof mkUpdateEncHojeKpis_ === 'function') mkUpdateEncHojeKpis_(d.encHoje);
      else {
        encHojeData = d.encHoje;
        const nLoc = document.getElementById('stat-nloc');
        if (nLoc) {
          const nContas = typeof mkContasEncHoje_ === 'function'
            ? mkContasEncHoje_(encHojeData)
            : encHojeData.length;
          nLoc.textContent = String(nContas);
        }
      }
    }
    if (typeof showAdminHomeKpis === 'function' && mkExibirFinanceiro_()) {
      showAdminHomeKpis(typeof kpiHubStub_ === 'function' ? kpiHubStub_() : null);
    }
    if (typeof mkMetaApplyFromInicio_ === 'function') mkMetaApplyFromInicio_(d);

    const merged = d.ativos.map(s => mergeSessaoCanonica(s, storedMap[s.rowIndex] || {}));
    const mergedRows = new Set(merged.map(s => s.rowIndex));
    // I122/I143: não apagar Pendente/▶ local enquanto sync lento ainda não listou a linha
    const orphans = cleanedStored.filter(function (s) {
      if (!s || !s.rowIndex || mergedRows.has(s.rowIndex)) return false;
      if (s._optimistic || s._iniciandoTimer) return true;
      if (window._mkTimerInFlight && s.status === 'Ativa') return true;
      if (s.status === 'Pendente' || s.status === 'Ativa') {
        const age = Date.now() - Number(s._savedAt || s._criado || 0);
        if (s._savedAt || s._criado) return age < 120000;
      }
      return false;
    });
    sessions = merged.concat(orphans);
    saveSessions();

    if (typeof mkShouldRefreshHomeCards_ === 'function' && !mkShouldRefreshHomeCards_()) {
      updateStats();
    } else {
      renderCards();
      updateStats();
    }

    if (d.encHoje && d.fonte !== 'firebase') {
      if (typeof renderEncHojeList_ === 'function') renderEncHojeList_(d.encHoje);
      else if (typeof renderEncHoje === 'function') renderEncHoje(d.encHoje);
    }
    atualizarVeiculoGrid();

    if (d.custosHoje) { custosHoje = d.custosHoje; renderCustos(); }
    else loadCustosHoje();
    agendarProximoPoll();
  } catch(e) {
    console.error('aplicarDadosInicio:', e);
    setStatus(false);
  }
  // I151: snapshot também quando listarAtivas parcial vem vazio (limpa fantasma)
  if (d && Array.isArray(d.ativos) && d.fonte !== 'firebase' && d.fonte !== 'snapshot' && typeof mkSnapshotSave_ === 'function') {
    if (!d.parcial || d.ativos.length === 0) {
      mkSnapshotSave_(Object.assign({ ok: true }, d));
    }
  }
}
window.aplicarDadosInicio = aplicarDadosInicio;

function formatSyncAge_(diffMs) {
  if (diffMs == null || diffMs < 0) return '';
  const sec = Math.round(diffMs / 1000);
  if (sec < 5) return 'agora';
  if (sec < 60) return 'há ' + sec + 's';
  const min = Math.floor(sec / 60);
  if (min < 60) return 'há ' + min + 'min';
  return 'há ' + Math.floor(min / 60) + 'h';
}

function mkSyncAgeSuffix_() {
  const parts = [];
  if (window._mkSnapshotTs && typeof mkSnapshotAgeLabel_ === 'function') {
    parts.push('local ' + mkSnapshotAgeLabel_(window._mkSnapshotTs));
  }
  if (_lastSyncAt) {
    parts.push('nuvem ' + formatSyncAge_(Date.now() - _lastSyncAt));
  }
  if (!parts.length && window._mkSnapshotTs && typeof mkSnapshotAgeLabel_ === 'function') {
    return ' · local ' + mkSnapshotAgeLabel_(window._mkSnapshotTs);
  }
  return parts.length ? ' · ' + parts.join(' · ') : '';
}

function mkSyncRefreshAgeLabels_() {
  const dot = document.getElementById('status-dot');
  const txt = document.getElementById('status-txt');
  if (dot && txt) {
    const suffix = mkSyncAgeSuffix_();
    if (dot.classList.contains('dot-offline')) {
      txt.textContent = 'Offline' + (suffix || ' · sem sync');
    } else if (dot.style.background === 'rgb(255, 183, 77)' || dot.style.background === '#FFB74D') {
      txt.textContent = 'Verificando...';
    } else {
      txt.textContent = 'Online' + suffix;
    }
  }
  if (typeof syncSidebarStatus === 'function') {
    const efectivo = document.getElementById('status-dot')?.classList.contains('dot-offline') ? false
      : (document.getElementById('status-dot')?.style.background === 'rgb(255, 183, 77)' || document.getElementById('status-dot')?.style.background === '#FFB74D') ? null
      : true;
    syncSidebarStatus(efectivo);
  }
}

function setStatus(online) {
  const dot = document.getElementById('status-dot');
  const txt = document.getElementById('status-txt');
  const efectivo = (online === false && _syncFailCount < _FAIL_THRESH) ? null : online;
  if (dot && txt) {
    if (efectivo===null) { dot.className='dot-online';dot.style.background='#FFB74D';txt.textContent='Verificando...'; }
    else if (efectivo)   { dot.className='dot-online';dot.style.background='';txt.textContent='Online' + mkSyncAgeSuffix_(); }
    else                 { dot.className='dot-offline';dot.style.background='';txt.textContent='Offline' + (_lastSyncAt ? mkSyncAgeSuffix_() : ' · sem sync'); }
  }
  if (typeof syncSidebarStatus === 'function') syncSidebarStatus(efectivo);
}

function mkSyncDeferHeavy_() {
  if (window._novaSavingInFlight) return true;
  if (window._kpiDashInFlight || window._kpiHubInFlight) return true;
  if (window._resumoDiaBgRefresh) return true;
  const heavy = ['page-dashboard', 'page-caixa', 'page-operadores', 'page-historico', 'page-custos-historico'];
  return heavy.some(function (id) {
    const el = document.getElementById(id);
    return el && el.classList.contains('active');
  });
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
      // I145: tela desligada NÃO dispara force=1 — sync frio (7–80s) compete com
      // salvar/▶ e, se estourar timeout, reabre fantasma I122. Warm usa cache inicio_v4_.
      if (hiddenMs > 30000) syncController(false, 0);
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
        document.visibilityState === 'visible' && !window._kpiDashInFlight &&
        !mkSyncDeferHeavy_()) {
      syncController(false, 0);
    }
  }, 120000);

  setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    if (mkSyncDeferHeavy_()) return;
    if (typeof mkSyncOperacaoAtiva_ === 'function' && mkSyncOperacaoAtiva_()) return;
    syncController(false, 0);
  }, 3600000);

  setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    const idleMs = Date.now() - _lastActivity;
    if (idleMs > _IDLE_MS) {
      _lastActivity = Date.now();
      // I145: idle 5 min = sync WARM. force=1 só após escrita (BroadcastChannel invalidate).
      syncController(false, 0);
    }
  }, 60000);

  setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    if (typeof mkSyncRefreshAgeLabels_ === 'function') mkSyncRefreshAgeLabels_();
  }, 5000);
}

window.syncController = syncController;
window.agendarProximoPoll = agendarProximoPoll;
window.sincronizarServidor = sincronizarServidor;
window.setStatus = setStatus;
window.mkSyncAgeSuffix_ = mkSyncAgeSuffix_;
window.mkSyncRefreshAgeLabels_ = mkSyncRefreshAgeLabels_;
window.mkInvalidateInicioCache_ = mkInvalidateInicioCache_;

function mkSyncRefreshInicioBg_() {
  if (window._mkInicioBgRefresh) return;
  window._mkInicioBgRefresh = true;
  api(Object.assign({ action: 'carregarInicio' }, apiParamsComAuth_()), MK_INICIO_API_TIMEOUT_MS)
    .then(function (d) {
      if (!d || !d.ok) return;
      _syncFailCount = 0;
      _syncBackoffMs = 0;
      _lastSyncAt = Date.now();
      try {
        localStorage.setItem(MK_INICIO_CACHE_KEY, JSON.stringify({ data: d, ts: Date.now() }));
      } catch (e) { /* ignore */ }
      aplicarDadosInicio(d);
      setStatus(true);
    })
    .catch(function (e) {
      console.warn('[Sync] bg refresh', e.message || e);
    })
    .finally(function () {
      window._mkInicioBgRefresh = false;
    });
}
