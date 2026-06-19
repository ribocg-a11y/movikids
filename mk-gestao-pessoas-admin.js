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

  function gpAdmRenderPresencaTable_() {
    const el = document.getElementById('gp-adm-presenca-table');
    if (!el || !gpAdmData_) return;
    const c = gpAdmColabById_(gpAdmSelId_);
    if (!c) {
      el.innerHTML = '<p class="gp-adm-muted">Selecione um colaborador.</p>';
      return;
    }
    const rows = c.folhaPonto || [];
    if (!rows.length) {
      el.innerHTML = '<p class="gp-adm-muted">Sem registros de ponto nesta competência. Use a aba <strong>Escala</strong> para ver a grade da semana.</p>';
      return;
    }
    el.innerHTML = '<table class="gp-adm-table"><tr><th>Data</th><th>Entrada</th><th>Saída</th><th>Horas</th><th>Loc turno</th><th>Meta</th></tr>' +
      rows.slice().reverse().map(function (r) {
        const metaOk = c.metas && c.metas.alvo && Number(c.metas.atual) >= c.metas.alvo + 1;
        return '<tr><td>' + esc(r.data) + '</td><td>' + esc(r.entrada || '—') + '</td><td>' + esc(r.saida || '—') + '</td><td>' + esc(r.horas || '—') + '</td>' +
          '<td>' + (c.metas ? c.metas.atual : '—') + '</td><td>' + (metaOk ? '<span style="color:var(--green)">+R$100</span>' : '—') + '</td></tr>';
      }).join('') + '</table>';
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
    if (base <= 0 && bonus <= 0 && !hol.bruto) {
      return '<p class="gp-adm-muted">Sem demonstrativo CLT para esta competência.</p>';
    }
    const bruto = hol.bruto != null ? hol.bruto : base + bonus;
    const inss = hol.inss || 0;
    const irrf = hol.irrf || 0;
    const vt = hol.vt || 0;
    const faltas = hol.faltas || 0;
    const liquido = hol.liquido != null ? hol.liquido : bruto - inss - irrf - vt - faltas;
    const totalDescontos = hol.totalDescontos != null ? hol.totalDescontos : inss + irrf + vt + faltas;
    const diasTrab = (colab && colab.folhaPonto && colab.folhaPonto.length) || hol.vaDias || 0;
    const refSal = diasTrab ? diasTrab + '/30 dias' : '30/30';
    const inssAli = hol.inssAli != null ? (Number(hol.inssAli) * 100).toFixed(1).replace('.', ',') + '%' : '—';
    const irrfIsento = hol.irrfIsento === true || irrf === 0;
    const irrfRef = irrfIsento ? 'Isento' : '—';
    const nome = f.nome || (colab && colab.nome) || '—';
    const funcao = (colab && colab.funcao) || 'Colaborador';
    const adm = (colab && colab.admissao) || '—';
    return '<div class="mk-hol">' +
      '<div class="mk-hol-head"><div class="mk-hol-brand">MOVI <span style="color:var(--gold,#FFD54F)">KIDS</span></div>' +
      '<div class="mk-hol-sub">MOVI KIDS Brincadeiras LTDA<br>Golden Shopping Calhau · São Luís/MA</div></div>' +
      '<div class="mk-hol-meta">' +
      '<div><span>Colaborador</span>' + esc(nome) + ' · ' + esc(funcao) + '</div>' +
      '<div><span>Competência</span>' + esc(comp || '—') + '</div>' +
      '<div><span>Admissão</span>' + esc(adm) + '</div>' +
      '<div><span>Loc mês / bônus dias</span>' + (f.locMes || 0) + ' loc · ' + (f.bonusDias || 0) + ' dia(s)</div>' +
      '</div>' +
      '<div class="mk-hol-comp">Demonstrativo de pagamento · ' + esc(comp || '') + '</div>' +
      '<table class="mk-hol-tbl"><thead><tr><th>Cód</th><th>Descrição</th><th>Referência</th><th>Vencimentos</th><th>Descontos</th></tr></thead><tbody>' +
      gpAdmHolRow_('', '', '', '', '', 'Proventos') +
      gpAdmHolRow_('001', 'Salário base', refSal, gpAdmFmtMoney_(base), '') +
      (bonus > 0 ? gpAdmHolRow_('105', 'Bônus metas (variável)', (f.bonusDias || 0) + ' dia(s)', gpAdmFmtMoney_(bonus), '') : '') +
      gpAdmHolRow_('', '', '', '', '', 'Descontos legais e autorizados') +
      gpAdmHolRow_('401', 'INSS — previdência', inssAli, '', gpAdmFmtMoney_(inss, 'd')) +
      gpAdmHolRow_('402', 'IRRF — imposto de renda', irrfRef, '', irrf > 0 ? gpAdmFmtMoney_(irrf, 'd') : 'R$ 0,00') +
      gpAdmHolRow_('403', 'Vale-transporte (6% base)', '6,0%', '', gpAdmFmtMoney_(vt, 'd')) +
      gpAdmHolRow_('404', 'Faltas / atrasos', faltas > 0 ? 'proporcional' : '0 dia', '', faltas > 0 ? gpAdmFmtMoney_(faltas, 'd') : 'R$ 0,00') +
      '</tbody></table>' +
      '<div class="mk-hol-tot">' +
      '<div><div class="lbl">Total vencimentos</div><div class="val">' + gpAdmFmtMoney_(bruto) + '</div></div>' +
      '<div><div class="lbl">Total descontos</div><div class="val" style="color:var(--red)">' + gpAdmFmtMoney_(totalDescontos, 'd') + '</div></div>' +
      '<div><div class="lbl">Líquido a receber</div><div class="val">' + gpAdmFmtMoney_(liquido) + '</div></div>' +
      '</div>' +
      '<div class="mk-hol-comp" style="border-top:1px solid var(--border);border-bottom:none;background:#F0FDF4;color:#166534">Benefícios · não integram salário</div>' +
      '<table class="mk-hol-tbl"><thead><tr><th>Cód</th><th>Benefício</th><th>Referência</th><th colspan="2">Valor concedido</th></tr></thead><tbody>' +
      gpAdmHolRow_('501', 'Vale-alimentação (VA)', hol.vaDias ? hol.vaDias + ' dias × R$ ' + (hol.vaDiario || 20) : '—', hol.vaTotal ? gpAdmFmtMoney_(hol.vaTotal) : 'R$ 0,00', '') +
      gpAdmHolRow_('502', 'Vale-transporte (passes)', 'mês ref.', hol.vtPasses ? gpAdmFmtMoney_(hol.vtPasses) : '—', '') +
      gpAdmHolRow_('503', 'FGTS 8% (empregador)', 'sobre base INSS', hol.fgts ? gpAdmFmtMoney_(hol.fgts) : '—', '') +
      '</tbody></table>' +
      '<div class="mk-hol-bases">' +
      '<div><span>Salário contratual</span>' + gpAdmFmtMoney_(base) + '</div>' +
      '<div><span>Base INSS</span>' + gpAdmFmtMoney_(hol.baseInss || bruto) + '</div>' +
      '<div><span>Base IRRF</span>' + gpAdmFmtMoney_(hol.irrfBase || (bruto - inss)) + '</div>' +
      '<div><span>Total estimado c/ bônus</span>' + gpAdmFmtMoney_(f.total || liquido) + '</div>' +
      '</div>' +
      '<div class="mk-hol-foot">Documento informativo · MOVI KIDS. Simulação CLT para gestão interna — conferir com contador antes do pagamento.</div>' +
      '</div>';
  }

  window.mkGpAdmVerHolerite_ = function (id) {
    if (!gpAdmData_) return;
    const f = (gpAdmData_.folha || []).find(function (x) { return Number(x.id) === Number(id); });
    const colab = gpAdmColabById_(id);
    const modal = document.getElementById('gp-adm-holerite-modal');
    const content = document.getElementById('gp-adm-holerite-content');
    const title = document.getElementById('gp-adm-holerite-title');
    if (!f || !modal || !content) {
      if (typeof toast === 'function') toast('Holerite indisponível', 'warning');
      return;
    }
    if (title) title.textContent = 'Holerite · ' + (f.nome || '');
    content.innerHTML = gpAdmBuildHoleriteHtml_(f, colab, gpAdmData_.competencia);
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  window.mkGpAdmFecharHolerite_ = function () {
    const modal = document.getElementById('gp-adm-holerite-modal');
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  function gpAdmRenderFolha_() {
    const el = document.getElementById('gp-adm-folha');
    if (!el || !gpAdmData_) return;
    const folha = gpAdmData_.folha || [];
    if (!folha.length) {
      el.innerHTML = '<p class="gp-adm-muted">Folha indisponível — instale abas RH ou cadastre colaboradores.</p>';
      return;
    }
    el.innerHTML = '<table class="gp-adm-table"><tr><th style="text-align:left">Nome</th><th>Loc mês</th><th>Bônus dias</th><th>Base</th><th>Bônus R$</th><th>Total est.</th><th></th></tr>' +
      folha.map(function (f) {
        return '<tr><td style="text-align:left;font-weight:800">' + esc(f.nome) + '</td><td>' + (f.locMes || 0) + '</td><td>' + (f.bonusDias || 0) + '</td>' +
          '<td>' + Number(f.base || 0).toLocaleString('pt-BR') + '</td><td>' + Number(f.bonus || 0).toLocaleString('pt-BR') + '</td>' +
          '<td><strong>' + Number(f.total || 0).toLocaleString('pt-BR') + '</strong></td>' +
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
