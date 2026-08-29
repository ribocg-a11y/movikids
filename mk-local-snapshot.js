/* MOVI KIDS — P0/P1 local-first: snapshot confiável (LS + IndexedDB) v1.9.102 */

const MK_SNAPSHOT_KEY = 'mk_snapshot_v1';
const MK_SNAPSHOT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function mkSnapshotNormalize_(o) {
  if (!o || !o.data || o.ts == null) return null;
  if (Date.now() - Number(o.ts) > MK_SNAPSHOT_MAX_AGE_MS) return null;
  return o;
}

function mkSnapshotLoad_() {
  try {
    const raw = localStorage.getItem(MK_SNAPSHOT_KEY);
    if (!raw) return null;
    return mkSnapshotNormalize_(JSON.parse(raw));
  } catch (e) {
    return null;
  }
}

async function mkSnapshotLoadAsync_(timeoutMs) {
  const ls = mkSnapshotLoad_();
  const budget = timeoutMs || 800;
  if (typeof mkIdbGetSnapshot_ !== 'function') return ls;

  try {
    const idb = await Promise.race([
      mkIdbGetSnapshot_(),
      new Promise(function (_, rej) {
        setTimeout(function () { rej(new Error('idb timeout')); }, budget);
      })
    ]);
    const norm = mkSnapshotNormalize_(idb);
    if (norm && (!ls || Number(norm.ts) >= Number(ls.ts))) return norm;
  } catch (e) { /* fallback LS */ }
  return ls;
}

function mkSnapshotPersist_(payload) {
  try {
    localStorage.setItem(MK_SNAPSHOT_KEY, JSON.stringify(payload));
  } catch (e) { /* ignore */ }
  if (typeof mkIdbPutSnapshot_ === 'function') {
    mkIdbPutSnapshot_(payload).catch(function () { /* ignore */ });
  }
}

function mkSnapshotSave_(d) {
  if (!d || !d.ok) return;
  if (d.fonte === 'firebase' || d.parcial) return;
  const payload = {
    ts: Date.now(),
    data: {
      ativos: d.ativos || [],
      statsHoje: d.statsHoje || null,
      encHoje: d.encHoje || [],
      operacaoConfig: d.operacaoConfig || null,
      custosHoje: d.custosHoje || null
    }
  };
  window._mkSnapshotTs = payload.ts;
  mkSnapshotPersist_(payload);
}

function mkSnapshotAgeLabel_(ts) {
  if (!ts) return '';
  const sec = Math.round((Date.now() - ts) / 1000);
  if (sec < 60) return 'agora';
  if (sec < 3600) return 'há ' + Math.floor(sec / 60) + ' min';
  return 'há ' + Math.floor(sec / 3600) + ' h';
}

function mkSnapshotApply_(snap) {
  if (!snap || typeof aplicarDadosInicio !== 'function') return false;
  window._mkBootFromSnapshot = true;
  window._mkSnapshotTs = snap.ts;
  aplicarDadosInicio(Object.assign({ ok: true }, snap.data, { fonte: 'snapshot' }));
  return true;
}

function mkBootLocalFirstCore_() {
  window._mkSyncBootPending = true;
  let stored = [];
  try {
    stored = JSON.parse(localStorage.getItem('mk_sessions') || '[]');
  } catch (e) {
    stored = [];
  }
  const inflight = stored.filter(function (s) {
    return s._iniciandoTimer || s._optimistic;
  });

  try { localStorage.removeItem('mk_sessions'); } catch (e) { /* ignore */ }
  if (typeof mkInvalidateInicioCache_ === 'function') mkInvalidateInicioCache_();

  return { inflight: inflight };
}

function mkBootLocalFirstFinish_(snap, inflight) {
  let applied = false;

  if (snap) {
    mkSnapshotApply_(snap);
    applied = true;
  } else {
    sessions = [];
    if (typeof renderCards === 'function') renderCards();
    if (typeof updateStats === 'function') updateStats();
  }

  if (inflight && inflight.length) {
    inflight.forEach(function (s) {
      const idx = sessions.findIndex(function (x) { return x.rowIndex === s.rowIndex; });
      if (idx >= 0) sessions[idx] = Object.assign({}, sessions[idx], s);
      else sessions.push(s);
    });
    if (typeof saveSessions === 'function') saveSessions();
    if (typeof renderCards === 'function') renderCards();
    applied = true;
  }

  if (applied && typeof setStatus === 'function') setStatus(true);
  if (typeof mkSyncRefreshAgeLabels_ === 'function') mkSyncRefreshAgeLabels_();
  return applied;
}

/** Boot sync (fallback). */
function mkBootLocalFirst_() {
  const core = mkBootLocalFirstCore_();
  return mkBootLocalFirstFinish_(mkSnapshotLoad_(), core.inflight);
}

/** Boot Fase 1 — IndexedDB primeiro, depois LS. */
async function mkBootLocalFirstAsync_() {
  const core = mkBootLocalFirstCore_();
  const snap = await mkSnapshotLoadAsync_(800);
  return mkBootLocalFirstFinish_(snap, core.inflight);
}

function mkSnapshotApplyFallback_() {
  const snap = mkSnapshotLoad_();
  if (!snap) return false;
  mkSnapshotApply_(snap);
  if (typeof mkSyncRefreshAgeLabels_ === 'function') mkSyncRefreshAgeLabels_();
  return true;
}

async function mkSnapshotClearLocal_(reload) {
  try { localStorage.removeItem(MK_SNAPSHOT_KEY); } catch (e) { /* ignore */ }
  if (typeof mkIdbClearSnapshot_ === 'function') {
    try { await mkIdbClearSnapshot_(); } catch (e) { /* ignore */ }
  }
  try { localStorage.removeItem('mk_sessions'); } catch (e) { /* ignore */ }
  if (typeof mkInvalidateInicioCache_ === 'function') mkInvalidateInicioCache_();
  try { localStorage.removeItem('mk_inicio_cache'); } catch (e) { /* ignore */ }
  window._mkSnapshotTs = 0;
  sessions = [];
  if (typeof renderCards === 'function') renderCards();
  if (typeof updateStats === 'function') updateStats();
  if (reload !== false) {
    if (typeof syncController === 'function') syncController(true, 500);
    else location.reload();
  }
}

window.mkSnapshotLoad_ = mkSnapshotLoad_;
window.mkSnapshotLoadAsync_ = mkSnapshotLoadAsync_;
window.mkSnapshotSave_ = mkSnapshotSave_;
window.mkBootLocalFirst_ = mkBootLocalFirst_;
window.mkBootLocalFirstAsync_ = mkBootLocalFirstAsync_;
window.mkSnapshotApplyFallback_ = mkSnapshotApplyFallback_;
window.mkSnapshotClearLocal_ = mkSnapshotClearLocal_;
window.mkSnapshotAgeLabel_ = mkSnapshotAgeLabel_;
