/* MOVI KIDS — Fase 2: fila offline salvar/▶ (FE v1.9.104) */

const MK_OFFLINE_QUEUE_ACTIONS = new Set(['salvarLocacao', 'iniciarTimer']);
const MK_OFFLINE_MAX_ATTEMPTS = 8;

function mkOfflineIsOffline_() {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

function mkOfflineIsNetworkError_(err) {
  if (mkOfflineIsOffline_()) return true;
  const msg = String((err && err.message) || err || '').toLowerCase();
  return msg.indexOf('failed to fetch') >= 0
    || msg.indexOf('network') >= 0
    || msg.indexOf('load failed') >= 0
    || msg.indexOf('networkerror') >= 0;
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

async function mkOfflineHandleWriteFail_(params, err) {
  const action = String((params && params.action) || '');
  if (!mkOfflineCanQueue_(action) || !mkOfflineIsNetworkError_(err)) throw err;

  const item = await mkOfflineEnqueue_(action, params);
  if (action === 'salvarLocacao') {
    if (typeof toast === 'function') {
      toast('Sem internet — locação na fila. Envia quando voltar a rede.', 'warning');
    }
    return mkOfflineSyntheticSalvar_(params, item.id);
  }
  if (action === 'iniciarTimer') {
    if (typeof toast === 'function') {
      toast('Sem internet — início na fila. Cronômetro segue no tablet.', 'warning');
    }
    return { ok: true, _offlineQueued: true, clientRequestId: item.id, queued: true };
  }
  throw err;
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
        if (!d || !d.ok) break;
        if (item.action === 'salvarLocacao' && d.rowIndex) {
          const tempRow = mkOfflineTempRowIndex_(item.id);
          await mkOfflineReplaceTempSession_(tempRow, Object.assign({}, d, { clientRequestId: item.id }));
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
    if (flushed > 0 && typeof syncController === 'function') syncController(false, 500);
  } finally {
    window._mkOfflineFlushing = false;
  }
  return { ok: true, flushed: flushed };
}

async function mkOfflineRefreshUi_() {
  const n = typeof mkIdbQueueCount_ === 'function' ? await mkIdbQueueCount_() : (window._mkOfflineQueueCount || 0);
  window._mkOfflineQueueCount = n;
  const el = document.getElementById('mk-offline-queue-badge');
  if (el) {
    el.textContent = n > 0 ? ('Fila offline: ' + n) : '';
    el.style.display = n > 0 ? '' : 'none';
  }
}

function mkOfflineWire_() {
  window.addEventListener('online', function () {
    mkOfflineFlush_().catch(function () { /* ignore */ });
  });
  mkOfflineRefreshUi_().catch(function () { /* ignore */ });
  setInterval(function () {
    if (!mkOfflineIsOffline_()) mkOfflineFlush_().catch(function () { /* ignore */ });
  }, 45000);
}

window.mkOfflineHandleWriteFail_ = mkOfflineHandleWriteFail_;
window.mkOfflineFlush_ = mkOfflineFlush_;
window.mkOfflineWire_ = mkOfflineWire_;
window.mkOfflineIsOffline_ = mkOfflineIsOffline_;
window.mkOfflineCanQueue_ = mkOfflineCanQueue_;
