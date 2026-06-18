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
  if (typeof mkAuthIsSupervisor === 'function' && mkAuthIsSupervisor()) {
    return ['caixa', 'historico'].indexOf(name) >= 0;
  }
  return false;
}

function showPage(name, opts = {}) {
  if (window.innerWidth < 1024) mobMenuClose_();
  const adminPages = ['admin','sistema','operadores','dashboard','relatorio','historico','caixa','config'];
  if (adminPages.includes(name) && !mkPaginaGestaoPermitida_(name)) { abrirAdmin(); return; }
  const wasNovaActive = !!document.getElementById('page-nova')?.classList.contains('active');
  if (wasNovaActive && name !== 'nova') salvarNovaDraft_();
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  const pg = document.getElementById('page-'+name);
  if(pg) pg.classList.add('active');
  const navMap = { home: 'nav-home', nova: 'nav-nova', painel: 'nav-painel', relacionamento: 'nav-menu', custos: 'nav-menu', lancamento: 'nav-menu' };
  const navId = navMap[name];
  if (navId) document.getElementById(navId)?.classList.add('active');
  syncSidebar(name);
  if (name === 'lancamento') resetAvulsoForm_();
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
  if (name==='relacionamento') carregarRelacionamento();
  if (name==='dashboard') {
    if (kpiData && kpiData.ok) renderCharts(kpiData);
    if (typeof carregarKPIsDashboard === 'function') carregarKPIsDashboard();
  }
  if (name==='custos') loadCustosHoje();
  if (name==='historico') buscarHistorico();
  if (name==='admin' && isAdmin) { resetAdminTimer(); carregarKPIs(); }
  if (name==='sistema' && isAdmin) { resetAdminTimer(); setTimeout(atualizarDiagnostico, 80); carregarKPIs(); }
  if (name==='operadores' && isAdmin && typeof refreshOperadoresAdmin_ === 'function') refreshOperadoresAdmin_();
  if (typeof showAdminHomeKpis === 'function') showAdminHomeKpis(typeof kpiHubStub_ === 'function' ? kpiHubStub_() : kpiData);
}

function syncSidebar(page) {
  document.querySelectorAll('.sb-btn').forEach(b => b.classList.remove('active'));
  const map = {
    'home':'sbn-home','nova':'sbn-nova','relacionamento':'sbn-relacionamento','custos':'sbn-custos','painel':'sbn-painel','lancamento':'sbn-avulso',
    'admin':'sbn-adm','sistema':'sbn-sys','operadores':'sbn-ops','dashboard':'sbn-dash','relatorio':'sbn-rel','historico':'sbn-hist','caixa':'sbn-caixa','config':'sbn-cfg'
  };
  if (map[page]) { const el=document.getElementById(map[page]); if(el) el.classList.add('active'); }
}

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
}

function hideAdminSidebar() {
  const sec = document.getElementById('sb-admin-section');
  const btn = document.getElementById('sb-gerenciar-btn');
  if (sec) sec.classList.remove('visible');
  if (btn) btn.style.display = '';
  sbSetAdminNavOpen_(false, false);
  ['sbn-adm','sbn-dash','sbn-rel','sbn-ops','sbn-cfg','sbn-sys','sbn-caixa','sbn-hist'].forEach(id => {
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
  const hideIds = ['sbn-adm','sbn-dash','sbn-rel','sbn-ops','sbn-cfg','sbn-sys'];
  hideIds.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
  ['sbn-caixa','sbn-hist'].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = ''; });
}
