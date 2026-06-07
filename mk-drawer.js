/* MOVI KIDS — Drawer sessão + encerrar (Pacote M.7)
 * Zona P0: confirmarEncerrar → encerrarLocacao via GET (mk-api.js).
 */
let sessDrawerRow = null;
let sessDrawerTab = 'encerrar';
let sessDrawerEditTipo = 'editar';
let encSession = null;
// ═══════════════════════════════════════════════════════════
// DRAWER SESSÃO (Pacote D)
// ═══════════════════════════════════════════════════════════
function sessDrawerSession_() {
  if (sessDrawerRow == null) return null;
  return sessions.find(s => Number(s.rowIndex) === Number(sessDrawerRow)) || null;
}

function renderSessDrawerHead_(s) {
  const head = document.getElementById('sess-drawer-head');
  if (!head || !s) return;
  const icon = tipoIcon(s.tipo);
  const rem = s.started ? calcRemaining(s) : s.mins * 60;
  const tempo = s.started
    ? (rem <= 0 ? 'Extra ' + fmtTime(Math.abs(rem)) : fmtTime(rem) + ' restante')
    : fmtTime(s.mins * 60) + ' · aguardando início';
  head.innerHTML =
    '<div class="sess-drawer-head-title">' + icon + ' ' + escHtml(s.crianca) + '</div>' +
    '<div class="sess-drawer-head-meta">' + escHtml(s.veiculo || s.tipo) + ' · ' + escHtml(s.plano) + ' · ' + tempo + '</div>';
}

function renderSessDrawerTabs_(s) {
  const ativa = !!s.started;
  const canEdit = typeof mkAuthCanEditarLocacao_ === 'function' && mkAuthCanEditarLocacao_();
  document.querySelectorAll('.sess-drawer-tab').forEach(btn => {
    const tab = btn.getAttribute('data-tab');
    if ((tab === 'editar' || tab === 'cancelar') && !canEdit) {
      btn.style.display = 'none';
      btn.disabled = true;
      return;
    }
    btn.style.display = '';
    const disabled = !ativa && (tab === 'encerrar' || tab === 'estender');
    btn.disabled = disabled;
  });
}

function abrirSessaoDrawer(rowIndex, tab) {
  const s = sessions.find(x => Number(x.rowIndex) === Number(rowIndex));
  if (!s) return;
  let wantTab = tab || (s.started ? 'encerrar' : 'editar');
  const canEdit = typeof mkAuthCanEditarLocacao_ === 'function' && mkAuthCanEditarLocacao_();
  if (!canEdit && (wantTab === 'editar' || wantTab === 'cancelar')) {
    wantTab = s.started ? 'encerrar' : 'encerrar';
  }
  if (wantTab === 'encerrar' && s.started) {
    const rem = calcRemaining(s);
    const admIgnoraSms = typeof mkAdminIgnoraSmsObrigatorio_ === 'function' && mkAdminIgnoraSmsObrigatorio_();
    if (rem <= 0 && !extraWaFoiEnviado_(s) && !admIgnoraSms) {
      alertSession = s;
      showAlertModal(s, true);
      toast('Envie o aviso de minutos extras antes de encerrar.', 'error');
      return;
    }
  }
  sessDrawerRow = rowIndex;
  menuLocacaoAbertoKey = null;
  document.querySelectorAll('.sc-menu').forEach(m => m.classList.remove('show'));
  renderSessDrawerHead_(s);
  renderSessDrawerTabs_(s);
  sessDrawerSetTab(wantTab);
  const drawer = document.getElementById('sess-drawer');
  if (drawer) drawer.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function fecharSessaoDrawer() {
  const drawer = document.getElementById('sess-drawer');
  if (drawer) drawer.classList.remove('show');
  document.body.style.overflow = '';
  fecharEncModal();
  fecharEstModal();
  fecharOperacaoLocacao();
  sessDrawerRow = null;
}

function sessDrawerSetTab(tab) {
  const s = sessDrawerSession_();
  if (!s) return;
  if (!s.started && (tab === 'encerrar' || tab === 'estender')) tab = 'editar';
  sessDrawerTab = tab;
  document.querySelectorAll('.sess-drawer-tab').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
  });
  ['encerrar', 'estender', 'editar', 'cancelar'].forEach(t => {
    const panel = document.getElementById('sess-drawer-panel-' + t);
    if (panel) panel.hidden = t !== tab;
  });
  if (tab === 'encerrar') initSessDrawerEncerrar_(s);
  else if (tab === 'estender') initSessDrawerEstender_(s);
  else if (tab === 'editar') initSessDrawerEditar_(s, sessDrawerEditTipo);
  else if (tab === 'cancelar') initSessDrawerCancelar_(s);
}

function initSessDrawerEncerrar_(s) {
  encSession = s;
  const fin = resolverMinUsadosEncerrar_(s, false);
  encSession._minUsados = fin.minUsados;
  encSession._somentePlanoEnc = fin.somentePlano;
  renderEncerrarModal_(s, fin);
}

function initSessDrawerEstender_(s) {
  abrirEstender(s.rowIndex, true);
}

function initSessDrawerEditar_(s, subTipo) {
  const ativa = !!s.started;
  const menu = document.getElementById('sess-drawer-edit-menu');
  if (!menu) return;
  const chips = ativa
    ? [
        { id: 'editar', label: 'Dados' },
        { id: 'pagamento', label: 'Pagamento' },
        { id: 'veiculo', label: 'Veículo' },
        { id: 'observacao', label: 'Observação' }
      ]
    : [
        { id: 'editar', label: 'Cadastro' },
        { id: 'plano', label: 'Plano' },
        { id: 'pagamento', label: 'Pagamento' },
        { id: 'veiculo', label: 'Veículo' }
      ];
  const tipo = subTipo || 'editar';
  sessDrawerEditTipo = tipo;
  menu.innerHTML = chips.map(c =>
    '<button type="button" class="sess-drawer-edit-chip' + (c.id === tipo ? ' active' : '') +
    '" onclick="sessDrawerPickEdit(\'' + c.id + '\')">' + c.label + '</button>'
  ).join('');
  renderOperacaoLocacaoForm_(s.rowIndex, tipo, 'op-body');
  const save = document.getElementById('op-save');
  if (save) {
    save.className = 'btn btn-primary';
    save.textContent = 'Salvar alteração';
  }
}

function sessDrawerPickEdit(tipo) {
  sessDrawerEditTipo = tipo;
  const s = sessDrawerSession_();
  if (!s) return;
  initSessDrawerEditar_(s, tipo);
}

function initSessDrawerCancelar_(s) {
  renderOperacaoLocacaoForm_(s.rowIndex, 'cancelar', 'sess-drawer-cancel-body');
}

// ═══════════════════════════════════════════════════════════
// ENCERRAR
// ═══════════════════════════════════════════════════════════
function mkGasConsideradoOffline_() {
  return typeof _syncFailCount !== 'undefined' && _syncFailCount >= _FAIL_THRESH;
}

function calcMinExtraLocal_(session) {
  const elapsedSec = Math.floor((Date.now() - session.startTimestamp) / 1000);
  const contratSec = session.mins * 60;
  return Math.max(0, Math.floor((elapsedSec - contratSec) / 60));
}

/** Evita extras fantasmas quando GAS esta offline (incidente 04/06). */
function resolverMinUsadosEncerrar_(session, incluirExtraLocalAdm) {
  const minExtraTimer = calcMinExtraLocal_(session);
  const offline = mkGasConsideradoOffline_();
  const adm = typeof mkAdminIgnoraSmsObrigatorio_ === 'function' && mkAdminIgnoraSmsObrigatorio_();
  let minUsados = session.mins + minExtraTimer;
  let somentePlano = false;
  if (offline && minExtraTimer > 0 && !(adm && incluirExtraLocalAdm)) {
    minUsados = session.mins;
    somentePlano = true;
  }
  const minExtraCobrados = Math.max(0, minUsados - session.mins);
  const vBase = PRECOS[session.tipo]?.[session.plano]?.v || session.valorPlano;
  const vExtra = minExtraCobrados * adicionalPorMinSessao_(session);
  const vTotal = vBase + vExtra;
  return { minUsados, minExtraTimer, minExtraCobrados, vBase, vExtra, vTotal, somentePlano, offline, adm };
}

function renderEncerrarModal_(session, fin) {
  const icon = tipoIcon(session.tipo);
  const exibirFin = mkExibirFinanceiro_();
  const vExtraStr = fin.vExtra.toFixed(2).replace('.', ',');
  const vTotalStr = fin.vTotal.toFixed(2).replace('.', ',');
  let html =
    '<div class="modal-info-row"><span>' + icon + ' Tipo</span><span>' + escHtml(session.tipo) + '</span></div>' +
    '<div class="modal-info-row"><span>Plano</span><span>' + escHtml(session.plano) + '</span></div>' +
    '<div class="modal-info-row"><span>Criança</span><span>' + escHtml(session.crianca) + '</span></div>' +
    '<div class="modal-info-row"><span>Responsável</span><span>' + escHtml(session.responsavel) + '</span></div>' +
    '<div class="modal-info-row"><span>Tempo utilizado</span><span>' + fin.minUsados + ' min</span></div>';
  if (fin.minExtraCobrados > 0) {
    html += '<div class="modal-info-row"><span>Min. adicionais</span><span>' + fin.minExtraCobrados + ' min</span></div>';
    if (exibirFin) html += '<div class="modal-info-row"><span>Valor adicional</span><span>R$ ' + vExtraStr + '</span></div>';
  } else if (fin.minExtraTimer > 0 && fin.somentePlano) {
    html += '<div class="modal-info-row"><span>Cronômetro local</span><span>' + fin.minExtraTimer + ' min extra (não cobrados)</span></div>';
  }
  if (exibirFin) {
    html += '<div class="modal-info-row total"><span>TOTAL A COBRAR</span><span>R$ ' + vTotalStr + '</span></div>';
  }
  document.getElementById('enc-info').innerHTML = html;

  const warn = document.getElementById('enc-offline-warn');
  const admWrap = document.getElementById('enc-adm-extra-wrap');
  const admChk = document.getElementById('enc-adm-extra-local');
  if (warn) {
    if (fin.somentePlano) {
      warn.style.display = 'block';
      warn.textContent = 'Servidor offline ou instável: encerramento apenas pelo valor do plano, sem extras do cronômetro. Ajuste depois em Administração se necessário.';
    } else {
      warn.style.display = 'none';
      warn.textContent = '';
    }
  }
  if (admWrap && admChk) {
    if (fin.offline && fin.adm && fin.minExtraTimer > 0) {
      admWrap.style.display = 'flex';
      admChk.checked = !!session._incluirExtraLocalAdm;
      admChk.onchange = function() {
        session._incluirExtraLocalAdm = admChk.checked;
        const f2 = resolverMinUsadosEncerrar_(session, admChk.checked);
        session._minUsados = f2.minUsados;
        session._somentePlanoEnc = f2.somentePlano;
        renderEncerrarModal_(session, f2);
      };
    } else {
      admWrap.style.display = 'none';
      admChk.checked = false;
    }
  }
}

function pedirEncerrar(rowIndex) {
  abrirSessaoDrawer(rowIndex, 'encerrar');
}

function fecharEncModal() {
  const w = document.getElementById('enc-offline-warn');
  const wrap = document.getElementById('enc-adm-extra-wrap');
  const chk = document.getElementById('enc-adm-extra-local');
  if (w) { w.style.display = 'none'; w.textContent = ''; }
  if (wrap) wrap.style.display = 'none';
  if (chk) chk.checked = false;
  encSession = null;
}

async function confirmarEncerrar() {
  if (!encSession) return;
  const btn = document.getElementById('btn-enc-confirm');
  btn.textContent = '⏳ Encerrando...'; btn.disabled = true;

  try {
    const admChk = document.getElementById('enc-adm-extra-local');
    const incluirExtraAdm = !!(admChk && admChk.checked);
    const fin = resolverMinUsadosEncerrar_(encSession, incluirExtraAdm);
    encSession._minUsados = fin.minUsados;
    encSession._somentePlanoEnc = fin.somentePlano;

    if (mkGasConsideradoOffline_()) {
      try {
        await api({ action: 'ping' }, 8000);
        _syncFailCount = 0;
        setStatus(true);
      } catch (ePing) {
        if (!fin.somentePlano && fin.minExtraTimer > 0) {
          toast('Servidor offline. Encerre apenas pelo plano ou restaure o GAS.', 'error');
          return;
        }
      }
    }

    const admEnc = typeof mkAdminIgnoraSmsObrigatorio_ === 'function' && mkAdminIgnoraSmsObrigatorio_();
    const d = await api({
      action:    'encerrarLocacao',
      ...operadorApiParams_(),
      ...(admEnc ? { ignorarSmsObrigatorio: true } : {}),
      ...(fin.somentePlano ? { somentePlano: true } : {}),
      rowIndex:  encSession.rowIndex,
      minUsados: encSession._minUsados
    });

    if (!d.ok) { toast('Erro: ' + d.erro, 'error'); return; }

    // Remove from local sessions
    sessions = sessions.filter(s => s.rowIndex !== encSession.rowIndex);
    saveSessions();

    if (mkExibirFinanceiro_() && d.valorTotal != null) {
      const vT = Number(d.valorTotal).toFixed(2).replace('.',',');
      toast(`✅ Encerrado! Total: R$ ${vT}`, 'success');
      statsHoje.fat += Number(d.valorTotal);
    } else {
      toast('✅ Locação encerrada!', 'success');
    }

    statsHoje.n++;

    fecharSessaoDrawer();
    fecharAlerta();
    // Invalida cache para outros dispositivos verem encerramento imediatamente
    try { localStorage.removeItem('mk_inicio_cache'); } catch(e) {}

    // Atualiza encHoje localmente SEM esperar servidor (UX imediato)
    const agora = new Date();
    const hh = String(agora.getHours()).padStart(2,'0');
    const mm2 = String(agora.getMinutes()).padStart(2,'0');
    encHojeData.push({
      id:          d.id || encSession.id,
      tipo:        d.tipo,
      plano:       d.plano,
      veiculo:     d.veiculo || encSession.veiculo || '',
      crianca:     d.crianca,
      responsavel: d.responsavel,
      horaInicio:  d.horaInicio,
      horaFim:     hh + ':' + mm2,
      valorTotal:  d.valorTotal
    });
    renderEncHoje(encHojeData);
    renderCards();
    updateStats();
    atualizarVeiculoGrid();

    // SMS automático de agradecimento (v1.7.0) — fire-and-forget
    try {
      const encDados = {
        rowIndex:    encSession.rowIndex,
        telefone:    d.telefone || encSession.telefone || '',
        responsavel: d.responsavel || encSession.responsavel || '',
        crianca:     d.crianca    || encSession.crianca    || '',
      };
      if (encDados.telefone) {
        enviarSmsResponsavel_(
          { ...encSession, ...encDados },
          'agradecimento'
        ).catch(() => {});
      }
    } catch(eSmsEnc) {}

    // Sync via controller (deduplicado)
    broadcastInvalidate(); syncController(true, 1500);

  } catch(e) {
    toast('Erro de conexão.', 'error');
  } finally {
    btn.textContent = '✓ Confirmar encerramento'; btn.disabled = false;
  }
}

window.abrirSessaoDrawer = abrirSessaoDrawer;
window.fecharSessaoDrawer = fecharSessaoDrawer;
window.sessDrawerSetTab = sessDrawerSetTab;
window.confirmarEncerrar = confirmarEncerrar;
window.sessDrawerPickEdit = sessDrawerPickEdit;
window.pedirEncerrar = pedirEncerrar;

