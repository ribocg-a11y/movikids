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
    if (Number(hol.quinzena) === 1) return '40% · adiantamento 1ª quinzena';
    return 'salário do mês (proporcional)';
  }

  /**
   * I127 — prática DP/RH (Portal Contábeis + art. 462 CLT):
   * 1ª quinzena = adiantamento salarial; 2ª = salário do mês − adiantamento − encargos.
   * Valor do adiantamento Q1 = 40% do salário proporcional do mês.
   */
  function mkHolAdiantamentoQ1_(hol) {
    if (hol.adiantamentoQ1 != null && hol.adiantamentoQ1 !== '') {
      return Math.round(Number(hol.adiantamentoQ1) * 100) / 100;
    }
    var salProp = Number(hol.salarioProporcional);
    if (!(salProp > 0)) {
      var base = Number(hol.base) || 0;
      var q = Number(hol.quinzena) || 0;
      if (q === 1 && base > 0) return base;
      if (q === 2 && base > 0) return Math.round((base * 0.4 / 0.6) * 100) / 100;
      return 0;
    }
    return Math.round(salProp * 0.4 * 100) / 100;
  }

  function mkHolNotaProp_(hol, adm) {
    var diasTrab = hol.diasTrabalhados != null ? hol.diasTrabalhados : 0;
    var diasMes = hol.diasMes || 30;
    if (diasTrab >= diasMes) return '';
    var note = 'Mês proporcional: ' + diasTrab + '/' + diasMes + ' dias';
    if (adm && adm !== '—') note += ' (admissão ' + adm + ')';
    return note;
  }

  /** I111/I113 — na 1ª quinzena VT nunca entra no pacote (já pago nos ~15 dias). */
  function mkHolNormalizeHol_(holIn) {
    var hol = Object.assign({}, holIn || {});
    var q = Number(hol.quinzena) || 0;
    var base = Number(hol.base) || 0;
    var bonus = Number(hol.bonus) || 0;
    var bruto = hol.bruto != null ? Number(hol.bruto) : base;
    var liquido = hol.liquido != null ? Number(hol.liquido) : bruto;

    // I114 — se bruto/líquido ainda vierem com bônus (GAS/cache legado), strip
    if (bonus > 0 && base > 0) {
      if (Math.abs(bruto - (base + bonus)) < 0.05) bruto = base;
      if (Math.abs(liquido - (base + bonus)) < 0.05) liquido = base;
      if (Math.abs(liquido - (bruto + bonus)) < 0.05) liquido = bruto;
      if (bruto > base + 0.05) bruto = base;
      if (q === 1 && liquido > base + 0.05) liquido = base;
    }
    hol.bruto = bruto;
    hol.liquido = liquido;
    if (q === 1) {
      hol.faltas = 0;
      hol.totalDescontos = 0;
    }

    if (q !== 1) return hol;

    var vtRaw = Number(hol.vtPasses) || 0;
    var vtJa = Number(hol.vtPassesJaPago) || 0;
    if (vtRaw > 0 && vtJa <= 0) vtJa = vtRaw;
    hol.vtPasses = 0;
    hol.vtPassesJaPago = vtJa;
    var vaTotal = Number(hol.vaTotal) || 0;
    var pix;
    if (hol.pixQuinzena != null) {
      pix = Number(hol.pixQuinzena);
      // pix legado às vezes = salário+bônus already; ok. Se veio sem bônus e bruto era legado, recompute
      if (bonus > 0 && Math.abs(pix - liquido) < 0.05) {
        pix = Math.round((liquido + bonus) * 100) / 100;
      }
    } else {
      pix = Math.round((liquido + bonus) * 100) / 100;
    }
    hol.pixQuinzena = pix;
    hol.pacoteQuinzena = Math.round((pix + vaTotal) * 100) / 100;
    if (!hol.quinzenaLabel || String(hol.quinzenaLabel).indexOf('VT') < 0) {
      hol.quinzenaLabel = '1ª quinzena · 40% salário + cesta (bônus/VA) · VT já pago';
    }
    hol.incluiBeneficios = true;
    return hol;
  }

  function mkHolWidgetHero_(opts) {
    opts = opts || {};
    var hol = mkHolNormalizeHol_(opts.holerite || {});
    var comp = opts.comp || hol.competencia || '—';
    var liquido = hol.liquido != null ? hol.liquido : Number(opts.liquido) || 0;
    var bruto = opts.bruto != null ? Number(opts.bruto) : (hol.bruto != null ? Number(hol.bruto) : 0);
    var bonus = Number(hol.bonus) || 0;
    var totalDescontos = opts.totalDescontos != null
      ? Number(opts.totalDescontos)
      : (hol.totalDescontos != null ? Number(hol.totalDescontos) : 0);
    var vaTotal = Number(hol.vaTotal) || 0;
    var vtPasses = Number(hol.vtPasses) || 0;
    var vtJaPago = Number(hol.vtPassesJaPago) || 0;
    var adianta = Number(opts.adiantamentoQ1) || mkHolAdiantamentoQ1_(hol);
    var pix = hol.pixQuinzena != null
      ? Number(hol.pixQuinzena)
      : Math.round((liquido + bonus) * 100) / 100;
    var pacote = hol.pacoteQuinzena != null
      ? Number(hol.pacoteQuinzena)
      : Math.round((pix + vaTotal + vtPasses) * 100) / 100;
    var qLabel = hol.quinzenaLabel || opts.quinzenaLabel ||
      (hol.quinzena === 1 ? '1ª quinzena' : (hol.quinzena === 2 ? '2ª quinzena' : 'Quinzena'));
    var pgto = hol.pagamentoEm || opts.pagamentoEm || '—';
    var benefCtx = '';
    if (hol.quinzena === 1) {
      benefCtx = vaTotal ? (' + VA · VT ' + (vtJaPago ? mkHolFmtMoney_(vtJaPago) + ' já pago' : 'já pago')) : ' · VT já pago';
    } else if (vaTotal && vtPasses) benefCtx = ' + VA/VT';
    else if (vaTotal) benefCtx = ' + VA';
    else if (vtPasses) benefCtx = ' + VT';
    var vencCtx = hol.quinzena === 2 ? 'Salário do mês (proporcional)' : 'Adiantamento 1ª quinzena';
    var descCtx = hol.quinzena === 1
      ? 'Na 1ª: sem encargos · VT já pago'
      : ('Adiantamento Q1 ' + mkHolFmtMoney_(adianta) + ' + INSS/IRRF/VT/faltas');
    return '<div class="gp-hol-widgets" aria-label="Resumo do pagamento">' +
      '<div class="mk-widget mk-widget--hero gp-hol-hero">' +
      '<span class="mk-widget-lbl">Pacote desta quinzena</span>' +
      '<span class="mk-widget-val green">' + mkHolFmtMoney_(pacote) + '</span>' +
      '<span class="mk-widget-ctx">' + esc(qLabel) + ' · pgto ' + esc(pgto) +
      ' · PIX ' + mkHolFmtMoney_(pix) + ' (salário+bônus)' + benefCtx + '</span></div>' +
      (hol.quinzena === 1
        ? '<div class="mk-note info" style="margin:8px 0 0;padding:10px 12px;border-radius:12px;background:#FEF3C7;color:#92400E;font-weight:700">VT dos ~15 dias já pago — R$ 0,00 no holerite' +
          (vtJaPago ? ' (ref. ' + mkHolFmtMoney_(vtJaPago) + ' pago fora)' : '') + '. Pacote = PIX + VA.</div>'
        : (adianta > 0
          ? '<div class="mk-note info" style="margin:8px 0 0;padding:10px 12px;border-radius:12px;background:#FEE2E2;color:#991B1B;font-weight:700">Adiantamento da 1ª quinzena (' +
            mkHolFmtMoney_(adianta) + ') entra como desconto nesta 2ª — art. 462 CLT / prática DP.</div>'
          : '')) +
      '<div class="mk-cmd-grid gp-hol-widget-grid">' +
      '<div class="mk-widget"><span class="mk-widget-lbl">Competência</span><span class="mk-widget-val">' + esc(comp) + '</span>' +
      '<span class="mk-widget-ctx">Referência do mês</span></div>' +
      '<div class="mk-widget"><span class="mk-widget-lbl">Vencimentos</span><span class="mk-widget-val">' + mkHolFmtMoney_(bruto) + '</span>' +
      '<span class="mk-widget-ctx">' + vencCtx + '</span></div>' +
      '<div class="mk-widget"><span class="mk-widget-lbl">Descontos</span>' +
      '<span class="mk-widget-val" style="color:var(--red,#C62828)">' + mkHolFmtMoney_(totalDescontos, 'd') + '</span>' +
      '<span class="mk-widget-ctx">' + descCtx + '</span></div>' +
      '</div></div>';
  }

  function mkHolBuildHtml_(opts) {
    opts = opts || {};
    var f = opts.folha || {};
    var colab = opts.colab || {};
    var comp = opts.comp || '';
    var hol = mkHolNormalizeHol_(f.holerite || {});
    var base = Number(f.base != null ? f.base : hol.base) || 0;
    var bonus = Number(f.bonus != null ? f.bonus : hol.bonus) || 0;
    var qNum = Number(hol.quinzena) || 0;

    if (hol.diasQuinzena === 0 || (base <= 0 && bonus <= 0)) {
      return '<p class="gp-adm-muted">Sem pagamento nesta quinzena — admissão posterior ou período não trabalhado.</p>';
    }

    var salProp = Number(hol.salarioProporcional) || 0;
    if (!(salProp > 0) && base > 0) {
      salProp = qNum === 1 ? Math.round((base / 0.4) * 100) / 100
        : (qNum === 2 ? Math.round((base / 0.6) * 100) / 100 : base);
    }
    var adiantaQ1 = mkHolAdiantamentoQ1_(Object.assign({}, hol, { salarioProporcional: salProp, base: base }));
    // I127 — Q2: vencimentos = salário do mês; Q1: vencimentos = adiantamento (40%)
    var bruto = qNum === 2 ? (salProp || base) : base;
    var inss = qNum === 1 ? 0 : (hol.inss || 0);
    var irrf = qNum === 1 ? 0 : (hol.irrf || 0);
    var vt = qNum === 1 ? 0 : (hol.vt || 0);
    var faltas = qNum === 1 ? 0 : (hol.faltas || 0);
    var encargos = Math.round((inss + irrf + vt + faltas) * 100) / 100;
    var totalDescontos = qNum === 1
      ? 0
      : Math.round((adiantaQ1 + encargos) * 100) / 100;
    var liquido = hol.liquido != null ? Number(hol.liquido) : (qNum === 1 ? base : Math.round((bruto - totalDescontos) * 100) / 100);
    if (qNum === 1) liquido = base;
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
    var qLabel = hol.quinzenaLabel || (qNum === 1 ? '1ª quinzena' : '2ª quinzena');
    if (qNum === 2 && String(qLabel).indexOf('adiantamento') < 0) {
      qLabel = '2ª quinzena · salário do mês − adiantamento 1ª − encargos';
    }
    var pgto = hol.pagamentoEm || '—';
    var salContr = hol.salarioContratual || 1621;
    var bonusDias = f.bonusDias != null ? f.bonusDias : 0;
    var proventoCod = qNum === 1 ? '010' : '001';
    var proventoDesc = qNum === 1
      ? 'Adiantamento salarial (1ª quinzena)'
      : 'Salário mensal (proporcional)';

    var descRows = '';
    if (qNum === 2) {
      descRows = mkHolRow_('', '', '', '', '', 'Descontos legais e autorizados') +
        mkHolRow_('410', 'Adiantamento 1ª quinzena (já pago)', '40% salário prop. · art. 462 CLT', '', mkHolFmtMoney_(adiantaQ1, 'd')) +
        mkHolRow_('401', 'INSS — previdência', inssAli, '', mkHolFmtMoney_(inss, 'd')) +
        mkHolRow_('402', 'IRRF — imposto de renda', irrfRef, '', irrf > 0 ? mkHolFmtMoney_(irrf, 'd') : 'R$ 0,00') +
        mkHolRow_('403', 'Desconto VT (6% do salário)', '6,0% salário prop.', '', mkHolFmtMoney_(vt, 'd')) +
        mkHolRow_('404', 'Faltas / atrasos', faltas > 0 ? 'proporcional' : '0 dia', '', faltas > 0 ? mkHolFmtMoney_(faltas, 'd') : 'R$ 0,00');
    } else {
      descRows = mkHolRow_('', '', '', '', '', 'Descontos') +
        mkHolRow_('—', 'Sem descontos nesta quinzena', 'Encargos e adiantamento na 2ª', '', 'R$ 0,00');
    }

    var benPctLbl = (hol.pctBeneficios != null ? Math.round(Number(hol.pctBeneficios) * 100) : 50) + '%';
    var vtJaPago = Number(hol.vtPassesJaPago) || 0;
    var vtLinhaRef = hol.quinzena === 1
      ? ('JÁ PAGO nos ~15 dias — não entra no pacote' + (vtJaPago > 0 ? ' · ref. ' + mkHolFmtMoney_(vtJaPago) : ''))
      : benPctLbl + ' do benefício mês prop.';
    var vtLinhaVal = hol.quinzena === 1 ? 'R$ 0,00' : (hol.vtPasses ? mkHolFmtMoney_(hol.vtPasses) : '—');
    var bonusRef = '';
    if (bonus > 0) {
      var bonusMes = hol.bonusMes != null ? Number(hol.bonusMes) : null;
      bonusRef = bonusMes != null && bonusMes > 0
        ? benPctLbl + ' de R$ ' + mkHolFmtMoney_(bonusMes).replace('R$\u00a0', '').replace('R$ ', '') + ' (mês)'
        : (bonusDias + ' dia(s) · ' + benPctLbl + ' desta quinzena');
    }
    var showCesta = !!(hol.incluiBeneficios || bonus > 0);
    var benBlock = showCesta
      ? '<div class="mk-hol-comp" style="border-top:1px solid var(--border);border-bottom:none;background:#F0FDF4;color:#166534">Cesta · ' + benPctLbl + ' nesta quinzena · bônus/VA/VT não integram salário</div>' +
        '<table class="mk-hol-tbl"><thead><tr><th>Cód</th><th>Benefício</th><th>Referência</th><th colspan="2">Valor concedido</th></tr></thead><tbody>' +
        (bonus > 0
          ? mkHolRow_('500', 'Bônus metas (cesta)', bonusRef, mkHolFmtMoney_(bonus), '')
          : '') +
        (hol.incluiBeneficios
          ? mkHolRow_('501', 'Vale-alimentação (VA)', benPctLbl + ' de R$ ' + (hol.vaMensal || 400) + '/mês prop. ' + diasTrab + '/' + diasMes, hol.vaTotal ? mkHolFmtMoney_(hol.vaTotal) : 'R$ 0,00', '') +
            mkHolRow_('502', 'Concessão passes VT', vtLinhaRef, vtLinhaVal, '') +
            (hol.quinzena === 2
              ? mkHolRow_('503', 'FGTS 8% — encargo empregador (informativo)', 'sobre base INSS do mês', hol.fgts ? mkHolFmtMoney_(hol.fgts) : '—', '')
              : '')
          : '') +
        '</tbody></table>'
      : '<p class="gp-adm-muted" style="padding:12px 16px;margin:0">Sem cesta nesta quinzena (admissão posterior ao período).</p>';

    var toolbar = opts.toolbar !== false
      ? '<div class="mk-hol-toolbar no-print"><button type="button" class="btn btn-secondary" onclick="mkHolPrintPdf_()">📄 Salvar PDF / Imprimir</button></div>'
      : '';

    var heroWidgets = mkHolWidgetHero_({
      holerite: hol,
      comp: comp,
      bruto: bruto,
      liquido: liquido,
      totalDescontos: totalDescontos,
      adiantamentoQ1: adiantaQ1
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
      '<div><span>Proporcional mês</span>' + mkHolFmtMoney_(salProp || hol.salarioProporcional || base) + ' (' + diasTrab + '/' + diasMes + ' dias)</div>' +
      '</div>' +
      (notaProp ? '<div class="mk-hol-note">' + esc(notaProp) + '</div>' : '') +
      '<div class="mk-hol-comp">Demonstrativo · ' + esc(qLabel) + ' · pgto ' + esc(pgto) + '</div>' +
      '<table class="mk-hol-tbl"><thead><tr><th>Cód</th><th>Descrição</th><th>Referência</th><th>Vencimentos</th><th>Descontos</th></tr></thead><tbody>' +
      mkHolRow_('', '', '', '', '', qNum === 1 ? 'Proventos (adiantamento)' : 'Proventos (salário do mês)') +
      mkHolRow_(proventoCod, proventoDesc, refSal, mkHolFmtMoney_(bruto), '') +
      descRows +
      '</tbody></table>' +
      '<div class="mk-hol-tot">' +
      '<div><div class="lbl">Total vencimentos</div><div class="val">' + mkHolFmtMoney_(bruto) + '</div></div>' +
      '<div><div class="lbl">Total descontos</div><div class="val" style="color:var(--red)">' + mkHolFmtMoney_(totalDescontos, 'd') + '</div></div>' +
      '<div><div class="lbl">Salário líquido</div><div class="val">' + mkHolFmtMoney_(liquido) + '</div></div>' +
      '</div>' +
      benBlock +
      '<div class="mk-hol-bases">' +
      '<div><span>Salário contratual</span>' + mkHolFmtMoney_(salContr) + '</div>' +
      '<div><span>Base INSS (salário prop.)</span>' + mkHolFmtMoney_(hol.baseInss != null ? hol.baseInss : salProp || bruto) + '</div>' +
      '<div><span>Adiantamento 1ª (desconto Q2)</span>' + mkHolFmtMoney_(adiantaQ1) + '</div>' +
      '<div><span>Salário líquido</span>' + mkHolFmtMoney_(liquido) + '</div>' +
      '</div>' +
      '<div class="mk-hol-foot">Modelo DP (Portal Contábeis / art. 462 CLT): 1ª quinzena = adiantamento 40%; 2ª = salário do mês − adiantamento − encargos (INSS/IRRF/VT/faltas). Cesta 50% (bônus/VA/VT) fora do salário. PIX desta quinzena = líquido + bônus. Documento informativo — conferir com contador.</div>' +
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
