/* MOVI KIDS — Multi-unidade (Opção A · fase 1 fundação)
 * Golden ativo; La Ville cadastrada mas inativa até tabela de preços.
 * Sem unidadeId → trata como golden (zero regressão).
 */
(function (w) {
  'use strict';

  var STORAGE_KEY = 'mk_unidade_ativa_v1';
  var DEFAULT_ID = 'golden';

  /** Catálogo canônico — preços/frota La Ville entram quando o sócio enviar a tabela. */
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
      ativa: false,
      precosProntos: false,
      emailRelatorio: '',
      bloqueioMotivo: 'Aguardando tabela de preços e frota'
    }
  };

  function canon_(id) {
    var s = String(id || '').trim().toLowerCase();
    if (s === 'golden' || s === 'g' || s === 'calhau') return 'golden';
    if (s === 'laville' || s === 'la-ville' || s === 'la_ville' || s === 'lv') return 'laville';
    return '';
  }

  function getUnidade(id) {
    var c = canon_(id) || DEFAULT_ID;
    return UNIDADES[c] || UNIDADES[DEFAULT_ID];
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
    if (fromUrl) {
      var uUrl = getUnidade(fromUrl);
      if (uUrl.ativa && uUrl.precosProntos) return uUrl.id;
      /* URL aponta para unidade ainda bloqueada → golden */
      return DEFAULT_ID;
    }
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var c = canon_(raw);
      if (c) {
        var u = getUnidade(c);
        if (u.ativa && u.precosProntos) return u.id;
      }
    } catch (e2) { /* ignore */ }
    return DEFAULT_ID;
  }

  function setUnidadeId(id) {
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
    return { ok: true, unidade: u };
  }

  function clearUnidadeEscolha_() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  }

  function label(id) {
    return getUnidade(id || getUnidadeId()).nome;
  }

  function labelCurto(id) {
    return getUnidade(id || getUnidadeId()).nomeCurto;
  }

  function subLinha(id) {
    var u = getUnidade(id || getUnidadeId());
    return u.nome + (u.cidade ? ' · ' + u.cidade : '');
  }

  /** true se o hub deve pedir escolha (ainda sem escolha persistida nesta instalação). */
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

  function apiParamsUnidade_() {
    return { unidadeId: getUnidadeId() };
  }

  function ativarLaVilleQuandoPronta_() {
    UNIDADES.laville.ativa = true;
    UNIDADES.laville.precosProntos = true;
    UNIDADES.laville.bloqueioMotivo = '';
  }

  w.MK_UNIDADES = UNIDADES;
  w.MK_UNIDADE_DEFAULT = DEFAULT_ID;
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

  try {
    document.documentElement.setAttribute('data-mk-unidade', getUnidadeId());
  } catch (e4) { /* ignore */ }
})(typeof window !== 'undefined' ? window : globalThis);
