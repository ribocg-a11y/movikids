/**
 * MOVI KIDS — Instala aba PLANO_CONTAS (FASE 14 mini-DRE).
 * Executar 1× no editor Apps Script vinculado à planilha:
 * https://docs.google.com/spreadsheets/d/1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618/edit
 *
 * Memorial: docs/referencia/MEMORIAL_MINI_DRE.md
 */
function instalarAbaPlanoContas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var nome = 'PLANO_CONTAS';
  var sh = ss.getSheetByName(nome);
  if (sh) {
    sh.clear();
  } else {
    sh = ss.insertSheet(nome);
  }
  sh.setTabColor('#1565C0');

  var hdr = ['codigo', 'nome', 'grupo', 'categoriaLegacy', 'entraCMV', 'ativo'];
  sh.getRange(1, 1, 1, hdr.length).setValues([hdr])
    .setBackground('#E3F2FD').setFontWeight('bold');

  var seed = [
    ['CMV-01', 'Manutenção veículos', 'CMV', 'Manutenção', 'S', 'S'],
    ['CMV-02', 'Material / consumíveis', 'CMV', 'Material', 'S', 'S'],
    ['OFX-01', 'Energia', 'OPEX_FIXO', 'Energia', 'N', 'S'],
    ['OFX-02', 'Aluguel quiosque', 'OPEX_FIXO', 'Aluguel', 'N', 'S'],
    ['OV-01', 'Outros operacionais', 'OPEX_VAR', 'Outros', 'N', 'S']
  ];
  sh.getRange(2, 1, seed.length, hdr.length).setValues(seed);

  sh.setColumnWidth(1, 90);
  sh.setColumnWidth(2, 200);
  sh.setColumnWidth(3, 110);
  sh.setColumnWidth(4, 140);
  sh.setColumnWidth(5, 80);
  sh.setColumnWidth(6, 60);

  SpreadsheetApp.getUi().alert(
    'Aba PLANO_CONTAS instalada com 5 categorias legacy.\n\n' +
    'Edite grupo se necessário. Col D deve bater com col E da aba CUSTOS.'
  );
}

function onOpenPlanoContasMenu() {
  SpreadsheetApp.getUi()
    .createMenu('MOVI KIDS')
    .addItem('Instalar aba PLANO_CONTAS', 'instalarAbaPlanoContas')
    .addToUi();
}
