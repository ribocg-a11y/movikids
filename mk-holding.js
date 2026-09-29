/* MOVI KIDS — Painel holding ADM (Golden + La Ville na mesma tela) · I159d */
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

  function packUnidade_(uid) {
    var fromVeic = typeof mkUnidadeFromVeiculo_ === 'function' ? mkUnidadeFromVeiculo_ : function () { return 'golden'; };
    var sess = (typeof sessions !== 'undefined' && Array.isArray(sessions)) ? sessions : [];
    var enc = (typeof encHojeData !== 'undefined' && Array.isArray(encHojeData)) ? encHojeData : [];
    var ativas = sess.filter(function (s) {
      return s && (s.status === 'Ativa' || s.status === 'Pendente' || s.started || s._optimistic);
    }).filter(function (s) { return fromVeic(s.veiculo) === uid; });
    var encU = enc.filter(function (e) { return fromVeic(e.veiculo) === uid; });
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

  function renderHolding_() {
    var root = document.getElementById('mk-holding-root');
    if (!root) return;
    if (!isAdm_()) {
      root.innerHTML = '<p class="mk-hold-denied">Visão holding só para administrador.</p>';
      return;
    }
    var g = packUnidade_('golden');
    var l = packUnidade_('laville');
    var totAtivas = g.nAtivas + l.nAtivas;
    var totFat = g.fat + l.fat;
    root.innerHTML =
      '<div class="mk-hold-hero">' +
        '<div>' +
          '<p class="mk-hold-eyebrow">Administração · holding</p>' +
          '<h1 class="mk-hold-title">As duas lojas agora</h1>' +
          '<p class="mk-hold-sub">Golden e La Ville lado a lado — sem misturar operação.</p>' +
        '</div>' +
        '<div class="mk-hold-hero-kpis">' +
          '<div><strong>' + totAtivas + '</strong><span>ativas no total</span></div>' +
          '<div><strong>' + fmtMoney_(totFat) + '</strong><span>caixa combinado</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="mk-hold-grid">' + colHtml_(g) + colHtml_(l) + '</div>';
  }

  function mkHoldingAbrirBalcao_(uid) {
    if (typeof mkUnidadeSet_ === 'function') {
      var r = mkUnidadeSet_(uid);
      if (!r || !r.ok) {
        if (typeof toast === 'function') toast((r && r.erro) || 'Unidade indisponível', 'warning');
        return;
      }
    }
    if (typeof showPage === 'function') showPage('home', { adminBalcao: true });
    if (typeof toast === 'function') {
      var nome = typeof mkUnidadeLabel_ === 'function' ? mkUnidadeLabel_(uid) : uid;
      toast('Balcão: ' + nome, 'info');
    }
  }

  w.renderHolding_ = renderHolding_;
  w.mkHoldingAbrirBalcao_ = mkHoldingAbrirBalcao_;
})(typeof window !== 'undefined' ? window : globalThis);
