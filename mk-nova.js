/* MOVI KIDS — Nova locação (Pacote M.6)
 * Zona P0: confirmarLocacao → salvarLocacao via GET (api/mk-api.js).
 */
let novaState = { tipo: null, plano: null, veiculo: null, pagamento: null, observacao: '', step: 0, mesmaConta: false };
let novaPrefillResponsavel = null;
const NOVA_DRAFT_KEY = 'mk_nova_locacao_draft_v1';
const NOVA_MESMA_CONTA_KEY = 'mk_nova_mesma_conta_v1';
const NOVA_MESMA_CONTA_TTL_MS = 6 * 60 * 60 * 1000;
let _restoringNovaDraft = false;
const NOVA_MAX_STEP = 2;
let _novaRelSearchTimer = null;
let _novaSavingInFlight = false;
var relacionamentoCache = [];
/** I96 — mesma conta (I42): 2º/3º veículo sem refazer cadastro completo. */
function lerMesmaContaCtx_() {
  try {
    const raw = sessionStorage.getItem(NOVA_MESMA_CONTA_KEY);
    if (!raw) return null;
    const ctx = JSON.parse(raw);
    if (!ctx || !ctx.telefone) return null;
    if (ctx.ts && Date.now() - Number(ctx.ts) > NOVA_MESMA_CONTA_TTL_MS) {
      sessionStorage.removeItem(NOVA_MESMA_CONTA_KEY);
      return null;
    }
    return ctx;
  } catch (e) { return null; }
}

function salvarMesmaContaCtx_(ctx) {
  if (!ctx || !ctx.telefone) return;
  const payload = Object.assign({}, ctx, { ts: Date.now() });
  try { sessionStorage.setItem(NOVA_MESMA_CONTA_KEY, JSON.stringify(payload)); } catch (e) {}
  renderHomeMesmaContaCta_(payload);
}

function dismissMesmaContaCta_() {
  try { sessionStorage.removeItem(NOVA_MESMA_CONTA_KEY); } catch (e) {}
  renderHomeMesmaContaCta_(null);
}

function renderHomeMesmaContaCta_(ctxOpt) {
  const el = document.getElementById('home-mesma-conta-cta');
  const txt = document.getElementById('home-mesma-conta-text');
  if (!el) return;
  const ctx = ctxOpt !== undefined ? ctxOpt : lerMesmaContaCtx_();
  if (!ctx || !ctx.telefone) {
    el.hidden = true;
    return;
  }
  el.hidden = false;
  if (txt) {
    const pag = ctx.pagamento || 'pagamento';
    const resp = ctx.responsavel || 'Responsável';
    txt.textContent = resp + ' · ' + pag + ' — adicionar outro veículo na mesma conta (1 cobrança na maquininha)';
  }
}

function abrirNovaMesmaContaFromHome_() {
  const ctx = lerMesmaContaCtx_();
  if (!ctx) {
    toast('Oferta expirada. Faça uma nova locação com pagamento.', 'warning');
    renderHomeMesmaContaCta_(null);
    return;
  }
  abrirNovaMesmaConta_(ctx);
}

function aplicarPagamentoFixoNova_(forma) {
  if (!forma) return;
  novaState.pagamento = forma;
  const idMap = { PIX: 'pag-PIX', 'Crédito': 'pag-Credito', 'Débito': 'pag-Debito', Dinheiro: 'pag-Dinheiro' };
  const targetId = idMap[forma] || '';
  document.querySelectorAll('.pag-btn').forEach(function(b) {
    b.classList.toggle('sel', b.id === targetId);
  });
  const valEl = document.getElementById('nova-mesma-conta-pag-val');
  if (valEl) valEl.textContent = forma;
}

function setNovaCampoLocked_(id, locked) {
  const el = document.getElementById(id);
  if (!el) return;
  el.readOnly = !!locked;
  el.classList.toggle('nova-field-locked', !!locked);
  if (locked) el.setAttribute('aria-readonly', 'true');
  else el.removeAttribute('aria-readonly');
}

function aplicarNovaMesmaContaUI_(ativo) {
  const page = document.getElementById('page-nova');
  const banner = document.getElementById('nova-mesma-conta-banner');
  const pagFixo = document.getElementById('nova-mesma-conta-pag-fixo');
  const pagGrid = document.getElementById('nova-pag-grid');
  const pagTitle = document.getElementById('nova-pag-grid-title');
  if (page) page.classList.toggle('nova-mesma-conta-mode', !!ativo);
  if (banner) banner.hidden = !ativo;
  if (pagFixo) pagFixo.hidden = !ativo;
  if (pagGrid) pagGrid.style.display = ativo ? 'none' : '';
  if (pagTitle) pagTitle.style.display = ativo ? 'none' : '';
  setNovaCampoLocked_('inp-resp', ativo);
  setNovaCampoLocked_('inp-tel', ativo);
}

function abrirNovaMesmaConta_(ctx) {
  if (!ctx || !ctx.telefone) {
    toast('Dados da conta incompletos.', 'error');
    return;
  }
  novaPrefillResponsavel = null;
  limparNovaDraft_();
  resetNova({ preserveDraft: true, preserveMesmaConta: false });
  novaState.mesmaConta = true;
  novaState.pagamento = ctx.pagamento || null;
  const set = function(id, v) {
    const el = document.getElementById(id);
    if (el) el.value = v || '';
  };
  set('inp-resp', ctx.responsavel);
  set('inp-tel', ctx.telefone);
  set('inp-cri', ctx.crianca || '');
  aplicarNovaMesmaContaUI_(true);
  aplicarPagamentoFixoNova_(ctx.pagamento);
  toggleBotoesConfirmarNova_();
  showPage('nova', { mesmaConta: true });
  toast('Escolha o próximo veículo — mesma conta, pagamento ' + (ctx.pagamento || 'herdado') + '.', 'success');
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
    novaState.tipo || novaState.plano || novaState.veiculo || novaState.pagamento ||
    c.responsavel.trim() || c.crianca.trim() || c.telefone.trim() || c.observacao.trim()
  );
}

function salvarNovaDraft_() {
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
  // migrateDraftStep_ só ao restaurar rascunho antigo (4 passos) — não no fluxo ao vivo
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
    setTimeout(() => document.getElementById('nova-rel-q')?.focus(), 80);
  }
  if (safeStep === 2) toggleBotoesConfirmarNova_();
  const btnQuem = document.getElementById('btn-nova-continuar-quem');
  if (btnQuem) btnQuem.style.display = (safeStep === 0 && novaState.plano) ? 'block' : 'none';
  atualizarNovaSummaryBar_();
}

function atualizarNovaSummaryBar_() {
  const bar = document.getElementById('nova-summary-bar');
  if (!bar) return;
  const { tipo, plano, veiculo } = novaState;
  const parts = [];
  if (veiculo || tipo) parts.push(tipoIcon(tipo || '') + ' ' + (veiculo || tipo || '—'));
  if (plano && tipo && PRECOS[tipo] && PRECOS[tipo][plano]) {
    parts.push(PLANO_LABELS[plano] || plano);
    if (mkExibirFinanceiro_()) parts.push('R$ ' + PRECOS[tipo][plano].v);
  } else if (veiculo && tipo) {
    parts.push('escolha o plano');
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
  const b1 = document.getElementById('btn-confirmar');
  const b2 = document.getElementById('btn-confirmar-iniciar');
  const hint = document.getElementById('nova-fechar-hint');
  if (b1) b1.style.display = ok ? 'block' : 'none';
  if (b2) b2.style.display = 'none';
  if (hint) {
    hint.style.display = ok ? 'block' : 'none';
    if (ok) hint.textContent = 'O cronômetro só começa após ▶ Iniciar na Home. Comunicação: QR do portal na mesa.';
  }
}

function upsertSessaoPendenteLocal_(payload) {
  const row = Number(payload && payload.rowIndex || 0);
  const id = Number(payload && payload.id || 0);
  const idx = sessions.findIndex(function(s) {
    return (row && Number(s.rowIndex) === row) || (id && Number(s.id) === id);
  });
  if (idx >= 0) sessions[idx] = Object.assign({}, sessions[idx], payload);
  else sessions.push(payload);
}

/** I91 — Home imediata após salvar/▶ (não esperar carregarInicio). */
function mkRefreshHomeUI_() {
  if (typeof renderCards === 'function') renderCards();
  if (typeof updateStats === 'function') updateStats();
  if (typeof atualizarVeiculoGrid === 'function') atualizarVeiculoGrid();
  renderHomeMesmaContaCta_();
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
    novaState = Object.assign({ tipo:null, plano:null, veiculo:null, pagamento:null, observacao:'', step:0 }, draft.state);
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
  window.addEventListener('beforeunload', salvarNovaDraft_);
  renderHomeMesmaContaCta_();
}

function abrirNovaLocacao() {
  if (window.innerWidth < 1024) mobMenuClose_();
  novaPrefillResponsavel = null;
  limparNovaDraft_();
  resetNova({ preserveDraft: true });
  showPage('nova', { freshNova: true });
}
function atualizarVeiculoGrid() {
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
  const sec = document.getElementById('nova-plano-section');
  if (sec && sec.classList.contains('visible')) {
    setTimeout(() => { try { sec.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { sec.scrollIntoView(true); } }, 80);
  }
}

function selectVeiculo(el, veiculo, tipo) {
  if (el.classList.contains('vc-busy') || el.classList.contains('vc-busy-pink')) return;
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
  toast(veiculo + ' selecionado — escolha o plano abaixo.', 'success');
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
  if (!novaState.tipo) { toast('Selecione o veículo primeiro.', 'error'); return; }
  document.querySelectorAll('.plano-btn').forEach(b => b.classList.remove('sel'));
  el.classList.add('sel');
  novaState.plano = plano;
  aplicarEstiloInputsNova_(novaState.tipo);
  atualizarNovaSummaryBar_();
  if (novaState.step === 0) nextStep();
  else salvarNovaDraft_();
}

function nextStep() {
  if (novaState.step >= NOVA_MAX_STEP) return;
  if (novaState.step === 0 && !novaState.plano) {
    toast('Escolha o plano antes de continuar.', 'error');
    return;
  }
  aplicarStepNova_(novaState.step + 1);
  salvarNovaDraft_();
  if (novaState.step === 1) {
    const pg = document.getElementById('step-1');
    if (pg) setTimeout(() => { try { pg.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { pg.scrollIntoView(true); } }, 80);
  }
}

function backStep() {
  if (novaState.step <= 0) return;
  aplicarStepNova_(novaState.step - 1);
  salvarNovaDraft_();
}

function avancarParaFechar_() {
  const resp = document.getElementById('inp-resp').value.trim();
  const cri  = document.getElementById('inp-cri').value.trim();
  const tel  = document.getElementById('inp-tel').value.trim().replace(/\D/g,'');
  if (!novaState.plano) { toast('Escolha o plano.', 'error'); return; }
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
  toggleBotoesConfirmarNova_();
  salvarNovaDraft_();
}

function capitalizarNome(el) {
  const pos = el.selectionStart;
  el.value = el.value.replace(/(?:^|\s)\S/g, c => c.toUpperCase());
  el.setSelectionRange(pos, pos);
  salvarNovaDraft_();
}

function resetNova(opts = {}) {
  const keepMesmaConta = !!(opts.preserveMesmaConta && novaState.mesmaConta);
  novaState = {
    tipo: null, plano: null, veiculo: null, pagamento: null,
    observacao: '', step: 0, mesmaConta: keepMesmaConta
  };
  if (!keepMesmaConta) aplicarNovaMesmaContaUI_(false);
  const pageNova = document.getElementById('page-nova');
  if (pageNova) pageNova.classList.remove('step-0-veiculo');
  document.querySelectorAll('#page-nova .vc-section-label').forEach(l => { l.style.display = ''; l.classList.remove('nova-vc-outro'); });
  ['vc-grid-carros','vc-grid-triciclos','vc-grid-pelucias'].forEach(id => {
    const g = document.getElementById(id);
    if (g) g.style.display = '';
  });
  document.querySelectorAll('.tipo-btn').forEach(b => b.classList.remove('sel'));
  document.querySelectorAll('.plano-btn').forEach(b => b.classList.remove('sel'));
  document.querySelectorAll('.vc-card').forEach(c => c.classList.remove('vc-sel','vc-sel-pink'));
  ['inp-resp','inp-cri','inp-tel'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const obsEl = document.getElementById('inp-obs'); if (obsEl) obsEl.value = '';
  const relQ = document.getElementById('nova-rel-q'); if (relQ) relQ.value = '';
  const relBox = document.getElementById('nova-rel-results');
  if (relBox) { relBox.innerHTML = ''; relBox.classList.remove('has-items'); }
  if (_novaRelSearchTimer) { clearTimeout(_novaRelSearchTimer); _novaRelSearchTimer = null; }
  document.querySelectorAll('.pag-btn').forEach(b => b.classList.remove('sel'));
  const sec = document.getElementById('nova-plano-section'); if (sec) sec.classList.remove('visible');
  aplicarStepNova_(0);
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

async function confirmarLocacao() {
  if (_novaSavingInFlight) {
    toast('Aguarde: já estamos salvando esta locação.', 'info');
    return;
  }
  const resp = document.getElementById('inp-resp').value.trim();
  const cri  = document.getElementById('inp-cri').value.trim();
  const tel  = document.getElementById('inp-tel').value.trim().replace(/\D/g,'');

  if (!novaState.veiculo) { toast('Selecione um veículo!', 'error'); return; }
  if (!resp || !cri || !tel) { toast('Preencha todos os campos!', 'error'); return; }
  if (!novaState.pagamento) { toast('Selecione a forma de pagamento!', 'error'); return; }
  if (!mkRequireOperadorEscrita_()) return;

  const btn = document.getElementById('btn-confirmar');
  btn.textContent = '⏳ Salvando cadastro...'; btn.disabled = true;
  _novaSavingInFlight = true;

  try {
    // Preço local como fallback caso GAS não conheça o tipo (ex: Triciclo em GAS antigo)
    const cfgLocal = (PRECOS[novaState.tipo] && PRECOS[novaState.tipo][novaState.plano]) || {};

    const d = await api({
      action: 'salvarLocacao',
      ...operadorApiParams_(),
      tipo:         novaState.tipo,
      plano:        novaState.plano,
      veiculo:      novaState.veiculo,
      pagamento:    novaState.pagamento,
      observacao:   novaState.observacao || '',
      responsavel:  resp,
      crianca:      cri,
      telefone:     tel,
      valorPlano:      cfgLocal.v || 0,
      mins:            cfgLocal.m || 0,
      adicionalPorMin: cfgLocal.a || 1.00
    }, 18000);

    if (!d.ok) { toast('Erro: ' + d.erro, 'error'); return; }

    // Adiciona IMEDIATAMENTE com started=false (aguardando botão Iniciar)
    const rowIdx = rowIndexFromSalvar_(d);
    const pagResp = d.pagamento || novaState.pagamento;
    upsertSessaoPendenteLocal_({
      rowIndex:        rowIdx,
      id:              d.id,
      tipo:            novaState.tipo,
      plano:           novaState.plano,
      veiculo:         novaState.veiculo,
      pagamento:       pagResp,
      observacao:      novaState.observacao || '',
      mins:            d.mins            || cfgLocal.m,
      valorPlano:      d.valorPlano      || cfgLocal.v,
      adicionalPorMin: d.adicionalPorMin || cfgLocal.a,
      responsavel:     resp,
      crianca:         cri,
      telefone:        tel,
      horaInicio:      d.horaInicio,
      data:            d.data,
      startTimestamp:  0,
      started:         false,
      alertFired5:     false,
      alertFiredExp:   false,
      status:          d.status || 'Pendente'
    });
    saveSessions();
    salvarMesmaContaCtx_({
      responsavel: resp,
      telefone: tel,
      pagamento: pagResp,
      crianca: cri
    });
    mkRefreshHomeUI_();
    resetNova();
    showPage('home');
    const msgConta = d.mesmaConta
      ? '✅ Cadastro salvo na mesma conta do responsável (mesmo telefone hoje). Aperte ▶ para iniciar.'
      : '✅ Cadastro salvo! Aperte ▶ para iniciar a contagem.';
    toast(msgConta, 'success');

    if (typeof mkInvalidateInicioCache_ === 'function') mkInvalidateInicioCache_();
    if (typeof syncController === 'function') syncController(false, 6000);

  } catch(e) {
    toast((e && e.message) ? e.message : 'Erro de conexão. Tente novamente.', 'error');
  } finally {
    _novaSavingInFlight = false;
    if (btn) { btn.textContent = 'Só salvar cadastro (sem SMS agora)'; btn.disabled = false; }
    const b2 = document.getElementById('btn-confirmar-iniciar');
    if (b2) { b2.disabled = false; b2.textContent = '✓ Salvar e enviar SMS do portal'; }
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

window.atualizarVeiculoGrid = atualizarVeiculoGrid;
window.confirmarLocacao = confirmarLocacao;
window.confirmarLocacaoEEnviarSms_ = confirmarLocacaoEEnviarSms_;
window.mkRefreshHomeUI_ = mkRefreshHomeUI_;
window.abrirNovaMesmaContaFromHome_ = abrirNovaMesmaContaFromHome_;
window.dismissMesmaContaCta_ = dismissMesmaContaCta_;
window.abrirNovaMesmaConta_ = abrirNovaMesmaConta_;

