/* MOVI KIDS — Gestão de Pessoas (FASE 15) — bridge GAS */
(function (global) {
  'use strict';

  var GP_API_TIMEOUT_MS = {
    buscarPainelColaborador: 60000,
    buscarPainelColaboradorPreview: 60000,
    painelGestaoPessoasAdmin: 60000,
    alertasPontoGestaoAdmin: 45000,
    repararRhPlanilhaAdmin: 90000
  };

  function gpApi(action, params) {
    if (typeof global.api !== 'function') {
      return Promise.reject(new Error('mk-api.js não carregado'));
    }
    const payload = Object.assign({ action: action }, params || {});
    const timeoutMs = GP_API_TIMEOUT_MS[action] || 45000;
    return global.api(payload, timeoutMs).then(function (r) {
      if (r && r.ok === false) throw new Error(r.erro || r.error || 'Erro GAS');
      return r;
    });
  }

  function gpMapPainel(id, data) {
    const c = data.colaborador || {};
    const pg = data.pagamento || {};
    const hol = pg.holerite || {};
    const m = data.metas || {};
    const cad = c.cadastro || {};
    return {
      id: String(id),
      label: c.label || c.nome || 'Colaborador',
      letra: (c.label || 'C').charAt(0).toUpperCase(),
      owner: false,
      funcao: c.funcao || 'Colaborador',
      admissao: c.admissao || cad.admissao || '',
      turno: c.turno || '',
      cadastro: {
        nomeCompleto: cad.nomeCompleto || c.label || '',
        cpf: cad.cpf || '', nascimento: cad.nascimento || '', telefone: cad.telefone || '',
        email: cad.email || '', endereco: cad.endereco || '', emergencia: cad.emergencia || '',
        admissao: cad.admissao || c.admissao || '', pix: cad.pix || ''
      },
      cadastroPct: typeof c.cadastroPct === 'number' ? c.cadastroPct : (data.cadastroPct || 0),
      cadastroOk: c.cadastroOk === true || data.cadastroOk === true,
      statusHoje: (data.ponto && data.ponto.statusHoje) || 'fora',
      pontoHoje: (data.ponto && data.ponto.hoje) || null,
      folha: (data.ponto && data.ponto.folha) || [],
      jornada: (data.ponto && data.ponto.jornada) || null,
      meta: m.alvo ? {
        alvo: m.alvo, atual: m.atual, bonusValor: m.bonusValor || 100, bonusMin: m.bonusMin || 21,
        admissao: c.admissao, diasMes: (m.diasMes || []).map(function (d) {
          return { data: d.data, dia: '', loc: d.loc, bonusOk: d.bonusOk };
        })
      } : null,
      escala: data.escala || [],
      bancoHoras: data.bancoHoras || '0h00',
      pagamento: {
        base: pg.base != null ? pg.base : 1621, bonus: pg.bonus || 0, faltas: pg.faltas || 0, dependentes: pg.dependentes || 0,
        competencia: pg.competencia, pagamentoEm: pg.pagamentoEm, diasTrabalhados: pg.diasTrabalhados,
        diasMes: pg.diasMes, obs: pg.obs,
        beneficios: pg.beneficios || {},
        holerite: hol
      },
      _holerite: hol,
      comunicados: data.comunicados || [],
      avaliacoes: data.avaliacoes || [],
      historicoDesempenho: data.historicoDesempenho || null,
      competenciaAtiva: data.competencia || (pg.competencia || '')
    };
  }

  function gpCompetenciasList_(nMonths) {
    nMonths = Math.min(24, Math.max(3, Number(nMonths) || 12));
    const list = [];
    const now = new Date();
    for (let i = 0; i < nMonths; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      list.push(String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear());
    }
    return list;
  }

  global.MK_GestaoPessoas = {
    competenciasList: gpCompetenciasList_,
    mesLabel: function (comp) {
      const m = parseInt(String(comp || '').slice(0, 2), 10);
      const names = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const pts = String(comp || '').split('/');
      return (names[m - 1] || String(comp || '').slice(0, 2)) + '/' + (pts[1] || '');
    },
    listarColaboradores: function () {
      return gpApi('listarColaboradoresGestao').then(function (r) {
        return (r.colaboradores || r.operadores || []).filter(function (o) { return o.hasPin !== false; });
      });
    },
    loginPainel: function (operadorId, pin, opts) {
      const params = { operadorId: operadorId, pin: pin };
      if (opts && opts.competencia) params.competencia = String(opts.competencia).trim();
      return gpApi('buscarPainelColaborador', params).then(function (r) {
        const mapped = gpMapPainel(operadorId, r);
        mapped.preview = false;
        return mapped;
      });
    },
    loginPainelPreview: function (operadorId, adminPin, opts) {
      const params = { operadorId: operadorId, adminPin: adminPin };
      if (opts && opts.competencia) params.competencia = String(opts.competencia).trim();
      return gpApi('buscarPainelColaboradorPreview', params).then(function (r) {
        const mapped = gpMapPainel(operadorId, r);
        mapped.preview = true;
        return mapped;
      });
    },
    painelAdmin: function (pinParams, opts) {
      const payload = Object.assign({}, pinParams || {});
      if (opts && opts.competencia) payload.competencia = String(opts.competencia).trim();
      return gpApi('painelGestaoPessoasAdmin', payload);
    },
    listarColaboradoresPreview: function (adminPin) {
      return gpApi('listarColaboradoresGestaoPreview', { adminPin: adminPin }).then(function (r) {
        return (r.colaboradores || []).filter(function (o) { return o.hasPin !== false; });
      });
    },
    registrarPonto: function (operadorId, pin, tipo) {
      return gpApi('registrarPontoColaborador', { operadorId: operadorId, pin: pin, tipo: tipo });
    },
    statusAbas: function () {
      return gpApi('gestaoPessoasStatus');
    },
    alertasAdmin: function (pinParams) {
      return gpApi('alertasPontoGestaoAdmin', pinParams || {});
    },
    instalarAbasAdmin: function (pinParams) {
      return gpApi('instalarAbasGestaoPessoasAdmin', pinParams || {});
    },
    salvarComunicado: function (pinParams, data) {
      return gpApi('salvarComunicadoRhAdmin', Object.assign({}, pinParams || {}, data || {}));
    },
    salvarCadastro: function (operadorId, pin, cadastro) {
      return gpApi('salvarCadastroColaborador', Object.assign({ operadorId: operadorId, pin: pin }, cadastro || {}));
    },
    salvarCadastroAdmin: function (pinParams, data) {
      return gpApi('salvarCadastroRhAdmin', Object.assign({}, pinParams || {}, data || {}));
    },
    salvarContratoAdmin: function (pinParams, data) {
      return gpApi('salvarDadosContratuaisRhAdmin', Object.assign({}, pinParams || {}, data || {}));
    },
    exportarCadastroAdmin: function (pinParams, operadorId) {
      return gpApi('exportarCadastroRhAdmin', Object.assign({}, pinParams || {}, operadorId ? { operadorId: operadorId } : {}));
    },
    repararPlanilhaAdmin: function (pinParams, opts) {
      return gpApi('repararRhPlanilhaAdmin', Object.assign({}, pinParams || {}, opts || {}));
    },
    salvarAvaliacaoAdmin: function (pinParams, data) {
      return gpApi('salvarAvaliacaoRhAdmin', Object.assign({}, pinParams || {}, data || {}));
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
