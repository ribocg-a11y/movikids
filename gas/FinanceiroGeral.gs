/**
 * Controle Financeiro Geral — Movi Kids + ZapClin (dashboard GitHub Pages)
 * GET ?action=controleFinanceiro — leitura ao vivo das planilhas (sem git/sync)
 * v1.5.67
 */
const CFG_FIN_ZAP_ID = '1nL694BR_tkO5iHYHMoTpIelyMqXtktjIa87mWFeGmug';
const CFG_FIN_ZAP_GOLDEN_PCT = 0.1;
const CFG_FIN_DATA_ROW = 11;

function controleFinanceiro_() {
  try {
    const payload = buildControleFinanceiroPayload_();
    return ContentService.createTextOutput(JSON.stringify(payload))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (ex) {
    return err_(String(ex.message || ex), 500);
  }
}

function buildControleFinanceiroPayload_() {
  const mkSs = ss_();
  const zapSs = SpreadsheetApp.openById(CFG_FIN_ZAP_ID);
  const loc = finReadRows_(mkSs, 'LOCACOES', 18);
  const mkCustos = finReadRows_(mkSs, 'CUSTOS', 6);
  const lanc = finReadRows_(zapSs, '\uD83D\uDCCA LAN\u00C7AMENTOS', 8);
  const zapCustos = finReadRows_(zapSs, 'CUSTOS', 6);

  const movikids = finLoadMoviKids_(mkSs, loc, mkCustos);
  const zapclin = finLoadZapClin_(zapSs, lanc, zapCustos);
  const diarioPorMes = finBuildDiario_(loc, lanc);
  const consolidado = finBuildConsolidado_(movikids, zapclin);
  const mesesKeys = Object.keys(consolidado.meses).sort();

  const sinais = {
    movikids: finSinalEmpresa_(movikids, mesesKeys),
    zapclin: finSinalEmpresa_(zapclin, mesesKeys),
    geral: finSinalEmpresa_({
      meses: mesesKeys.reduce(function (acc, k) {
        acc[k] = {
          resultado: consolidado.meses[k].resultado,
          margem: consolidado.meses[k].margem,
          custos: consolidado.meses[k].custosTotal
        };
        return acc;
      }, {}),
      avisos: (movikids.avisos || []).concat(zapclin.avisos || [])
    }, mesesKeys)
  };

  return {
    versao: 2,
    atualizadoEm: new Date().toISOString(),
    fonte: 'gas',
    titulo: 'Controle Financeiro Geral',
    empresas: { movikids: movikids, zapclin: zapclin },
    consolidado: consolidado,
    sinais: sinais,
    narrativa: finNarrativa_(movikids, zapclin, consolidado, sinais),
    mesesOrdem: mesesKeys,
    mesesLabel: mesesKeys.reduce(function (acc, k) {
      acc[k] = finMesLabel_(k);
      return acc;
    }, {}),
    diarioPorMes: diarioPorMes,
    dataHoje: finDataHojeKey_()
  };
}

function finReadRows_(ss, sheetName, lastCol) {
  const sh = finFindSheet_(ss, sheetName);
  if (!sh || sh.getLastRow() < CFG_FIN_DATA_ROW) return [];
  return sh.getRange(CFG_FIN_DATA_ROW, 1, sh.getLastRow() - CFG_FIN_DATA_ROW + 1, lastCol).getDisplayValues();
}

function finFindSheet_(ss, nameOrHint) {
  const exact = ss.getSheetByName(nameOrHint);
  if (exact) return exact;
  const hint = String(nameOrHint).replace(/[^\w\u00C0-\u024F]/gi, '').toLowerCase();
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    const n = sheets[i].getName().replace(/[^\w\u00C0-\u024F]/gi, '').toLowerCase();
    if (n.indexOf('lancamentos') >= 0 && hint.indexOf('lancamentos') >= 0) return sheets[i];
    if (n === hint || n.indexOf(hint) >= 0 || hint.indexOf(n) >= 0) return sheets[i];
  }
  return null;
}

function finParseBRL_(v) {
  if (v == null || v === '') return 0;
  if (typeof v === 'number') return v;
  const n = String(v).replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
  const x = parseFloat(n);
  return isFinite(x) ? x : 0;
}

function finMesKey_(data) {
  const p = String(data || '').trim().split('/');
  if (p.length < 3) return null;
  const mm = ('0' + p[1]).slice(-2);
  const yyyy = p[2].length === 2 ? '20' + p[2] : p[2];
  return yyyy + '-' + mm;
}

function finMesLabel_(key) {
  const parts = key.split('-');
  const names = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return names[+parts[1]] + '/' + parts[0].slice(2);
}

function finCtoMinimo_(mesKeyStr, faturamento) {
  const parts = mesKeyStr.split('-').map(Number);
  const mesContrato = (parts[0] - 2026) * 12 + parts[1] - 4;
  let min = 3000;
  if (mesContrato <= 2) min = 1000;
  else if (mesContrato <= 4) min = 1300;
  else if (mesContrato <= 6) min = 1500;
  return Math.max(min, faturamento * 0.1);
}

function finEmptyMes_() {
  return { faturamento: 0, custos: 0, cto: 0, resultado: 0, margem: 0, qtd: 0, custosPorCategoria: {} };
}

function finParseDataBR_(data) {
  const p = String(data || '').trim().split('/');
  if (p.length < 3) return null;
  const dd = ('0' + p[0]).slice(-2);
  const mm = ('0' + p[1]).slice(-2);
  const yyyy = p[2].length === 2 ? '20' + p[2] : p[2];
  return { key: yyyy + '-' + mm + '-' + dd, br: dd + '/' + mm + '/' + yyyy, mes: yyyy + '-' + mm };
}

function finDataHojeKey_() {
  const tz = 'America/Sao_Paulo';
  const now = new Date();
  const yyyy = Utilities.formatDate(now, tz, 'yyyy');
  const mm = Utilities.formatDate(now, tz, 'MM');
  const dd = Utilities.formatDate(now, tz, 'dd');
  return yyyy + '-' + mm + '-' + dd;
}

function finReadInvestimento_(ss) {
  const sh = ss.getSheetByName('INVESTIMENTO');
  if (!sh) return { investimento: 0, dataInauguracao: null, mesInicioPayback: null, itens: [] };
  const rows = sh.getRange(3, 1, 4, 4).getDisplayValues();
  const invRow = sh.getRange(6, 2, 6, 2).getDisplayValues();
  const last = sh.getLastRow();
  const itens = last >= 11 ? sh.getRange(11, 1, Math.min(last, 60), 6).getDisplayValues() : [];
  const investimento = finParseBRL_(invRow[0] && invRow[0][0]);
  const lista = itens
    .filter(function (r) { return r[0] && /^\d/.test(String(r[0])); })
    .map(function (r) {
      return {
        id: r[0], categoria: r[1], item: r[2],
        valor: finParseBRL_(r[3]),
        entra: String(r[4] || 'S').toUpperCase() === 'S'
      };
    });
  return {
    investimento: investimento,
    dataInauguracao: rows[0] ? rows[0][1] : null,
    mesInicioPayback: rows[1] ? rows[1][1] : null,
    itens: lista
  };
}

function finLoadMoviKids_(ss, loc, custos) {
  const inv = finReadInvestimento_(ss);
  const meses = {};
  let fatAcum = 0;
  let locEncerradas = 0;

  loc.forEach(function (r) {
    if (r[14] !== 'Encerrada') return;
    const k = finMesKey_(r[1]);
    if (!k) return;
    locEncerradas++;
    if (!meses[k]) meses[k] = finEmptyMes_();
    const val = finParseBRL_(r[10]);
    meses[k].faturamento += val;
    meses[k].qtd += 1;
    fatAcum += val;
  });

  custos.forEach(function (r) {
    const k = finMesKey_(r[1]);
    if (!k) return;
    if (!meses[k]) meses[k] = finEmptyMes_();
    const val = finParseBRL_(r[5] != null && r[5] !== '' ? r[5] : r[4]);
    const cat = r[4] || 'Outros';
    meses[k].custos += val;
    meses[k].custosPorCategoria[cat] = (meses[k].custosPorCategoria[cat] || 0) + val;
  });

  Object.keys(meses).forEach(function (k) {
    meses[k].cto = finCtoMinimo_(k, meses[k].faturamento);
    meses[k].resultado = meses[k].faturamento - meses[k].custos - meses[k].cto;
    meses[k].margem = meses[k].faturamento ? (meses[k].resultado / meses[k].faturamento) * 100 : 0;
  });

  const sorted = Object.keys(meses).sort();
  const mesAtual = sorted.length ? sorted[sorted.length - 1] : null;
  const mesAnterior = sorted.length > 1 ? sorted[sorted.length - 2] : null;
  const fatMes = mesAtual ? meses[mesAtual].faturamento : 0;
  const fatMesAnt = mesAnterior ? meses[mesAnterior].faturamento : 0;

  let resultadoAcum = 0;
  const mesInicio = inv.mesInicioPayback
    ? inv.mesInicioPayback.replace('/', '-').split('-').reverse().join('-').replace(/(\d{4})-(\d{2})/, '$1-$2')
    : null;
  sorted.forEach(function (k) {
    if (mesInicio && k < mesInicio.replace(/(\d{2})\/(\d{4})/, '$2-$1')) return;
    resultadoAcum += meses[k].resultado;
  });

  const paybackPct = inv.investimento > 0 ? (resultadoAcum / inv.investimento) * 100 : 0;
  const mesesComResultado = sorted.filter(function (k) { return meses[k].resultado !== 0; });
  const mediaResultado = mesesComResultado.length
    ? mesesComResultado.reduce(function (s, k) { return s + meses[k].resultado; }, 0) / mesesComResultado.length
    : 0;
  const paybackMesesProj = mediaResultado > 0 && inv.investimento > 0
    ? Math.ceil((inv.investimento - resultadoAcum) / mediaResultado)
    : null;

  const avisos = [];
  if (Object.keys(meses).every(function (k) { return meses[k].custos === 0; })) {
    avisos.push('Custos operacionais ainda não lançados na aba CUSTOS');
  }

  return {
    id: 'movikids', nome: 'Movi Kids', emoji: '\uD83D\uDE97', cor: '#1565C0',
    investimento: inv.investimento, dataInauguracao: inv.dataInauguracao,
    mesInicioPayback: inv.mesInicioPayback, fatAcumulado: fatAcum, locEncerradas: locEncerradas,
    ticketMedio: locEncerradas ? fatAcum / locEncerradas : 0,
    fatMesAtual: fatMes, fatMesAnterior: fatMesAnt,
    crescimentoMesPct: fatMesAnt ? ((fatMes - fatMesAnt) / fatMesAnt) * 100 : null,
    meses: meses,
    payback: {
      investido: inv.investimento, recuperado: resultadoAcum, percentual: paybackPct,
      mesesProjetados: paybackMesesProj, mediaResultadoMensal: mediaResultado
    },
    ctoRegra: 'max(CTO mínimo contrato, 10% faturamento) — Golden Shopping',
    avisos: avisos
  };
}

function finLoadZapClin_(ss, lanc, custos) {
  const inv = finReadInvestimento_(ss);
  const meses = {};
  const porServico = {};
  let fatAcum = 0;
  let qtdServicos = 0;

  lanc.forEach(function (r) {
    const k = finMesKey_(r[3]);
    if (!k) return;
    if (!meses[k]) meses[k] = finEmptyMes_();
    const val = finParseBRL_(r[6]);
    const qtd = parseInt(r[5], 10) || 0;
    meses[k].faturamento += val;
    meses[k].qtd += qtd;
    fatAcum += val;
    qtdServicos += qtd;
    const svc = r[2] || 'Outros';
    porServico[svc] = (porServico[svc] || 0) + val;
  });

  custos.forEach(function (r) {
    const k = finMesKey_(r[1]);
    if (!k) return;
    if (!meses[k]) meses[k] = finEmptyMes_();
    const val = finParseBRL_(r[5]);
    const cat = r[4] || 'Outros';
    meses[k].custos += val;
    meses[k].custosPorCategoria[cat] = (meses[k].custosPorCategoria[cat] || 0) + val;
  });

  Object.keys(meses).forEach(function (k) {
    meses[k].cto = meses[k].faturamento * CFG_FIN_ZAP_GOLDEN_PCT;
    meses[k].resultado = meses[k].faturamento - meses[k].custos - meses[k].cto;
    meses[k].margem = meses[k].faturamento ? (meses[k].resultado / meses[k].faturamento) * 100 : 0;
  });

  const ranking = Object.keys(porServico)
    .map(function (nome) { return [nome, porServico[nome]]; })
    .sort(function (a, b) { return b[1] - a[1]; })
    .slice(0, 7)
    .map(function (pair) {
      return { nome: pair[0], receita: pair[1], pct: fatAcum ? (pair[1] / fatAcum) * 100 : 0 };
    });

  const sorted = Object.keys(meses).sort();
  const mesAtual = sorted.length ? sorted[sorted.length - 1] : null;
  const mesAnterior = sorted.length > 1 ? sorted[sorted.length - 2] : null;
  const fatMes = mesAtual ? meses[mesAtual].faturamento : 0;
  const fatMesAnt = mesAnterior ? meses[mesAnterior].faturamento : 0;

  let resultadoAcum = 0;
  sorted.forEach(function (k) { resultadoAcum += meses[k].resultado; });

  const paybackPct = inv.investimento > 0 ? (resultadoAcum / inv.investimento) * 100 : 0;
  const mesesComResultado = sorted.filter(function (k) { return meses[k].resultado !== 0; });
  const mediaResultado = mesesComResultado.length
    ? mesesComResultado.reduce(function (s, k) { return s + meses[k].resultado; }, 0) / mesesComResultado.length
    : 0;
  const paybackMesesProj = mediaResultado > 0 && inv.investimento > 0
    ? Math.ceil((inv.investimento - resultadoAcum) / mediaResultado)
    : null;

  const avisos = [];
  if (inv.investimento === 0) avisos.push('Preencha a aba INVESTIMENTO com os valores de abertura');

  return {
    id: 'zapclin', nome: 'ZapClin', emoji: '\u26A1', cor: '#1B8A5A',
    investimento: inv.investimento, dataInauguracao: inv.dataInauguracao,
    mesInicioPayback: inv.mesInicioPayback, fatAcumulado: fatAcum, qtdServicos: qtdServicos,
    ticketMedio: qtdServicos ? fatAcum / qtdServicos : 0,
    fatMesAtual: fatMes, fatMesAnterior: fatMesAnt,
    crescimentoMesPct: fatMesAnt ? ((fatMes - fatMesAnt) / fatMesAnt) * 100 : null,
    meses: meses, rankingServicos: ranking,
    payback: {
      investido: inv.investimento, recuperado: resultadoAcum, percentual: paybackPct,
      mesesProjetados: paybackMesesProj, mediaResultadoMensal: mediaResultado
    },
    ctoRegra: '10% do faturamento — Golden Shopping',
    avisos: avisos
  };
}

function finBuildDiario_(loc, lanc) {
  const porMes = {};

  function add(mes, dia, empresa, val, qtd) {
    if (!porMes[mes]) porMes[mes] = { dias: {} };
    if (!porMes[mes].dias[dia.key]) {
      porMes[mes].dias[dia.key] = {
        dataBR: dia.br,
        movikids: { faturamento: 0, qtd: 0 },
        zapclin: { faturamento: 0, qtd: 0 }
      };
    }
    const d = porMes[mes].dias[dia.key];
    d[empresa].faturamento += val;
    d[empresa].qtd += qtd;
  }

  loc.forEach(function (r) {
    if (r[14] !== 'Encerrada') return;
    const dia = finParseDataBR_(r[1]);
    if (!dia) return;
    add(dia.mes, dia, 'movikids', finParseBRL_(r[10]), 1);
  });

  lanc.forEach(function (r) {
    const dia = finParseDataBR_(r[3]);
    if (!dia) return;
    add(dia.mes, dia, 'zapclin', finParseBRL_(r[6]), parseInt(r[5], 10) || 0);
  });

  Object.keys(porMes).forEach(function (mes) {
    const dias = porMes[mes].dias;
    porMes[mes].ordem = Object.keys(dias).sort();
    porMes[mes].ordem.forEach(function (k) {
      const d = dias[k];
      d.total = d.movikids.faturamento + d.zapclin.faturamento;
      d.atendimentos = d.movikids.qtd + d.zapclin.qtd;
      d.ticketMedio = d.atendimentos ? d.total / d.atendimentos : 0;
      d.goldenEstimado = d.movikids.faturamento * 0.1 + d.zapclin.faturamento * CFG_FIN_ZAP_GOLDEN_PCT;
      d.resultadoEstimado = d.total - d.goldenEstimado;
    });
  });

  return porMes;
}

function finBuildConsolidado_(mk, zap) {
  const allMeses = Object.keys(mk.meses).concat(Object.keys(zap.meses))
    .filter(function (v, i, a) { return a.indexOf(v) === i; }).sort();
  const meses = {};
  let resultadoAcum = 0;

  allMeses.forEach(function (k) {
    const a = mk.meses[k] || finEmptyMes_();
    const b = zap.meses[k] || finEmptyMes_();
    const goldenMk = a.cto || 0;
    const goldenZap = b.cto || 0;
    const custosTotal = a.custos + b.custos + goldenMk + goldenZap;
    const fat = a.faturamento + b.faturamento;
    const resultado = a.resultado + b.resultado;
    meses[k] = {
      faturamento: fat, custos: a.custos + b.custos, cto: goldenMk + goldenZap,
      ctoMovikids: goldenMk, ctoZapclin: goldenZap, custosTotal: custosTotal,
      resultado: resultado, margem: fat ? (resultado / fat) * 100 : 0,
      movikids: a, zapclin: b
    };
    resultadoAcum += resultado;
  });

  return { meses: meses, resultadoAcumulado: resultadoAcum, mesAtual: allMeses.length ? allMeses[allMeses.length - 1] : null };
}

function finSinalEmpresa_(emp, mesesKeys) {
  const recent = mesesKeys.slice(-3).map(function (k) { return emp.meses[k]; }).filter(Boolean);
  if (recent.length < 2) return { nivel: 'atencao', label: 'Atenção', motivo: 'Poucos meses de histórico' };
  const negativos = recent.filter(function (m) { return m.resultado < 0; }).length;
  if (negativos >= 2) return { nivel: 'perigo', label: 'Repensar', motivo: '2+ meses com resultado negativo' };
  const ult = recent[recent.length - 1];
  if (ult.margem < 10 && ult.custos > 0) return { nivel: 'perigo', label: 'Repensar', motivo: 'Margem abaixo de 10%' };
  if (emp.avisos && emp.avisos.length) return { nivel: 'atencao', label: 'Atenção', motivo: emp.avisos[0] };
  const positivos = recent.filter(function (m) { return m.resultado > 0; }).length;
  if (positivos >= 2 && ult.margem >= 20) return { nivel: 'ok', label: 'Sustentável', motivo: 'Resultado positivo com margem saudável' };
  return { nivel: 'atencao', label: 'Atenção', motivo: 'Monitorar custos e tendência' };
}

function finNarrativa_(mk, zap, cons, sinais) {
  const linhas = [];
  const fmt = function (n) { return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); };
  if (mk.avisos.length) linhas.push('Movi Kids: ' + mk.avisos.join('. ') + '.');
  else linhas.push('Movi Kids faturou ' + fmt(mk.fatMesAtual) + ' no último mês com margem ' + ((mk.meses[cons.mesAtual] && mk.meses[cons.mesAtual].margem) || 0).toFixed(0) + '%.');
  if (zap.avisos.length) linhas.push('ZapClin: ' + zap.avisos.join('. ') + '.');
  else {
    const zm = zap.meses[cons.mesAtual];
    linhas.push('ZapClin faturou ' + fmt(zap.fatMesAtual) + ' no último mês; Golden Shopping (10%): ' + fmt((zm && zm.cto) || 0) + '; margem ' + ((zm && zm.margem) || 0).toFixed(0) + '%.');
  }
  linhas.push('Consolidado: resultado acumulado ' + fmt(cons.resultadoAcumulado) + ' em ' + Object.keys(cons.meses).length + ' meses.');
  if (sinais.geral.nivel === 'ok') linhas.push('Nenhum sinal crítico — continue registrando custos para decisão de investimento.');
  else if (sinais.geral.nivel === 'perigo') linhas.push('Atenção: revise custos fixos antes de ampliar investimento.');
  else linhas.push('Dados parciais — lance custos fixos mensais para análise confiável.');
  return linhas;
}
