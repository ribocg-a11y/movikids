/**
 * MOVI KIDS — Instala/atualiza aba VIABILIDADE_NEGOCIO (memorial + estudo break-even).
 *
 * Uso (no Editor ligado à planilha base OU colar em projeto bound):
 *   1. Abrir planilha → Extensões → Apps Script
 *   2. Colar este arquivo (ou function)
 *   3. Rodar instalarAbaViabilidadeNegocio()
 *
 * Células AMARELO = você edita (fixos faltantes: contadora, manutenção…).
 * Células VERDE = resultado automático.
 *
 * Fórmulas: setValue com sintaxe pt_BR (como digitar na planilha).
 * Dados jul/2026 (até 15) pré-carregados — atualize após fechar o mês.
 */
function instalarAbaViabilidadeNegocio() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var nome = 'VIABILIDADE_NEGOCIO';
  var sh = ss.getSheetByName(nome);
  if (sh) {
    sh.clear();
  } else {
    sh = ss.insertSheet(nome);
  }
  sh.setTabColor('#1565C0');

  var L = function (r, c, v) { sh.getRange(r, c).setValue(v); };
  var F = function (r, c, f) { sh.getRange(r, c).setValue(f); };
  var Y = function (r, c, v) { sh.getRange(r, c).setValue(v).setBackground('#FFFDE7'); };
  var G = function (r, c, f) { sh.getRange(r, c).setValue(f).setBackground('#E8F5E9').setFontWeight('bold'); };
  var hdr = function (r, c1, c2, hex, txt) {
    sh.getRange(r, c1, r, c2).merge().setBackground(hex).setFontWeight('bold').setFontSize(11).setValue(txt);
  };

  sh.setColumnWidth(1, 280);
  sh.setColumnWidth(2, 140);
  sh.setColumnWidth(3, 140);
  sh.setColumnWidth(4, 220);
  sh.setColumnWidth(5, 120);
  sh.setColumnWidth(6, 120);
  sh.setColumnWidth(7, 120);
  sh.setColumnWidth(8, 200);

  // ── TÍTULO ───────────────────────────────────────────────
  L(1, 1, 'MOVI KIDS — VIABILIDADE DO NEGÓCIO (memorial dinâmico)');
  sh.getRange(1, 1, 1, 8).merge().setFontSize(14).setFontWeight('bold').setFontColor('#0D47A1');
  L(2, 1, 'Fonte: ESTUDO_NEGOCIO_BREAK_EVEN_TICKET_2026-07.md · Dashboard kpiMes · FOLHA B68 · CTO · CUSTOS');
  L(3, 1, 'Amarelo = editar. Verde = calculado. Não apague as fórmulas.');

  // ── A ENTRADA MÊS ────────────────────────────────────────
  hdr(5, 1, 4, '#FFF9C4', 'A — ENTRADA DO MÊS (editar)');
  L(6, 1, 'Competência (mês/ano)'); Y(6, 2, '07/2026');
  L(7, 1, 'Dias no mês'); Y(7, 2, 31);
  L(8, 1, 'Dias operando (até hoje / fechados)'); Y(8, 2, 15);
  L(9, 1, 'Faturamento mês (R$)'); Y(9, 2, 7467);
  L(10, 1, 'Nº locações mês'); Y(10, 2, 330);
  L(11, 1, 'Extras mês (R$)'); Y(11, 2, 375);
  L(12, 1, 'Locações com extra (n)'); Y(12, 2, 50);
  L(13, 1, 'Atualizado em'); Y(13, 2, '15/07/2026');
  L(14, 1, 'Obs. (ex.: dia 15 parcial)'); Y(14, 2, '15/07 parcial no print · 05/07 jogo BR fechou cedo');

  // ── B CUSTOS FIXOS ───────────────────────────────────────
  hdr(16, 1, 4, '#FFECB3', 'B — CUSTOS FIXOS MENSAIS (editar — amarelo)');
  L(17, 1, 'Item'); L(17, 2, 'Valor (R$)'); L(17, 3, 'Fonte'); L(17, 4, 'Status');
  L(18, 1, 'CTO / aluguel shopping (mês)'); Y(18, 2, 1300); L(18, 3, 'CONTRATO / kpiMes ctoPagar'); L(18, 4, 'OK');
  L(19, 1, 'Folha empregador (B68)'); Y(19, 2, 5253.96); L(19, 3, 'aba FOLHA'); L(19, 4, 'OK');
  L(20, 1, 'Energia (CUSTOS)'); Y(20, 2, 100.8); L(20, 3, 'aba CUSTOS'); L(20, 4, 'OK');
  L(21, 1, 'Manutenção'); Y(21, 2, 0); L(21, 3, 'aba CUSTOS'); L(21, 4, 'LANÇAR');
  L(22, 1, 'Contadora / honorários'); Y(22, 2, 0); L(22, 3, 'CUSTOS Outros'); L(22, 4, 'LANÇAR');
  L(23, 1, 'Material / insumos'); Y(23, 2, 0); L(23, 3, 'aba CUSTOS'); L(23, 4, 'LANÇAR');
  L(24, 1, 'Sistemas / SMS / outros'); Y(24, 2, 0); L(24, 3, 'aba CUSTOS'); L(24, 4, 'LANÇAR');
  L(25, 1, 'Reserva ops sugerida (opcional)'); Y(25, 2, 0); L(25, 3, 'política sócio'); L(25, 4, 'opc');

  L(27, 1, 'Soma CUSTOS operacionais (sem folha, sem CTO)');
  G(27, 2, '=B20+B21+B22+B23+B24+B25');
  L(28, 1, 'Custo total SEM folha (CUS+CTO)');
  G(28, 2, '=B27+B18');
  L(29, 1, 'Custo total COM folha (CUS+CTO+FOLHA)');
  G(29, 2, '=B28+B19');

  // ── C INDICADORES ────────────────────────────────────────
  hdr(31, 1, 4, '#E3F2FD', 'C — INDICADORES CALCULADOS');
  L(32, 1, 'Ticket médio (R$/loc)');
  G(32, 2, '=SE(B10>0;ARRED(B9/B10;2);0)');
  L(33, 1, '% extras no faturamento');
  G(33, 2, '=SE(B9>0;ARRED(B11/B9;3);0)');
  L(34, 1, 'Fat / dia operando');
  G(34, 2, '=SE(B8>0;ARRED(B9/B8;2);0)');
  L(35, 1, 'Loc / dia operando');
  G(35, 2, '=SE(B8>0;ARRED(B10/B8;1);0)');
  L(36, 1, 'Custo / dia SEM folha');
  G(36, 2, '=SE(B7>0;ARRED(B28/B7;2);0)');
  L(37, 1, 'Custo / dia COM folha');
  G(37, 2, '=SE(B7>0;ARRED(B29/B7;2);0)');
  L(38, 1, 'Break-even SEM folha (loc/dia)');
  G(38, 2, '=SE(B32>0;ARRED.PARA.CIMA(B36/B32;0);0)');
  L(39, 1, 'Break-even COM folha (loc/dia)');
  G(39, 2, '=SE(B32>0;ARRED.PARA.CIMA(B37/B32;0);0)');
  L(40, 1, 'Resultado mês SEM folha (até hoje)');
  G(40, 2, '=B9-B27-B18');
  L(41, 1, 'Margem SEM folha %');
  G(41, 2, '=SE(B9>0;ARRED(B40/B9;3);0)');
  L(42, 1, 'Folha proporcional (até dias operando)');
  G(42, 2, '=SE(B7>0;ARRED(B19*B8/B7;2);0)');
  L(43, 1, 'Resultado COM folha (pro-rata até hoje)');
  G(43, 2, '=B40-B42');
  L(44, 1, 'Margem COM folha % (pro-rata)');
  G(44, 2, '=SE(B9>0;ARRED(B43/B9;3);0)');

  // ── D GATES ──────────────────────────────────────────────
  hdr(46, 1, 4, '#E8F5E9', 'D — GATES DE SUSTENTAÇÃO (sim/não)');
  L(47, 1, 'Gate'); L(47, 2, 'Critério'); L(47, 3, 'Resultado'); L(47, 4, 'OK?');
  L(48, 1, 'Negócio base positivo'); L(48, 2, 'Margem sem folha ≥ 10%');
  G(48, 3, '=B41'); F(48, 4, '=SE(B41>=0,1;"SIM";"NÃO")');
  L(49, 1, 'BE com folha viável'); L(49, 2, 'Loc/dia ≥ BE com folha');
  G(49, 3, '=B35'); F(49, 4, '=SE(B35>=B39;"SIM";"NÃO")');
  L(50, 1, 'Reserva após folha'); L(50, 2, 'Resultado pro-rata ≥ R$ 2.500');
  G(50, 3, '=B43'); F(50, 4, '=SE(B43>=2500;"SIM";"NÃO")');
  L(51, 1, 'Dados suficientes'); L(51, 2, 'Dias operando ≥ 12');
  G(51, 3, '=B8'); F(51, 4, '=SE(B8>=12;"SIM";"NÃO")');
  L(52, 1, 'CUSTOS completos?'); L(52, 2, 'Contadora+manut > 0');
  G(52, 3, '=B21+B22'); F(52, 4, '=SE(B21+B22>0;"SIM";"NÃO — LANÇAR")');

  // ── E SÁBADO × ÚTIL ──────────────────────────────────────
  hdr(54, 1, 8, '#F3E5F5', 'E — COMPARAÇÃO SÁBADO × DIA ÚTIL (colar medições kpiMes)');
  L(55, 1, 'Grupo'); L(55, 2, 'Dias'); L(55, 3, 'Loc total'); L(55, 4, 'Fat (R$)');
  L(55, 5, 'Extra (R$)'); L(55, 6, 'Loc/dia'); L(55, 7, 'Fat/dia'); L(55, 8, 'Ticket');
  L(56, 1, 'Sábados (ex. 04+11/07)'); Y(56, 2, 2); Y(56, 3, 81); Y(56, 4, 1630.8); Y(56, 5, 29.8);
  G(56, 6, '=SE(B56>0;ARRED(C56/B56;1);0)');
  G(56, 7, '=SE(B56>0;ARRED(D56/B56;2);0)');
  G(56, 8, '=SE(C56>0;ARRED(D56/C56;2);0)');
  L(57, 1, 'Dias úteis (sem 15 parcial)'); Y(57, 2, 10); Y(57, 3, 207); Y(57, 4, 4876); Y(57, 5, 344);
  G(57, 6, '=SE(B57>0;ARRED(C57/B57;1);0)');
  G(57, 7, '=SE(B57>0;ARRED(D57/B57;2);0)');
  G(57, 8, '=SE(C57>0;ARRED(D57/C57;2);0)');
  L(58, 1, 'Domingos (inclui 05 jogo)'); Y(58, 2, 2); Y(58, 3, 37); Y(58, 4, 874.2); Y(58, 5, 1.2);
  G(58, 6, '=SE(B58>0;ARRED(C58/B58;1);0)');
  G(58, 7, '=SE(B58>0;ARRED(D58/B58;2);0)');
  G(58, 8, '=SE(C58>0;ARRED(D58/C58;2);0)');
  L(59, 1, 'Diagnóstico auto');
  F(59, 2, '=SE(G56>G57;"Sábado ganha no R$/dia";"Dia útil >= sábado em fat/dia")');
  F(59, 4, '=SE(H57>H56;"Dia útil tem ticket maior";"Sábado tem ticket maior")');

  // ── F DIA A DIA ──────────────────────────────────────────
  hdr(61, 1, 8, '#E0F7FA', 'F — DIA A DIA JUL/2026 (evidência · atualizar mês a mês)');
  L(62, 1, 'Dia'); L(62, 2, 'Semana'); L(62, 3, 'Loc'); L(62, 4, 'Fat'); L(62, 5, 'Extra'); L(62, 6, 'Ticket'); L(62, 7, '≥BE sem'); L(62, 8, '≥BE com');

  var dias = [
    [1, 'Qua', 19, 503.8, 130.8],
    [2, 'Qui', 17, 350.2, 8.2],
    [3, 'Sex', 20, 423, 25],
    [4, 'Sáb', 41, 806.8, 18.8],
    [5, 'Dom', 4, 55.2, 1.2],
    [6, 'Seg', 16, 327.2, 14.2],
    [7, 'Ter', 28, 530.8, 35.8],
    [8, 'Qua', 23, 518.8, 70.8],
    [9, 'Qui', 17, 476.2, 59.2],
    [10, 'Sex', 25, 745, 0],
    [11, 'Sáb', 40, 824, 11],
    [12, 'Dom', 33, 819, 0],
    [13, 'Seg', 21, 548, 0],
    [14, 'Ter', 21, 453, 0],
    [15, 'Qua*', 5, 86, 0]
  ];
  var start = 63;
  for (var i = 0; i < dias.length; i++) {
    var r = start + i;
    var d = dias[i];
    L(r, 1, d[0]);
    L(r, 2, d[1]);
    Y(r, 3, d[2]);
    Y(r, 4, d[3]);
    Y(r, 5, d[4]);
    G(r, 6, '=SE(C' + r + '>0;ARRED(D' + r + '/C' + r + ';2);0)');
    F(r, 7, '=SE(C' + r + '>=$B$38;"SIM";"NÃO")');
    F(r, 8, '=SE(C' + r + '>=$B$39;"SIM";"NÃO")');
  }
  L(78, 1, '* Dia 15 parcial se medição antecipada · 05 = jogo BR fechou cedo');

  // ── G VEREDITO ───────────────────────────────────────────
  hdr(80, 1, 4, '#C8E6C9', 'G — VEREDITO EXECUTIVO (texto)');
  L(81, 1, 'Negócio saudável?');
  F(81, 2, '=SE(E(D48="SIM";D49="SIM");"SIM — ritmo cobre folha e base";"ATENÇÃO — revisar volume ou custos")');
  L(82, 1, 'Métricas corretas?');
  F(82, 2, '=SE(D52="SIM";"SIM — CUSTOS completos";"PARCIAL — falta lançar fixos amarelos B21–B24")');
  L(83, 1, 'Metas sustentam?');
  F(83, 2, '=SE(B39>0;"BE com folha = "&B39&" loc/dia · ritmo ="&B35;"sem ticket")');
  L(84, 1, 'Para onde vamos?');
  L(84, 2, '1) Completar CUSTOS  2) Escala sábado  3) Extra no dia útil  4) Payback ~11/2026');
  L(85, 1, 'Doc canônico');
  L(85, 2, 'docs/ativos/ESTUDO_NEGOCIO_BREAK_EVEN_TICKET_2026-07.md');

  // ── H PAYBACK (snapshot) ─────────────────────────────────
  hdr(87, 1, 4, '#ECEFF1', 'H — PAYBACK (snapshot — editar se mudar)');
  L(88, 1, 'Investimento total I (R$)'); Y(88, 2, 69410);
  L(89, 1, 'Resultado acumulado (R$)'); Y(89, 2, 16711.57);
  L(90, 1, '% recuperado');
  G(90, 2, '=SE(B88>0;ARRED(B89/B88;3);0)');
  L(91, 1, 'Falta recuperar');
  G(91, 2, '=B88-B89');
  L(92, 1, 'Previsão payback (label)'); Y(92, 2, '11/2026');

  sh.setFrozenRows(5);
  SpreadsheetApp.getUi().alert('Aba VIABILIDADE_NEGOCIO instalada/atualizada. Preencha amarelos B21–B24 (contadora/manutenção).');
}
