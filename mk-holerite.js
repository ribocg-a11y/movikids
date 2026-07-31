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

  /**
   * I141 — bônus quinzenal (regra de ouro):
   * 1ª = o que foi pago no dia 15 (50% do acumulado NAQUELA data — memorial/snapshot).
   * 2ª = RESTO = (bônus ganho no mês) − (bônus já pago na 1ª).
   * Nunca repetir “50% do mês final” na 2ª.
   */
  function mkHolBonusRestoQ2_(bonusMes, q1BonusPago) {
    return Math.round(Math.max(0, (Number(bonusMes) || 0) - (Number(q1BonusPago) || 0)) * 100) / 100;
  }

  /**
   * I138 — pacote real pago no dia 15 (PIX + VA, sem VT).
   * Memorial 07/2026 = pagamento real I111 (Ray 998,40 · Julia 948,40).
   */
  var MK_HOL_Q1_PAGO_MEMORIAL_ = {
    '07/2026': {
      3: { adianta: 648.4, bonus: 150, va: 200, pacote: 998.4 },
      4: { adianta: 648.4, bonus: 100, va: 200, pacote: 948.4 }
    }
  };

  function mkHolCompKey_(comp) {
    var s = String(comp || '').trim();
    var m = s.match(/^(\d{1,2})\/(\d{4})$/);
    if (m) return (m[1].length === 1 ? '0' + m[1] : m[1]) + '/' + m[2];
    return s;
  }

  function mkHolQ1PagoMemorial_(opId, comp) {
    var byComp = MK_HOL_Q1_PAGO_MEMORIAL_[mkHolCompKey_(comp)];
    if (!byComp) return null;
    return byComp[Number(opId)] || null;
  }

  /** Resolve bônus já pago na 1ª: memorial → snapshot GAS → null (desconhecido). */
  function mkHolResolveQ1BonusPago_(opId, comp, hol) {
    var mem = mkHolQ1PagoMemorial_(opId, comp || (hol && hol.competencia) || '');
    if (mem && mem.bonus != null) return Number(mem.bonus) || 0;
    if (hol && hol.bonusPagoQ1 != null && hol.bonusPagoQ1 !== '') return Number(hol.bonusPagoQ1) || 0;
    if (hol && hol.bonusQ1Pago != null && hol.bonusQ1Pago !== '') return Number(hol.bonusQ1Pago) || 0;
    return null;
  }

  /**
   * I141 — aplica resto do bônus na 2ª e recalcula PIX/pacote.
   * Retorna o mesmo objeto hol (mutado).
   */
  function mkHolApplyBonusRegra_(hol, opId, comp) {
    if (!hol) return hol;
    var q = Number(hol.quinzena) || 0;
    if (q !== 2) return hol;
    var bonusMes = hol.bonusMes != null ? Number(hol.bonusMes) : null;
    if (!(bonusMes >= 0)) return hol;
    var q1Pago = mkHolResolveQ1BonusPago_(opId, comp, hol);
    if (q1Pago == null) {
      hol.bonusRegra = 'incompleta';
      hol.bonusRegraAviso = 'Sem memorial da 1ª — bônus da 2ª pode estar errado (não use 50% do mês final).';
      return hol;
    }
    var resto = mkHolBonusRestoQ2_(bonusMes, q1Pago);
    hol.bonus = resto;
    hol.bonusQ1Pago = q1Pago;
    hol.bonusRegra = 'resto';
    hol.pctBeneficios = null;
    var liquido = Number(hol.liquido) || 0;
    var vaTotal = Number(hol.vaTotal) || 0;
    hol.pixQuinzena = Math.round((liquido + resto) * 100) / 100;
    hol.pacoteQuinzena = Math.round((hol.pixQuinzena + vaTotal) * 100) / 100;
    return hol;
  }

  /**
   * I138 — VT é pago TODA SEMANA (fora do holerite). Nunca soma no pacote (Q1 nem Q2).
   * I111/I113 — Q1 já zerava VT; agora vale para as duas quinzenas.
   * I141 — ctx.opId/ctx.comp ativam regra do resto na 2ª.
   */
  function mkHolNormalizeHol_(holIn, ctx) {
    ctx = ctx || {};
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

    // I138 — VT semanal: só referência informativa; valor no pacote = 0
    var vtRaw = Number(hol.vtPasses) || 0;
    var vtJa = Number(hol.vtPassesJaPago) || 0;
    if (vtRaw > 0 && vtJa <= 0) vtJa = vtRaw;
    if (vtJa <= 0 && Number(hol.vtPassesMes) > 0) {
      vtJa = Math.round(Number(hol.vtPassesMes) * 0.5 * 100) / 100;
    }
    hol.vtPasses = 0;
    hol.vtPassesJaPago = vtJa;

    var vaTotal = Number(hol.vaTotal) || 0;
    var pix;
    if (hol.pixQuinzena != null) {
      pix = Number(hol.pixQuinzena);
      if (bonus > 0 && Math.abs(pix - liquido) < 0.05) {
        pix = Math.round((liquido + bonus) * 100) / 100;
      }
    } else {
      pix = Math.round((liquido + bonus) * 100) / 100;
    }
    hol.pixQuinzena = pix;
    // Pacote = PIX + VA — VT nunca entra
    hol.pacoteQuinzena = Math.round((pix + vaTotal) * 100) / 100;

    if (q === 1) {
      if (!hol.quinzenaLabel || String(hol.quinzenaLabel).indexOf('VT') < 0) {
        hol.quinzenaLabel = '1ª quinzena · 40% salário + cesta (bônus/VA) · VT semanal já pago';
      }
      hol.incluiBeneficios = true;
      hol.bonusRegra = 'q1';
    }

    // I141 — 2ª = resto (mês − pago na 1ª); nunca 50% do mês final de novo
    var opId = ctx.opId != null ? Number(ctx.opId) : (hol.operadorId != null ? Number(hol.operadorId) : 0);
    var comp = ctx.comp || hol.competencia || '';
    if (q === 2 && opId) mkHolApplyBonusRegra_(hol, opId, comp);

    return hol;
  }

  /** Labels Q1/Q2 a partir da competência MM/yyyy. */
  function mkHolMesPgtoLabels_(comp) {
    var key = mkHolCompKey_(comp);
    var m = key.match(/^(\d{2})\/(\d{4})$/);
    if (!m) return { q1: 'Q1', q2: 'Q2', mesLbl: key || '—' };
    var mm = m[1];
    var yyyy = Number(m[2]);
    var last = new Date(yyyy, Number(mm), 0).getDate();
    return {
      q1: 'Q1 (15/' + mm + ')',
      q2: 'Q2 (' + last + '/' + mm + ')',
      mesLbl: mm + '/' + yyyy
    };
  }

  function mkHolDiaSemana_(dataStr) {
    var p = String(dataStr || '').split('/');
    if (p.length < 3) return '';
    var d = new Date(Number(p[2]), Number(p[1]) - 1, Number(p[0]));
    if (isNaN(d.getTime())) return '';
    return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][d.getDay()] || '';
  }

  /**
   * I142 — resumo do mês (Q1 / Q2 / Soma) a partir do memorial da 1ª + holerite atual (regra I141).
   * Pacote = PIX + VA (VT só referência, fora do PIX).
   */
  function mkHolMesResumo_(holIn, opId, comp) {
    var hol = mkHolNormalizeHol_(holIn || {}, { opId: opId, comp: comp });
    var mem = mkHolQ1PagoMemorial_(opId, comp || hol.competencia || '');
    var q = Number(hol.quinzena) || 0;
    var labels = mkHolMesPgtoLabels_(comp || hol.competencia || '');
    var vtMes = Number(hol.vtPassesMes) || 0;
    var vtHalf = Number(hol.vtPassesJaPago) || 0;
    if (vtHalf <= 0 && vtMes > 0) vtHalf = Math.round(vtMes * 0.5 * 100) / 100;
    if (vtMes <= 0 && vtHalf > 0) vtMes = Math.round(vtHalf * 2 * 100) / 100;

    var salQ1 = 0;
    var salQ2 = 0;
    var vaQ1 = 0;
    var vaQ2 = 0;
    var vtQ1 = vtHalf;
    var vtQ2 = vtHalf;
    var bonusQ1 = 0;
    var bonusQ2 = 0;
    var pacoteQ1 = 0;
    var pacoteQ2 = 0;
    var ok = false;

    if (mem) {
      salQ1 = Number(mem.adianta) || 0;
      vaQ1 = Number(mem.va) || 0;
      bonusQ1 = Number(mem.bonus) || 0;
      pacoteQ1 = Number(mem.pacote) || 0;
      ok = true;
    }

    if (q === 2) {
      salQ2 = Number(hol.liquido) || 0;
      vaQ2 = Number(hol.vaTotal) || 0;
      bonusQ2 = Number(hol.bonus) || 0;
      pacoteQ2 = Number(hol.pacoteQuinzena) || 0;
      if (!mem && hol.bonusQ1Pago != null) {
        bonusQ1 = Number(hol.bonusQ1Pago) || 0;
        salQ1 = mkHolAdiantamentoQ1_(hol);
        vaQ1 = vaQ2;
        pacoteQ1 = Math.round((salQ1 + bonusQ1 + vaQ1) * 100) / 100;
        ok = true;
      }
    } else if (q === 1) {
      salQ1 = Number(hol.base) || salQ1;
      vaQ1 = Number(hol.vaTotal) || vaQ1;
      bonusQ1 = Number(hol.bonus) || bonusQ1;
      pacoteQ1 = Number(hol.pacoteQuinzena) || pacoteQ1;
      // 2ª ainda não fechada — soma parcial = só Q1
      ok = true;
    }

    function soma(a, b) { return Math.round((Number(a) + Number(b)) * 100) / 100; }

    return {
      ok: ok,
      labels: labels,
      regraBonus: hol.bonusRegra || (q === 1 ? 'q1' : ''),
      bonusMes: hol.bonusMes != null ? Number(hol.bonusMes) : soma(bonusQ1, bonusQ2),
      rubricas: [
        { nome: 'Salário', q1: salQ1, q2: salQ2, soma: soma(salQ1, salQ2) },
        { nome: 'VA', q1: vaQ1, q2: vaQ2, soma: soma(vaQ1, vaQ2) },
        { nome: 'VT*', q1: vtQ1, q2: vtQ2, soma: soma(vtQ1, vtQ2), nota: true },
        { nome: 'Bônus', q1: bonusQ1, q2: bonusQ2, soma: soma(bonusQ1, bonusQ2) }
      ],
      pacote: { q1: pacoteQ1, q2: pacoteQ2, soma: soma(pacoteQ1, pacoteQ2) }
    };
  }

  function mkHolBuildDiasBonusHtml_(diasBonus, bonusDiasCount, bonusMesVal) {
    var dias = [];
    if (Array.isArray(diasBonus) && diasBonus.length) {
      dias = diasBonus.filter(function (d) {
        if (!d) return false;
        if (d.bonusOk === false) return false;
        return d.bonusOk === true || (Number(d.bonusValor) || 0) > 0;
      });
    }
    var total = dias.reduce(function (s, d) { return s + (Number(d.bonusValor) || 0); }, 0);
    if (!(total > 0) && bonusMesVal != null) total = Number(bonusMesVal) || 0;
    var nDias = dias.length || Number(bonusDiasCount) || 0;

    var rows = dias.map(function (d) {
      var data = d.data || '—';
      var dow = d.diaSemana || mkHolDiaSemana_(data);
      var loc = d.loc != null ? d.loc : (d.locacoes != null ? d.locacoes : '—');
      var bv = Number(d.bonusValor) || 0;
      var hint = d.juntas ? ' · FSS' : '';
      return '<tr><td class="c">' + esc(data) + '</td><td class="c">' + esc(dow || '—') + '</td>' +
        '<td class="c">' + esc(String(loc)) + '</td><td class="n v">' + mkHolFmtMoney_(bv) + hint + '</td></tr>';
    }).join('');

    if (!rows) {
      rows = '<tr><td colspan="4" class="c">Sem detalhe dia a dia neste painel' +
        (nDias > 0 ? ' · ' + nDias + ' dia(s) com bônus no mês' : '') +
        (total > 0 ? ' · total ' + mkHolFmtMoney_(total) : '') +
        '</td></tr>';
    }

    return '<div class="mk-hol-comp">Dias com bônus de meta</div>' +
      '<table class="mk-hol-tbl mk-hol-tbl-mes"><thead><tr>' +
      '<th>Data</th><th>Dia</th><th>Locações</th><th>Bônus do dia</th></tr></thead><tbody>' +
      rows +
      '<tr class="sec"><td colspan="3">Total bônus do mês · ' + nDias + ' dia(s)</td>' +
      '<td class="n v">' + mkHolFmtMoney_(total) + '</td></tr>' +
      '</tbody></table>';
  }

  function mkHolBuildMesResumoHtml_(opts) {
    opts = opts || {};
    var opId = Number(opts.opId) || 0;
    var comp = opts.comp || '';
    var nome = opts.nome || '—';
    var resumo = mkHolMesResumo_(opts.holerite || {}, opId, comp);
    if (!resumo.ok) return '';

    var lbl = resumo.labels;
    var body = resumo.rubricas.map(function (r) {
      return '<tr><td>' + esc(r.nome) + '</td>' +
        '<td class="n v">' + mkHolFmtMoney_(r.q1) + '</td>' +
        '<td class="n v">' + mkHolFmtMoney_(r.q2) + '</td>' +
        '<td class="n v">' + mkHolFmtMoney_(r.soma) + '</td></tr>';
    }).join('');

    var pac = resumo.pacote;
    var regraNota = resumo.regraBonus === 'resto'
      ? 'Bônus Q2 = resto (ganho mês − pago na 1ª). Pacote = PIX + VA · VT fora do PIX.'
      : 'Pacote = PIX + VA · VT fora do PIX. Na 2ª o bônus deve ser o resto do mês (I141).';

    return '<div class="mk-hol-mes-resumo" data-i142="1">' +
      '<div class="mk-hol-comp">Conferência do mês · ' + esc(nome) + ' · ' + esc(lbl.mesLbl) + '</div>' +
      '<table class="mk-hol-tbl mk-hol-tbl-mes"><thead><tr>' +
      '<th>Rubrica</th><th>' + esc(lbl.q1) + '</th><th>' + esc(lbl.q2) + '</th><th>Soma</th>' +
      '</tr></thead><tbody>' + body + '</tbody></table>' +
      '<p class="mk-hol-mes-note">*VT = referência da quinzena (pago por semana, fora do PIX)</p>' +
      '<div class="mk-hol-comp">Pacote (PIX + VA, sem VT)</div>' +
      '<table class="mk-hol-tbl mk-hol-tbl-mes"><thead><tr>' +
      '<th></th><th>' + esc(lbl.q1) + '</th><th>' + esc(lbl.q2) + '</th><th>Mês</th></tr></thead><tbody>' +
      '<tr><td>Pacote</td>' +
      '<td class="n v">' + mkHolFmtMoney_(pac.q1) + '</td>' +
      '<td class="n v">' + mkHolFmtMoney_(pac.q2) + '</td>' +
      '<td class="n v">' + mkHolFmtMoney_(pac.soma) + '</td></tr>' +
      '</tbody></table>' +
      '<p class="mk-hol-mes-note">' + esc(regraNota) + '</p>' +
      mkHolBuildDiasBonusHtml_(opts.diasBonus, opts.bonusDias, resumo.bonusMes) +
      '</div>';
  }

  function mkHolWidgetHero_(opts) {
    opts = opts || {};
    var opId = opts.opId != null ? Number(opts.opId) : 0;
    var compCtx = opts.comp || '';
    var hol = mkHolNormalizeHol_(opts.holerite || {}, { opId: opId, comp: compCtx });
    var comp = compCtx || hol.competencia || '—';
    var liquido = hol.liquido != null ? hol.liquido : Number(opts.liquido) || 0;
    var bruto = opts.bruto != null ? Number(opts.bruto) : (hol.bruto != null ? Number(hol.bruto) : 0);
    var bonus = Number(hol.bonus) || 0;
    var totalDescontos = opts.totalDescontos != null
      ? Number(opts.totalDescontos)
      : (hol.totalDescontos != null ? Number(hol.totalDescontos) : 0);
    var vaTotal = Number(hol.vaTotal) || 0;
    var vtJaPago = Number(hol.vtPassesJaPago) || 0;
    var adianta = Number(opts.adiantamentoQ1) || mkHolAdiantamentoQ1_(hol);
    var pix = hol.pixQuinzena != null
      ? Number(hol.pixQuinzena)
      : Math.round((liquido + bonus) * 100) / 100;
    // I138 — pacote = PIX + VA; VT semanal nunca soma (mesmo se GAS mandar vtPasses)
    var pacote = hol.pacoteQuinzena != null
      ? Number(hol.pacoteQuinzena)
      : Math.round((pix + vaTotal) * 100) / 100;
    var qLabel = hol.quinzenaLabel || opts.quinzenaLabel ||
      (hol.quinzena === 1 ? '1ª quinzena' : (hol.quinzena === 2 ? '2ª quinzena' : 'Quinzena'));
    var pgto = hol.pagamentoEm || opts.pagamentoEm || '—';
    var benefCtx = vaTotal
      ? (' + VA · VT semanal já pago' + (vtJaPago ? ' (ref. ' + mkHolFmtMoney_(vtJaPago) + ')' : ''))
      : ' · VT semanal já pago';
    var vencCtx = hol.quinzena === 2 ? 'Salário do mês (proporcional)' : 'Adiantamento 1ª quinzena';
    var faltasHero = Number(opts.faltas) || Number(hol.faltas) || 0;
    var descCtx = hol.quinzena === 1
      ? 'Na 1ª: sem encargos · VT semanal já pago'
      : ('Adiantamento Q1 ' + mkHolFmtMoney_(adianta) +
        ' + INSS/IRRF/desc. VT 6%' + (faltasHero > 0 ? ' + faltas' : ''));
    var bonusCtx = hol.bonusRegra === 'resto'
      ? (' · bônus resto ' + mkHolFmtMoney_(bonus) + ' (mês − 1ª)')
      : (bonus > 0 ? (' · bônus ' + mkHolFmtMoney_(bonus)) : '');
    var avisoRegra = hol.bonusRegraAviso
      ? '<div class="mk-note warn" style="margin:8px 0 0;padding:10px 12px;border-radius:12px;background:#FEE2E2;color:#991B1B;font-weight:700">' +
        esc(hol.bonusRegraAviso) + '</div>'
      : '';
    return '<div class="gp-hol-widgets" aria-label="Resumo do pagamento">' +
      '<div class="mk-widget mk-widget--hero gp-hol-hero">' +
      '<span class="mk-widget-lbl">Pacote desta quinzena</span>' +
      '<span class="mk-widget-val green">' + mkHolFmtMoney_(pacote) + '</span>' +
      '<span class="mk-widget-ctx">' + esc(qLabel) + ' · pgto ' + esc(pgto) +
      ' · PIX ' + mkHolFmtMoney_(pix) + ' (salário+bônus)' + bonusCtx + benefCtx + '</span></div>' +
      avisoRegra +
      '<div class="mk-note info" style="margin:8px 0 0;padding:10px 12px;border-radius:12px;background:#FEF3C7;color:#92400E;font-weight:700">VT é pago toda semana — R$ 0,00 no pacote do holerite' +
        (vtJaPago ? ' (ref. quinzena ' + mkHolFmtMoney_(vtJaPago) + ' já pago fora)' : '') +
        '. Pacote = PIX + VA. Na 2ª o bônus é o resto do mês (não 50% de novo).</div>' +
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
    var opIdHol = Number(colab.id || f.id) || 0;
    // I141 — normaliza com opId para aplicar resto do bônus na 2ª (ambos holerites)
    var hol = mkHolNormalizeHol_(f.holerite || {}, { opId: opIdHol, comp: comp });
    var base = Number(f.base != null ? f.base : hol.base) || 0;
    // Preferir hol.bonus pós-regra (não f.bonus bruto do GAS = 50% do mês)
    var bonus = Number(hol.bonus) || 0;
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
        mkHolRow_('403', 'Desconto VT (6% do salário)', '6,0% salário prop.', '', mkHolFmtMoney_(vt, 'd'));
      // I133 — linha de faltas só aparece se houver valor (não assusta quem está em dia)
      if (faltas > 0) {
        descRows += mkHolRow_('404', 'Faltas / atrasos', 'proporcional', '', mkHolFmtMoney_(faltas, 'd'));
      }
    } else {
      descRows = mkHolRow_('', '', '', '', '', 'Descontos') +
        mkHolRow_('—', 'Sem descontos nesta quinzena', 'Encargos e adiantamento na 2ª', '', 'R$ 0,00');
    }

    var isResto = hol.bonusRegra === 'resto';
    var benPctLbl = isResto
      ? 'resto'
      : ((hol.pctBeneficios != null ? Math.round(Number(hol.pctBeneficios) * 100) : 50) + '%');
    var vtJaPago = Number(hol.vtPassesJaPago) || 0;
    // I138 — VT semanal: sempre R$ 0,00 no holerite (nunca soma no fim)
    var vtLinhaRef = 'JÁ PAGO toda semana — não entra no pacote' +
      (vtJaPago > 0 ? ' · ref. ' + mkHolFmtMoney_(vtJaPago) : '');
    var vtLinhaVal = 'R$ 0,00';
    var bonusMesVal = hol.bonusMes != null ? Number(hol.bonusMes) : null;
    var bonusRef = '';
    if (bonus > 0) {
      if (isResto && bonusMesVal != null) {
        bonusRef = 'resto · ganho mês ' + mkHolFmtMoney_(bonusMesVal).replace('R$\u00a0', '').replace('R$ ', '') +
          ' − pago na 1ª ' + mkHolFmtMoney_(hol.bonusQ1Pago || 0).replace('R$\u00a0', '').replace('R$ ', '');
      } else if (bonusMesVal != null && bonusMesVal > 0) {
        bonusRef = benPctLbl + ' de R$ ' + mkHolFmtMoney_(bonusMesVal).replace('R$\u00a0', '').replace('R$ ', '') + ' (mês)';
      } else {
        bonusRef = bonusDias + ' dia(s) · ' + benPctLbl + ' desta quinzena';
      }
    }

    // I133/I138/I141 — “já pago na 1ª” = memorial do dia 15 (nunca meta atual / nunca 50% do mês final)
    var memQ1 = qNum === 2 ? mkHolQ1PagoMemorial_(opIdHol, comp || hol.competencia || '') : null;
    var q1BonusPago = 0;
    var q1VaPago = 0;
    var q1AdiantaPago = adiantaQ1;
    var q1PacotePago = 0;
    if (qNum === 2) {
      if (memQ1) {
        q1AdiantaPago = memQ1.adianta;
        q1BonusPago = memQ1.bonus;
        q1VaPago = memQ1.va;
        q1PacotePago = memQ1.pacote;
      } else if (hol.bonusQ1Pago != null) {
        q1BonusPago = Number(hol.bonusQ1Pago) || 0;
        q1VaPago = Number(hol.vaTotal) || 0;
        q1PacotePago = Math.round((q1AdiantaPago + q1BonusPago + q1VaPago) * 100) / 100;
      }
    }
    var q1CestaRows = '';
    if (qNum === 2 && q1AdiantaPago > 0) {
      q1CestaRows =
        mkHolRow_('', '', '', '', '', 'Já pago na 1ª quinzena (dia 15) · sem VT') +
        mkHolRow_('010', 'Adiantamento salarial', '40% · descontado nesta 2ª', mkHolFmtMoney_(q1AdiantaPago), '') +
        (q1BonusPago > 0
          ? mkHolRow_('500', 'Bônus metas (já pago)', 'pago no dia 15 (não recalcular)', mkHolFmtMoney_(q1BonusPago), '')
          : '') +
        (q1VaPago > 0
          ? mkHolRow_('501', 'VA (já pago)', '50% do mês prop.', mkHolFmtMoney_(q1VaPago), '')
          : '') +
        mkHolRow_('502', 'VT (já pago semanal)', 'não soma no pacote', 'R$ 0,00', '') +
        mkHolRow_('—', 'Total pago na 1ª (PIX + VA)', 'VT fora · não se paga de novo', mkHolFmtMoney_(q1PacotePago), '');
    }

    var cestaTitulo = isResto
      ? 'Cesta · bônus = resto do mês (− já pago na 1ª) · VA nesta quinzena · VT semanal fora'
      : ('Cesta · ' + benPctLbl + ' nesta quinzena · bônus/VA na cesta · VT semanal fora do pacote');
    var showCesta = !!(hol.incluiBeneficios || bonus > 0 || (qNum === 2 && q1AdiantaPago > 0));
    var benBlock = showCesta
      ? '<div class="mk-hol-comp" style="border-top:1px solid var(--border);border-bottom:none;background:#F0FDF4;color:#166534">' + cestaTitulo + '</div>' +
        '<table class="mk-hol-tbl"><thead><tr><th>Cód</th><th>Benefício</th><th>Referência</th><th colspan="2">Valor concedido</th></tr></thead><tbody>' +
        (bonus > 0
          ? mkHolRow_('500', isResto ? 'Bônus metas (resto do mês)' : 'Bônus metas (cesta)', bonusRef, mkHolFmtMoney_(bonus), '')
          : '') +
        (hol.incluiBeneficios
          ? mkHolRow_('501', 'Vale-alimentação (VA)',
            (isResto ? '50%' : benPctLbl) + ' de R$ ' + (hol.vaMensal || 400) + '/mês prop. ' + diasTrab + '/' + diasMes,
            hol.vaTotal ? mkHolFmtMoney_(hol.vaTotal) : 'R$ 0,00', '') +
            mkHolRow_('502', 'Passes VT (semanal)', vtLinhaRef, vtLinhaVal, '')
          : '') +
        q1CestaRows +
        '</tbody></table>'
      : '<p class="gp-adm-muted" style="padding:12px 16px;margin:0">Sem cesta nesta quinzena (admissão posterior ao período).</p>';

    // I140 — FGTS é encargo do empregador: rodapé informativo, nunca na cesta
    var fgtsVal = Number(hol.fgts) || 0;
    var fgtsRodape = (qNum === 2 && fgtsVal > 0)
      ? '<div><span>FGTS 8% (encargo empregador)</span>' + mkHolFmtMoney_(fgtsVal) + '</div>'
      : '';

  var diasBonusList = opts.diasBonus ||
    (colab.metas && colab.metas.diasMes) ||
    f.diasBonusList ||
    null;
  var bonusDiasCount = f.bonusDias != null ? f.bonusDias
    : (colab.metas && colab.metas.bonusDias != null ? colab.metas.bonusDias : bonusDias);

  var mesResumoHtml = mkHolBuildMesResumoHtml_({
    opId: opIdHol,
    comp: comp || hol.competencia || '',
    nome: nome,
    holerite: hol,
    diasBonus: diasBonusList,
    bonusDias: bonusDiasCount
  });

  var toolbar = opts.toolbar !== false
      ? '<div class="mk-hol-toolbar no-print">' +
        '<button type="button" class="btn btn-secondary" onclick="mkHolPrintPdf_()">📄 Salvar PDF / Imprimir</button>' +
        '</div>'
      : '';

    var heroWidgets = mkHolWidgetHero_({
      holerite: hol,
      opId: opIdHol,
      comp: comp,
      bruto: bruto,
      liquido: liquido,
      totalDescontos: totalDescontos,
      adiantamentoQ1: adiantaQ1,
      faltas: faltas
    });

    return '<div class="mk-hol-print-root">' + toolbar + heroWidgets +
      '<p class="gp-hol-detail-lead no-print">Detalhamento + conferência do mês abaixo — use PDF para arquivo por colaboradora.</p>' +
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
      mesResumoHtml +
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
      fgtsRodape +
      '</div>' +
      '<div class="mk-hol-foot">Modelo DP: 1ª = adiantamento 40% + cesta (bônus/VA do acumulado na data); 2ª = salário do mês − adiantamento − encargos + cesta, com bônus = resto do mês (ganho − pago na 1ª). VT é pago toda semana e nunca soma no pacote. PIX = líquido + bônus · Pacote = PIX + VA. FGTS 8% é encargo do empregador (informativo). Documento informativo — conferir com contador.</div>' +
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
  global.mkHolNormalizeHol_ = mkHolNormalizeHol_;
  global.mkHolBonusRestoQ2_ = mkHolBonusRestoQ2_;
  global.mkHolQ1PagoMemorial_ = mkHolQ1PagoMemorial_;
  global.mkHolApplyBonusRegra_ = mkHolApplyBonusRegra_;
  global.mkHolMesResumo_ = mkHolMesResumo_;
  global.mkHolBuildMesResumoHtml_ = mkHolBuildMesResumoHtml_;
  global.mkHolWidgetHero_ = mkHolWidgetHero_;
  global.mkHolBuildHtml_ = mkHolBuildHtml_;
  global.mkHolPrintPdf_ = mkHolPrintPdf_;
})(typeof window !== 'undefined' ? window : globalThis);
