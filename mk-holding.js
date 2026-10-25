/* MOVI KIDS — Painel holding ADM (Golden + La Ville na mesma tela) · I159e
 * I183: KPIs do dia via resumoDia(all)+fatia — não depender só de encHojeData
 * (no celular, após Abrir balcão LV, encHoje fica só La Ville e Golden zera).
 */
(function (w) {
  'use strict';

  var _holdResumoByUid = { golden: null, laville: null, all: null };
  var _holdHydrateInFlight = false;
  var _holdHydrateAt = 0;
  var HOLD_HYDRATE_TTL_MS = 25000;

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

  function hojeFmt_() {
    if (typeof fmtDataBrHoje_ === 'function') return fmtDataBrHoje_();
    var d = new Date();
    var dd = String(d.getDate()).padStart(2, '0');
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    return dd + '/' + mm + '/' + d.getFullYear();
  }

  /** Fatia resumoDia(all) → uma loja (paridade Caixa I159h). */
  function sliceResumoUid_(rAll, uid) {
    if (typeof mkCaixaSliceResumo_ === 'function') {
      return mkCaixaSliceResumo_(rAll, uid);
    }
    if (!rAll || !rAll.ok) return null;
    if (uid === 'all') return Object.assign({}, rAll, { unidadeId: 'all' });
    var locs = (rAll.locacoes || []).filter(function (l) {
      return uidOf_(l) === uid;
    });
    var contas = {};
    var fat = 0;
    locs.forEach(function (l) {
      fat += Number(l.valorTotal) || 0;
      var ck = (l.contaId != null && l.contaId !== '') ? ('c:' + l.contaId)
        : (l.telefone ? ('t:' + String(l.telefone).replace(/\D/g, '')) : ('i:' + l.id));
      contas[ck] = true;
    });
    return {
      ok: true,
      unidadeId: uid,
      n: Object.keys(contas).length,
      nSessoes: locs.length,
      fat: Math.round(fat * 100) / 100,
      locacoes: locs
    };
  }

  function packUnidade_(uid) {
    var sess = (typeof sessions !== 'undefined' && Array.isArray(sessions)) ? sessions : [];
    var enc = (typeof encHojeData !== 'undefined' && Array.isArray(encHojeData)) ? encHojeData : [];
    var ativas = sess.filter(function (s) {
      return s && (s.status === 'Ativa' || s.status === 'Pendente' || s.started || s._optimistic);
    }).filter(function (s) { return uidOf_(s) === uid; });
    var encU = enc.filter(function (e) { return uidOf_(e) === uid; });
    var nContasLocal = typeof mkContasEncHoje_ === 'function' ? mkContasEncHoje_(encU) : encU.length;
    var nSessoesLocal = encU.length;
    var fatLocal = fatEnc_(encU);
    /* I183: resumoDia hidratado prevalece nos KPIs do dia (fonte caixa). */
    var r = _holdResumoByUid[uid];
    var nContas = nContasLocal;
    var nSessoes = nSessoesLocal;
    var fat = fatLocal;
    if (r && r.ok) {
      if (r.n != null) nContas = Number(r.n) || 0;
      if (r.nSessoes != null) nSessoes = Number(r.nSessoes) || 0;
      if (r.fat != null) fat = Number(r.fat) || 0;
    }
    var u = typeof mkUnidadeGet_ === 'function' ? mkUnidadeGet_(uid) : { nome: uid, nomeCurto: uid };
    return {
      id: uid,
      nome: u.nome || uid,
      nomeCurto: u.nomeCurto || uid,
      ativas: ativas,
      encHoje: encU,
      nAtivas: ativas.length,
      nContas: nContas,
      nSessoes: nSessoes,
      fat: fat,
      provisoria: !!u.frotaProvisoria,
      _kpiFonte: (r && r.ok) ? 'resumoDia' : 'encHoje'
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
      '<section class="mk-hold-col" data-unidade="' + p.id + '" data-kpi-fonte="' + (p._kpiFonte || '') + '">' +
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

  /**
   * I183 — Holding: 1× resumoDia(all) + fatia FE.
   * Corrige celular onde encHojeData ficou só de uma loja após Abrir balcão.
   */
  async function hydrateHoldingKpis_(force) {
    if (!isAdm_()) return false;
    var root = document.getElementById('mk-holding-root');
    if (!root) return false;
    var pageOn = !!document.getElementById('page-holding')?.classList.contains('active');
    if (!pageOn && !force) return false;
    var now = Date.now();
    if (!force && _holdHydrateInFlight) return false;
    if (!force && _holdHydrateAt && (now - _holdHydrateAt) < HOLD_HYDRATE_TTL_MS
        && _holdResumoByUid.golden && _holdResumoByUid.laville) {
      renderHolding_();
      return true;
    }
    _holdHydrateInFlight = true;
    try {
      var dataFmt = hojeFmt_();
      var rAll = null;
      if (!force && w._mkCaixaResumoCache_ && w._mkCaixaResumoCache_[dataFmt] && w._mkCaixaResumoCache_[dataFmt].ok) {
        rAll = w._mkCaixaResumoCache_[dataFmt];
      }
      if (!rAll || !rAll.ok) {
        if (typeof api !== 'function') return false;
        var authP = typeof apiParamsComAuth_ === 'function' ? apiParamsComAuth_() : {};
        var req = Object.assign({ action: 'resumoDia', data: dataFmt, unidadeId: 'all' }, authP);
        if (force) req.force = '1';
        rAll = await api(req, 55000);
      }
      if (!rAll || !rAll.ok) {
        console.warn('[Holding] resumoDia falhou', rAll && rAll.erro);
        return false;
      }
      try {
        w._mkCaixaResumoCache_ = w._mkCaixaResumoCache_ || {};
        w._mkCaixaResumoCache_[dataFmt] = rAll;
      } catch (eC) { /* ignore */ }
      if (typeof resumoDiaHoje !== 'undefined') {
        try { resumoDiaHoje = rAll; } catch (eR) { /* ignore */ }
      }
      _holdResumoByUid.all = rAll;
      _holdResumoByUid.golden = sliceResumoUid_(rAll, 'golden');
      _holdResumoByUid.laville = sliceResumoUid_(rAll, 'laville');
      _holdHydrateAt = Date.now();

      /* Em holding: recompõe encHoje das 2 lojas a partir do resumo (sem apagar balcão estrito). */
      var balcaoEstrito = typeof mkIsBalcaoEstrito_ === 'function' && mkIsBalcaoEstrito_();
      if (!balcaoEstrito && Array.isArray(rAll.locacoes)) {
        var encFromResumo = rAll.locacoes.filter(function (l) {
          var st = String((l && l.status) || 'Encerrada');
          return st === 'Encerrada' || st === '';
        }).map(function (l) {
          return {
            id: l.id,
            contaId: l.contaId != null ? l.contaId : l.id,
            horaInicio: l.horaInicio,
            horaFim: l.horaFim,
            tipo: l.tipo,
            plano: l.plano,
            veiculo: l.veiculo,
            unidadeId: uidOf_(l),
            pagamento: l.pagamento,
            crianca: l.crianca,
            responsavel: l.responsavel,
            telefone: l.telefone || '',
            valorTotal: Number(l.valorTotal) || 0,
            status: 'Encerrada'
          };
        });
        if (typeof mkUpdateEncHojeKpis_ === 'function') {
          mkUpdateEncHojeKpis_(encFromResumo);
        } else if (typeof encHojeData !== 'undefined') {
          encHojeData = encFromResumo;
        }
      }
      renderHolding_();
      return true;
    } catch (e) {
      console.warn('[Holding] hydrate', e && e.message ? e.message : e);
      return false;
    } finally {
      _holdHydrateInFlight = false;
    }
  }

  function mkHoldingAbrirBalcao_(uid) {
    var r;
    /* Não usar resetBalcao: ele zera os números e apaga o cache das duas lojas.
     * A lista Encerradas já é filtrada na hora em renderEncHojeList_. */
    if (typeof mkAppEntrarBalcao_ === 'function') {
      r = mkAppEntrarBalcao_(uid);
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
    if (typeof renderEncHojeList_ === 'function') {
      try { renderEncHojeList_(); } catch (eL) { /* ignore */ }
    }
    if (typeof renderCards === 'function') {
      try { renderCards(); } catch (eR) { /* ignore */ }
    }
    /* Cache local já é por loja. force=1 ignorava esse cache e esperava carregarInicio frio. */
    if (typeof syncNow === 'function') {
      try { syncNow(false); } catch (eS) { /* ignore */ }
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
    hydrateHoldingKpis_(false);
    if (typeof toast === 'function') {
      var lbl = id === 'all' ? 'Todas as lojas' : (typeof mkUnidadeLabelCurto_ === 'function' ? mkUnidadeLabelCurto_(id) : id);
      toast('Filtro: ' + lbl, 'info');
    }
  }

  w.renderHolding_ = renderHolding_;
  w.mkHoldingAbrirBalcao_ = mkHoldingAbrirBalcao_;
  w.mkHoldingSetFiltroCaixa_ = mkHoldingSetFiltroCaixa_;
  w.mkHoldingHydrateKpis_ = hydrateHoldingKpis_;
})(typeof window !== 'undefined' ? window : globalThis);
