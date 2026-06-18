/**
 * MOVI KIDS — Instala abas Gestão de Pessoas (FASE 15) na planilha ativa.
 * Executar no editor da planilha: instalarAbasGestaoPessoas()
 */
function instalarAbasGestaoPessoas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var specs = [
    { n: 'COLABORADORES_RH', c: '#2196F3', h: ['operador_id','nome','funcao','cpf','nascimento','telefone','email','endereco','emergencia','admissao','pix','salario_base','va_diario','meta_loc_dia','bonus_meta_r$','turno','ativo','cadastro_pct','atualizado_em'] },
    { n: 'FOLHA_PONTO', c: '#4CAF50', h: ['id','operador_id','data','dia_semana','entrada','saida','horas','situacao','registrado_em'] },
    { n: 'ESCALA_COLABORADORES', c: '#9C27B0', h: ['operador_id','competencia','seg','ter','qua','qui','sex','sab','dom','obs'] },
    { n: 'FALTAS_AUSENCIAS', c: '#F44336', h: ['id','operador_id','data','tipo','horas','valor_desconto','obs','registrado_em'] },
    { n: 'HOLERITES', c: '#1976D2', h: ['id','operador_id','competencia','base','bonus','faltas','inss','irrf','vt','liquido','fgts','va_total','dias_trab','obs','gerado_em'] },
    { n: 'METAS_COLABORADORES', c: '#FFC107', h: ['id','operador_id','data','locacoes','meta','bonus_ok','bonus_valor'] },
    { n: 'BANCO_HORAS', c: '#78909C', h: ['operador_id','saldo_hhmm','atualizado_em'] }
  ];
  specs.forEach(function (sp) {
    var sh = ss.getSheetByName(sp.n);
    if (!sh) sh = ss.insertSheet(sp.n);
    sh.clear();
    sh.getRange(1, 1, 1, sp.h.length).setValues([sp.h]).setFontWeight('bold').setBackground('#E3F2FD');
    sh.setFrozenRows(1);
  });
  SpreadsheetApp.getUi().alert('Abas Gestão de Pessoas instaladas.\nPublique GAS v1.5.98+ e abra gestao-pessoas.html');
}
