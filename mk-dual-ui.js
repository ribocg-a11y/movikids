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
})(typeof window !== 'undefined' ? window : globalThis);
