/* MOVI KIDS — Nova locação (Pacote M.6)
 * Zona P0: confirmarLocacao → salvarLocacao via GET (api/mk-api.js).
 * I97: multi-veículo no próprio cadastro (cesta + resumo + N cards).
 */
let novaState = {
  tipo: null, plano: null, veiculo: null,
  itens: [],
  pagamento: null, observacao: '', step: 0,
  subModo: 'pick'
};
let novaPrefillResponsavel = null;
const NOVA_DRAFT_KEY = 'mk_nova_locacao_draft_v1';
let _restoringNovaDraft = false;
const NOVA_MAX_STEP = 2;
let _novaRelSearchTimer = null;
let _novaSavingInFlight = false;
let _novaSaveWatchdog = null;
let _novaSaveDismissTimer = null;
let _novaSaveGen = 0;
let _novaDraftTimer = null;
let _vcGridRaf = null;
const NOVA_DRAFT_DEBOUNCE_MS = 350;
const NOVA_SAVE_TIMEOUT_1_MS = 32000;
const NOVA_SAVE_TIMEOUT_N_MS = 28000;
/** I143 — evita retry que duplica locação quando GAS ainda está gravando. */
let _novaLastSaveFp_ = '';
let _novaLastSaveAt_ = 0;
const NOVA_SAVE_DEDUP_MS = 90000;

function novaSaveFingerprint_(tel, itens) {
  const veis = (itens || []).map(function (it) { return String(it.veiculo || ''); }).filter(Boolean).sort();
  return String(tel || '') + '|' + veis.join(',');
}
var relacionamentoCache = [];

function novaPageEl_() {
  return document.getElementById('page-nova');
}

/** Sem scroll agressivo — evita “pulo” pro topo do tablet. */
function novaScrollSuave_(el) {
  if (!el) return;
  try { el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' }); } catch (e) {}
}

function novaCfgPlano_(tipo, plano) {
  return (PRECOS[tipo] && PRECOS[tipo][plano]) ? PRECOS[tipo][plano] : null;
}

function novaVeiculoNaCesta_(veiculo) {
  return (novaState.itens || []).some(function(it) { return it.veiculo === veiculo; });
}

function novaItensParaSalvar_() {
  if (novaState.itens && novaState.itens.length) return novaState.itens.slice();
  if (novaState.veiculo && novaState.tipo && novaState.plano) {
    return [{ veiculo: novaState.veiculo, tipo: novaState.tipo, plano: novaState.plano }];
  }
  return [];
}

function novaTotalPlanos_(itens) {
  let t = 0;
  (itens || []).forEach(function(it) {
    const cfg = novaCfgPlano_(it.tipo, it.plano);
    if (cfg) t += Number(cfg.v) || 0;
  });
  return t;
}

function novaLimparSelecaoAtual_() {
  novaState.veiculo = null;
  novaState.tipo = null;
  novaState.plano = null;
  document.querySelectorAll('.plano-btn').forEach(function(b) { b.classList.remove('sel'); });
  document.querySelectorAll('.vc-card').forEach(function(c) { c.classList.remove('vc-sel', 'vc-sel-pink'); });
  const sec = document.getElementById('nova-plano-section');
  if (sec) sec.classList.remove('visible');
  const pageNova = document.getElementById('page-nova');
  if (pageNova) pageNova.classList.remove('step-0-veiculo');
  document.querySelectorAll('#page-nova .vc-section-label').forEach(function(l) {
    l.style.display = '';
    l.classList.remove('nova-vc-outro');
  });
  ['vc-grid-carros', 'vc-grid-triciclos', 'vc-grid-pelucias'].forEach(function(id) {
    const g = document.getElementById(id);
    if (g) g.style.display = '';
  });
}

function incluirItemNova_() {
  if (!novaState.veiculo || !novaState.tipo || !novaState.plano) {
    toast('Selecione veículo e plano.', 'error');
    return false;
  }
  if (novaVeiculoNaCesta_(novaState.veiculo)) {
    toast(novaState.veiculo + ' já está nesta locação.', 'warning');
    return false;
  }
  if (!novaCfgPlano_(novaState.tipo, novaState.plano)) {
    toast('Plano inválido.', 'error');
    return false;
  }
  novaState.itens.push({
    veiculo: novaState.veiculo,
    tipo: novaState.tipo,
    plano: novaState.plano
  });
  novaLimparSelecaoAtual_();
  novaState.subModo = 'cesta';
  renderNovaItensBasket_();
  atualizarNovaSummaryBar_();
  salvarNovaDraft_();
  novaAtualizarSubModoUI_();
  return true;
}

function novaAtualizarSubModoUI_() {
  const n = (novaState.itens || []).length;
  if (n === 0) novaState.subModo = 'pick';
  const pick = novaState.subModo === 'pick';

  const pickPanel = document.getElementById('nova-pick-panel');
  const cestaPanel = document.getElementById('nova-cesta-panel');
  const title = document.getElementById('nova-step0-title');
  const btnVoltar = document.getElementById('btn-nova-voltar-cesta');
  const pickLead = document.getElementById('nova-pick-lead');

  if (pickPanel) pickPanel.hidden = !pick;
  if (cestaPanel) cestaPanel.hidden = pick;
  if (title) {
    title.textContent = pick
      ? (n > 0 ? 'O quê — próximo veículo' : 'O quê — escolha o veículo')
      : 'O quê — sua locação';
  }
  if (btnVoltar) btnVoltar.hidden = !(pick && n > 0);
  if (pickLead) {
    pickLead.textContent = n > 0
      ? 'Toque em um veículo livre abaixo e escolha o plano.'
      : 'Toque no veículo livre, depois no plano.';
  }
  novaMarcarCestaGrid_();
}

function novaIniciarPick_() {
  if (novaGuardSaveBusy_()) return;
  novaState.subModo = 'pick';
  novaLimparSelecaoAtual_();
  novaAtualizarSubModoUI_();
  if (typeof atualizarVeiculoGrid === 'function') atualizarVeiculoGrid();
}

function novaVoltarCesta_() {
  if (novaGuardSaveBusy_()) return;
  if (!(novaState.itens || []).length) return;
  novaState.subModo = 'cesta';
  novaLimparSelecaoAtual_();
  novaAtualizarSubModoUI_();
}

function novaHideSaving_() {
  const o = document.getElementById('nova-saving-overlay');
  if (o) {
    o.hidden = true;
    o.setAttribute('aria-hidden', 'true');
    o.style.display = 'none';
  }
  const dismiss = document.getElementById('nova-saving-dismiss');
  if (dismiss) dismiss.hidden = true;
  if (_novaSaveWatchdog) { clearTimeout(_novaSaveWatchdog); _novaSaveWatchdog = null; }
  if (_novaSaveDismissTimer) { clearTimeout(_novaSaveDismissTimer); _novaSaveDismissTimer = null; }
}

function novaForceUnstickSave_(msg) {
  _novaSaveGen++;
  novaSetSavingBusy_(false);
  novaHideSaving_();
  // I143: NÃO limpar otimistas nem pedir "salvar de novo" — isso gerava duplicata
  if (typeof mkRefreshHomeUI_ === 'function') mkRefreshHomeUI_();
  if (typeof showPage === 'function') showPage('home');
  setTimeout(function() {
    if (typeof syncController === 'function') syncController(false, 2000);
  }, 400);
  toast(msg || 'Ainda sincronizando. Não salve de novo — confira os cards na Home.', 'warning');
}

async function mkGasTemSalvarLocacoesMulti_() {
  return window._mkGasBatchOk === true;
}

function mkWarmGasBatchFlag_() {
  if (typeof window._mkGasBatchOk === 'boolean') return;
  window._mkGasBatchOk = false;
  if (typeof api !== 'function') return;
  setTimeout(function() {
    if (typeof window._mkGasBatchOk === 'boolean' && window._mkGasBatchOk !== false) return;
    api({ action: 'ping' }, 8000).then(function(p) {
      window._mkGasBatchOk = !!(p && Array.isArray(p.postWriteActions) && p.postWriteActions.indexOf('salvarLocacoesMulti') >= 0);
    }).catch(function() { window._mkGasBatchOk = false; });
  }, 6000);
}

async function novaSalvarLoopSequencial_(itens, basePayload, observacao, saveGen) {
  const n = itens.length;
  let ultimaMesmaConta = false;
  for (let i = 0; i < n; i++) {
    novaShowSaving_(i, n, itens[i].veiculo);
    const r = await novaSalvarItemSequencial_(itens[i], basePayload, observacao, i === 0 ? NOVA_SAVE_TIMEOUT_1_MS : NOVA_SAVE_TIMEOUT_N_MS);
    if (saveGen !== _novaSaveGen) return null;
    ultimaMesmaConta = !!r.mesmaConta;
    novaRefreshAposItemSalvo_(i);
  }
  return { ultimaMesmaConta: ultimaMesmaConta, salvos: n };
}

function novaShowSaving_(i, n, veiculo, modo) {
  const o = document.getElementById('nova-saving-overlay');
  const t = document.getElementById('nova-saving-title');
  const s = document.getElementById('nova-saving-sub');
  const dismiss = document.getElementById('nova-saving-dismiss');
  if (o) {
    o.hidden = false;
    o.removeAttribute('aria-hidden');
    o.style.display = 'flex';
  }
  if (dismiss) dismiss.hidden = true;
  if (t) {
    if (modo === 'batch' && n > 1) t.textContent = 'Salvando ' + n + ' veículos…';
    else t.textContent = n > 1 ? ('Salvando ' + (i + 1) + ' de ' + n + '…') : 'Salvando locação…';
  }
  if (s) {
    if (modo === 'batch') s.textContent = 'Uma operação na planilha (~15s).';
    else if (n > 1) s.textContent = 'Veículo ' + (i + 1) + ' de ' + n + ' — ~15s cada.';
    else s.textContent = 'Registrando na planilha. Aguarde.';
  }
  if (_novaSaveWatchdog) clearTimeout(_novaSaveWatchdog);
  _novaSaveWatchdog = setTimeout(function() {
    if (_novaSavingInFlight) novaForceUnstickSave_('Demorou demais. Home liberada — NÃO salve de novo; aguarde o card aparecer.');
  }, 42000);
  if (_novaSaveDismissTimer) clearTimeout(_novaSaveDismissTimer);
  _novaSaveDismissTimer = setTimeout(function() {
    if (dismiss && _novaSavingInFlight) dismiss.hidden = false;
  }, 14000);
}

function novaGuardSaveBusy_() {
  if (_novaSavingInFlight) {
    toast('Aguarde — salvando na planilha.', 'info');
    return true;
  }
  return false;
}

function novaMarcarCestaGrid_() {
  const naCesta = {};
  (novaState.itens || []).forEach(function(it) { naCesta[it.veiculo] = true; });
  const pick = novaState.subModo === 'pick';
  document.querySelectorAll('#nova-pick-panel .vc-card').forEach(function(card) {
    const id = card.id || '';
    if (!id.startsWith('vc-')) return;
    const nome = id.slice(3);
    const busy = card.classList.contains('vc-busy') || card.classList.contains('vc-busy-pink');
    const stEl = document.getElementById('vc-st-' + nome);
    card.classList.remove('vc-basket', 'vc-sel', 'vc-sel-pink');
    if (pick && naCesta[nome]) {
      card.style.display = 'none';
      return;
    }
    card.style.display = '';
    if (busy) return;
    card.style.pointerEvents = '';
    if (stEl && !busy) {
      stEl.className = 'vc-status livre';
      stEl.textContent = '✓ Livre';
    }
  });
}

function removerItemNova_(idx) {
  if (!novaState.itens || idx < 0 || idx >= novaState.itens.length) return;
  novaState.itens.splice(idx, 1);
  if (!novaState.itens.length) novaState.subModo = 'pick';
  renderNovaItensBasket_();
  atualizarNovaSummaryBar_();
  salvarNovaDraft_();
  novaAtualizarSubModoUI_();
}

function novaAddOutroVeiculo_() { novaIniciarPick_(); }

function novaHtmlItemRow_(it, idx, opts) {
  const cfg = novaCfgPlano_(it.tipo, it.plano);
  const planoLbl = PLANO_LABELS[it.plano] || it.plano;
  const fin = mkExibirFinanceiro_();
  const val = cfg && fin ? ('R$ ' + String(cfg.v).replace('.', ',')) : '';
  const rm = (opts && opts.removable && idx != null)
    ? ('<button type="button" class="nova-cesta-row-rm" onclick="removerItemNova_(' + idx + ')" aria-label="Remover">✕</button>')
    : '';
  return '<div class="nova-cesta-row">' +
    '<div class="nova-cesta-row-main">' +
    '<span class="nova-cesta-row-title">' + escHtml(tipoIcon(it.tipo) + ' ' + it.veiculo) + '</span>' +
    '<span class="nova-cesta-row-sub">' + escHtml(planoLbl + (val ? ' · ' + val : '')) + '</span>' +
    '</div>' + rm + '</div>';
}

function renderNovaItensBasket_() {
  const list = document.getElementById('nova-itens-list');
  const totalEl = document.getElementById('nova-itens-total');
  const countEl = document.getElementById('nova-cesta-count');
  const n = (novaState.itens || []).length;
  if (countEl) countEl.textContent = n ? (n + (n > 1 ? ' veículos' : ' veículo')) : '';
  if (!list) return;
  if (!n) {
    list.innerHTML = '';
    if (totalEl) totalEl.textContent = '';
    novaAtualizarSubModoUI_();
    return;
  }
  const fin = mkExibirFinanceiro_();
  list.innerHTML = novaState.itens.map(function(it, i) {
    return novaHtmlItemRow_(it, i, { removable: true });
  }).join('');
  if (totalEl && fin) {
    const tot = novaTotalPlanos_(novaState.itens);
    totalEl.textContent = 'Total dos planos: R$ ' + tot.toFixed(2).replace('.', ',');
  } else if (totalEl) {
    totalEl.textContent = n + ' veículo' + (n > 1 ? 's' : '') + ' · 1 pagamento';
  }
  novaAtualizarSubModoUI_();
}

function renderNovaResumoFechar_() {
  const box = document.getElementById('nova-resumo-fechar');
  const list = document.getElementById('nova-resumo-list');
  const totalEl = document.getElementById('nova-resumo-total');
  const badge = document.getElementById('nova-resumo-badge');
  const hint = document.getElementById('nova-resumo-hint');
  const itens = novaItensParaSalvar_();
  if (!box || !list) return;
  if (!itens.length) {
    box.hidden = true;
    return;
  }
  box.hidden = false;
  const fin = mkExibirFinanceiro_();
  const n = itens.length;
  if (badge) badge.textContent = n > 1 ? (n + ' veículos · mesma conta') : 'Resumo da locação';
  list.innerHTML = itens.map(function(it) { return novaHtmlItemRow_(it, null, { removable: false }); }).join('');
  if (totalEl && fin) {
    totalEl.textContent = 'R$ ' + novaTotalPlanos_(itens).toFixed(2).replace('.', ',');
  } else if (totalEl) {
    totalEl.textContent = n + ' veículo' + (n > 1 ? 's' : '');
  }
  if (hint) {
    hint.textContent = n > 1
      ? ('1 cobrança na maquininha · ' + n + ' cards na Home (▶ em cada um)')
      : '1 cobrança · 1 card na Home';
  }
  novaAtualizarPosConfirm_();
}

function novaDraftCampos_() {
  const val = id => {
    const el = document.getElementById(id);
    return el ? el.value : '';
  };
  return {
    responsavel: val('inp-resp'),
    crianca: val('inp-cri'),
    telefone: val('inp-tel'),
    observacao: val('inp-obs')
  };
}

function hasNovaDraft_() {
  try { return !!localStorage.getItem(NOVA_DRAFT_KEY); } catch(e) { return false; }
}

function isNovaDirty_() {
  const c = novaDraftCampos_();
  return !!(
    (novaState.itens && novaState.itens.length) ||
    novaState.tipo || novaState.plano || novaState.veiculo || novaState.pagamento ||
    c.responsavel.trim() || c.crianca.trim() || c.telefone.trim() || c.observacao.trim()
  );
}

function salvarNovaDraftNow_() {
  if (_restoringNovaDraft) return;
  if (!isNovaDirty_()) return;
  const c = novaDraftCampos_();
  const draft = {
    state: Object.assign({}, novaState, { observacao: c.observacao }),
    campos: c,
    updatedAt: Date.now()
  };
  try { localStorage.setItem(NOVA_DRAFT_KEY, JSON.stringify(draft)); } catch(e) {}
}

function salvarNovaDraft_() {
  if (_novaDraftTimer) clearTimeout(_novaDraftTimer);
  _novaDraftTimer = setTimeout(function() {
    _novaDraftTimer = null;
    salvarNovaDraftNow_();
  }, NOVA_DRAFT_DEBOUNCE_MS);
}

function salvarNovaDraftFlush_() {
  if (_novaDraftTimer) { clearTimeout(_novaDraftTimer); _novaDraftTimer = null; }
  salvarNovaDraftNow_();
}

function limparNovaDraft_() {
  try { localStorage.removeItem(NOVA_DRAFT_KEY); } catch(e) {}
}

function migrateDraftStep_(step) {
  const s = Number(step) || 0;
  if (s >= 3) return 2;
  if (s === 2) return 1;
  if (s === 1) return 0;
  return s;
}

function aplicarStepNova_(step) {
  const prevStep = novaState.step;
  const safeStep = Math.max(0, Math.min(Number(step) || 0, NOVA_MAX_STEP));
  document.querySelectorAll('#page-nova .step-page').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('#page-nova .step-dot').forEach(d => d.classList.remove('active'));
  document.querySelectorAll('.nova-step-hints span').forEach(h => h.classList.remove('active'));
  const pg = document.getElementById('step-' + safeStep);
  const dot = document.getElementById('dot-' + safeStep);
  const hint = document.getElementById('nova-hint-' + safeStep);
  if (pg) pg.classList.add('active');
  if (dot) dot.classList.add('active');
  if (hint) hint.classList.add('active');
  novaState.step = safeStep;
  const planoSec = document.getElementById('nova-plano-section');
  if (planoSec) planoSec.classList.toggle('visible', !!(novaState.veiculo && novaState.tipo));
  if (safeStep === 1) {
    aplicarPrefillResponsavel_();
    setTimeout(function() {
      const q = document.getElementById('nova-rel-q');
      if (q) try { q.focus({ preventScroll: true }); } catch (e) { q.focus(); }
    }, 80);
  }
  if (safeStep === 2) {
    toggleBotoesConfirmarNova_();
    renderNovaResumoFechar_();
  }
  renderNovaItensBasket_();
  atualizarNovaSummaryBar_();
}

function atualizarNovaSummaryBar_() {
  const bar = document.getElementById('nova-summary-bar');
  if (!bar) return;
  const parts = [];
  const itens = novaState.itens || [];
  const fin = mkExibirFinanceiro_();
  if (itens.length > 1) {
    parts.push(itens.length + ' veículos');
    if (fin) parts.push('R$ ' + novaTotalPlanos_(itens).toFixed(2).replace('.', ','));
  } else if (itens.length === 1) {
    const it = itens[0];
    const cfg = novaCfgPlano_(it.tipo, it.plano);
    parts.push(tipoIcon(it.tipo) + ' ' + it.veiculo);
    parts.push(PLANO_LABELS[it.plano] || it.plano);
    if (cfg && fin) parts.push('R$ ' + cfg.v);
  } else {
    const { tipo, plano, veiculo } = novaState;
    if (veiculo || tipo) parts.push(tipoIcon(tipo || '') + ' ' + (veiculo || tipo || '—'));
    if (plano && tipo && PRECOS[tipo] && PRECOS[tipo][plano]) {
      parts.push(PLANO_LABELS[plano] || plano);
      if (mkExibirFinanceiro_()) parts.push('R$ ' + PRECOS[tipo][plano].v);
    } else if (veiculo && tipo) {
      parts.push('escolha o plano');
    }
  }
  const c = novaDraftCampos_();
  if (c.responsavel) parts.push(c.responsavel + ' / ' + (c.crianca || '—'));
  if (!parts.length) {
    bar.classList.remove('visible');
    bar.innerHTML = '';
    return;
  }
  bar.innerHTML = '<b>Resumo:</b> ' + escHtml(parts.join(' · '));
  bar.classList.add('visible');
}

function toggleBotoesConfirmarNova_() {
  const ok = !!novaState.pagamento;
  const n = novaItensParaSalvar_().length;
  const b1 = document.getElementById('btn-confirmar');
  const b2 = document.getElementById('btn-confirmar-iniciar');
  const hint = document.getElementById('nova-fechar-hint');
  const lbl = n > 1 ? ('Salvar ' + n + ' locações') : 'Só salvar cadastro (sem SMS agora)';
  if (b1) {
    b1.style.display = ok ? 'block' : 'none';
    if (ok && n > 1) b1.textContent = lbl;
  }
  if (b2) b2.style.display = 'none';
  if (hint) {
    hint.style.display = ok ? 'block' : 'none';
    if (ok) {
      hint.textContent = n > 1
        ? ('Serão ' + n + ' cards na Home — ▶ Iniciar em cada um. 1 cobrança na maquininha.')
        : 'O cronômetro só começa após ▶ Iniciar na Home. Comunicação: QR do portal na mesa.';
    }
  }
}

function upsertSessaoPendenteLocal_(payload) {
  const row = Number(payload && payload.rowIndex || 0);
  const id = Number(payload && payload.id || 0);
  const idx = sessions.findIndex(function(s) {
    return (row && Number(s.rowIndex) === row) || (id && Number(s.id) === id);
  });
  const merged = Object.assign({}, payload, { _savedAt: Date.now() });
  if (idx >= 0) sessions[idx] = Object.assign({}, sessions[idx], merged);
  else sessions.push(merged);
}

/** I91 — Home imediata após salvar/▶ (não esperar carregarInicio). */
function mkRefreshHomeUI_() {
  if (typeof renderCards === 'function') renderCards();
  if (typeof updateStats === 'function') updateStats();
  if (typeof atualizarVeiculoGrid === 'function') atualizarVeiculoGrid();
}

function rowIndexFromSalvar_(d) {
  const ri = Number(d && d.rowIndex);
  if (ri >= 11) return ri;
  return 11 + Number(d && d.id || 0);
}

function aplicarPrefillResponsavel_() {
  if (!novaPrefillResponsavel) return;
  const setIfEmpty = (id, value) => {
    const el = document.getElementById(id);
    if (el && !String(el.value || '').trim() && value) el.value = value;
  };
  const criancas = Array.isArray(novaPrefillResponsavel.criancas) ? novaPrefillResponsavel.criancas : [];
  setIfEmpty('inp-resp', novaPrefillResponsavel.responsavel || '');
  setIfEmpty('inp-tel', novaPrefillResponsavel.telefone || '');
  setIfEmpty('inp-cri', criancas[0] || '');
  atualizarNovaSummaryBar_();
  salvarNovaDraft_();
}

function renderPlanosNova_(tipo) {
  const container = document.getElementById('plano-list');
  if (!container || !tipo || !PRECOS[tipo]) return;
  const fin = mkExibirFinanceiro_();
  container.innerHTML = Object.entries(PRECOS[tipo]).map(([k,v]) => {
    const badgeCls = tipo === 'Pelúcia' ? 'pelucia' : '';
    const detExtra = fin ? (' · R$ ' + String(v.a).replace('.',',') + '/min extra') : '';
    const valCol = fin ? `<div class="pb-val">R$ ${v.v}</div>` : '';
    return `<div class="plano-btn ${badgeCls}" onclick="selectPlano('${k}',this)">
      <div>
        <div class="pb-nome">${PLANO_LABELS[k]}</div>
        <div class="pb-det">${v.m} min${detExtra}</div>
      </div>
      ${valCol}
    </div>`;
  }).join('');
}

function aplicarEstiloInputsNova_(tipo) {
  const cls2 = tipo === 'Pelúcia' ? 'pink' : '';
  ['inp-resp','inp-cri','inp-tel'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = 'form-input ' + cls2;
  });
}

function novaRelSearchInput_() {
  const q = document.getElementById('nova-rel-q')?.value.trim() || '';
  if (_novaRelSearchTimer) clearTimeout(_novaRelSearchTimer);
  if (q.length < 2) {
    const box = document.getElementById('nova-rel-results');
    if (box) { box.innerHTML = ''; box.classList.remove('has-items'); }
    return;
  }
  _novaRelSearchTimer = setTimeout(() => novaBuscarRelacionamento_({ silentEmpty: true }), 450);
}

function novaRelPickList_(responsaveis) {
  const picks = [];
  (responsaveis || []).forEach((r, idx) => {
    const kids = Array.isArray(r.criancas) && r.criancas.length ? r.criancas : [''];
    kids.forEach((kid, kidIdx) => {
      picks.push({ idx, kidIdx, kid: kid || '', r });
    });
  });
  return picks;
}

async function novaBuscarRelacionamento_(opts) {
  const silentEmpty = !!(opts && opts.silentEmpty);
  const q = document.getElementById('nova-rel-q')?.value.trim() || '';
  const box = document.getElementById('nova-rel-results');
  const btn = document.getElementById('nova-rel-btn');
  if (!box) return;
  if (!q || q.length < 2) {
    if (!silentEmpty) toast('Digite pelo menos 2 caracteres (nome ou telefone).', 'warning');
    return;
  }
  if (_novaRelSearchTimer) { clearTimeout(_novaRelSearchTimer); _novaRelSearchTimer = null; }
  box.classList.remove('has-items');
  box.innerHTML = '<div class="skeleton"></div>';
  if (btn) { btn.disabled = true; btn.textContent = '…'; }
  try {
    const res = await api({ action: 'listarResponsaveis', q, limite: 12 }, 20000);
    if (!res.ok || !(res.responsaveis || []).length) {
      box.innerHTML = '<div style="font-size:12px;color:var(--txt3);padding:8px 2px">Nenhum cadastro encontrado. Preencha o formulário manualmente.</div>';
      box.classList.add('has-items');
      return;
    }
    relacionamentoCache = res.responsaveis;
    const picks = novaRelPickList_(res.responsaveis);
    if (picks.length === 1) {
      novaAplicarRelacionamento_(picks[0].idx, picks[0].kidIdx);
      return;
    }
    box.innerHTML = '<div class="nova-rel-hint">Toque no cadastro para preencher o formulário abaixo:</div>';
    picks.forEach(p => {
      const btnPick = document.createElement('button');
      btnPick.type = 'button';
      btnPick.className = 'nova-rel-item';
      const kidLabel = p.kid ? escHtml(p.kid) : '—';
      btnPick.innerHTML =
        '<span><b>' + escHtml(p.r.responsavel || '') + '</b><br><span style="font-size:11px;color:var(--txt3)">Criança: ' +
        kidLabel + '</span></span>' +
        '<span style="font-size:11px;color:var(--txt3);text-align:right">' + escHtml(relPhone_(p.r.telefone)) + '</span>';
      btnPick.addEventListener('click', () => novaAplicarRelacionamento_(p.idx, p.kidIdx));
      box.appendChild(btnPick);
    });
    box.classList.add('has-items');
  } catch (e) {
    box.innerHTML = '<div style="font-size:12px;color:var(--red);padding:8px 2px">Falha na busca. Verifique a conexão e tente de novo.</div>';
    box.classList.add('has-items');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Buscar'; }
  }
}

function novaAplicarRelacionamento_(idx, kidIdx) {
  const r = relacionamentoCache && relacionamentoCache[idx];
  if (!r) return;
  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
  };
  const criancas = Array.isArray(r.criancas) ? r.criancas : [];
  const ki = Number(kidIdx) || 0;
  set('inp-resp', r.responsavel || '');
  set('inp-tel', r.telefone || '');
  set('inp-cri', criancas[ki] || criancas[0] || '');
  novaPrefillResponsavel = null;
  const box = document.getElementById('nova-rel-results');
  if (box) { box.innerHTML = ''; box.classList.remove('has-items'); }
  const q = document.getElementById('nova-rel-q');
  if (q) q.value = '';
  atualizarNovaSummaryBar_();
  salvarNovaDraft_();
  toast('Cadastro preenchido. Confira nome, criança e telefone.', 'success');
  document.getElementById('inp-resp')?.focus();
}

function restaurarNovaDraft_() {
  let draft = null;
  try { draft = JSON.parse(localStorage.getItem(NOVA_DRAFT_KEY) || 'null'); } catch(e) {}
  if (!draft || !draft.state) return false;

  _restoringNovaDraft = true;
  try {
    novaState = Object.assign({ tipo:null, plano:null, veiculo:null, itens:[], pagamento:null, observacao:'', step:0, subModo:'pick' }, draft.state);
    if (!Array.isArray(novaState.itens)) novaState.itens = [];
    if (novaState.tipo) renderPlanosNova_(novaState.tipo);
    if (novaState.veiculo) {
      const card = document.getElementById('vc-' + novaState.veiculo);
      if (card && !card.classList.contains('vc-busy') && !card.classList.contains('vc-busy-pink')) {
        card.classList.add(novaState.tipo === 'Pelúcia' ? 'vc-sel-pink' : 'vc-sel');
      }
    }
    if (novaState.plano) {
      document.querySelectorAll('.plano-btn').forEach(b => {
        const onclick = b.getAttribute('onclick') || '';
        if (onclick.includes("'" + novaState.plano + "'")) b.classList.add('sel');
      });
      if (novaState.tipo) aplicarEstiloInputsNova_(novaState.tipo);
    }
    const c = draft.campos || {};
    const set = (id, value) => { const el = document.getElementById(id); if (el) el.value = value || ''; };
    set('inp-resp', c.responsavel);
    set('inp-cri', c.crianca);
    set('inp-tel', c.telefone);
    set('inp-obs', c.observacao || novaState.observacao);
    novaState.observacao = c.observacao || novaState.observacao || '';
    document.querySelectorAll('.pag-btn').forEach(b => {
      b.classList.toggle('sel', !!(novaState.pagamento && b.textContent.includes(novaState.pagamento)));
    });
    novaState.step = migrateDraftStep_(novaState.step || 0);
    aplicarStepNova_(novaState.step);
    renderNovaItensBasket_();
    novaMarcarCestaGrid_();
  } finally {
    _restoringNovaDraft = false;
  }
  return true;
}

function inicializarDraftNova_() {
  ['inp-resp','inp-cri','inp-tel','inp-obs'].forEach(id => {
    const el = document.getElementById(id);
    if (el) ['input','change'].forEach(ev => el.addEventListener(ev, function() {
      salvarNovaDraft_();
      atualizarNovaSummaryBar_();
    }));
  });
  window.addEventListener('beforeunload', salvarNovaDraftFlush_);
}

function abrirNovaLocacao() {
  if (window.innerWidth < 1024) mobMenuClose_();
  novaPrefillResponsavel = null;
  limparNovaDraft_();
  resetNova({ preserveDraft: true });
  showPage('nova', { freshNova: true });
}
function atualizarVeiculoGridCore_() {
  // Veículos em uso = sessions ativas com veiculo definido
  const emUso = {};
  sessions.forEach(s => {
    if ((s.status === 'Ativa' || s.status === 'Pendente') && s.veiculo) {
      const rem = s.started ? calcRemaining(s) : s.mins * 60;
      const isOver = rem <= 0;
      emUso[s.veiculo] = { rem, isOver, s };
    }
  });

  const todosVeiculos = (typeof TODOS_VEICULOS_DEF !== 'undefined' && TODOS_VEICULOS_DEF.length)
    ? TODOS_VEICULOS_DEF.map(function(v) { return v.nome; })
    : ['Carro 01','Carro 02','Carro 03','Carro 04','Triciclo 01','Triciclo 02','Pelúcia 01','Pelúcia 02','Pelúcia 03','Pelúcia 04'];
  todosVeiculos.forEach(nome => {
    const card = document.getElementById('vc-' + nome);
    const stEl = document.getElementById('vc-st-' + nome);
    if (!card || !stEl) return;
    const isPink = nome.startsWith('Pelúcia');
    const info   = emUso[nome];

    // Remover timer antigo se existir
    const oldTimer = card.querySelector('.vc-timer');
    if (oldTimer) oldTimer.remove();
    card.classList.remove('vc-basket');
    card.style.display = '';

    if (info) {
      // Em uso
      card.classList.add(isPink ? 'vc-busy-pink' : 'vc-busy');
      card.classList.remove('vc-sel','vc-sel-pink');
      card.style.pointerEvents = 'none';
      stEl.className = 'vc-status ' + (isPink ? 'em-uso-pink' : 'em-uso');
      stEl.textContent = '⏳ Em uso';

      // Timer
      const timerDiv = document.createElement('div');
      timerDiv.className = 'vc-timer';
      const { rem, isOver, s } = info;
      if (isOver) {
        const extraSec = Math.abs(rem);
        const extraMin = Math.floor(extraSec / 60);
        const extraLbl = mkExibirFinanceiro_()
          ? `<div class="vc-timer-extra">R$ ${(extraMin * adicionalPorMinSessao_(s)).toFixed(2).replace('.',',')} extra</div>`
          : `<div class="vc-timer-extra">+${extraMin}min extra</div>`;
        timerDiv.innerHTML = `<div class="vc-timer-time extra">+${fmtTime(extraSec)}</div>${extraLbl}`;
      } else {
        const isWarn = rem <= 120;
        timerDiv.innerHTML = `<div class="vc-timer-time${isWarn?' warn':''}">${fmtTime(rem)}</div>`;
      }
      card.appendChild(timerDiv);
    } else {
      // Livre
      card.classList.remove('vc-busy','vc-busy-pink');
      card.style.pointerEvents = '';
      stEl.className = 'vc-status livre';
      stEl.textContent = '✓ Livre';
    }
  });
  if (typeof novaMarcarCestaGrid_ === 'function') novaMarcarCestaGrid_();
}

function atualizarVeiculoGrid() {
  if (_vcGridRaf) cancelAnimationFrame(_vcGridRaf);
  _vcGridRaf = requestAnimationFrame(function() {
    _vcGridRaf = null;
    atualizarVeiculoGridCore_();
  });
}

function destacarSecaoVeiculoNova_(tipo) {
  const page = document.getElementById('page-nova');
  const map = { Carro: 'vc-grid-carros', Triciclo: 'vc-grid-triciclos', 'Pelúcia': 'vc-grid-pelucias' };
  const activeId = map[tipo] || '';
  if (page) page.classList.add('step-0-veiculo');
  document.querySelectorAll('#page-nova .vc-section-label').forEach(lab => {
    const next = lab.nextElementSibling;
    const isActive = next && next.id === activeId;
    lab.classList.toggle('nova-vc-outro', !!tipo && !isActive);
    if (next && next.classList && (next.classList.contains('veiculo-grid-carros') || next.classList.contains('veiculo-grid-triciclos') || next.classList.contains('veiculo-grid-pelucias'))) {
      next.style.display = (!tipo || isActive) ? '' : 'none';
      if (isActive) lab.style.display = '';
      else if (tipo) lab.style.display = 'none';
    }
  });
}

function scrollParaPlanosNova_() {
  /* Intencionalmente sem scroll — operador permanece onde está no tablet. */
}

function selectVeiculo(el, veiculo, tipo) {
  if (novaGuardSaveBusy_()) return;
  if (el.classList.contains('vc-busy') || el.classList.contains('vc-busy-pink')) return;
  if (novaVeiculoNaCesta_(veiculo)) {
    toast(veiculo + ' já está nesta locação.', 'warning');
    return;
  }
  document.querySelectorAll('.vc-card').forEach(function(c) { c.classList.remove('vc-sel','vc-sel-pink'); });
  el.classList.add(tipo === 'Pelúcia' ? 'vc-sel-pink' : 'vc-sel');
  novaState.veiculo = veiculo;
  novaState.tipo    = tipo;
  novaState.plano   = null;
  document.querySelectorAll('.plano-btn').forEach(b => b.classList.remove('sel'));
  renderPlanosNova_(tipo);
  const sec = document.getElementById('nova-plano-section');
  if (sec) sec.classList.add('visible');
  destacarSecaoVeiculoNova_(tipo);
  aplicarEstiloInputsNova_(tipo);
  atualizarNovaSummaryBar_();
  salvarNovaDraft_();
  scrollParaPlanosNova_();
}

function selectTipo(tipo, el) {
  document.querySelectorAll('.tipo-btn').forEach(b => b.classList.remove('sel'));
  if (el) el.classList.add('sel');
  novaState.tipo = tipo;
  renderPlanosNova_(tipo);
  const sec = document.getElementById('nova-plano-section');
  if (sec) sec.classList.add('visible');
}

function selectPlano(plano, el) {
  if (novaGuardSaveBusy_()) return;
  if (!novaState.tipo) { toast('Selecione o veículo primeiro.', 'error'); return; }
  document.querySelectorAll('.plano-btn').forEach(b => b.classList.remove('sel'));
  el.classList.add('sel');
  novaState.plano = plano;
  aplicarEstiloInputsNova_(novaState.tipo);
  atualizarNovaSummaryBar_();
  if (novaState.step === 0) {
    incluirItemNova_();
  } else {
    salvarNovaDraft_();
  }
}

function nextStep() {
  if (novaGuardSaveBusy_()) return;
  if (novaState.step >= NOVA_MAX_STEP) return;
  if (novaState.step === 0) {
    const n = (novaState.itens || []).length;
    if (!n) {
      if (novaState.veiculo && novaState.plano && incluirItemNova_()) { /* ok */ }
      else { toast('Inclua pelo menos um veículo (escolha plano).', 'error'); return; }
    }
  }
  aplicarStepNova_(novaState.step + 1);
  salvarNovaDraft_();
}

function backStep() {
  if (novaGuardSaveBusy_()) return;
  if (novaState.step <= 0) return;
  aplicarStepNova_(novaState.step - 1);
  salvarNovaDraft_();
}

function avancarParaFechar_() {
  const resp = document.getElementById('inp-resp').value.trim();
  const cri  = document.getElementById('inp-cri').value.trim();
  const tel  = document.getElementById('inp-tel').value.trim().replace(/\D/g,'');
  if (!novaItensParaSalvar_().length) { toast('Inclua pelo menos um veículo com plano.', 'error'); return; }
  if (!resp || !cri || !tel) { toast('Preencha responsável, criança e telefone.', 'error'); return; }
  novaState.observacao = (document.getElementById('inp-obs')?.value.trim() || '');
  atualizarNovaSummaryBar_();
  aplicarStepNova_(2);
  salvarNovaDraft_();
}

function selPagamento(el, forma) {
  document.querySelectorAll('.pag-btn').forEach(b => b.classList.remove('sel'));
  el.classList.add('sel');
  novaState.pagamento = forma;
  novaAtualizarPosConfirm_();
  toggleBotoesConfirmarNova_();
  salvarNovaDraft_();
}

/** I106 — exige confirmação de valor = comprovante em PIX/cartão. */
function novaPagamentoExigePosConfirm_(forma) {
  const f = String(forma || '').trim();
  return f === 'PIX' || f === 'Crédito' || f === 'Débito';
}

function novaAtualizarPosConfirm_() {
  const box = document.getElementById('nova-pos-confirm');
  const lbl = document.getElementById('nova-pos-check-lbl');
  const ck = document.getElementById('nova-pos-ok');
  if (!box) return;
  const forma = novaState.pagamento;
  const need = novaPagamentoExigePosConfirm_(forma);
  box.hidden = !need;
  if (!need) {
    if (ck) ck.checked = false;
    return;
  }
  const itens = typeof novaItensParaSalvar_ === 'function' ? novaItensParaSalvar_() : [];
  const tot = typeof novaTotalPlanos_ === 'function' ? novaTotalPlanos_(itens) : 0;
  const n = itens.length || 1;
  const totLbl = 'R$ ' + Number(tot).toFixed(2).replace('.', ',');
  if (lbl) {
    lbl.innerHTML = 'Já cobrei na maquininha/PIX o valor <strong>exato</strong> deste cadastro: <strong id="nova-pos-valor">'
      + totLbl + '</strong>'
      + (n > 1 ? (' <span style="color:var(--txt2)">(1 passagem · ' + n + ' veículos)</span>') : '');
  }
}

function capitalizarNome(el) {
  const pos = el.selectionStart;
  el.value = el.value.replace(/(?:^|\s)\S/g, c => c.toUpperCase());
  el.setSelectionRange(pos, pos);
  salvarNovaDraft_();
}

function resetNova(opts = {}) {
  novaState = {
    tipo: null, plano: null, veiculo: null, itens: [],
    pagamento: null, observacao: '', step: 0, subModo: 'pick'
  };
  const pageNova = document.getElementById('page-nova');
  if (pageNova) pageNova.classList.remove('step-0-veiculo');
  document.querySelectorAll('#page-nova .vc-section-label').forEach(l => { l.style.display = ''; l.classList.remove('nova-vc-outro'); });
  ['vc-grid-carros','vc-grid-triciclos','vc-grid-pelucias'].forEach(id => {
    const g = document.getElementById(id);
    if (g) g.style.display = '';
  });
  document.querySelectorAll('.tipo-btn').forEach(b => b.classList.remove('sel'));
  document.querySelectorAll('.plano-btn').forEach(b => b.classList.remove('sel'));
  document.querySelectorAll('.vc-card').forEach(c => c.classList.remove('vc-sel','vc-sel-pink','vc-basket'));
  ['inp-resp','inp-cri','inp-tel'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const obsEl = document.getElementById('inp-obs'); if (obsEl) obsEl.value = '';
  const posOk = document.getElementById('nova-pos-ok'); if (posOk) posOk.checked = false;
  const posBox = document.getElementById('nova-pos-confirm'); if (posBox) posBox.hidden = true;
  const relQ = document.getElementById('nova-rel-q'); if (relQ) relQ.value = '';
  const relBox = document.getElementById('nova-rel-results');
  if (relBox) { relBox.innerHTML = ''; relBox.classList.remove('has-items'); }
  if (_novaRelSearchTimer) { clearTimeout(_novaRelSearchTimer); _novaRelSearchTimer = null; }
  document.querySelectorAll('.pag-btn').forEach(b => b.classList.remove('sel'));
  const sec = document.getElementById('nova-plano-section'); if (sec) sec.classList.remove('visible');
  renderNovaItensBasket_();
  renderNovaResumoFechar_();
  aplicarStepNova_(0);
  novaMarcarCestaGrid_();
  toggleBotoesConfirmarNova_();
  if (!opts.preserveDraft) limparNovaDraft_();
}

function abrirNovaComResponsavel(resp, novaCrianca = false) {
  novaPrefillResponsavel = resp || null;
  if (novaPrefillResponsavel && novaCrianca) {
    novaPrefillResponsavel = Object.assign({}, novaPrefillResponsavel, { criancas: [] });
  }
  limparNovaDraft_();
  resetNova({ preserveDraft: true });
  showPage('nova', { freshNova: true });
  toast(novaCrianca ? 'Responsável selecionado. Cadastre a nova criança após escolher o plano.' : 'Responsável selecionado. Escolha o veículo e o plano.', '');
}

function novaPosSaveSync_() {
  if (typeof mkInvalidateInicioCache_ === 'function') mkInvalidateInicioCache_();
  // I125: sync suave (sem force) — cache Script já invalidado no GAS; force=1 = frio 10–12s
  setTimeout(function() {
    if (typeof syncController === 'function') syncController(false, 2500);
  }, 200);
}

function novaRefreshAposItemSalvo_(i) {
  if (i === 0) {
    mkRefreshHomeUI_();
    resetNova();
    showPage('home');
  } else {
    if (typeof renderCards === 'function') renderCards();
    if (typeof atualizarVeiculoGrid === 'function') atualizarVeiculoGrid();
  }
}

function novaSetSavingBusy_(busy) {
  _novaSavingInFlight = !!busy;
  window._novaSavingInFlight = _novaSavingInFlight;
}

function novaBuildItensBatchJson_(itens) {
  return JSON.stringify(itens.map(function(it) {
    return { tipo: it.tipo, plano: it.plano, veiculo: it.veiculo };
  }));
}

function novaLimparOtimistas_() {
  const antes = sessions.length;
  sessions = sessions.filter(function(s) { return !s._optimistic; });
  if (sessions.length !== antes) saveSessions();
}

function novaAplicarBatchReal_(batchRes, observacaoFallback) {
  (batchRes.locacoes || []).forEach(function(loc) {
    upsertSessaoPendenteLocal_({
      rowIndex: loc.rowIndex,
      id: loc.id,
      tipo: loc.tipo,
      plano: loc.plano,
      veiculo: loc.veiculo,
      pagamento: loc.pagamento,
      observacao: loc.observacao || observacaoFallback || '',
      mins: loc.mins,
      valorPlano: loc.valorPlano,
      adicionalPorMin: loc.adicionalPorMin,
      responsavel: loc.responsavel,
      crianca: loc.crianca,
      telefone: loc.telefone,
      horaInicio: loc.horaInicio || '',
      data: loc.data || '',
      startTimestamp: 0,
      started: false,
      alertFired5: false,
      alertFiredExp: false,
      status: loc.status || 'Pendente'
    });
  });
  saveSessions();
}

async function novaSalvarItemSequencial_(it, basePayload, observacao, timeoutMs) {
  const cfgLocal = novaCfgPlano_(it.tipo, it.plano) || {};
  const d = await api(Object.assign({
    action: 'salvarLocacao',
    clientRequestId: (typeof mkOfflineGenRequestId_ === 'function') ? mkOfflineGenRequestId_() : ('mksv_' + Date.now()),
    tipo: it.tipo,
    plano: it.plano,
    veiculo: it.veiculo,
    valorPlano: cfgLocal.v || 0,
    mins: cfgLocal.m || 0,
    adicionalPorMin: cfgLocal.a || 1.00
  }, basePayload), timeoutMs || 18000);

  if (!d.ok) throw Object.assign(new Error(d.erro || ('Erro ao salvar ' + it.veiculo)), { veiculo: it.veiculo, partial: true });

  const rowIdx = rowIndexFromSalvar_(d);
  upsertSessaoPendenteLocal_({
    rowIndex: rowIdx,
    id: d.id,
    tipo: it.tipo,
    plano: it.plano,
    veiculo: it.veiculo,
    pagamento: d.pagamento || basePayload.pagamento,
    observacao: observacao || '',
    mins: d.mins || cfgLocal.m,
    valorPlano: d.valorPlano || cfgLocal.v,
    adicionalPorMin: d.adicionalPorMin || cfgLocal.a,
    responsavel: basePayload.responsavel,
    crianca: basePayload.crianca,
    telefone: basePayload.telefone,
    horaInicio: d.horaInicio,
    data: d.data,
    startTimestamp: 0,
    started: false,
    alertFired5: false,
    alertFiredExp: false,
    status: d.status || 'Pendente',
    _offlinePending: !!d._offlineQueued,
    _clientRequestId: d.clientRequestId || null
  });
  saveSessions();
  return { mesmaConta: !!d.mesmaConta };
}

async function confirmarLocacao() {
  if (_novaSavingInFlight) {
    toast('Aguarde: já estamos salvando esta locação.', 'info');
    return;
  }
  const resp = document.getElementById('inp-resp').value.trim();
  const cri  = document.getElementById('inp-cri').value.trim();
  const tel  = document.getElementById('inp-tel').value.trim().replace(/\D/g,'');
  const itens = novaItensParaSalvar_();

  if (!itens.length) { toast('Inclua pelo menos um veículo!', 'error'); return; }
  if (!resp || !cri || !tel) { toast('Preencha todos os campos!', 'error'); return; }
  if (!novaState.pagamento) { toast('Selecione a forma de pagamento!', 'error'); return; }
  if (!mkRequireOperadorEscrita_()) return;

  // I143: mesmo tel+veículo em <90s → sync, não novo salvar (duplicata no retry)
  const saveFp = novaSaveFingerprint_(tel, itens);
  if (_novaLastSaveFp_ === saveFp && (Date.now() - _novaLastSaveAt_) < NOVA_SAVE_DEDUP_MS) {
    toast('Este cadastro pode já ter sido salvo. Atualizando a Home — não duplique.', 'warning');
    if (typeof showPage === 'function') showPage('home');
    if (typeof mkRefreshHomeUI_ === 'function') mkRefreshHomeUI_();
    novaPosSaveSync_();
    return;
  }

  // I143: veículo já Ativa/Pendente na sessão local → bloqueia retry cego
  const ocupLocal = {};
  (typeof sessions !== 'undefined' ? sessions : []).forEach(function (s) {
    const st = String(s.status || '');
    if ((st === 'Ativa' || st === 'Pendente') && s.veiculo) ocupLocal[String(s.veiculo)] = true;
  });
  for (let oi = 0; oi < itens.length; oi++) {
    const v = String(itens[oi].veiculo || '');
    if (v && ocupLocal[v]) {
      toast(v + ' já está em uso na Home. Não salve de novo — use o card existente.', 'error');
      if (typeof showPage === 'function') showPage('home');
      return;
    }
  }

  if (novaPagamentoExigePosConfirm_(novaState.pagamento)) {
    novaAtualizarPosConfirm_();
    const ck = document.getElementById('nova-pos-ok');
    if (!ck || !ck.checked) {
      toast('Confirme no checkbox: valor do comprovante = valor do cadastro.', 'error');
      const box = document.getElementById('nova-pos-confirm');
      if (box) {
        box.hidden = false;
        box.classList.add('nova-pos-confirm--shake');
        setTimeout(function () { box.classList.remove('nova-pos-confirm--shake'); }, 500);
        box.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
  }

  const btn = document.getElementById('btn-confirmar');
  const n = itens.length;
  const observacao = novaState.observacao || '';
  const basePayload = Object.assign({}, operadorApiParams_(), {
    pagamento: novaState.pagamento,
    observacao: observacao,
    responsavel: resp,
    crianca: cri,
    telefone: tel
  });

  if (btn) { btn.disabled = true; btn.textContent = 'Salvando…'; }
  const saveGen = ++_novaSaveGen;
  novaSetSavingBusy_(true);
  aplicarStepNova_(2);
  novaShowSaving_(0, n, itens[0] && itens[0].veiculo, null);

  let ultimaMesmaConta = false;
  let salvos = 0;

  try {
    if (saveGen !== _novaSaveGen) return;

    if (n === 1) {
      novaShowSaving_(0, 1, itens[0].veiculo);
      const r = await novaSalvarItemSequencial_(itens[0], basePayload, observacao, NOVA_SAVE_TIMEOUT_1_MS);
      if (saveGen !== _novaSaveGen) return;
      ultimaMesmaConta = !!r.mesmaConta;
      salvos = 1;
      mkRefreshHomeUI_();
      resetNova();
      showPage('home');
    } else if (mkGasTemSalvarLocacoesMulti_()) {
      novaShowSaving_(0, n, itens.map(function(it) { return it.veiculo; }).join(', '), 'batch');
      let batchRes = null;
      try {
        batchRes = await api(Object.assign({
          action: 'salvarLocacoesMulti',
          itens: novaBuildItensBatchJson_(itens)
        }, basePayload), 32000);
      } catch (batchErr) { batchRes = null; }
      if (saveGen !== _novaSaveGen) return;
      if (batchRes && batchRes.ok && batchRes.batch && Array.isArray(batchRes.locacoes)) {
        novaAplicarBatchReal_(batchRes, observacao);
        salvos = n;
        mkRefreshHomeUI_();
        resetNova();
        showPage('home');
      } else {
        const seq = await novaSalvarLoopSequencial_(itens, basePayload, observacao, saveGen);
        if (!seq) return;
        ultimaMesmaConta = seq.ultimaMesmaConta;
        salvos = seq.salvos;
      }
    } else {
      const seq = await novaSalvarLoopSequencial_(itens, basePayload, observacao, saveGen);
      if (!seq) return;
      ultimaMesmaConta = seq.ultimaMesmaConta;
      salvos = seq.salvos;
    }

    if (saveGen !== _novaSaveGen) return;
    mkRefreshHomeUI_();
    _novaLastSaveFp_ = saveFp;
    _novaLastSaveAt_ = Date.now();

    const msg = n > 1
      ? ('✅ ' + n + ' locações salvas na mesma conta! Aperte ▶ em cada card.')
      : (ultimaMesmaConta
        ? '✅ Cadastro salvo na mesma conta do responsável. Aperte ▶ para iniciar.'
        : '✅ Cadastro salvo! Aperte ▶ para iniciar a contagem.');
    toast(msg, 'success');
    novaPosSaveSync_();

  } catch(e) {
    if (saveGen !== _novaSaveGen) return;
    const errRaw = String((e && e.message) || '');
    const isTimeout = /timeout/i.test(errRaw);
    // I143: timeout — GAS pode ter gravado; marca fingerprint e NÃO incentiva retry
    if (isTimeout) {
      _novaLastSaveFp_ = saveFp;
      _novaLastSaveAt_ = Date.now();
      if (typeof showPage === 'function') showPage('home');
      if (typeof mkRefreshHomeUI_ === 'function') mkRefreshHomeUI_();
      novaPosSaveSync_();
      toast('Servidor demorou a responder. NÃO salve de novo — confira a Home.', 'warning');
    } else {
      novaLimparOtimistas_();
      mkRefreshHomeUI_();
      const errMsg = (e && e.veiculo)
        ? ('Erro no veículo ' + e.veiculo + ': ' + e.message)
        : (errRaw || 'Erro de conexão. Tente novamente.');
      toast(errMsg, 'error');
      if (salvos > 0 && n > 1) toast(salvos + ' de ' + n + ' salvos — complete o restante.', 'warning');
    }
  } finally {
    if (saveGen === _novaSaveGen) {
      novaHideSaving_();
      novaSetSavingBusy_(false);
      if (btn) { btn.textContent = 'Só salvar cadastro (sem SMS agora)'; btn.disabled = false; }
      const b2 = document.getElementById('btn-confirmar-iniciar');
      if (b2) { b2.disabled = false; b2.textContent = '✓ Salvar e enviar SMS do portal'; }
    }
  }
}

/** I20: salva Pendente + SMS portal — cronômetro só no ▶ Iniciar da Home. */
async function confirmarLocacaoEEnviarSms_() {
  return confirmarLocacao();
}

/* Legacy path intentionally disabled (qr_only): kept only for compatibility. */
async function confirmarLocacaoEEnviarSmsLegado_() {
  if (!novaState.veiculo || !novaState.pagamento) {
    toast('Complete veículo, plano e pagamento.', 'error');
    return;
  }
  const resp = document.getElementById('inp-resp').value.trim();
  const cri  = document.getElementById('inp-cri').value.trim();
  const tel  = document.getElementById('inp-tel').value.trim().replace(/\D/g,'');
  if (!resp || !cri || !tel) { toast('Preencha responsável, criança e telefone.', 'error'); return; }
  if (!mkRequireOperadorEscrita_()) return;

  const cfgLocal = (PRECOS[novaState.tipo] && PRECOS[novaState.tipo][novaState.plano]) || {};
  const btn = document.getElementById('btn-confirmar-iniciar');
  if (btn) { btn.textContent = '⏳ Salvando...'; btn.disabled = true; }
  const btnMain = document.getElementById('btn-confirmar');
  if (btnMain) btnMain.disabled = true;

  try {
    const d = await api({
      action: 'salvarLocacao',
      ...operadorApiParams_(),
      tipo: novaState.tipo,
      plano: novaState.plano,
      veiculo: novaState.veiculo,
      pagamento: novaState.pagamento,
      observacao: novaState.observacao || '',
      responsavel: resp,
      crianca: cri,
      telefone: tel,
      valorPlano: cfgLocal.v || 0,
      mins: cfgLocal.m || 0,
      adicionalPorMin: cfgLocal.a || 1.00
    });
    if (!d.ok) { toast('Erro: ' + d.erro, 'error'); return; }

    const rowIdx = rowIndexFromSalvar_(d);
    sessions.push({
      rowIndex: rowIdx,
      id: d.id,
      tipo: novaState.tipo,
      plano: novaState.plano,
      veiculo: novaState.veiculo,
      pagamento: novaState.pagamento,
      observacao: novaState.observacao || '',
      mins: d.mins || cfgLocal.m,
      valorPlano: d.valorPlano || cfgLocal.v,
      adicionalPorMin: d.adicionalPorMin || cfgLocal.a,
      responsavel: resp,
      crianca: cri,
      telefone: tel,
      horaInicio: d.horaInicio,
      data: d.data,
      startTimestamp: 0,
      started: false,
      alertFired5: false,
      alertFiredExp: false,
      status: d.status || 'Pendente'
    });
    saveSessions();
    limparNovaDraft_();
    resetNova();
    if (typeof mkInvalidateInicioCache_ === 'function') mkInvalidateInicioCache_();
    else try { localStorage.removeItem('mk_inicio_cache_v2'); localStorage.removeItem('mk_inicio_cache'); } catch (e) {}
    broadcastInvalidate();
    syncController(true, 800);
    showPage('home');
    renderCards();
    atualizarVeiculoGrid();

    const s = sessions.find(x => Number(x.rowIndex) === Number(rowIdx)) ||
              sessions.find(x => Number(x.id) === Number(d.id));
    if (s && typeof enviarSmsResponsavel_ === 'function') {
      await enviarSmsResponsavel_(s, 'portal');
      toast('Cadastro salvo. SMS na fila. Aperte ▶ Iniciar quando estiver pronto.', 'success');
    } else {
      toast('Cadastro salvo. Aperte ▶ Iniciar na Home.', 'success');
    }
  } catch (e) {
    toast((e && e.message) ? e.message : 'Erro de conexão.', 'error');
  } finally {
    if (btn) { btn.textContent = '✓ Salvar e enviar SMS do portal'; btn.disabled = false; }
    if (btnMain) btnMain.disabled = false;
  }
}

function novaRecoveryOverlayStale_() {
  const o = document.getElementById('nova-saving-overlay');
  if (o && !o.hidden && !_novaSavingInFlight) novaHideSaving_();
}

window.atualizarVeiculoGrid = atualizarVeiculoGrid;
window.confirmarLocacao = confirmarLocacao;
window.confirmarLocacaoEEnviarSms_ = confirmarLocacaoEEnviarSms_;
window.mkRefreshHomeUI_ = mkRefreshHomeUI_;
window.novaForceUnstickSave_ = novaForceUnstickSave_;
window.novaHideSaving_ = novaHideSaving_;
window.novaRecoveryOverlayStale_ = novaRecoveryOverlayStale_;
window.mkWarmGasBatchFlag_ = mkWarmGasBatchFlag_;
window.removerItemNova_ = removerItemNova_;
window.novaIniciarPick_ = novaIniciarPick_;
window.novaVoltarCesta_ = novaVoltarCesta_;
window.novaAddOutroVeiculo_ = novaAddOutroVeiculo_;

