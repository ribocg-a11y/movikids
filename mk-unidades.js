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

  /** Brinquedos La Ville: Carro / Triciclo / Pelúcia / Driffyt (sem plano 3h). */
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
   * Frota provisória (prefixo LV evita colisão com Carro 01 Golden na mesma planilha).
   * Confirmar quantidade real com o sócio antes de operar em produção.
   */
  var FROTA_LAVILLE_PROVISORIA_ = [
    { nome: 'LV Carro 01', tipo: 'Carro' },
    { nome: 'LV Carro 02', tipo: 'Carro' },
    { nome: 'LV Carro 03', tipo: 'Carro' },
    { nome: 'LV Carro 04', tipo: 'Carro' },
    { nome: 'LV Triciclo 01', tipo: 'Triciclo' },
    { nome: 'LV Triciclo 02', tipo: 'Triciclo' },
    { nome: 'LV Pelúcia 01', tipo: 'Pelúcia' },
    { nome: 'LV Pelúcia 02', tipo: 'Pelúcia' },
    { nome: 'LV Pelúcia 03', tipo: 'Pelúcia' },
    { nome: 'LV Pelúcia 04', tipo: 'Pelúcia' },
    { nome: 'LV Driffyt 01', tipo: 'Driffyt' },
    { nome: 'LV Driffyt 02', tipo: 'Driffyt' },
    { nome: 'LV Dino 01', tipo: 'Dino' },
    { nome: 'LV Dino 02', tipo: 'Dino' },
    { nome: 'LV Dino 03', tipo: 'Dino' },
    { nome: 'LV Dino 04', tipo: 'Dino' }
  ];

  var PRECOS_LAVILLE_FE_ = {
    Carro: Object.assign({}, PRECOS_BRINQUEDOS_LV_),
    Triciclo: Object.assign({}, PRECOS_BRINQUEDOS_LV_),
    'Pelúcia': Object.assign({}, PRECOS_BRINQUEDOS_LV_),
    Driffyt: Object.assign({}, PRECOS_BRINQUEDOS_LV_),
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
      frotaProvisoria: true,
      emailRelatorio: '',
      bloqueioMotivo: '',
      precosFe: PRECOS_LAVILLE_FE_,
      veiculosDef: FROTA_LAVILLE_PROVISORIA_
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

  function capturarSnapGoldenSePreciso_() {
    if (_snapGolden_) return;
    if (getUnidadeId() !== 'golden') return;
    if (typeof PRECOS === 'undefined' || !PRECOS) return;
    _snapGolden_ = {
      precosFe: clonePrecos_(PRECOS),
      veiculosDef: (typeof TODOS_VEICULOS_DEF !== 'undefined' && TODOS_VEICULOS_DEF.length)
        ? TODOS_VEICULOS_DEF.map(function (v) { return { nome: v.nome, tipo: v.tipo }; })
        : null
    };
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

  w.mkUnidadeFromVeiculo_ = unidadeIdFromVeiculo_;
  w.mkUnidadeOfSession_ = unidadeIdOfSession_;
  w.mkSessionsPorUnidade_ = sessionsPorUnidade_;
  w.mkUnidadeAplicarConfig_ = aplicarConfigLocal_;
  w.mkUnidadeSyncAposGas_ = syncAposGasConfig_;

  try {
    document.documentElement.setAttribute('data-mk-unidade', getUnidadeId());
  } catch (e4) { /* ignore */ }
})(typeof window !== 'undefined' ? window : globalThis);
