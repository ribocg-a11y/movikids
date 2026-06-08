/* MOVI KIDS — sessão ativa, SMS status, timer loop (Pacote M.5)
 * Carregar após mk-globals.js (sessions); antes de mk-sync.js.
 */
var timerInterv = null;
const WA_EVENT_LOG_KEY = 'mk_wa_event_log_v1';
const SMS_CHECK_DELAYS = [15000, 60000, 180000, 300000, 420000, 600000];
const SMS_RECHECK_EXTRA_MS = [120000, 300000, 600000];
const SMS_UNCONFIRMED_MS = 5 * 60 * 1000;
const SMS_FAIL_CONFIRM_CHECKS = 6;
const SMS_GENERIC_FAIL_RE = /generic.failure|generic_failure|result_error_generic/i;

async function loadAtivas() {
  await sincronizarServidor();
}

/** MK_TIMER_CANON_GUARD I16 — espelha calcStartTimestamp_ (acompanhar.html) e timestampCanonico_ (GAS). */
function calcStartTimestamp(data, horaInicio) {
  if (!data || !horaInicio) return 0;
  const dp = String(data).split('/');
  const hp = String(horaInicio).split(':');
  if (dp.length < 3 || hp.length < 2) return 0;
  const d = new Date(
    parseInt(dp[2], 10),
    parseInt(dp[1], 10) - 1,
    parseInt(dp[0], 10),
    parseInt(hp[0], 10),
    parseInt(hp[1], 10),
    0
  );
  const out = d.getTime();
  return isNaN(out) ? 0 : out;
}

/** Canoniza sessão/locação — mesma regra que canonLoc_ no portal (I16). */
function canonSessao_(s) {
  if (!s) return { startTimestamp: 0, mins: 0, originalMins: 0, extendedMins: 0, status: '' };
  const status = String(s.status || '').trim();
  let startTimestamp = Number(s.startTimestamp || 0);
  const nowTs = Date.now();
  if (status === 'Pendente') {
    startTimestamp = 0;
  } else if (status === 'Ativa') {
    // Cronômetro só após iniciarTimer (col Y). Nunca inferir pela hora do cadastro.
    if (!startTimestamp || startTimestamp < 1e12 || startTimestamp > nowTs + 300000) {
      startTimestamp = 0;
    }
  }
  const extendedMins = Number(s.extendedMins || 0);
  const originalMins = s.originalMins != null
    ? Number(s.originalMins)
    : Math.max(0, Number(s.mins || 0) - extendedMins);
  const totalMins = s.originalMins != null ? originalMins + extendedMins : Number(s.mins || 0);
  return Object.assign({}, s, { status, startTimestamp, mins: totalMins, originalMins, extendedMins });
}

function sessaoTimerIniciado_(s) {
  const c = canonSessao_(s);
  return c.status === 'Ativa' && c.startTimestamp >= 1e12;
}

function saveSessions() {
  localStorage.setItem('mk_sessions', JSON.stringify(sessions));
}

function extraWaKey_(s) {
  return 'mk_extra_wa_sent_' + String((s && (s.rowIndex || s.id)) || '');
}

function extraWaFoiEnviado_(s) {
  if (!s) return false;
  if (s.smsFlags && s.smsFlags.esgotado) return true;
  return Boolean(s.extraWaSentAt || localStorage.getItem(extraWaKey_(s)));
}

function marcarExtraWaEnviado_(s) {
  if (!s) return;
  const ts = Date.now();
  s.extraWaSentAt = ts;
  try { localStorage.setItem(extraWaKey_(s), String(ts)); } catch(e) {}
  saveSessions();
}

function smsErroFalsoPositivo_(error) {
  return SMS_GENERIC_FAIL_RE.test(String(error || ''));
}

function higienizarSmsStatusSessao_(sms) {
  if (!sms || !sms.gatewayId || sms.manualOk) return sms;
  const st = String(sms.state || '').toLowerCase();
  if (st === 'failed' && (smsErroFalsoPositivo_(sms.error) || !sms.error)) {
    const checks = Number(sms.checks || 0);
    if (checks >= SMS_FAIL_CONFIRM_CHECKS) {
      return Object.assign({}, sms, { state: 'Sent', error: '', suspectFail: true });
    }
    return Object.assign({}, sms, { state: 'Verifying', suspectFail: true });
  }
  return sms;
}

function smsStatusEfetivo_(sms) {
  if (!sms) return '';
  const raw = String(sms.state || '');
  const st = raw.toLowerCase();
  if (st === 'failed' && smsErroFalsoPositivo_(sms.error)) {
    const checks = Number(sms.checks || 0);
    const sentAt = Number(sms.sentAt || sms.updatedAt || 0);
    const age = sentAt ? Date.now() - sentAt : 0;
    if (checks < SMS_FAIL_CONFIRM_CHECKS && age < 900000) return 'Verifying';
    return 'Sent';
  }
  if (st === 'failed' && sms.suspectFail) return 'Sent';
  const sentAt = Number(sms.sentAt || sms.updatedAt || 0);
  if (sentAt && !smsStatusFinal_(raw) && (Date.now() - sentAt > SMS_UNCONFIRMED_MS)) return 'Unconfirmed';
  return raw;
}

function smsStatusLabel_(state) {
  const st = String(state || '').toLowerCase();
  if (st === 'delivered') return { cls:'ok', txt:'Entregue SMS' };
  if (st === 'verifying') return { cls:'wait', txt:'Confirmando SMS...' };
  if (st === 'failed') return { cls:'err', txt:'Falha SMS' };
  if (st === 'unconfirmed') return { cls:'sent', txt:'SMS sem confirmacao' };
  if (st === 'sent') return { cls:'sent', txt:'SMS enviado' };
  if (st === 'processed') return { cls:'wait', txt:'SMS processando' };
  if (st === 'pending' || st === 'accepted') return { cls:'wait', txt:'SMS na fila' };
  return { cls:'wait', txt:'SMS pendente' };
}

function smsFalhaReal_(sms) {
  const eff = smsStatusEfetivo_(sms);
  return String(eff).toLowerCase() === 'failed';
}

function smsStatusHtml_(s) {
  const sms = s && s.smsStatus;
  if (!sms || !sms.gatewayId) return '';
  const state = smsStatusEfetivo_(sms);
  const label = smsStatusLabel_(state);
  const title = sms.error ? ' title="' + escHtml(sms.error) + '"' : '';
  const failed = smsFalhaReal_(sms);
  const errTxt = failed && sms.error ? (' Detalhe: ' + escHtml(String(sms.error).slice(0, 120))) : '';
  const fallback = failed
    ? '<div class="sms-fail-hint">Confirme o telefone (DDD+9) ou mostre o QR do portal no balcão.' + errTxt + '</div>' +
      '<button class="btn btn-wa" onclick="abrirWhatsAppFallback(' + Number(s.rowIndex || 0) + ')" title="Abrir WhatsApp como alternativa">WhatsApp fallback</button>' +
      '<button class="btn btn-secondary" style="margin-top:6px;font-size:11px" onclick="confirmarSmsRecebido_(' + Number(s.rowIndex || 0) + ')" title="Operador confirmou que o SMS chegou">SMS chegou — limpar aviso</button>'
    : '';
  return '<div class="sms-status sms-' + label.cls + '"' + title + '>' + label.txt + '</div>' + fallback;
}

function confirmarSmsRecebido_(rowIndex) {
  atualizarSmsStatusLocal_(rowIndex, { state: 'Delivered', error: '', suspectFail: false, manualOk: true });
  toast('SMS confirmado pelo balcão.', 'success');
}

function atualizarSmsStatusLocal_(rowIndex, patch) {
  const s = sessions.find(x => Number(x.rowIndex) === Number(rowIndex));
  if (!s) return null;
  s.smsStatus = { ...(s.smsStatus || {}), ...patch, updatedAt: Date.now() };
  saveSessions();
  renderCards();
  return s;
}

function agendarConsultaSms_(rowIndex, gatewayId, delays) {
  (delays || SMS_CHECK_DELAYS).forEach(delay => {
    setTimeout(() => consultarSmsStatusSessao_(rowIndex, gatewayId), delay);
  });
}

function smsStatusFinal_(state) {
  const st = String(state || '').toLowerCase();
  return st === 'delivered' || st === 'failed' || st === 'sent';
}

function smsPrecisaRecheck_(sms) {
  if (!sms || !sms.gatewayId || sms.manualOk) return false;
  const rawSt = String(sms.state || '').toLowerCase();
  if (rawSt === 'failed') {
    if (!sms.error || smsErroFalsoPositivo_(sms.error)) return true;
    return Number(sms.checks || 0) < SMS_FAIL_CONFIRM_CHECKS;
  }
  const eff = smsStatusEfetivo_(sms);
  const effSt = String(eff).toLowerCase();
  if (effSt === 'verifying') return true;
  return !smsStatusFinal_(eff);
}

function reconsultarSmsPendentes_() {
  const now = Date.now();
  if (now - _smsStatusSweepAt < 30000) return;
  _smsStatusSweepAt = now;
  sessions.forEach(s => {
    const sms = s && s.smsStatus;
    if (!smsPrecisaRecheck_(sms)) return;
    const last = Number(sms.updatedAt || sms.sentAt || 0);
    const sentAt = Number(sms.sentAt || last || now);
    const checks = Number(sms.checks || 0);
    if (checks >= 12) {
      if (String(sms.state || '').toLowerCase() === 'failed' && smsErroFalsoPositivo_(sms.error)) {
        atualizarSmsStatusLocal_(s.rowIndex, { state: 'Sent', error: '', suspectFail: true });
      } else if (now - sentAt > SMS_UNCONFIRMED_MS) {
        atualizarSmsStatusLocal_(s.rowIndex, { state: 'Unconfirmed' });
      }
      return;
    }
    if (!last || now - last >= 45000) consultarSmsStatusSessao_(s.rowIndex, sms.gatewayId);
  });
}

async function consultarSmsStatusSessao_(rowIndex, gatewayId) {
  if (!gatewayId || gatewayId.length < 8) return null;
  const atual = sessions.find(x => Number(x.rowIndex) === Number(rowIndex));
  if (atual && atual.smsStatus && atual.smsStatus.manualOk) return atual.smsStatus;
  if (atual && atual.smsStatus && smsStatusFinal_(smsStatusEfetivo_(atual.smsStatus)) &&
      !smsErroFalsoPositivo_(atual.smsStatus.error)) return atual.smsStatus;
  const ver = (typeof APP_VERSION !== 'undefined' ? APP_VERSION : (window.MK_VERSION || ''));
  try {
    const d = await api({
      action: 'consultarSmsStatus',
      gatewayId,
      rowIndex,
      origem: 'frontend',
      versao: ver,
      ...(typeof operadorApiParams_ === 'function' ? operadorApiParams_() : {})
    }, 20000);
    if (!d.ok) throw new Error(d.erro || 'Falha ao consultar SMS');
    const sms = d.sms || {};
    const anterior = sessions.find(x => Number(x.rowIndex) === Number(rowIndex));
    const checks = Number((anterior && anterior.smsStatus && anterior.smsStatus.checks) || 0) + 1;
    let state = sms.state || 'Pending';
    let error = sms.error || '';
    let suspectFail = !!sms.suspectFail;
    if (String(state).toLowerCase() === 'failed' && smsErroFalsoPositivo_(error)) {
      if (checks < SMS_FAIL_CONFIRM_CHECKS) {
        state = 'Verifying';
      } else {
        state = 'Sent';
        error = '';
        suspectFail = true;
      }
    }
    const patch = {
      gatewayId,
      state,
      error,
      telefoneHash: sms.telefoneHash || '',
      checks,
      suspectFail
    };
    const s = atualizarSmsStatusLocal_(rowIndex, patch);
    if (s && smsFalhaReal_(s.smsStatus)) {
      toast('Falha SMS: confirme telefone ou use alternativa.', 'error');
    }
    if (String(state).toLowerCase() === 'verifying' && checks <= SMS_FAIL_CONFIRM_CHECKS) {
      const extra = SMS_RECHECK_EXTRA_MS[Math.min(checks - 1, SMS_RECHECK_EXTRA_MS.length - 1)] || 120000;
      setTimeout(() => consultarSmsStatusSessao_(rowIndex, gatewayId), extra);
    }
    return sms;
  } catch(e) {
    atualizarSmsStatusLocal_(rowIndex, { gatewayId, state:'Pending', error: e.message || 'Erro consulta SMS' });
    return null;
  }
}

function registrarWaEvento_(tipo, s, status) {
  try {
    const ver = (typeof APP_VERSION !== 'undefined' ? APP_VERSION : (window.MK_VERSION || ''));
    const evento = {
      tipo,
      status,
      rowIndex: s && s.rowIndex,
      id: s && s.id,
      crianca: s && s.crianca,
      responsavel: s && s.responsavel,
      telefone: s && s.telefone,
      at: Date.now(),
      versao: ver
    };
    const list = JSON.parse(localStorage.getItem(WA_EVENT_LOG_KEY) || '[]');
    list.unshift(evento);
    localStorage.setItem(WA_EVENT_LOG_KEY, JSON.stringify(list.slice(0, 200)));

    api({
      action: 'registrarWhatsAppEvento',
      tipo: evento.tipo || '',
      status: evento.status || '',
      rowIndex: evento.rowIndex || '',
      id: evento.id || '',
      crianca: evento.crianca || '',
      responsavel: evento.responsavel || '',
      telefone: evento.telefone || '',
      versao: evento.versao || '',
      origem: 'frontend'
    }, 8000).catch(() => {});
  } catch(e) {}
}

function startTimerLoop() {
  if (timerInterv) clearInterval(timerInterv);
  timerInterv = setInterval(() => {
    sessions.forEach(s => checkTimer(s));
    sessions.forEach(s => checkShake(s));
    reconsultarSmsPendentes_();
    renderCards();
    updateStats();
    const painelPage = document.getElementById('page-painel');
    if (painelPage && painelPage.classList.contains('active') && typeof renderPainel === 'function') renderPainel();
  }, 1000);
}

/** I20: instante efetivo do clique — evita perder segundos se sync trouxer serverTs atrasado. */
function effectiveStartTs_(s) {
  const c = canonSessao_(s);
  const local = Number(s && s._localTimerStart || 0);
  const canonTs = Number(c.startTimestamp || 0);
  if (local >= 1e12 && canonTs >= 1e12 && local < canonTs && canonTs - local <= 120000) {
    return local;
  }
  if (local >= 1e12 && (!canonTs || canonTs < 1e12)) return local;
  return canonTs;
}

function calcRemaining(s) {
  const c = canonSessao_(s);
  if (c.status === 'Pendente') return c.mins * 60;
  const startTs = effectiveStartTs_(s);
  if (!startTs || startTs < 1e12 || startTs > Date.now() + 300000) {
    return c.mins * 60;
  }
  const elapsed = (Date.now() - startTs) / 1000;
  return Math.floor(c.mins * 60 - elapsed);
}

function checkShake(s) {
  if (s.started) return;
  const criado = s.startTimestamp || s._criado || 0;
  if (!criado) return;
  const elapsed = (Date.now() - criado) / 1000;
  const card = document.querySelector('[data-row="' + s.rowIndex + '"]');
  if (!card) return;
  if (elapsed > 40 && !card.classList.contains('card-shake')) {
    card.classList.add('card-shake');
  }
}

function checkTimer(s) {
  if (!s.started) return;
  const rem = calcRemaining(s);
  if (rem <= 300 && rem > 0 && !s.alertFired5) {
    s.alertFired5 = true;
    saveSessions();
    if (typeof triggerAlert5 === 'function') triggerAlert5(s);
  }
  if (rem <= 0 && !s.alertFiredExp) {
    s.alertFiredExp = true;
    saveSessions();
    if (typeof triggerAlertExpired === 'function') triggerAlertExpired(s);
  }
}

window.calcStartTimestamp = calcStartTimestamp;
window.effectiveStartTs_ = effectiveStartTs_;
window.canonSessao_ = canonSessao_;
window.sessaoTimerIniciado_ = sessaoTimerIniciado_;
window.saveSessions = saveSessions;
window.startTimerLoop = startTimerLoop;
