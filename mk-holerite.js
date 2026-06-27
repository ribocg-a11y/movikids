/* MOVI KIDS — Holerite compartilhado (admin + colaborador) */
(function (global) {
  'use strict';

  var EMPRESA = {
    razao: 'MOVI KIDS Brincadeiras LTDA',
    cnpj: '66.664.255/0001-67',
    endereco: 'Golden Shopping Calhau · São Luís/MA'
  };

  function esc(v) {
    if (typeof global.escapeHtml_ === 'function') return global.escapeHtml_(v);
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  }

  function mkHolFmtMoney_(v, tipo) {
    var n = Math.abs(Number(v) || 0);
    var s = n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (tipo === 'd' && Number(v) > 0 ? '−' : '') + 'R$ ' + s;
  }

  function mkHolRow_(cod, desc, ref, venc, desco, sec) {
    if (sec) return '<tr class="sec"><td colspan="5">' + esc(sec) + '</td></tr>';
    return '<tr><td class="c">' + esc(cod) + '</td><td>' + esc(desc) + '</td><td class="c">' + esc(ref) + '</td>' +
      '<td class="n v">' + (venc || '') + '</td><td class="n d">' + (desco || '') + '</td></tr>';
  }

  function mkHolFmtCpf_(cpf) {
    var d = String(cpf || '').replace(/\D/g, '');
    if (d.length !== 11) return cpf ? esc(cpf) : '—';
    return esc(d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6, 9) + '-' + d.slice(9));
  }

  function mkHolMatricula_(id) {
    var n = Number(id) || 0;
    return n ? ('MK-' + String(n).padStart(3, '0')) : '—';
  }

  function mkHolRefSalario_(hol) {
    var qNum = hol.quinzena === 1 ? '1ª' : '2ª';
    var pct = hol.quinzena === 1 ? '40%' : '60%';
    return pct + ' da ' + qNum + ' quinzena';
  }

  function mkHolNotaProp_(hol, adm) {
    var diasTrab = hol.diasTrabalhados != null ? hol.diasTrabalhados : 0;
    var diasMes = hol.diasMes || 30;
    if (diasTrab >= diasMes) return '';
    var note = 'Mês proporcional: ' + diasTrab + '/' + diasMes + ' dias';
    if (adm && adm !== '—') note += ' (admissão ' + adm + ')';
    return note;
  }

  function mkHolWidgetHero_(opts) {
    opts = opts || {};
    var hol = opts.holerite || {};
    var comp = opts.comp || hol.competencia || '—';
    var liquido = hol.liquido != null ? hol.liquido : Number(opts.liquido) || 0;
    var bruto = hol.bruto != null ? hol.bruto : Number(opts.bruto) || 0;
    var totalDescontos = hol.totalDescontos != null ? hol.totalDescontos : Number(opts.totalDescontos) || 0;
    var qLabel = hol.quinzenaLabel || opts.quinzenaLabel ||
      (hol.quinzena === 1 ? '1ª quinzena' : (hol.quinzena === 2 ? '2ª quinzena' : 'Quinzena'));
    var pgto = hol.pagamentoEm || opts.pagamentoEm || '—';
    return '<div class="gp-hol-widgets" aria-label="Resumo do pagamento">' +
      '<div class="mk-widget mk-widget--hero gp-hol-hero">' +
      '<span class="mk-widget-lbl">Líquido desta quinzena</span>' +
      '<span class="mk-widget-val green">' + mkHolFmtMoney_(liquido) + '</span>' +
      '<span class="mk-widget-ctx">' + esc(qLabel) + ' · pgto ' + esc(pgto) + '</span></div>' +
      '<div class="mk-cmd-grid gp-hol-widget-grid">' +
      '<div class="mk-widget"><span class="mk-widget-lbl">Competência</span><span class="mk-widget-val">' + esc(comp) + '</span>' +
      '<span class="mk-widget-ctx">Referência do mês</span></div>' +
      '<div class="mk-widget"><span class="mk-widget-lbl">Vencimentos</span><span class="mk-widget-val">' + mkHolFmtMoney_(bruto) + '</span>' +
      '<span class="mk-widget-ctx">Proventos da quinzena</span></div>' +
      '<div class="mk-widget"><span class="mk-widget-lbl">Descontos</span>' +
      '<span class="mk-widget-val" style="color:var(--red,#C62828)">' + mkHolFmtMoney_(totalDescontos, 'd') + '</span>' +
      '<span class="mk-widget-ctx">INSS, IRRF, VT e outros</span></div>' +
      '</div></div>';
  }

  function mkHolBuildHtml_(opts) {
    opts = opts || {};
    var f = opts.folha || {};
    var colab = opts.colab || {};
    var comp = opts.comp || '';
    var hol = f.holerite || {};
    var base = Number(f.base != null ? f.base : hol.base) || 0;
    var bonus = Number(f.bonus != null ? f.bonus : hol.bonus) || 0;

    if (hol.diasQuinzena === 0 || (base <= 0 && bonus <= 0)) {
      return '<p class="gp-adm-muted">Sem pagamento nesta quinzena — admissão posterior ou período não trabalhado.</p>';
    }

    var bruto = hol.bruto != null ? hol.bruto : base + bonus;
    var inss = hol.inss || 0;
    var irrf = hol.irrf || 0;
    var vt = hol.vt || 0;
    var faltas = hol.faltas || 0;
    var liquido = hol.liquido != null ? hol.liquido : bruto - inss - irrf - vt - faltas;
    var totalDescontos = hol.totalDescontos != null ? hol.totalDescontos : inss + irrf + vt + faltas;
    var diasMes = hol.diasMes || 30;
    var diasTrab = hol.diasTrabalhados != null ? hol.diasTrabalhados : 0;
    var refSal = mkHolRefSalario_(hol);
    var notaProp = mkHolNotaProp_(hol, colab.admissao || '—');
    var inssAli = hol.inssAli != null ? (Number(hol.inssAli) * 100).toFixed(1).replace('.', ',') + '%' : '—';
    var irrfIsento = hol.irrfIsento === true || irrf === 0;
    var irrfRef = irrfIsento ? 'Isento' : '—';
    var nome = f.nome || colab.nome || '—';
    var funcao = colab.funcao || 'Colaborador';
    var adm = colab.admissao || '—';
    var cpf = colab.cpf || (colab.cadastro && colab.cadastro.cpf) || '';
    var matricula = mkHolMatricula_(colab.id || f.id);
    var qLabel = hol.quinzenaLabel || (hol.quinzena === 1 ? '1ª quinzena' : '2ª quinzena');
    var pgto = hol.pagamentoEm || '—';
    var salContr = hol.salarioContratual || 1621;
    var pctSal = hol.quinzena === 1 ? '40%' : '60%';
    var bonusDias = f.bonusDias != null ? f.bonusDias : 0;

    var descRows = '';
    if (hol.quinzena === 2) {
      descRows = mkHolRow_('', '', '', '', '', 'Descontos legais e autorizados') +
        mkHolRow_('401', 'INSS — previdência', inssAli, '', mkHolFmtMoney_(inss, 'd')) +
        mkHolRow_('402', 'IRRF — imposto de renda', irrfRef, '', irrf > 0 ? mkHolFmtMoney_(irrf, 'd') : 'R$ 0,00') +
        mkHolRow_('403', 'Desconto VT (6% do salário)', '6,0% salário prop.', '', mkHolFmtMoney_(vt, 'd')) +
        mkHolRow_('404', 'Faltas / atrasos', faltas > 0 ? 'proporcional' : '0 dia', '', faltas > 0 ? mkHolFmtMoney_(faltas, 'd') : 'R$ 0,00') +
        mkHolRow_('410', 'Adiantamento 1ª quinzena (desconto)', hol.diasQuinzena > 0 && hol.quinzena === 2 ? 'na 2ª quinzena' : '—', '', 'R$ 0,00');
    } else {
      descRows = mkHolRow_('', '', '', '', '', 'Descontos') +
        mkHolRow_('410', 'Adiantamento quinzenal — descontos na 2ª quinzena', '—', '', 'R$ 0,00');
    }

    var benBlock = hol.incluiBeneficios
      ? '<div class="mk-hol-comp" style="border-top:1px solid var(--border);border-bottom:none;background:#F0FDF4;color:#166534">Benefícios · pagos na 2ª quinzena · não integram salário</div>' +
        '<table class="mk-hol-tbl"><thead><tr><th>Cód</th><th>Benefício</th><th>Referência</th><th colspan="2">Valor concedido</th></tr></thead><tbody>' +
        mkHolRow_('501', 'Vale-alimentação (VA)', 'R$ ' + (hol.vaMensal || 400) + '/mês prop. ' + diasTrab + '/' + diasMes, hol.vaTotal ? mkHolFmtMoney_(hol.vaTotal) : 'R$ 0,00', '') +
        mkHolRow_('502', 'Concessão passes VT', 'benefício mês prop.', hol.vtPasses ? mkHolFmtMoney_(hol.vtPasses) : '—', '') +
        mkHolRow_('503', 'FGTS 8% — encargo empregador (informativo)', 'sobre base INSS', hol.fgts ? mkHolFmtMoney_(hol.fgts) : '—', '') +
        '</tbody></table>'
      : '<p class="gp-adm-muted" style="padding:12px 16px;margin:0">Benefícios (VA R$ 400/mês, VT) creditados na <strong>2ª quinzena</strong> (pagamento dia 30/31).</p>';

    var toolbar = opts.toolbar !== false
      ? '<div class="mk-hol-toolbar no-print"><button type="button" class="btn btn-secondary" onclick="mkHolPrintPdf_()">📄 Salvar PDF / Imprimir</button></div>'
      : '';

    var heroWidgets = mkHolWidgetHero_({
      holerite: hol,
      comp: comp,
      bruto: bruto,
      liquido: liquido,
      totalDescontos: totalDescontos
    });

    return '<div class="mk-hol-print-root">' + toolbar + heroWidgets +
      '<p class="gp-hol-detail-lead no-print">Detalhamento linha a linha abaixo — use PDF para arquivo.</p>' +
      '<div class="mk-hol" id="mk-hol-doc">' +
      '<div class="mk-hol-head"><div class="mk-hol-brand">MOVI <span style="color:var(--gold,#FFD54F)">KIDS</span></div>' +
      '<div class="mk-hol-sub">' + esc(EMPRESA.razao) + '<br>CNPJ ' + esc(EMPRESA.cnpj) + ' · ' + esc(EMPRESA.endereco) + '</div></div>' +
      '<div class="mk-hol-meta">' +
      '<div><span>Colaborador</span>' + esc(nome) + ' · ' + esc(funcao) + '</div>' +
      '<div><span>CPF</span>' + mkHolFmtCpf_(cpf) + '</div>' +
      '<div><span>Matrícula</span>' + esc(matricula) + '</div>' +
      '<div><span>Competência</span>' + esc(comp || hol.competencia || '—') + '</div>' +
      '<div><span>Quinzena / pagamento</span>' + esc(qLabel) + ' · pgto ' + esc(pgto) + '</div>' +
      '<div><span>Admissão</span>' + esc(adm) + '</div>' +
      '<div><span>Salário contratual</span>' + mkHolFmtMoney_(salContr) + '</div>' +
      '<div><span>Proporcional mês</span>' + mkHolFmtMoney_(hol.salarioProporcional || base) + ' (' + diasTrab + '/' + diasMes + ' dias)</div>' +
      '</div>' +
      (notaProp ? '<div class="mk-hol-note">' + esc(notaProp) + '</div>' : '') +
      '<div class="mk-hol-comp">Demonstrativo · ' + esc(qLabel) + ' · pgto ' + esc(pgto) + '</div>' +
      '<table class="mk-hol-tbl"><thead><tr><th>Cód</th><th>Descrição</th><th>Referência</th><th>Vencimentos</th><th>Descontos</th></tr></thead><tbody>' +
      mkHolRow_('', '', '', '', '', 'Proventos') +
      mkHolRow_('001', 'Salário ' + pctSal + ' (proporcional)', refSal, mkHolFmtMoney_(base), '') +
      (bonus > 0 ? mkHolRow_('105', 'Bônus metas (variável)', bonusDias + ' dia(s)', mkHolFmtMoney_(bonus), '') : '') +
      descRows +
      '</tbody></table>' +
      '<div class="mk-hol-tot">' +
      '<div><div class="lbl">Total vencimentos</div><div class="val">' + mkHolFmtMoney_(bruto) + '</div></div>' +
      '<div><div class="lbl">Total descontos</div><div class="val" style="color:var(--red)">' + mkHolFmtMoney_(totalDescontos, 'd') + '</div></div>' +
      '<div><div class="lbl">Líquido a receber</div><div class="val">' + mkHolFmtMoney_(liquido) + '</div></div>' +
      '</div>' +
      benBlock +
      '<div class="mk-hol-bases">' +
      '<div><span>Salário contratual</span>' + mkHolFmtMoney_(salContr) + '</div>' +
      '<div><span>Base INSS (mês prop.)</span>' + mkHolFmtMoney_(hol.baseInss || hol.salarioProporcional || bruto) + '</div>' +
      '<div><span>Base IRRF</span>' + mkHolFmtMoney_(hol.irrfBase || (bruto - inss)) + '</div>' +
      '<div><span>Líquido desta quinzena</span>' + mkHolFmtMoney_(liquido) + '</div>' +
      '</div>' +
      '<div class="mk-hol-foot">Regra MOVI KIDS: 1ª quinzena 40% salário (dia 15) · 2ª quinzena 60% + benefícios (dia 30/31) · proporcional à admissão. Documento informativo — conferir com contador.</div>' +
      '</div></div>';
  }

  function mkHolPrintPdf_() {
    var root = document.querySelector('.mk-hol-print-root .mk-hol') || document.getElementById('mk-hol-doc');
    if (!root) {
      if (typeof global.toast === 'function') global.toast('Holerite não encontrado na tela.', 'warning');
      return;
    }
    var title = 'MOVI-KIDS-Holerite';
    var meta = document.querySelector('.mk-hol-meta');
    if (meta) title = 'MOVI-KIDS-Holerite-' + String(meta.textContent || '').replace(/\s+/g, '-').slice(0, 40);
    var oldTitle = document.title;
    document.title = title;
    document.body.classList.add('mk-hol-printing');
    global.print();
    setTimeout(function () {
      document.body.classList.remove('mk-hol-printing');
      document.title = oldTitle;
    }, 400);
  }

  global.mkHolFmtMoney_ = mkHolFmtMoney_;
  global.mkHolWidgetHero_ = mkHolWidgetHero_;
  global.mkHolBuildHtml_ = mkHolBuildHtml_;
  global.mkHolPrintPdf_ = mkHolPrintPdf_;
})(typeof window !== 'undefined' ? window : globalThis);
