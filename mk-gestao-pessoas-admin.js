/* MOVI KIDS — Gestão Pessoas ADM · página Operadores (FASE 15) */
(function () {
  'use strict';

  let gpAdmData_ = null;
  let gpAdmTab_ = 'hoje';
  let gpAdmSelId_ = null;
  let gpAdmLoadPromise_ = null;

  function gpAdmSetErr_(html) {
    const errEl = document.getElementById('gp-adm-err');
    if (!errEl) return;
    if (html) {
      errEl.hidden = false;
      errEl.innerHTML = html;
    } else {
      errEl.innerHTML = '';
      errEl.hidden = true;
    }
  }

  function gpAdmShowLoading_() {
    const sk = '<div class="gp-adm-kpi gp-adm-kpi--sk"><div class="gp-adm-kpi-val">…</div><div class="gp-adm-kpi-lbl">Carregando</div></div>';
    const kpi = document.getElementById('gp-adm-kpis');
    if (kpi) kpi.innerHTML = sk + sk + sk;
    const team = document.getElementById('gp-adm-equipe');
    if (team) team.innerHTML = '<p class="gp-adm-muted gp-adm-loading">Carregando equipe…</p>';
    const alertEl = document.getElementById('gp-adm-alertas');
    if (alertEl) alertEl.innerHTML = '';
    const compEl = document.getElementById('gp-adm-comp');
    if (compEl) compEl.textContent = '…';
  }

  function esc(v) {
    if (typeof escapeHtml_ === 'function') return escapeHtml_(v);
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  }

  function gpAdmPinParams_() {
    return typeof mkAuthAdminPinParams_ === 'function' ? mkAuthAdminPinParams_() : {};
  }

  function gpAdmInitial_(nome) {
    return esc(String(nome || '?').trim().charAt(0).toUpperCase() || '?');
  }

  function gpAdmIsOwner_(c) {
    return c && (c.perfil === 'supervisor' || Number(c.id) === 2 || /sócia|socia|propriet/i.test(String(c.funcao || '')));
  }

  function gpAdmStatusBadge_(c) {
    if (c.logadoBalcao) return '<span class="gp-adm-badge ok">No balcão</span>';
    if (c.escalaFolga) return '<span class="gp-adm-badge gray">Folga hoje</span>';
    if (c.ponto && c.ponto.status === 'dentro') return '<span class="gp-adm-badge ok">Presente</span>';
    if (c.ponto && c.ponto.entrada && c.ponto.saida) return '<span class="gp-adm-badge gray">Turno encerrado</span>';
    if (c.ponto && !c.ponto.entrada && (c.turno || c.escalaHoje)) return '<span class="gp-adm-badge warn">Sem ponto</span>';
    return '<span class="gp-adm-badge gray">Fora</span>';
  }

  function gpAdmSubline_(c) {
    const parts = [];
    if (c.escalaFolga) parts.push('Folga (escala)');
    else if (c.escalaHoje && c.escalaHoje !== '—') parts.push('Hoje ' + c.escalaHoje);
    else if (c.turno) parts.push(c.turno);
    if (c.ponto && c.ponto.entrada) parts.push('entrada ' + c.ponto.entrada);
    if (c.metas && c.metas.atual) parts.push(c.metas.atual + ' loc hoje');
    if (c.funcao) parts.push(c.funcao);
    return esc(parts.join(' · ') || 'Operador');
  }

  function gpAdmSetTab_(tab) {
    gpAdmTab_ = tab;
    document.querySelectorAll('#page-operadores .gp-adm-tab').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.querySelectorAll('#page-operadores .gp-adm-panel').forEach(function (p) {
      p.classList.toggle('active', p.id === 'gp-adm-tab-' + tab);
    });
  }

  window.mkGpAdmSetTab = function (tab) {
    if (tab !== 'folha' && typeof mkGpAdmFecharHolerite_ === 'function') mkGpAdmFecharHolerite_();
    gpAdmSetTab_(tab);
    if (tab === 'cadastro' && typeof refreshOperadoresAdmin_ === 'function') refreshOperadoresAdmin_();
  };

  window.mkGpAdmVerFicha = function (id) {
    gpAdmSelId_ = Number(id);
    if (!gpAdmData_) {
      if (typeof toast === 'function') toast('Carregando equipe…', 'warning');
      window.mkGpAdmLoad_().then(function () { window.mkGpAdmVerFicha(id); });
      return;
    }
    gpAdmSetTab_('presenca');
    gpAdmRenderPresenca_();
    const panel = document.getElementById('gp-adm-tab-presenca');
    if (panel) {
      try { panel.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { panel.scrollIntoView(true); }
    }
  };

  function gpAdmColabById_(id) {
    return (gpAdmData_.colaboradores || []).find(function (x) { return Number(x.id) === Number(id); });
  }

  function gpAdmRenderFichaResumo_() {
    const el = document.getElementById('gp-adm-ficha-resumo');
    if (!el || !gpAdmData_) return;
    const c = gpAdmColabById_(gpAdmSelId_);
    if (!c) {
      el.innerHTML = '';
      return;
    }
    const m = c.metas || {};
    el.innerHTML =
      '<div class="gp-adm-ficha-hero">' +
      '<div class="gp-adm-av' + (gpAdmIsOwner_(c) ? ' owner' : '') + '">' + gpAdmInitial_(c.nome) + '</div>' +
      '<div class="gp-adm-ficha-hero-body"><h3>' + esc(c.nome) + '</h3>' +
      '<p>' + esc(c.funcao || 'Operador') + (c.admissao ? ' · admissão ' + esc(c.admissao) : '') + '</p></div>' +
      gpAdmStatusBadge_(c) + '</div>' +
      '<div class="gp-adm-ficha-grid">' +
      '<div><span>Turno cadastro</span><strong>' + esc(c.turno || '—') + '</strong></div>' +
      '<div><span>Escala hoje</span><strong>' + esc(c.escalaHoje || '—') + '</strong></div>' +
      '<div><span>Meta / loc hoje</span><strong>' + (m.alvo || 20) + ' · ' + (m.atual || 0) + '</strong></div>' +
      '<div><span>Loc no mês</span><strong>' + (m.locMes || 0) + '</strong></div>' +
      '<div><span>Cadastro RH</span><strong>' + (c.cadastroPct || 0) + '%</strong></div>' +
      '<div><span>Ponto hoje</span><strong>' + (c.ponto && c.ponto.entrada ? esc(c.ponto.entrada) + (c.ponto.saida ? ' → ' + esc(c.ponto.saida) : '') : 'Sem registro') + '</strong></div>' +
      '</div>';
  }

  function gpAdmRenderPresenca_() {
    const sel = document.getElementById('gp-adm-presenca-sel');
    if (!gpAdmData_) return;
    const cols = gpAdmData_.colaboradores || [];
    if (sel) {
      const cur = gpAdmSelId_ || (cols[0] && cols[0].id);
      sel.innerHTML = cols.map(function (c) {
        return '<option value="' + c.id + '"' + (Number(c.id) === Number(cur) ? ' selected' : '') + '>' + esc(c.nome) + '</option>';
      }).join('');
      sel.onchange = function () {
        gpAdmSelId_ = Number(sel.value);
        gpAdmRenderFichaResumo_();
        gpAdmRenderPresencaTable_();
      };
      gpAdmSelId_ = Number(sel.value) || cur;
    }
    gpAdmRenderFichaResumo_();
    gpAdmRenderPresencaTable_();
  }

  function gpAdmJornSitBadge_(sit) {
    const s = String(sit || '—');
    let cls = 'gray';
    if (s === 'OK') cls = 'ok';
    else if (s === 'Extra') cls = 'extra';
    else if (s === 'Atraso' || s === 'Falta' || s === 'Ponto em folga') cls = 'warn';
    else if (s === 'Aberto') cls = 'open';
    else if (s === 'Folga') cls = 'off';
    return '<span class="gp-jorn-sit gp-jorn-sit--' + cls + '">' + esc(s) + '</span>';
  }

  function gpAdmRenderPresencaTable_() {
    const el = document.getElementById('gp-adm-presenca-table');
    if (!el || !gpAdmData_) return;
    const c = gpAdmColabById_(gpAdmSelId_);
    if (!c) {
      el.innerHTML = '<p class="gp-adm-muted">Selecione um colaborador.</p>';
      return;
    }
    const j = c.jornada;
    if (!j || !j.dias || !j.dias.length) {
      el.innerHTML = '<p class="gp-adm-muted">Sem dias na competência (confira escala RH e admissão). Se o front já atualizou, publique o GAS <strong>v1.5.109</strong> (Nova versão Web).</p>';
      return;
    }
    const t = j.totais || {};
    const saldoCls = (t.saldoMesMin != null && t.saldoMesMin < 0) ? 'atraso' : 'extra';
    const resumo = '<div class="gp-jorn-resumo">' +
      '<div class="gp-jorn-kpi"><span>Previsto</span><strong>' + esc(t.previsto || '—') + '</strong></div>' +
      '<div class="gp-jorn-kpi"><span>Trabalhado</span><strong>' + esc(t.trabalhado || '—') + '</strong></div>' +
      '<div class="gp-jorn-kpi gp-jorn-kpi--extra"><span>Extras</span><strong>' + esc(t.extras || '—') + '</strong></div>' +
      '<div class="gp-jorn-kpi gp-jorn-kpi--atraso"><span>Atraso / falta</span><strong>' + esc(t.atraso || '—') + '</strong></div>' +
      '<div class="gp-jorn-kpi gp-jorn-kpi--' + saldoCls + '"><span>Saldo mês</span><strong>' + esc(t.saldoMes || '—') + '</strong></div>' +
      '<div class="gp-jorn-kpi"><span>Banco cadastro</span><strong>' + esc(j.bancoSaldo || '0h00') + '</strong></div>' +
      '<div class="gp-jorn-kpi gp-jorn-kpi--banco"><span>Banco projetado</span><strong>' + esc(j.bancoProjetado || '0h00') + '</strong></div>' +
      '</div>' +
      '<p class="gp-adm-muted" style="margin:8px 0 12px">Escala × batidas · extras creditam e atrasos/faltas debitam o banco de horas.</p>';
    const rows = j.dias.map(function (r) {
      const trCls = r.folga ? ' class="gp-jorn-row-folga"' : '';
      return '<tr' + trCls + '>' +
        '<td style="text-align:left">' + esc(r.data) + '</td>' +
        '<td>' + esc(r.dia || '') + '</td>' +
        '<td>' + esc(r.escala || '—') + '</td>' +
        '<td>' + esc(r.entrada || '—') + '</td>' +
        '<td>' + esc(r.saida || '—') + '</td>' +
        '<td>' + esc(r.previsto || '—') + '</td>' +
        '<td>' + esc(r.trabalhado || '—') + '</td>' +
        '<td class="gp-jorn-extra">' + esc(r.extras || '—') + '</td>' +
        '<td class="gp-jorn-atraso">' + esc(r.atraso || '—') + '</td>' +
        '<td>' + gpAdmJornSitBadge_(r.sit) + '</td></tr>';
    }).join('');
    el.innerHTML = resumo +
      '<div class="gp-adm-table-wrap"><table class="gp-adm-table gp-jorn-table">' +
      '<thead><tr><th style="text-align:left">Data</th><th>Dia</th><th>Escala</th><th>Entrada</th><th>Saída</th><th>Previsto</th><th>Trabalhado</th><th>Extras</th><th>Atraso</th><th>Sit.</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';
  }

  function gpAdmRenderKpis_() {
    const el = document.getElementById('gp-adm-kpis');
    if (!el || !gpAdmData_) return;
    const k = gpAdmData_.kpis || {};
    el.innerHTML =
      '<div class="gp-adm-kpi"><div class="gp-adm-kpi-val">' + (k.total || 0) + '</div><div class="gp-adm-kpi-lbl">Colaboradores</div></div>' +
      '<div class="gp-adm-kpi"><div class="gp-adm-kpi-val" style="color:var(--green)">' + (k.presentes || 0) + '</div><div class="gp-adm-kpi-lbl">Presentes agora</div></div>' +
      '<div class="gp-adm-kpi"><div class="gp-adm-kpi-val" style="color:var(--orange)">' + (k.alertas || 0) + '</div><div class="gp-adm-kpi-lbl">Alertas ponto</div></div>';
  }

  function gpAdmRenderHoje_() {
    const alertEl = document.getElementById('gp-adm-alertas');
    const teamEl = document.getElementById('gp-adm-equipe');
    if (!gpAdmData_ || !teamEl) return;

    const alertas = gpAdmData_.alertas || [];
    if (alertEl) {
      if (!alertas.length) {
        alertEl.innerHTML = '<div class="gp-adm-card"><p class="gp-adm-muted">Nenhum alerta de ponto no momento.</p></div>';
      } else {
        alertEl.innerHTML = '<div class="gp-adm-card gp-adm-card--alert"><h3>⚠ Alertas de ponto</h3>' +
          alertas.map(function (a) {
            return '<div class="gp-adm-row"><div class="gp-adm-av">' + gpAdmInitial_(a.nome) + '</div>' +
              '<div class="gp-adm-row-body"><strong>' + esc(a.nome) + '</strong><small>' + esc(a.mensagem || a.turno) + '</small></div>' +
              '<span class="gp-adm-badge warn">Pendente</span></div>';
          }).join('') + '</div>';
      }
    }

    const cols = gpAdmData_.colaboradores || [];
    teamEl.innerHTML = cols.map(function (c) {
      return '<div class="gp-adm-row">' +
        '<div class="gp-adm-av' + (gpAdmIsOwner_(c) ? ' owner' : '') + '">' + gpAdmInitial_(c.nome) + '</div>' +
        '<div class="gp-adm-row-body"><strong>' + esc(c.nome) + '</strong><small>' + gpAdmSubline_(c) + '</small></div>' +
        gpAdmStatusBadge_(c) +
        '<button type="button" class="gp-adm-link" onclick="mkGpAdmVerFicha(' + c.id + ')">Ficha</button></div>';
    }).join('') || '<p class="gp-adm-muted">Nenhum colaborador.</p>';
  }

  function gpAdmRenderEscala_() {
    const el = document.getElementById('gp-adm-escala');
    if (!el || !gpAdmData_ || !gpAdmData_.escala) return;
    const e = gpAdmData_.escala;
    const linhas = e.linhas || [];
    if (!linhas.length) {
      el.innerHTML = '<p class="gp-adm-muted">Escala não cadastrada para ' + esc(e.competencia || '') + '.</p>';
      return;
    }
    el.innerHTML = '<table class="gp-adm-table"><tr><th>Nome</th>' + (e.colunas || []).map(function (d) { return '<th>' + esc(d) + '</th>'; }).join('') + '</tr>' +
      linhas.map(function (ln) {
        return '<tr><td style="text-align:left;font-weight:800">' + esc(ln.nome) + '</td>' +
          (ln.dias || []).map(function (cel) {
            const cls = cel === 'OFF' || cel === '—' ? 'off' : (String(cel).indexOf('10') >= 0 ? 'owner' : 'on');
            return '<td class="' + cls + '">' + esc(cel) + '</td>';
          }).join('') + '</tr>';
      }).join('') + '</table>';
  }

  function gpAdmRenderMetas_() {
    const el = document.getElementById('gp-adm-metas');
    if (!el || !gpAdmData_) return;
    const cols = gpAdmData_.colaboradores || [];
    el.innerHTML = cols.filter(function (c) { return c.temRh; }).map(function (c) {
      const m = c.metas || {};
      return '<div class="gp-adm-row"><div class="gp-adm-av">' + gpAdmInitial_(c.nome) + '</div>' +
        '<div class="gp-adm-row-body"><strong>' + esc(c.nome) + '</strong><small>Meta ' + (m.alvo || 20) + ' loc · hoje ' + (m.atual || 0) + ' · mês ' + (m.locMes || 0) + ' loc</small></div>' +
        (m.bonusDias ? '<span class="gp-adm-badge ok">' + m.bonusDias + ' dia(s) bônus</span>' : '<span class="gp-adm-badge gray">Sem bônus</span>') +
        '</div>';
    }).join('') || '<p class="gp-adm-muted">Cadastre colaboradores na aba RH (planilha).</p>';
  }

  function gpAdmFmtMoney_(v, tipo) {
    const n = Math.abs(Number(v) || 0);
    const s = n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (tipo === 'd' && Number(v) > 0 ? '−' : '') + 'R$ ' + s;
  }

  function gpAdmHolRow_(cod, desc, ref, venc, desco, sec) {
    if (sec) return '<tr class="sec"><td colspan="5">' + esc(sec) + '</td></tr>';
    return '<tr><td class="c">' + esc(cod) + '</td><td>' + esc(desc) + '</td><td class="c">' + esc(ref) + '</td>' +
      '<td class="n v">' + (venc || '') + '</td><td class="n d">' + (desco || '') + '</td></tr>';
  }

  function gpAdmBuildHoleriteHtml_(f, colab, comp) {
    const hol = f.holerite || {};
    const base = Number(f.base != null ? f.base : hol.base) || 0;
    const bonus = Number(f.bonus != null ? f.bonus : hol.bonus) || 0;
    if (hol.diasQuinzena === 0 || (base <= 0 && bonus <= 0)) {
      return '<p class="gp-adm-muted">Sem pagamento nesta quinzena — admissão posterior ou período não trabalhado.</p>';
    }
    const bruto = hol.bruto != null ? hol.bruto : base + bonus;
    const inss = hol.inss || 0;
    const irrf = hol.irrf || 0;
    const vt = hol.vt || 0;
    const faltas = hol.faltas || 0;
    const liquido = hol.liquido != null ? hol.liquido : bruto - inss - irrf - vt - faltas;
    const totalDescontos = hol.totalDescontos != null ? hol.totalDescontos : inss + irrf + vt + faltas;
    const diasMes = hol.diasMes || 30;
    const diasTrab = hol.diasTrabalhados != null ? hol.diasTrabalhados : 0;
    const refSal = diasTrab + '/' + diasMes + ' dias · ' + (hol.quinzena === 1 ? '40%' : '60%');
    const inssAli = hol.inssAli != null ? (Number(hol.inssAli) * 100).toFixed(1).replace('.', ',') + '%' : '—';
    const irrfIsento = hol.irrfIsento === true || irrf === 0;
    const irrfRef = irrfIsento ? 'Isento' : '—';
    const nome = f.nome || (colab && colab.nome) || '—';
    const funcao = (colab && colab.funcao) || 'Colaborador';
    const adm = (colab && colab.admissao) || '—';
    const qLabel = hol.quinzenaLabel || (hol.quinzena === 1 ? '1ª quinzena' : '2ª quinzena');
    const pgto = hol.pagamentoEm || '—';
    const salContr = hol.salarioContratual || hol.salarioProporcional || base;
    const pctSal = hol.quinzena === 1 ? '40%' : '60%';
    const descRows = hol.quinzena === 2
      ? gpAdmHolRow_('', '', '', '', '', 'Descontos legais e autorizados') +
        gpAdmHolRow_('401', 'INSS — previdência', inssAli, '', gpAdmFmtMoney_(inss, 'd')) +
        gpAdmHolRow_('402', 'IRRF — imposto de renda', irrfRef, '', irrf > 0 ? gpAdmFmtMoney_(irrf, 'd') : 'R$ 0,00') +
        gpAdmHolRow_('403', 'Vale-transporte (6% base)', '6,0%', '', gpAdmFmtMoney_(vt, 'd')) +
        gpAdmHolRow_('404', 'Faltas / atrasos', faltas > 0 ? 'proporcional' : '0 dia', '', faltas > 0 ? gpAdmFmtMoney_(faltas, 'd') : 'R$ 0,00')
      : gpAdmHolRow_('', '', '', '', '', 'Descontos') +
        gpAdmHolRow_('—', 'Adiantamento quinzenal — descontos na 2ª quinzena', '—', '', 'R$ 0,00');
    const benBlock = hol.incluiBeneficios
      ? '<div class="mk-hol-comp" style="border-top:1px solid var(--border);border-bottom:none;background:#F0FDF4;color:#166534">Benefícios · pagos na 2ª quinzena · não integram salário</div>' +
        '<table class="mk-hol-tbl"><thead><tr><th>Cód</th><th>Benefício</th><th>Referência</th><th colspan="2">Valor concedido</th></tr></thead><tbody>' +
        gpAdmHolRow_('501', 'Vale-alimentação (VA)', 'R$ ' + (hol.vaMensal || 400) + '/mês prop. ' + diasTrab + '/' + diasMes, hol.vaTotal ? gpAdmFmtMoney_(hol.vaTotal) : 'R$ 0,00', '') +
        gpAdmHolRow_('502', 'Vale-transporte (passes)', 'mês ref. prop.', hol.vtPasses ? gpAdmFmtMoney_(hol.vtPasses) : '—', '') +
        gpAdmHolRow_('503', 'FGTS 8% (empregador)', 'sobre base INSS', hol.fgts ? gpAdmFmtMoney_(hol.fgts) : '—', '') +
        '</tbody></table>'
      : '<p class="gp-adm-muted" style="padding:12px 16px;margin:0">Benefícios (VA R$ 400/mês, VT) creditados na <strong>2ª quinzena</strong> (pagamento dia 30/31).</p>';
    return '<div class="mk-hol">' +
      '<div class="mk-hol-head"><div class="mk-hol-brand">MOVI <span style="color:var(--gold,#FFD54F)">KIDS</span></div>' +
      '<div class="mk-hol-sub">MOVI KIDS Brincadeiras LTDA<br>Golden Shopping Calhau · São Luís/MA</div></div>' +
      '<div class="mk-hol-meta">' +
      '<div><span>Colaborador</span>' + esc(nome) + ' · ' + esc(funcao) + '</div>' +
      '<div><span>Competência</span>' + esc(comp || hol.competencia || '—') + '</div>' +
      '<div><span>Quinzena / pagamento</span>' + esc(qLabel) + ' · pgto ' + esc(pgto) + '</div>' +
      '<div><span>Admissão</span>' + esc(adm) + '</div>' +
      '<div><span>Salário contratual</span>' + gpAdmFmtMoney_(salContr) + '</div>' +
      '<div><span>Proporcional mês</span>' + gpAdmFmtMoney_(hol.salarioProporcional || base) + ' (' + diasTrab + '/' + diasMes + ' dias)</div>' +
      '</div>' +
      '<div class="mk-hol-comp">Demonstrativo · ' + esc(qLabel) + ' · pgto ' + esc(pgto) + '</div>' +
      '<table class="mk-hol-tbl"><thead><tr><th>Cód</th><th>Descrição</th><th>Referência</th><th>Vencimentos</th><th>Descontos</th></tr></thead><tbody>' +
      gpAdmHolRow_('', '', '', '', '', 'Proventos') +
      gpAdmHolRow_('001', 'Salário ' + pctSal + ' (proporcional)', refSal, gpAdmFmtMoney_(base), '') +
      (bonus > 0 ? gpAdmHolRow_('105', 'Bônus metas (variável)', (f.bonusDias || 0) + ' dia(s)', gpAdmFmtMoney_(bonus), '') : '') +
      descRows +
      '</tbody></table>' +
      '<div class="mk-hol-tot">' +
      '<div><div class="lbl">Total vencimentos</div><div class="val">' + gpAdmFmtMoney_(bruto) + '</div></div>' +
      '<div><div class="lbl">Total descontos</div><div class="val" style="color:var(--red)">' + gpAdmFmtMoney_(totalDescontos, 'd') + '</div></div>' +
      '<div><div class="lbl">Líquido a receber</div><div class="val">' + gpAdmFmtMoney_(liquido) + '</div></div>' +
      '</div>' +
      benBlock +
      '<div class="mk-hol-bases">' +
      '<div><span>Salário contratual</span>' + gpAdmFmtMoney_(salContr) + '</div>' +
      '<div><span>Base INSS (mês prop.)</span>' + gpAdmFmtMoney_(hol.baseInss || hol.salarioProporcional || bruto) + '</div>' +
      '<div><span>Base IRRF</span>' + gpAdmFmtMoney_(hol.irrfBase || (bruto - inss)) + '</div>' +
      '<div><span>Líquido desta quinzena</span>' + gpAdmFmtMoney_(liquido) + '</div>' +
      '</div>' +
      '<div class="mk-hol-foot">Regra MOVI KIDS: 1ª quinzena 40% salário (dia 15) · 2ª quinzena 60% + benefícios (dia 30/31) · proporcional à admissão. Conferir com contador.</div>' +
      '</div>';
  }

  window.mkGpAdmVerHolerite_ = function (id) {
    if (!gpAdmData_) return;
    const f = (gpAdmData_.folha || []).find(function (x) { return Number(x.id) === Number(id); });
    const colab = gpAdmColabById_(id);
    const list = document.getElementById('gp-adm-folha-list');
    const view = document.getElementById('gp-adm-holerite-view');
    const content = document.getElementById('gp-adm-holerite-content');
    if (!f || !view || !content) {
      if (typeof toast === 'function') toast('Holerite indisponível', 'warning');
      return;
    }
    content.innerHTML = gpAdmBuildHoleriteHtml_(f, colab, gpAdmData_.competencia);
    if (list) list.hidden = true;
    view.hidden = false;
    view.setAttribute('aria-hidden', 'false');
    try { view.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { view.scrollIntoView(true); }
  };

  window.mkGpAdmFecharHolerite_ = function () {
    const list = document.getElementById('gp-adm-folha-list');
    const view = document.getElementById('gp-adm-holerite-view');
    if (list) list.hidden = false;
    if (view) {
      view.hidden = true;
      view.setAttribute('aria-hidden', 'true');
    }
  };

  function gpAdmRenderFolha_() {
    const el = document.getElementById('gp-adm-folha');
    if (!el || !gpAdmData_) return;
    const folha = gpAdmData_.folha || [];
    if (!folha.length) {
      el.innerHTML = '<p class="gp-adm-muted">Folha indisponível — instale abas RH ou cadastre colaboradores.</p>';
      return;
    }
    el.innerHTML = '<p class="gp-adm-muted" style="margin:0 0 10px">Pagamento quinzenal: <strong>40%</strong> dia 15 · <strong>60% + benefícios</strong> dia 30/31 · proporcional à admissão · VA R$ 400/mês.</p>' +
      '<table class="gp-adm-table"><tr><th style="text-align:left">Nome</th><th>Quinzena</th><th>Pgto</th><th>Loc mês</th><th>Bônus</th><th>Líquido est.</th><th></th></tr>' +
      folha.map(function (f) {
        const hol = f.holerite || {};
        const q = f.quinzenaLabel || hol.quinzenaLabel || (f.quinzena === 1 ? '1ª' : '2ª');
        const pg = f.pagamentoEm || hol.pagamentoEm || '—';
        return '<tr><td style="text-align:left;font-weight:800">' + esc(f.nome) + '</td><td>' + esc(q) + '</td><td>' + esc(pg) + '</td><td>' + (f.locMes || 0) + '</td><td>' + Number(f.bonus || 0).toLocaleString('pt-BR') + '</td>' +
          '<td><strong>' + Number(f.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + '</strong></td>' +
          '<td><button type="button" class="gp-adm-link" onclick="mkGpAdmVerHolerite_(' + f.id + ')">Ver holerite</button></td></tr>';
      }).join('') + '</table>';
  }

  window.mkGpAdmExportCsv_ = function () {
    const folha = (gpAdmData_ && gpAdmData_.folha) || [];
    if (!folha.length) {
      if (typeof toast === 'function') toast('Nada para exportar', 'warning');
      return;
    }
    const lines = ['Nome,Loc mes,Bonus dias,Base,Bonus R$,Total'];
    folha.forEach(function (f) {
      lines.push([f.nome, f.locMes, f.bonusDias, f.base, f.bonus, f.total].join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'folha-movikids-' + (gpAdmData_.competencia || 'mes') + '.csv';
    a.click();
  };

  function gpAdmRender_() {
    gpAdmRenderKpis_();
    gpAdmRenderHoje_();
    gpAdmRenderPresenca_();
    gpAdmRenderEscala_();
    gpAdmRenderMetas_();
    gpAdmRenderFolha_();
    const compEl = document.getElementById('gp-adm-comp');
    if (compEl && gpAdmData_) compEl.textContent = gpAdmData_.competencia || '';
  }

  window.mkGpAdmInstalarAbas_ = async function () {
    try {
      const d = await api(Object.assign({ action: 'instalarAbasGestaoPessoasAdmin' }, gpAdmPinParams_()));
      if (!d.ok) {
        if (typeof toast === 'function') toast(d.erro || 'Erro', 'error');
        return;
      }
      if (typeof toast === 'function') toast('Abas Gestão Pessoas instaladas', 'success');
      await window.mkGpAdmLoad_();
    } catch (e) {
      if (typeof toast === 'function') toast((e && e.message) || 'Erro', 'error');
    }
  };

  async function gpAdmLoadFallback_(errMsg) {
    const pin = gpAdmPinParams_();
    const ops = await api(Object.assign({ action: 'listarOperadoresAdmin', _t: Date.now() }, pin), 30000);
    if (!ops.ok) throw new Error(ops.erro || errMsg);
    let alertas = { alertas: [], total: 0 };
    try {
      alertas = await api(Object.assign({ action: 'alertasPontoGestaoAdmin' }, pin), 20000);
    } catch (e) { /* v1.5.98+ */ }
    const sessaoId = ops.sessaoAtiva && ops.sessaoAtiva.operadorId ? Number(ops.sessaoAtiva.operadorId) : 0;
    const now = new Date();
    const comp = String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
    const colaboradores = (ops.operadores || []).map(function (op) {
      return {
        id: op.id, nome: op.nome, hasPin: op.hasPin, perfil: op.perfil || 'operador',
        funcao: 'Operador', turno: '', admissao: '', cadastroPct: 0, temRh: false,
        ponto: { status: 'fora', entrada: null, saida: null },
        logadoBalcao: sessaoId === Number(op.id),
        metas: { alvo: 20, atual: 0, locMes: 0, bonusDias: 0, bonusTotal: 0 },
        folhaPonto: []
      };
    });
    gpAdmData_ = {
      competencia: comp, colaboradores: colaboradores,
      escala: { competencia: comp, colunas: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'], linhas: [] },
      folha: [], alertas: alertas.alertas || [], alertasTotal: alertas.total || 0,
      kpis: { total: colaboradores.length, presentes: colaboradores.filter(function (c) { return c.logadoBalcao; }).length, comTurno: 0, alertas: alertas.total || 0 },
      sessaoAtiva: ops.sessaoAtiva, _fallback: true
    };
    if (typeof applySessaoAtivaFromApi_ === 'function') applySessaoAtivaFromApi_(ops);
    gpAdmRender_();
  }

  function gpAdmGasPendingHtml_() {
    return '<strong>GAS v1.5.100 ainda não publicado.</strong> O layout das abas está certo, mas o servidor está em <strong>v1.5.99</strong> — falta a action <code>painelGestaoPessoasAdmin</code>. ' +
      'No editor Apps Script: Implantar → Editar (lápis) → <strong>Nova versão</strong> (mesmo deploy). ' +
      'Arquivo: <code>MOVIKIDS_Code_v1.5.32...</code> header <strong>v1.5.102</strong>. ' +
      'Enquanto isso, aba <em>Cadastro &amp; sessão</em> funciona; aba <em>Hoje</em> mostra só operadores (modo limitado).';
  }

  window.mkGpAdmLoad_ = async function mkGpAdmLoad_(opts) {
    if (gpAdmLoadPromise_ && !opts?.force) return gpAdmLoadPromise_;
    gpAdmShowLoading_();
    gpAdmSetErr_('');
    gpAdmLoadPromise_ = (async function () {
      try {
        const d = await api(Object.assign({ action: 'painelGestaoPessoasAdmin', _t: Date.now() }, gpAdmPinParams_()), 45000);
        if (!d.ok) {
          const msg = d.erro || 'Erro ao carregar gestão';
          const gasPending = String(msg).indexOf('painelGestaoPessoasAdmin') >= 0 || String(msg).indexOf('desconhecida') >= 0;
          if (gasPending) {
            gpAdmSetErr_(gpAdmGasPendingHtml_());
            try { await gpAdmLoadFallback_(msg); } catch (e) { /* cadastro only */ }
            if (typeof refreshOperadoresAdmin_ === 'function') await refreshOperadoresAdmin_();
            return;
          }
          gpAdmSetErr_(esc(msg) + (String(msg).indexOf('ausentes') >= 0
            ? ' <button type="button" class="gp-adm-link" onclick="mkGpAdmInstalarAbas_()">Instalar abas agora</button>'
            : ''));
          if (typeof refreshOperadoresAdmin_ === 'function') await refreshOperadoresAdmin_();
          return;
        }
        gpAdmData_ = d;
        if (typeof applySessaoAtivaFromApi_ === 'function') applySessaoAtivaFromApi_(d);
        gpAdmRender_();
        gpAdmSetErr_('');
        if (gpAdmTab_ === 'cadastro' && typeof refreshOperadoresAdmin_ === 'function') await refreshOperadoresAdmin_();
      } catch (e) {
        const msg = (e && e.message) || 'Erro de conexão';
        if (String(msg).indexOf('timeout') >= 0) {
          gpAdmSetErr_('Demorou demais — publique GAS v1.5.107+ (AUDITORIA lida uma vez).');
        } else if (String(msg).indexOf('painelGestaoPessoasAdmin') >= 0) {
          gpAdmSetErr_(gpAdmGasPendingHtml_());
          try { await gpAdmLoadFallback_(msg); } catch (e2) { /* ignore */ }
        } else gpAdmSetErr_(esc(msg));
        if (typeof refreshOperadoresAdmin_ === 'function') await refreshOperadoresAdmin_();
      } finally {
        gpAdmLoadPromise_ = null;
      }
    })();
    return gpAdmLoadPromise_;
  };
})();
