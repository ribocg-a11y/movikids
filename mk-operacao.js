/* MOVI KIDS — Operações balcão: alertas, SMS/WA, editar/cancelar, iniciar, estender (Pacote M.8)
 * Zona P0: editarLocacao, cancelarLocacao, iniciarTimer, estenderLocacao via GET (mk-api.js).
 */
var alertSession = null;
var opSession = null;
var opTipo = null;
// ═══════════════════════════════════════════════════════════
// ALERTS
// ═══════════════════════════════════════════════════════════
function triggerAlert5(s) {
  salvarNovaDraft_();
  alertSession = s;
  playBeep();
  showNotification(`⏰ ${s.crianca} — 5 minutos!`, `Hora de avisar o responsável: ${s.responsavel}`);
  showAlertModal(s, false); // Operador decide se envia (MSG 2 é opcional)
}

function triggerAlertExpired(s) {
  salvarNovaDraft_();
  alertSession = s;
  playBeep(3);
  showNotification(`🔴 ${s.crianca} — Tempo esgotado!`, `Minutos extras sendo cobrados!`);
  showAlertModal(s, true); // MSG 3 obrigatória — operador deve enviar antes de fechar
}

function showAlertModal(s, expired) {
  const modal = document.getElementById('alert-modal');
  const admIgnoraSms = typeof mkAdminIgnoraSmsObrigatorio_ === 'function' && mkAdminIgnoraSmsObrigatorio_();
  const smsExtraObrigatorio = expired && !admIgnoraSms;
  modal.className = 'modal-overlay alert-modal' + (smsExtraObrigatorio ? ' danger show' : ' show');
  modal.dataset.extraWaSent = (expired && extraWaFoiEnviado_(s)) || admIgnoraSms ? '1' : '0';

  document.getElementById('alert-icon').textContent  = expired ? '🔴' : '⏰';
  document.getElementById('alert-title').textContent = expired ? 'Tempo esgotado!' : 'Faltam 5 minutos!';
  document.getElementById('alert-sub').textContent   = expired
    ? (admIgnoraSms
      ? 'Administrador: você pode encerrar sem enviar SMS (use em falha de rede ou emergência).'
      : 'Envie a mensagem ao responsável informando que minutos extras serão cobrados.')
    : 'Avise ' + s.responsavel + ' que o tempo de ' + s.crianca + ' está acabando.';

  const icon   = tipoIcon(s.tipo);
  let alertHtml =
    '<div class="modal-info-row"><span>' + icon + ' ' + (s.veiculo||s.tipo) + '</span><span>' + s.plano + '</span></div>' +
    '<div class="modal-info-row"><span>Criança</span><span>' + s.crianca + '</span></div>' +
    '<div class="modal-info-row"><span>Responsável</span><span>' + s.responsavel + '</span></div>';
  if (mkExibirFinanceiro_()) {
    alertHtml += '<div class="modal-info-row"><span>Extra/min</span><span>R$ ' + adicionalPorMinSessao_(s) + '</span></div>';
  }
  document.getElementById('alert-info').innerHTML = alertHtml;

  const btnEncAlert = document.getElementById('btn-enc-alert');
  if (btnEncAlert) {
    btnEncAlert.className = 'btn btn-encerrar' + (smsExtraObrigatorio ? ' danger' : '');
    btnEncAlert.textContent = admIgnoraSms && expired ? '✓ Encerrar sem SMS (ADM)' : '✓ Encerrar locação';
  }

  const btnPular = document.getElementById('btn-pular-alerta');
  const btnWa    = document.getElementById('btn-wa');
  if (expired) {
    if (btnPular) {
      btnPular.style.display = admIgnoraSms ? '' : 'none';
      btnPular.textContent = admIgnoraSms
        ? 'Continuar sem SMS (ADM)'
        : 'Pular mensagem e continuar monitorando';
    }
    if (btnWa) {
      btnWa.textContent = admIgnoraSms
        ? 'Enviar SMS de cobrança (opcional)'
        : 'Enviar SMS de cobrança (obrigatório)';
      btnWa.onclick = async function() {
        if (await waTempoEsgotado(s) === false) {
          if (!admIgnoraSms) return;
          toast('SMS indisponível; você ainda pode encerrar como ADM.', 'warning');
          return;
        }
        marcarExtraWaEnviado_(s);
        modal.dataset.extraWaSent = '1';
        modal.classList.remove('danger');
        if (!admIgnoraSms) fecharAlerta();
        toast('Aviso de minutos extras acionado.', 'success');
      };
    }
  } else {
    if (btnPular) {
      btnPular.style.display = '';
      btnPular.textContent = 'Pular mensagem e continuar monitorando';
    }
    if (btnWa) {
      btnWa.textContent = 'Enviar SMS ao responsável';
      btnWa.onclick = function() { abrirWhatsApp(); };
    }
  }
}

function fecharAlerta() {
  const modal = document.getElementById('alert-modal');
  const admIgnoraSms = typeof mkAdminIgnoraSmsObrigatorio_ === 'function' && mkAdminIgnoraSmsObrigatorio_();
  if (!admIgnoraSms && modal.classList.contains('danger') && modal.dataset.extraWaSent !== '1') {
    toast('Envie o SMS de cobrança antes de fechar!', 'error');
    return;
  }
  modal.classList.remove('show');
  if (!encSession) alertSession = null;
  const novaPage = document.getElementById('page-nova');
  if (novaPage && novaPage.classList.contains('active')) restaurarNovaDraft_();
}

function abrirWhatsApp() {
  const s = alertSession;
  if (!s || !s.telefone) { toast('Telefone não cadastrado', 'error'); return; }
  abrirWaMsg(s);
}

function abrirWhatsAppCard(rowIndex) {
  const s = sessions.find(x => x.rowIndex === rowIndex);
  if (!s) return;
  abrirWaMsg(s);
}

function tipoSmsPorSessao_(s) {
  const rem = calcRemaining(s);
  if (rem <= 0) return 'esgotado';
  if (rem <= 300) return 'alerta';
  return 'portal';
}

function aplicarSmsResposta_(s, sms, smsTipo) {
  if (!sms || !sms.gatewayId) return;
  atualizarSmsStatusLocal_(s.rowIndex, {
    gatewayId: sms.gatewayId,
    state: sms.state || (sms.duplicado ? (sms.state || 'Sent') : 'Accepted'),
    error: '',
    telefone: sms.telefone || '',
    tipo: smsTipo,
    sentAt: Date.now(),
    checks: 0
  });
  if (!sms.duplicado) agendarConsultaSms_(s.rowIndex, sms.gatewayId);
}

async function enviarSmsResponsavel_(s, tipo) {
  if (!s || !s.telefone) { toast('Telefone não cadastrado', 'error'); return false; }
  const smsTipo = tipo || tipoSmsPorSessao_(s);
  try {
    const d = await api({
      action: 'enviarSmsResponsavel',
      rowIndex: s.rowIndex,
      tipo: smsTipo,
      origem: 'frontend',
      versao: APP_VERSION,
      ...operadorApiParams_()
    }, 30000);
    if (!d.ok) throw new Error(d.erro || 'Falha ao enviar SMS');
    const sms = d.sms || {};
    if (sms.duplicado) {
      aplicarSmsResposta_(s, sms, smsTipo);
      toast('SMS já enviado recentemente para esta locação.', 'warning');
      return true;
    }
    if (sms.gatewayId) aplicarSmsResposta_(s, sms, smsTipo);
    toast('SMS enviado para a fila.', 'success');
    return true;
  } catch(e) {
    toast('SMS não enviado: ' + (e.message || 'erro'), 'error');
    return false;
  }
}

async function enviarSmsAvulso_(dados, tipo) {
  const telefone = dados && (dados.telefone || dados.tel);
  if (!telefone) { toast('Telefone não cadastrado', 'error'); return false; }
  try {
    const d = await api({
      action: 'enviarSmsAvulso',
      tipo: tipo || 'agradecimento',
      telefone,
      responsavel: dados.responsavel || dados.nome || '',
      nome: dados.nome || dados.responsavel || '',
      crianca: dados.crianca || '',
      origem: 'frontend',
      versao: APP_VERSION,
      ...operadorApiParams_()
    }, 30000);
    if (!d.ok) throw new Error(d.erro || 'Falha ao enviar SMS');
    toast('SMS enviado.', 'success');
    return true;
  } catch(e) {
    toast('SMS não enviado: ' + (e.message || 'erro'), 'error');
    return false;
  }
}

function normalizarTxt_(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
}

function renderOperacaoLocacaoForm_(rowIndex, tipo, bodyId) {
  opSession = sessions.find(x => Number(x.rowIndex) === Number(rowIndex));
  opTipo = tipo;
  if (!opSession) { toast('Locação não encontrada', 'error'); return false; }
  const body = document.getElementById(bodyId || 'op-body');
  if (!body) return false;
  const ativa = !!opSession.started;
  if (tipo === 'pagamento') {
    body.innerHTML = `<div class="op-policy">Use quando o responsável pagou em outra forma.</div><div class="op-form"><div class="op-grid"><div class="op-field"><label>Atual</label><input value="${escHtml(opSession.pagamento || 'Não informado')}" disabled></div><div class="op-field"><label>Novo</label><select id="op-pagamento">${['PIX','Credito','Debito','Dinheiro'].map(p=>`<option ${normalizarTxt_(opSession.pagamento)===normalizarTxt_(p)?'selected':''}>${p}</option>`).join('')}</select></div></div><div class="op-field"><label>Motivo</label><textarea id="op-motivo">Responsável alterou a forma de pagamento.</textarea></div></div>`;
  } else if (tipo === 'veiculo') {
    body.innerHTML = `<div class="op-policy">A troca não reinicia o timer nem altera valores automaticamente.</div><div class="op-form"><div class="op-grid"><div class="op-field"><label>Atual</label><input value="${escHtml(opSession.veiculo || opSession.tipo || '')}" disabled></div><div class="op-field"><label>Novo</label><select id="op-veiculo">${['Carro 01','Carro 02','Carro 03','Triciclo 01','Triciclo 02','Pelucia 01','Pelucia 02','Pelucia 03','Pelucia 04'].map(v=>`<option ${normalizarTxt_(opSession.veiculo)===normalizarTxt_(v)?'selected':''}>${v}</option>`).join('')}</select></div></div><div class="op-field"><label>Motivo</label><textarea id="op-motivo">Troca solicitada pelo responsável ou por operação.</textarea></div></div>`;
  } else if (tipo === 'plano') {
    if (ativa) { toast('Plano só pode ser trocado antes de iniciar. Use Estender tempo.', 'warning'); return false; }
    const planos = Object.keys(PRECOS[opSession.tipo] || {});
    body.innerHTML = `<div class="op-policy">Depois do início, use extensão para preservar faturamento.</div><div class="op-form"><div class="op-field"><label>Novo plano</label><select id="op-plano">${planos.map(p=>`<option ${p===opSession.plano?'selected':''}>${p}</option>`).join('')}</select></div><div class="op-field"><label>Motivo</label><textarea id="op-motivo">Cliente pediu alteração antes de iniciar.</textarea></div></div>`;
  } else if (tipo === 'cancelar') {
    body.innerHTML = `<div class="op-policy danger">${ativa ? 'Informe o motivo para não quebrar caixa e histórico.' : 'Cadastro não iniciado será marcado como Cancelada.'}</div><div class="op-form"><div class="op-field"><label>Tipo</label><select id="op-motivo-tipo"><option>Erro de cadastro</option><option>Cliente desistiu</option><option>Manutenção do veículo</option><option>Cortesia autorizada</option></select></div><div class="op-field"><label>Justificativa obrigatória</label><textarea id="op-motivo">Descreva o motivo do cancelamento.</textarea></div></div>`;
  } else {
    body.innerHTML = `<div class="op-policy">Toda alteração será sincronizada e registrada.</div><div class="op-form"><div class="op-field"><label>Criança</label><input id="op-crianca" value="${escHtml(opSession.crianca || '')}"></div><div class="op-field"><label>Responsável</label><input id="op-responsavel" value="${escHtml(opSession.responsavel || '')}"></div><div class="op-field"><label>Telefone</label><input id="op-telefone" value="${escHtml(opSession.telefone || '')}"></div><div class="op-field"><label>Observação</label><textarea id="op-observacao">${escHtml(opSession.observacao || '')}</textarea></div><div class="op-field"><label>Motivo</label><textarea id="op-motivo">Correção operacional solicitada no atendimento.</textarea></div></div>`;
  }
  return true;
}

function abrirOperacaoLocacao(rowIndex, tipo) {
  if (tipo === 'cancelar') {
    abrirSessaoDrawer(rowIndex, 'cancelar');
    return;
  }
  sessDrawerEditTipo = tipo;
  abrirSessaoDrawer(rowIndex, 'editar');
}

function fecharOperacaoLocacao() {
  opSession = null;
  opTipo = null;
  const body = document.getElementById('op-body');
  const cancelBody = document.getElementById('sess-drawer-cancel-body');
  if (body) body.innerHTML = '';
  if (cancelBody) cancelBody.innerHTML = '';
}

async function salvarOperacaoLocacao() {
  if (!opSession || !opTipo) return;
  const btn = document.getElementById(opTipo === 'cancelar' ? 'op-save-cancel' : 'op-save');
  const oldText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Salvando...';
  try {
    const motivo = document.getElementById('op-motivo')?.value || '';
    const payload = { action: opTipo === 'cancelar' ? 'cancelarLocacao' : 'editarLocacao', rowIndex: opSession.rowIndex, motivo, ...operadorApiParams_() };
    if (opTipo === 'pagamento') payload.pagamento = document.getElementById('op-pagamento')?.value || '';
    else if (opTipo === 'veiculo') payload.veiculo = document.getElementById('op-veiculo')?.value || '';
    else if (opTipo === 'plano') payload.plano = document.getElementById('op-plano')?.value || '';
    else if (opTipo === 'cancelar') payload.tipoCancelamento = document.getElementById('op-motivo-tipo')?.value || 'Cancelamento operacional';
    else {
      payload.crianca = document.getElementById('op-crianca')?.value || '';
      payload.responsavel = document.getElementById('op-responsavel')?.value || '';
      payload.telefone = document.getElementById('op-telefone')?.value || '';
      payload.observacao = document.getElementById('op-observacao')?.value || '';
    }
    const d = await api(payload);
    if (!d.ok) { toast('Erro: ' + (d.erro || 'falha ao salvar'), 'error'); return; }
    if (opTipo === 'cancelar') sessions = sessions.filter(s => Number(s.rowIndex) !== Number(opSession.rowIndex));
    else {
      const idx = sessions.findIndex(s => Number(s.rowIndex) === Number(opSession.rowIndex));
      if (idx >= 0) sessions[idx] = Object.assign({}, sessions[idx], d.locacao || {});
    }
    saveSessions(); renderCards(); updateStats(); atualizarVeiculoGrid();
    fecharSessaoDrawer();
    toast(opTipo === 'cancelar' ? 'Locacao cancelada com auditoria.' : 'Alteracao salva e sincronizada.', 'success');
    broadcastInvalidate(); syncController(true, 400);
  } catch(e) {
    toast('Erro de conexão ao salvar.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = oldText;
  }
}

// ── Gera link de acompanhamento ───────────────────────────────────────────
function gerarTrackUrl(s) {
  // v1.6.29: URL curta — só rowIndex em base36 (?s=1s)
  // Nenhum dado pessoal na URL — track.html busca tudo do servidor
  // Motivo: URLs longas com parâmetros são bloqueadas como golpe por WhatsApp/Android
  const rowB36 = s.rowIndex.toString(36);
  return 'https://ribocg-a11y.github.io/movikids/track.html?s=' + rowB36;
}

function normalizarTelefoneWhatsApp_(tel) {
  let raw = String(tel || '').replace(/\D/g,'');
  if (!raw) return { ok:false, erro:'Telefone vazio.' };

  if (raw.startsWith('00')) raw = raw.replace(/^00+/, '');

  let nacional = raw;
  if (raw.startsWith('55')) nacional = raw.slice(2);

  // Brasil: DDD + celular moderno tem 11 digitos. Se vier DDD + 8 digitos
  // de celular antigo, completa o nono digito apos o DDD para evitar destino WA invalido.
  let ajustado = false;
  if (nacional.length === 10 && /^[6-9]$/.test(nacional[2])) {
    nacional = nacional.slice(0, 2) + '9' + nacional.slice(2);
    ajustado = true;
  }

  if (nacional.length !== 10 && nacional.length !== 11) {
    return { ok:false, erro:'Telefone invalido para WhatsApp: ' + raw };
  }

  const phone = '55' + nacional;
  return { ok:true, phone, nacional, ajustado };
}

function sanitizarMensagemWhatsApp_(msg) {
  const urls = [];
  return String(msg || '')
    .replace(/https?:\/\/\S+/g, (url) => {
      const key = '__MK_URL_' + urls.length + '__';
      urls.push(url);
      return key;
    })
    .replace(/\uFFFD/g, '')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/(^|[\s\n])\?+([\s\n]|$)/g, ' ')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/[^\S\r\n]+/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/__MK_URL_(\d+)__/g, (_, i) => urls[Number(i)] || '')
    .trim();
}

function urlsWhatsApp_(phone, text) {
  return {
    web: 'https://web.whatsapp.com/send?phone=' + phone + '&text=' + text,
    app: 'https://wa.me/' + phone + '?text=' + text,
    api: 'https://api.whatsapp.com/send?phone=' + phone + '&text=' + text
  };
}

function deveUsarAppWhatsAppAuto_() {
  try {
    const ua = navigator.userAgent || '';
    const mobileUa = /Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(ua);
    const touch = navigator.maxTouchPoints && navigator.maxTouchPoints > 1;
    const narrow = window.matchMedia && window.matchMedia('(max-width: 1024px)').matches;
    return !!(mobileUa || (touch && narrow));
  } catch(e) { return false; }
}

function escolherUrlWhatsApp_(urls) {
  const mode = whatsappModeAtual_();
  if (mode === 'web') return { mode, url: urls.web };
  if (mode === 'app') return { mode, url: urls.app };
  if (mode === 'api') return { mode, url: urls.api };
  return deveUsarAppWhatsAppAuto_()
    ? { mode: 'auto-app', url: urls.app }
    : { mode: 'auto-web', url: urls.web };
}

function enviarWaTel(tel, msg) {
  const telOk = normalizarTelefoneWhatsApp_(tel);
  if (!telOk.ok) { toast(telOk.erro || 'Telefone invalido para WhatsApp.', 'error'); return false; }
  const phone = telOk.phone;
  const msgLimpa = sanitizarMensagemWhatsApp_(msg);
  const text = encodeURIComponent(msgLimpa || '');
  const urls = urlsWhatsApp_(phone, text);
  const destino = escolherUrlWhatsApp_(urls);

  try {
    if (navigator.clipboard && msgLimpa) navigator.clipboard.writeText(msgLimpa).catch(() => {});
  } catch(e) {}

  try {
    const a = document.createElement('a');
    a.href = destino.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { try { a.remove(); } catch(e) {} }, 500);
    toast((telOk.ajustado ? 'Telefone ajustado. ' : '') + 'WhatsApp ' + whatsappModeLabel_(destino.mode) + ' aberto. Mensagem copiada.', 'success');
  } catch(e) {
    try { window.location.assign(urls.app); }
    catch(e2) { window.location.href = urls.api; }
  }
  return true;
}

function abrirWhatsAppFallback(rowIndex) {
  const s = sessions.find(x => Number(x.rowIndex) === Number(rowIndex));
  if (!s || !s.telefone) { toast('Telefone não cadastrado para fallback.', 'error'); return false; }
  const link = PORTAL_RESPONSAVEL_URL || 'https://ribocg-a11y.github.io/movikids/acompanhar.html';
  const msg = 'MOVI KIDS: acompanhe a locacao de ' + (s.crianca || 'sua crianca') +
    ' pelo portal: ' + link + '. Use o telefone com DDD informado no cadastro.';
  registrarWaEvento_('fallback_sms_failed', s, 'aberto');
  return enviarWaTel(s.telefone, msg);
}

// -- FASE 6: Config de mensagens --
var appConfig = {};
const MSG_DEF = {
  msg_boasvindas:    'Ola, [nome]! 👋\n\n[crianca] acabou de comecar sua aventura na *Movi Kids*! 🚗✨\n\n🎯 Veiculo: [veiculo]\n⏱ Plano: [plano]\n💰 Valor: [valor]\n\nAcompanhe o tempo em tempo real:\n🔗 [link]\n\nQualquer duvida, estamos aqui! 😊\n*Movi Kids -- diversao com seguranca!* 🧸',
  msg_alerta:        'Oi, [nome]! ⏰\n\nO tempo de [crianca] esta quase acabando -- *faltam apenas [minutos] minuto(s)!*\n\nSe quiser continuar, fale com o operador antes do tempo encerrar. 😉\n\nCronometro:\n🔗 [link]\n\n*Movi Kids -- cada minuto e uma memoria!* 🚗',
  msg_esgotado:      'Oi, [nome]! 🔴\n\nO tempo contratado de [crianca] *ja encerrou* e os minutos extras estao sendo contados.\n\n⏱ Extra: [adicional] por minuto\n\nPor favor, dirija-se ao operador. 🙏\n\n🔗 [link]\n\n*Movi Kids -- obrigado!* 🧸',
  msg_agradecimento: 'Oi, [nome]! 🌟\n\nFoi um prazer receber [crianca] aqui na *Movi Kids* hoje! 🚗✨\n\n[link_avaliacao]\n\n*Ate a proxima aventura!\nMovi Kids -- diversao com seguranca!* 🧸',
  link_avaliacao: '',
  msg_extensao: 'Oi, [nome]! ⏱\n\nO passeio de [crianca] foi estendido com um *novo plano*!\n\n🚗 [veiculo]\n📋 Extensão: [plano_novo] → [valor_novo]\n\n💰 Resumo financeiro:\n✅ Plano original ([plano_orig]): [valor_orig] — *ja pago*\n⏳ Extensão: [valor_novo] — *a pagar ao encerrar*[debt_line]\n\n*Total a pagar ao encerrar: [total_pendente]*\n\nAcompanhe o cronometro atualizado:\n🔗 [link]\n\n*Movi Kids — diversao com seguranca!* 🧸'
};

async function carregarConfig() {
  try {
    const d = await api({ action: 'carregarConfig' });
    if (d.ok && d.config) appConfig = d.config;
  } catch(e) { console.warn('carregarConfig:', e); }
}

function renderTemplate(tpl, vars) {
  return (tpl || '').replace(/\[(\w+)\]/g, function(_, k) {
    if (k === 'link_avaliacao') {
      const lk = (appConfig.link_avaliacao || vars.link_avaliacao || '').trim();
      return lk ? '\u2B50 Avalie sua experiencia: ' + lk : '';
    }
    return vars[k] !== undefined ? vars[k] : '[' + k + ']';
  });
}

function getMsgTemplate(key) {
  return appConfig[key] || MSG_DEF[key] || '';
}

// ── MSG 1: Boas-vindas (logo após confirmar locação) ──────────────────────
function waBoasVindas(s) {
  if (!s || !s.telefone) { toast('Telefone não cadastrado', 'error'); return false; }
  return enviarSmsResponsavel_(s, 'portal');
}

// ── MSG 2: Alerta de tempo (faltam ~5 min) ────────────────────────────────
function waAlertaTempo(s) {
  if (!s || !s.telefone) { toast('Telefone não cadastrado', 'error'); return false; }
  return enviarSmsResponsavel_(s, 'alerta');
}

// ── MSG 3: Tempo esgotado com extra ──────────────────────────────────────
function waTempoEsgotado(s) {
  if (!s || !s.telefone) { toast('Telefone obrigatório para aviso de extra.', 'error'); return false; }
  return enviarSmsResponsavel_(s, 'esgotado');
}

// -- MSG 6: Extensão de tempo (v1.6.27) — novo plano contratado ------
function waExtensao(s, extMins, extValor, extPlano, extraAntes, debtAntes) {
  if (!s || !s.telefone) { toast('Sem telefone para enviar SMS', 'error'); return false; }
  return enviarSmsResponsavel_(s, 'extensao');
}

// -- MSG 4: Agradecimento pos-locacao (Fase 6) ------
function waAgradecimento(e) {
  if (!e || !e.telefone) { toast('Telefone não cadastrado', 'error'); return; }
  if (e.rowIndex) return enviarSmsResponsavel_(e, 'agradecimento');
  return enviarSmsAvulso_(e, 'agradecimento');
}

// -- MSG 5: Retorno de clientes (Fase 6) -------
function waMensagemRetorno(cliente) {
  return enviarSmsAvulso_(cliente, 'retorno');
}

// ── Compatibilidade: botão WhatsApp no card e no alerta ───────────────────
async function abrirWaMsg(s) {
  const rem = calcRemaining(s);
  if (rem <= 0) {
    if (await waTempoEsgotado(s) !== false) marcarExtraWaEnviado_(s);
  }
  else if (rem <= 300) { await waAlertaTempo(s); }
  else {
    // > 5 min restando: reenviar apenas o link de acompanhamento (boas-vindas)
    // NÃO enviar alerta de "tempo acabando" quando a sessão mal começou
    await waBoasVindas(s);
  }
}

function encerrarDireto() {
  if (!alertSession) return;
  const rowIndex = alertSession.rowIndex;
  const admIgnoraSms = typeof mkAdminIgnoraSmsObrigatorio_ === 'function' && mkAdminIgnoraSmsObrigatorio_();
  if (admIgnoraSms) {
    const modal = document.getElementById('alert-modal');
    if (modal) {
      modal.classList.remove('danger');
      modal.dataset.extraWaSent = '1';
    }
  }
  pedirEncerrar(rowIndex);
  fecharAlerta();
}

// ═══════════════════════════════════════════════════════════
// INICIAR CONTAGEM
// ═══════════════════════════════════════════════════════════
let bvRowIndex = null; // rowIndex da sessão aguardando início

function abrirModalBv(rowIndex) {
  const s = sessions.find(x => x.rowIndex === rowIndex);
  if (!s) return;
  bvRowIndex = rowIndex;

  const preview =
    'MOVI KIDS: acompanhe a locacao de ' + (s.crianca || 'sua crianca') +
    ' pelo portal:\nhttps://ribocg-a11y.github.io/movikids/acompanhar.html\n\n' +
    'Use o telefone com DDD informado no cadastro.';

  document.getElementById('wa-bv-preview').textContent = preview;
  document.getElementById('wa-bv-modal').classList.add('show');
}

/** I20: SMS do portal sem iniciar cronômetro. */
async function enviarBvSomenteSms_() {
  const s = sessions.find(x => x.rowIndex === bvRowIndex);
  if (s && await waBoasVindas(s) === false) return;
  document.getElementById('wa-bv-modal').classList.remove('show');
  bvRowIndex = null;
  toast('SMS na fila. Aperte ▶ Iniciar quando estiver pronto.', 'info');
}

/** I20: início explícito — separado do envio de SMS. */
function iniciarContagemFromBv_() {
  const ri = bvRowIndex;
  document.getElementById('wa-bv-modal').classList.remove('show');
  bvRowIndex = null;
  if (ri != null) iniciarContagem(ri, { skipAutoPortal: true });
}

function fecharBvSemIniciar_() {
  document.getElementById('wa-bv-modal').classList.remove('show');
  bvRowIndex = null;
}

/** I20: ▶ na Home — sem modal SMS, sem SMS automático. */
function iniciarContagemDireto_(rowIndex) {
  const card = document.getElementById('card-' + rowIndex);
  const btn = card && card.querySelector('.btn-iniciar');
  if (btn && btn.disabled) return;
  if (btn) {
    btn.disabled = true;
    btn.style.opacity = '0.7';
    btn.innerHTML = '⏳ Iniciando...';
  }
  iniciarContagem(rowIndex, { skipAutoPortal: true }).finally(() => {
    const s = sessions.find(x => x.rowIndex === rowIndex);
    if (s && !s.started && btn) {
      btn.disabled = false;
      btn.style.opacity = '';
      btn.innerHTML = '▶ INICIAR CONTAGEM';
    }
  });
}

/** SMS opcional em Pendente — não inicia cronômetro. */
async function enviarSmsPendente_(rowIndex) {
  const s = sessions.find(x => x.rowIndex === rowIndex);
  if (!s) return;
  if (typeof sessaoTimerIniciado_ === 'function' ? sessaoTimerIniciado_(s) : (s.started && s.status === 'Ativa')) {
    toast('Locação já iniciada — use Enviar SMS no card ativo.', 'warning');
    return;
  }
  await enviarSmsResponsavel_(s, 'portal');
}

async function iniciarContagem(rowIndex, opts) {
  opts = opts || {};
  const s = sessions.find(x => x.rowIndex === rowIndex);
  if (!s) return;
  if (typeof sessaoTimerIniciado_ === 'function' ? sessaoTimerIniciado_(s) : (s.started && s.status === 'Ativa')) {
    toast('Contagem já iniciada.', 'info');
    return;
  }

  const clickTs = Date.now();
  try { localStorage.removeItem('mk_inicio_cache'); } catch(e) {}

  // I20: início otimista no clique — cronômetro não perde segundos na latência da API
  s._localTimerStart = clickTs;
  s._iniciandoTimer = true;
  s.startTimestamp = clickTs;
  const _d0 = new Date(clickTs);
  s.horaInicio = String(_d0.getHours()).padStart(2, '0') + ':' + String(_d0.getMinutes()).padStart(2, '0');
  s.started = true;
  s.status = 'Ativa';
  saveSessions();
  renderCards();

  try {
    const d = await api({ action: 'iniciarTimer', rowIndex, timestamp: clickTs, ...operadorApiParams_() });
    if (!d.ok) throw new Error(d.erro || 'Servidor não confirmou o início.');
    const serverTs = Number(d.startTimestamp || 0);
    if (serverTs < 1e12) throw new Error('Servidor não gravou o início da contagem.');
    if (Math.abs(serverTs - clickTs) > 120000) {
      s.startTimestamp = serverTs;
      s._localTimerStart = serverTs;
    } else {
      s.startTimestamp = clickTs;
    }
    if (d.horaInicio) s.horaInicio = d.horaInicio;
    delete s._iniciandoTimer;
    saveSessions();
    renderCards();
    toast('⏱ Contagem iniciada!', 'success');
    try { if(window._bc) window._bc.postMessage('sync'); } catch(e) {}
  } catch(e) {
    delete s._localTimerStart;
    delete s._iniciandoTimer;
    s.started = false;
    s.status = 'Pendente';
    s.startTimestamp = 0;
    s.horaInicio = '';
    saveSessions();
    renderCards();
    toast('Início não confirmado no servidor. Tente iniciar novamente.', 'error');
    syncController(true, 0);
    return;
  }

  if (opts.sendPortalSms) {
    try {
      const sAtual = sessions.find(x => x.rowIndex === rowIndex);
      if (sAtual && sAtual.telefone) {
        enviarSmsResponsavel_(sAtual, 'portal').catch(() => {});
      }
    } catch (eSms) {}
  }

  broadcastInvalidate(); syncController(true, 500);
}

// ═══════════════════════════════════════════════════════════
// AUDIO
// ═══════════════════════════════════════════════════════════
function playBeep(n = 2) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    let t = ctx.currentTime;
    for (let i = 0; i < n; i++) {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type      = 'sine';
      osc.frequency.value = i === 0 ? 880 : 660;
      gain.gain.setValueAtTime(.4, t);
      gain.gain.exponentialRampToValueAtTime(.01, t + .3);
      osc.start(t); osc.stop(t + .3);
      t += .4;
    }
  } catch {}
}

// ═══════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function showNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '' });
  }
}

// ── ESTENDER LOCAÇÃO ────────────────────────────────────────
let estSession = null;
let estMins    = 0;

function abrirEstender(rowIndex, fromDrawer) {
  estSession = sessions.find(s => s.rowIndex === rowIndex);
  if (!estSession) return;
  estMins = 0;
  if (!fromDrawer) {
    abrirSessaoDrawer(rowIndex, 'estender');
    return;
  }

  const icon = tipoIcon(estSession.tipo);
  document.getElementById('est-info').innerHTML =
    '<div class="modal-info-row"><span>' + icon + ' ' + escHtml(estSession.veiculo || estSession.tipo) + '</span><span>' + estSession.plano + '</span></div>' +
    '<div class="modal-info-row"><span>Criança</span><span>' + escHtml(estSession.crianca) + '</span></div>' +
    '<div class="modal-info-row"><span>Tempo contratado</span><span>' + estSession.mins + ' min</span></div>';

  const rem = calcRemaining(estSession);
  const remFmt = rem <= 0 ? 'Esgotado' : fmtTime(rem) + ' restante';
  document.getElementById('est-info').innerHTML +=
    '<div class="modal-info-row"><span>Situação</span><span>' + remFmt + '</span></div>';

  // v1.6.27: opções são planos com preço real (novo contrato, não adicional/min)
  const tipo = estSession.tipo || estSession.veiculo?.split(' ')[0] || 'Carro';
  const tipoKey = Object.keys(PRECOS).find(k => tipo.includes(k)) || 'Carro';
  const finEst = mkExibirFinanceiro_();
  const planosDisp = Object.entries(PRECOS[tipoKey]).filter(([k,v]) => k !== '3h');
  const precoLbl = (v) => finEst ? `<div style="font-size:11px;opacity:.75">R$ ${v},00</div>` : '';
  document.getElementById('est-opts').innerHTML = planosDisp.map(([plano, cfg]) =>
    `<button class="est-opt-btn" onclick="selecionarEstender('${plano}',${cfg.m},${cfg.v})" id="est-opt-${plano}">
       <div style="font-size:13px;font-weight:700">+${cfg.m} min</div>
       ${precoLbl(cfg.v)}
     </button>`
  ).join('');
  document.getElementById('est-opts').innerHTML +=
    `<button class="est-opt-btn" onclick="selecionarEstender('3h',180,${PRECOS[tipoKey]['3h'].v})" id="est-opt-3h">
       <div style="font-size:13px;font-weight:700">+3h</div>
       ${precoLbl(PRECOS[tipoKey]['3h'].v)}
     </button>`;

}

let estPlano = '';   // plano selecionado para extensão ('10min', '20min'...)
let estValor = 0;    // valor em R$ do novo plano

function selecionarEstender(plano, mins, valor) {
  estPlano = plano;
  estMins  = mins;
  estValor = valor;
  document.querySelectorAll('.est-opt-btn').forEach(b => b.classList.remove('sel'));
  const btn = document.getElementById('est-opt-' + plano);
  if (btn) btn.classList.add('sel');
}

function fecharEstModal() {
  estSession = null;
  estMins    = 0;
  estPlano   = '';
  estValor   = 0;
  document.querySelectorAll('.est-opt-btn').forEach(b => b.classList.remove('sel'));
}

async function confirmarEstender() {
  if (!estSession) return;
  if (!estMins || !estPlano || !estValor) {
    toast('Selecione o plano a adicionar.', 'error'); return;
  }

  const btn = document.getElementById('btn-est-confirm');
  if (btn) { btn.disabled = true; btn.textContent = 'Salvando...'; }

  // Calcula extra acumulado ANTES da extensão (para mostrar no WA)
  const remAntes = calcRemaining(estSession);
  const extraAntes = remAntes < 0 ? Math.floor(Math.abs(remAntes) / 60) : 0;
  const debtAntes  = parseFloat((extraAntes * estSession.adicionalPorMin).toFixed(2));

  try {
    // Salva extensão no GAS (novo plano contratado)
    const d = await api({
      action:   'estenderLocacao',
      ...operadorApiParams_(),
      rowIndex: estSession.rowIndex,
      extMins:  estMins,
      extValor: estValor,
      extPlano: estPlano
    });

    if (!d.ok) { toast('Erro ao salvar extensão: ' + (d.erro||''), 'error'); return; }

    // Atualiza estado local com dados do servidor
    estSession.extendedMins  = d.extendedMins;
    estSession.extendedValor = d.extendedValor;
    estSession.mins          = d.totalMins;  // original + todas extensões

    // Zera alertas para disparar corretamente com o novo tempo
    estSession.alertFired5   = false;
    estSession.alertFiredExp = false;

    saveSessions();

    // Envia SMS com link do portal do responsavel
    waExtensao(estSession, estMins, estValor, estPlano, extraAntes, debtAntes);

    toast('+' + estMins + 'min adicionados! SMS solicitado.', 'success');

    broadcastInvalidate();
    syncController(true, 500);

  } catch(e) {
    toast('Erro ao estender: ' + e.message, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '⏱ Confirmar extensão'; }
    fecharSessaoDrawer();
    renderCards();
    const painelPage = document.getElementById('page-painel');
    if (painelPage && painelPage.classList.contains('active')) renderPainel();
  }
}
window.triggerAlert5 = triggerAlert5;
window.triggerAlertExpired = triggerAlertExpired;
window.showAlertModal = showAlertModal;
window.fecharAlerta = fecharAlerta;
window.abrirWhatsApp = abrirWhatsApp;
window.abrirWhatsAppCard = abrirWhatsAppCard;
window.enviarSmsResponsavel_ = enviarSmsResponsavel_;
window.renderOperacaoLocacaoForm_ = renderOperacaoLocacaoForm_;
window.abrirOperacaoLocacao = abrirOperacaoLocacao;
window.fecharOperacaoLocacao = fecharOperacaoLocacao;
window.salvarOperacaoLocacao = salvarOperacaoLocacao;
window.abrirWhatsAppFallback = abrirWhatsAppFallback;
window.carregarConfig = carregarConfig;
window.getMsgTemplate = getMsgTemplate;
window.encerrarDireto = encerrarDireto;
window.abrirModalBv = abrirModalBv;
window.enviarBvSomenteSms_ = enviarBvSomenteSms_;
window.iniciarContagemFromBv_ = iniciarContagemFromBv_;
window.fecharBvSemIniciar_ = fecharBvSemIniciar_;
window.iniciarContagem = iniciarContagem;
window.iniciarContagemDireto_ = iniciarContagemDireto_;
window.enviarSmsPendente_ = enviarSmsPendente_;
window.requestNotificationPermission = requestNotificationPermission;
window.abrirEstender = abrirEstender;
window.selecionarEstender = selecionarEstender;
window.confirmarEstender = confirmarEstender;
window.fecharEstModal = fecharEstModal;
window.playBeep = playBeep;
window.showNotification = showNotification;
window.waAgradecimento = waAgradecimento;
window.waMensagemRetorno = waMensagemRetorno;
window.MSG_DEF = MSG_DEF;