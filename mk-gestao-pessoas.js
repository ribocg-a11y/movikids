/* MOVI KIDS — Gestão de Pessoas (FASE 15) — bridge GAS */
(function (global) {
  'use strict';

  function gpApi(action, params) {
    if (typeof global.api !== 'function') {
      return Promise.reject(new Error('mk-api.js não carregado'));
    }
    const payload = Object.assign({ action: action }, params || {});
    return global.api(payload).then(function (r) {
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
        base: pg.base || 1621, bonus: pg.bonus || 0, faltas: pg.faltas || 0, dependentes: pg.dependentes || 0,
        competencia: pg.competencia, pagamentoEm: pg.pagamentoEm, diasTrabalhados: pg.diasTrabalhados,
        diasMes: pg.diasMes, obs: pg.obs,
        beneficios: pg.beneficios || {},
        holerite: hol
      },
      _holerite: hol,
      comunicados: data.comunicados || []
    };
  }

  global.MK_GestaoPessoas = {
    listarColaboradores: function () {
      return gpApi('listarColaboradoresGestao').then(function (r) {
        return (r.colaboradores || r.operadores || []).filter(function (o) { return o.hasPin !== false; });
      });
    },
    loginPainel: function (operadorId, pin) {
      return gpApi('buscarPainelColaborador', { operadorId: operadorId, pin: pin }).then(function (r) {
        return gpMapPainel(operadorId, r);
      });
    },
    loginPainelPreview: function (operadorId, adminPin) {
      return gpApi('buscarPainelColaboradorPreview', { operadorId: operadorId, adminPin: adminPin }).then(function (r) {
        const mapped = gpMapPainel(operadorId, r);
        mapped.preview = true;
        return mapped;
      });
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
    painelAdmin: function (pinParams) {
      return gpApi('painelGestaoPessoasAdmin', pinParams || {});
    },
    alertasAdmin: function (pinParams) {
      return gpApi('alertasPontoGestaoAdmin', pinParams || {});
    },
    instalarAbasAdmin: function (pinParams) {
      return gpApi('instalarAbasGestaoPessoasAdmin', pinParams || {});
    },
    salvarComunicado: function (pinParams, data) {
      return gpApi('salvarComunicadoRhAdmin', Object.assign({}, pinParams || {}, data || {}));
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
