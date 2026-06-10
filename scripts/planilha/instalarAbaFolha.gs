/**
 * MOVI KIDS — Instala/atualiza aba FOLHA na planilha base.
 * Executar 1× no editor Apps Script vinculado à planilha:
 * https://docs.google.com/spreadsheets/d/1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618/edit
 *
 * Menu: instalarAbaFolha() — cria aba FOLHA com memorial dinâmico.
 * Memorial: docs/referencia/FOLHA_PAGAMENTO_MEMORIAL_E_PLANILHA.md
 */
function instalarAbaFolha() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var nome = 'FOLHA';
  var sh = ss.getSheetByName(nome);
  if (sh) {
    sh.clear();
  } else {
    sh = ss.insertSheet(nome);
  }
  sh.setTabColor('#5E35B1');

  var L = function (r, c, v) { sh.getRange(r, c).setValue(v); };
  var F = function (r, c, f) { sh.getRange(r, c).setFormula(f); };
  var fmtHdr = function (r1, r2, c1, c2, hex) {
    sh.getRange(r1, c1, r2, c2).setBackground(hex).setFontWeight('bold').setFontSize(10);
  };

  // Larguras
  sh.setColumnWidth(1, 220);
  sh.setColumnWidth(2, 140);
  sh.setColumnWidth(3, 120);
  sh.setColumnWidth(4, 120);
  sh.setColumnWidth(5, 120);
  sh.setColumnWidth(6, 120);
  sh.setColumnWidth(7, 120);
  sh.setColumnWidth(8, 200);

  // ── BLOCO A: ENTRADA ─────────────────────────────────────
  L(1, 1, 'MOVI KIDS — FOLHA DE PAGAMENTO (memorial dinâmico)');
  sh.getRange(1, 1, 1, 8).merge().setFontSize(14).setFontWeight('bold');
  L(2, 1, 'Preencha apenas células em AMARELO. Não apague linhas de fórmulas abaixo.');

  fmtHdr(3, 3, 1, 8, '#FFF9C4');
  L(3, 1, 'A — ENTRADA (parâmetros — você edita)');

  var ent = [
    ['Empresa / quiosque', 'MOVI KIDS — Golden Shopping Calhau'],
    ['Nº funcionários ativos (1–10)', 2],
    ['Competência (mês/ano)', '06/2026'],
    ['Salário-base padrão (R$)', 1621],
    ['Regime: 1=Simples (sem INSS 20% sep.) · 0=LP/LR', 1],
    ['Tarifa VT ida+volta/dia (R$)', 5],
    ['Dias VT no mês (padrão)', 24],
    ['Vale-alimentação/dia PAT (R$)', 22],
    ['Dias trabalhados VA no mês', 26],
    ['INSS empregado % (SM ~7,5%)', 0.075],
    ['Piso CCT se houver (R$) — 0=usar salário padrão', 0],
    ['Local', 'São Luís / MA'],
    ['CBO função', '5211-40 Atendente de lojas'],
    ['Contador / responsável DP', ''],
    ['Observações CCT / sindicato', 'Consultar CCT comércio MA antes de contratar']
  ];
  for (var i = 0; i < ent.length; i++) {
    L(4 + i, 1, ent[i][0]);
    sh.getRange(4 + i, 2).setValue(ent[i][1]).setBackground('#FFFDE7');
  }

  // Named-ish anchors (row numbers fixed)
  var R_N = 5;   // B5 n func
  var R_SAL = 7; // B7 salario padrao
  var R_SIMPLES = 8;
  var R_TVT = 9;
  var R_DVT = 10;
  var R_VAD = 11;
  var R_DVA = 12;
  var R_INSS = 13;
  var R_PISO = 14;

  // ── BLOCO B: PARÂMETROS CALCULADOS ───────────────────────
  fmtHdr(20, 20, 1, 8, '#E8EAF6');
  L(20, 1, 'B — PARÂMETROS CALCULADOS (automático)');
  L(21, 1, 'Salário efetivo padrão (R$)');
  F(21, 2, '=SE(B' + R_PISO + '>0;B' + R_PISO + ';B' + R_SAL + ')');
  L(22, 1, 'Hora normal (R$)');
  F(22, 2, '=B21/220');
  L(23, 1, 'Teto desconto VT 6% (R$)');
  F(23, 2, '=B21*0,06');
  L(24, 1, 'Custo VT/dia empresa (após 6%) ref.');
  F(24, 2, '=MÁXIMO(0;B' + R_TVT + '*B' + R_DVT + '-B23)');
  L(25, 1, 'VA mensal ref. por funcionário (R$)');
  F(25, 2, '=B' + R_VAD + '*B' + R_DVA);
  L(26, 1, '% FGTS');
  L(26, 2, 0.08);
  L(27, 1, '% Prov. 13º');
  L(27, 2, 0.0833);
  L(28, 1, '% Prov. Férias+1/3');
  L(28, 2, 0.1111);
  L(29, 1, '% Prov. multa FGTS');
  L(29, 2, 0.04);
  L(30, 1, '% Total provisões+FGTS');
  F(30, 2, '=B26+B27+B28+B29');

  // ── BLOCO C: FUNCIONÁRIOS ────────────────────────────────
  fmtHdr(33, 33, 1, 8, '#E3F2FD');
  L(33, 1, 'C — CADASTRO FUNCIONÁRIOS (linhas ativas = parâmetro B5)');
  var hdr = ['Ativo?', 'Nome', 'Salário R$', 'Dias VT', 'Tarifa VT R$', 'VA/dia R$', 'Admissão', 'Obs'];
  for (var h = 0; h < hdr.length; h++) { L(34, h + 1, hdr[h]); }

  var firstEmp = 35;
  var lastEmp = 44;
  for (var r = firstEmp; r <= lastEmp; r++) {
    var idx = r - firstEmp + 1;
    F(r, 1, '=SE(' + idx + '<=$B$' + R_N + ';"SIM";"—")');
    if (idx <= 2) {
      L(r, 2, idx === 1 ? 'Atendente 1 (preencher nome)' : 'Atendente 2 (preencher nome)');
    }
    F(r, 3, '=SE(A' + r + '="SIM";B$21;"")');
    F(r, 4, '=SE(A' + r + '="SIM";B$' + R_DVT + ';"")');
    F(r, 5, '=SE(A' + r + '="SIM";B$' + R_TVT + ';"")');
    F(r, 6, '=SE(A' + r + '="SIM";B$' + R_VAD + ';"")');
  }
  sh.getRange(firstEmp, 2, lastEmp, 7).setBackground('#FFFDE7');

  // ── BLOCO D: MEMORIAL POR FUNCIONÁRIO ────────────────────
  fmtHdr(47, 47, 1, 8, '#E8F5E9');
  L(47, 1, 'D — MEMORIAL MENSAL POR FUNCIONÁRIO');
  var mhdr = ['Nome', 'Bruto', 'INSS desc.', 'VT desc.', 'Líquido est.', 'FGTS 8%', 'Prov. total', 'Custo emp.'];
  for (var mh = 0; mh < mhdr.length; mh++) { L(48, mh + 1, mhdr[mh]); }
  L(48, 9, 'VT empresa');

  var firstMem = 49;
  for (var mr = firstMem; mr < firstMem + 10; mr++) {
    var er = firstEmp + (mr - firstMem);
    F(mr, 1, '=SE(A' + er + '="SIM";B' + er + ';"")');
    F(mr, 2, '=SE(A' + er + '="SIM";C' + er + ';"")');
    F(mr, 3, '=SE(A' + er + '="SIM";-ARRED(C' + er + '*B$' + R_INSS + ';2);"")');
    F(mr, 4, '=SE(A' + er + '="SIM";-MÍNIMO(B$23;D' + er + '*E' + er + ');"")');
    F(mr, 5, '=SE(A' + er + '="SIM";B' + mr + '+C' + mr + '+D' + mr + ';" ")');
    F(mr, 6, '=SE(A' + er + '="SIM";C' + er + '*B$26;"")');
    F(mr, 7, '=SE(A' + er + '="SIM";C' + er + '*(B$27+B$28+B$29);"")');
    F(mr, 8, '=SE(A' + er + '="SIM";C' + er + '+F' + mr + '+G' + mr + '+I' + mr + '+F' + er + '*B$' + R_DVA + ';"")');
    F(mr, 9, '=SE(A' + er + '="SIM";MÁXIMO(0;D' + er + '*E' + er + '+D' + mr + ');"")');
  }
  sh.getRange(firstMem, 2, firstMem + 9, 8).setNumberFormat('#,##0.00');

  // ── BLOCO E: TOTAIS ──────────────────────────────────────
  fmtHdr(61, 61, 1, 8, '#FBE9E7');
  L(61, 1, 'E — TOTAIS EMPRESA (mês)');
  L(62, 1, 'Salários brutos');
  F(62, 2, '=SOMA(B49:B58)');
  L(63, 1, 'FGTS total');
  F(63, 2, '=SOMA(F49:F58)');
  L(64, 1, 'Provisões (13º+férias+multa)');
  F(64, 2, '=SOMA(G49:G58)');
  L(65, 1, 'VT (parte empresa)');
  F(65, 2, '=SOMA(I49:I58)');
  L(66, 1, 'Vale-alimentação PAT');
  F(66, 2, '=SOMA(ARRAYFORMULA(SE(A35:A44="SIM";F35:F44*B$' + R_DVA + ';0)))');
  L(67, 1, 'INSS patronal 20% (se LP/LR)');
  F(67, 2, '=SE(B' + R_SIMPLES + '=1;0;B62*0,2)');
  L(68, 1, 'CUSTO TOTAL FOLHA + ENCARGOS');
  F(68, 2, '=B62+B63+B64+B65+B66+B67');
  L(69, 1, 'Custo por funcionário (média ativos)');
  F(69, 2, '=SE(B' + R_N + '>0;B68/B' + R_N + ';0)');
  sh.getRange(62, 2, 69, 2).setNumberFormat('#,##0.00');
  sh.getRange(68, 1, 68, 2).setFontWeight('bold').setBackground('#FFCCBC');

  // ── BLOCO F: PROVISÕES DETALHE ───────────────────────────
  fmtHdr(72, 72, 1, 8, '#F3E5F5');
  L(72, 1, 'F — DETALHE PROVISÕES (empresa)');
  L(73, 1, '13º (8,33%)');
  F(73, 2, '=B62*0,0833');
  L(74, 1, 'Férias + 1/3 (11,11%)');
  F(74, 2, '=B62*0,1111');
  L(75, 1, 'Multa FGTS prov. (4%)');
  F(75, 2, '=B62*0,04');
  L(76, 1, 'FGTS mensal (8%)');
  F(76, 2, '=B63');
  L(77, 1, 'Reserva rescisão sugerida/mês');
  F(77, 2, '=B73+B74+B75+B76');

  // ── BLOCO G: ESCALA SUGERIDA ─────────────────────────────
  fmtHdr(80, 80, 1, 8, '#ECEFF1');
  L(80, 1, 'G — ESCALA SUGERIDA (2 atendentes — consulta, não calcula folha)');
  L(81, 1, 'Horário shopping');
  L(81, 2, 'Seg–Sáb 10h–22h · Dom 13h–21h');
  var esc = [
    ['Atendente A', 'Seg–Sex 10h–18h', 'Sáb 10h–14h', 'Dom FOLGA', '44h/sem'],
    ['Atendente B', 'Seg–Sex 14h–22h', 'Sáb 14h–22h', 'Dom rodízio*', 'Ajustar p/ 44h'],
    ['*Rodízio', 'Semanas alternadas: B folga dom OU dom 13h–17h (4h)', '', '', 'Validar com RH'],
    ['Intervalo', '1h almoço — overlap 14h–18h Seg–Sex para cobertura', '', '', ''],
    ['Ponto', 'Obrigatório REP/app · interjornada 11h', '', '', '']
  ];
  for (var e = 0; e < esc.length; e++) {
    for (var ec = 0; ec < esc[e].length; ec++) { L(82 + e, ec + 1, esc[e][ec]); }
  }

  // ── BLOCO H: PERGUNTAS / PENDÊNCIAS ──────────────────────
  fmtHdr(90, 90, 1, 8, '#FFF9C4');
  L(90, 1, 'H — PERGUNTAS PARA O SÓCIO / CONTADOR (preencher — não afeta cálculos)');
  var perg = [
    ['Regime Simples — qual Anexo e faixa DAS?', ''],
    ['CCT MA — piso atendente comércio?', ''],
    ['Operadora PAT contratada?', ''],
    ['Operadora VT / tarifa real ida+volta?', ''],
    ['Golden exige seguro/responsabilidade extra?', ''],
    ['Contrato experiência 45+45 ou indeterminado?', ''],
    ['Banco de horas ou escala 6x1 formalizada?', ''],
    ['Nome final Atendente 1', ''],
    ['Nome final Atendente 2', ''],
    ['Data admissão prevista', '']
  ];
  for (var p = 0; p < perg.length; p++) {
    L(91 + p, 1, perg[p][0]);
    sh.getRange(91 + p, 2, 91 + p, 4).merge().setBackground('#FFFDE7').setValue(perg[p][1]);
  }

  sh.getRange(1, 1, 100, 8).setWrap(true);
  sh.setFrozenRows(2);
  SpreadsheetApp.getUi().alert('Aba FOLHA instalada.\n\nPreencha o bloco A (amarelo) e H.\nRevise totais com seu contador antes de contratar.');
}

/** Menu opcional na planilha */
function onOpenFolhaMenu() {
  SpreadsheetApp.getUi()
    .createMenu('MOVI KIDS')
    .addItem('Instalar aba FOLHA', 'instalarAbaFolha')
    .addToUi();
}
