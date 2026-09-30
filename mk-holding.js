/* MOVI KIDS — Painel holding ADM (Golden + La Ville na mesma tela) · I159e */
(function (w) {
  'use strict';

  function isAdm_() {
    return (typeof mkAuthIsAdmin === 'function' && mkAuthIsAdmin()) || !!w.isAdmin;
  }

  function fatEnc_(lista) {
    return (lista || []).reduce(function (s, e) {
      return s + (Number(e.valorTotal) || 0);
    }, 0);
  }

  function fmtMoney_(n) {
    var v = Number(n) || 0;
    return 'R$ ' + v.toFixed(2).replace('.', ',');
  }

  function uidOf_(s) {
    if (typeof mkUnidadeOfSession_ === 'function') return mkUnidadeOfSession_(s);
    if (typeof mkUnidadeFromVeiculo_ === 'function') return mkUnidadeFromVeiculo_(s && s.veiculo);
    return 'golden';
  }

  function packUnidade_(uid) {
    var sess = (typeof sessions !== 'undefined' && Array.isArray(sessions)) ? sessions : [];
    var enc = (typeof encHojeData !== 'undefined' && Array.isArray(encHojeData)) ? encHojeData : [];
    var ativas = sess.filter(function (s) {
      return s && (s.status === 'Ativa' || s.status === 'Pendente' || s.started || s._optimistic);
    }).filter(function (s) { return uidOf_(s) === uid; });
    var encU = enc.filter(function (e) { return uidOf_(e) === uid; });
    var nContas = typeof mkContasEncHoje_ === 'function' ? mkContasEncHoje_(encU) : encU.length;
    var u = typeof mkUnidadeGet_ === 'function' ? mkUnidadeGet_(uid) : { nome: uid, nomeCurto: uid };
    return {
      id: uid,
      nome: u.nome || uid,
      nomeCurto: u.nomeCurto || uid,
      ativas: ativas,
      encHoje: encU,
      nAtivas: ativas.length,
      nContas: nContas,
      nSessoes: encU.length,
      fat: fatEnc_(encU),
      provisoria: !!u.frotaProvisoria
    };
  }

  function rowHtml_(s) {
    var icon = typeof tipoIcon === 'function' ? tipoIcon(s.tipo) : '🚗';
    var rem = '';
    if (s.started && typeof calcRemaining === 'function' && typeof fmtTime === 'function') {
      var r = calcRemaining(s);
      rem = r <= 0 ? 'EXTRA' : fmtTime(r);
    } else if (!s.started) {
      rem = 'Pendente';
    }
    var ri = Number(s.rowIndex) || 0;
    var click = ri >= 11
      ? 'onclick="if(typeof abrirSessaoDrawer===\'function\')abrirSessaoDrawer(' + ri + ')"'
      : '';
    return (
      '<button type="button" class="mk-hold-row" ' + click + '>' +
        '<span class="mk-hold-row-ico">' + icon + '</span>' +
        '<span class="mk-hold-row-main">' +
          '<strong>' + escHold_(s.veiculo || s.tipo) + '</strong>' +
          '<span>' + escHold_(s.crianca || '—') + ' · ' + escHold_(s.plano || '') + '</span>' +
        '</span>' +
        '<span class="mk-hold-row-time">' + escHold_(rem) + '</span>' +
      '</button>'
    );
  }

  function escHold_(t) {
    return String(t == null ? '' : t)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function colHtml_(p) {
    var rows = p.ativas.length
      ? p.ativas.map(rowHtml_).join('')
      : '<div class="mk-hold-empty">Nenhuma locação ativa</div>';
    var badge = p.provisoria ? '<span class="mk-hold-badge">frota provisória</span>' : '';
    return (
      '<section class="mk-hold-col" data-unidade="' + p.id + '">' +
        '<header class="mk-hold-col-head">' +
          '<div>' +
            '<h2 class="mk-hold-col-title">' + (p.id === 'laville' ? '🏬 ' : '🛍️ ') + escHold_(p.nome) + '</h2>' +
            badge +
          '</div>' +
          '<button type="button" class="btn btn-secondary mk-hold-open" onclick="mkHoldingAbrirBalcao_(\'' + p.id + '\')">Abrir balcão</button>' +
        '</header>' +
        '<div class="mk-hold-kpis">' +
          '<div class="mk-hold-kpi"><span class="mk-hold-kpi-val">' + p.nAtivas + '</span><span class="mk-hold-kpi-lbl">Ativas</span></div>' +
          '<div class="mk-hold-kpi"><span class="mk-hold-kpi-val">' + p.nContas + '</span><span class="mk-hold-kpi-lbl">Contas hoje</span></div>' +
          '<div class="mk-hold-kpi"><span class="mk-hold-kpi-val">' + p.nSessoes + '</span><span class="mk-hold-kpi-lbl">Locações</span></div>' +
          '<div class="mk-hold-kpi mk-hold-kpi--fat"><span class="mk-hold-kpi-val">' + fmtMoney_(p.fat) + '</span><span class="mk-hold-kpi-lbl">Caixa hoje</span></div>' +
        '</div>' +
        '<div class="mk-hold-sec-lbl">Sessões abertas</div>' +
        '<div class="mk-hold-list">' + rows + '</div>' +
      '</section>'
    );
  }

  function filtroPill_(id, label, cur) {
    var on = cur === id ? ' mk-hold-pill--on' : '';
    return (
      '<button type="button" class="mk-hold-pill' + on + '" data-filtro="' + id + '"' +
        ' onclick="mkHoldingSetFiltroCaixa_(\'' + id + '\')">' + label + '</button>'
    );
  }

  function renderHolding_() {
    var root = document.getElementById('mk-holding-root');
    if (!root) return;
    if (!isAdm_()) {
      root.innerHTML = '<p class="mk-hold-denied">Visão holding só para administrador.</p>';
      return;
    }
    var g = packUnidade_('golden');
    var l = packUnidade_('laville');
    var filtro = typeof mkUnidadeFiltroAdm_ === 'function' ? mkUnidadeFiltroAdm_() : 'all';
    var showG = filtro === 'all' || filtro === 'golden';
    var showL = filtro === 'all' || filtro === 'laville';
    var totAtivas = (showG ? g.nAtivas : 0) + (showL ? l.nAtivas : 0);
    var totFat = (showG ? g.fat : 0) + (showL ? l.fat : 0);
    var heroLbl = filtro === 'all' ? 'caixa combinado' : ('caixa ' + (filtro === 'laville' ? 'La Ville' : 'Golden'));
    var cols = '';
    if (showG) cols += colHtml_(g);
    if (showL) cols += colHtml_(l);
    root.innerHTML =
      '<div class="mk-hold-hero">' +
        '<div>' +
          '<p class="mk-hold-eyebrow">Administração · holding</p>' +
          '<h1 class="mk-hold-title">As duas lojas agora</h1>' +
          '<p class="mk-hold-sub">Golden e La Ville lado a lado — sem misturar operação.</p>' +
          '<div class="mk-hold-pills" role="group" aria-label="Filtro unidade holding">' +
            filtroPill_('all', 'Todas', filtro) +
            filtroPill_('golden', 'Golden', filtro) +
            filtroPill_('laville', 'La Ville', filtro) +
          '</div>' +
          '<p class="mk-hold-filtro-hint">Filtro desta tela e do Caixa / Dashboard / KPI.</p>' +
        '</div>' +
        '<div class="mk-hold-hero-kpis">' +
          '<div><strong>' + totAtivas + '</strong><span>ativas</span></div>' +
          '<div><strong>' + fmtMoney_(totFat) + '</strong><span>' + heroLbl + '</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="mk-hold-grid' + (filtro !== 'all' ? ' mk-hold-grid--one' : '') + '">' + cols + '</div>';
  }

  function mkHoldingAbrirBalcao_(uid) {
    var r;
    if (typeof mkAppEntrarBalcao_ === 'function') {
      r = mkAppEntrarBalcao_(uid);
    } else if (typeof mkResetBalcaoParaUnidade_ === 'function') {
      r = mkResetBalcaoParaUnidade_(uid);
    } else if (typeof mkUnidadeSet_ === 'function') {
      r = mkUnidadeSet_(uid);
    }
    if (r && !r.ok) {
      if (typeof toast === 'function') toast((r && r.erro) || 'Unidade indisponível', 'warning');
      return;
    }
    if (typeof mkAppModoSet_ === 'function') mkAppModoSet_('balcao');
    if (typeof showPage === 'function') showPage('home', { adminBalcao: true });
    if (typeof mkRefreshUnidadeUi_ === 'function') mkRefreshUnidadeUi_();
    if (typeof mkApplyModoNav_ === 'function') mkApplyModoNav_();
    /* force=true: evita reaplicar cache/inicio da outra loja (I159g). */
    if (typeof syncNow === 'function') {
      try { syncNow(true); } catch (eS) { /* ignore */ }
    } else if (typeof carregarInicio === 'function') {
      try { carregarInicio(); } catch (eC) { /* ignore */ }
    }
    if (typeof toast === 'function') {
      var nome = typeof mkUnidadeLabel_ === 'function' ? mkUnidadeLabel_(uid) : uid;
      toast('Balcão: ' + nome, 'info');
    }
  }

  function mkHoldingSetFiltroCaixa_(id) {
    if (typeof mkDualSetFiltro_ === 'function') mkDualSetFiltro_(id);
    else if (typeof mkUnidadeSetFiltroAdm_ === 'function') mkUnidadeSetFiltroAdm_(id);
    if (typeof mkAppModoSet_ === 'function') mkAppModoSet_('holding');
    renderHolding_();
    if (typeof mkRefreshUnidadeUi_ === 'function') mkRefreshUnidadeUi_();
    if (typeof mkApplyModoNav_ === 'function') mkApplyModoNav_();
    if (typeof mkDualAfterFiltroChange_ === 'function') mkDualAfterFiltroChange_(id);
    if (typeof toast === 'function') {
      var lbl = id === 'all' ? 'Todas as lojas' : (typeof mkUnidadeLabelCurto_ === 'function' ? mkUnidadeLabelCurto_(id) : id);
      toast('Filtro: ' + lbl, 'info');
    }
  }

  w.renderHolding_ = renderHolding_;
  w.mkHoldingAbrirBalcao_ = mkHoldingAbrirBalcao_;
  w.mkHoldingSetFiltroCaixa_ = mkHoldingSetFiltroCaixa_;
})(typeof window !== 'undefined' ? window : globalThis);
