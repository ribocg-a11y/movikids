/* MOVI KIDS - admin gestao: PIN, KPIs, caixa, config, sistema (Pacote M.11) */

// ADMIN — Estado, PIN, Timeout
// ═══════════════════════════════════════════════════════════
var isAdmin         = false;
let adminTimerInt   = null;
const ADMIN_IDLE_SEC = 60 * 60; // 1 hora — display; expiração via mk_auth_last_activity (relógio real)
let _adminIdleWired = false;
var kpiData         = null;
var resumoDiaHoje   = null;
let chartsRendered  = false;
var chartDiario=null,chartExtrasDia=null,chartHistExt=null,chartHoras=null,chartMetaDia=null;
let pinBuffer       = '';
let _pinModalMode   = 'admin'; // 'admin' | 'ask'
let _pinModalAskResolve = null;

function pinModalSetCopy_(titulo, sub) {
  const t = document.querySelector('#pin-modal .modal-title');
  const s = document.querySelector('#pin-modal .modal-sub');
  if (t && titulo) t.textContent = titulo;
  if (s && sub) s.textContent = sub;
}

function pinModalResetCopy_() {
  pinModalSetCopy_('Área Administrativa', 'Digite a senha de acesso');
}

/** PIN numérico no tablet (substitui prompt() — I21/I28). */
window.mkAdminPinModalAsk_ = function mkAdminPinModalAsk_(motivo) {
  return new Promise((resolve) => {
    _pinModalAskResolve = resolve;
    _pinModalMode = 'ask';
    pinModalSetCopy_('Confirme o PIN', motivo || 'Digite o PIN administrativo (4 dígitos)');
    pinBuffer = '';
    atualizarDots();
    document.getElementById('pin-modal').classList.add('show');
  });
};

// ── PIN ──────────────────────────────────────────────────────
function abrirAdmin() {
  if (isAdmin) { showPage('home'); return; }
  if (typeof mkAuthIsAdmin === 'function' && mkAuthIsAdmin()) {
    adminLogin();
    return;
  }
  if (typeof mkAuthIsSupervisor === 'function' && mkAuthIsSupervisor()) {
    showSupervisorSidebar();
    irAdmin('caixa');
    return;
  }
  _pinModalMode = 'admin';
  pinModalResetCopy_();
  pinBuffer = '';
  atualizarDots();
  document.getElementById('pin-modal').classList.add('show');
}

function fecharPin() {
  document.getElementById('pin-modal').classList.remove('show');
  pinBuffer = '';
  atualizarDots();
  if (_pinModalMode === 'ask' && _pinModalAskResolve) {
    const r = _pinModalAskResolve;
    _pinModalAskResolve = null;
    _pinModalMode = 'admin';
    pinModalResetCopy_();
    r(null);
  }
}

function pinKey(d) {
  if (pinBuffer.length >= 4) return;
  pinBuffer += d;
  atualizarDots();
  if (pinBuffer.length === 4) setTimeout(verificarPin, 150);
}

function pinDel() {
  pinBuffer = pinBuffer.slice(0, -1);
  atualizarDots();
}

function atualizarDots(erro) {
  for (let i=0;i<4;i++) {
    const el = document.getElementById('pd'+i);
    el.className = 'pin-dot';
    if (erro) el.classList.add('error');
    else if (i < pinBuffer.length) el.classList.add('filled');
  }
}

function verificarPin() {
  const pin = pinBuffer;
  if (pin.length !== 4) return;
  pinBuffer = '';
  atualizarDots();
  (async function () {
    try {
      const d = await api({ action: 'loginAdmin', adminPin: pin }, 20000);
      if (d.ok) {
        if (typeof mkAuthStoreAdminPin_ === 'function') mkAuthStoreAdminPin_(pin);
        if (_pinModalMode === 'ask' && _pinModalAskResolve) {
          const r = _pinModalAskResolve;
          _pinModalAskResolve = null;
          _pinModalMode = 'admin';
          pinModalResetCopy_();
          document.getElementById('pin-modal').classList.remove('show');
          r(pin);
          return;
        }
        fecharPin();
        adminLogin();
      } else {
        atualizarDots(true);
        navigator.vibrate && navigator.vibrate([80, 40, 80]);
        setTimeout(() => { pinBuffer = ''; atualizarDots(); }, 800);
        toast(d.erro || 'PIN administrativo incorreto', 'error');
      }
    } catch (e) {
      atualizarDots(true);
      setTimeout(() => { pinBuffer = ''; atualizarDots(); }, 800);
      toast(e.message || 'Sem conexão', 'error');
    }
  })();
}

function wireAdminIdleListeners_() {
  if (_adminIdleWired) return;
  _adminIdleWired = true;
  ['click', 'keydown', 'touchstart', 'scroll', 'mousemove'].forEach(ev => {
    document.addEventListener(ev, resetAdminTimer, { passive: true });
  });
}

function adminTeardownUI_() {
  isAdmin = false;
  window.isAdmin = false;
  if (adminTimerInt) {
    clearInterval(adminTimerInt);
    adminTimerInt = null;
  }
  hideAdminSidebar();
  statsHoje.fat = 0;
  const chipEl = document.getElementById('admin-home-chip');
  if (chipEl) chipEl.hidden = true;
  if (typeof showAdminHomeKpis === 'function') showAdminHomeKpis(null);
  try { localStorage.removeItem('mk_inicio_cache'); } catch (e) {}
  try { localStorage.removeItem('mk_admin_ui_persist'); } catch (e) {}
}
window.adminTeardownUI_ = adminTeardownUI_;

// ── LOGIN/LOGOUT ─────────────────────────────────────────────
function adminLogin() {
  isAdmin = true;
  window.isAdmin = true;
  const existing = typeof mkAuthGetSession === 'function' ? mkAuthGetSession() : null;
  const keepOperador = !!(existing && existing.nome && existing.role !== 'admin' && existing.id !== 'ADMIN');
  if (!keepOperador) {
    const admSess = {
      id: 'ADMIN',
      nome: 'Administrador',
      role: 'admin',
      hasPin: true,
      ativo: true,
      loggedAt: Date.now()
    };
    try {
      sessionStorage.setItem('mk_auth_session_v1', JSON.stringify(admSess));
      sessionStorage.setItem('mk_auth_session', JSON.stringify(admSess));
      if (typeof window.mkPersistAuthSession === 'function') window.mkPersistAuthSession();
    } catch (e) { /* ignore */ }
  } else {
    try {
      if (typeof window.mkPersistAuthSession === 'function') window.mkPersistAuthSession();
      localStorage.setItem('mk_admin_ui_persist', '1');
    } catch (e) { /* ignore */ }
  }
  const app = document.getElementById('app');
  if (app) app.style.display = 'flex';
  const gate = document.getElementById('mk-auth-gate');
  if (gate) gate.style.display = 'none';
  if (typeof mkAuthTouchActivity_ === 'function') mkAuthTouchActivity_();
  wireAdminIdleListeners_();
  if (!adminTimerInt) adminTimerInt = setInterval(tickAdmin, 1000);
  showAdminSidebar();
  showPage('home');
  if (!kpiData) carregarKPIs();
  try { localStorage.removeItem('mk_inicio_cache'); } catch(e) {}
  if (typeof syncController === 'function') syncController(true, 0);
  carregarHistRelatorios();
  carregarConfig(); // Fase 6: carrega templates WA
  if (typeof refreshOperadoresAdmin_ === 'function') refreshOperadoresAdmin_();
  if (typeof atualizarOperadorUI_ === 'function') atualizarOperadorUI_();
  if (typeof mkAuthRefreshSessaoTurno_ === 'function') mkAuthRefreshSessaoTurno_();
  if (typeof mkMetaRefresh_ === 'function') mkMetaRefresh_();
  if (typeof applyRoleNav_ === 'function') applyRoleNav_();
  else {
    const gerBtn = document.getElementById('sb-gerenciar-btn');
    if (gerBtn) gerBtn.style.display = 'none';
  }
}

function adminLogout() {
  const sessaoAdmin = typeof mkAuthGetSession === 'function' && mkAuthGetSession() &&
    mkAuthGetSession().role === 'admin';
  adminTeardownUI_();
  if (typeof mkAuthExitAdmin_ === 'function') mkAuthExitAdmin_();
  if (!sessaoAdmin) {
    if (typeof syncController === 'function') syncController(true, 0);
    showPage('home');
    if (typeof atualizarOperadorUI_ === 'function') atualizarOperadorUI_();
    if (typeof mkAuthRefreshSessaoTurno_ === 'function') mkAuthRefreshSessaoTurno_();
    toast('Modo administrativo encerrado', 'warning');
  }
}

function fmtAdminTimer_(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return String(m) + ':' + String(s).padStart(2, '0');
}

function resetAdminTimer() {
  if (!isAdmin) return;
  if (typeof mkAuthTouchActivity_ === 'function') mkAuthTouchActivity_();
}

function tickAdmin() {
  if (!isAdmin) return;
  const remMs = typeof mkAuthIdleRemainingMs_ === 'function'
    ? mkAuthIdleRemainingMs_()
    : ADMIN_IDLE_SEC * 1000;
  const paused = typeof mkHasLocacaoAbertaNoTablet_ === 'function' && mkHasLocacaoAbertaNoTablet_();
  const sec = Math.max(0, Math.ceil(remMs / 1000));
  const t = fmtAdminTimer_(sec) + (paused ? ' ⏸' : '');
  document.querySelectorAll('.admin-timer').forEach(el => { el.textContent = t; });
  if (paused) return;
  if (remMs <= 0) {
    if (typeof trocarOperador === 'function') trocarOperador('inatividade');
    else adminTeardownUI_();
  }
}

function irAdmin(page) {
  resetAdminTimer();
  if (typeof sbSetAdminNavOpen_ === 'function') sbSetAdminNavOpen_(true, true);
  if (window.innerWidth < 1024 && typeof mobMenuClose_ === 'function') mobMenuClose_();
  showPage(page);
  if (page === 'dashboard') {
    carregarKPIsDashboard();
  }
  if (page === 'relatorio') {
    initRelMesSel();
    carregarHistRelatorios();
  }
  if (page === 'config') { irParaConfig(); }
  if (page === 'caixa') inicializarCaixa();
  if (page === 'operadores') {
    if (typeof refreshOperadoresAdmin_ === 'function') refreshOperadoresAdmin_();
    if (typeof mkAuthRefreshSessaoTurno_ === 'function') mkAuthRefreshSessaoTurno_();
  }
  if (page === 'admin') {
    if (!kpiData) carregarKPIs();
    else atualizarHubAdmin_();
  }
  if (page === 'sistema') {
    setTimeout(atualizarDiagnostico, 100);
    setTimeout(carregarResumoOperacaoConfig_, 120);
    setTimeout(carregarAuditoriaAdmin_, 150);
    if (!kpiData) carregarKPIs();
  }
}

const OPCFG_TIPOS_ = ['Carro', 'Triciclo', 'Pelúcia'];
const OPCFG_PLANOS_ = ['10min', '20min', '30min', '40min', '60min', '3h'];
let opCfgEditorTab_ = 'Carro';
let opCfgPreviewTab_ = 'Carro';
let opCfgDraftPrecos_ = null;

function opCfgInferTipo_(nome) {
  const n = String(nome || '');
  if (n.indexOf('Triciclo') >= 0) return 'Triciclo';
  if (n.indexOf('Pel') >= 0) return 'Pelúcia';
  return 'Carro';
}

function opCfgEmptyPrecos_() {
  const out = {};
  OPCFG_TIPOS_.forEach(tipo => {
    out[tipo] = {};
    OPCFG_PLANOS_.forEach(pl => { out[tipo][pl] = { valor: 0, mins: 0, adicional: 0 }; });
  });
  return out;
}

function opCfgNormalizePrecos_(src) {
  const out = opCfgEmptyPrecos_();
  if (!src || typeof src !== 'object') return out;
  OPCFG_TIPOS_.forEach(tipo => {
    const plans = src[tipo] || {};
    OPCFG_PLANOS_.forEach(pl => {
      const c = plans[pl];
      if (!c) return;
      out[tipo][pl] = {
        valor: Number(c.valor != null ? c.valor : c.v),
        mins: Number(c.mins != null ? c.mins : c.m),
        adicional: Number(c.adicional != null ? c.adicional : c.a)
      };
    });
  });
  return out;
}

function opCfgDraftPrecosEnsure_() {
  if (!opCfgDraftPrecos_) opCfgDraftPrecos_ = opCfgEmptyPrecos_();
  return opCfgDraftPrecos_;
}

function opCfgSavePrecosPanelToDraft_() {
  const precos = opCfgDraftPrecosEnsure_();
  document.querySelectorAll('.mk-opcfg-p-val').forEach(inp => {
    const tipo = inp.getAttribute('data-tipo');
    const pl = inp.getAttribute('data-plano');
    if (!tipo || !pl || !precos[tipo]) return;
    precos[tipo][pl].valor = Number(inp.value || 0);
  });
  document.querySelectorAll('.mk-opcfg-p-mins').forEach(inp => {
    const tipo = inp.getAttribute('data-tipo');
    const pl = inp.getAttribute('data-plano');
    if (!tipo || !pl || !precos[tipo]) return;
    precos[tipo][pl].mins = Number(inp.value || 0);
  });
  document.querySelectorAll('.mk-opcfg-p-adic').forEach(inp => {
    const tipo = inp.getAttribute('data-tipo');
    const pl = inp.getAttribute('data-plano');
    if (!tipo || !pl || !precos[tipo]) return;
    precos[tipo][pl].adicional = Number(inp.value || 0);
  });
}

function opCfgSyncTextareasFromVisual_() {
  const taV = document.getElementById('mk-opcfg-veiculos-ta');
  const taP = document.getElementById('mk-opcfg-precos-ta');
  const data = opCfgCollectFromDom_(false);
  if (taV) taV.value = data.veiculos.join('\n');
  if (taP) taP.value = JSON.stringify(data.precos, null, 2);
}

function opCfgRenderVeiculos_(veiculosOverride) {
  const box = document.getElementById('mk-opcfg-veic-list');
  if (!box) return;
  const list = veiculosOverride || opCfgCollectVeiculosFromDom_();
  const rows = list.map((nome, i) => {
    const tipo = opCfgInferTipo_(nome);
    return `<div class="mk-opcfg-veic-row" data-idx="${i}">
      <input type="text" class="form-input mk-opcfg-veic-nome" value="${escHtml(nome)}" placeholder="Ex: Carro 04" maxlength="40">
      <select class="form-input mk-opcfg-veic-tipo">
        ${OPCFG_TIPOS_.map(t => `<option value="${t}"${t === tipo ? ' selected' : ''}>${t}</option>`).join('')}
      </select>
      <button type="button" class="btn btn-secondary" style="padding:6px 8px" onclick="opCfgRemoveVeiculo_(${i})" title="Remover">✕</button>
    </div>`;
  }).join('');
  box.innerHTML = rows || '<p style="font-size:12px;color:var(--txt3);margin:0">Nenhum veículo — adicione abaixo.</p>';
}

function opCfgRenderPrecosTabs_() {
  const tabs = document.getElementById('mk-opcfg-precos-tabs');
  if (!tabs) return;
  tabs.innerHTML = OPCFG_TIPOS_.map(t =>
    `<button type="button" class="mk-opcfg-tab${t === opCfgEditorTab_ ? ' sel' : ''}" onclick="opCfgSelectPrecosTab_('${t}')">${t}</button>`
  ).join('');
  opCfgRenderPrecosPanel_();
}

function opCfgCollectVeiculosFromDom_() {
  const veiculos = [];
  document.querySelectorAll('#mk-opcfg-veic-list .mk-opcfg-veic-row').forEach(row => {
    const nomeInp = row.querySelector('.mk-opcfg-veic-nome');
    const nome = nomeInp ? String(nomeInp.value || '').trim() : '';
    if (nome) veiculos.push(nome);
  });
  return veiculos;
}

function opCfgRenderPrecosPanel_() {
  const panel = document.getElementById('mk-opcfg-precos-panel');
  if (!panel) return;
  const precos = opCfgDraftPrecosEnsure_();
  const tipo = opCfgEditorTab_;
  const rows = OPCFG_PLANOS_.map(pl => {
    const c = (precos[tipo] && precos[tipo][pl]) || { valor: 0, mins: 0, adicional: 0 };
    return `<tr>
      <td><strong>${PLANO_LABELS[pl] || pl}</strong></td>
      <td><input type="number" min="0" step="0.01" class="mk-opcfg-p-val" data-tipo="${tipo}" data-plano="${pl}" value="${c.valor || ''}" placeholder="0"></td>
      <td><input type="number" min="1" step="1" class="mk-opcfg-p-mins" data-tipo="${tipo}" data-plano="${pl}" value="${c.mins || ''}" placeholder="0"></td>
      <td><input type="number" min="0" step="0.01" class="mk-opcfg-p-adic" data-tipo="${tipo}" data-plano="${pl}" value="${c.adicional || ''}" placeholder="0"></td>
    </tr>`;
  }).join('');
  panel.innerHTML = `<table class="mk-opcfg-precos-table">
    <thead><tr><th>Plano</th><th>Valor R$</th><th>Minutos</th><th>Extra/min R$</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function opCfgRenderPreviewTabs_() {
  const tabs = document.getElementById('mk-opcfg-prev-tabs');
  if (!tabs) return;
  tabs.innerHTML = OPCFG_TIPOS_.map(t =>
    `<button type="button" class="mk-opcfg-prev-tab${t === opCfgPreviewTab_ ? ' sel' : ''}" onclick="opCfgSelectPreviewTab_('${t}')">${t}</button>`
  ).join('');
}

function opCfgAtualizarPreview_() {
  opCfgRenderPreviewTabs_();
  const box = document.getElementById('mk-opcfg-preview');
  if (!box) return;
  const precos = opCfgCollectFromDom_(false).precos;
  const tipo = opCfgPreviewTab_;
  const plans = precos[tipo] || {};
  const badgeCls = tipo === 'Pelúcia' ? 'pelucia' : '';
  box.innerHTML = OPCFG_PLANOS_.map(pl => {
    const v = plans[pl] || {};
    const val = Number(v.valor || 0);
    const mins = Number(v.mins || 0);
    const adic = Number(v.adicional || 0);
    if (!(val > 0) || !(mins > 0)) {
      return `<div class="plano-btn ${badgeCls}" style="opacity:.45">
        <div><div class="pb-nome">${PLANO_LABELS[pl] || pl}</div><div class="pb-det">incompleto</div></div>
      </div>`;
    }
    return `<div class="plano-btn ${badgeCls}">
      <div>
        <div class="pb-nome">${PLANO_LABELS[pl] || pl}</div>
        <div class="pb-det">${mins} min · R$ ${String(adic).replace('.', ',')}/min extra</div>
      </div>
      <div class="pb-val">R$ ${val}</div>
    </div>`;
  }).join('');
  opCfgSyncTextareasFromVisual_();
}

function opCfgRenderEditor_() {
  opCfgRenderVeiculos_();
  opCfgRenderPrecosTabs_();
  opCfgAtualizarPreview_();
}

function opCfgSelectPrecosTab_(tipo) {
  opCfgSavePrecosPanelToDraft_();
  opCfgEditorTab_ = tipo;
  opCfgRenderPrecosTabs_();
}

function opCfgSelectPreviewTab_(tipo) {
  opCfgPreviewTab_ = tipo;
  opCfgAtualizarPreview_();
}

function opCfgAddVeiculo_() {
  opCfgSavePrecosPanelToDraft_();
  const veiculos = opCfgCollectVeiculosFromDom_();
  const n = veiculos.length + 1;
  const tipo = opCfgEditorTab_ || 'Carro';
  const prefix = tipo === 'Triciclo' ? 'Triciclo' : (tipo === 'Pelúcia' ? 'Pelúcia' : 'Carro');
  veiculos.push(prefix + ' ' + String(n).padStart(2, '0'));
  opCfgRenderVeiculos_(veiculos);
  opCfgSyncTextareasFromVisual_();
}

function opCfgRemoveVeiculo_(idx) {
  opCfgSavePrecosPanelToDraft_();
  const veiculos = opCfgCollectVeiculosFromDom_();
  veiculos.splice(idx, 1);
  opCfgRenderVeiculos_(veiculos);
  opCfgSyncTextareasFromVisual_();
}

function opCfgLoadIntoEditor_(cfg) {
  const veiculos = Array.isArray(cfg.veiculos_validos) ? cfg.veiculos_validos.slice() : [];
  let precos = null;
  if (cfg.precosFe) {
    const gasPrecos = {};
    Object.keys(cfg.precosFe).forEach(tipo => {
      gasPrecos[tipo] = {};
      Object.entries(cfg.precosFe[tipo] || {}).forEach(([plano, c]) => {
        gasPrecos[tipo][plano] = { valor: c.v, mins: c.m, adicional: c.a };
      });
    });
    precos = gasPrecos;
  } else if (cfg.precos) {
    precos = cfg.precos;
  }
  const taV = document.getElementById('mk-opcfg-veiculos-ta');
  const taP = document.getElementById('mk-opcfg-precos-ta');
  opCfgDraftPrecos_ = opCfgNormalizePrecos_(precos);
  if (taV) taV.value = veiculos.join('\n');
  if (taP) taP.value = JSON.stringify(opCfgDraftPrecos_, null, 2);
  opCfgRenderVeiculos_(veiculos);
  opCfgRenderPrecosTabs_();
  opCfgAtualizarPreview_();
}

function opCfgCollectFromDom_(validate) {
  opCfgSavePrecosPanelToDraft_();
  const veiculos = opCfgCollectVeiculosFromDom_();
  const precos = JSON.parse(JSON.stringify(opCfgDraftPrecosEnsure_()));
  if (validate) {
    if (!veiculos.length) throw new Error('Adicione pelo menos um veículo.');
    const seen = {};
    veiculos.forEach(v => {
      if (seen[v]) throw new Error('Veículo duplicado: ' + v);
      seen[v] = true;
    });
    let temPlano = false;
    OPCFG_TIPOS_.forEach(tipo => {
      OPCFG_PLANOS_.forEach(pl => {
        const c = precos[tipo][pl];
        if (c.valor > 0 && c.mins > 0) temPlano = true;
        if ((c.valor > 0 || c.mins > 0 || c.adicional > 0) && !(c.valor > 0 && c.mins > 0)) {
          throw new Error('Plano incompleto: ' + tipo + ' · ' + (PLANO_LABELS[pl] || pl));
        }
      });
    });
    if (!temPlano) throw new Error('Informe valor e minutos em pelo menos um plano.');
  }
  return { veiculos, precos };
}

async function carregarResumoOperacaoConfig_() {
  const fonte = document.getElementById('mk-opcfg-fonte');
  const veic = document.getElementById('mk-opcfg-veic');
  const tipos = document.getElementById('mk-opcfg-tipos');
  const alert = document.getElementById('mk-opcfg-alert');
  const editor = document.getElementById('mk-opcfg-editor');
  const btnToggle = document.getElementById('mk-btn-toggle-opcfg');
  const isAdm = (typeof mkAuthIsAdmin === 'function' && mkAuthIsAdmin()) || !!window.isAdmin;
  if (btnToggle) btnToggle.style.display = isAdm ? '' : 'none';
  if (editor && !isAdm) editor.style.display = 'none';
  try {
    const d = await api({ action: 'diagnosticoConfigOperacional' });
    if (!d || !d.ok) return;
    if (fonte) fonte.textContent = (d.fonte || '—') + (d.okConfig ? ' ✓' : ' (fallback)');
    if (veic) veic.textContent = String((d.resumo && d.resumo.veiculos) || '—');
    if (tipos) tipos.textContent = ((d.resumo && d.resumo.tipos) || []).join(', ') || '—';
    if (alert) {
      const probs = d.problemas || [];
      if (probs.length) {
        alert.style.display = 'block';
        alert.textContent = probs.join(' · ');
      } else {
        alert.style.display = 'none';
        alert.textContent = '';
      }
    }
    if (isAdm) {
      const cfg = await api({ action: 'carregarOperacaoConfig' });
      if (cfg && cfg.ok && cfg.config) opCfgLoadIntoEditor_(cfg.config);
    }
  } catch (e) { console.warn('carregarResumoOperacaoConfig_', e); }
}

function toggleEditorOperacaoConfig_() {
  const el = document.getElementById('mk-opcfg-editor');
  if (!el) return;
  const open = el.style.display === 'none' || !el.style.display;
  el.style.display = open ? 'block' : 'none';
  if (open) opCfgRenderEditor_();
}

async function salvarOperacaoConfigAdmin_() {
  if (!(typeof mkAuthIsAdmin === 'function' && mkAuthIsAdmin()) && !window.isAdmin) {
    toast('Somente administrador pode alterar frota e preços', 'error');
    return;
  }
  let veiculos = [];
  let precos = null;
  const editorOpen = document.getElementById('mk-opcfg-editor')?.style.display !== 'none';
  try {
    if (editorOpen) {
      const data = opCfgCollectFromDom_(true);
      veiculos = data.veiculos;
      precos = data.precos;
      opCfgSyncTextareasFromVisual_();
    } else {
      const taV = document.getElementById('mk-opcfg-veiculos-ta');
      const taP = document.getElementById('mk-opcfg-precos-ta');
      veiculos = (taV && taV.value ? taV.value.split('\n') : []).map(v => v.trim()).filter(Boolean);
      if (taP && taP.value.trim()) precos = JSON.parse(taP.value);
    }
  } catch (e) {
    toast(e.message || 'Dados inválidos', 'error');
    return;
  }
  try {
    const d = await api({
      action: 'salvarOperacaoConfigAdmin',
      veiculos_validos_json: JSON.stringify(veiculos),
      precos_json: precos ? JSON.stringify(precos) : undefined,
      ...apiParamsComAuth_()
    });
    if (!d || !d.ok) {
      toast((d && d.erro) || 'Erro ao salvar', 'error');
      return;
    }
    if (d.config) aplicarOperacaoConfig_(d.config);
    toast(d.mensagem || 'Configuração salva', 'success');
    atualizarVeiculoGrid();
    renderPainel();
    carregarResumoOperacaoConfig_();
    syncController(true, 0);
  } catch (e) {
    toast('Erro de conexão', 'error');
  }
}

// ── KPIs ─────────────────────────────────────────────────────
function fmtDataBrHoje_() {
  const hoje = new Date();
  const pad = n => String(n).padStart(2, '0');
  return pad(hoje.getDate()) + '/' + pad(hoje.getMonth() + 1) + '/' + hoje.getFullYear();
}

function nHojeCanonica_() {
  if (resumoDiaHoje && resumoDiaHoje.n != null) return resumoDiaHoje.n;
  if (kpiData && kpiData.nHoje != null) return kpiData.nHoje;
  return 0;
}

function fatHojeCanonica_(d) {
  if (resumoDiaHoje && resumoDiaHoje.fat != null) return Number(resumoDiaHoje.fat);
  if (d && d.fatHoje != null) return Number(d.fatHoje);
  if (kpiData && kpiData.fatHoje != null) return Number(kpiData.fatHoje);
  return 0;
}

function kpiHubStub_() {
  return { ok: true, nHoje: nHojeCanonica_() };
}

async function carregarResumoHojeAdmin_() {
  const authP = apiParamsComAuth_();
  const resumo = await api({ action: 'resumoDia', data: fmtDataBrHoje_(), ...authP });
  if (resumo && resumo.ok) resumoDiaHoje = resumo;
}

/** Hub/Sistema: só resumoDia (leve). Dashboard usa carregarKPIsDashboard → kpiMes. */
async function carregarKPIs() {
  if (window._kpiHubInFlight) return;
  window._kpiHubInFlight = true;
  try {
    await carregarResumoHojeAdmin_();
    if (typeof atualizarHubAdmin_ === 'function') atualizarHubAdmin_();
    if (typeof showAdminHomeKpis === 'function') showAdminHomeKpis(kpiHubStub_());
  } catch (e) { console.error('carregarKPIs:', e); }
  finally { window._kpiHubInFlight = false; }
}

/** B2: Dashboard — kpiMes (visualização mensal). v1.8.5: cache SWR + lite→full. */
const KPI_DASH_CACHE_TTL_MS = 5 * 60 * 1000;

function kpiDashCacheKey_(mes, ano) {
  return 'mk_kpi_dash_' + mes + '_' + ano;
}

function kpiDashCacheGet_(mes, ano) {
  try {
    const raw = sessionStorage.getItem(kpiDashCacheKey_(mes, ano));
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (!o || !o.ts || !o.data || !o.data.ok) return null;
    if (Date.now() - o.ts > KPI_DASH_CACHE_TTL_MS) return null;
    return o.data;
  } catch (e) { return null; }
}

function kpiDashCacheSet_(mes, ano, data) {
  try {
    if (!data || !data.ok) return;
    sessionStorage.setItem(kpiDashCacheKey_(mes, ano), JSON.stringify({ ts: Date.now(), data: data }));
  } catch (e) {}
}

function kpiDashSetLoading_(on) {
  const el = document.getElementById('page-dashboard');
  if (!el) return;
  el.classList.toggle('mk-dash-loading', !!on);
}

function kpiDashApply_(d) {
  if (!d || !d.ok) return;
  kpiData = d;
  const dashPage = document.getElementById('page-dashboard');
  if (!dashPage || !dashPage.classList.contains('active')) return;
  renderDashboardCore_(d);
  if (typeof renderSemanasChart_ === 'function') renderSemanasChart_(d);
  requestAnimationFrame(function() {
    if (kpiData === d) renderChartsBody_(d);
  });
}

async function carregarKPIsDashboard(mes, ano) {
  if (window._kpiDashInFlight) {
    window._kpiDashPending = { mes: mes, ano: ano };
    return;
  }
  window._kpiDashInFlight = true;
  const mesEff = mes || new Date().getMonth() + 1;
  const anoEff = ano || new Date().getFullYear();
  const cached = kpiDashCacheGet_(mesEff, anoEff);
  if (cached) kpiDashApply_(cached);

  kpiDashSetLoading_(true);
  try {
    const authP = apiParamsComAuth_();
    const base = { action: 'kpiMes', mes: mesEff, ano: anoEff, ...authP };

    const dLite = await api(Object.assign({ lite: '1' }, base), 45000);
    if (!dLite || !dLite.ok) {
      if (!cached) {
        console.error('kpiMes falhou', dLite);
        if (typeof toast === 'function') toast('Dashboard: ' + ((dLite && dLite.erro) || 'erro ao carregar KPIs'), true);
      }
      return;
    }
    kpiDashApply_(dLite);
    kpiDashCacheSet_(mesEff, anoEff, dLite);

    if (dLite.lite) {
      const dFull = await api(base, 45000);
      if (dFull && dFull.ok) {
        kpiDashApply_(dFull);
        kpiDashCacheSet_(mesEff, anoEff, dFull);
      }
    }

    carregarResumoHojeAdmin_().catch(function() {});
    if (typeof showAdminHomeKpis === 'function') showAdminHomeKpis(kpiHubStub_());
    if (typeof atualizarHubAdmin_ === 'function') atualizarHubAdmin_();
  } catch (e) {
    console.error('carregarKPIsDashboard:', e);
    if (!cached && typeof toast === 'function') toast('Dashboard: erro de conexão', true);
  } finally {
    kpiDashSetLoading_(false);
    window._kpiDashInFlight = false;
    const pending = window._kpiDashPending;
    window._kpiDashPending = null;
    if (pending) carregarKPIsDashboard(pending.mes, pending.ano);
  }
}
// ── NOVO DASHBOARD v1.6.9 ────────────────────────────────────
const MESES_DB = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const R2 = v => 'R$ ' + Math.round(Number(v)).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.');
const pct2 = (v, tot) => tot > 0 ? Math.round(v / tot * 100) : 0;
const setText2 = (id, txt) => { const e = document.getElementById(id); if (e) e.textContent = txt; };

function mudarMesDash() {
  const sel = document.getElementById('dash-mes-sel');
  if (!sel || !kpiData) return;
  _semanaSelIdx = null;
  _semanaMesKey = null;
  carregarKPIsDashboard(parseInt(sel.value), kpiData.anoAtual || new Date().getFullYear());
}

let _semanaSelIdx = null;
let _semanaMesKey = null;

function resolverSemanaDefaultIdx_(semanas, d) {
  const hoje = new Date();
  const mesVista = d.mesAtual;
  const anoVista = d.anoAtual;
  if (mesVista === hoje.getMonth() + 1 && anoVista === hoje.getFullYear()) {
    const diaHoje = hoje.getDate();
    const idx = semanas.findIndex(s => diaHoje >= (s.diaIni || 0) && diaHoje <= (s.diaFim || 0));
    if (idx >= 0) return idx;
  }
  return typeof d.melhorSemanaIdx === 'number' ? d.melhorSemanaIdx : 0;
}

function renderSemanasChart_(d) {
  const grid = document.getElementById('mk-semana-grid');
  if (!grid) return;
  const semanas = d.porSemana || [];
  if (!semanas.length) {
    grid.innerHTML = '<p style="color:var(--txt3);font-size:12px;grid-column:1/-1">Sem dados de semanas neste mês.</p>';
    return;
  }
  const mesKey = (d.mesAtual || '') + '/' + (d.anoAtual || '');
  if (_semanaMesKey !== mesKey) {
    _semanaSelIdx = null;
    _semanaMesKey = mesKey;
  }
  if (_semanaSelIdx == null || _semanaSelIdx >= semanas.length) {
    _semanaSelIdx = resolverSemanaDefaultIdx_(semanas, d);
  }
  grid.innerHTML = semanas.map((sem, idx) => {
    const active = idx === _semanaSelIdx ? ' active' : '';
    const fatPct = sem.pctFat || 0;
    const nPct = sem.pctN || 0;
    return `<button type="button" class="mk-semana-card${active}" role="tab" aria-selected="${idx === _semanaSelIdx}"
      onclick="selecionarSemanaKpi_(${idx})" onmouseenter="selecionarSemanaKpi_(${idx},true)">
      <div class="mk-sem-hdr"><span class="mk-sem-lbl">${sem.label}</span><span class="mk-sem-per">${sem.periodo}</span></div>
      <div class="mk-sem-fat">${R2(sem.fat || 0)}</div>
      <div class="mk-sem-n">${sem.n || 0} atendimento(s)</div>
      <div class="mk-sem-bar-row"><span class="mk-sem-bar-lbl">R$</span><div class="mk-sem-bar-bg"><div class="mk-sem-bar-fill fat" style="width:${fatPct}%"></div></div></div>
      <div class="mk-sem-bar-row"><span class="mk-sem-bar-lbl">Atd</span><div class="mk-sem-bar-bg"><div class="mk-sem-bar-fill n" style="width:${nPct}%"></div></div></div>
    </button>`;
  }).join('');
  atualizarSemanaDetalhe_(semanas[_semanaSelIdx], d);
  const foot = document.getElementById('mk-semana-foot');
  if (foot) {
    const ml = d.melhorSemanaLabel || (semanas[d.melhorSemanaIdx] && semanas[d.melhorSemanaIdx].label) || '—';
    foot.textContent = 'Passe o mouse ou toque em uma semana para ver a leitura. Melhor receita: ' + ml + '.';
  }
}

window.selecionarSemanaKpi_ = function selecionarSemanaKpi_(idx, hoverOnly) {
  if (!kpiData || !kpiData.porSemana) return;
  _semanaSelIdx = idx;
  document.querySelectorAll('.mk-semana-card').forEach((el, i) => {
    el.classList.toggle('active', i === idx);
    el.setAttribute('aria-selected', i === idx ? 'true' : 'false');
  });
  atualizarSemanaDetalhe_(kpiData.porSemana[idx], kpiData);
};

function atualizarSemanaDetalhe_(sem, d) {
  if (!sem) return;
  const hdr = document.getElementById('mk-sem-detail-hdr');
  const ins = document.getElementById('mk-sem-insights');
  const dest = document.getElementById('mk-sem-melhor-dia');
  const kFat = document.getElementById('mk-sem-kpi-fat');
  const kN = document.getElementById('mk-sem-kpi-n');
  const kT = document.getElementById('mk-sem-kpi-ticket');
  if (hdr) hdr.textContent = sem.label + ' · dias ' + sem.periodo;
  if (kFat) kFat.textContent = R2(sem.fat || 0);
  if (kN) kN.textContent = String(sem.n || 0);
  if (kT) kT.textContent = sem.n > 0 ? R2(sem.ticketMedio || 0) : '—';
  if (dest) {
    const md = sem.melhorDia;
    if (md && md.fat > 0) {
      dest.innerHTML = '<strong>Melhor dia da semana:</strong> ' + md.diaSemana + ' ' + md.label +
        ' — ' + R2(md.fat) + ' · ' + (md.n || 0) + ' atend.' +
        (md.porque ? '<br><span style="opacity:.9">' + md.porque + '</span>' : '');
      dest.style.display = 'block';
    } else {
      dest.innerHTML = '<strong>Melhor dia da semana:</strong> sem movimento registrado neste período.';
      dest.style.display = 'block';
    }
  }
  if (ins) {
    const items = (sem.insights || []).slice();
    if (!items.length) items.push('Sem insights para esta semana.');
    ins.innerHTML = items.map(t => '<li>' + t + '</li>').join('');
  }
}

function fmtDeltaCockpit_(delta, suffix) {
  suffix = suffix || 'vs mês ant.';
  if (delta === null || delta === undefined) return '—';
  if (delta === 0) return '→ estável ' + suffix;
  if (delta > 0) return '↑ ' + delta + '% ' + suffix;
  return '↓ ' + Math.abs(delta) + '% ' + suffix;
}

function setDeltaEl_(id, delta, suffix) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = fmtDeltaCockpit_(delta, suffix);
  el.className = 'mk-exec-kpi-delta' + (delta > 0 ? ' up' : delta < 0 ? ' down' : '');
}

function mkAlertPeriodKey_(d) {
  return (d && d.mesAtual ? d.mesAtual : '') + '_' + (d && d.anoAtual ? d.anoAtual : '');
}

function mkAlertDismissKey_(codigo, d) {
  return 'mk_alert_dismiss_' + codigo + '_' + mkAlertPeriodKey_(d);
}

function mkAlertDismiss_(codigo) {
  if (!kpiData || !codigo) return;
  try { sessionStorage.setItem(mkAlertDismissKey_(codigo, kpiData), '1'); } catch (e) {}
  renderAlertStrip_(kpiData);
}

function mkAlertIcon_(nivel) {
  if (nivel === 'vermelho') return '🔴';
  if (nivel === 'amarelo') return '🟡';
  return '🔵';
}

function mkAlertModalClose_() {
  const m = document.getElementById('mk-alert-modal');
  if (m) m.hidden = true;
}

function mkAlertModalOpen_() {
  if (!kpiData || !kpiData.alertas) return;
  const list = document.getElementById('mk-alert-modal-list');
  const modal = document.getElementById('mk-alert-modal');
  if (!list || !modal) return;
  list.innerHTML = '';
  kpiData.alertas.forEach(function(a) {
    list.appendChild(mkAlertItemEl_(a, kpiData, true));
  });
  modal.hidden = false;
}

function mkAlertItemEl_(a, d, inModal) {
  const row = document.createElement('div');
  row.className = 'mk-alert-item ' + (a.nivel || 'info');
  const dismissed = (function() {
    try { return !!sessionStorage.getItem(mkAlertDismissKey_(a.codigo, d)); } catch (e) { return false; }
  })();
  if (dismissed && !inModal) return null;
  row.innerHTML =
    '<span class="mk-alert-item-icon">' + mkAlertIcon_(a.nivel) + '</span>' +
    '<div class="mk-alert-item-body">' +
      '<div class="mk-alert-item-title">' + (a.titulo || a.codigo || 'Alerta') + '</div>' +
      '<div class="mk-alert-item-msg">' + (a.mensagem || '') + '</div>' +
      (a.acionavel ? '<div class="mk-alert-item-act">' + a.acionavel + '</div>' : '') +
    '</div>' +
    (!inModal ? '<button type="button" class="mk-alert-item-dismiss" title="Dispensar nesta sessão">✕</button>' : '');
  if (!inModal) {
    const btn = row.querySelector('.mk-alert-item-dismiss');
    if (btn) btn.addEventListener('click', function() { mkAlertDismiss_(a.codigo); });
  }
  return row;
}

function updateDashAlertBadge_(d) {
  const badge = document.getElementById('sbn-dash-badge');
  if (!badge) return;
  const alertas = (d && d.alertas) || [];
  const crit = alertas.filter(function(a) {
    if (a.nivel !== 'vermelho') return false;
    try { return !sessionStorage.getItem(mkAlertDismissKey_(a.codigo, d)); } catch (e) { return true; }
  }).length;
  if (crit > 0) {
    badge.hidden = false;
    badge.textContent = String(crit);
    badge.setAttribute('aria-hidden', 'false');
  } else {
    badge.hidden = true;
    badge.textContent = '';
    badge.setAttribute('aria-hidden', 'true');
  }
}

function renderAlertStrip_(d) {
  const strip = document.getElementById('mk-alert-strip');
  if (!strip) return;
  const isAdm = (typeof mkAuthIsAdmin === 'function' && mkAuthIsAdmin()) || !!window.isAdmin;
  if (!isAdm || !d || !d.ok || !d.alertas) {
    strip.style.display = 'none';
    updateDashAlertBadge_(null);
    return;
  }
  strip.innerHTML = '';
  const visible = [];
  (d.alertas || []).forEach(function(a) {
    const el = mkAlertItemEl_(a, d, false);
    if (el) visible.push(el);
  });
  updateDashAlertBadge_(d);
  if (!visible.length) {
    strip.style.display = 'none';
    return;
  }
  strip.style.display = '';
  visible.slice(0, 3).forEach(function(el) { strip.appendChild(el); });
  if (visible.length > 3 || (d.alertas && d.alertas.length > 3)) {
    const foot = document.createElement('div');
    foot.className = 'mk-alert-strip-foot';
    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'mk-alert-strip-more';
    more.textContent = 'Ver todos (' + d.alertas.length + ')';
    more.addEventListener('click', mkAlertModalOpen_);
    foot.appendChild(more);
    strip.appendChild(foot);
  }
}

function applySinalEmpresa_(d) {
  const box = document.getElementById('mk-exec-cockpit');
  const s = d && d.sinalEmpresa;
  if (box) {
    box.classList.remove('mk-sinal-ok', 'mk-sinal-atencao', 'mk-sinal-perigo');
    if (s && s.nivel) box.classList.add('mk-sinal-' + (s.nivel === 'ok' ? 'ok' : s.nivel === 'perigo' ? 'perigo' : 'atencao'));
  }
  const badge = document.getElementById('mk-exec-badge');
  if (badge && s) {
    badge.textContent = s.label || 'Gestão';
    badge.title = s.motivo || '';
    const colors = {
      ok: { bg: 'rgba(46,125,50,.12)', fg: '#2E7D32' },
      atencao: { bg: 'rgba(230,81,0,.12)', fg: '#E65100' },
      perigo: { bg: 'rgba(198,40,40,.12)', fg: '#C62828' }
    };
    const c = colors[s.nivel] || colors.atencao;
    badge.style.background = c.bg;
    badge.style.color = c.fg;
  }
}

function applyMargemSemaforo_(margem) {
  const kpi = document.getElementById('mk-exec-kpi-lucro');
  if (!kpi) return;
  kpi.classList.remove('mk-sem-verde', 'mk-sem-amarelo', 'mk-sem-vermelho');
  if (margem >= 18) kpi.classList.add('mk-sem-verde');
  else if (margem >= 10) kpi.classList.add('mk-sem-amarelo');
  else if (margem > 0) kpi.classList.add('mk-sem-vermelho');
}

/** FASE 14 — decomposição mini-DRE (tabela vertical). */
function renderMiniDreCascade_(d) {
  const box = document.getElementById('mk-dre-cascata');
  if (!box) return;
  const md = d && d.miniDre;
  if (!md || !(d.fatMes > 0)) {
    box.style.display = 'none';
    return;
  }
  box.style.display = '';
  setText2('mk-dre-fat', R2(md.fatMes || d.fatMes));
  setText2('mk-dre-cmv', '− ' + R2(md.cusCMV || 0));
  setText2('mk-dre-bruta', R2(md.margemBruta || 0));
  const bp = document.getElementById('mk-dre-bruta-pct');
  if (bp) bp.textContent = '(' + (md.margemBrutaPct != null ? md.margemBrutaPct : 0) + '%)';
  setText2('mk-dre-opex', '− ' + R2(md.cusOPEX || 0));
  setText2('mk-dre-cto', '− ' + R2(md.ctoPagar || d.ctoPagar || 0));
  setText2('mk-dre-oper', R2(md.margemOperacional != null ? md.margemOperacional : d.resultado));
  const op = document.getElementById('mk-dre-oper-pct');
  if (op) op.textContent = '(' + (md.margemOperacionalPct != null ? md.margemOperacionalPct : d.margem) + '%)';
  const badge = document.getElementById('mk-dre-plano-badge');
  if (badge) {
    badge.textContent = md.planoOk ? 'Plano de contas' : 'Mapeamento padrão';
    var tip = md.planoOk ? 'Categorias da aba PLANO_CONTAS' : 'Execute instalarAbaPlanoContas na planilha para categorias formais';
    if (md.cusSemPlano > 0) tip += ' · R$ ' + Math.round(md.cusSemPlano) + ' não mapeados';
    badge.title = tip;
  }
}

/** FASE 6 — faixa executiva (5 KPIs + narrativa GAS). */
function renderExecCockpit_(d) {
  const box = document.getElementById('mk-exec-cockpit');
  if (!box || !d) return;
  box.style.display = '';

  if (d.mesAtual && d.anoAtual) {
    setText2('mk-exec-periodo', MESES_DB[d.mesAtual - 1] + ' / ' + d.anoAtual);
  }

  setText2('mk-exec-fat', R2(d.fatMes || 0));
  const ck = d.cockpit || {};
  setDeltaEl_('mk-exec-fat-d', ck.deltaFatMesPct);

  const margem = Number(d.margem) || 0;
  applyMargemSemaforo_(margem);

  const resEl = document.getElementById('mk-exec-resultado');
  const resultado = Number(d.resultado) || 0;
  if (resEl) {
    resEl.textContent = R2(resultado);
    resEl.className = 'mk-exec-kpi-val ' + (resultado >= 0 ? 'green' : 'red');
  }
  const resD = document.getElementById('mk-exec-res-d');
  if (resD) {
    const nLoc = (d.nMes || 0) + ' locações · margem ' + margem + '%';
    if (margem >= 20) { resD.textContent = nLoc; resD.className = 'mk-exec-kpi-delta up'; }
    else if (margem >= 10) { resD.textContent = nLoc; resD.className = 'mk-exec-kpi-delta'; }
    else if (margem > 0) { resD.textContent = nLoc; resD.className = 'mk-exec-kpi-delta down'; }
    else { resD.textContent = nLoc; resD.className = 'mk-exec-kpi-delta down'; }
  }

  const pb = d.payback;
  const pbEl = document.getElementById('mk-exec-payback');
  const pbD = document.getElementById('mk-exec-pb-d');
  if (pb && pb.ok && pb.investimentoTotal > 0) {
    if (pbEl) {
      pbEl.textContent = pb.paybackAtingido ? '100%' : ((pb.pctRecuperado || 0) + '%');
      pbEl.className = 'mk-exec-kpi-val ' + (pb.paybackAtingido ? 'green' : 'purple');
    }
    if (pbD) {
      pbD.textContent = pb.paybackAtingido ? 'Investimento recuperado' : ('Faltam ' + R2(pb.faltaRecuperar || 0));
      pbD.className = 'mk-exec-kpi-delta' + (pb.paybackAtingido ? ' up' : '');
    }
  } else {
    if (pbEl) { pbEl.textContent = '—'; pbEl.className = 'mk-exec-kpi-val purple'; }
    if (pbD) pbD.textContent = 'Cadastre aba INVESTIMENTO';
  }

  const occ = d.ocupacaoMediaFrota != null ? d.ocupacaoMediaFrota : ck.ocupacaoMediaFrota;
  setText2('mk-exec-ocup', occ != null ? (occ + '%') : '—');
  const occD = document.getElementById('mk-exec-ocup-d');
  if (occD) {
    const o = Number(occ) || 0;
    if (o >= 40) { occD.textContent = 'Boa utilização'; occD.className = 'mk-exec-kpi-delta up'; }
    else if (o >= 25) { occD.textContent = 'Espaço para crescer'; occD.className = 'mk-exec-kpi-delta'; }
    else if (o > 0) { occD.textContent = 'Ocupação baixa'; occD.className = 'mk-exec-kpi-delta down'; }
    else { occD.textContent = 'Sem locações no mês'; occD.className = 'mk-exec-kpi-delta'; }
  }

  const nar = document.getElementById('mk-exec-narrativa');
  if (nar) {
    var text = d.narrativaExecutiva || 'Leitura executiva indisponível — publique GAS v1.5.75+.';
    text = text.replace(/\s*CLT simulado[\s\S]*?\/mês\.\s*/i, ' ');
    nar.textContent = text.trim();
  }

  if (d.sinalEmpresa) {
    applySinalEmpresa_(d);
  } else {
    const badge = document.getElementById('mk-exec-badge');
    if (badge) {
      badge.textContent = resultado >= 0 && margem >= 10 ? 'Sustentável' : (resultado >= 0 ? 'Atenção' : 'Crítico');
      badge.style.background = resultado >= 0 && margem >= 10 ? 'rgba(46,125,50,.12)' : (resultado >= 0 ? 'rgba(230,81,0,.12)' : 'rgba(198,40,40,.12)');
      badge.style.color = resultado >= 0 && margem >= 10 ? '#2E7D32' : (resultado >= 0 ? '#E65100' : '#C62828');
    }
  }
  renderMiniDreCascade_(d);
}

/** Seção 2 — comparativo lucro e meta loc/dia (sem vs com folha, mesma base). */
function setDecisaoCell_(id, val, margem, sub, forceColor) {
  const el = document.getElementById(id);
  if (!el) return;
  const n = Number(val) || 0;
  const color = forceColor || (n >= 0 ? '#2E7D32' : '#C62828');
  var html = '<div class="mk-dec-val" style="color:' + color + '">' + R2(n) + '</div>';
  if (margem != null && margem !== '') {
    html += '<div class="mk-dec-marg">' + margem + '% margem</div>';
  }
  if (sub) html += '<div class="mk-dec-sub">' + sub + '</div>';
  el.innerHTML = html;
}

function setDecisaoBeCell_(id, be, mediaLocDia, diasOp, projOk) {
  const el = document.getElementById(id);
  if (!el || be == null) return;
  var sub = 'Ritmo: ' + mediaLocDia + ' loc/dia (' + diasOp + ' dias)';
  if (mediaLocDia > 0) {
    sub += ' · ' + (mediaLocDia >= be ? 'volume acima da meta ✓' : 'faltam ~' + Math.max(0, Math.ceil(be - mediaLocDia)) + ' loc/dia');
  }
  if (projOk != null) {
    sub += ' · projeção mês ' + (projOk ? 'positiva ✓' : 'negativa');
  }
  el.innerHTML = '<div class="mk-dec-val blue">' + be + ' loc/dia</div><div class="mk-dec-sub">' + sub + '</div>';
}

/** Mapa dia → n locações (porSemana ou locPorDia do GAS). */
function extractLocPorDia_(d) {
  const map = {};
  if (d && d.locPorDia && d.locPorDia.length) {
    d.locPorDia.forEach(function(x) { map[x.dia] = Number(x.n) || 0; });
    return map;
  }
  (d.porSemana || []).forEach(function(sem) {
    (sem.porDia || []).forEach(function(x) { map[x.dia] = Number(x.n) || 0; });
  });
  return map;
}

function mkMetaStatus_(n, meta) {
  if (meta == null || meta <= 0) return { ok: null, faltam: null };
  const nn = Number(n) || 0;
  return { ok: nn >= meta, faltam: Math.max(0, meta - nn) };
}

function renderMetaHoje_(d) {
  const box = document.getElementById('mk-meta-hoje');
  if (!box || !d) return;
  const lf = d.leadingFinanceiro;
  const beSem = lf && lf.breakEvenLocacoesDia;
  const beFolha = lf && lf.breakEvenComFolha;
  const now = new Date();
  const isMesAtual = d.mesAtual === now.getMonth() + 1 && d.anoAtual === now.getFullYear();
  if (!isMesAtual || beSem == null) {
    box.style.display = 'none';
    return;
  }
  const locMap = extractLocPorDia_(d);
  const nHoje = d.nHoje != null ? Number(d.nHoje) : (locMap[now.getDate()] || 0);
  box.style.display = '';

  const mesStr = String(d.mesAtual).padStart(2, '0');
  setText2('mk-meta-hoje-data', now.getDate() + '/' + mesStr + '/' + (d.anoAtual || now.getFullYear()));

  const stSem = mkMetaStatus_(nHoje, beSem);
  const cardSem = document.getElementById('mk-meta-hoje-sem');
  setText2('mk-meta-hoje-sem-val', nHoje + ' / ' + beSem + (stSem.ok ? ' ✓' : ' ✗'));
  setText2('mk-meta-hoje-sem-sub', stSem.ok
    ? ('Meta sem folha batida (+ ' + (nHoje - beSem) + ' loc)')
    : ('Faltam ' + stSem.faltam + ' loc para o break-even do dia'));
  if (cardSem) cardSem.classList.toggle('ok', !!stSem.ok);
  if (cardSem) cardSem.classList.toggle('fail', stSem.ok === false);

  const cardFolha = document.getElementById('mk-meta-hoje-folha');
  if (beFolha == null) {
    setText2('mk-meta-hoje-folha-val', '—');
    setText2('mk-meta-hoje-folha-sub', 'Configure aba FOLHA para simular');
    if (cardFolha) { cardFolha.classList.remove('ok', 'fail'); }
  } else {
    const stF = mkMetaStatus_(nHoje, beFolha);
    setText2('mk-meta-hoje-folha-val', nHoje + ' / ' + beFolha + (stF.ok ? ' ✓' : ' ✗'));
    setText2('mk-meta-hoje-folha-sub', stF.ok
      ? ('Meta com folha batida (+ ' + (nHoje - beFolha) + ' loc)')
      : ('Faltam ' + stF.faltam + ' loc com folha simulada'));
    if (cardFolha) cardFolha.classList.toggle('ok', !!stF.ok);
    if (cardFolha) cardFolha.classList.toggle('fail', stF.ok === false);
  }
}

function renderMetaDiaChart_(d) {
  const cv = document.getElementById('chart-meta-dia');
  const ins = document.getElementById('nk-meta-dia-insight');
  if (!cv || !window.Chart) return;
  if (chartMetaDia) chartMetaDia.destroy();

  const lf = d.leadingFinanceiro || {};
  const beSem = lf.breakEvenLocacoesDia;
  const beFolha = lf.breakEvenComFolha;
  const locMap = extractLocPorDia_(d);
  const hojeD = (d.mesAtual === new Date().getMonth() + 1 && d.anoAtual === new Date().getFullYear())
    ? new Date().getDate()
    : (d.fatPorDia || []).reduce(function(m, x) { return Math.max(m, x.dia || 0); }, 0);
  const mesStr = String(d.mesAtual || new Date().getMonth() + 1).padStart(2, '0');

  const dias = [];
  for (let dd = 1; dd <= hojeD; dd++) dias.push(dd);

  if (!dias.length || beSem == null) {
    setText2('nk-meta-dia-label', beSem == null ? 'break-even indisponível' : 'sem dias no mês');
    if (ins) ins.style.display = 'none';
    return;
  }

  const locVals = dias.map(function(dd) { return locMap[dd] || 0; });
  const ptBg = dias.map(function(dd) {
    const n = locMap[dd] || 0;
    if (n <= 0) return '#BDBDBD';
    return n >= beSem ? '#2E7D32' : '#C62828';
  });
  const ptBorder = dias.map(function(dd) {
    const n = locMap[dd] || 0;
    if (n <= 0 || beFolha == null) return '#185FA5';
    return n >= beFolha ? '#5E35B1' : '#FF8F00';
  });

  let hitSem = 0, hitFolha = 0, diasMov = 0;
  dias.forEach(function(dd) {
    const n = locMap[dd] || 0;
    if (n <= 0) return;
    diasMov++;
    if (n >= beSem) hitSem++;
    if (beFolha != null && n >= beFolha) hitFolha++;
  });

  setText2('nk-meta-dia-label',
    diasMov > 0
      ? ('sem folha ' + hitSem + '/' + diasMov + ' · com folha ' + (beFolha != null ? hitFolha + '/' + diasMov : '—'))
      : 'nenhum dia com locação ainda');

  const maxY = Math.max(beSem, beFolha || 0, Math.max.apply(null, locVals.concat([1]))) + 2;
  const datasets = [
    {
      label: 'Locações',
      data: locVals,
      borderColor: '#29B6F6',
      backgroundColor: 'rgba(41,182,246,.14)',
      borderWidth: 2.5,
      pointRadius: dias.map(function(dd) { return (locMap[dd] || 0) > 0 ? 6 : 3; }),
      pointHoverRadius: 8,
      pointBackgroundColor: ptBg,
      pointBorderColor: ptBorder,
      pointBorderWidth: 2,
      tension: 0.25,
      fill: true,
      order: 1
    },
    {
      label: 'Meta sem folha',
      data: dias.map(function() { return beSem; }),
      borderColor: '#2E7D32',
      borderWidth: 2,
      borderDash: [6, 4],
      pointRadius: 0,
      tension: 0,
      fill: false,
      order: 0
    }
  ];
  if (beFolha != null) {
    datasets.push({
      label: 'Meta com folha',
      data: dias.map(function() { return beFolha; }),
      borderColor: '#5E35B1',
      borderWidth: 2,
      borderDash: [6, 4],
      pointRadius: 0,
      tension: 0,
      fill: false,
      order: 0
    });
  }

  chartMetaDia = new Chart(cv, {
    type: 'line',
    data: {
      labels: dias.map(function(dd) { return dd + '/' + mesStr; }),
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(ctx) {
              if (ctx.dataset.label !== 'Locações') {
                return ctx.dataset.label + ': ' + Math.round(ctx.parsed.y) + ' loc/dia';
              }
              const n = Math.round(ctx.parsed.y);
              const dd = dias[ctx.dataIndex];
              if (n <= 0) return 'Sem movimento';
              const parts = [n + ' locações'];
              const stS = mkMetaStatus_(n, beSem);
              parts.push(stS.ok ? '✓ sem folha' : '✗ sem folha (faltam ' + stS.faltam + ')');
              if (beFolha != null) {
                const stF = mkMetaStatus_(n, beFolha);
                parts.push(stF.ok ? '✓ com folha' : '✗ com folha (faltam ' + stF.faltam + ')');
              }
              return parts.join(' · ');
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 9 }, color: '#888', maxTicksLimit: 12, maxRotation: 0 }
        },
        y: {
          grid: { color: 'rgba(0,0,0,.06)' },
          ticks: { font: { size: 9 }, color: '#888', stepSize: 1, precision: 0 },
          min: 0,
          suggestedMax: maxY
        }
      }
    }
  });

  if (ins) {
    if (diasMov <= 0) {
      ins.style.display = 'none';
    } else {
      const pctSem = Math.round(hitSem / diasMov * 100);
      const msgs = [
        'Pontos verdes = bateu meta sem folha (' + beSem + ' loc); vermelhos = abaixo.',
        hitSem + ' de ' + diasMov + ' dias com movimento na meta sem folha (' + pctSem + '%).'
      ];
      if (beFolha != null) {
        const pctF = Math.round(hitFolha / diasMov * 100);
        msgs.push('Com folha (' + beFolha + ' loc): ' + hitFolha + ' de ' + diasMov + ' dias (' + pctF + '%). Borda roxa = bateu; laranja = abaixo.');
      }
      ins.style.display = 'block';
      ins.textContent = msgs.join(' ');
    }
  }
}

function renderDecisaoPanel_(d) {
  const panel = document.getElementById('mk-dash-decisao');
  if (!panel || !d) return;
  const lf = d.leadingFinanceiro;
  const v = d.viabilidadeContratacao;
  if (!lf && d.resultado == null) {
    panel.style.display = 'none';
    return;
  }
  panel.style.display = '';

  renderMetaHoje_(d);

  const diasOp = Number(d.diasOperando) || 0;
  const diasMes = Number(d.diasMes) || 30;
  setText2('mk-dec-dias-label', '(' + diasOp + ' de ' + diasMes + ' dias)');

  const resultado = Number(d.resultado) || 0;
  const margem = Number(d.margem) || 0;
  const projRes = Number(d.projecaoRes) || 0;
  const projFat = Number(d.projecaoFat) || 0;
  const margemProjSem = projFat > 0 ? Math.round(projRes / projFat * 1000) / 10 : 0;

  setDecisaoCell_('mk-dec-par-sem', resultado, margem, (d.nMes || 0) + ' locações no período');

  const folhaOk = v && v.ok;
  if (folhaOk) {
    const folhaPr = Number(v.folhaProRata) || 0;
    setDecisaoCell_('mk-dec-par-folha', v.resultadoComFolha, v.margemComFolha,
      'Folha proporcional ' + R2(folhaPr) + ' (de ' + R2(v.folhaMensal) + '/mês)');

    const projSem = v.projecaoResSemFolha != null ? v.projecaoResSemFolha : projRes;
    const margProjSem = v.margemProjSemFolha != null ? v.margemProjSemFolha : margemProjSem;
    setDecisaoCell_('mk-dec-proj-sem', projSem, margProjSem,
      'Fat. projetado ' + R2(v.projecaoFat || projFat));

    setDecisaoCell_('mk-dec-proj-folha', v.projecaoResComFolha, v.margemProjComFolha,
      'Folha integral ' + R2(v.folhaMensal) + '/mês');
  } else {
    ['mk-dec-par-folha', 'mk-dec-proj-folha'].forEach(function(id) {
      const el = document.getElementById(id);
      if (el) el.textContent = 'Configure aba FOLHA + GAS v1.5.81';
    });
    setDecisaoCell_('mk-dec-proj-sem', projRes, margemProjSem,
      'Fat. projetado ' + R2(projFat));
  }

  const mediaLocDia = (diasOp > 0 && d.nMes > 0)
    ? Math.round(d.nMes / diasOp * 10) / 10
    : 0;
  const be = lf && lf.breakEvenLocacoesDia;
  const beFolha = lf && lf.breakEvenComFolha;
  const projOkSem = projRes >= 0;
  const projOkFolha = folhaOk ? (Number(v.projecaoResComFolha) || 0) >= 0 : null;
  setDecisaoBeCell_('mk-dec-be-sem', be, mediaLocDia, diasOp, projOkSem);
  setDecisaoBeCell_('mk-dec-be-folha', beFolha, mediaLocDia, diasOp, projOkFolha);

  const base = document.getElementById('mk-decisao-base');
  if (base) {
    base.textContent = 'Mesma base por linha: até hoje usa fat/custos/CTO reais'
      + (folhaOk ? ' e folha proporcional (' + diasOp + '/' + diasMes + ' dias)' : '')
      + '; projeção extrapola o ritmo dos dias com movimento'
      + (folhaOk ? ' e desconta a folha mensal integral.' : '.');
  }

  const foot = document.getElementById('mk-decisao-foot');
  if (foot) {
    if (folhaOk && v.label) {
      foot.textContent = 'Semáforo contratação: ' + v.label + ' — ' + (v.recomendacao || v.motivo || '');
    } else if (be != null && beFolha != null) {
      foot.textContent = 'Meta loc/dia referencia custos do mês inteiro. Com folha: ' + beFolha + ' loc/dia vs sem folha: ' + be + ' loc/dia.';
    } else foot.textContent = '';
  }
}

function renderLeadingFinanceiro_(d) {
  const lf = d.leadingFinanceiro;
  const row = document.getElementById('mk-leading-row');
  const sens = document.getElementById('mk-leading-sens');
  if (!row || !lf) {
    if (row) row.style.display = 'none';
    if (sens) sens.style.display = 'none';
    return;
  }
  row.style.display = '';
  setText2('mk-lead-ticket', R2(lf.ticketMedio || 0));
  setText2('mk-lead-ticket-sub', (d.nMes || 0) + ' loc no mês');
  setText2('mk-lead-rhora', R2(lf.receitaPorHoraOperada || 0));
  setText2('mk-lead-rhora-sub', (d.diasOperando || 0) + ' dias × ' + (lf.receitaPorHoraOperada > 0 ? '12h/dia' : '—'));
  setText2('mk-lead-custoloc', R2(lf.custoPorLocacao || 0));
  setText2('mk-lead-custoloc-sub', '÷ ' + (d.nMes || 0) + ' loc · OPEX rateado');
  const be = lf.breakEvenLocacoesDia;
  setText2('mk-lead-be', be != null ? (be + ' loc') : '—');
  setText2('mk-lead-be-sub', lf.custoDiaMedio != null ? ('custo dia ~' + R2(lf.custoDiaMedio)) : '—');
  const beF = lf.breakEvenComFolha;
  setText2('mk-lead-be-folha', beF != null ? (beF + ' loc') : '—');
  setText2('mk-lead-be-folha-sub', lf.custoDiaComFolha != null ? ('custo dia c/ folha ~' + R2(lf.custoDiaComFolha)) : (lf.folhaMensalSimulada ? ('folha ' + R2(lf.folhaMensalSimulada)) : '—'));
  if (sens && lf.sensibilidade) {
    const s = lf.sensibilidade;
    const parts = [];
    if (s.fatMais10Pct) parts.push('Fat +10% → resultado ' + R2(s.fatMais10Pct.resultado) + ' (' + (s.fatMais10Pct.deltaResultado >= 0 ? '+' : '') + R2(s.fatMais10Pct.deltaResultado) + ')');
    if (s.custosMais10Pct) parts.push('Custos +10% → ' + R2(s.custosMais10Pct.resultado) + ' (Δ ' + R2(s.custosMais10Pct.deltaResultado) + ')');
    if (lf.impactoOcupacao5pp != null) parts.push('+5 pp ocupação ≈ ' + R2(lf.impactoOcupacao5pp) + ' no resultado/mês');
    if (parts.length) {
      sens.style.display = 'block';
      sens.textContent = parts.join(' · ');
    } else sens.style.display = 'none';
  }
}

var MK_GATE_LABELS_ = {
  negocioBasePositivo: 'Margem ≥10% sem folha CLT',
  projecaoCobreFolha: 'Projeção do mês cobre a folha',
  reservaAposFolha: 'Reserva ≥ R$ 2.500 após folha (projeção)',
  margemProjOk: 'Margem projetada com folha ≥ 18%',
  dadosSuficientes: '≥ 12 dias com locação no mês',
  fatProjMinimo: 'Faturamento projetado no piso sugerido'
};

/** FASE 9 — painel viabilidade contratação (aba FOLHA + P&L). */
function renderContratacaoPanel_(d) {
  const panel = document.getElementById('mk-contratacao-panel');
  const v = d && d.viabilidadeContratacao;
  if (!panel || !v || !v.ok) {
    if (panel) panel.style.display = 'none';
    return;
  }
  panel.style.display = '';
  panel.classList.remove('mk-contrat-verde', 'mk-contrat-amarelo', 'mk-contrat-vermelho');
  const cls = v.nivel === 'verde' ? 'mk-contrat-verde' : v.nivel === 'amarelo' ? 'mk-contrat-amarelo' : 'mk-contrat-vermelho';
  panel.classList.add(cls);

  const nf = (d.folhaPlanejamento && d.folhaPlanejamento.nFuncionarios) || v.nFuncionarios || 2;
  setText2('mk-contrat-title', nf + ' atendentes · ' + (v.label || 'Análise'));
  const badge = document.getElementById('mk-contrat-badge');
  if (badge) {
    badge.textContent = v.label || '—';
    badge.title = v.motivo || '';
  }

  setText2('mk-contrat-folha', R2(v.folhaMensal || 0));
  const resAt = document.getElementById('mk-contrat-res-atual');
  if (resAt) {
    resAt.textContent = R2(v.resultadoComFolha || 0);
    resAt.style.color = (v.resultadoComFolha || 0) >= 0 ? '#2E7D32' : '#C62828';
  }
  const resProj = document.getElementById('mk-contrat-res-proj');
  if (resProj) {
    resProj.textContent = R2(v.projecaoResComFolha || 0) + ' (' + (v.margemProjComFolha || 0) + '%)';
    resProj.style.color = (v.projecaoResComFolha || 0) >= 0 ? '#2E7D32' : '#C62828';
  }
  setText2('mk-contrat-fat-min', R2(v.fatMinimoSugerido || 0));

  const mot = document.getElementById('mk-contrat-motivo');
  if (mot) mot.textContent = v.motivo || '';

  const gatesEl = document.getElementById('mk-contrat-gates');
  if (gatesEl && v.gates) {
    gatesEl.innerHTML = '';
    Object.keys(MK_GATE_LABELS_).forEach(function(key) {
      const li = document.createElement('li');
      const ok = !!v.gates[key];
      li.className = ok ? 'ok' : 'fail';
      li.textContent = (ok ? '✓ ' : '✗ ') + MK_GATE_LABELS_[key];
      gatesEl.appendChild(li);
    });
  }

  const rec = document.getElementById('mk-contrat-rec');
  if (rec) rec.textContent = v.recomendacao || '';

  if (v.estudo && v.estudo.length && mot) {
    mot.textContent = v.estudo.join(' ');
  }
}

function renderDashboardCore_(d) {
  if (!d) return;
  renderExecCockpit_(d);
  renderDecisaoPanel_(d);
  renderContratacaoPanel_(d);
  renderAlertStrip_(d);
  renderLeadingFinanceiro_(d);

  // título
  if (d.mesAtual && d.anoAtual) {
    setText2('dash-title', 'Análise financeira — ' + MESES_DB[d.mesAtual-1] + '/' + d.anoAtual);
    const sel = document.getElementById('dash-mes-sel');
    if (sel) sel.value = String(d.mesAtual);
  }

  // KPIs complementares (cockpit = fat/margem/resultado/payback/ocupação — Pacote I)
  if (d.fatAno != null) {
    setText2('nk-fatano', R2(d.fatAno));
    setText2('nk-fatano-sub', (d.nAno || 0) + ' locações em ' + (d.anoAtual || ''));
  } else {
    setText2('nk-fatano', '—');
    setText2('nk-fatano-sub', 'atualize o GAS para ver o acumulado');
  }
  setText2('nk-nloc', String(d.nMes || 0));
  setText2('nk-nloc-sub', (d.diasOperando || 0) + ' dias · média ' + R2(d.mediaDiaria || 0) + '/dia');
  const canc = d.cancelamentos || { total: 0, taxaPct: 0 };
  const nCanc = Number(canc.total) || 0;
  const taxaCanc = canc.taxaPct > 0 ? canc.taxaPct : ((d.nMes || 0) > 0 ? Math.round(nCanc / d.nMes * 1000) / 10 : 0);
  setText2('nk-canc', String(nCanc));
  setText2('nk-canc-sub', nCanc > 0 ? (taxaCanc + '% das locações') : 'operação limpa no mês');
  const extVal = Number(d.extMes) || 0;
  const pctExt = d.pctExtMes != null ? d.pctExtMes : (d.fatMes > 0 ? Math.round(extVal / d.fatMes * 1000) / 10 : 0);
  setText2('nk-extmes', R2(extVal));
  setText2('nk-extmes-sub', (d.nComExtra || 0) + ' loc. com extra' + (pctExt > 0 ? ' · ' + pctExt + '% fat.' : ''));
  const fatHoje = fatHojeCanonica_(d);
  const nHoje = nHojeCanonica_();
  setText2('nk-fathoje', R2(fatHoje));
  setText2('nk-cushoje', nHoje + (nHoje === 1 ? ' locação hoje' : ' locações hoje') + ' · ver detalhes');

  // CTO
  setText2('nk-cto-fat',  R2(d.fatMes));
  setText2('nk-cto-val',  R2(d.ctoPagar));
  setText2('nk-cto-cus',  R2(d.cusMes));
  setText2('nk-cto-disp', R2(d.resultado));
  const ctoPct = d.fatMes > 0 ? Math.round(d.ctoPagar / d.fatMes * 100) : 0;
  const ctoBar = document.getElementById('nk-cto-bar');
  if (ctoBar) ctoBar.style.width = Math.min(ctoPct, 100) + '%';
  const nm = d.mesAtual < 12 ? d.mesAtual + 1 : 1;
  const ny = d.mesAtual < 12 ? d.anoAtual : d.anoAtual + 1;
  setText2('nk-cto-title', R2(d.ctoPagar) + ' — vence 05/' + String(nm).padStart(2,'0') + '/' + ny);
  const mesPill = document.getElementById('nk-cto-mes');
  if (mesPill) {
    const mc = d.mesContrato || 1;
    const cmin = d.ctoMinimo != null ? R2(d.ctoMinimo) : '';
    mesPill.textContent = mc + 'º mês · mín. ' + cmin;
  }
  setText2('nk-cto-note', (d.ctoMinimo != null
    ? 'CTO = maior entre ' + R2(d.ctoMinimo) + ' e 10% do faturamento (' + ctoPct + '% aplicado)'
    : 'CTO = ' + ctoPct + '% do faturamento'));

  // Payback strip
  const pbStrip = document.getElementById('nk-payback-strip');
  const pb = d.payback;
  if (pbStrip && pb && pb.ok && pb.investimentoTotal > 0) {
    pbStrip.style.display = '';
    pbStrip.classList.toggle('mk-sem-atencao', !pb.paybackAtingido && pb.mesesRestantesEstimados != null && pb.mesesRestantesEstimados > 24);
    const pctPb = pb.pctRecuperado || 0;
    setText2('nk-pb-inv', R2(pb.investimentoTotal));
    setText2('nk-pb-acum', R2(pb.resultadoAcumulado));
    setText2('nk-pb-falta', R2(pb.faltaRecuperar));
    const pbBar = document.getElementById('nk-pb-bar');
    if (pbBar) pbBar.style.width = Math.min(pctPb, 100) + '%';
    const pbPill = document.getElementById('nk-pb-pill');
    if (pb.paybackAtingido) {
      setText2('nk-pb-title', 'Investimento recuperado!');
      if (pbPill) { pbPill.textContent = '✓ Payback'; pbPill.className = 'payback-pill is-done'; }
      setText2('nk-pb-meses', '0');
      setText2('nk-pb-note', 'Acumulado até ' + (pb.acumuladoAteLabel || '') + ' · média/mês ' + R2(pb.mediaResultadoMensal));
    } else {
      setText2('nk-pb-title', pctPb + '% recuperado · acumulado até ' + (pb.acumuladoAteLabel || ''));
      if (pbPill) { pbPill.textContent = pctPb + '%'; pbPill.className = 'payback-pill'; }
      let pbMesTxt = '—';
      if (pb.mesesRestantesEstimados != null) {
        pbMesTxt = '~' + pb.mesesRestantesEstimados;
        if (pb.previsaoPaybackLabel) pbMesTxt += ' · ' + pb.previsaoPaybackLabel;
      }
      setText2('nk-pb-meses', pbMesTxt);
      const ritmoEst = pb.ritmoMensalEstimado || pb.mediaResultadoMensal || 0;
      const usaProj = pb.ritmoFonte === 'projecao' && pb.projecaoResMes > 0;
      let nota = '';
      if (pb.lucroOperacionalAtivo && pb.resultadoMesAtual != null) {
        nota += 'Lucro operacional deste mês (até hoje): ' + R2(pb.resultadoMesAtual) + '. ';
      }
      if (usaProj && pb.diasOperando > 0) {
        nota += 'Projeção payback: ' + R2(pb.projecaoResMes) + '/mês (' + pb.diasOperando + ' dias com movimento → mês cheio). ';
      } else if (ritmoEst > 0) {
        nota += 'Ritmo estimado: ' + R2(ritmoEst) + '/mês. ';
      }
      nota += 'Payback = recuperar os ' + R2(pb.investimentoTotal) + ' investidos (não é quando começa o lucro).';
      if (pb.mesesRestantesHistorico != null && pb.mesesRestantesHistorico !== pb.mesesRestantesEstimados) {
        nota += ' Conservador (média parcial): ~' + pb.mesesRestantesHistorico + ' meses.';
      }
      setText2('nk-pb-note', nota);
    }
  } else if (pbStrip) {
    pbStrip.style.display = 'none';
    pbStrip.classList.remove('mk-sem-atencao');
  }
}

function renderCharts(d) {
  renderDashboardCore_(d);
  renderChartsBody_(d);
}

function renderChartsBody_(d) {
  if (!d) return;
  if (typeof renderSemanasChart_ === 'function') renderSemanasChart_(d);
  if (!window.Chart) return;
  [chartDiario, chartExtrasDia, chartHoras, chartMetaDia].forEach(c => c && c.destroy());

  const BLUE='#29B6F6',PINK='#F06292',GREEN='#2E7D32',AMBER='#FF8A65',GOLD='#FFD54F',GRID='rgba(21,101,192,.08)';
  const PLAN_LABELS = {'10min':'10 min','20min':'20 min','30min':'30 min','40min':'40 min','60min':'1 hora','3h':'3 horas'};

  // Faturamento diário — todos os dias do mês até hoje (zeros inclusive)
  // Os zeros mostram a linha do tempo completa e quando o negócio arrancou
  const fatDia  = d.fatPorDia || [];
  const hojeD   = d.mesAtual === new Date().getMonth()+1 ? new Date().getDate() : 31;
  const dias    = fatDia.filter(x => x.dia <= hojeD); // TODOS os dias, com ou sem receita
  const comMov  = dias.filter(x => x.valor > 0);
  const total   = comMov.reduce((a,b) => a + b.valor, 0);
  const avgDia  = comMov.length > 0 ? Math.round(total / comMov.length) : 0;
  const mesStr  = String(d.mesAtual || new Date().getMonth()+1).padStart(2,'0');

  setText2('nk-avg-label',
    comMov.length > 0
      ? comMov.length + ' dias com movimento — média R$' + avgDia + '/dia'
      : 'sem dados ainda neste mês');

  if (dias.length === 0) {
    const cvEl = document.getElementById('chart-diario');
    const wEl  = cvEl ? cvEl.parentElement : null;
    if (wEl) wEl.innerHTML = '<p style="text-align:center;color:var(--txt3);padding:40px 0;font-size:13px">Sem dados neste mês</p>';
  } else {
    const valsR = dias.map(x => Math.round(x.valor));
    // Colore de cinza os dias sem movimento, azul os dias com receita
    const colors = valsR.map(v => v > 0 ? '#B5D4F4' : '#E8E8E8');
    chartDiario = new Chart(document.getElementById('chart-diario'), {
      type:'bar',
      data:{ labels: dias.map(x => x.dia + '/' + mesStr),
        datasets:[
          {label:'Faturamento', data:valsR, backgroundColor:colors, borderRadius:3, minBarLength:4, order:2},
          ...(avgDia > 0 ? [{label:'Média', data:dias.map(()=>avgDia), type:'line',
            borderColor:BLUE, borderWidth:1.5, pointRadius:0, tension:0, borderDash:[4,3], order:1}] : [])
        ]},
      options:{responsive:true, maintainAspectRatio:false,
        plugins:{legend:{display:false},
          tooltip:{mode:'index', intersect:false,
            callbacks:{label:ctx => {
              if (ctx.dataset.label === 'Média') return 'Média: R$ ' + Math.round(ctx.parsed.y);
              return ctx.parsed.y > 0 ? 'Faturamento: R$ ' + Math.round(ctx.parsed.y) : 'Sem movimento';
            }}}},
        scales:{
          x:{grid:{display:false}, ticks:{font:{size:9}, color:'#888', maxTicksLimit:10, maxRotation:0}},
          y:{grid:{color:GRID}, ticks:{font:{size:9}, color:'#888', callback:v=>'R$'+v}, min:0, suggestedMax: Math.max(...valsR, 1) * 1.2}
        }}
    });
  }

  // Extras por dia (mês)
  const extDia = d.extPorDia || [];
  const hojeDExt = d.mesAtual === new Date().getMonth() + 1 ? new Date().getDate() : 31;
  const diasExt = extDia.filter(x => x.dia <= hojeDExt);
  const totalExtMes = Number(d.extMes) || 0;
  const pctExt = d.pctExtMes != null ? d.pctExtMes : (d.fatMes > 0 ? Math.round(totalExtMes / d.fatMes * 1000) / 10 : 0);
  setText2('nk-ext-label', totalExtMes > 0
    ? R2(totalExtMes) + ' no mês · ' + pctExt + '% do faturamento · ' + (d.nComExtra || 0) + ' loc. com extra'
    : 'sem extras cobrados neste mês');
  const extIns = document.getElementById('nk-ext-insight');
  if (extIns) {
    if (totalExtMes <= 0) {
      extIns.style.display = 'none';
    } else {
      const comExt = diasExt.filter(x => x.valor > 0);
      const best = comExt.reduce((a, b) => (b.valor > (a.valor || 0) ? b : a), { dia: 0, valor: 0 });
      const msgs = [];
      if (pctExt >= 18) msgs.push('Extras representam ' + pctExt + '% do faturamento — revise aviso de tempo no balcão.');
      else if (pctExt >= 10) msgs.push('Extras em ' + pctExt + '% do faturamento — margem saudável se o plano base estiver correto.');
      else msgs.push('Extras em ' + pctExt + '% do faturamento — operação focada em planos.');
      if (best.valor > 0) msgs.push('Melhor dia: ' + best.dia + '/' + String(d.mesAtual || '').padStart(2, '0') + ' com ' + R2(best.valor) + ' em extras.');
      extIns.style.display = 'block';
      extIns.textContent = msgs.join(' ');
    }
  }
  const extCv = document.getElementById('chart-extras-dia');
  if (extCv && window.Chart) {
    if (chartExtrasDia) chartExtrasDia.destroy();
    const valsE = diasExt.map(x => Math.round(x.valor));
    const mesStrE = String(d.mesAtual || new Date().getMonth() + 1).padStart(2, '0');
    chartExtrasDia = new Chart(extCv, {
      type: 'bar',
      data: {
        labels: diasExt.map(x => x.dia + '/' + mesStrE),
        datasets: [{
          label: 'Extras',
          data: valsE,
          backgroundColor: valsE.map(v => v > 0 ? '#CE93D8' : '#F0F0F0'),
          borderRadius: 3,
          minBarLength: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ctx.parsed.y > 0 ? 'Extras: R$ ' + Math.round(ctx.parsed.y) : 'Sem extra'
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 9 }, maxTicksLimit: 10 } },
          y: { grid: { color: GRID }, ticks: { callback: v => 'R$' + v }, min: 0 }
        }
      }
    });
  }

  renderMetaDiaChart_(d);

  // Horários de pico
  const horasDat = (d.horasPico||[]).map((v,i)=>({h:(9+i)+'h',v:Number(v)||0}));
  const totalPico = horasDat.reduce((a,b)=>a+b.v,0);
  const maxH = Math.max(...horasDat.map(x=>x.v),1);
  const picoEl = document.getElementById('nk-pico-insight');
  if (picoEl) picoEl.style.display = 'none'; // insight now in chart title
  const picoTitleEl = document.getElementById('nk-pico-title-note');
  if (totalPico === 0) {
    // GAS ainda nao tem dados de horario (bug de leitura de hora serial — deploy v1.5.3d resolve)
    const cv = document.getElementById('chart-horas');
    if (cv) { const ctx=cv.getContext('2d'); ctx.clearRect(0,0,cv.width,cv.height); ctx.fillStyle='#888'; ctx.font='11px system-ui'; ctx.textAlign='center'; ctx.fillText('Disponível após deploy GAS v1.5.3d', cv.width/2, 60); }
    if (picoEl) { picoEl.style.display='block'; picoEl.textContent='Dados de horário indisponíveis. Aplique o deploy GAS v1.5.3d para corrigir.'; }
  } else {
    chartHoras = new Chart(document.getElementById('chart-horas'), {
      type:'bar',
      data:{labels:horasDat.map(x=>x.h),
        datasets:[{
          label:'R$',
          data:horasDat.map(x=>x.v),
          backgroundColor:horasDat.map(x=>x.v>=maxH*0.65?BLUE:x.v>=maxH*0.3?'#85B7EB':'#D3E8F8'),
          borderRadius:3,
          minBarLength:3  // garante que barras com valor > 0 sempre aparecem
        }]},
      options:{responsive:true,maintainAspectRatio:false,
        plugins:{legend:{display:false},
          tooltip:{callbacks:{label:c=>c.parsed.y>0?'R$ '+Math.round(c.parsed.y):'Sem movimento'}}},
        scales:{
          x:{grid:{display:false},ticks:{font:{size:9},color:'#888',maxRotation:0}},
          y:{display:false}
        }}
    });
    const picoMax = horasDat.reduce((a,b)=>b.v>a.v?b:a,{h:'—',v:0});
    if (picoTitleEl && picoMax.v > 0) picoTitleEl.textContent = picoMax.h + ' · R$ ' + Math.round(picoMax.v);
  }

  // Por tipo
  const tp = d.fatPorTipo || {};
  const totTipo = (tp['Carro']||0)+(tp['Triciclo']||0)+(tp['Pelúcia']||0) || 1;
  const maxTipo = Math.max(tp['Carro']||0, tp['Triciclo']||0, tp['Pelúcia']||0, 1);
  const tiposArr = [{n:'Carros',k:'Carro',cor:BLUE},{n:'Triciclos',k:'Triciclo',cor:GREEN},{n:'Pelúcias',k:'Pelúcia',cor:PINK}].filter(t=>(tp[t.k]||0)>0);
  const tipoEl = document.getElementById('nk-tipo-rows');
  if (tipoEl) tipoEl.innerHTML = tiposArr.map(t=>{const v=tp[t.k]||0,p=pct2(v,totTipo),bw=Math.round(v/maxTipo*100);return `<div class="nb-row"><div class="nb-dot" style="background:${t.cor}"></div><div class="nb-name">${t.n}</div><div class="nb-bar-bg"><div class="nb-bar-fill" style="width:${bw}%;background:${t.cor}"></div></div><div class="nb-val">${R2(v)}</div><div class="nb-pct">${p}%</div></div>`;}).join('')||'<div class="nks">Sem dados</div>';
  const tipInsEl = document.getElementById('nk-tipo-insight');
  if (tipInsEl && tiposArr.length>0) { const top=tiposArr.reduce((a,b)=>(tp[b.k]||0)>(tp[a.k]||0)?b:a,tiposArr[0]); tipInsEl.style.display='block'; tipInsEl.textContent=top.n+' lideram com '+pct2(tp[top.k]||0,totTipo)+'% do faturamento.'; }

  // Ranking veículos
  const fv = d.fatPorVeiculo || {};
  const totV = Object.values(fv).reduce((a,b)=>a+b,0) || 1;
  const maxV = Math.max(...Object.values(fv),1);
  const veics = Object.keys(fv).sort((a,b)=>fv[b]-fv[a]);
  const veicEl = document.getElementById('nk-veiculo-rank');
  if (veicEl) veicEl.innerHTML = veics.map((v,i)=>{const val=fv[v]||0,cor=v.startsWith('Carro')?BLUE:v.startsWith('Triciclo')?GREEN:PINK,bw=Math.round(val/maxV*100),p=pct2(val,totV);return `<div class="nb-row"><div class="nb-n">${i+1}</div><div class="nb-name">${v}</div><div class="nb-bar-bg"><div class="nb-bar-fill" style="width:${bw}%;background:${cor}"></div></div><div class="nb-val">${R2(val)}</div><div class="nb-pct">${p}%</div></div>`;}).join('')||'<div class="nks">Sem dados</div>';

  // Pagamento
  const fp = d.fatPorPagamento || {};
  const totP = Object.values(fp).reduce((a,b)=>a+b,0) || 1;
  const maxP = Math.max(...Object.values(fp),1);
  const pagCorsD = {'Pix':BLUE,'Cartão':'#534AB7','Dinheiro':GREEN,'Crédito':'#534AB7','Débito':AMBER};
  const pags = Object.keys(fp).sort((a,b)=>fp[b]-fp[a]);
  const pagEl = document.getElementById('nk-pag-rows');
  if (pagEl) pagEl.innerHTML = pags.map(p=>{const val=fp[p]||0,cor=pagCorsD[p]||AMBER,bw=Math.round(val/maxP*100),pcc=pct2(val,totP);return `<div class="nb-row"><div class="nb-dot" style="background:${cor}"></div><div class="nb-name">${p}</div><div class="nb-bar-bg"><div class="nb-bar-fill" style="width:${bw}%;background:${cor}"></div></div><div class="nb-val">${R2(val)}</div><div class="nb-pct">${pcc}%</div></div>`;}).join('')||'<div class="nks">Sem dados</div>';

  // Por plano
  const pl = d.fatPorPlano || {};
  const plOrder = ['10min','20min','30min','40min','60min','3h'];
  const totPl = plOrder.reduce((a,k)=>a+(pl[k]||0),0) || 1;
  const maxPl = Math.max(...plOrder.map(k=>pl[k]||0),1);
  const plEl = document.getElementById('nk-plano-rows');
  if (plEl) plEl.innerHTML = plOrder.filter(k=>(pl[k]||0)>0).map(k=>{const val=pl[k]||0,bw=Math.round(val/maxPl*100),pcc=pct2(val,totPl);return `<div class="nb-row"><div class="nb-name">${PLAN_LABELS[k]||k}</div><div class="nb-bar-bg"><div class="nb-bar-fill" style="width:${bw}%;background:${AMBER}"></div></div><div class="nb-val">R$${Math.round(val)}</div><div class="nb-pct">${pcc}%</div></div>`;}).join('')||'<div class="nks">Sem dados</div>';
  const topPl = plOrder.filter(k=>pl[k]>0).reduce((a,b)=>(pl[b]||0)>(pl[a]||0)?b:a,'10min');
  const plInsEl = document.getElementById('nk-plano-insight');
  if (plInsEl && pl[topPl]) { plInsEl.style.display='block'; plInsEl.textContent = (PLAN_LABELS[topPl]||topPl)+' é o plano mais popular: '+pct2(pl[topPl],totPl)+'% do faturamento.'; }

  // Pacote F — operador, cancelamentos, ocupação frota
  const ops = d.porOperador || [];
  const opEl = document.getElementById('nk-operador-rows');
  const opIns = document.getElementById('nk-operador-insight');
  if (opEl) {
    if (!ops.length) {
      opEl.innerHTML = '<div class="nks">Sem encerramentos auditados neste mês</div>';
      if (opIns) opIns.style.display = 'none';
    } else {
      const maxOp = Math.max(...ops.map(o => o.nLoc || 0), 1);
      opEl.innerHTML = ops.map((o, i) => {
        const bw = Math.round((o.nLoc || 0) / maxOp * 100);
        return `<div class="nb-row"><div class="nb-n">${i + 1}</div><div class="nb-name">${o.nome}</div><div class="nb-bar-bg"><div class="nb-bar-fill" style="width:${bw}%;background:var(--blue)"></div></div><div class="nb-val">${o.nLoc} loc</div><div class="nb-pct">${R2(o.fat || 0)}</div></div>`;
      }).join('');
      if (opIns) {
        opIns.style.display = 'block';
        opIns.textContent = ops[0].nome + ' lidera com ' + ops[0].nLoc + ' encerramentos (' + (ops[0].pct || 0) + '% do mês).';
      }
    }
  }

  const canc = d.cancelamentos || { total: 0, porMotivo: [], taxaPct: 0 };
  const cancSum = document.getElementById('nk-cancel-summary');
  const cancEl = document.getElementById('nk-cancel-rows');
  if (cancSum) {
    cancSum.innerHTML = canc.total > 0
      ? '<strong style="color:#C62828;font-size:18px">' + canc.total + '</strong> cancelamento(s) · taxa ' + (canc.taxaPct || 0) + '% sobre locações do mês'
      : 'Nenhum cancelamento neste mês';
  }
  if (cancEl) {
    const motivos = canc.porMotivo || [];
    if (!motivos.length) {
      cancEl.innerHTML = '<div class="nks">' + (canc.total > 0 ? 'Motivos não detalhados na auditoria' : 'Operação sem cancelamentos') + '</div>';
    } else {
      const maxC = Math.max(...motivos.map(m => m.count), 1);
      cancEl.innerHTML = motivos.map(m => {
        const bw = Math.round(m.count / maxC * 100);
        return `<div class="nb-row"><div class="nb-name">${m.motivo}</div><div class="nb-bar-bg"><div class="nb-bar-fill" style="width:${bw}%;background:#EF9A9A"></div></div><div class="nb-val">${m.count}</div></div>`;
      }).join('');
    }
  }

  const ocup = d.ocupacaoFrota || [];
  const ocupGrid = document.getElementById('nk-ocupacao-grid');
  const ocupIns = document.getElementById('nk-ocupacao-insight');
  if (ocupGrid) {
    const comUso = ocup.filter(v => v.nLoc > 0);
    if (!comUso.length) {
      ocupGrid.innerHTML = '<div class="nks" style="grid-column:1/-1;padding:12px 0">Sem locações encerradas neste mês</div>';
      if (ocupIns) ocupIns.style.display = 'none';
    } else {
      const topO = comUso[0];
      ocupGrid.innerHTML = comUso.map((v, i) => {
        const tipo = v.veiculo.startsWith('Carro') ? 'Carro' : v.veiculo.startsWith('Triciclo') ? 'Triciclo' : 'Pelúcia';
        const icon = tipoIcon(tipo);
        const cls = i === 0 ? 'vrank-card top1' : 'vrank-card';
        const barClr = tipo === 'Carro' ? 'var(--blue)' : tipo === 'Triciclo' ? '#2E7D32' : 'var(--pink)';
        return `<div class="${cls}"><span class="vr-rank">#${i + 1}</span><div class="vr-icon">${icon}</div><div class="vr-nome">${v.veiculo}</div><div class="vr-count">${v.pctOcupacao || 0}%</div><div class="vr-sub">${v.nLoc} loc · ${v.pctFrota || 0}% frota</div><div class="vr-bar-wrap"><div class="vr-bar" style="width:${Math.min(100, v.pctOcupacao || 0)}%;background:${barClr}"></div></div></div>`;
      }).join('');
      if (ocupIns) {
        ocupIns.style.display = 'block';
        let txt = '<strong>' + topO.veiculo + '</strong> com maior uso: <strong>' + (topO.pctOcupacao || 0) + '%</strong> da capacidade estimada (' + topO.nLoc + ' locações).';
        const imp = d.leadingFinanceiro && d.leadingFinanceiro.impactoOcupacao5pp;
        if (imp != null && imp !== 0) txt += ' +5 pp ocupação ≈ ' + R2(imp) + '/mês no resultado.';
        ocupIns.innerHTML = txt;
      }
    }
  }

  const cusCat = d.cusPorCategoria || [];
  const cusCatEl = document.getElementById('nk-custo-cat-rows');
  const cusIns = document.getElementById('nk-custo-insight');
  if (cusCatEl) {
    if (!cusCat.length) {
      cusCatEl.innerHTML = '<div class="nks">Sem custos lançados neste mês</div>';
      if (cusIns) cusIns.style.display = 'none';
    } else {
      const totC = cusCat.reduce((a, b) => a + (b.valor || 0), 0) || 1;
      const maxC = Math.max(...cusCat.map(c => c.valor || 0), 1);
      cusCatEl.innerHTML = cusCat.map(c => {
        const bw = Math.round((c.valor || 0) / maxC * 100);
        const pcc = pct2(c.valor || 0, totC);
        return `<div class="nb-row"><div class="nb-name">${c.categoria}</div><div class="nb-bar-bg"><div class="nb-bar-fill" style="width:${bw}%;background:#E65100"></div></div><div class="nb-val">${R2(c.valor)}</div><div class="nb-pct">${pcc}%</div></div>`;
      }).join('');
      if (cusIns) {
        cusIns.style.display = 'block';
        cusIns.textContent = cusCat[0].categoria + ' concentra ' + pct2(cusCat[0].valor, totC) + '% dos custos do mês (' + R2(totC) + ' total).';
      }
    }
  }

  const rec = d.recorrenciaClientes || {};
  const recSum = document.getElementById('nk-recorrencia-summary');
  const recIns = document.getElementById('nk-recorrencia-insight');
  if (recSum) {
    const nU = rec.nUnicos || 0;
    const nR = rec.nRecorrentes || 0;
    const pctR = rec.pctRecorrencia || 0;
    recSum.innerHTML = nU > 0
      ? '<strong style="font-size:18px;color:var(--blue)">' + nR + '</strong> de <strong>' + nU + '</strong> clientes voltaram no mês (' + pctR + '% recorrência)'
      : 'Sem telefones válidos nas locações encerradas deste mês';
    if (recIns) {
      if (nU > 0) {
        recIns.style.display = 'block';
        recIns.textContent = pctR >= 30
          ? 'Boa recorrência — ' + pctR + '% dos clientes únicos retornaram no período.'
          : 'Recorrência em ' + pctR + '% — oportunidade de campanha de retorno (Relacionamento / Config).';
      } else recIns.style.display = 'none';
    }
  }

  // ── FASE 5: Comparativo + Projeção + Alerta ──────────────────
  // Alerta de faturamento baixo
  const alertEl  = document.getElementById('nk-alerta');
  const alertMsg = document.getElementById('nk-alerta-msg');
  if (alertEl && d.mediaDiaria > 0) {
    const threshold = d.mediaDiaria * 0.7;
    if (d.fatHoje < threshold && d.fatHoje >= 0) {
      alertEl.style.display = 'flex';
      alertEl.className = 'alerta-banner warn';
      alertMsg.textContent = 'Hoje: R$' + Math.round(d.fatHoje)
        + ' — abaixo de 70% da média diária (R$' + Math.round(d.mediaDiaria) + '/dia)';
    } else if (d.fatHoje >= d.mediaDiaria) {
      alertEl.style.display = 'flex';
      alertEl.className = 'alerta-banner good';
      alertMsg.textContent = 'Hoje: R$' + Math.round(d.fatHoje)
        + ' — acima da média diária (' + Math.round(d.fatHoje / d.mediaDiaria * 100) + '% da meta)';
    } else {
      alertEl.style.display = 'none';
    }
  }

  // Comparativo semana corrida (seg–hoje)
  setText2('nk-sem-atual', R2(d.fatSemana || 0));
  setText2('nk-sem-ant',   R2(d.fatSemanaAnt || 0));
  setText2('nk-mes-ant',   R2(d.fatMesAnt || 0) + ' (' + (d.nMesAnt||0) + ' loc)');
  const badgeEl = document.getElementById('nk-sem-badge');
  if (badgeEl && (d.fatSemanaAnt || 0) > 0) {
    const diff = Math.round(((d.fatSemana||0) - d.fatSemanaAnt) / d.fatSemanaAnt * 100);
    badgeEl.textContent = (diff >= 0 ? '+' : '') + diff + '%';
    badgeEl.className = 'f5-badge ' + (diff > 0 ? 'up' : diff < 0 ? 'dn' : 'eq');
  } else if (badgeEl) badgeEl.textContent = '';

  // Projeção do mês
  setText2('nk-dias-op',  (d.diasOperando || 0) + ' dias');
  setText2('nk-med-dia',  R2(d.mediaDiaria || 0) + '/dia');
  setText2('nk-proj-fat', R2(d.projecaoFat || 0));
  const projResEl = document.getElementById('nk-proj-res');
  if (projResEl) {
    projResEl.textContent = R2(d.projecaoRes || 0);
    projResEl.className = 'f5-val ' + ((d.projecaoRes||0) >= 0 ? 'green' : 'red');
  }
}
// ── CAIXA DO DIA ─────────────────────────────────────────────────────────
const fmtR = v => 'R$ ' + Number(v).toFixed(2).replace('.',',').replace(/\B(?=(\d{3})+(?!\d))/g,'.');
const pagCor = {'PIX':'background:#E6F1FB;color:#0C447C','Crédito':'background:#EEEDFE;color:#3C3489','Débito':'background:#EAF3DE;color:#27500A','Dinheiro':'background:#FAEEDA;color:#633806'};
const pagPill = p => `<span style="font-size:11px;padding:2px 8px;border-radius:20px;font-weight:500;${pagCor[p]||'background:var(--bg2);color:var(--txt)'}">${p||'—'}</span>`;

function inicializarCaixa() {
  const hoje = new Date();
  const pad = n => String(n).padStart(2,'0');
  document.getElementById('caixa-data').value = `${hoje.getFullYear()}-${pad(hoje.getMonth()+1)}-${pad(hoje.getDate())}`;
  carregarCaixa();
}

function renderCaixaFromResumo_(dataFmt, r) {
    const locacoes = r.locacoes || [];
    const custos = r.custos || [];
    const totPag = r.porPagamento || {};
    const totalEnt = Number(r.fat) || 0;
    const totalMaq = Number(r.totalMaq) || 0;
    const totalDin = Number(r.totalDin) || 0;
    const totalCus = Number(r.totalCus) || 0;
    const totalExt = Number(r.totalExt) || 0;
    const nExt = Number(r.nExt) || 0;
    const cusDin = Number(r.cusDin) || 0;
    const saldoDin = Number(r.saldoDin) || 0;
    const resultado = Number(r.resultado) || 0;

    // KPIs
    const setKpi = (id, val, cor) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = fmtR(val);
        if (cor) el.style.color = cor;
      }
    };
    const setHero = (id, val, cor) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = fmtR(val);
        if (cor) el.style.color = cor;
      }
    };
    setKpi('cx-total', totalEnt, '#3B6D11');
    setKpi('cx-maq',   totalMaq, '#185FA5');
    setKpi('cx-din',   totalDin, '#854F0B');
    setKpi('cx-cus',   totalCus, '#A32D2D');
    setHero('cx-res', resultado, null);
    setKpi('cx-ext', totalExt, '#6A1B9A');
    const nloc = document.getElementById('cx-nloc'); if(nloc) nloc.textContent = locacoes.length;
    const cxExtIns = document.getElementById('cx-ext-insight');
    if (cxExtIns) {
      if (totalExt > 0) {
        const pct = totalEnt > 0 ? Math.round(totalExt / totalEnt * 1000) / 10 : 0;
        cxExtIns.style.display = 'block';
        cxExtIns.textContent = 'Extras do dia: ' + fmtR(totalExt) + ' (' + nExt + ' locações) — ' + pct + '% do faturamento do dia.';
      } else {
        cxExtIns.style.display = 'none';
      }
    }
    const cxBe = document.getElementById('cx-breakeven');
    const ld = r.leadingDia;
    if (cxBe && ld && ld.breakEvenLocacoesDia != null) {
      cxBe.style.display = 'block';
      const nLoc = locacoes.length;
      const falta = ld.faltamBreakEven != null ? ld.faltamBreakEven : Math.max(0, ld.breakEvenLocacoesDia - nLoc);
      cxBe.textContent = falta > 0
        ? ('Meta break-even do mês: ' + ld.breakEvenLocacoesDia + ' loc/dia · faltam ' + falta + ' hoje (' + nLoc + ' feitas)')
        : ('Meta break-even do mês atingida hoje (' + ld.breakEvenLocacoesDia + ' loc/dia · ' + nLoc + ' feitas)');
      cxBe.style.color = falta > 0 ? '#E65100' : '#2E7D32';
    } else if (cxBe) {
      cxBe.style.display = 'none';
    }
    document.getElementById('cx-total-ent').textContent = fmtR(totalEnt);
    document.getElementById('cx-total-sai').textContent = fmtR(totalCus);
    document.getElementById('cx-resultado-final').textContent = fmtR(resultado);
    document.getElementById('cx-resultado-final').style.color = resultado >= 0 ? '#3B6D11' : '#A32D2D';
    document.getElementById('cx-resultado-calc').textContent = `${fmtR(totalEnt)} − ${fmtR(totalCus)}`;

    // Conferência maquininha
    const maqEl = document.getElementById('cx-conf-maq');
    if(maqEl) {
      const formasMaq = ['PIX','Crédito','Débito'];
      maqEl.innerHTML = formasMaq.map(f =>
        `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:0.5px solid var(--border);font-size:13px">
          <span style="color:var(--txt2)">${pagPill(f)} ${f}</span>
          <span style="font-weight:500">${fmtR(totPag[f]||0)}</span>
        </div>`
      ).join('') +
      `<div style="display:flex;justify-content:space-between;padding:8px 0 4px;font-size:14px;font-weight:500;border-top:1px solid var(--border);margin-top:4px">
        <span>Total maquininha</span><span style="color:#185FA5">${fmtR(totalMaq)}</span>
      </div>`;
    }

    // Conferência dinheiro
    const dinEl = document.getElementById('cx-conf-din');
    if(dinEl) {
      dinEl.innerHTML =
        `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:0.5px solid var(--border);font-size:13px">
          <span style="color:var(--txt2)">Entradas em dinheiro</span>
          <span style="font-weight:500">${fmtR(totalDin)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:0.5px solid var(--border);font-size:13px">
          <span style="color:var(--txt2)">Custos em dinheiro</span>
          <span style="font-weight:500;color:#A32D2D">− ${fmtR(cusDin)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0 4px;font-size:14px;font-weight:500;border-top:1px solid var(--border);margin-top:4px">
          <span>Saldo em espécie</span><span style="color:#854F0B">${fmtR(saldoDin)}</span>
        </div>`;
    }

    // Tabela entradas
    const tbody = document.getElementById('cx-body-ent');
    if(tbody) {
      if(!locacoes.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="padding:20px;text-align:center;color:var(--txt3)">Nenhuma locação encerrada neste dia</td></tr>';
      } else {
        tbody.innerHTML = [...locacoes].sort((a,b)=>a.horaInicio.localeCompare(b.horaInicio)).map(l => {
          const temExtra = Number(l.minAdicionais) > 0;
          const planoStr = (PLANO_LABELS[l.plano]||l.plano) + (temExtra ? ` +${l.minAdicionais}min extra` : '');
          return `<tr>
            <td>${l.horaInicio||'—'}</td>
            <td>${l.veiculo||l.tipo}</td>
            <td>${planoStr}</td>
            <td>${l.responsavel||'—'}</td>
            <td>${pagPill(l.pagamento)}</td>
            <td>${fmtR(l.valorTotal)}</td>
          </tr>`;
        }).join('');
      }
    }

    // Tabela saídas
    const tbodySai = document.getElementById('cx-body-sai');
    if(tbodySai) {
      if(!custos.length) {
        tbodySai.innerHTML = '<tr><td colspan="4" style="padding:20px;text-align:center;color:var(--txt3)">Nenhum custo registrado neste dia</td></tr>';
      } else {
        tbodySai.innerHTML = custos.map(c =>
          `<tr>
            <td>${c.hora||'—'}</td>
            <td>${c.descricao||'—'}</td>
            <td>${c.categoria||'—'}</td>
            <td style="color:#A32D2D">${fmtR(c.valor)}</td>
          </tr>`
        ).join('');
      }
    }

    // Guardar dados para copiar
    window._caixaData = { dataFmt, totalEnt, totalMaq, totalDin, totalCus, saldoDin, resultado, totPag, locacoes, custos };
}

async function carregarCaixa() {
  const dataEl = document.getElementById('caixa-data');
  if (!dataEl) return;
  const [y,m,d] = dataEl.value.split('-');
  const dataFmt = `${d}/${m}/${y}`;

  ['cx-total','cx-maq','cx-din','cx-cus','cx-res','cx-nloc','cx-ext'].forEach(id => {
    const el = document.getElementById(id); if(el) el.textContent = '...';
  });

  try {
    const authP = apiParamsComAuth_();
    const r = await api({ action: 'resumoDia', data: dataFmt, ...authP });
    if (!r.ok) {
      toast(r.erro || 'Erro ao carregar caixa', 'error');
      return;
    }
    if (dataFmt === fmtDataBrHoje_()) resumoDiaHoje = r;
    renderCaixaFromResumo_(dataFmt, r);
    if (typeof atualizarHubAdmin_ === 'function') atualizarHubAdmin_();
  } catch(e) {
    console.error('carregarCaixa:', e);
    toast('Erro ao carregar caixa', 'error');
  }
}

function buildFechamentoTexto_() {
  const d = window._caixaData;
  if (!d) return '';
  return [
    `FECHAMENTO DE CAIXA — ${d.dataFmt}`,
    `${'─'.repeat(35)}`,
    `FATURAMENTO`,
    `  PIX:        ${fmtR(d.totPag['PIX']||0)}`,
    `  Crédito:    ${fmtR(d.totPag['Crédito']||0)}`,
    `  Débito:     ${fmtR(d.totPag['Débito']||0)}`,
    `  Dinheiro:   ${fmtR(d.totPag['Dinheiro']||0)}`,
    `  TOTAL:      ${fmtR(d.totalEnt)}`,
    ``,
    `CONFERÊNCIA MAQUININHA`,
    `  PIX + Crédito + Débito = ${fmtR(d.totalMaq)}`,
    ``,
    `DINHEIRO EM ESPÉCIE`,
    `  Entradas:   ${fmtR(d.totalDin)}`,
    `  Saldo:      ${fmtR(d.saldoDin)}`,
    ``,
    `CUSTOS DO DIA: ${fmtR(d.totalCus)}`,
    `${'─'.repeat(35)}`,
    `RESULTADO: ${fmtR(d.resultado)}`,
    `Locações: ${d.locacoes.length}`,
  ].join('\n');
}

function copiarFechamentoCaixa() {
  const txt = buildFechamentoTexto_();
  if (!txt) { toast('Carregue o caixa primeiro', 'error'); return; }
  navigator.clipboard.writeText(txt).then(() => toast('Fechamento copiado!', 'success'))
    .catch(() => toast('Não foi possível copiar', 'error'));
}

function compartilharFechamentoWhatsApp() {
  const txt = buildFechamentoTexto_();
  if (!txt) { toast('Carregue o caixa primeiro', 'error'); return; }
  window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank', 'noopener');
}

function enviarFechamentoEmail() {
  const d = window._caixaData;
  const txt = buildFechamentoTexto_();
  if (!txt || !d) { toast('Carregue o caixa primeiro', 'error'); return; }
  const subject = encodeURIComponent('Fechamento Movi Kids — ' + d.dataFmt);
  const body = encodeURIComponent(txt);
  window.location.href = 'mailto:?subject=' + subject + '&body=' + body;
}

// ── RELATÓRIO ────────────────────────────────────────────────
function initRelMesSel() {
  const hoje = new Date();
  document.getElementById('rel-mes').value = hoje.getMonth()+1;
  const anoSel = document.getElementById('rel-ano');
  if (!anoSel.options.length) {
    for (let a=hoje.getFullYear();a>=2026;a--) {
      anoSel.add(new Option(a,a,a===hoje.getFullYear()));
    }
  }
}

async function carregarPreviewRelatorio() {
  const mes  = document.getElementById('rel-mes').value;
  const ano  = document.getElementById('rel-ano').value;
  const prev = document.getElementById('rel-preview');
  const btnEnv = document.getElementById('btn-rel-email');
  const btnDrv = document.getElementById('btn-rel-drive');
  prev.innerHTML = '<div style="text-align:center;padding:40px;color:var(--txt3);font-size:13px">⏳ Gerando preview do relatório...</div>';
  if (btnEnv) btnEnv.disabled = true;
  if (btnDrv) btnDrv.disabled = true;
  try {
    // v1.6.20: preview com HTML real do email (Fase 5)
    const d = await api({ action:'buscarPreviewRelatorio', mes, ano }, 30000);
    if (!d.ok || !d.html) {
      prev.innerHTML = '<div style="color:var(--red);padding:20px;text-align:center">Erro ao gerar preview</div>';
      return;
    }
    // Renderiza o HTML completo do email num iframe via Blob
    const blob = new Blob([d.html], { type:'text/html;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    prev.innerHTML = '<div class="rel-iframe-wrap"><iframe id="preview-iframe" title="Preview do relatório"></iframe></div>';
    document.getElementById('preview-iframe').src = url;
    setTimeout(() => URL.revokeObjectURL(url), 120000);
    if (btnEnv) { btnEnv.disabled = false; btnEnv.style.display = ''; }
    if (btnDrv) { btnDrv.disabled = false; }
    _relPreviewMes = mes; _relPreviewAno = ano;
  } catch(e) {
    prev.innerHTML = '<div style="color:var(--red);padding:20px;text-align:center">Erro de conexão: '+e.message+'</div>';
    if (btnEnv) btnEnv.disabled = false;
    if (btnDrv) btnDrv.disabled = false;
  }
}
let _relPreviewMes = null, _relPreviewAno = null;

async function enviarRelatorioEmail() {
  // v1.6.20: confirmação antes de enviar (Fase 5)
  const mes = document.getElementById('rel-mes').value;
  const ano = document.getElementById('rel-ano').value;
  const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                 'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const nomeMes = meses[parseInt(mes)-1] + '/' + ano;
  if (!confirm('Enviar relatório de ' + nomeMes + ' para financeiro@goldenshoppingcalhau.com.br?')) return;
  const btn = document.getElementById('btn-rel-email');
  btn.textContent = '⏳ Enviando...'; btn.disabled = true;
  try {
    const d = await api({ action:'gerarRelatorio' }, 30000);
    if (d.ok) { toast('✅ Relatório ' + nomeMes + ' enviado!','success'); carregarHistRelatorios(); }
    else toast('Erro: '+d.erro,'error');
  } catch { toast('Erro de conexão','error'); }
  finally { btn.textContent='📧 Enviar Email'; btn.disabled=false; }
}

async function salvarRelatorioDrive() {
  const mes = document.getElementById('rel-mes').value;
  const ano = document.getElementById('rel-ano').value;
  const btn = document.getElementById('btn-rel-drive');
  btn.textContent = '⏳ Salvando...'; btn.disabled = true;
  try {
    const d = await api({ action:'salvarRelatorioDrive', mes, ano });
    if (d.ok) {
      toast('✅ PDF salvo no Drive!','success');
      carregarHistRelatorios();
      window.open(d.link,'_blank');
    } else toast('Erro: '+d.erro,'error');
  } catch { toast('Erro de conexão','error'); }
  finally { btn.textContent='💾 Salvar PDF'; btn.disabled=false; }
}

async function carregarPreviewRelatorioExecutivo() {
  const mes = document.getElementById('rel-mes').value;
  const ano = document.getElementById('rel-ano').value;
  const prev = document.getElementById('rel-preview-exec');
  const btn = document.getElementById('btn-rel-exec-drive');
  if (!prev) return;
  prev.innerHTML = '<div style="text-align:center;padding:40px;color:var(--txt3);font-size:13px">⏳ Gerando PDF executivo...</div>';
  if (btn) btn.disabled = true;
  try {
    const d = await api({ action: 'buscarPreviewRelatorioExecutivo', mes, ano, ...apiParamsComAuth_() }, 30000);
    if (!d.ok || !d.html) {
      prev.innerHTML = '<div style="color:var(--red);padding:20px;text-align:center">' + escHtml(d.erro || 'Erro ao gerar preview') + '</div>';
      return;
    }
    const blob = new Blob([d.html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    prev.innerHTML = '<div class="rel-iframe-wrap"><iframe title="Preview PDF executivo"></iframe></div>';
    prev.querySelector('iframe').src = url;
    setTimeout(() => URL.revokeObjectURL(url), 120000);
    if (btn) btn.disabled = false;
  } catch (e) {
    prev.innerHTML = '<div style="color:var(--red);padding:20px;text-align:center">Erro: ' + escHtml(e.message) + '</div>';
    if (btn) btn.disabled = false;
  }
}

async function salvarRelatorioExecutivoDrive() {
  const mes = document.getElementById('rel-mes').value;
  const ano = document.getElementById('rel-ano').value;
  const btn = document.getElementById('btn-rel-exec-drive');
  if (btn) { btn.textContent = '⏳ Salvando...'; btn.disabled = true; }
  try {
    const d = await api({ action: 'salvarRelatorioExecutivoDrive', mes, ano, ...apiParamsComAuth_() }, 30000);
    if (d.ok) {
      toast('✅ PDF executivo salvo!', 'success');
      carregarHistRelatorios();
      if (d.link) window.open(d.link, '_blank');
    } else toast('Erro: ' + (d.erro || 'falha'), 'error');
  } catch { toast('Erro de conexão', 'error'); }
  finally {
    if (btn) { btn.textContent = '📊 Salvar PDF Executivo'; btn.disabled = false; }
  }
}

async function carregarHistRelatorios() {
  const container = document.getElementById('rel-hist-container');
  if (!container) return;
  try {
    const d = await api({ action:'listarRelatorios' });
    if (!d.ok || !d.relatorios.length) {
      container.innerHTML='<div class="empty"><div class="empty-icon">📋</div><h3>Nenhum relatório enviado</h3></div>';
      return;
    }
    container.innerHTML = d.relatorios.map(r=>`
      <div class="rel-hist-item">
        <div>
          <div style="font-weight:700;color:var(--txt)">${r.mesAno}</div>
          <div style="color:var(--txt3)">${r.dataEnvio} · ${r.tipo}</div>
        </div>
        ${r.link&&r.link!=='(email)'?`<span class="rel-hist-link" onclick="window.open('${r.link}','_blank')">📄 PDF</span>`:'📧'}
      </div>`).join('');
  } catch(e) { console.error('carregarHistRelatorios:', e); if(container) container.innerHTML='<div class="empty"><div class="empty-icon">⚠️</div><h3>Erro ao carregar relatórios</h3><p>Verifique a conexão</p></div>'; }
}

// ═══════════════════════════════════════════════════════════
// FASE 3 — PAINEL DE OPERAÇÃO AO VIVO (v1.6.0)
// ═══════════════════════════════════════════════════════════


async function restaurarPadrao(key) {
  const val = MSG_DEF[key];
  if (!val) return;
  // 1. Atualiza UI e memória IMEDIATAMENTE — não depende do GAS
  const elId = 'cfg-' + key.replace(/_/g, '-');
  const el = document.getElementById(elId);
  const valDisplay = val.replace(/\n/g, '\n'); // \n literal → newline real para textarea
  if (el) el.value = valDisplay;
  appConfig[key] = val;
  toast('Padrão restaurado ✓', 'success');
  // 2. Salva no GAS em background (best-effort)
  const valSend = val.replace(/\n/g, '\\n'); // newlines → \n literal para URL segura
  api({ action: 'salvarConfig', key, val: valSend })
    .then(d => { if (!d.ok) console.warn('restaurar: GAS retornou ok=false'); })
    .catch(e => console.warn('restaurar: GAS indisponível —', e.message));
}

async function irParaConfig() {
  irAdmin('config');
  await carregarConfig();
  // Fill textareas
  const fields = ['msg_boasvindas','msg_alerta','msg_esgotado','msg_agradecimento','msg_extensao'];
  fields.forEach(k => {
    const el = document.getElementById('cfg-' + k.replace(/_/g,'-'));
    if (el) {
      const tpl = getMsgTemplate(k);
      // Converter \n literal → newline real para exibir corretamente na textarea
      el.value = tpl.replace(/\\n/g, '\n').replace(/\n/g, '\n');
    }
  });
  const linkEl = document.getElementById('cfg-link-avaliacao');
  if (linkEl) linkEl.value = appConfig.link_avaliacao || '';
  // Load retorno
  carregarRetorno();
}

async function salvarCfgField(key) {
  const elId = 'cfg-' + key.replace(/_/g, '-');
  const el = document.getElementById(elId);
  if (!el) return;
  const val = el.value; // valor com newlines reais (da textarea)
  // Codifica newlines como \n literal para URL segura (GAS decodifica de volta)
  const valSend = val.replace(/\n/g, '\\n');
  try {
    const d = await api({ action: 'salvarConfig', key, val: valSend });
    if (d.ok) { appConfig[key] = val; toast('Salvo!', 'success'); }
    else toast('Erro ao salvar — ' + (d.erro || 'verifique a planilha'), 'error');
  } catch(e) { toast('Erro de conexão: ' + (e.message||''), 'error'); }
}

async function carregarRetorno() {
  const cont = document.getElementById('retorno-container');
  if (!cont) return;
  cont.innerHTML = '<div style="text-align:center;padding:20px;color:var(--txt3)">Carregando...</div>';
  try {
    const d = await api({ action: 'listarRetorno' });
    if (!d.ok || !d.clientes || !d.clientes.length) {
      cont.innerHTML = '<div class="empty"><div class="empty-icon">😊</div><h3>Nenhum cliente para retorno</h3><p>Clientes de 7-14 dias atrás aparecerão aqui</p></div>';
      return;
    }
    cont.innerHTML = d.clientes.map(c => `
      <div class="retorno-item">
        <div style="flex:1">
          <div class="retorno-nome">${escHtml(c.nome)}</div>
          <div class="retorno-det">👶 ${escHtml(c.crianca)} · ${c.n} locação(ões) · R$ ${Number(c.fat).toFixed(2).replace('.',',')} · Última: ${c.data}</div>
        </div>
        <button class="retorno-btn" onclick='waMensagemRetorno(${JSON.stringify(c)})'>Enviar SMS</button>
      </div>`).join('');
  } catch(e) { cont.innerHTML = '<div style="color:var(--red)">Erro ao carregar</div>'; }
}



// ── Diagnóstico (Sistema) ─────────────────────────────────────
const AUD_ACAO_LABEL_ = {
  salvarLocacao: 'Nova locação',
  editarLocacao: 'Editar locação',
  cancelarLocacao: 'Cancelar',
  encerrarLocacao: 'Encerrar',
  iniciarTimer: 'Iniciar timer',
  estenderLocacao: 'Estender',
  login: 'Login balcão',
  logout: 'Logout',
  logout_admin: 'Logout admin',
  logout_inatividade: 'Idle 1h'
};

async function carregarAuditoriaAdmin_() {
  const list = document.getElementById('mk-audit-list');
  if (!list) return;
  const sel = document.getElementById('mk-audit-operador');
  const op = sel ? sel.value : '';
  list.innerHTML = '<div style="text-align:center;padding:16px;color:var(--txt3);font-size:13px">Carregando auditoria...</div>';
  try {
    const d = await api({ action: 'listarAuditoriaAdmin', operador: op, limite: 60, ...apiParamsComAuth_() });
    if (!d.ok) {
      list.innerHTML = '<div style="color:var(--red);padding:12px;font-size:13px">' + escHtml(d.erro || 'Erro') + '</div>';
      return;
    }
    if (sel && sel.options.length <= 1 && (d.operadores || []).length) {
      d.operadores.forEach(nome => {
        const o = document.createElement('option');
        o.value = nome;
        o.textContent = nome;
        sel.appendChild(o);
      });
    }
    const evts = d.eventos || [];
    if (!evts.length) {
      list.innerHTML = '<div style="text-align:center;padding:16px;color:var(--txt3);font-size:13px">Nenhum evento para este filtro.</div>';
      return;
    }
    list.innerHTML = evts.map(e => {
      const acao = AUD_ACAO_LABEL_[e.acao] || e.acao || '—';
      const det = e.fonte === 'turno'
        ? (e.entrada ? 'Entrada ' + escHtml(e.entrada) : '') + (e.saida ? ' · Saída ' + escHtml(e.saida) : '') + (e.motivo ? ' · ' + escHtml(e.motivo) : '')
        : (e.id ? 'ID ' + escHtml(String(e.id)) : '') + (e.motivo ? ' · ' + escHtml(e.motivo) : '');
      return '<div class="mk-audit-row">'
        + '<div class="mk-audit-ts">' + escHtml(e.timestamp || '—') + '</div>'
        + '<div class="mk-audit-body"><strong>' + escHtml(acao) + '</strong>'
        + ' <span class="mk-audit-op">' + escHtml(e.usuario || '—') + '</span>'
        + (det ? '<div class="mk-audit-det">' + det + '</div>' : '')
        + '</div></div>';
    }).join('');
  } catch (e) {
    list.innerHTML = '<div style="color:var(--red);padding:12px;font-size:13px">Falha: ' + escHtml(e.message) + '</div>';
  }
}

function atualizarDiagnostico() {
  const sessions = (typeof _sessoes !== 'undefined' ? _sessoes : null) ||
                   (window.kpiData ? [] : []);
  const ativos   = (typeof dadosLocais !== 'undefined' && dadosLocais.ativos) || [];
  const agora    = Date.now();

  // Status GAS
  const gasStatus = document.querySelector('.status-badge-global')?.textContent || '';
  const gasOnline = document.getElementById('status-dot')?.classList.contains('online') ||
                   (typeof _syncFailCount !== 'undefined' && _syncFailCount === 0);
  const dotGas = document.getElementById('diag-dot-gas');
  const valGas = document.getElementById('diag-gas');
  if (dotGas) dotGas.className = 'diag-dot ' + (gasOnline ? 'ok' : 'err');
  if (valGas) valGas.textContent = gasOnline ? 'Online ✓' : 'Offline ✗';

  // FIX 7: usar _lastSyncAt do syncController (não _lastSyncMs que nunca é atualizado)
  const diffSec = _lastSyncAt > 0 ? Math.round((agora - _lastSyncAt) / 1000) : null;
  const syncTxt = diffSec === null ? 'Nunca' :
    diffSec < 60 ? diffSec + 's atrás' :
    Math.floor(diffSec / 60) + 'min atrás';
  const dotSync = document.getElementById('diag-dot-sync');
  if (dotSync) dotSync.className = 'diag-dot ' + (diffSec !== null && diffSec < 120 ? 'ok' : 'warn');
  const vSync = document.getElementById('diag-sync');
  if (vSync) vSync.textContent = syncTxt;

  // Versão
  const verEl = document.getElementById('diag-ver');
  if (verEl) verEl.textContent = (typeof APP_VERSION !== 'undefined' ? APP_VERSION : '—');

  // Sessões ativas
  const nAtivos = ativos.filter(s => s.startTimestamp > 0).length;
  const nPend   = ativos.filter(s => !s.startTimestamp || s.startTimestamp === 0).length;
  const vSess = document.getElementById('diag-sess');
  if (vSess) vSess.textContent = nAtivos + ' em curso' + (nPend > 0 ? ' + ' + nPend + ' aguardando' : '');
  const dotSess = document.getElementById('diag-dot-sess');
  if (dotSess) dotSess.className = 'diag-dot ' + (nAtivos > 0 ? 'warn' : 'ok');

  // Sessões em extra
  const agora2 = Date.now();
  const emExtra = ativos.filter(s => {
    if (!s.startTimestamp || s.startTimestamp <= 0) return false;
    const elapsed = (agora2 - s.startTimestamp) / 1000;
    const planSec = (s.mins || 10) * 60;
    return elapsed > planSec;
  });
  const vExtra = document.getElementById('diag-extra');
  const dotExtra = document.getElementById('diag-dot-extra');
  const alertOver = document.getElementById('diag-alert-over');
  if (vExtra) vExtra.textContent = emExtra.length > 0 ? emExtra.length + ' em extra ⚠️' : '0 (nenhuma)';
  if (dotExtra) dotExtra.className = 'diag-dot ' + (emExtra.length > 0 ? 'warn' : 'ok');
  if (alertOver) {
    if (emExtra.length > 0) {
      alertOver.style.display = 'block';
      alertOver.textContent = '⚠️ Em extra: ' + emExtra.map(s => (s.crianca || s.veiculo || '?')).join(', ');
    } else {
      alertOver.style.display = 'none';
    }
  }
}

// FIX 10: diagnóstico atualiza a cada 5s — só recalcula diff, sem GAS call
// Frequência 5s: "Última sync: 3s atrás" → "8s atrás" → etc. em tempo real
function atualizarHubAdmin_() {
  const d = kpiData;
  const dia = document.getElementById('hub-dia-sub');
  const mes = document.getElementById('hub-mes-sub');
  if (d && d.ok) {
    const nHoje = nHojeCanonica_();
    if (dia) dia.textContent = nHoje + (nHoje === 1 ? ' locação hoje' : ' locações hoje') + ' · conferência no caixa';
    if (mes) mes.textContent = 'KPIs do mês, CTO e gestão avançada';
  }
  const gasOnline = typeof _syncFailCount !== 'undefined' && _syncFailCount === 0;
  const chip = document.getElementById('hub-status-txt');
  const dot = document.getElementById('hub-dot');
  const ver = typeof APP_VERSION !== 'undefined' ? APP_VERSION : '—';
  const syncSuffix = (typeof mkSyncAgeSuffix_ === 'function') ? mkSyncAgeSuffix_() : '';
  if (chip) chip.textContent = (gasOnline ? 'Online' : 'Atenção sync') + syncSuffix + ' · app ' + ver;
  if (dot) dot.style.background = gasOnline ? '#2E7D32' : '#E65100';
}

setInterval(() => {
  const adminPage = document.getElementById('page-admin');
  const sysPage = document.getElementById('page-sistema');
  const hubAtivo = (adminPage && adminPage.classList.contains('active')) ||
    (sysPage && sysPage.classList.contains('active'));
  if (!hubAtivo) return;
  if (adminPage && adminPage.classList.contains('active') && typeof atualizarHubAdmin_ === 'function') {
    atualizarHubAdmin_();
  }
  // Só atualiza o campo de "última sync" em tempo real (sem recalcular tudo)
  const diffSec = _lastSyncAt > 0 ? Math.round((Date.now() - _lastSyncAt) / 1000) : null;
  const syncTxt = diffSec === null ? 'Nunca' :
    diffSec < 60 ? diffSec + 's atrás' : Math.floor(diffSec / 60) + 'min atrás';
  const el = document.getElementById('diag-sync');
  if (el) el.textContent = syncTxt;
  const dot = document.getElementById('diag-dot-sync');
  if (dot) dot.className = 'diag-dot ' + (diffSec !== null && diffSec < 60 ? 'ok' : 'warn');
  // Sessões em extra — recalcula a cada 5s (timer local, sem GAS)
  if (typeof atualizarDiagnostico === 'function') atualizarDiagnostico();
}, 5000);

/** Pacote I — Home admin: só chip “Hoje → Caixa”; KPIs mensais ficam no Dashboard. */

// ════════════════════════════════════════════════════════════
