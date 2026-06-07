/* MOVI KIDS - historico + analytics periodo (Pacote M.12) */

const HIST_CACHE_TTL_MS = 120000;

// ═══════════════════════════════════════════════════════════
// HISTÓRICO
// ═══════════════════════════════════════════════════════════
function histCacheKey_(dates) {
  return 'mk_hist_v71_' + dates.s + '_' + dates.e;
}

function histItemHtml_(l) {
  const icon = tipoIcon(l.tipo);
  const vT = Number(l.valorTotal).toFixed(2).replace('.', ',');
  const vE = Number(l.valorAdicional);
  const sc = l.status === 'Ativa' ? 'ativa' : 'encerrada';
  return `<div class="hist-item">
    <div class="hi-left">
      <div class="hi-tipo">${icon} ${l.tipo}</div>
      <div class="hi-names">${escHtml(l.crianca)}</div>
      <div class="hi-det">👤 ${escHtml(l.responsavel)} · ${l.plano}</div>
      <div class="hi-det">⏰ ${l.horaInicio}${l.horaFim ? ' → ' + l.horaFim : ''} · ${l.data}</div>
    </div>
    <div class="hi-right">
      <div class="hi-valor">R$ ${vT}</div>
      ${vE > 0 ? `<div class="hi-extra">+${l.minAdicionais}min extra</div>` : ''}
      <span class="hi-status ${sc}">${l.status}</span>
    </div>
  </div>`;
}

function renderHistListLazy_(locacoes, container) {
  if (!locacoes.length) {
    container.innerHTML = `<div class="empty"><div class="empty-icon">📋</div><h3>Sem locações neste período</h3></div>`;
    return;
  }
  container.innerHTML = '';
  let i = 0;
  const CHUNK = 12;
  function paint() {
    const slice = locacoes.slice(i, i + CHUNK);
    container.insertAdjacentHTML('beforeend', slice.map(histItemHtml_).join(''));
    i += CHUNK;
    if (i < locacoes.length) requestAnimationFrame(paint);
  }
  requestAnimationFrame(paint);
}

function aplicarHistorico_(res) {
  const container = document.getElementById('hist-container');
  if (!container) return;
  histLocacoesAll = res.locacoes || [];
  renderAnalyticsCards(res.stats);
  renderHistExtChart_(res.stats);
  const vf = document.getElementById('hist-veiculo-filter')?.value || '';
  const locs = vf ? histLocacoesAll.filter(l => l.veiculo === vf) : histLocacoesAll;
  renderVrankSection(locs);
  renderHistListLazy_(locs, container);
}

async function buscarHistorico() {
  const dates = getDates();
  if (!dates) { toast('Selecione as datas', 'error'); return; }
  const container = document.getElementById('hist-container');
  if (!container) return;

  const cacheKey = histCacheKey_(dates);
  try {
    const raw = sessionStorage.getItem(cacheKey);
    if (raw) {
      const cached = JSON.parse(raw);
      if (cached.ts && Date.now() - cached.ts < HIST_CACHE_TTL_MS && cached.res) {
        aplicarHistorico_(cached.res);
        return;
      }
    }
  } catch (e) { /* ignora */ }

  container.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div>';
  const cards = document.getElementById('analytics-cards');
  if (cards) cards.style.display = 'none';

  try {
    const resStats = await api({ action: 'listarHistorico', startDate: dates.s, endDate: dates.e, statsOnly: '1', ...apiParamsComAuth_() });
    if (resStats.ok && resStats.stats) {
      renderAnalyticsCards(resStats.stats);
      renderHistExtChart_(resStats.stats);
    }

    const res = await api({ action: 'listarHistorico', startDate: dates.s, endDate: dates.e, ...apiParamsComAuth_() });
    if (!res.ok) { container.innerHTML = '<div class="empty"><p>Erro.</p></div>'; return; }

    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), res }));
    } catch (e) { /* quota */ }

    aplicarHistorico_(res);
  } catch {
    container.innerHTML = '<div class="empty"><p>Erro de conexão.</p></div>';
  }
}

// ═══════════════════════════════════════════════════════════

// FASE 4 — ESTATÍSTICAS POR VEÍCULO (v1.6.1)
// ═══════════════════════════════════════════════════════════

var histLocacoesAll = []; // todas as locações do período atual

// ── Filtragem por veículo no Histórico ─────────────────────
function filtrarPorVeiculo() {
  const filtro    = document.getElementById('hist-veiculo-filter')?.value || '';
  const container = document.getElementById('hist-container');
  if (!container || !histLocacoesAll.length) return;

  const lista = filtro
    ? histLocacoesAll.filter(l => l.veiculo === filtro)
    : histLocacoesAll;

  renderVrankSection(lista);
  renderHistListLazy_(lista, container);
}

// ── Ranking por veículo no Histórico ───────────────────────
function renderVrankSection(locacoes) {
  const section = document.getElementById('vrank-section');
  const grid    = document.getElementById('vrank-grid');
  const insight = document.getElementById('vrank-insight');
  if (!section || !grid) return;

  if (!locacoes.length) { section.style.display = 'none'; return; }

  // Computa contagem e faturamento por veículo
  const countMap = {}, fatMap = {};
  locacoes.forEach(l => {
    const v = l.veiculo || (l.tipo + ' ?');
    countMap[v] = (countMap[v] || 0) + 1;
    fatMap[v]   = (fatMap[v] || 0) + Number(l.valorTotal || 0);
  });

  const veiculos = Object.keys(countMap);
  if (!veiculos.length) { section.style.display = 'none'; return; }

  // Ordena por contagem decrescente
  veiculos.sort((a, b) => countMap[b] - countMap[a]);
  const maxCount = countMap[veiculos[0]];

  grid.innerHTML = veiculos.map((v, i) => {
    const tipo    = v.startsWith('Carro') ? 'Carro' : v.startsWith('Triciclo') ? 'Triciclo' : 'Pelúcia';
    const icon    = tipoIcon(tipo);
    const pct     = maxCount > 0 ? Math.round(countMap[v] / maxCount * 100) : 0;
    const fat     = 'R$ ' + fatMap[v].toFixed(2).replace('.', ',');
    const cls     = i === 0 ? 'vrank-card top1' : 'vrank-card';
    const barClr  = tipo === 'Carro' ? 'var(--blue)' : tipo === 'Triciclo' ? '#2E7D32' : 'var(--pink)';
    return `<div class="${cls}">
      <span class="vr-rank">#${i + 1}</span>
      <div class="vr-icon">${icon}</div>
      <div class="vr-nome">${v}</div>
      <div class="vr-count">${countMap[v]}</div>
      <div class="vr-sub">${fat}</div>
      <div class="vr-bar-wrap"><div class="vr-bar" style="width:${pct}%;background:${barClr}"></div></div>
    </div>`;
  }).join('');

  // Insight automático
  const top    = veiculos[0];
  const bottom = veiculos[veiculos.length - 1];
  const total  = locacoes.length;
  const topPct = Math.round(countMap[top] / total * 100);
  if (insight) {
    insight.style.display = 'block';
    insight.innerHTML =
      `<strong>${top}</strong> é o mais requisitado: <strong>${countMap[top]} locações</strong> (${topPct}% do período). ` +
      (veiculos.length > 1
        ? `<strong>${bottom}</strong> teve menos uso: <strong>${countMap[bottom]} locações</strong>.`
        : '');
  }

  section.style.display = 'block';
}


// ANALYTICS — período e histórico
// ════════════════════════════════════════════════════════════
var currentPeriod = 'hoje';

function setPeriod(period, btn) {
  currentPeriod = period;
  document.querySelectorAll('.period-btn').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  const custom = document.getElementById('period-custom-row');
  if(custom) custom.style.display = period==='custom' ? 'flex' : 'none';
  if(period!=='custom') buscarHistorico();
}

function getDates() {
  const hoje = new Date();
  const fmt = d => {
    const dd=String(d.getDate()).padStart(2,'0');
    const mm=String(d.getMonth()+1).padStart(2,'0');
    return dd+'/'+mm+'/'+d.getFullYear();
  };
  const fmtInput = d => {
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  };
  switch(currentPeriod) {
    case 'hoje':   return {s:fmt(hoje),e:fmt(hoje)};
    case 'ontem':  const on=new Date(hoje);on.setDate(on.getDate()-1);return {s:fmt(on),e:fmt(on)};
    case '7d':     const s7=new Date(hoje);s7.setDate(s7.getDate()-6);return {s:fmt(s7),e:fmt(hoje)};
    case 'mes':    const sm=new Date(hoje.getFullYear(),hoje.getMonth(),1);return {s:fmt(sm),e:fmt(hoje)};
    case 'mesant': const pm=new Date(hoje.getFullYear(),hoje.getMonth()-1,1);
                   const em=new Date(hoje.getFullYear(),hoje.getMonth(),0);
                   return {s:fmt(pm),e:fmt(em)};
    case 'custom': {
      const si=document.getElementById('hist-start')?.value;
      const ei=document.getElementById('hist-end')?.value;
      if(!si||!ei) return null;
      const parse=v=>{const[y,m,d]=v.split('-');return d+'/'+m+'/'+y;};
      return {s:parse(si),e:parse(ei)};
    }
    default: return {s:fmt(hoje),e:fmt(hoje)};
  }
}

function renderHistExtChart_(stats) {
  const wrap = document.getElementById('hist-ext-chart-wrap');
  const canvas = document.getElementById('chart-hist-ext');
  const ins = document.getElementById('hist-ext-insight');
  if (!wrap || !canvas || !window.Chart) return;
  const arr = (stats && stats.extPorDia) || [];
  const show = arr.some(x => x.valor > 0) || (stats && stats.totalExt > 0);
  if (!show || !stats || !stats.n) {
    wrap.style.display = 'none';
    if (chartHistExt) { chartHistExt.destroy(); chartHistExt = null; }
    return;
  }
  wrap.style.display = 'block';
  if (chartHistExt) chartHistExt.destroy();
  chartHistExt = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: arr.map(x => x.label || String(x.dia)),
      datasets: [{
        data: arr.map(x => Math.round(x.valor)),
        backgroundColor: '#CE93D8',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 9 }, maxTicksLimit: 12 } },
        y: { ticks: { callback: v => 'R$' + v }, min: 0 }
      }
    }
  });
  if (ins) {
    const pct = stats.pctExt != null ? stats.pctExt : (stats.totalFat > 0 ? Math.round(stats.totalExt / stats.totalFat * 1000) / 10 : 0);
    const best = arr.reduce((a, b) => (b.valor > (a.valor || 0) ? b : a), { valor: 0, label: '—' });
    ins.style.display = 'block';
    ins.textContent = 'Extras = ' + pct + '% do faturamento do período'
      + (best.valor > 0 ? ' · pico em ' + best.label + ' (' + ('R$ ' + Number(best.valor).toFixed(2).replace('.', ',')) + ')' : '')
      + (stats.nComExtra ? ' · ' + stats.nComExtra + ' locações com minuto extra.' : '.');
  }
}

function renderAnalyticsCards(stats) {
  const cards = document.getElementById('analytics-cards');
  const ranking = document.getElementById('ranking-card');
  const rankRows = document.getElementById('ranking-rows');
  const rankInsight = document.getElementById('rank-insight');
  if(!cards) return;
  if(!stats||!stats.n) {
    cards.style.display='none';
    if(ranking) ranking.style.display='none';
    renderHistExtChart_(null);
    return;
  }

  cards.style.display='grid';
  const R = v=>'R$ '+Number(v).toFixed(2).replace('.',',');
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
  set('ac-fat', R(stats.totalFat));
  set('ac-n', stats.n);
  set('ac-ticket', R(stats.ticketMedio));
  set('ac-extras', R(stats.totalExt));
  if (stats.pctExt != null && rankInsight) {
    const extraLine = stats.pctExt >= 15
      ? '💡 Extras em ' + stats.pctExt + '% do faturamento — alto; alinhe aviso de tempo com operadores.'
      : '💡 Extras em ' + stats.pctExt + '% do faturamento do período.';
    rankInsight.dataset.extraInsight = extraLine;
  }

  // Ranking
  if(!ranking||!rankRows) return;
  const pt = stats.porTipo||{};
  const total = Object.values(pt).reduce((s,v)=>s+(v.n||0),0);
  if(!total) { ranking.style.display='none'; return; }
  ranking.style.display='block';
  const sorted = Object.entries(pt).sort((a,b)=>b[1].n-a[1].n);
  rankRows.innerHTML = sorted.map(([tipo,d])=>{
    const icon=tipoIcon(tipo);
    const pct=total>0?Math.round(d.n/total*100):0;
    const color=tipoCor(tipo);
    return `<div class="rank-row">
      <div class="rank-label"><span>${icon} ${tipo}</span><span>${d.n} atten. · ${pct}% · ${R(d.fat)}</span></div>
      <div class="rank-bar-bg"><div class="rank-bar" style="width:${pct}%;background:${color}"></div></div>
    </div>`;
  }).join('');

  // Insight estratégico
  const lider = sorted[0];
  const insights = {
    'Carro':    '🚗 Carros lideram — considere ampliar a frota de carros.',
    'Triciclo': '🛺 Triciclos lideram — ótima adesão ao novo veículo!',
    'Pelúcia':  '🧸 Pelúcias lideram — invista em mais pelúcias elétricas.'
  };
  const extraIns = rankInsight && rankInsight.dataset.extraInsight ? rankInsight.dataset.extraInsight + '<br>' : '';
  if(rankInsight) rankInsight.innerHTML = extraIns + (insights[lider[0]] || '');

  // Planos mais vendidos
  const pp = stats.porPlano||{};
  const topPlanos = Object.entries(pp).sort((a,b)=>b[1].n-a[1].n).slice(0,3);
  if(topPlanos.length && rankInsight) {
    rankInsight.innerHTML += '<br>📊 Top planos: '+topPlanos.map(([pl,d],i)=>
      `${i+1}° ${pl} (${d.n}×)`).join(' · ');
  }
}

