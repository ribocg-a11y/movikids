/* MOVI KIDS — Fase 2+ offline: fila salvar/▶/encerrar/cancelar (I147 · I187)
 * I187 (03/11/2026): short-circuit sem rede + encerrar/cancelar na fila.
 * Estender/editar ainda exigem rede (sem idempotência GAS).
 */

const MK_OFFLINE_QUEUE_ACTIONS = new Set([
  'salvarLocacao',
  'iniciarTimer',
  'encerrarLocacao',
  'cancelarLocacao'
]);
const MK_OFFLINE_MAX_ATTEMPTS = 8;

function mkOfflineIsOffline_() {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

function mkOfflineIsNetworkError_(err) {
  if (mkOfflineIsOffline_()) return true;
  const msg = String((err && err.message) || err || '').toLowerCase();
  return msg.indexOf('offline-navigator') >= 0
    || msg.indexOf('failed to fetch') >= 0
    || msg.indexOf('network') >= 0
    || msg.indexOf('load failed') >= 0
    || msg.indexOf('networkerror') >= 0
    || msg.indexOf('gas-unstable') >= 0
    || msg.indexOf('http 404') >= 0
    || msg.indexOf('http 5') >= 0;
}

function mkOfflineCanQueue_(action) {
  return MK_OFFLINE_QUEUE_ACTIONS.has(String(action || '').trim());
}

function mkOfflineGenRequestId_() {
  return 'mkq_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
}

function mkOfflineTempRowIndex_(reqId) {
  let h = 0;
  const s = String(reqId);
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return -Math.abs(h || Date.now());
}

async function mkOfflineEnqueue_(action, params) {
  const reqId = params.clientRequestId || mkOfflineGenRequestId_();
  const item = {
    id: reqId,
    action: action,
    params: Object.assign({}, params, { clientRequestId: reqId }),
    createdAt: Date.now(),
    attempts: 0
  };
  if (typeof mkIdbQueuePush_ === 'function') await mkIdbQueuePush_(item);
  window._mkOfflineQueueCount = (window._mkOfflineQueueCount || 0) + 1;
  if (typeof mkOfflineRefreshUi_ === 'function') mkOfflineRefreshUi_();
  return item;
}

function mkOfflineSyntheticSalvar_(params, reqId) {
  const cfgMins = Number(params.mins || 0);
  const cfgVal = Number(params.valorPlano || 0);
  return {
    ok: true,
    _offlineQueued: true,
    clientRequestId: reqId,
    id: 'off-' + String(reqId).slice(-8),
    rowIndex: mkOfflineTempRowIndex_(reqId),
    tipo: params.tipo,
    plano: params.plano,
    veiculo: params.veiculo,
    pagamento: params.pagamento,
    observacao: params.observacao || '',
    mins: cfgMins,
    valorPlano: cfgVal,
    adicionalPorMin: params.adicionalPorMin || 1,
    responsavel: params.responsavel,
    crianca: params.crianca,
    telefone: params.telefone,
    horaInicio: '',
    data: '',
    startTimestamp: 0,
    status: 'Pendente'
  };
}

function mkOfflineSyntheticEncerrar_(params, reqId) {
  const mins = Number(params.minUsados || params.mins || 0);
  const val = Number(params.valorPlano || 0);
  return {
    ok: true,
    _offlineQueued: true,
    clientRequestId: reqId,
    queued: true,
    valorTotal: val,
    minUsados: mins,
    status: 'Encerrada'
  };
}

function mkOfflineSyntheticCancelar_(params, reqId) {
  return {
    ok: true,
    _offlineQueued: true,
    clientRequestId: reqId,
    queued: true,
    status: 'Cancelada'
  };
}

function mkOfflineFlushOk_(action, d) {
  if (d && d.ok) return true;
  const err = String((d && d.erro) || '').toLowerCase();
  const code = Number(d && d.code) || 0;
  /* Replay encerrar/cancelar: já feito no servidor = sucesso (anti-duplicata). */
  if (action === 'encerrarLocacao') {
    if (code === 409) return true;
    if (/j[aá]\s+foi\s+encerrada|j[aá]\s+finalizada|n[aã]o est[aá] ativa|locacao\s+ja\s+finalizada/.test(err)) return true;
  }
  if (action === 'cancelarLocacao') {
    if (code === 409) return true;
    if (/j[aá]\s+cancelada|n[aã]o est[aá] ativa/.test(err)) return true;
  }
  return false;
}

async function mkOfflineHandleWriteFail_(params, err) {
  const action = String((params && params.action) || '');
  /* Durante flush: não reenfileirar (senão remove o item original achando sucesso). */
  if (window._mkOfflineFlushing) throw err;
  if (!mkOfflineCanQueue_(action) || !mkOfflineIsNetworkError_(err)) throw err;

  const item = await mkOfflineEnqueue_(action, params);
  const offlineNow = mkOfflineIsOffline_();
  const prefix = offlineNow ? 'Sem internet' : 'Servidor instável';

  if (action === 'salvarLocacao') {
    if (typeof toast === 'function') {
      toast(prefix + ' — locação na fila. Sobe sozinha quando voltar a rede.', 'warning');
    }
    return mkOfflineSyntheticSalvar_(params, item.id);
  }
  if (action === 'iniciarTimer') {
    if (typeof toast === 'function') {
      toast(prefix + ' — início na fila. Cronômetro segue no tablet.', 'warning');
    }
    return { ok: true, _offlineQueued: true, clientRequestId: item.id, queued: true };
  }
  if (action === 'encerrarLocacao') {
    if (typeof toast === 'function') {
      toast(prefix + ' — encerramento na fila. Card some; sobe quando voltar a rede.', 'warning');
    }
    return mkOfflineSyntheticEncerrar_(params, item.id);
  }
  if (action === 'cancelarLocacao') {
    if (typeof toast === 'function') {
      toast(prefix + ' — cancelamento na fila. Sobe quando voltar a rede.', 'warning');
    }
    return mkOfflineSyntheticCancelar_(params, item.id);
  }
  throw err;
}

async function mkOfflineRemapRowInQueue_(tempRow, realRow) {
  if (!tempRow || !realRow || tempRow === realRow) return;
  if (typeof mkIdbQueueList_ !== 'function' || typeof mkIdbQueuePush_ !== 'function') return;
  const queue = await mkIdbQueueList_();
  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    if (!item || !item.params) continue;
    if (Number(item.params.rowIndex) === Number(tempRow)) {
      item.params.rowIndex = realRow;
      await mkIdbQueuePush_(item);
    }
  }
}

async function mkOfflineReplaceTempSession_(tempRow, real) {
  if (!Array.isArray(sessions) || !tempRow || !real) return;
  const idx = sessions.findIndex(function (s) {
    return s.rowIndex === tempRow || s._clientRequestId === real.clientRequestId;
  });
  if (idx < 0) return;
  const prev = sessions[idx];
  sessions[idx] = Object.assign({}, prev, real, {
    rowIndex: real.rowIndex,
    id: real.id,
    _offlineQueued: false,
    _clientRequestId: real.clientRequestId || prev._clientRequestId
  });
  delete sessions[idx]._offlinePending;
  if (typeof saveSessions === 'function') saveSessions();
  if (typeof mkRefreshHomeUI_ === 'function') mkRefreshHomeUI_();
  else if (typeof renderCards === 'function') renderCards();
}

async function mkOfflineFlush_() {
  if (window._mkOfflineFlushing || mkOfflineIsOffline_()) return { ok: true, flushed: 0 };
  if (typeof mkIdbQueueList_ !== 'function') return { ok: true, flushed: 0 };

  window._mkOfflineFlushing = true;
  let flushed = 0;
  try {
    const queue = await mkIdbQueueList_();
    /* FIFO: salvar → ▶ → encerrar/cancelar (remap de rowIndex temp). */
    queue.sort(function (a, b) { return (a.createdAt || 0) - (b.createdAt || 0); });
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (!item || !item.params) continue;
      item.attempts = (item.attempts || 0) + 1;
      if (item.attempts > MK_OFFLINE_MAX_ATTEMPTS) {
        await mkIdbQueueRemove_(item.id);
        continue;
      }
      try {
        const d = await api(item.params, 55000);
        if (!mkOfflineFlushOk_(item.action, d)) break;
        if (item.action === 'salvarLocacao' && d && d.rowIndex) {
          const tempRow = mkOfflineTempRowIndex_(item.id);
          await mkOfflineRemapRowInQueue_(tempRow, d.rowIndex);
          await mkOfflineReplaceTempSession_(tempRow, Object.assign({}, d, { clientRequestId: item.id }));
        }
        if (item.action === 'iniciarTimer' && Array.isArray(sessions)) {
          const ri = Number(item.params && item.params.rowIndex);
          const s = sessions.find(function (x) {
            return x && (Number(x.rowIndex) === ri || x._clientRequestId === item.id);
          });
          if (s) {
            delete s._offlineTimerPending;
            delete s._iniciandoTimer;
            if (d && Number(d.startTimestamp) > 1e12) {
              s.startTimestamp = Number(d.startTimestamp);
              s._localTimerStart = s.startTimestamp;
              if (d.horaInicio) s.horaInicio = d.horaInicio;
            }
            s.status = 'Ativa';
            s.started = true;
            if (typeof saveSessions === 'function') saveSessions();
          }
        }
        await mkIdbQueueRemove_(item.id);
        flushed++;
      } catch (e) {
        if (mkOfflineIsNetworkError_(e)) break;
        await mkIdbQueueRemove_(item.id);
      }
    }
    const rest = await mkIdbQueueList_();
    window._mkOfflineQueueCount = rest.length;
    if (typeof mkOfflineRefreshUi_ === 'function') mkOfflineRefreshUi_();
    if (flushed > 0) {
      if (typeof toast === 'function') {
        try { toast('Fila offline: ' + flushed + ' item(ns) enviados à nuvem', 'success'); } catch (eT) { /* ok */ }
      }
      if (typeof syncController === 'function') syncController(false, 500);
    }
  } finally {
    window._mkOfflineFlushing = false;
  }
  return { ok: true, flushed: flushed };
}

/** I191: após listarAtivas, descarta fila de ri>0 que o servidor já não tem aberta. */
async function mkOfflinePruneStaleQueue_(serverRows) {
  if (typeof mkIdbQueueList_ !== 'function' || typeof mkIdbQueueRemove_ !== 'function') return 0;
  const alive = serverRows instanceof Set ? serverRows : new Set(serverRows || []);
  let removed = 0;
  try {
    const queue = await mkIdbQueueList_();
    for (let i = 0; i < (queue || []).length; i++) {
      const item = queue[i];
      if (!item || !item.params) continue;
      const ri = Number(item.params.rowIndex);
      if (item.action === 'salvarLocacao' && (!ri || ri < 0)) continue;
      if (ri < 0) continue;
      if (!ri || alive.has(ri) || alive.has(item.params.rowIndex)) continue;
      /* encerrar/cancelar/iniciar de linha já fechada no servidor = lixo que alimenta fantasma */
      if (item.action === 'encerrarLocacao' || item.action === 'cancelarLocacao' || item.action === 'iniciarTimer') {
        await mkIdbQueueRemove_(item.id);
        removed++;
      }
    }
    if (removed > 0 && typeof mkOfflineRefreshUi_ === 'function') mkOfflineRefreshUi_();
  } catch (e) { /* ignore */ }
  return removed;
}

async function mkOfflineRefreshUi_() {
  const n = typeof mkIdbQueueCount_ === 'function' ? await mkIdbQueueCount_() : (window._mkOfflineQueueCount || 0);
  window._mkOfflineQueueCount = n;
  const el = document.getElementById('mk-offline-queue-badge');
  if (el) {
    el.textContent = n > 0 ? ('Fila offline: ' + n) : '';
    el.style.display = n > 0 ? '' : 'none';
  }
  const chip = document.getElementById('mk-net-chip');
  if (chip) {
    if (mkOfflineIsOffline_()) {
      chip.textContent = n > 0 ? ('Offline · fila ' + n) : 'Offline';
      chip.dataset.state = 'off';
    } else if (n > 0) {
      chip.textContent = 'Online · sync ' + n;
      chip.dataset.state = 'sync';
    }
  }
}

function mkOfflineWire_() {
  window.addEventListener('online', function () {
    if (typeof toast === 'function') {
      try { toast('Internet voltou — sincronizando fila…', 'info'); } catch (e1) { /* ok */ }
    }
    mkOfflineFlush_().catch(function () { /* ignore */ });
  });
  window.addEventListener('offline', function () {
    if (typeof toast === 'function') {
      try { toast('Sem internet — balcão segue; fila guarda salvar/▶/encerrar', 'warning'); } catch (e2) { /* ok */ }
    }
    mkOfflineRefreshUi_().catch(function () { /* ignore */ });
  });
  mkOfflineRefreshUi_().catch(function () { /* ignore */ });
  setInterval(function () {
    if (!mkOfflineIsOffline_()) mkOfflineFlush_().catch(function () { /* ignore */ });
  }, 30000);
}

window.mkOfflineHandleWriteFail_ = mkOfflineHandleWriteFail_;
window.mkOfflineFlush_ = mkOfflineFlush_;
window.mkOfflinePruneStaleQueue_ = mkOfflinePruneStaleQueue_;
window.mkOfflineWire_ = mkOfflineWire_;
window.mkOfflineIsOffline_ = mkOfflineIsOffline_;
window.mkOfflineCanQueue_ = mkOfflineCanQueue_;
window.mkOfflineGenRequestId_ = mkOfflineGenRequestId_;
window.mkOfflineSyntheticSalvar_ = mkOfflineSyntheticSalvar_;
