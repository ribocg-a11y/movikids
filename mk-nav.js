/* MOVI KIDS — navegação + sidebar (Pacote M.10) */

function sbSetAdminNavOpen_(open, persist) {
  const panel = document.getElementById('sb-admin-panel');
  const toggle = document.getElementById('sb-admin-toggle');
  if (!panel || !toggle) return;
  panel.hidden = !open;
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (persist !== false) {
    try { localStorage.setItem('mk_sb_admin_open', open ? '1' : '0'); } catch (e) {}
  }
}

function sbToggleAdminNav_() {
  const panel = document.getElementById('sb-admin-panel');
  sbSetAdminNavOpen_(panel && panel.hidden, true);
}

function mobMenuOpen_() {
  const sb = document.getElementById('sidebar');
  const bd = document.getElementById('mob-nav-backdrop');
  if (sb) sb.classList.add('mob-open');
  if (bd) bd.classList.add('show');
  document.body.style.overflow = 'hidden';
  if (typeof mkAdminMobCmdOnSidebarShow_ === 'function') mkAdminMobCmdOnSidebarShow_();
}

function mobMenuClose_() {
  const sb = document.getElementById('sidebar');
  const bd = document.getElementById('mob-nav-backdrop');
  if (sb) sb.classList.remove('mob-open');
  if (bd) bd.classList.remove('show');
  document.body.style.overflow = '';
}

function sbSairSessaoClick_() {
  const s = typeof mkAuthGetSession === 'function' ? mkAuthGetSession() : null;
  const isAdm = (typeof mkAuthIsAdmin === 'function' && mkAuthIsAdmin()) || !!window.isAdmin;
  const localOp = !!(s && s.nome && s.role !== 'admin' && s.id !== 'ADMIN');

  // Turno local (operador)
  if (localOp) {
    if (typeof trocarOperador === 'function') trocarOperador('turno');
    return;
  }
  if (isAdm) {
    if (typeof adminLogout === 'function') adminLogout();
    return;
  }
  if (typeof trocarOperador === 'function') trocarOperador();
}

function mkPaginaGestaoPermitida_(name) {
  if (isAdmin || (typeof mkAuthIsAdmin === 'function' && mkAuthIsAdmin())) return true;
  if (typeof mkAuthIsGestor === 'function' && mkAuthIsGestor()) {
    return ['admin', 'dashboard', 'relatorio', 'receita-diaria', 'historico', 'custos-historico', 'caixa', 'operadores'].indexOf(name) >= 0;
  }
  if (typeof mkAuthIsSupervisor === 'function' && mkAuthIsSupervisor()) {
    return ['caixa', 'historico'].indexOf(name) >= 0;
  }
  return false;
}

function showPage(name, opts = {}) {
  if (window.innerWidth < 1024) mobMenuClose_();
  const adminPages = ['admin','sistema','operadores','dashboard','relatorio','receita-diaria','historico','custos-historico','caixa','config','holding'];
  if (adminPages.includes(name) && name !== 'holding' && !mkPaginaGestaoPermitida_(name)) { abrirAdmin(); return; }
  /* ADM: Home = visão holding (duas lojas). Balcão unitário só com adminBalcao. */
  const isAdm = !!(window.isAdmin || (typeof mkAuthIsAdmin === 'function' && mkAuthIsAdmin()));
  const modo = (typeof mkAppModo_ === 'function') ? mkAppModo_() : (isAdm ? 'holding' : 'balcao');
  if (name === 'holding' && isAdm) {
    if (typeof mkAppModoSet_ === 'function') mkAppModoSet_('holding');
  }
  if (name === 'home' && isAdm && opts.adminBalcao) {
    if (typeof mkAppModoSet_ === 'function') mkAppModoSet_('balcao');
  }
  if (name === 'home' && isAdm && !opts.adminBalcao) name = 'holding';
  if (name === 'holding' && !isAdm) { name = 'home'; }
  /* I161 — ops de loja só no modo balcão */
  const opsPages = ['nova', 'painel', 'relacionamento', 'custos', 'lancamento'];
  if (isAdm && modo === 'holding' && !opts.adminBalcao && opsPages.indexOf(name) >= 0) {
    if (typeof toast === 'function') toast('Abra o balcão de uma loja (Lojas → Abrir balcão) para operar', 'warning');
    name = 'holding';
  }
  /* I161 — no balcão ADM, páginas holding-only voltam para Lojas (exceto caixa/hist opcionais: bloqueia dash/rel/ops) */
  const holdingOnly = ['dashboard', 'relatorio', 'receita-diaria', 'operadores', 'admin', 'sistema', 'config'];
  if (isAdm && modo === 'balcao' && holdingOnly.indexOf(name) >= 0 && !opts.forceHolding) {
    if (typeof toast === 'function') toast('Volte a Lojas (Holding) para ver análise consolidada', 'info');
    if (typeof mkAppVoltarHolding_ === 'function') mkAppVoltarHolding_();
    name = 'holding';
  }
  const wasNovaActive = !!document.getElementById('page-nova')?.classList.contains('active');
  if (wasNovaActive && name !== 'nova') salvarNovaDraft_();
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  const pg = document.getElementById('page-'+name);
  if(pg) pg.classList.add('active');
  const navMap = { home: 'nav-home', holding: 'nav-home', nova: 'nav-nova', painel: 'nav-painel', relacionamento: 'nav-menu', custos: 'nav-menu', lancamento: 'nav-menu' };
  const navId = navMap[name];
  if (navId) document.getElementById(navId)?.classList.add('active');
  syncSidebar(name);
  if (typeof mkApplyModoNav_ === 'function') mkApplyModoNav_();
  if (typeof mkRefreshUnidadeUi_ === 'function') mkRefreshUnidadeUi_();
  if (name === 'lancamento') {
    if (typeof resetAvulsoForm_ === 'function') resetAvulsoForm_();
  }
  if (name==='nova') {
    if (opts.freshNova) {
      limparNovaDraft_();
      resetNova({ preserveDraft: true });
      atualizarVeiculoGrid();
    } else if (hasNovaDraft_()) {
      resetNova({ preserveDraft: true });
      atualizarVeiculoGrid();
      restaurarNovaDraft_();
    } else if (!wasNovaActive) {
      resetNova();
      atualizarVeiculoGrid();
    } else {
      atualizarVeiculoGrid();
    }
  }
  if (name==='painel') renderPainel();
  if (name==='home') {
    if (typeof mkRefreshHomeUI_ === 'function') mkRefreshHomeUI_();
    else {
      if (typeof renderCards === 'function') renderCards();
      if (typeof updateStats === 'function') updateStats();
      if (typeof atualizarVeiculoGrid === 'function') atualizarVeiculoGrid();
    }
    if (typeof atualizarOperadorUI_ === 'function') {
      try { atualizarOperadorUI_(); } catch (eHome) { /* ignore */ }
    }
    if (typeof mkRefreshUnidadeUi_ === 'function') mkRefreshUnidadeUi_();
  }
  if (name === 'holding') {
    /* I161/I122: holding não dispara sync balcão pesado — só render dual + warm se já há dados. */
    if (typeof mkAppModoSet_ === 'function') mkAppModoSet_('holding');
    if (typeof renderHolding_ === 'function') renderHolding_();
    if (typeof atualizarOperadorUI_ === 'function') {
      try { atualizarOperadorUI_(); } catch (eUi) { /* ignore */ }
    }
  }
  if (name==='relacionamento') carregarRelacionamento();
  if (name==='dashboard') {
    if (kpiData && kpiData.ok) renderCharts(kpiData);
    if (typeof carregarKPIsDashboard === 'function') carregarKPIsDashboard();
  }
  if (name==='custos') loadCustosHoje();
  if (name==='historico') buscarHistorico();
  if (name==='custos-historico' && typeof initCustosHistorico_ === 'function') initCustosHistorico_();
  if (name==='admin' && isAdmin) { resetAdminTimer(); carregarKPIs(); }
  if (name==='sistema' && isAdmin) { resetAdminTimer(); setTimeout(atualizarDiagnostico, 80); carregarKPIs(); setTimeout(mkSistemaRefreshFrotaHint_, 150); }
  if (name==='operadores' && typeof mkGpAdmLoad_ === 'function') {
    const canOps = isAdmin || (typeof mkAuthIsGestor === 'function' && mkAuthIsGestor());
    if (canOps) mkGpAdmLoad_();
  }
  if (typeof showAdminHomeKpis === 'function') showAdminHomeKpis(typeof kpiHubStub_ === 'function' ? kpiHubStub_() : kpiData);
}

function syncSidebar(page) {
  document.querySelectorAll('.sb-btn').forEach(b => b.classList.remove('active'));
  const map = {
    'home':'sbn-home','holding':'sbn-home','nova':'sbn-nova','relacionamento':'sbn-relacionamento','custos':'sbn-custos','painel':'sbn-painel','lancamento':'sbn-avulso',
    'admin':'sbn-adm','sistema':'sbn-sys','operadores':'sbn-ops','dashboard':'sbn-dash','relatorio':'sbn-rel','receita-diaria':'sbn-rec-dia','historico':'sbn-hist','custos-historico':'sbn-custos-hist','caixa':'sbn-caixa','config':'sbn-cfg'
  };
  if (map[page]) { const el=document.getElementById(map[page]); if(el) el.classList.add('active'); }
  /* ADM: um só "Lojas" (sbn-home → holding). sbn-holding sempre oculto. */
  const isAdm = !!(window.isAdmin || (typeof mkAuthIsAdmin === 'function' && mkAuthIsAdmin()));
  const holdBtn = document.getElementById('sbn-holding');
  const homeBtn = document.getElementById('sbn-home');
  const modo = (typeof mkAppModo_ === 'function') ? mkAppModo_() : 'holding';
  const homeOn = !!document.getElementById('page-home')?.classList.contains('active');
  if (holdBtn) {
    holdBtn.hidden = true;
    holdBtn.style.display = 'none';
    holdBtn.setAttribute('aria-hidden', 'true');
  }
  /* SMS / Sistema: fora do menu (QR-only; sem painel Sistema na UI). */
  ['sbn-cfg', 'sbn-sys'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) { el.hidden = true; el.style.display = 'none'; el.setAttribute('aria-hidden', 'true'); }
  });
  if (homeBtn && isAdm) {
    if (modo === 'balcao' || homeOn) {
      homeBtn.innerHTML = '<span class="sb-icon">🏬</span>← Lojas';
      homeBtn.setAttribute('onclick', "if(typeof mkAppVoltarHolding_==='function')mkAppVoltarHolding_();showPage('holding')");
    } else {
      homeBtn.innerHTML = '<span class="sb-icon">🏬</span>Lojas';
      homeBtn.setAttribute('onclick', "showPage('holding')");
    }
  } else if (homeBtn) {
    homeBtn.innerHTML = '<span class="sb-icon">🏠</span>Home';
    homeBtn.setAttribute('onclick', "showPage('home')");
  }
  if (typeof mkApplyModoNav_ === 'function') mkApplyModoNav_();
}

/** I161 — menu por modo: ops só no balcão; holding só páginas agregáveis. */
function mkApplyModoNav_() {
  const isAdm = !!(window.isAdmin || (typeof mkAuthIsAdmin === 'function' && mkAuthIsAdmin()));
  if (!isAdm) {
    ['sbn-nova', 'sbn-relacionamento', 'sbn-painel', 'sbn-custos', 'sbn-avulso'].forEach(function (id) {
      const el = document.getElementById(id);
      if (!el) return;
      el.hidden = false;
      el.style.display = '';
      el.removeAttribute('aria-hidden');
    });
    ['nav-nova', 'nav-painel'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.style.display = '';
    });
    return;
  }
  const modo = (typeof mkAppModo_ === 'function') ? mkAppModo_() : 'holding';
  const filtro = (typeof mkUnidadeFiltroAdm_ === 'function') ? mkUnidadeFiltroAdm_() : 'all';
  const opsIds = ['sbn-nova', 'sbn-relacionamento', 'sbn-painel', 'sbn-custos', 'sbn-avulso'];
  const holdIds = ['sbn-adm', 'sbn-caixa', 'sbn-dash', 'sbn-hist', 'sbn-custos-hist', 'sbn-rel', 'sbn-rec-dia', 'sbn-ops'];
  const setVis = function (id, on) {
    const el = document.getElementById(id);
    if (!el) return;
    el.hidden = !on;
    el.style.display = on ? '' : 'none';
    el.setAttribute('aria-hidden', on ? 'false' : 'true');
  };
  if (modo === 'holding') {
    opsIds.forEach(function (id) { setVis(id, false); });
    holdIds.forEach(function (id) { setVis(id, true); });
    /* Relatório CTO Golden: só com filtro Todas/Golden */
    setVis('sbn-rel', filtro !== 'laville');
    const sbColab = document.getElementById('sbn-colab');
    if (sbColab) {
      sbColab.hidden = false;
      sbColab.style.display = '';
    }
    ['nav-nova', 'nav-painel'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    const navHome = document.getElementById('nav-home');
    if (navHome) {
      navHome.querySelector('.nav-icon') && (navHome.innerHTML = '<div class="nav-icon">🏬</div>Lojas');
      navHome.setAttribute('onclick', "showPage('holding')");
    }
  } else {
    opsIds.forEach(function (id) { setVis(id, true); });
    holdIds.forEach(function (id) { setVis(id, false); });
    /* Balcão: Caixa/Hist da loja disponíveis; análise consolidada some */
    setVis('sbn-caixa', true);
    setVis('sbn-hist', true);
    setVis('sbn-custos-hist', false);
    setVis('sbn-rel', false);
    setVis('sbn-rec-dia', false);
    setVis('sbn-ops', false);
    setVis('sbn-adm', false);
    setVis('sbn-dash', false);
    const sbColab = document.getElementById('sbn-colab');
    if (sbColab) {
      sbColab.hidden = true;
      sbColab.style.display = 'none';
    }
    ['nav-nova', 'nav-painel'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.style.display = '';
    });
    const navHome = document.getElementById('nav-home');
    if (navHome) {
      navHome.innerHTML = '<div class="nav-icon">🏠</div>Home';
      navHome.setAttribute('onclick', "showPage('home',{adminBalcao:true})");
    }
  }
  /* cfg/sys sempre fora */
  ['sbn-cfg', 'sbn-sys'].forEach(function (id) { setVis(id, false); });
}
window.mkApplyModoNav_ = mkApplyModoNav_;

function syncSidebarStatus(online) {
  const dot=document.getElementById('sb-dot');
  const txt=document.getElementById('sb-txt');
  if (!dot||!txt) return;
  const suffix = (typeof mkSyncAgeSuffix_ === 'function') ? mkSyncAgeSuffix_() : '';
  if (online===null) { dot.className='dot-online'; dot.style.background='#FFB74D'; txt.textContent='Verificando...'; }
  else if (online)   { dot.className='dot-online'; dot.style.background=''; txt.textContent='Online' + suffix; }
  else               { dot.className='dot-offline'; dot.style.background=''; txt.textContent='Offline' + (suffix || ' · sem sync'); }
}

function showAdminSidebar() {
  const sec = document.getElementById('sb-admin-section');
  const btn = document.getElementById('sb-gerenciar-btn');
  if (sec) sec.classList.add('visible');
  if (btn) btn.style.display = 'none';
  let open = false;
  try { open = localStorage.getItem('mk_sb_admin_open') === '1'; } catch (e) {}
  sbSetAdminNavOpen_(open, false);
  if (typeof mkAdminMobCmdOnSidebarShow_ === 'function') mkAdminMobCmdOnSidebarShow_();
}

function hideAdminSidebar() {
  const sec = document.getElementById('sb-admin-section');
  const btn = document.getElementById('sb-gerenciar-btn');
  if (sec) sec.classList.remove('visible');
  if (btn) btn.style.display = '';
  sbSetAdminNavOpen_(false, false);
  if (typeof mkAdminMobCmdOnSidebarHide_ === 'function') mkAdminMobCmdOnSidebarHide_();
  ['sbn-adm','sbn-dash','sbn-rel','sbn-rec-dia','sbn-ops','sbn-cfg','sbn-sys','sbn-caixa','sbn-hist'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = '';
  });
}

function showSupervisorSidebar() {
  const sec = document.getElementById('sb-admin-section');
  const btn = document.getElementById('sb-gerenciar-btn');
  if (sec) sec.classList.add('visible');
  if (btn) btn.style.display = 'none';
  sbSetAdminNavOpen_(true, false);
  const hideIds = ['sbn-adm','sbn-dash','sbn-rel','sbn-rec-dia','sbn-ops','sbn-cfg','sbn-sys'];
  hideIds.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
  ['sbn-caixa','sbn-hist'].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = ''; });
}

function showGestorSidebar() {
  const sec = document.getElementById('sb-admin-section');
  const btn = document.getElementById('sb-gerenciar-btn');
  if (sec) sec.classList.add('visible');
  if (btn) btn.style.display = 'none';
  sbSetAdminNavOpen_(true, false);
  const hideIds = ['sbn-cfg', 'sbn-sys'];
  hideIds.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
  ['sbn-adm', 'sbn-dash', 'sbn-rel', 'sbn-rec-dia', 'sbn-ops', 'sbn-caixa', 'sbn-hist'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = '';
  });
  if (typeof mkAdminMobCmdOnSidebarShow_ === 'function') mkAdminMobCmdOnSidebarShow_();
}
