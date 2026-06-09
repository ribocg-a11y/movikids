/* MOVI KIDS - core utils, init, config (Pacote M.16) */

const WA_MODE_KEY = 'mk_whatsapp_mode_v1';

function mkExibirFinanceiro_() {
  if (typeof mkAuthIsSupervisorOrAdmin_ === 'function' && mkAuthIsSupervisorOrAdmin_()) return true;
  return (typeof mkAuthIsAdmin === 'function' && mkAuthIsAdmin()) || !!window.isAdmin;
}

function mkAuthCanEditarLocacao_() {
  if (typeof mkAuthGetSession === 'function' && mkAuthGetSession()) return true;
  return (typeof mkAuthIsAdmin === 'function' && mkAuthIsAdmin()) || !!window.isAdmin;
}

function aplicarOperacaoConfig_(cfg) {
  if (!cfg) return;
  if (cfg.precosFe && typeof cfg.precosFe === 'object') {
    Object.keys(cfg.precosFe).forEach(tipo => {
      PRECOS[tipo] = Object.assign({}, cfg.precosFe[tipo]);
    });
  } else if (cfg.precos && typeof cfg.precos === 'object') {
    Object.keys(cfg.precos).forEach(tipo => {
      PRECOS[tipo] = {};
      Object.entries(cfg.precos[tipo] || {}).forEach(([plano, c]) => {
        PRECOS[tipo][plano] = {
          v: Number(c.valor != null ? c.valor : c.v),
          m: Number(c.mins != null ? c.mins : c.m),
          a: Number(c.adicional != null ? c.adicional : c.a)
        };
      });
    });
  }
  if (Array.isArray(cfg.veiculosDef) && cfg.veiculosDef.length) {
    TODOS_VEICULOS_DEF.length = 0;
    cfg.veiculosDef.forEach(v => TODOS_VEICULOS_DEF.push(v));
  } else if (Array.isArray(cfg.veiculos_validos) && cfg.veiculos_validos.length) {
    TODOS_VEICULOS_DEF.length = 0;
    cfg.veiculos_validos.forEach(nome => {
      const n = String(nome);
      let tipo = 'Carro';
      if (n.includes('Triciclo')) tipo = 'Triciclo';
      else if (n.includes('Pel')) tipo = 'Pelúcia';
      TODOS_VEICULOS_DEF.push({ nome: n, tipo });
    });
  }
}

function apiParamsComAuth_() {
  const out = typeof operadorApiParams_ === 'function' ? operadorApiParams_() : {};
  const isAdm = (typeof mkAuthIsAdmin === 'function' && mkAuthIsAdmin()) || !!window.isAdmin;
  if (isAdm) {
    if (typeof mkAuthAdminPinParams_ === 'function') Object.assign(out, mkAuthAdminPinParams_());
    else {
      const pin = typeof mkAuthGetAdminPin_ === 'function' ? mkAuthGetAdminPin_() : '';
      if (pin) { out.adminPin = pin; out.authRole = 'admin'; }
    }
  }
  return out;
}

function adicionalPorMinSessao_(s) {
  if (s.adicionalPorMin != null && s.adicionalPorMin !== '') return Number(s.adicionalPorMin) || 0;
  return Number(PRECOS[s.tipo]?.[s.plano]?.a) || 0;
}

function fmtHoraTurno_(ms) {
  const n = Number(ms || 0);
  if (!n) return '';
  try {
    return new Date(n).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '';
  }
}

function atualizarOperadorUI_(sessaoServidor) {
  const getSess = typeof mkAuthGetSession === 'function' ? mkAuthGetSession : null;
  const s = getSess ? getSess() : null;
  const isAdm = (typeof mkAuthIsAdmin === 'function' && mkAuthIsAdmin()) || !!window.isAdmin;
  const logadoTablet = !!(s && s.nome);
  const srv = sessaoServidor ||
    (typeof mkAuthGetSessaoServidor_ === 'function' ? mkAuthGetSessaoServidor_() : null);

  const card = document.getElementById('sb-sessao-card');
  const rowBalcao = document.getElementById('sb-row-balcao');
  const rowTablet = document.getElementById('sb-row-tablet');
  const empty = document.getElementById('sb-sessao-empty');
  const sairBtn = document.getElementById('sb-sessao-sair-btn');

  const set = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  const temBalcao = !!(srv && srv.nome);
  const temTablet = logadoTablet;

  if (card) card.hidden = !temBalcao && !temTablet;
  if (rowBalcao) rowBalcao.hidden = !temBalcao;
  if (empty) empty.hidden = temBalcao || !logadoTablet;

  if (temBalcao) {
    set('sb-balcao-nome', srv.nome);
    const ent = fmtHoraTurno_(srv.loggedAt);
    set('sb-balcao-horas', ent ? ('Entrou ' + ent + (srv.loggedOutAt ? ' · Saiu ' + fmtHoraTurno_(srv.loggedOutAt) : '')) : '');
  }

  if (temTablet) {
    const showTabletRow = isAdm || !temBalcao ||
      String(s.nome).trim() !== String(srv && srv.nome ? srv.nome : '').trim();
    if (rowTablet) rowTablet.hidden = !showTabletRow;
    set('sb-tablet-nome', isAdm ? 'Administrador' : s.nome);
    const entT = fmtHoraTurno_(s.loggedAt);
    set('sb-tablet-horas', entT ? ('Entrou ' + entT + ' neste aparelho') : 'Neste aparelho');
  } else if (rowTablet) {
    rowTablet.hidden = true;
  }

  const gerBtn = document.getElementById('sb-gerenciar-btn');
  if (gerBtn) gerBtn.style.display = isAdm ? 'none' : '';
  if (sairBtn && (temBalcao || temTablet)) {
    sairBtn.hidden = false;
    sairBtn.textContent = isAdm ? 'Sair do admin' : 'Encerrar turno';
  }

  const chip = document.getElementById('hd-turno-chip');
  if (chip) {
    if (!logadoTablet) {
      chip.hidden = true;
      chip.textContent = '';
    } else if (isAdm) {
      chip.hidden = false;
      chip.className = 'hd-turno-chip is-admin';
      chip.textContent = temBalcao
        ? ('Admin · balcão: ' + srv.nome)
        : 'Admin neste aparelho · sem turno no balcão';
    } else {
      const localId = Number(s.id);
      const srvId = srv && srv.operadorId ? Number(srv.operadorId) : 0;
      const synced = srvId && srvId === localId;
      chip.hidden = false;
      chip.className = 'hd-turno-chip ' + (synced ? 'is-ok' : 'is-ghost');
      chip.textContent = synced
        ? ('Turno: ' + s.nome + (srv && fmtHoraTurno_(srv.loggedAt) ? ' · desde ' + fmtHoraTurno_(srv.loggedAt) : ''))
        : ('Turno inválido — ' + s.nome + ' não está no servidor. Faça login de novo.');
    }
  }
}
window.atualizarOperadorUI_ = atualizarOperadorUI_;

function whatsappModeAtual_() {
  try {
    const mode = String(localStorage.getItem(WA_MODE_KEY) || 'auto').toLowerCase();
    return ['auto','web','app','api'].includes(mode) ? mode : 'auto';
  } catch(e) { return 'auto'; }
}

function whatsappModeLabel_(mode) {
  return ({ auto:'Auto', web:'Web', app:'App', api:'API', 'auto-app':'Auto/App', 'auto-web':'Auto/Web' })[mode || whatsappModeAtual_()] || 'Auto';
}

function atualizarWhatsAppUI_() {
  const el = document.getElementById('sb-wa-mode');
  if (el) el.textContent = 'Gateway';
}

function trocarModoWhatsApp() {
  atualizarWhatsAppUI_();
  toast('Canal principal: SMS Gateway.', 'success');
}

async function init() {
  ['app-version','sb-version'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = APP_VERSION;
  });
  atualizarOperadorUI_();
  if (typeof mkAuthRefreshSessaoTurno_ === 'function') mkAuthRefreshSessaoTurno_();
  atualizarWhatsAppUI_();

  requestNotificationPermission();
  setDefaultDate();
  inicializarDraftNova_();

  const cached = JSON.parse(localStorage.getItem('mk_sessions') || '[]');
  if (cached.length > 0) {
    sessions = cached;
    renderCards();
    updateStats();
  }
  startTimerLoop();
  const splash = document.getElementById('splash');
  splash.classList.add('hide');
  setTimeout(() => splash.classList.add('gone'), 550);

  if (typeof mkInitQrBalcaoStrip_ === 'function') mkInitQrBalcaoStrip_();

  syncController();

  agendarProximoPoll();
  if (typeof mkSyncWireEvents_ === 'function') mkSyncWireEvents_();

  setInterval(() => {
    const adminPage = document.getElementById('page-admin');
    if (adminPage && adminPage.classList.contains('active')) atualizarDiagnostico();
  }, 60000);
}

function setDefaultDate() {
  const hoje = new Date();
  const y = hoje.getFullYear();
  const m = String(hoje.getMonth()+1).padStart(2,'0');
  const d = String(hoje.getDate()).padStart(2,'0');
  const iso = `${y}-${m}-${d}`;
  const s = document.getElementById('hist-start');
  const e = document.getElementById('hist-end');
  if (s) s.value = iso;
  if (e) e.value = iso;
}

function fmtTime(totalSec) {
  const abs = Math.abs(totalSec);
  const h   = Math.floor(abs / 3600);
  const m   = Math.floor((abs % 3600) / 60);
  const s   = abs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function escHtml(t) {
  return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function updateStats() {
  const ativas = sessions.filter(s => s.started).length;
  document.getElementById('stat-ativas').textContent = ativas;
}

function toast(msg, type = '') {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .4s'; setTimeout(() => t.remove(), 400); }, 3000);
}

function tipoIcon(tipo) {
  if (tipo === 'Carro')    return '🚗';
  if (tipo === 'Triciclo') return '🛺';
  return '🧸';
}

function tipoCor(tipo) {
  if (tipo === 'Carro')    return '#1565C0';
  if (tipo === 'Triciclo') return '#2E7D32';
  return '#C2185B';
}

function tipoLabel(tipo) {
  if (tipo === 'Carro')    return '🚗 Carros';
  if (tipo === 'Triciclo') return '🛺 Triciclos';
  return '🧸 Pelúcias';
}
