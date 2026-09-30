/* MOVI KIDS — Dual-unidade UI helpers (I159f) */
(function (w) {
  'use strict';

  function filtroAtual_() {
    if (typeof mkUnidadeFiltroAdm_ === 'function') return mkUnidadeFiltroAdm_();
    return 'all';
  }

  function setFiltro_(id) {
    if (typeof mkUnidadeSetFiltroAdm_ === 'function') mkUnidadeSetFiltroAdm_(id);
    return filtroAtual_();
  }

  function labelCurto_(id) {
    if (typeof mkUnidadeLabelCurto_ === 'function') return mkUnidadeLabelCurto_(id);
    if (id === 'laville') return 'La Ville';
    if (id === 'all') return 'Todas';
    return 'Golden';
  }

  /** Pills Todas|Golden|La Ville — onChange(filtro). */
  function renderPillsHtml_(cur, onChangeFnName) {
    var fn = onChangeFnName || 'mkDualOnFiltro_';
    var items = [
      { id: 'all', label: 'Todas' },
      { id: 'golden', label: 'Golden' },
      { id: 'laville', label: 'La Ville' }
    ];
    return (
      '<div class="mk-hold-pills mk-dual-pills" role="group" aria-label="Filtro unidade">' +
      items.map(function (it) {
        var on = cur === it.id ? ' mk-hold-pill--on' : '';
        return (
          '<button type="button" class="mk-hold-pill' + on + '" data-filtro="' + it.id + '"' +
            ' onclick="' + fn + '(\'' + it.id + '\')">' + it.label + '</button>'
        );
      }).join('') +
      '</div>'
    );
  }

  function mountPills_(el, onChangeFnName) {
    if (!el) return;
    el.innerHTML = renderPillsHtml_(filtroAtual_(), onChangeFnName);
  }

  function dualColShell_(uid, innerHtml, extraClass) {
    var nome = typeof mkUnidadeGet_ === 'function' ? (mkUnidadeGet_(uid).nome || uid) : uid;
    var badge = (uid === 'laville' && typeof mkUnidadeGet_ === 'function' && mkUnidadeGet_(uid).frotaProvisoria)
      ? '<span class="mk-hold-badge">frota provisória</span>' : '';
    var ico = uid === 'laville' ? '🏬' : '🛍️';
    return (
      '<section class="mk-hold-col mk-dual-col ' + (extraClass || '') + '" data-unidade="' + uid + '">' +
        '<header class="mk-hold-col-head"><div>' +
          '<h2 class="mk-hold-col-title">' + ico + ' ' + esc_(nome) + '</h2>' + badge +
        '</div></header>' +
        '<div class="mk-dual-col-body">' + (innerHtml || '') + '</div>' +
      '</section>'
    );
  }

  function esc_(t) {
    return String(t == null ? '' : t)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function uidOf_(s) {
    if (typeof mkUnidadeOfSession_ === 'function') return mkUnidadeOfSession_(s);
    if (typeof mkUnidadeFromVeiculo_ === 'function') return mkUnidadeFromVeiculo_(s && s.veiculo);
    return 'golden';
  }

  function splitByUnidade_(lista) {
    var g = [];
    var l = [];
    (lista || []).forEach(function (item) {
      if (uidOf_(item) === 'laville') l.push(item);
      else g.push(item);
    });
    return { golden: g, laville: l };
  }

  function fmtMoney_(n) {
    var v = Number(n) || 0;
    return 'R$ ' + v.toFixed(2).replace('.', ',');
  }

  function miniKpiHtml_(r) {
    if (!r || !r.ok) {
      return '<div class="mk-dual-mini"><span class="mk-dual-mini-val">—</span><span class="mk-dual-mini-lbl">sem dados</span></div>';
    }
    return (
      '<div class="mk-dual-mini-grid">' +
        '<div class="mk-dual-mini"><span class="mk-dual-mini-val">' + fmtMoney_(r.fat) + '</span><span class="mk-dual-mini-lbl">Caixa</span></div>' +
        '<div class="mk-dual-mini"><span class="mk-dual-mini-val">' + (r.n || 0) + '</span><span class="mk-dual-mini-lbl">Contas</span></div>' +
        '<div class="mk-dual-mini"><span class="mk-dual-mini-val">' + (r.nSessoes || 0) + '</span><span class="mk-dual-mini-lbl">Locações</span></div>' +
        '<div class="mk-dual-mini"><span class="mk-dual-mini-val">' + fmtMoney_(r.resultado) + '</span><span class="mk-dual-mini-lbl">Resultado</span></div>' +
      '</div>'
    );
  }

  /** KPIs do dia a partir de encHojeData (anti-vazamento Web resumoDia pré-v1.5.225). */
  function resumoFromEncHoje_(uid) {
    var encAll = (typeof encHojeData !== 'undefined' && Array.isArray(encHojeData)) ? encHojeData : [];
    var enc = typeof mkSessionsPorUnidade_ === 'function'
      ? mkSessionsPorUnidade_(encAll, uid)
      : encAll.filter(function (e) { return uidOf_(e) === uid; });
    var n = typeof mkContasEncHoje_ === 'function' ? mkContasEncHoje_(enc) : enc.length;
    var fat = enc.reduce(function (s, e) { return s + (Number(e.valorTotal) || 0); }, 0);
    return {
      ok: true,
      n: n,
      nSessoes: enc.length,
      fat: fat,
      resultado: fat,
      _fonte: 'encHoje'
    };
  }

  /** Se laville e golden vierem iguais e encHoje mostra La Ville vazia → Web ainda sem filtro. */
  function preferEncWhenResumoLeak_(rg, rl) {
    var g = rg && rg.ok ? rg : null;
    var l = rl && rl.ok ? rl : null;
    if (!g || !l) return { golden: g || rg, laville: l || rl };
    var same = Number(g.n) === Number(l.n) && Math.abs(Number(g.fat) - Number(l.fat)) < 0.009;
    if (!same) return { golden: g, laville: l };
    var fromG = resumoFromEncHoje_('golden');
    var fromL = resumoFromEncHoje_('laville');
    if (fromL.n === 0 && fromL.nSessoes === 0 && (fromG.n > 0 || fromG.nSessoes > 0 || Number(g.n) > 0)) {
      return { golden: fromG.nSessoes || fromG.n ? fromG : g, laville: fromL };
    }
    return { golden: g, laville: l };
  }

  w.mkDualFiltro_ = filtroAtual_;
  w.mkDualSetFiltro_ = setFiltro_;
  w.mkDualPillsHtml_ = renderPillsHtml_;
  w.mkDualMountPills_ = mountPills_;
  w.mkDualColShell_ = dualColShell_;
  w.mkDualSplit_ = splitByUnidade_;
  w.mkDualUidOf_ = uidOf_;
  w.mkDualMiniKpiHtml_ = miniKpiHtml_;
  w.mkDualLabelCurto_ = labelCurto_;
  w.mkDualFmtMoney_ = fmtMoney_;
  w.mkDualResumoFromEncHoje_ = resumoFromEncHoje_;
  w.mkDualPreferEncWhenResumoLeak_ = preferEncWhenResumoLeak_;
})(typeof window !== 'undefined' ? window : globalThis);
