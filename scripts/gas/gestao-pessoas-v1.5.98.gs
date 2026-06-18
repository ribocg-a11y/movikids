// ── GESTÃO DE PESSOAS (FASE 15) — v1.5.98 ─────────────────────

const SH_COLAB_RH = 'COLABORADORES_RH';
const SH_FOLHA_PONTO = 'FOLHA_PONTO';
const SH_ESCALA_COLAB = 'ESCALA_COLABORADORES';
const SH_FALTAS = 'FALTAS_AUSENCIAS';
const SH_HOLERITES = 'HOLERITES';
const SH_METAS_COLAB = 'METAS_COLABORADORES';
const SH_BANCO_HORAS = 'BANCO_HORAS';
const GP_DATA_ROW = 2;

function gpSheet_(name) {
  const sh = ss_().getSheetByName(name);
  if (!sh) throw new Error('Aba ' + name + ' ausente — rode criar-abas-gestao-pessoas');
  return sh;
}

function gpRows_(name) {
  const sh = gpSheet_(name);
  const last = sh.getLastRow();
  if (last < GP_DATA_ROW) return [];
  return sh.getRange(GP_DATA_ROW, 1, last - GP_DATA_ROW + 1, sh.getLastColumn()).getValues();
}

function gpCompetenciaAtual_() {
  const d = new Date();
  return String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
}

function gpVerifyPinColaborador_(operadorId, pin) {
  const found = operadorRowById_(operadorId);
  if (!found) return { ok: false, err: err_('Operador nao encontrado', 404) };
  const op = operadorObjFromRow_(found.data);
  if (!op.ativo) return { ok: false, err: err_('Colaborador inativo', 403) };
  const hash = String(found.data[3] || '').trim();
  const salt = String(found.data[4] || '').trim();
  if (!hash || !salt) return { ok: false, err: err_('PIN ainda nao definido', 403) };
  const pinNorm = pinDigits_(pin);
  if (!validPinFormat_(pinNorm)) return { ok: false, err: err_('PIN invalido', 400) };
  if (hashPin_(pinNorm, salt) !== hash) return { ok: false, err: err_('PIN incorreto', 401) };
  return { ok: true, operador: op };
}

function gpColabRhByOpId_(opId) {
  const rows = gpRows_(SH_COLAB_RH);
  for (let i = 0; i < rows.length; i++) {
    if (Number(rows[i][0]) === Number(opId)) {
      return {
        operadorId: Number(rows[i][0]),
        nome: String(rows[i][1] || '').trim(),
        funcao: String(rows[i][2] || '').trim(),
        cpf: String(rows[i][3] || '').trim(),
        nascimento: cellToStr_(rows[i][4]),
        telefone: String(rows[i][5] || '').trim(),
        email: String(rows[i][6] || '').trim(),
        endereco: String(rows[i][7] || '').trim(),
        emergencia: String(rows[i][8] || '').trim(),
        admissao: cellToStr_(rows[i][9]),
        pix: String(rows[i][10] || '').trim(),
        salarioBase: Number(rows[i][11]) || 1621,
        vaDiario: Number(rows[i][12]) || 20,
        metaLocDia: Number(rows[i][13]) || 20,
        bonusMeta: Number(rows[i][14]) || 100,
        turno: String(rows[i][15] || '').trim(),
        ativo: String(rows[i][16] || 'SIM').toUpperCase() !== 'NAO',
        cadastroPct: Number(rows[i][17]) || 0,
        row: GP_DATA_ROW + i
      };
    }
  }
  return null;
}

function gpCalcInss_(baseInss) {
  const faixas = [
    { ate: 1518, ali: 0.075 },
    { ate: 2793.88, ali: 0.09 },
    { ate: 4190.83, ali: 0.12 },
    { ate: 8157.41, ali: 0.14 }
  ];
  let rest = baseInss, prev = 0, total = 0, aliEf = 0;
  faixas.forEach(function (f) {
    const fx = Math.min(rest, f.ate - prev);
    if (fx <= 0) return;
    total += fx * f.ali;
    rest -= fx;
    prev = f.ate;
    aliEf = f.ali;
  });
  return { inss: Math.round(total * 100) / 100, aliEf: aliEf };
}

function gpCalcIrrf_(baseIrrf) {
  const faixas = [
    { ate: 2259.2, ali: 0, ded: 0 },
    { ate: 2826.65, ali: 0.075, ded: 169.44 },
    { ate: 3751.05, ali: 0.15, ded: 381.44 },
    { ate: 4666.68, ali: 0.225, ded: 662.77 },
    { ate: Infinity, ali: 0.275, ded: 896 }
  ];
  if (baseIrrf <= faixas[0].ate) return { irrf: 0, isento: true };
  for (let i = 0; i < faixas.length; i++) {
    if (baseIrrf <= faixas[i].ate) {
      const v = Math.max(0, baseIrrf * faixas[i].ali - faixas[i].ded);
      return { irrf: Math.round(v * 100) / 100, isento: false };
    }
  }
  return { irrf: 0, isento: true };
}

function gpCalcHollerite_(colab, bonus, faltas, vaDias) {
  const base = colab.salarioBase || 1621;
  bonus = bonus || 0;
  faltas = faltas || 0;
  vaDias = vaDias || 0;
  const bruto = base + bonus;
  const inssCalc = gpCalcInss_(bruto);
  const irrfCalc = gpCalcIrrf_(bruto - inssCalc.inss);
  const vt = Math.round(base * 0.06 * 100) / 100;
  const fgts = Math.round(bruto * 0.08 * 100) / 100;
  const vaTotal = Math.round((colab.vaDiario || 20) * vaDias * 100) / 100;
  const totalDescontos = inssCalc.inss + irrfCalc.irrf + vt + faltas;
  return {
    base: base, bonus: bonus, faltas: faltas, bruto: bruto,
    inss: inssCalc.inss, inssAli: inssCalc.aliEf, irrf: irrfCalc.irrf, irrfIsento: irrfCalc.isento,
    vt: vt, fgts: fgts, vaTotal: vaTotal, vaDias: vaDias, vaDiario: colab.vaDiario || 20,
    vtPasses: Math.round((5 * 24 * 2.34) * 100) / 100,
    totalDescontos: Math.round(totalDescontos * 100) / 100,
    liquido: Math.round((bruto - totalDescontos) * 100) / 100,
    baseInss: bruto, irrfBase: Math.round((bruto - inssCalc.inss) * 100) / 100
  };
}

function gpFolhaPontoColab_(opId, competencia) {
  return gpRows_(SH_FOLHA_PONTO).filter(function (r) {
    return Number(r[1]) === Number(opId) && String(r[2] || '').indexOf(competencia.slice(0, 2)) >= 0;
  }).map(function (r) {
    return {
      data: cellToStr_(r[2]), dia: String(r[3] || ''), entrada: cellToStr_(r[4]),
      saida: cellToStr_(r[5]), horas: String(r[6] || ''), sit: String(r[7] || 'OK')
    };
  });
}

function gpMetasColab_(opId, competencia) {
  const mes = competencia.slice(0, 2);
  const dias = gpRows_(SH_METAS_COLAB).filter(function (r) {
    return Number(r[1]) === Number(opId) && cellToStr_(r[2]).indexOf('/' + mes + '/') >= 0;
  }).map(function (r) {
    return {
      data: cellToStr_(r[2]), loc: Number(r[3]) || 0, meta: Number(r[4]) || 20,
      bonusOk: String(r[5] || '').toUpperCase() === 'SIM', bonusValor: Number(r[6]) || 0
    };
  });
  const bonusTotal = dias.filter(function (d) { return d.bonusOk; }).reduce(function (s, d) { return s + d.bonusValor; }, 0);
  const meta = dias.length ? dias[0].meta : 20;
  const hoje = gpRows_(SH_METAS_COLAB).filter(function (r) {
    return Number(r[1]) === Number(opId) && cellToStr_(r[2]) === fmtData_(new Date());
  });
  const atual = hoje.length ? Number(hoje[0][3]) || 0 : 0;
  return { alvo: meta, atual: atual, bonusValor: 100, bonusMin: meta + 1, diasMes: dias, bonusTotal: bonusTotal };
}

function gpEscalaColab_(opId, competencia) {
  const row = gpRows_(SH_ESCALA_COLAB).find(function (r) {
    return Number(r[0]) === Number(opId) && String(r[1] || '') === competencia;
  });
  if (!row) return ['—', '—', '—', '—', '—', '—', '—'];
  return [String(row[2] || ''), String(row[3] || ''), String(row[4] || ''), String(row[5] || ''), String(row[6] || ''), String(row[7] || ''), String(row[8] || '')];
}

function gpBancoHoras_(opId) {
  const row = gpRows_(SH_BANCO_HORAS).find(function (r) { return Number(r[0]) === Number(opId); });
  return row ? String(row[1] || '0h00') : '0h00';
}

function gpStatusPontoHoje_(opId) {
  const hoje = fmtData_(new Date());
  const rows = gpRows_(SH_FOLHA_PONTO).filter(function (r) {
    return Number(r[1]) === Number(opId) && cellToStr_(r[2]) === hoje;
  });
  if (!rows.length) return { status: 'fora', entrada: null, saida: null };
  const r = rows[rows.length - 1];
  const ent = cellToStr_(r[4]);
  const sai = cellToStr_(r[5]);
  if (ent && !sai) return { status: 'dentro', entrada: ent, saida: null };
  if (ent && sai) return { status: 'fora', entrada: ent, saida: sai };
  return { status: 'fora', entrada: null, saida: null };
}

function gpListarColaboradoresGestao_() {
  try {
    const ops = listarOperadoresLogin_();
    let content = ops.getContent();
    let parsed;
    try { parsed = JSON.parse(content); } catch (e) { return ops; }
    if (!parsed.ok) return ops;
    const rh = gpRows_(SH_COLAB_RH);
    const idsRh = rh.map(function (r) { return Number(r[0]); });
    parsed.colaboradores = (parsed.operadores || []).filter(function (o) {
      return idsRh.indexOf(Number(o.id)) >= 0 || Number(o.id) === 3 || Number(o.id) === 4;
    }).map(function (o) {
      const c = gpColabRhByOpId_(o.id);
      return {
        id: o.id, nome: o.nome, hasPin: o.hasPin, funcao: c ? c.funcao : 'Colaborador',
        cadastroPct: c ? c.cadastroPct : 0
      };
    });
    return resp_(parsed);
  } catch (ex) {
    return err_('Abas Gestao Pessoas ausentes — rode scripts/criar-abas-gestao-pessoas.ps1', 503);
  }
}

function buscarPainelColaborador_(p) {
  const opId = Number(p.operadorId || p.id || 0);
  const pin = p.pin;
  if (!opId) return err_('operadorId obrigatorio', 400);
  const auth = gpVerifyPinColaborador_(opId, pin);
  if (!auth.ok) return auth.err;
  let colab = gpColabRhByOpId_(opId);
  if (!colab) {
    colab = {
      operadorId: opId, nome: auth.operador.nome, funcao: 'Colaborador', salarioBase: 1621,
      vaDiario: 20, metaLocDia: 20, bonusMeta: 100, turno: '', cadastroPct: 0, ativo: true
    };
  }
  const comp = String(p.competencia || gpCompetenciaAtual_());
  const metas = gpMetasColab_(opId, comp);
  const bonus = metas.bonusTotal || 0;
  const hol = gpCalcHollerite_(colab, bonus, 0, gpFolhaPontoColab_(opId, comp).length || 12);
  const pontoHoje = gpStatusPontoHoje_(opId);
  return resp_({
    colaborador: {
      id: opId, label: colab.nome || auth.operador.nome, funcao: colab.funcao,
      turno: colab.turno, admissao: colab.admissao, cadastroPct: colab.cadastroPct,
      cadastro: {
        nomeCompleto: colab.nome, cpf: colab.cpf, nascimento: colab.nascimento,
        telefone: colab.telefone, email: colab.email, endereco: colab.endereco,
        emergencia: colab.emergencia, admissao: colab.admissao, pix: colab.pix
      }
    },
    competencia: comp,
    ponto: { statusHoje: pontoHoje.status, folha: gpFolhaPontoColab_(opId, comp), hoje: pontoHoje },
    metas: metas,
    escala: gpEscalaColab_(opId, comp),
    bancoHoras: gpBancoHoras_(opId),
    pagamento: {
      base: colab.salarioBase, bonus: bonus, faltas: 0, dependentes: 0,
      competencia: comp, pagamentoEm: '05/' + String(Number(comp.slice(3)) + (Number(comp.slice(0, 2)) === 12 ? 1 : 0)).slice(-2),
      diasTrabalhados: gpFolhaPontoColab_(opId, comp).length || 12, diasMes: 30,
      obs: comp + ' · admissão ' + (colab.admissao || '—'),
      beneficios: { vaDiario: colab.vaDiario, vaDias: hol.vaDias, vtPasses: hol.vtPasses, vaCoparticipacao: 0 },
      holerite: hol
    },
    versao: 'v1.5.98'
  });
}

function registrarPontoColaborador_(p) {
  const opId = Number(p.operadorId || 0);
  const tipo = String(p.tipo || 'entrada').toLowerCase();
  const auth = gpVerifyPinColaborador_(opId, p.pin);
  if (!auth.ok) return auth.err;
  const sh = gpSheet_(SH_FOLHA_PONTO);
  const hoje = fmtData_(new Date());
  const agora = fmtHoraLocal_(new Date());
  const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const diaSem = dias[new Date().getDay()];
  const rows = gpRows_(SH_FOLHA_PONTO);
  let rowHoje = null;
  for (let i = rows.length - 1; i >= 0; i--) {
    if (Number(rows[i][1]) === opId && cellToStr_(rows[i][2]) === hoje) { rowHoje = GP_DATA_ROW + i; break; }
  }
  if (tipo === 'entrada') {
    if (rowHoje) {
      const sai = cellToStr_(sh.getRange(rowHoje, 6).getValue());
      if (!sai) return err_('Ja existe entrada hoje sem saida', 409);
    }
    const id = rows.length ? Math.max.apply(null, rows.map(function (r) { return Number(r[0]) || 0; })) + 1 : 1;
    sh.appendRow([id, opId, hoje, diaSem, agora, '', '', 'OK', fmtData_(new Date()) + ' ' + agora]);
    return resp_({ mensagem: 'Entrada registrada ' + agora, status: 'dentro' });
  }
  if (!rowHoje) return err_('Nenhuma entrada hoje — registre entrada primeiro', 400);
  sh.getRange(rowHoje, 6).setValue(agora);
  sh.getRange(rowHoje, 7).setValue('—');
  sh.getRange(rowHoje, 9).setValue(fmtData_(new Date()) + ' ' + agora);
  return resp_({ mensagem: 'Saida registrada ' + agora, status: 'fora' });
}

function alertasPontoGestaoAdmin_(p) {
  if (!adminPinOk_(p)) return err_('Acesso negado — PIN admin 1416', 403);
  const agora = new Date();
  const alertas = [];
  gpRows_(SH_COLAB_RH).forEach(function (r) {
    if (String(r[16] || 'SIM').toUpperCase() === 'NAO') return;
    const opId = Number(r[0]);
    const st = gpStatusPontoHoje_(opId);
    const turno = String(r[15] || '');
    if (st.status === 'fora' && !st.entrada && turno.indexOf('14') >= 0 && agora.getHours() >= 14 && agora.getMinutes() >= 20) {
      alertas.push({
        operadorId: opId, nome: String(r[1] || ''), turno: turno,
        mensagem: String(r[1] || '') + ' nao registrou entrada — tolerancia 20 min excedida'
      });
    }
  });
  return resp_({ alertas: alertas, total: alertas.length });
}

function gestaoPessoasStatus_() {
  const ss = ss_();
  const abas = [SH_COLAB_RH, SH_FOLHA_PONTO, SH_ESCALA_COLAB, SH_FALTAS, SH_HOLERITES, SH_METAS_COLAB, SH_BANCO_HORAS];
  const ok = abas.every(function (n) { return !!ss.getSheetByName(n); });
  return resp_({ ok: ok, abas: abas.map(function (n) { return { nome: n, existe: !!ss.getSheetByName(n) }; }), versao: 'v1.5.98' });
}
