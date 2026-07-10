/* MOVI KIDS — Histórico de custos (admin/gestor) · I87 */

const CUS_HIST_CACHE_TTL_MS = 120000;
let cusHistPeriod_ = 'mes';
let cusHistAll_ = [];
let cusHistStats_ = null;
let chartCusDia_ = null;
let chartCusGrupo_ = null;

function cusHistR_(v) {
  return 'R$ ' + Number(v || 0).toFixed(2).replace('.', ',');
}

function cusHistCacheKey_(dates) {
  const cat = document.getElementById('cus-hist-cat-filter')?.value || '';
  const grp = document.getElementById('cus-hist-grupo-filter')?.value || '';
  return 'mk_cus_hist_v1_' + dates.s + '_' + dates.e + '_' + cat + '_' + grp;
}

function cusHistSetPeriod(period, btn) {
  cusHistPeriod_ = period;
  document.querySelectorAll('#page-custos-historico .period-btn').forEach(function (b) {
    b.classList.remove('active');
  });
  if (btn) btn.classList.add('active');
  const custom = document.getElementById('cus-hist-custom-row');
  if (custom) custom.style.display = period === 'custom' ? 'flex' : 'none';
  if (period !== 'custom') buscarCustosHistorico();
}

function cusHistGetDates() {
  const hoje = new Date();
  const fmt = function (d) {
    return String(d.getDate()).padStart(2, '0') + '/'
      + String(d.getMonth() + 1).padStart(2, '0') + '/'
      + d.getFullYear();
  };
  const mondayOfWeek = function (d) {
    const x = new Date(d);
    const day = x.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    x.setDate(x.getDate() + diff);
    return x;
  };
  switch (cusHistPeriod_) {
    case 'hoje':
      return { s: fmt(hoje), e: fmt(hoje) };
    case 'semana': {
      const sm = mondayOfWeek(hoje);
      return { s: fmt(sm), e: fmt(hoje) };
    }
    case 'mes': {
      const sm = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      return { s: fmt(sm), e: fmt(hoje) };
    }
    case 'ano': {
      const sm = new Date(hoje.getFullYear(), 0, 1);
      return { s: fmt(sm), e: fmt(hoje) };
    }
    case 'mesant': {
      const pm = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
      const em = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
      return { s: fmt(pm), e: fmt(em) };
    }
    case 'custom': {
      const si = document.getElementById('cus-hist-start')?.value;
      const ei = document.getElementById('cus-hist-end')?.value;
      if (!si || !ei) return null;
      const parse = function (v) {
        const p = v.split('-');
        return p[2] + '/' + p[1] + '/' + p[0];
      };
      return { s: parse(si), e: parse(ei) };
    }
    default:
      return { s: fmt(hoje), e: fmt(hoje) };
  }
}

function cusHistItemHtml_(c) {
  const nat = c.natureza === 'fixo' ? 'fixo' : (c.natureza === 'investimento' ? 'invest' : 'var');
  return '<div class="hist-item cus-hist-item">'
    + '<div class="hi-left">'
    + '<div class="hi-tipo">📂 ' + escHtml(c.categoria || 'Outros') + '</div>'
    + '<div class="hi-names">' + escHtml(c.descricao || '—') + '</div>'
    + '<div class="hi-det">' + escHtml(c.grupoLabel || c.grupoDre || '') + ' · '
    + '<span class="cus-hist-nat cus-hist-nat--' + nat + '">' + (c.natureza || 'variavel') + '</span></div>'
    + '<div class="hi-det">🕐 ' + escHtml(c.hora || '—') + ' · ' + escHtml(c.data || '') + '</div>'
    + '</div>'
    + '<div class="hi-right">'
    + '<div class="hi-valor" style="color:#C62828">' + cusHistR_(c.valor) + '</div>'
    + '</div></div>';
}

function renderCusHistList_(custos, container) {
  if (!custos.length) {
    container.innerHTML = '<div class="empty"><div class="empty-icon">📂</div><h3>Sem custos neste período</h3></div>';
    return;
  }
  container.innerHTML = '';
  let i = 0;
  const CHUNK = 12;
  function paint() {
    const slice = custos.slice(i, i + CHUNK);
    container.insertAdjacentHTML('beforeend', slice.map(cusHistItemHtml_).join(''));
    i += CHUNK;
    if (i < custos.length) requestAnimationFrame(paint);
  }
  requestAnimationFrame(paint);
}

function renderCusHistWidgets_(stats) {
  const cards = document.getElementById('cus-hist-widgets');
  if (!cards) return;
  if (!stats || !stats.n) {
    cards.style.display = 'none';
    return;
  }
  cards.style.display = 'grid';
  const set = function (id, v) {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  };
  set('cus-hist-total', cusHistR_(stats.totalCus));
  set('cus-hist-n', String(stats.n));
  set('cus-hist-media', cusHistR_(stats.mediaDiaria));
  set('cus-hist-fixo', (stats.pctFixo || 0) + '%');
  set('cus-hist-total-ctx', stats.n + ' lançamento(s) · ' + (stats.diasComCusto || 0) + ' dia(s)');
  set('cus-hist-n-ctx', stats.ticketMedio > 0 ? ('Ticket médio ' + cusHistR_(stats.ticketMedio)) : '—');
  set('cus-hist-media-ctx', 'Total ÷ dias com custo');
  set('cus-hist-fixo-ctx', 'Fixo · variável ' + (stats.pctVariavel || 0) + '%');
}

function renderCusHistClassif_(stats) {
  const box = document.getElementById('cus-hist-classif');
  if (!box) return;
  const rows = (stats && stats.classificacao) || [];
  if (!rows.length) {
    box.style.display = 'none';
    return;
  }
  box.style.display = 'block';
  const total = Number(stats.totalCus) || 1;
  document.getElementById('cus-hist-classif-rows').innerHTML = rows.map(function (r) {
    const pct = total > 0 ? Math.round(r.valor / total * 100) : 0;
    const nat = r.natureza === 'fixo' ? 'fixo' : (r.natureza === 'investimento' ? 'invest' : 'var');
    return '<div class="cus-hist-classif-row">'
      + '<div class="cus-hist-classif-main">'
      + '<strong>' + escHtml(r.categoria) + '</strong>'
      + '<span class="cus-hist-nat cus-hist-nat--' + nat + '">' + escHtml(r.grupoLabel || r.grupo) + '</span>'
      + '</div>'
      + '<div class="cus-hist-classif-val">' + cusHistR_(r.valor) + ' · ' + r.n + '× · ' + pct + '%</div>'
      + '<div class="rank-bar-bg"><div class="rank-bar" style="width:' + pct + '%;background:#C62828"></div></div>'
      + '</div>';
  }).join('');
}

function renderCusHistGrupoCards_(stats) {
  const grid = document.getElementById('cus-hist-grupo-grid');
  if (!grid) return;
  const pg = (stats && stats.porGrupoDre) || {};
  const labels = {
    CMV: { title: 'CMV', sub: 'Custo operacional', icon: '🔧' },
    OPEX_FIXO: { title: 'Fixas', sub: 'Aluguel, energia…', icon: '🏢' },
    OPEX_VAR: { title: 'Variáveis', sub: 'Material, outros…', icon: '📦' },
    INVESTIMENTO: { title: 'Investimento', sub: 'Ativos / expansão', icon: '📈' }
  };
  const keys = ['OPEX_FIXO', 'OPEX_VAR', 'CMV', 'INVESTIMENTO'];
  grid.innerHTML = keys.map(function (k) {
    const v = Number(pg[k] || 0);
    const L = labels[k];
    return '<div class="mk-widget mk-widget--pay">'
      + '<span class="mk-widget-lbl">' + L.icon + ' ' + L.title + '</span>'
      + '<span class="mk-widget-val" style="color:#C62828">' + cusHistR_(v) + '</span>'
      + '<span class="mk-widget-ctx">' + L.sub + '</span></div>';
  }).join('');
}

function renderCusHistInsights_(stats) {
  const box = document.getElementById('cus-hist-insights');
  if (!box) return;
  const list = (stats && stats.insights) || [];
  if (!list.length) {
    box.style.display = 'none';
    return;
  }
  box.style.display = 'block';
  document.getElementById('cus-hist-insights-list').innerHTML = list.map(function (t) {
    return '<div class="cus-hist-insight-item">💡 ' + escHtml(t) + '</div>';
  }).join('');
}

function renderCusHistCharts_(stats) {
  const wrapDia = document.getElementById('cus-hist-dia-wrap');
  const wrapGrp = document.getElementById('cus-hist-grupo-wrap');
  if (!window.Chart) return;

  const arr = (stats && stats.cusPorDia) || [];
  if (wrapDia) {
    if (!arr.length || !(stats && stats.n)) {
      wrapDia.style.display = 'none';
      if (chartCusDia_) { chartCusDia_.destroy(); chartCusDia_ = null; }
    } else {
      wrapDia.style.display = 'block';
      const cv = document.getElementById('chart-cus-dia');
      if (cv) {
        if (chartCusDia_) chartCusDia_.destroy();
        chartCusDia_ = new Chart(cv, {
          type: 'bar',
          data: {
            labels: arr.map(function (x) { return x.label || x.dia; }),
            datasets: [{
              data: arr.map(function (x) { return Math.round(x.valor) }),
              backgroundColor: '#EF5350',
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { display: false }, ticks: { font: { size: 9 }, maxTicksLimit: 14 } },
              y: { ticks: { callback: function (v) { return 'R$' + v; } }, min: 0 }
            }
          }
        });
      }
    }
  }

  const pg = (stats && stats.porGrupoDre) || {};
  const gLabels = ['Fixas', 'Variáveis', 'CMV', 'Invest.'];
  const gKeys = ['OPEX_FIXO', 'OPEX_VAR', 'CMV', 'INVESTIMENTO'];
  const gVals = gKeys.map(function (k) { return Math.round(Number(pg[k] || 0)); });
  const gSum = gVals.reduce(function (a, b) { return a + b; }, 0);
  if (wrapGrp) {
    if (gSum <= 0) {
      wrapGrp.style.display = 'none';
      if (chartCusGrupo_) { chartCusGrupo_.destroy(); chartCusGrupo_ = null; }
    } else {
      wrapGrp.style.display = 'block';
      const cv2 = document.getElementById('chart-cus-grupo');
      if (cv2) {
        if (chartCusGrupo_) chartCusGrupo_.destroy();
        chartCusGrupo_ = new Chart(cv2, {
          type: 'doughnut',
          data: {
            labels: gLabels,
            datasets: [{
              data: gVals,
              backgroundColor: ['#1565C0', '#E65100', '#6A1B9A', '#2E7D32']
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
          }
        });
      }
    }
  }
}

function aplicarCustosHistorico_(res) {
  cusHistStats_ = res.stats || null;
  cusHistAll_ = res.custos || [];
  renderCusHistWidgets_(cusHistStats_);
  renderCusHistGrupoCards_(cusHistStats_);
  renderCusHistClassif_(cusHistStats_);
  renderCusHistInsights_(cusHistStats_);
  renderCusHistCharts_(cusHistStats_);

  const catF = document.getElementById('cus-hist-cat-filter')?.value || '';
  const grpF = document.getElementById('cus-hist-grupo-filter')?.value || '';
  let list = cusHistAll_;
  if (catF) list = list.filter(function (c) { return c.categoria === catF; });
  if (grpF) list = list.filter(function (c) { return c.grupoDre === grpF; });

  const container = document.getElementById('cus-hist-container');
  if (container) renderCusHistList_(list, container);

  const planoEl = document.getElementById('cus-hist-plano-badge');
  if (planoEl) {
    planoEl.textContent = res.planoOk ? 'Plano de contas ativo' : 'Classificação padrão';
    planoEl.title = res.planoFonte || '';
  }
}

function cusHistFiltrarLocal_() {
  if (cusHistStats_) aplicarCustosHistorico_({ stats: cusHistStats_, custos: cusHistAll_, planoOk: true, planoFonte: '' });
  else buscarCustosHistorico();
}

async function buscarCustosHistorico() {
  const dates = cusHistGetDates();
  if (!dates) { toast('Selecione as datas', 'error'); return; }
  const container = document.getElementById('cus-hist-container');
  if (!container) return;

  const cacheKey = cusHistCacheKey_(dates);
  try {
    const raw = sessionStorage.getItem(cacheKey);
    if (raw) {
      const cached = JSON.parse(raw);
      if (cached.ts && Date.now() - cached.ts < CUS_HIST_CACHE_TTL_MS && cached.res) {
        aplicarCustosHistorico_(cached.res);
        return;
      }
    }
  } catch (e) { /* ignora */ }

  container.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div>';
  const widgets = document.getElementById('cus-hist-widgets');
  if (widgets) widgets.style.display = 'none';

  try {
    const authP = apiParamsComAuth_();
    const cat = document.getElementById('cus-hist-cat-filter')?.value || '';
    const grp = document.getElementById('cus-hist-grupo-filter')?.value || '';
    const base = {
      action: 'listarCustosHistorico',
      startDate: dates.s,
      endDate: dates.e,
      ...authP
    };
    if (cat) base.categoria = cat;
    if (grp) base.grupoDre = grp;

    const resStatsP = api(Object.assign({ statsOnly: '1' }, base));
    const resFullP = api(base);
    const resStats = await resStatsP;
    if (resStats && resStats.ok && resStats.stats) {
      renderCusHistWidgets_(resStats.stats);
      renderCusHistGrupoCards_(resStats.stats);
      renderCusHistClassif_(resStats.stats);
      renderCusHistInsights_(resStats.stats);
      renderCusHistCharts_(resStats.stats);
    }
    const res = await resFullP;
    if (!res || !res.ok) {
      container.innerHTML = '<div class="empty"><p>' + escHtml((res && res.erro) || 'Erro ao carregar custos') + '</p></div>';
      return;
    }
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), res: res }));
    } catch (e) { /* quota */ }
    aplicarCustosHistorico_(res);
  } catch (e) {
    console.error('buscarCustosHistorico:', e);
    container.innerHTML = '<div class="empty"><p>Erro de conexão.</p></div>';
  }
}

async function cusHistLoadPlanoFiltros_() {
  const catSel = document.getElementById('cus-hist-cat-filter');
  if (!catSel || catSel.dataset.loaded === '1') return;
  try {
    const authP = apiParamsComAuth_();
    const r = await api({ action: 'listarPlanoContas', ...authP });
    if (!r || !r.ok) return;
    const cats = (r.categorias || []).map(function (c) { return c.categoria; });
    const uniq = cats.filter(function (v, i, a) { return a.indexOf(v) === i; }).sort();
    catSel.innerHTML = '<option value="">Todas categorias</option>'
      + uniq.map(function (c) { return '<option value="' + escHtml(c) + '">' + escHtml(c) + '</option>'; }).join('');
    catSel.dataset.loaded = '1';
  } catch (e) { /* ok */ }
}

function initCustosHistorico_() {
  cusHistLoadPlanoFiltros_();
  const hoje = new Date();
  const iso = hoje.getFullYear() + '-'
    + String(hoje.getMonth() + 1).padStart(2, '0') + '-'
    + String(hoje.getDate()).padStart(2, '0');
  const mesIni = hoje.getFullYear() + '-'
    + String(hoje.getMonth() + 1).padStart(2, '0') + '-01';
  const s = document.getElementById('cus-hist-start');
  const e = document.getElementById('cus-hist-end');
  if (s && !s.value) s.value = mesIni;
  if (e && !e.value) e.value = iso;
  buscarCustosHistorico();
}

window.cusHistSetPeriod = cusHistSetPeriod;
window.buscarCustosHistorico = buscarCustosHistorico;
window.cusHistFiltrarLocal_ = cusHistFiltrarLocal_;
window.initCustosHistorico_ = initCustosHistorico_;
