/* MOVI KIDS — P0/P1 local-first: snapshot confiável (LS + IndexedDB) v1.9.102 */

const MK_SNAPSHOT_KEY_LEGACY = 'mk_snapshot_v1';
const MK_SNAPSHOT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/** I170: snapshot por unidade — La Ville não reaproveita Golden. */
function mkSnapshotKey_() {
  const uid = (typeof mkUnidadeId_ === 'function') ? mkUnidadeId_() : 'golden';
  return 'mk_snapshot_v2_' + (uid || 'golden');
}

function mkSnapshotNormalize_(o) {
  if (!o || !o.data || o.ts == null) return null;
  if (Date.now() - Number(o.ts) > MK_SNAPSHOT_MAX_AGE_MS) return null;
  return o;
}

function mkSnapshotLoad_() {
  try {
    const raw = localStorage.getItem(mkSnapshotKey_());
    if (!raw) return null;
    const o = mkSnapshotNormalize_(JSON.parse(raw));
    if (!o || !o.data) return null;
    const uidNow = (typeof mkUnidadeId_ === 'function') ? mkUnidadeId_() : 'golden';
    const uidSnap = o.data.unidadeId != null ? String(o.data.unidadeId) : '';
    /* I170 fail-closed: snapshot sem tag ou de outra loja não aplica no balcão. */
    if (typeof mkIsBalcaoEstrito_ === 'function' && mkIsBalcaoEstrito_()) {
      if (!uidSnap || uidSnap === 'all' || uidSnap !== String(uidNow)) return null;
    }
    return o;
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
    localStorage.setItem(mkSnapshotKey_(), JSON.stringify(payload));
    try { localStorage.removeItem(MK_SNAPSHOT_KEY_LEGACY); } catch (eL) { /* ok */ }
  } catch (e) { /* ignore */ }
  if (typeof mkIdbPutSnapshot_ === 'function') {
    mkIdbPutSnapshot_(payload).catch(function () { /* ignore */ });
  }
}

function mkSnapshotDropAtivo_(rowIndex) {
  const ri = Number(rowIndex);
  if (!ri) return;
  const snap = mkSnapshotLoad_();
  if (!snap || !snap.data || !Array.isArray(snap.data.ativos)) return;
  const nextAtivos = snap.data.ativos.filter(function (s) {
    return Number(s && s.rowIndex) !== ri;
  });
  if (nextAtivos.length === snap.data.ativos.length) return;
  mkSnapshotPersist_({
    ts: Date.now(),
    data: Object.assign({}, snap.data, { ativos: nextAtivos })
  });
}

function mkSnapshotSave_(d) {
  if (!d || !d.ok) return;
  if (d.fonte === 'firebase') return;
  const ativos = Array.isArray(d.ativos) ? d.ativos : [];
  // I151: parcial COM itens não sobrescreve snapshot completo;
  // parcial VAZIO (listarAtivas total=0) limpa fantasmas no boot
  if (d.parcial && ativos.length > 0) return;
  const uidSnap = (d.unidadeId != null && d.unidadeId !== '')
    ? String(d.unidadeId)
    : ((typeof mkUnidadeId_ === 'function') ? mkUnidadeId_() : 'golden');
  const payload = {
    ts: Date.now(),
    data: {
      unidadeId: uidSnap,
      ativos: ativos,
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
  /* I187b: temp row (ri<0) + otimista curto.
   * I191: flags _offline*/_clientRequestId em ri>0 NÃO sobrevivem ao boot — fantasma. */
  const inflight = stored.filter(function (s) {
    if (!s) return false;
    if (Number(s.rowIndex) < 0) return true;
    if (s._iniciandoTimer || s._optimistic) {
      const age = Date.now() - Number(s._savedAt || s._criado || s._optimisticAt || 0);
      return age < 90000;
    }
    return false;
  });

  try { localStorage.removeItem('mk_sessions'); } catch (e) { /* ignore */ }
  if (typeof mkInvalidateInicioCache_ === 'function') mkInvalidateInicioCache_();

  return { inflight: inflight };
}

/** I187b: cards sintéticos a partir da fila IDB se o boot limpou mk_sessions. */
async function mkBootRehydrateFromQueue_() {
  if (typeof mkIdbQueueList_ !== 'function') return 0;
  let n = 0;
  try {
    const queue = await mkIdbQueueList_();
    if (!Array.isArray(queue) || !queue.length) return 0;
    if (!Array.isArray(sessions)) sessions = [];
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (!item || !item.params) continue;
      const reqId = item.id || item.params.clientRequestId;
      const exists = sessions.some(function (s) {
        return (s && s._clientRequestId && s._clientRequestId === reqId)
          || (item.params.rowIndex && Number(s.rowIndex) === Number(item.params.rowIndex));
      });
      if (exists) continue;
      if (item.action === 'salvarLocacao' && typeof mkOfflineSyntheticSalvar_ === 'function') {
        const syn = mkOfflineSyntheticSalvar_(item.params, reqId);
        sessions.push(Object.assign({}, syn, {
          started: false,
          alertFired5: false,
          alertFiredExp: false,
          _offlinePending: true,
          _clientRequestId: reqId,
          _savedAt: item.createdAt || Date.now(),
          unidadeId: item.params.unidadeId
            || ((typeof mkUnidadeId_ === 'function') ? mkUnidadeId_() : 'golden')
        }));
        n++;
      } else if (item.action === 'iniciarTimer') {
        const ri = Number(item.params.rowIndex);
        const s = sessions.find(function (x) { return Number(x.rowIndex) === ri; });
        if (s) {
          s._offlineTimerPending = true;
          s.status = 'Ativa';
          s.started = true;
          if (!s.startTimestamp && item.params.timestamp) {
            s.startTimestamp = Number(item.params.timestamp);
            s._localTimerStart = s.startTimestamp;
          }
          n++;
        }
      }
    }
    if (n > 0) {
      if (typeof saveSessions === 'function') saveSessions();
      if (typeof renderCards === 'function') renderCards();
      if (typeof updateStats === 'function') updateStats();
      if (typeof mkOfflineRefreshUi_ === 'function') mkOfflineRefreshUi_();
    }
  } catch (e) { /* ignore */ }
  return n;
}

function mkBootLocalFirstFinish_(snap, inflight) {
  let applied = false;

  if (snap) {
    mkSnapshotApply_(snap);
    window._mkSyncBootPending = false;
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
  const applied = mkBootLocalFirstFinish_(mkSnapshotLoad_(), core.inflight);
  mkBootRehydrateFromQueue_().catch(function () { /* ignore */ });
  return applied;
}

/** Boot Fase 1 — IndexedDB primeiro, depois LS. */
async function mkBootLocalFirstAsync_() {
  const core = mkBootLocalFirstCore_();
  const snap = await mkSnapshotLoadAsync_(800);
  const applied = mkBootLocalFirstFinish_(snap, core.inflight);
  await mkBootRehydrateFromQueue_();
  return applied;
}

function mkSnapshotApplyFallback_() {
  const snap = mkSnapshotLoad_();
  if (!snap) return false;
  mkSnapshotApply_(snap);
  if (typeof mkSyncRefreshAgeLabels_ === 'function') mkSyncRefreshAgeLabels_();
  return true;
}

async function mkSnapshotClearLocal_(reload) {
  try { localStorage.removeItem(mkSnapshotKey_()); } catch (e) { /* ignore */ }
  try { localStorage.removeItem(MK_SNAPSHOT_KEY_LEGACY); } catch (e2) { /* ignore */ }
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

/**
 * I191 — limpeza dura de fantasma em UM aparelho (LS + snapshot + fila stale).
 * Preserva só salvarLocacao temp (ri<0) na fila IDB.
 * listarAtivas em seguida restaura Aurora / ativas reais.
 */
async function mkPurgeLocacoesFantasmaHard_(opts) {
  opts = opts || {};
  try { localStorage.removeItem(mkSnapshotKey_()); } catch (e) { /* ignore */ }
  try { localStorage.removeItem(MK_SNAPSHOT_KEY_LEGACY); } catch (e2) { /* ignore */ }
  if (typeof mkIdbClearSnapshot_ === 'function') {
    try { await mkIdbClearSnapshot_(); } catch (e3) { /* ignore */ }
  }
  try { localStorage.removeItem('mk_sessions'); } catch (e4) { /* ignore */ }
  if (typeof mkInvalidateInicioCache_ === 'function') mkInvalidateInicioCache_();
  try { localStorage.removeItem('mk_inicio_cache'); } catch (e5) { /* ignore */ }
  window._mkSnapshotTs = 0;

  if (typeof mkIdbQueueList_ === 'function' && typeof mkIdbQueueRemove_ === 'function') {
    try {
      const queue = await mkIdbQueueList_();
      for (let i = 0; i < (queue || []).length; i++) {
        const item = queue[i];
        if (!item) continue;
        const ri = Number(item.params && item.params.rowIndex);
        const keepSalvarTemp = item.action === 'salvarLocacao' && (!ri || ri < 0);
        if (keepSalvarTemp) continue;
        await mkIdbQueueRemove_(item.id);
      }
      if (typeof mkOfflineRefreshUi_ === 'function') mkOfflineRefreshUi_();
    } catch (eQ) { /* ignore */ }
  }

  sessions = [];
  if (typeof renderCards === 'function') renderCards();
  if (typeof updateStats === 'function') updateStats();

  const ver = (typeof APP_VERSION !== 'undefined' && APP_VERSION)
    || (typeof MK_VERSION !== 'undefined' && MK_VERSION)
    || '';
  if (ver) {
    try { localStorage.setItem('mk_i191_fantasma_purge_ver', String(ver)); } catch (eV) { /* ignore */ }
  }

  let ok = false;
  if (typeof mkSyncListarAtivasFallback_ === 'function') {
    try { ok = !!(await mkSyncListarAtivasFallback_({ silent: !!opts.silent })); } catch (eS) { ok = false; }
  }
  if (!ok && typeof syncController === 'function') {
    try { syncController(true, 300); } catch (eC) { /* ignore */ }
  }
  if (opts.reload) {
    try { location.reload(); } catch (eR) { /* ignore */ }
  }
  return ok;
}

/** I191: wipe local rápido 1× por versão (não bloqueia login com listarAtivas). */
async function mkAutoPurgeFantasmaOnVersionBump_() {
  try {
    const ver = (typeof APP_VERSION !== 'undefined' && APP_VERSION)
      || (typeof MK_VERSION !== 'undefined' && MK_VERSION)
      || '';
    if (!ver) return false;
    const key = 'mk_i191_fantasma_purge_ver';
    const params = new URLSearchParams((location && location.search) || '');
    const forceUrl = params.get('purgeGhosts') === '1' || params.get('purgeGhosts') === 'true';
    if (!forceUrl && localStorage.getItem(key) === String(ver)) return false;

    if (forceUrl) {
      await mkPurgeLocacoesFantasmaHard_({ silent: false });
      try {
        params.delete('purgeGhosts');
        const q = params.toString();
        const url = location.pathname + (q ? '?' + q : '') + (location.hash || '');
        history.replaceState(null, '', url);
      } catch (eU) { /* ignore */ }
      return true;
    }

    /* Bump FE: só limpa storage/fila stale — sync pós-login reidrata Aurora. */
    try { localStorage.removeItem(mkSnapshotKey_()); } catch (e1) { /* ignore */ }
    try { localStorage.removeItem(MK_SNAPSHOT_KEY_LEGACY); } catch (e2) { /* ignore */ }
    if (typeof mkIdbClearSnapshot_ === 'function') {
      try { await mkIdbClearSnapshot_(); } catch (e3) { /* ignore */ }
    }
    try { localStorage.removeItem('mk_sessions'); } catch (e4) { /* ignore */ }
    if (typeof mkInvalidateInicioCache_ === 'function') mkInvalidateInicioCache_();
    try { localStorage.removeItem('mk_inicio_cache'); } catch (e5) { /* ignore */ }
    window._mkSnapshotTs = 0;
    if (typeof mkIdbQueueList_ === 'function' && typeof mkIdbQueueRemove_ === 'function') {
      try {
        const queue = await mkIdbQueueList_();
        for (let i = 0; i < (queue || []).length; i++) {
          const item = queue[i];
          if (!item) continue;
          const ri = Number(item.params && item.params.rowIndex);
          if (item.action === 'salvarLocacao' && (!ri || ri < 0)) continue;
          if (item.action === 'encerrarLocacao' || item.action === 'cancelarLocacao' || item.action === 'iniciarTimer') {
            await mkIdbQueueRemove_(item.id);
          }
        }
      } catch (eQ) { /* ignore */ }
    }
    try { localStorage.setItem(key, String(ver)); } catch (eV) { /* ignore */ }
    return true;
  } catch (e) {
    return false;
  }
}

window.mkSnapshotLoad_ = mkSnapshotLoad_;
window.mkSnapshotLoadAsync_ = mkSnapshotLoadAsync_;
window.mkSnapshotSave_ = mkSnapshotSave_;
window.mkSnapshotDropAtivo_ = mkSnapshotDropAtivo_;
window.mkBootLocalFirst_ = mkBootLocalFirst_;
window.mkBootLocalFirstAsync_ = mkBootLocalFirstAsync_;
window.mkSnapshotApplyFallback_ = mkSnapshotApplyFallback_;
window.mkSnapshotClearLocal_ = mkSnapshotClearLocal_;
window.mkPurgeLocacoesFantasmaHard_ = mkPurgeLocacoesFantasmaHard_;
window.mkAutoPurgeFantasmaOnVersionBump_ = mkAutoPurgeFantasmaOnVersionBump_;
window.mkSnapshotAgeLabel_ = mkSnapshotAgeLabel_;
