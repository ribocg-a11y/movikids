/* MOVI KIDS — Home, cards, painel ao vivo (Pacote M.9) */
var encHojeData = [];
var menuLocacaoAbertoKey = null;
var TODOS_VEICULOS_DEF = [
  {nome:'Carro 01',   tipo:'Carro'},
  {nome:'Carro 02',   tipo:'Carro'},
  {nome:'Carro 03',   tipo:'Carro'},
  {nome:'Triciclo 01', tipo:'Triciclo'},
  {nome:'Triciclo 02', tipo:'Triciclo'},
  {nome:'Pelúcia 01', tipo:'Pelúcia'},
  {nome:'Pelúcia 02', tipo:'Pelúcia'},
  {nome:'Pelúcia 03', tipo:'Pelúcia'},
  {nome:'Pelúcia 04', tipo:'Pelúcia'},
];
function updateUI() {
  renderCards();
  updateStats();
  // atualizarVeiculoGrid: chamada apenas quando necessário (não a cada 1s)
}

function renderCards() {
  const container = document.getElementById('sessions-container');

  if (sessions.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-icon">${'🚗'}</div>
        <h3>Nenhuma locação ativa</h3>
        <p>Toque em <strong>Nova</strong> para iniciar uma locação</p>
      </div>`;
    return;
  }

  container.innerHTML = sessions.map(s => buildCard(s)).join('');
}

function buildCard(s) {
  const cls     = s.tipo === 'Pelúcia' ? 'pelucia' : 'carro'; // Triciclo usa tema carro
  const badgeCls= s.tipo === 'Pelúcia' ? 'pelucia' : '';
  const icon    = tipoIcon(s.tipo);

  // ── Card pendente (aguardando início) ────────────────────────────────
  if (!s.started) {
    const vPlano = PRECOS[s.tipo]?.[s.plano]?.v || 0;
    return `<div class="session-card pending" id="card-${s.rowIndex}" data-row="${s.rowIndex}">
      <div class="sc-top">
        <div class="sc-tipo">
          <span class="sc-tipo-icon">${icon}</span>
          <span class="sc-tipo-name">${s.veiculo || s.tipo}</span>
        </div>
        <div class="sc-head-actions">
          <span class="sc-plano-badge ${badgeCls}">${s.plano}</span>
          ${menuLocacaoHtml_(s, false)}
        </div>
      </div>
      <div class="sc-names">
        <div class="sc-crianca">${escHtml(s.crianca)}</div>
        <div class="sc-resp">👤 ${escHtml(s.responsavel)} ${s.telefone ? '· ' + s.telefone : ''}</div>
      </div>
      <div class="frozen-timer">
        <div class="frozen-time">${fmtTime(s.mins * 60)}</div>
        <div class="frozen-label">⏸ Cadastro salvo · aguardando início</div>
      </div>
      <div class="pending-actions">
        <button class="btn btn-iniciar" onclick="iniciarContagemDireto_(${s.rowIndex})">
          ▶ INICIAR CONTAGEM
        </button>
        <button class="btn btn-sms-link" onclick="enviarSmsPendente_(${s.rowIndex})" title="SMS do portal — não inicia o cronômetro">
          Enviar SMS
        </button>
      </div>
    </div>`;
  }

  // ── Card ativo (timer rodando) ───────────────────────────────────────
  const rem     = calcRemaining(s);
  const total   = s.mins * 60;
  const isOver  = rem <= 0;
  const isWarn  = rem <= 300 && !isOver;

  let cardCls = 'session-card ' + cls;
  if (isOver)  cardCls += ' danger';
  else if (isWarn) cardCls += ' warning';

  // Countdown display
  let timerDisplay, timerLabel, extraCost = '';
  const fin = mkExibirFinanceiro_();
  const adicMin = adicionalPorMinSessao_(s);
  if (isOver) {
    const extraSec = Math.abs(rem);
    const extraMin = Math.floor(extraSec / 60); // FIX #4: consistente com pedirEncerrar
    timerDisplay   = '+' + fmtTime(extraSec);
    timerLabel     = 'TEMPO EXTRA';
    extraCost      = fin
      ? `<div class="sc-timer-extra-cost">+${extraMin}min = R$ ${(extraMin * adicMin).toFixed(2).replace('.',',')}</div>`
      : `<div class="sc-timer-extra-cost">+${extraMin}min extra</div>`;
  } else {
    timerDisplay = fmtTime(rem);
    timerLabel   = 'RESTANTE';
  }

  // Progress ring
  const CIRCUM   = 220;
  const progress = isOver ? 0 : Math.max(0, rem / total);
  const offset   = CIRCUM * (1 - progress);
  const ringColor= isOver ? '#B71C1C' : isWarn ? '#E65100' : tipoCor(s.tipo);

  const vPlano= PRECOS[s.tipo]?.[s.plano]?.v || 0;
  const vFmt  = 'R$ ' + String(vPlano).replace('.',',') + ',00';
  const planoLinha = fin ? `${s.plano} · ${vFmt}` : String(s.plano);

  return `<div class="${cardCls}" id="card-${s.rowIndex}">
    <div class="sc-top">
      <div class="sc-tipo">
        <span class="sc-tipo-icon">${icon}</span>
        <span class="sc-tipo-name">${s.tipo}</span>
      </div>
      <div class="sc-head-actions">
        <span class="sc-plano-badge ${badgeCls}">${s.plano}</span>
        ${menuLocacaoHtml_(s, true)}
      </div>
    </div>

    <div class="sc-names">
      <div class="sc-crianca">${escHtml(s.crianca)}</div>
      <div class="sc-resp">👤 ${escHtml(s.responsavel)} ${s.telefone ? '· ' + s.telefone : ''}</div>
    </div>

    <div class="sc-timer-area">
      <div class="timer-ring-wrap">
        <svg viewBox="0 0 80 80">
          <circle class="ring-bg" cx="40" cy="40" r="35"/>
          <circle class="ring-progress" cx="40" cy="40" r="35"
            stroke="${ringColor}"
            stroke-dashoffset="${offset.toFixed(1)}"
            stroke-dasharray="${CIRCUM}"/>
        </svg>
        <div class="timer-text">
          <div style="font-size:9px;font-weight:700;color:${ringColor};text-transform:uppercase;letter-spacing:.03em">${isOver?'EXTRA':'MIN'}</div>
        </div>
      </div>
      <div class="sc-timer-info">
        <div class="sc-timer-label">${timerLabel}</div>
        <div class="sc-timer-big" style="color:${ringColor}">${timerDisplay}</div>
        ${extraCost}
        <div class="sc-valor">${planoLinha}</div>
        <div class="sc-valor" style="font-size:11px;color:var(--txt3)">Início: ${s.horaInicio}</div>
        ${smsStatusHtml_(s)}
      </div>
    </div>

    <div class="sc-btns">
      ${isOver
        ? `<button class="btn btn-wa danger-wa" onclick="abrirWhatsAppCard(${s.rowIndex})" title="Enviar SMS sobre tempo extra">
             SMS extra
           </button>`
        : isWarn
          ? `<button class="btn btn-wa warn-wa" onclick="abrirWhatsAppCard(${s.rowIndex})" title="Enviar SMS avisando que o tempo está acabando">
               SMS - ${Math.ceil(rem/60)}min
             </button>`
          : `<button class="btn btn-wa" onclick="abrirWhatsAppCard(${s.rowIndex})" title="Enviar SMS com o portal do responsável">
               Enviar SMS
             </button>`
      }
      <button class="btn btn-encerrar ${isOver?'danger':''}" onclick="abrirSessaoDrawer(${s.rowIndex},'encerrar')">
        ✓ Encerrar
      </button>
    </div>
  </div>`;
}


function menuLocacaoHtml_(s, ativa) {
  const row = Number(s.rowIndex);
  const tab = ativa ? 'editar' : 'editar';
  return `<button type="button" class="sc-more" onclick="abrirSessaoDrawer(${row},'${tab}')" title="Gerenciar locação">⚙</button>`;
}

function toggleMenuLocacao(ev, btn) {
  if (ev) {
    ev.preventDefault();
    ev.stopPropagation();
  }
  const menu = btn ? btn.nextElementSibling : null;
  const key = btn ? btn.getAttribute('data-menu-key') : null;
  document.querySelectorAll('.sc-menu').forEach(m => { if (m !== menu) m.classList.remove('show'); });
  if (menu) {
    const willOpen = !menu.classList.contains('show');
    menu.classList.toggle('show', willOpen);
    menuLocacaoAbertoKey = willOpen ? key : null;
  }
}

document.addEventListener('click', e => {
  if (!e.target.closest('.sc-menu') && !e.target.closest('.sc-more')) {
    document.querySelectorAll('.sc-menu').forEach(m => m.classList.remove('show'));
    menuLocacaoAbertoKey = null;
  }
});

function renderPainel() {
  const grid = document.getElementById('painel-grid');
  if (!grid) return;

  // Mapa veiculo → session ativa
  const sessMap = {};
  sessions.forEach(s => {
    if (s.veiculo && (s.status === 'Ativa' || s.status === 'Pendente')) sessMap[s.veiculo] = s;
  });

  // Resumo do dia
  const ativos    = sessions.filter(s =>
    (typeof sessaoTimerIniciado_ === 'function' ? sessaoTimerIniciado_(s) : (s.started && s.status === 'Ativa'))
  ).length;
  const pendentes = sessions.filter(s => s.status === 'Pendente' || (!s.started && s.status === 'Ativa')).length;
  const encHoje   = encHojeData ? encHojeData.length : 0;

  const phAtivos  = document.getElementById('ph-ativos');
  const phEnc     = document.getElementById('ph-enc-hoje');
  const phPend    = document.getElementById('ph-pendentes');
  if (phAtivos) phAtivos.textContent = ativos;
  if (phEnc)    phEnc.textContent    = encHoje;
  if (phPend)   phPend.textContent   = pendentes;

  // Rebuild grid
  const carros     = TODOS_VEICULOS_DEF.filter(v => v.tipo === 'Carro');
  const triciclos  = TODOS_VEICULOS_DEF.filter(v => v.tipo === 'Triciclo');
  const pelucias   = TODOS_VEICULOS_DEF.filter(v => v.tipo === 'Pelúcia');

  grid.innerHTML =
    '<div class="painel-sec-label">🚗 Carros elétricos</div>' +
    carros.map(v => buildPainelCard(v.nome, v.tipo, sessMap[v.nome])).join('') +
    (triciclos.length ? '<div class="painel-sec-label">🛺 Triciclos elétricos</div>' +
      triciclos.map(v => buildPainelCard(v.nome, v.tipo, sessMap[v.nome])).join('') : '') +
    '<div class="painel-sec-label">🧸 Pelúcias elétricas</div>' +
    pelucias.map(v => buildPainelCard(v.nome, v.tipo, sessMap[v.nome])).join('');
}

function buildPainelCard(nome, tipo, s) {
  const icon    = tipoIcon(tipo);
  const nomeShort = nome.replace('Pelúcia', 'Pel.'); // abreviação para card compacto

  // ── LIVRE ───────────────────────────────────────────────
  if (!s) {
    return `<div class="pcard livre mk-tile">
      <div class="pcard-icon">${icon}</div>
      <div class="pcard-name">${nome}</div>
      <div class="pcard-status">✓ Livre</div>
      <button class="pcard-btn nova" onclick="iniciarNovaPeloVeiculo('${escHtml(nome)}','${tipo}')">➕ Nova</button>
    </div>`;
  }

  // ── PENDENTE (cadastrado, aguardando iniciar) ───────────
  if (!s.started) {
    return `<div class="pcard pendente mk-tile" style="position:relative;overflow:visible">
      <div style="position:absolute;right:6px;top:6px">${menuLocacaoHtml_(s, false)}</div>
      <div class="pcard-icon">${icon}</div>
      <div class="pcard-name">${nome}</div>
      <div class="pcard-status">⏸ Aguardando</div>
      <div class="pcard-frozen">${fmtTime(s.mins * 60)}</div>
      <div class="pcard-crianca">${escHtml(s.crianca)}</div>
      <button class="pcard-btn" style="margin-bottom:6px" onclick="enviarSmsPendente_(${s.rowIndex})">SMS</button>
      <button class="pcard-btn iniciar" onclick="iniciarContagemDireto_(${s.rowIndex})">▶ Iniciar</button>
    </div>`;
  }

  // ── ATIVO (timer rodando) ────────────────────────────────
  const rem     = calcRemaining(s);
  const total   = s.mins * 60;
  const isOver  = rem <= 0;
  const isWarn  = !isOver && rem <= 300;

  let cardCls, timerTxt, timerCls, subLbl, progressPct, barColor;

  if (isOver) {
    const extraSec = Math.abs(rem);
    const extraMin = Math.floor(extraSec / 60);
    const finPainel = mkExibirFinanceiro_();
    const adicP = adicionalPorMinSessao_(s);
    cardCls   = 'pcard extra';
    timerTxt  = '+' + fmtTime(extraSec);
    timerCls  = 'pcard-timer extra-time';
    subLbl    = finPainel
      ? `+${extraMin}min · R$ ${(extraMin * adicP).toFixed(2).replace('.',',')}`
      : `+${extraMin}min extra`;
    progressPct = 0;
    barColor  = '#E53935';
  } else if (isWarn) {
    cardCls   = tipo === 'Carro' ? 'pcard em-uso-carro warn' : tipo === 'Triciclo' ? 'pcard em-uso-triciclo warn' : 'pcard em-uso-pelucia warn';
    timerTxt  = fmtTime(rem);
    timerCls  = 'pcard-timer warn';
    subLbl    = 'Restante ⚠️';
    progressPct = Math.max(0, (rem / total) * 100);
    barColor  = '#FF9800';
  } else {
    cardCls   = tipo === 'Carro' ? 'pcard em-uso-carro' : tipo === 'Triciclo' ? 'pcard em-uso-triciclo' : 'pcard em-uso-pelucia';
    timerTxt  = fmtTime(rem);
    timerCls  = 'pcard-timer';
    subLbl    = 'Restante';
    progressPct = Math.max(0, (rem / total) * 100);
    barColor  = progressPct > 50 ? '#43A047' : progressPct > 25 ? '#FB8C00' : '#E53935';
  }

  const progressBar = isOver ? '' : `
    <div class="pcard-progress">
      <div class="pcard-bar" style="width:${progressPct.toFixed(1)}%;background:${barColor}"></div>
    </div>`;

  return `<div class="${cardCls} mk-tile" style="position:relative;overflow:visible">
    <div style="position:absolute;right:6px;top:6px">${menuLocacaoHtml_(s, true)}</div>
    <div class="pcard-icon">${icon}</div>
    <div class="pcard-name">${nome}</div>
    ${progressBar}
    <div class="${timerCls}">${timerTxt}</div>
    <div class="pcard-sublabel">${subLbl}</div>
    <div class="pcard-crianca">${escHtml(s.crianca)}</div>
    <div class="pcard-resp">👤 ${escHtml(s.responsavel)}</div>
    <div class="pcard-btns">
      <button class="pcard-btn enc" onclick="abrirSessaoDrawer(${s.rowIndex},'encerrar')">✓ Enc.</button>
      <button class="pcard-btn est" onclick="abrirSessaoDrawer(${s.rowIndex},'estender')">⏱ +Tempo</button>
    </div>
  </div>`;
}

function iniciarNovaPeloVeiculo(veiculo, tipo) {
  // Pré-seleciona o veículo e navega para Nova
  abrirNovaLocacao();
  // Aguarda render do step-0 e clica no card correto
  setTimeout(() => {
    const card = document.getElementById('vc-' + veiculo);
    if (card && !card.classList.contains('vc-busy') && !card.classList.contains('vc-busy-pink')) {
      selectVeiculo(card, veiculo, tipo);
    }
  }, 80);
}

function renderEncHoje(list) {
  encHojeData = list || [];
  const section = document.getElementById('enc-hoje-section');
  const container = document.getElementById('enc-hoje-list');
  const nLoc = document.getElementById('stat-nloc');
  if(nLoc) nLoc.textContent = encHojeData.length;
  if (!section||!container) return;
  if (!encHojeData.length) { section.style.display='none'; return; }
  section.style.display='block';
  const fin = mkExibirFinanceiro_();
  const admSms = (typeof mkAuthIsAdmin === 'function' && mkAuthIsAdmin()) || window.isAdmin;
  container.innerHTML = encHojeData.map(e=>{
    const icon = tipoIcon(e.tipo);
    const v = fin && e.valorTotal != null
      ? `<div class="enc-valor">R$ ${Number(e.valorTotal).toFixed(2).replace('.',',')}</div>` : '';
    return `<div class="enc-item">
      <div class="enc-left">
        <div class="enc-crianca">${icon} ${escHtml(e.crianca)}</div>
        <div class="enc-det">👤 ${escHtml(e.responsavel)} · ${e.plano}</div>
      </div>
      <div class="enc-right">
        ${v}
        <div class="enc-horario">${e.horaInicio} → ${e.horaFim||'--:--'}</div>
        ${admSms && e.telefone ? '<button class="enc-wa-btn" onclick=\'waAgradecimento(' + JSON.stringify(e).replace(/\'/g,"\\\'")+')\'>SMS agradecer</button>' : ''}
      </div>
    </div>`;
  }).join('');
}

function mkInitQrBalcaoStrip_() {
  const el = document.getElementById('mk-qr-balcao-strip');
  if (!el) return;
  el.hidden = false;
  try { localStorage.removeItem('mk_qr_strip_off'); } catch (e) {}
}
window.mkInitQrBalcaoStrip_ = mkInitQrBalcaoStrip_;

function showAdminHomeKpis(d) {
  const chip = document.getElementById('admin-home-chip');
  const isAdminView = (typeof mkAuthIsAdmin === 'function' && mkAuthIsAdmin()) || window.isAdmin;
  const homeOn = !!document.getElementById('page-home')?.classList.contains('active');
  const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  if (!isAdminView || !d || !d.ok) {
    if (chip) chip.hidden = true;
    return;
  }
  if (chip) {
    chip.hidden = !homeOn;
    if (homeOn) {
      const n = d.nHoje != null ? d.nHoje : 0;
      set('admin-chip-fat', n + (n === 1 ? ' locação' : ' locações'));
    }
  }
  if (typeof atualizarHubAdmin_ === 'function') atualizarHubAdmin_();
}
window.updateUI = updateUI;
window.renderCards = renderCards;
window.buildCard = buildCard;
window.menuLocacaoHtml_ = menuLocacaoHtml_;
window.toggleMenuLocacao = toggleMenuLocacao;
window.renderPainel = renderPainel;
window.buildPainelCard = buildPainelCard;
window.iniciarNovaPeloVeiculo = iniciarNovaPeloVeiculo;
window.renderEncHoje = renderEncHoje;
window.showAdminHomeKpis = showAdminHomeKpis;