/* MOVI KIDS — Multi-unidade (Opção A · I159e unidade_id)
 * Golden = legado (CONFIG/GAS). La Ville = catálogo FE + GAS.
 * Sem unidadeId → golden (zero regressão). ADM holding → all.
 */
(function (w) {
  'use strict';

  var STORAGE_KEY = 'mk_unidade_ativa_v1';
  var FILTRO_ADM_KEY = 'mk_unidade_filtro_adm_v1';
  var DEFAULT_ID = 'golden';
  var _snapGolden_ = null;

  /** Brinquedos La Ville: Carro / Triciclo / Pelúcia / Drift (sem plano 3h). */
  var PRECOS_BRINQUEDOS_LV_ = {
    '10min': { v: 15, m: 10, a: 1.5 },
    '20min': { v: 25, m: 20, a: 1.5 },
    '30min': { v: 35, m: 30, a: 1.5 },
    '40min': { v: 45, m: 40, a: 1.5 },
    '60min': { v: 65, m: 60, a: 1.5 }
  };

  /** Dinos La Ville (sem plano 3h). */
  var PRECOS_DINOS_LV_ = {
    '10min': { v: 20, m: 10, a: 2 },
    '20min': { v: 35, m: 20, a: 2 },
    '30min': { v: 50, m: 30, a: 2 },
    '40min': { v: 65, m: 40, a: 2 },
    '60min': { v: 90, m: 60, a: 2 }
  };

  /**
   * Frota La Ville (prefixo LV evita colisão com Golden na mesma planilha).
   * Tipos/preços oficiais do sócio (29/09): Brinquedos + Dinos.
   */
  /** Quantidades oficiais sócio (30/09): 2 carros · 2 drifts · 2 triciclos · 3 pelúcias · 2 dinos. */
  var FROTA_LAVILLE_ = [
    { nome: 'LV Carro 01', tipo: 'Carro' },
    { nome: 'LV Carro 02', tipo: 'Carro' },
    { nome: 'LV Triciclo 01', tipo: 'Triciclo' },
    { nome: 'LV Triciclo 02', tipo: 'Triciclo' },
    { nome: 'LV Pelúcia 01', tipo: 'Pelúcia' },
    { nome: 'LV Pelúcia 02', tipo: 'Pelúcia' },
    { nome: 'LV Pelúcia 03', tipo: 'Pelúcia' },
    { nome: 'LV Drift 01', tipo: 'Drift' },
    { nome: 'LV Drift 02', tipo: 'Drift' },
    { nome: 'LV Dino 01', tipo: 'Dino' },
    { nome: 'LV Dino 02', tipo: 'Dino' }
  ];

  var PRECOS_LAVILLE_FE_ = {
    Carro: Object.assign({}, PRECOS_BRINQUEDOS_LV_),
    Triciclo: Object.assign({}, PRECOS_BRINQUEDOS_LV_),
    'Pelúcia': Object.assign({}, PRECOS_BRINQUEDOS_LV_),
    Drift: Object.assign({}, PRECOS_BRINQUEDOS_LV_),
    Dino: Object.assign({}, PRECOS_DINOS_LV_)
  };

  var UNIDADES = {
    golden: {
      id: 'golden',
      nome: 'Golden Shopping Calhau',
      nomeCurto: 'Golden',
      cidade: 'São Luís/MA',
      ativa: true,
      precosProntos: true,
      emailRelatorio: 'financeiro@goldenshoppingcalhau.com.br'
    },
    laville: {
      id: 'laville',
      nome: 'La Ville Mall',
      nomeCurto: 'La Ville',
      cidade: 'São Luís/MA',
      ativa: true,
      precosProntos: true,
      frotaProvisoria: false,
      emailRelatorio: '',
      bloqueioMotivo: '',
      precosFe: PRECOS_LAVILLE_FE_,
      veiculosDef: FROTA_LAVILLE_
    }
  };

  function canon_(id) {
    var s = String(id || '').trim().toLowerCase();
    if (s === 'golden' || s === 'g' || s === 'calhau') return 'golden';
    if (s === 'laville' || s === 'la-ville' || s === 'la_ville' || s === 'lv') return 'laville';
    if (s === 'all' || s === 'todas' || s === '*' || s === 'holding') return 'all';
    return '';
  }

  function getUnidade(id) {
    var c = canon_(id);
    if (c === 'all') return { id: 'all', nome: 'Todas as lojas', nomeCurto: 'Todas', ativa: true, precosProntos: true };
    return UNIDADES[c || DEFAULT_ID] || UNIDADES[DEFAULT_ID];
  }

  function listUnidades() {
    return [UNIDADES.golden, UNIDADES.laville];
  }

  function listUnidadesAtivas() {
    return listUnidades().filter(function (u) { return u.ativa && u.precosProntos; });
  }

  function readUrlUnidade_() {
    try {
      var q = new URLSearchParams(w.location.search || '');
      return canon_(q.get('unidade') || q.get('unit') || '');
    } catch (e) {
      return '';
    }
  }

  function getUnidadeId() {
    var fromUrl = readUrlUnidade_();
    if (fromUrl && fromUrl !== 'all') {
      var uUrl = getUnidade(fromUrl);
      if (uUrl.ativa && uUrl.precosProntos) return uUrl.id;
      return DEFAULT_ID;
    }
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var c = canon_(raw);
      if (c && c !== 'all') {
        var u = getUnidade(c);
        if (u.ativa && u.precosProntos) return u.id;
      }
    } catch (e2) { /* ignore */ }
    return DEFAULT_ID;
  }

  function setUnidadeId(id) {
    var c = canon_(id);
    if (c === 'all') {
      try { localStorage.setItem(FILTRO_ADM_KEY, 'all'); } catch (eA) { /* ignore */ }
      return { ok: true, unidade: getUnidade('all') };
    }
    var u = getUnidade(id);
    if (!u.ativa || !u.precosProntos) {
      return { ok: false, erro: u.bloqueioMotivo || 'Unidade indisponível', unidade: u };
    }
    try { localStorage.setItem(STORAGE_KEY, u.id); } catch (e) { /* ignore */ }
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-mk-unidade', u.id);
      }
    } catch (e3) { /* ignore */ }
    aplicarConfigLocal_();
    if (typeof w.mkRefreshUnidadeUi_ === 'function') {
      try { w.mkRefreshUnidadeUi_(); } catch (eUi) { /* ignore */ }
    }
    return { ok: true, unidade: u };
  }

  function clearUnidadeEscolha_() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  }

  function getFiltroAdm_() {
    try {
      var f = canon_(localStorage.getItem(FILTRO_ADM_KEY));
      if (f === 'all' || f === 'golden' || f === 'laville') return f;
    } catch (e) { /* ignore */ }
    return 'all';
  }

  function setFiltroAdm_(id) {
    var c = canon_(id);
    if (c !== 'all' && c !== 'golden' && c !== 'laville') c = 'all';
    try { localStorage.setItem(FILTRO_ADM_KEY, c); } catch (e) { /* ignore */ }
    return c;
  }

  function label(id) {
    return getUnidade(id || getUnidadeId()).nome;
  }

  function labelCurto(id) {
    return getUnidade(id || getUnidadeId()).nomeCurto;
  }

  function subLinha(id) {
    var u = getUnidade(id || getUnidadeId());
    var extra = u.frotaProvisoria ? ' · frota provisória' : '';
    return (u.nome || '') + (u.cidade ? ' · ' + u.cidade : '') + extra;
  }

  function precisaEscolherUnidade_() {
    try {
      if (readUrlUnidade_()) {
        var u = getUnidade(readUrlUnidade_());
        return !(u.ativa && u.precosProntos);
      }
      return !localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return true;
    }
  }

  function isAdm_() {
    return (typeof mkAuthIsAdmin === 'function' && mkAuthIsAdmin()) || !!w.isAdmin;
  }

  /** Params API: operador = unidade ativa; ADM holding = all; ADM balcão = unidade; caixa/KPI = filtro ADM. */
  function apiParamsUnidade_() {
    if (isAdm_()) {
      try {
        var home = document.getElementById('page-home');
        if (home && home.classList.contains('active')) {
          return { unidadeId: getUnidadeId() };
        }
        var hold = document.getElementById('page-holding');
        if (hold && hold.classList.contains('active')) {
          return { unidadeId: 'all' };
        }
      } catch (e) { /* ignore */ }
      return { unidadeId: getFiltroAdm_() };
    }
    return { unidadeId: getUnidadeId() };
  }

  function clonePrecos_(src) {
    var out = {};
    Object.keys(src || {}).forEach(function (tipo) {
      out[tipo] = Object.assign({}, src[tipo]);
    });
    return out;
  }

  /** Fallback se snapshot Golden ainda não capturou (ex.: boot direto em La Ville). */
  var FROTA_GOLDEN_FALLBACK_ = [
    { nome: 'Carro 01', tipo: 'Carro' },
    { nome: 'Carro 02', tipo: 'Carro' },
    { nome: 'Carro 03', tipo: 'Carro' },
    { nome: 'Carro 04', tipo: 'Carro' },
    { nome: 'Triciclo 01', tipo: 'Triciclo' },
    { nome: 'Triciclo 02', tipo: 'Triciclo' },
    { nome: 'Pelúcia 01', tipo: 'Pelúcia' },
    { nome: 'Pelúcia 02', tipo: 'Pelúcia' },
    { nome: 'Pelúcia 03', tipo: 'Pelúcia' },
    { nome: 'Pelúcia 04', tipo: 'Pelúcia' }
  ];

  function capturarSnapGoldenSePreciso_() {
    if (_snapGolden_) return;
    if (getUnidadeId() !== 'golden') return;
    if (typeof PRECOS === 'undefined' || !PRECOS) return;
    var defs = (typeof TODOS_VEICULOS_DEF !== 'undefined' && TODOS_VEICULOS_DEF.length)
      ? TODOS_VEICULOS_DEF.map(function (v) { return { nome: v.nome, tipo: v.tipo }; })
      : null;
    if (defs && defs.length) {
      defs = defs.filter(function (v) { return String(v.nome || '').indexOf('LV ') !== 0; });
    }
    _snapGolden_ = {
      precosFe: clonePrecos_(PRECOS),
      veiculosDef: defs && defs.length ? defs : FROTA_GOLDEN_FALLBACK_.slice()
    };
    UNIDADES.golden.veiculosDef = _snapGolden_.veiculosDef.slice();
  }

  /** Frota por unidade — não depende de TODOS_VEICULOS_DEF (que troca ao entrar La Ville). */
  function frotaDefUi_(uid) {
    var id = canon_(uid) || DEFAULT_ID;
    if (id === 'laville') {
      return (UNIDADES.laville.veiculosDef || FROTA_LAVILLE_).slice();
    }
    if (UNIDADES.golden.veiculosDef && UNIDADES.golden.veiculosDef.length) {
      return UNIDADES.golden.veiculosDef.slice();
    }
    if (_snapGolden_ && _snapGolden_.veiculosDef && _snapGolden_.veiculosDef.length) {
      return _snapGolden_.veiculosDef.slice();
    }
    if (typeof TODOS_VEICULOS_DEF !== 'undefined' && TODOS_VEICULOS_DEF.length) {
      var g = TODOS_VEICULOS_DEF.filter(function (v) {
        return String(v.nome || '').indexOf('LV ') !== 0;
      });
      if (g.length) return g.map(function (v) { return { nome: v.nome, tipo: v.tipo }; });
    }
    return FROTA_GOLDEN_FALLBACK_.slice();
  }

  function aplicarConfigLocal_() {
    if (typeof aplicarOperacaoConfig_ !== 'function') return;
    var id = getUnidadeId();
    if (id === 'laville') {
      capturarSnapGoldenSePreciso_();
      var u = UNIDADES.laville;
      aplicarOperacaoConfig_({
        replaceAllPrecos: true,
        precosFe: clonePrecos_(u.precosFe),
        veiculosDef: u.veiculosDef.slice()
      });
    } else if (_snapGolden_) {
      aplicarOperacaoConfig_({
        replaceAllPrecos: true,
        precosFe: clonePrecos_(_snapGolden_.precosFe),
        veiculosDef: _snapGolden_.veiculosDef ? _snapGolden_.veiculosDef.slice() : undefined
      });
    }
    if (typeof rebuildVeiculoGridsFromDef_ === 'function') {
      try { rebuildVeiculoGridsFromDef_(); } catch (eR) { /* ignore */ }
    }
  }

  /** Após carregarInicio/CONFIG do GAS: Golden guarda snapshot; La Ville sobrescreve. */
  function syncAposGasConfig_() {
    if (getUnidadeId() === 'golden') {
      _snapGolden_ = null;
      capturarSnapGoldenSePreciso_();
      return;
    }
    aplicarConfigLocal_();
  }

  function ativarLaVilleQuandoPronta_() {
    UNIDADES.laville.ativa = true;
    UNIDADES.laville.precosProntos = true;
    UNIDADES.laville.frotaProvisoria = false;
    UNIDADES.laville.bloqueioMotivo = '';
  }

  w.MK_UNIDADES = UNIDADES;
  w.MK_UNIDADE_DEFAULT = DEFAULT_ID;
  w.MK_PRECOS_LAVILLE = PRECOS_LAVILLE_FE_;
  w.mkUnidadeCanon_ = canon_;
  w.mkUnidadeGet_ = getUnidade;
  w.mkUnidadeList_ = listUnidades;
  w.mkUnidadeListAtivas_ = listUnidadesAtivas;
  w.mkUnidadeId_ = getUnidadeId;
  w.mkUnidadeSet_ = setUnidadeId;
  w.mkUnidadeClearEscolha_ = clearUnidadeEscolha_;
  w.mkUnidadeLabel_ = label;
  w.mkUnidadeLabelCurto_ = labelCurto;
  w.mkUnidadeSubLinha_ = subLinha;
  w.mkUnidadePrecisaEscolher_ = precisaEscolherUnidade_;
  w.mkUnidadeApiParams_ = apiParamsUnidade_;
  w.mkUnidadeAtivarLaVille_ = ativarLaVilleQuandoPronta_;
  w.mkUnidadeFiltroAdm_ = getFiltroAdm_;
  w.mkUnidadeSetFiltroAdm_ = setFiltroAdm_;

  function unidadeIdFromVeiculo_(veiculo) {
    var v = String(veiculo || '').trim();
    if (v.indexOf('LV ') === 0) return 'laville';
    return DEFAULT_ID;
  }

  function unidadeIdOfSession_(s) {
    if (!s) return DEFAULT_ID;
    var fromCol = canon_(s.unidadeId);
    if (fromCol && fromCol !== 'all') return fromCol;
    return unidadeIdFromVeiculo_(s.veiculo);
  }

  function sessionsPorUnidade_(lista, uid) {
    var id = canon_(uid) || DEFAULT_ID;
    if (id === 'all') return (lista || []).slice();
    return (lista || []).filter(function (s) {
      return unidadeIdOfSession_(s) === id;
    });
  }

  /** Label amigável no balcão — esconde prefixo técnico "LV " (ID interno permanece com LV). */
  function veiculoLabelUi_(nome) {
    var s = String(nome || '').trim();
    if (s.indexOf('LV ') === 0) return s.slice(3);
    return s;
  }

  w.mkUnidadeFromVeiculo_ = unidadeIdFromVeiculo_;
  w.mkUnidadeOfSession_ = unidadeIdOfSession_;
  w.mkSessionsPorUnidade_ = sessionsPorUnidade_;
  w.mkVeiculoLabelUi_ = veiculoLabelUi_;
  w.mkUnidadeFrotaDef_ = frotaDefUi_;
  w.mkUnidadeAplicarConfig_ = aplicarConfigLocal_;
  w.mkUnidadeSyncAposGas_ = syncAposGasConfig_;

  /** Badge/nome da loja no balcão (home, sidebar, header mobile). */
  function refreshUnidadeUi_() {
    var uid = getUnidadeId();
    var u = getUnidade(uid);
    var nome = u.nomeCurto || u.nome || uid;
    var sub = subLinha(uid);
    var banner = document.getElementById('mk-unidade-balcao-banner');
    var nomeEl = document.getElementById('mk-unidade-balcao-nome');
    var subEl = document.getElementById('mk-unidade-balcao-sub');
    if (banner) banner.setAttribute('data-uid', uid);
    if (nomeEl) nomeEl.textContent = nome;
    if (subEl) subEl.textContent = sub;
    var mob = document.getElementById('mk-mob-unidade');
    if (mob) {
      mob.hidden = false;
      mob.textContent = '📍 ' + nome;
      mob.setAttribute('data-uid', uid);
    }
    var sb = document.getElementById('sb-unidade-chip');
    if (sb) {
      var holdOn = false;
      try {
        holdOn = !!(document.getElementById('page-holding') && document.getElementById('page-holding').classList.contains('active'));
      } catch (eH) { /* ignore */ }
      if (holdOn) {
        sb.hidden = true;
      } else {
        sb.hidden = false;
        sb.textContent = '📍 ' + nome;
        sb.setAttribute('data-uid', uid);
      }
    }
  }
  w.mkRefreshUnidadeUi_ = refreshUnidadeUi_;

  /**
   * I159g — ao trocar de loja no balcão: zera KPIs locais (evita herdar Golden)
   * e invalida cache inicio sem unidade.
   */
  function resetBalcaoParaUnidade_(uid) {
    var r = setUnidadeId(uid);
    if (!r || !r.ok) return r;
    /* Não apagar encHojeData global (holding usa as duas lojas).
     * Só zera os tiles do balcão até o sync da unidade voltar. */
    try {
      if (typeof statsHoje !== 'undefined' && statsHoje) {
        statsHoje.n = 0;
        statsHoje.nSessoes = 0;
        statsHoje.fat = 0;
      }
    } catch (e2) { /* ignore */ }
    var nLoc = document.getElementById('stat-nloc');
    if (nLoc) nLoc.textContent = '0';
    var nAt = document.getElementById('stat-ativas');
    if (nAt) nAt.textContent = '0';
    var chipFat = document.getElementById('admin-chip-fat');
    if (chipFat) chipFat.textContent = '0 locações';
    if (typeof w.mkInvalidateInicioCache_ === 'function') {
      try { w.mkInvalidateInicioCache_(); } catch (e4) { /* ignore */ }
    }
    var encU = [];
    try {
      if (typeof w.encHojeData !== 'undefined' && Array.isArray(w.encHojeData) && typeof sessionsPorUnidade_ === 'function') {
        encU = sessionsPorUnidade_(w.encHojeData, uid);
      }
    } catch (e5) { /* ignore */ }
    if (nLoc) nLoc.textContent = String(typeof w.mkContasEncHoje_ === 'function' ? w.mkContasEncHoje_(encU) : encU.length);
    if (typeof w.renderEncHoje === 'function') {
      try { w.renderEncHoje(encU); } catch (e6) { /* ignore */ }
    }
    refreshUnidadeUi_();
    return r;
  }
  w.mkResetBalcaoParaUnidade_ = resetBalcaoParaUnidade_;

  try {
    document.documentElement.setAttribute('data-mk-unidade', getUnidadeId());
  } catch (e4) { /* ignore */ }
  try {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', refreshUnidadeUi_);
    } else {
      refreshUnidadeUi_();
    }
  } catch (e5) { /* ignore */ }
})(typeof window !== 'undefined' ? window : globalThis);
