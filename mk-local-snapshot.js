/* MOVI KIDS — P0 local-first: snapshot confiável (anti-fantasma boot) v1.9.101 */

const MK_SNAPSHOT_KEY = 'mk_snapshot_v1';
const MK_SNAPSHOT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function mkSnapshotLoad_() {
  try {
    const raw = localStorage.getItem(MK_SNAPSHOT_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (!o || !o.data || o.ts == null) return null;
    if (Date.now() - Number(o.ts) > MK_SNAPSHOT_MAX_AGE_MS) return null;
    return o;
  } catch (e) {
    return null;
  }
}

function mkSnapshotSave_(d) {
  if (!d || !d.ok) return;
  if (d.fonte === 'firebase' || d.parcial) return;
  try {
    localStorage.setItem(MK_SNAPSHOT_KEY, JSON.stringify({
      ts: Date.now(),
      data: {
        ativos: d.ativos || [],
        statsHoje: d.statsHoje || null,
        encHoje: d.encHoje || [],
        operacaoConfig: d.operacaoConfig || null,
        custosHoje: d.custosHoje || null
      }
    }));
  } catch (e) { /* ignore */ }
}

function mkSnapshotAgeLabel_(ts) {
  if (!ts) return '';
  const sec = Math.round((Date.now() - ts) / 1000);
  if (sec < 60) return 'agora';
  if (sec < 3600) return 'há ' + Math.floor(sec / 60) + ' min';
  return 'há ' + Math.floor(sec / 3600) + ' h';
}

/** Boot: nunca pintar mk_sessions cru (I122 fantasma). Snapshot + in-flight apenas. */
function mkBootLocalFirst_() {
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

  const snap = mkSnapshotLoad_();
  let applied = false;

  if (snap && typeof aplicarDadosInicio === 'function') {
    window._mkBootFromSnapshot = true;
    window._mkSnapshotTs = snap.ts;
    aplicarDadosInicio(Object.assign({ ok: true }, snap.data, { fonte: 'snapshot' }));
    applied = true;
  } else {
    sessions = [];
    if (typeof renderCards === 'function') renderCards();
    if (typeof updateStats === 'function') updateStats();
  }

  if (inflight.length) {
    inflight.forEach(function (s) {
      const idx = sessions.findIndex(function (x) { return x.rowIndex === s.rowIndex; });
      if (idx >= 0) sessions[idx] = Object.assign({}, sessions[idx], s);
      else sessions.push(s);
    });
    if (typeof saveSessions === 'function') saveSessions();
    if (typeof renderCards === 'function') renderCards();
    applied = true;
  }

  if (applied && typeof setStatus === 'function') {
    setStatus(true);
  }
  return applied;
}

/** Fallback read-only quando rede falha e cache curto expirou. */
function mkSnapshotApplyFallback_() {
  const snap = mkSnapshotLoad_();
  if (!snap || typeof aplicarDadosInicio !== 'function') return false;
  window._mkSnapshotTs = snap.ts;
  aplicarDadosInicio(Object.assign({ ok: true }, snap.data, { fonte: 'snapshot' }));
  return true;
}

function mkSnapshotClearLocal_(reload) {
  try { localStorage.removeItem(MK_SNAPSHOT_KEY); } catch (e) { /* ignore */ }
  try { localStorage.removeItem('mk_sessions'); } catch (e) { /* ignore */ }
  if (typeof mkInvalidateInicioCache_ === 'function') mkInvalidateInicioCache_();
  try { localStorage.removeItem('mk_inicio_cache'); } catch (e) { /* ignore */ }
  sessions = [];
  if (typeof renderCards === 'function') renderCards();
  if (typeof updateStats === 'function') updateStats();
  if (reload !== false) {
    if (typeof syncController === 'function') syncController(true, 500);
    else location.reload();
  }
}

window.mkSnapshotLoad_ = mkSnapshotLoad_;
window.mkSnapshotSave_ = mkSnapshotSave_;
window.mkBootLocalFirst_ = mkBootLocalFirst_;
window.mkSnapshotApplyFallback_ = mkSnapshotApplyFallback_;
window.mkSnapshotClearLocal_ = mkSnapshotClearLocal_;
window.mkSnapshotAgeLabel_ = mkSnapshotAgeLabel_;
