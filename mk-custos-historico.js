/* MOVI KIDS — Histórico de custos (admin/gestor) · I87 · UI gerencial v1.9.22 */

const CUS_HIST_CACHE_TTL_MS = 120000;
let cusHistPeriod_ = 'mes';
let cusHistAll_ = [];
let cusHistStats_ = null;
let chartCusDia_ = null;
let chartCusGrupo_ = null;
let chartCusMeses_ = null;
let cusHistMesesFetchGen_ = 0;

const CUS_DRE_META_ = {
  OPEX_FIXO: { label: 'Despesas fixas', color: '#1565C0', short: 'Fixas' },
  OPEX_VAR: { label: 'Despesas variáveis', color: '#E65100', short: 'Variáveis' },
  CMV: { label: 'CMV operacional', color: '#6A1B9A', short: 'CMV' },
  INVESTIMENTO: { label: 'Investimentos', color: '#2E7D32', short: 'Invest.' }
};

function cusHistR_(v) {
  return 'R$ ' + Number(v || 0).toFixed(2).replace('.', ',');
}

function cusHistPct_(v) {
  return (Math.round(Number(v || 0) * 10) / 10).toFixed(1).replace('.', ',') + '%';
}

function cusHistNatClass_(natureza) {
  if (natureza === 'fixo') return 'fixo';
  if (natureza === 'investimento') return 'invest';
  return 'var';
}

function cusHistNatLabel_(natureza) {
  if (natureza === 'fixo') return 'Fixo';
  if (natureza === 'investimento') return 'Investimento';
  return 'Variável';
}

function cusHistPeriodLabel_() {
  const dates = cusHistGetDates();
  if (!dates) return '—';
  const names = {
    hoje: 'Hoje',
    semana: 'Esta semana',
    mes: 'Este mês',
    ano: 'Este ano',
    mesant: 'Mês anterior',
    custom: dates.s + ' — ' + dates.e
  };
  return names[cusHistPeriod_] || (dates.s + ' — ' + dates.e);
}

function cusHistSetText_(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
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

function cusHistToggleShell_(hasData) {
  const empty = document.getElementById('cus-hist-empty');
  const body = document.getElementById('cus-hist-body');
  if (empty) empty.hidden = !!hasData;
  if (body) body.hidden = !hasData;
}

function cusHistShowLoading_() {
  cusHistToggleShell_(false);
  const empty = document.getElementById('cus-hist-empty');
  if (empty) {
    empty.hidden = false;
    empty.innerHTML = '<div class="mk-cus-loading"><div class="skeleton"></div><div class="skeleton"></div><p>Carregando despesas…</p></div>';
  }
  const body = document.getElementById('cus-hist-body');
  if (body) body.hidden = true;
}

function cusHistRestoreEmpty_() {
  const empty = document.getElementById('cus-hist-empty');
  if (empty) {
    empty.innerHTML = '<div class="empty-icon">📊</div>'
      + '<h3>Sem despesas no período</h3>'
      + '<p>Altere o filtro ou registre custos em <strong>Registrar Custo</strong> no balcão.</p>';
  }
}

function renderCusHistHero_(stats) {
  const total = Number(stats && stats.totalCus) || 0;
  const n = stats && stats.n || 0;
  const dias = stats && stats.diasComCusto || 0;

  cusHistSetText_('cus-hist-period-label', cusHistPeriodLabel_());
  cusHistSetText_('cus-hist-hero-period', cusHistPeriodLabel_());
  cusHistSetText_('cus-hist-hero-total', cusHistR_(total));

  const badge = document.getElementById('cus-hist-hero-badge');
  if (badge) {
    badge.textContent = n + ' lanç. · ' + dias + ' dia(s)';
  }

  const deltaEl = document.getElementById('cus-hist-hero-delta');
  if (deltaEl) {
    const prev = stats && stats.prevTotal;
    if (prev != null && prev > 0 && total > 0) {
      const diff = Math.round((total - prev) * 100) / 100;
      const pct = Math.round(diff / prev * 1000) / 10;
      const up = diff > 0;
      const cls = up ? 'mk-cus-delta--up' : (diff < 0 ? 'mk-cus-delta--down' : 'mk-cus-delta--flat');
      const sign = diff > 0 ? '+' : '';
      deltaEl.className = 'mk-cus-hero-delta ' + cls;
      deltaEl.innerHTML = '<span class="mk-cus-delta-pct">' + sign + pct.toFixed(1).replace('.', ',') + '%</span>'
        + '<span class="mk-cus-delta-val">' + sign + cusHistR_(Math.abs(diff)) + ' vs período anterior</span>';
    } else if (prev === 0 && total > 0) {
      deltaEl.className = 'mk-cus-hero-delta mk-cus-delta--flat';
      deltaEl.textContent = 'Sem base comparável no período anterior';
    } else {
      deltaEl.className = 'mk-cus-hero-delta';
      deltaEl.textContent = '';
    }
  }
}

function renderCusHistKpis_(stats) {
  if (!stats || !stats.n) return;
  cusHistSetText_('cus-hist-kpi-n', String(stats.n));
  cusHistSetText_('cus-hist-kpi-n-ctx', stats.ticketMedio > 0
    ? ('Ticket médio ' + cusHistR_(stats.ticketMedio)) : '—');
  cusHistSetText_('cus-hist-kpi-media', cusHistR_(stats.mediaDiaria));
  cusHistSetText_('cus-hist-kpi-media-ctx', stats.diasComCusto + ' dia(s) com lançamento');
  cusHistSetText_('cus-hist-kpi-fixo', cusHistPct_(stats.pctFixo));
  cusHistSetText_('cus-hist-kpi-var', cusHistPct_(stats.pctVariavel));

  const pg = stats.porGrupoDre || {};
  cusHistSetText_('cus-hist-kpi-fixo-val', cusHistR_(pg.OPEX_FIXO || 0));
  const varVal = Number(pg.OPEX_VAR || 0) + Number(pg.CMV || 0);
  cusHistSetText_('cus-hist-kpi-var-val', cusHistR_(varVal));
}

function renderCusHistNature_(stats) {
  const bar = document.getElementById('cus-hist-nature-bar');
  const legend = document.getElementById('cus-hist-nature-legend');
  if (!bar || !legend) return;

  const total = Number(stats && stats.totalCus) || 0;
  cusHistSetText_('cus-hist-nature-total', total > 0 ? cusHistR_(total) : '—');

  if (total <= 0) {
    bar.innerHTML = '<div class="mk-cus-nature-seg mk-cus-nature-seg--empty" style="width:100%"></div>';
    legend.innerHTML = '';
    return;
  }

  const pg = stats.porGrupoDre || {};
  const keys = ['OPEX_FIXO', 'OPEX_VAR', 'CMV', 'INVESTIMENTO'];
  const segs = keys.map(function (k) {
    const v = Number(pg[k] || 0);
    const pct = total > 0 ? v / total * 100 : 0;
    return { k: k, v: v, pct: pct, meta: CUS_DRE_META_[k] };
  }).filter(function (x) { return x.v > 0; });

  bar.innerHTML = segs.map(function (s) {
    return '<div class="mk-cus-nature-seg" style="width:' + Math.max(s.pct, 0.5).toFixed(2)
      + '%;background:' + s.meta.color + '" title="' + escHtml(s.meta.label) + ': '
      + cusHistR_(s.v) + '"></div>';
  }).join('') || '<div class="mk-cus-nature-seg mk-cus-nature-seg--empty" style="width:100%"></div>';

  legend.innerHTML = keys.map(function (k) {
    const v = Number(pg[k] || 0);
    const pct = total > 0 ? Math.round(v / total * 1000) / 10 : 0;
    const m = CUS_DRE_META_[k];
    return '<div class="mk-cus-nature-key">'
      + '<span class="mk-cus-nature-dot" style="background:' + m.color + '"></span>'
      + '<span class="mk-cus-nature-key-lbl">' + m.short + '</span>'
      + '<span class="mk-cus-nature-key-val">' + cusHistR_(v) + '</span>'
      + '<span class="mk-cus-nature-key-pct">' + pct.toFixed(1).replace('.', ',') + '%</span>'
      + '</div>';
  }).join('');
}

function renderCusHistDreTable_(stats) {
  const tbody = document.querySelector('#cus-hist-dre-table tbody');
  if (!tbody) return;
  const pg = (stats && stats.porGrupoDre) || {};
  const total = Number(stats && stats.totalCus) || 1;
  const keys = ['OPEX_FIXO', 'OPEX_VAR', 'CMV', 'INVESTIMENTO'];
  tbody.innerHTML = keys.map(function (k) {
    const v = Number(pg[k] || 0);
    const pct = total > 0 ? Math.round(v / total * 1000) / 10 : 0;
    const m = CUS_DRE_META_[k];
    return '<tr>'
      + '<td><span class="mk-cus-dre-dot" style="background:' + m.color + '"></span>' + escHtml(m.label) + '</td>'
      + '<td class="num mk-cus-val">' + cusHistR_(v) + '</td>'
      + '<td class="num">' + pct.toFixed(1).replace('.', ',') + '%</td>'
      + '</tr>';
  }).join('');
}

function renderCusHistClassifTable_(stats) {
  const tbody = document.getElementById('cus-hist-classif-body');
  if (!tbody) return;
  const rows = (stats && stats.classificacao) || [];
  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="mk-cus-empty-cell">Nenhuma categoria no período</td></tr>';
    return;
  }
  tbody.innerHTML = rows.map(function (r) {
    const nat = cusHistNatClass_(r.natureza);
    return '<tr>'
      + '<td><strong>' + escHtml(r.categoria) + '</strong></td>'
      + '<td>' + escHtml(r.grupoLabel || r.grupo || '—') + '</td>'
      + '<td><span class="cus-hist-nat cus-hist-nat--' + nat + '">' + cusHistNatLabel_(r.natureza) + '</span></td>'
      + '<td class="num">' + r.n + '</td>'
      + '<td class="num mk-cus-val">' + cusHistR_(r.valor) + '</td>'
      + '<td class="num">' + (r.pct != null ? r.pct.toFixed(1).replace('.', ',') : '0') + '%</td>'
      + '</tr>';
  }).join('');
}

function cusHistInsightMeta_(text) {
  const t = String(text || '');
  if (/^Concentração/i.test(t)) return { type: 'warn', title: 'Concentração', icon: '⚠' };
  if (/^Perfil/i.test(t)) return { type: 'info', title: 'Perfil de gastos', icon: '📊' };
  if (/^Vs período/i.test(t)) return { type: 'trend', title: 'Comparativo', icon: '📈' };
  if (/^Média diária/i.test(t)) return { type: 'stat', title: 'Ritmo diário', icon: '📅' };
  if (/PLANO_CONTAS|classificação/i.test(t)) return { type: 'alert', title: 'Plano de contas', icon: '📋' };
  if (/^Nenhum custo/i.test(t)) return { type: 'ok', title: 'Período limpo', icon: '✓' };
  return { type: 'tip', title: 'Recomendação', icon: '💡' };
}

function renderCusHistInsights_(stats) {
  const grid = document.getElementById('cus-hist-insights');
  if (!grid) return;
  const list = (stats && stats.insights) || [];
  if (!list.length) {
    grid.innerHTML = '';
    return;
  }
  grid.innerHTML = list.map(function (t) {
    const meta = cusHistInsightMeta_(t);
    const body = t.replace(/^[^:]+:\s*/, '');
    return '<article class="mk-cus-insight mk-cus-insight--' + meta.type + '">'
      + '<div class="mk-cus-insight-head">'
      + '<span class="mk-cus-insight-icon" aria-hidden="true">' + meta.icon + '</span>'
      + '<h3 class="mk-cus-insight-title">' + escHtml(meta.title) + '</h3>'
      + '</div>'
      + '<p class="mk-cus-insight-body">' + escHtml(body || t) + '</p>'
      + '</article>';
  }).join('');
}

function cusHistFmtBr_(d) {
  return String(d.getDate()).padStart(2, '0') + '/'
    + String(d.getMonth() + 1).padStart(2, '0') + '/'
    + d.getFullYear();
}

function cusHistMesesRange_() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const start = new Date(ano, 0, 1);
  return { s: cusHistFmtBr_(start), e: cusHistFmtBr_(hoje), ano: ano };
}

function cusHistMesKeyFromData_(dataBr) {
  const p = String(dataBr || '').split('/');
  if (p.length !== 3) return '';
  return p[2] + '-' + p[1];
}

function cusHistBuildMesesSeries_(custos) {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mesAtual = hoje.getMonth() + 1;
  const map = {};
  for (let m = 1; m <= mesAtual; m++) {
    map[ano + '-' + String(m).padStart(2, '0')] = 0;
  }
  (custos || []).forEach(function (c) {
    const key = cusHistMesKeyFromData_(c.data);
    if (!key || map[key] == null) return;
    map[key] += Number(c.valor) || 0;
  });

  const keysComDado = Object.keys(map).filter(function (k) { return map[k] > 0; }).sort();
  if (!keysComDado.length) return [];

  const firstKey = keysComDado[0];
  const keys = Object.keys(map).filter(function (k) { return k >= firstKey; }).sort();
  const MES_CURTO = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const curKey = ano + '-' + String(mesAtual).padStart(2, '0');

  return keys.map(function (key) {
    const m = parseInt(key.split('-')[1], 10);
    return {
      key: key,
      label: MES_CURTO[m - 1],
      valor: Math.round((map[key] || 0) * 100) / 100,
      atual: key === curKey
    };
  });
}

function renderCusHistMesesChart_(rows) {
  const wrap = document.getElementById('cus-hist-meses-wrap');
  const noteEl = document.getElementById('cus-hist-meses-note');
  if (!wrap || !window.Chart) return;

  const hasVal = (rows || []).some(function (r) { return r.valor > 0; });
  const ano = new Date().getFullYear();
  if (noteEl) {
    noteEl.textContent = hasVal
      ? (ano + ' · 1º mês com gasto → atual')
      : ('ano ' + ano);
  }

  if (!hasVal) {
    wrap.classList.add('is-empty');
    if (chartCusMeses_) { chartCusMeses_.destroy(); chartCusMeses_ = null; }
    return;
  }

  wrap.classList.remove('is-empty');
  const cv = document.getElementById('chart-cus-meses');
  if (!cv) return;
  if (chartCusMeses_) chartCusMeses_.destroy();

  const chartBox = wrap.querySelector('.mk-cus-chart-box--meses');
  if (chartBox) {
    chartBox.style.height = '150px';
    chartBox.style.minHeight = '150px';
  }

  const vals = rows.map(function (r) { return r.valor; });
  const maxVal = Math.max.apply(null, vals.concat([1]));
  const n = rows.length;
  const colors = rows.map(function (r) {
    return r.atual ? '#1565C0' : 'rgba(21, 101, 192, 0.55)';
  });

  chartCusMeses_ = new Chart(cv, {
    type: 'bar',
    data: {
      labels: rows.map(function (r) { return r.label; }),
      datasets: [{
        data: vals,
        backgroundColor: colors,
        hoverBackgroundColor: '#0D47A1',
        borderRadius: 8,
        maxBarThickness: n <= 3 ? 56 : (n <= 6 ? 40 : 28),
        categoryPercentage: n <= 3 ? 0.45 : 0.65,
        barPercentage: 0.85
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 22, right: 8 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: function (items) {
              const i = items && items[0] ? items[0].dataIndex : 0;
              const r = rows[i];
              return r ? (r.label + (r.atual ? ' (atual)' : '')) : '';
            },
            label: function (ctx) { return cusHistR_(ctx.raw || 0); }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 12, weight: '800' }, color: '#455A64' }
        },
        y: {
          min: 0,
          suggestedMax: maxVal * 1.2,
          grid: { color: 'rgba(21,101,192,.08)', drawBorder: false },
          ticks: {
            callback: function (v) {
              if (v >= 1000) return 'R$' + (Math.round(v / 100) / 10) + 'k';
              return 'R$' + v;
            },
            font: { size: 10, weight: '700' },
            maxTicksLimit: 4
          }
        }
      }
    },
    plugins: [{
      id: 'cusMesesValueLabels',
      afterDatasetsDraw: function (chart) {
        const meta = chart.getDatasetMeta(0);
        const ctx = chart.ctx;
        ctx.save();
        ctx.font = '800 11px Nunito, sans-serif';
        ctx.fillStyle = '#37474F';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        meta.data.forEach(function (bar, i) {
          const v = vals[i] || 0;
          if (v <= 0) return;
          const label = v >= 1000
            ? ('R$ ' + (Math.round(v / 10) / 100).toFixed(2).replace('.', ',') + 'k')
            : cusHistR_(v);
          ctx.fillText(label, bar.x, bar.y - 4);
        });
        ctx.restore();
      }
    }]
  });
}

async function buscarCustosMesesSerie_() {
  const range = cusHistMesesRange_();
  const cat = document.getElementById('cus-hist-cat-filter')?.value || '';
  const grp = document.getElementById('cus-hist-grupo-filter')?.value || '';
  const cacheKey = 'mk_cus_meses_v3_' + range.ano + '_' + range.s + '_' + range.e + '_' + cat + '_' + grp;
  const gen = ++cusHistMesesFetchGen_;

  try {
    const raw = sessionStorage.getItem(cacheKey);
    if (raw) {
      const cached = JSON.parse(raw);
      if (cached.ts && Date.now() - cached.ts < CUS_HIST_CACHE_TTL_MS && cached.rows) {
        if (gen === cusHistMesesFetchGen_) renderCusHistMesesChart_(cached.rows);
        return;
      }
    }
  } catch (e) { /* ignora */ }

  try {
    const authP = apiParamsComAuth_();
    const base = {
      action: 'listarCustosHistorico',
      startDate: range.s,
      endDate: range.e,
      ...authP
    };
    if (cat) base.categoria = cat;
    if (grp) base.grupoDre = grp;
    const res = await api(base);
    if (gen !== cusHistMesesFetchGen_) return;
    if (!res || !res.ok) {
      renderCusHistMesesChart_([]);
      return;
    }
    const rows = cusHistBuildMesesSeries_(res.custos || []);
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), rows: rows }));
    } catch (e) { /* quota */ }
    renderCusHistMesesChart_(rows);
  } catch (e) {
    console.error('buscarCustosMesesSerie_:', e);
    if (gen === cusHistMesesFetchGen_) renderCusHistMesesChart_([]);
  }
}

function renderCusHistLedger_(custos) {
  const tbody = document.getElementById('cus-hist-ledger-body');
  if (!tbody) return;
  if (!custos.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="mk-cus-empty-cell">Nenhum lançamento</td></tr>';
    return;
  }
  tbody.innerHTML = custos.map(function (c) {
    return '<tr>'
      + '<td>' + escHtml(c.data || '—') + '</td>'
      + '<td>' + escHtml(c.hora || '—') + '</td>'
      + '<td class="mk-cus-ledger-desc">' + escHtml(c.descricao || '—') + '</td>'
      + '<td>' + escHtml(c.categoria || 'Outros') + '</td>'
      + '<td>' + escHtml(c.grupoLabel || c.grupoDre || '—') + '</td>'
      + '<td class="num mk-cus-val">' + cusHistR_(c.valor) + '</td>'
      + '</tr>';
  }).join('');
}

function renderCusHistCharts_(stats) {
  const wrapDia = document.getElementById('cus-hist-dia-wrap');
  const wrapGrp = document.getElementById('cus-hist-grupo-wrap');
  if (!window.Chart) return;

  const arr = (stats && stats.cusPorDia) || [];
  const noteEl = document.getElementById('cus-hist-dia-note');
  if (noteEl) {
    noteEl.textContent = arr.length ? (arr.length + ' dia(s)') : 'no período';
  }

  if (wrapDia) {
    if (!arr.length || !(stats && stats.n)) {
      wrapDia.classList.add('is-empty');
      if (chartCusDia_) { chartCusDia_.destroy(); chartCusDia_ = null; }
    } else {
      wrapDia.classList.remove('is-empty');
      const cv = document.getElementById('chart-cus-dia');
      if (cv) {
        if (chartCusDia_) chartCusDia_.destroy();
        const maxVal = Math.max.apply(null, arr.map(function (x) { return x.valor; }).concat([1]));
        chartCusDia_ = new Chart(cv, {
          type: 'bar',
          data: {
            labels: arr.map(function (x) { return x.label || x.dia; }),
            datasets: [{
              data: arr.map(function (x) { return Math.round(x.valor * 100) / 100 }),
              backgroundColor: 'rgba(21, 101, 192, 0.75)',
              hoverBackgroundColor: '#1565C0',
              borderRadius: 6,
              maxBarThickness: arr.length <= 3 ? 48 : 28
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                grid: { display: false },
                ticks: { font: { size: 10, weight: '700' }, maxTicksLimit: 16 }
              },
              y: {
                ticks: {
                  callback: function (v) { return 'R$' + v; },
                  font: { size: 10 }
                },
                min: 0,
                suggestedMax: maxVal * 1.15
              }
            }
          }
        });
      }
    }
  }

  const pg = (stats && stats.porGrupoDre) || {};
  const gKeys = ['OPEX_FIXO', 'OPEX_VAR', 'CMV', 'INVESTIMENTO'];
  const gVals = gKeys.map(function (k) { return Math.round(Number(pg[k] || 0) * 100) / 100; });
  const gSum = gVals.reduce(function (a, b) { return a + b; }, 0);
  const gColors = gKeys.map(function (k) { return CUS_DRE_META_[k].color; });
  const gLabels = gKeys.map(function (k) { return CUS_DRE_META_[k].short; });

  if (wrapGrp) {
    if (gSum <= 0) {
      wrapGrp.classList.add('is-empty');
      if (chartCusGrupo_) { chartCusGrupo_.destroy(); chartCusGrupo_ = null; }
    } else {
      wrapGrp.classList.remove('is-empty');
      const cv2 = document.getElementById('chart-cus-grupo');
      if (cv2) {
        if (chartCusGrupo_) chartCusGrupo_.destroy();
        chartCusGrupo_ = new Chart(cv2, {
          type: 'doughnut',
          data: {
            labels: gLabels,
            datasets: [{
              data: gVals,
              backgroundColor: gColors,
              borderWidth: 2,
              borderColor: '#fff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '62%',
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function (ctx) {
                    const v = ctx.raw || 0;
                    const pct = gSum > 0 ? Math.round(v / gSum * 1000) / 10 : 0;
                    return ctx.label + ': ' + cusHistR_(v) + ' (' + pct + '%)';
                  }
                }
              }
            }
          }
        });
      }
    }
  }
}

function aplicarCustosHistorico_(res) {
  cusHistStats_ = res.stats || null;
  cusHistAll_ = res.custos || [];
  const stats = cusHistStats_;
  const hasData = !!(stats && stats.n > 0);

  cusHistRestoreEmpty_();
  cusHistToggleShell_(hasData);
  if (!hasData) return;

  renderCusHistHero_(stats);
  renderCusHistKpis_(stats);
  renderCusHistNature_(stats);
  renderCusHistDreTable_(stats);
  renderCusHistClassifTable_(stats);
  renderCusHistInsights_(stats);
  renderCusHistCharts_(stats);
  buscarCustosMesesSerie_();

  const catF = document.getElementById('cus-hist-cat-filter')?.value || '';
  const grpF = document.getElementById('cus-hist-grupo-filter')?.value || '';
  let list = cusHistAll_;
  if (catF) list = list.filter(function (c) { return c.categoria === catF; });
  if (grpF) list = list.filter(function (c) { return c.grupoDre === grpF; });
  renderCusHistLedger_(list);

  const planoEl = document.getElementById('cus-hist-plano-badge');
  if (planoEl) {
    planoEl.textContent = res.planoOk ? 'Plano de contas ativo' : 'Classificação padrão';
    planoEl.title = res.planoFonte || '';
    planoEl.classList.toggle('mk-cus-plano-pill--ok', !!res.planoOk);
  }
}

async function buscarCustosHistorico() {
  const dates = cusHistGetDates();
  if (!dates) { toast('Selecione as datas', 'error'); return; }

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

  cusHistShowLoading_();

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
      cusHistStats_ = resStats.stats;
      cusHistToggleShell_(resStats.stats.n > 0);
      if (resStats.stats.n > 0) {
        renderCusHistHero_(resStats.stats);
        renderCusHistKpis_(resStats.stats);
        renderCusHistNature_(resStats.stats);
        renderCusHistDreTable_(resStats.stats);
        renderCusHistClassifTable_(resStats.stats);
        renderCusHistInsights_(resStats.stats);
        renderCusHistCharts_(resStats.stats);
        buscarCustosMesesSerie_();
      }
    }
    const res = await resFullP;
    if (!res || !res.ok) {
      cusHistRestoreEmpty_();
      const empty = document.getElementById('cus-hist-empty');
      if (empty) {
        empty.hidden = false;
        empty.innerHTML = '<div class="empty-icon">⚠</div><h3>Erro ao carregar</h3><p>'
          + escHtml((res && res.erro) || 'Tente novamente.') + '</p>';
      }
      document.getElementById('cus-hist-body').hidden = true;
      return;
    }
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), res: res }));
    } catch (e) { /* quota */ }
    aplicarCustosHistorico_(res);
  } catch (e) {
    console.error('buscarCustosHistorico:', e);
    cusHistRestoreEmpty_();
    const empty = document.getElementById('cus-hist-empty');
    if (empty) {
      empty.hidden = false;
      empty.innerHTML = '<div class="empty-icon">⚠</div><h3>Erro de conexão</h3><p>Verifique a rede e tente de novo.</p>';
    }
    document.getElementById('cus-hist-body').hidden = true;
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
    catSel.innerHTML = '<option value="">Todas as categorias</option>'
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
window.initCustosHistorico_ = initCustosHistorico_;
