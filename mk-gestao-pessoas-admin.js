/* MOVI KIDS — Gestão Pessoas ADM · página Operadores (FASE 15) */
(function () {
  'use strict';

  let gpAdmData_ = null;
  let gpAdmTab_ = 'hoje';
  const GP_COMPETENCIAS_RH_ = ['Atendimento ao cliente', 'Pontualidade e presença', 'Metas de locação', 'Trabalho em equipe', 'Cuidado com a frota'];
  let gpAdmSelId_ = null;
  let gpAdmFichaSub_ = 'jornada';
  let gpAdmLoadPromise_ = null;

  const GP_ADM_CACHE_TTL = 5 * 60 * 1000;

  function gpAdmCacheKey_() {
    const now = new Date();
    return 'mk_gp_adm_' + String(now.getMonth() + 1).padStart(2, '0') + now.getFullYear();
  }

  function gpAdmCacheGet_() {
    return typeof mkSessCacheGet_ === 'function' ? mkSessCacheGet_(gpAdmCacheKey_(), GP_ADM_CACHE_TTL) : null;
  }

  function gpAdmCacheSet_(data) {
    if (typeof mkSessCacheSet_ === 'function' && data && data.ok) mkSessCacheSet_(gpAdmCacheKey_(), data);
  }

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
    if (typeof apiParamsComAuth_ === 'function') return apiParamsComAuth_();
    return typeof mkAuthAdminPinParams_ === 'function' ? mkAuthAdminPinParams_() : {};
  }

  function gpAdmAlertRowHtml_(a, badgeLbl, badgeCls) {
    const nome = a.nome || a.operador || (a.operadorId ? ('ID ' + a.operadorId) : 'Alerta');
    const msg = a.mensagem || a.turno || '';
    const intel = a.inteligente ? '<span class="gp-adm-intel-badge">Proativo</span> ' : '';
    return '<div class="gp-adm-row"><div class="gp-adm-av">' + gpAdmInitial_(nome) + '</div>' +
      '<div class="gp-adm-row-body">' + intel + '<span class="gp-adm-soft-title">' + esc(a.titulo || nome) + '</span><small>' + esc(msg) + '</small>' +
      (a.acionavel ? '<small class="gp-adm-act">' + esc(a.acionavel) + '</small>' : '') +
      '</div><span class="gp-adm-badge ' + (badgeCls || 'warn') + '">' + esc(badgeLbl || 'Alerta') + '</span></div>';
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
    const page = document.getElementById('page-operadores');
    if (page) page.dataset.gpTab = tab;
    document.querySelectorAll('#page-operadores .gp-adm-tab').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.querySelectorAll('#page-operadores .gp-adm-panel').forEach(function (p) {
      p.classList.toggle('active', p.id === 'gp-adm-tab-' + tab);
    });
    const activeBtn = document.querySelector('#page-operadores .gp-adm-tab.active');
    if (activeBtn && window.matchMedia('(max-width: 900px) and (min-width: 641px)').matches) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  window.mkGpAdmFichaSub_ = function (sub) {
    gpAdmFichaSub_ = sub || 'jornada';
    const aside = document.getElementById('gp-adm-ficha-aside');
    if (aside) aside.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  window.mkGpAdmSetTab = function (tab) {
    if (tab !== 'folha' && typeof mkGpAdmFecharHolerite_ === 'function') mkGpAdmFecharHolerite_();
    gpAdmSetTab_(tab);
    if (tab === 'cadastro' && typeof refreshOperadoresAdmin_ === 'function') refreshOperadoresAdmin_();
  };

  window.mkGpAdmVerFicha = function (id, sub) {
    gpAdmSelId_ = Number(id);
    if (sub === 'cadastro') gpAdmFichaSub_ = 'cadastro';
    if (!gpAdmData_) {
      if (typeof toast === 'function') toast('Carregando equipe…', 'warning');
      window.mkGpAdmLoad_().then(function () { window.mkGpAdmVerFicha(id, sub); });
      return;
    }
    gpAdmSetTab_('presenca');
    gpAdmRenderPresenca_();
    const panel = document.getElementById('gp-adm-tab-presenca');
    if (panel) {
      try { panel.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { panel.scrollIntoView(true); }
    }
    if (sub === 'cadastro' && typeof mkGpAdmFichaSub_ === 'function') mkGpAdmFichaSub_('cadastro');
  };

  function gpAdmColabById_(id) {
    return (gpAdmData_.colaboradores || []).find(function (x) { return Number(x.id) === Number(id); });
  }

  function gpAdmIntelForOp_(opId) {
    const id = Number(opId);
    const out = [];
    (gpAdmData_.alertasInteligentes || []).forEach(function (a) {
      if (a.operadorId && Number(a.operadorId) === id) { out.push(a); return; }
      const c = String(a.codigo || '');
      if (c === 'BANCO_HORAS_' + id || c === 'META_ABAIXO_' + id) out.push(a);
    });
    (gpAdmData_.alertas || []).forEach(function (a) {
      if (Number(a.operadorId) !== id) return;
      out.push({
        titulo: 'Ponto pendente',
        mensagem: a.mensagem || a.turno || 'Sem entrada registrada',
        inteligente: true,
        acionavel: 'RH — conferir presença'
      });
    });
    return out;
  }

  function gpAdmCadastroLabels_() {
    return [
      { key: 'nomeCompleto', label: 'Nome completo' },
      { key: 'cpf', label: 'CPF' },
      { key: 'nascimento', label: 'Data nascimento' },
      { key: 'telefone', label: 'Telefone / WhatsApp' },
      { key: 'email', label: 'E-mail' },
      { key: 'endereco', label: 'Endereço completo' },
      { key: 'emergencia', label: 'Contato emergência' },
      { key: 'admissao', label: 'Data admissão' },
      { key: 'pix', label: 'Chave PIX' }
    ];
  }

  function gpAdmCadastroReqKeys_() {
    return ['nomeCompleto', 'cpf', 'nascimento', 'telefone', 'endereco', 'emergencia', 'admissao', 'pix'];
  }

  function gpAdmRenderCadastroPane_(c, compact) {
    const cad = c.cadastro || {};
    const ok = c.cadastroOk === true;
    const pct = ok ? 100 : (c.cadastroPct || 0);
    const reqKeys = gpAdmCadastroReqKeys_();
    if (compact) {
      const filledItems = [];
      const pendingItems = [];
      gpAdmCadastroLabels_().forEach(function (f) {
        const v = String(cad[f.key] || '').trim();
        const isReq = reqKeys.indexOf(f.key) >= 0;
        if (v) filledItems.push({ label: f.label, v: v });
        else if (isReq) pendingItems.push(f.label);
      });
      if (ok) {
        const kv = filledItems.map(function (it) {
          return '<div class="gp-adm-cad-kv"><span>' + esc(it.label) + '</span><span class="gp-adm-soft-val">' + esc(it.v) + '</span></div>';
        }).join('');
        return '<section class="gp-adm-aside-block">' +
          '<h4>Cadastro RH</h4><span class="gp-adm-badge ok">Completo</span>' +
          '<div class="gp-adm-cad-kv-grid">' + kv + '</div></section>';
      }
      const pend = pendingItems.map(function (lbl) {
        return '<li class="gp-adm-cad-pend">' + esc(lbl) + '</li>';
      }).join('');
      return '<section class="gp-adm-aside-block gp-adm-aside-block--warn">' +
        '<h4>Cadastro RH</h4><span class="gp-adm-badge warn">' + pct + '% · ' + pendingItems.length + ' pendente(s)</span>' +
        '<div class="gp-adm-cad-progress" role="progressbar" aria-valuenow="' + pct + '"><div class="gp-adm-cad-progress-bar" style="width:' + pct + '%"></div></div>' +
        '<p class="gp-adm-aside-hint">Complete em <strong>Colaboradores</strong> no tablet.</p>' +
        '<ul class="gp-adm-cad-pend-list">' + pend + '</ul></section>';
    }
    let pending = 0;
    const rows = gpAdmCadastroLabels_().map(function (f) {
      const v = String(cad[f.key] || '').trim();
      const isReq = reqKeys.indexOf(f.key) >= 0;
      const filled = v.length > 0;
      if (isReq && !filled) pending++;
      const cls = filled ? 'gp-adm-cad-row--ok' : (isReq ? 'gp-adm-cad-row--pend' : 'gp-adm-cad-row--opt');
      const icon = filled ? '✓' : (isReq ? '!' : '·');
      return '<div class="gp-adm-cad-row ' + cls + '">' +
        '<span class="gp-adm-cad-icon" aria-hidden="true">' + icon + '</span>' +
        '<div class="gp-adm-cad-body"><span>' + esc(f.label) + '</span><span class="gp-adm-soft-val">' + esc(v || (isReq ? 'Pendente' : '—')) + '</span></div></div>';
    }).join('');
    const badge = ok
      ? '<span class="gp-adm-badge ok">Completo</span>'
      : '<span class="gp-adm-badge warn">' + pct + '% · ' + pending + ' pendente(s)</span>';
    return '<div class="gp-adm-card gp-adm-cad-card">' +
      '<div class="gp-adm-cad-head"><div><h3>Cadastro RH</h3></div>' + badge + '</div>' +
      '<div class="gp-adm-cad-progress"><div class="gp-adm-cad-progress-bar" style="width:' + pct + '%"></div></div>' +
      '<div class="gp-adm-cad-list">' + rows + '</div></div>';
  }

  function gpAdmRenderFichaBar_() {
    const el = document.getElementById('gp-adm-ficha-badges');
    if (!el || !gpAdmData_) return;
    const c = gpAdmColabById_(gpAdmSelId_);
    if (!c) { el.innerHTML = ''; return; }
    const cadBadge = c.cadastroOk
      ? '<span class="gp-adm-badge ok">Cadastro OK</span>'
      : '<span class="gp-adm-badge warn">' + (c.cadastroPct || 0) + '% cadastro</span>';
    el.innerHTML = gpAdmStatusBadge_(c) + cadBadge;
  }

  function gpAdmRenderFichaAside_() {
    const el = document.getElementById('gp-adm-ficha-aside');
    if (!el || !gpAdmData_) return;
    const c = gpAdmColabById_(gpAdmSelId_);
    if (!c) {
      el.innerHTML = '<p class="gp-adm-muted">Escolha um colaborador acima.</p>';
      return;
    }
    const m = c.metas || {};
    const pontoTxt = (c.ponto && c.ponto.entrada)
      ? esc(c.ponto.entrada) + (c.ponto.saida ? ' → ' + esc(c.ponto.saida) : ' · aberto')
      : 'Sem registro';
    el.innerHTML =
      '<div class="gp-adm-aside-profile">' +
      '<div class="gp-adm-av' + (gpAdmIsOwner_(c) ? ' owner' : '') + '">' + gpAdmInitial_(c.nome) + '</div>' +
      '<div><h3>' + esc(c.nome) + '</h3><p>' + esc(c.funcao || 'Operador') + '</p></div></div>' +
      '<div class="gp-adm-aside-stats">' +
      '<div><span>Turno</span><span class="gp-adm-soft-val">' + esc(c.turno || '—') + '</span></div>' +
      '<div><span>Escala hoje</span><span class="gp-adm-soft-val">' + esc(c.escalaHoje || '—') + '</span></div>' +
      '<div><span>Meta / loc</span><span class="gp-adm-soft-val">' + (m.alvo || 20) + ' · ' + (m.atual || 0) + '</span></div>' +
      '<div><span>Ponto RH hoje</span><span class="gp-adm-soft-val">' + pontoTxt + '</span></div>' +
      '</div>' +
      gpAdmRenderCadastroPane_(c, true);
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
        gpAdmRenderFichaBar_();
        gpAdmRenderFichaAside_();
        gpAdmRenderPresencaTable_();
      };
      gpAdmSelId_ = Number(sel.value) || cur;
    }
    gpAdmRenderFichaBar_();
    gpAdmRenderFichaAside_();
    gpAdmRenderPresencaTable_();
  }

  function gpAdmJornSitBadge_(sit) {
    const s = String(sit || '—');
    let cls = 'gray';
    if (s === 'OK') cls = 'ok';
    else if (s === 'Extra') cls = 'extra';
    else if (s === 'Abonado') cls = 'ok';
    else if (s === 'Atraso' || s === 'Falta' || s === 'Ponto em folga') cls = 'warn';
    else if (s === 'Aberto') cls = 'open';
    else if (s === 'Folga') cls = 'off';
    return '<span class="gp-jorn-sit gp-jorn-sit--' + cls + '">' + esc(s) + '</span>';
  }

  function gpAdmRenderPresencaTable_() {
    const el = document.getElementById('gp-adm-ficha-main');
    if (!el || !gpAdmData_) return;
    const c = gpAdmColabById_(gpAdmSelId_);
    if (!c) {
      el.innerHTML = '<p class="gp-adm-muted">Selecione um colaborador.</p>';
      return;
    }
    const intelRows = gpAdmIntelForOp_(c.id);
    const intelBlock = intelRows.length
      ? '<div class="gp-adm-presenca-intel">' + intelRows.map(function (a) {
        return gpAdmAlertRowHtml_(a, 'Atenção', a.nivel === 'vermelho' ? 'err' : 'warn');
      }).join('') + '</div>'
      : '';
    const j = c.jornada;
    if (!j || !j.dias || !j.dias.length) {
      el.innerHTML = intelBlock +
        '<div class="gp-adm-card"><p class="gp-adm-muted">Sem dias na competência (confira escala RH e admissão).</p></div>';
      return;
    }
    const t = j.totais || {};
    const m = c.metas || {};
    const saldoCls = (t.saldoMesMin != null && t.saldoMesMin < 0) ? 'atraso' : 'extra';
    const saldoValAttr = saldoCls === 'atraso'
      ? 'class="mk-widget-val" style="color:#C62828"'
      : 'class="mk-widget-val green"';
    const resumo = '<div class="gp-adm-jorn-hero">' +
      '<h3>Jornada · ' + esc(gpAdmData_.competencia || '') + '</h3>' +
      '<p class="gp-adm-muted">' + (m.locMes || 0) + ' locações no mês</p>' +
      '<div class="mk-cmd-grid gp-adm-jorn-widgets">' +
      '<div class="mk-widget"><span class="mk-widget-lbl">Previsto</span><span class="mk-widget-val">' + esc(t.previsto || '—') + '</span><span class="mk-widget-ctx">Competência</span></div>' +
      '<div class="mk-widget"><span class="mk-widget-lbl">Trabalhado</span><span class="mk-widget-val blue">' + esc(t.trabalhado || '—') + '</span><span class="mk-widget-ctx">Horas registradas</span></div>' +
      '<div class="mk-widget"><span class="mk-widget-lbl">Saldo mês</span><span ' + saldoValAttr + '>' + esc(t.saldoMes || '—') + '</span><span class="mk-widget-ctx">' + (saldoCls === 'atraso' ? 'Atenção RH' : 'Dentro da meta') + '</span></div>' +
      '<div class="mk-widget"><span class="mk-widget-lbl">Banco horas</span><span class="mk-widget-val purple">' + esc(j.bancoProjetado || j.bancoSaldo || '0h00') + '</span><span class="mk-widget-ctx">Projetado</span></div>' +
      '</div>' +
      '<details class="gp-adm-jorn-details"><summary>Mais detalhes (extras, atrasos, banco)</summary>' +
      '<div class="gp-jorn-resumo gp-jorn-resumo--ficha">' +
      '<div class="gp-jorn-kpi gp-jorn-kpi--extra"><span>Extras</span><strong>' + esc(t.extras || '—') + '</strong></div>' +
      '<div class="gp-jorn-kpi gp-jorn-kpi--atraso"><span>Atraso / falta</span><strong>' + esc(t.atraso || '—') + '</strong></div>' +
      '<div class="gp-jorn-kpi"><span>Banco cadastro</span><strong>' + esc(j.bancoSaldo || '0h00') + '</strong></div>' +
      '</div></details></div>';
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
    el.innerHTML = intelBlock + resumo +
      '<div class="gp-adm-jorn-table-wrap">' +
      '<table class="gp-adm-table gp-jorn-table">' +
      '<thead><tr><th style="text-align:left">Data</th><th>Dia</th><th>Escala</th><th>Entrada</th><th>Saída</th><th>Previsto</th><th>Trabalhado</th><th>Extras</th><th>Atraso</th><th>Sit.</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';
  }

  function gpAdmRenderKpis_() {
    const el = document.getElementById('gp-adm-kpis');
    if (!el || !gpAdmData_) return;
    const k = gpAdmData_.kpis || {};
    const intelN = k.alertasIntel || (gpAdmData_.alertasInteligentes || []).length;
    el.innerHTML =
      '<div class="mk-widget"><span class="mk-widget-lbl">Colaboradores</span><span class="mk-widget-val">' + (k.total || 0) + '</span><span class="mk-widget-ctx">' + (k.comTurno || 0) + ' com turno cadastrado</span></div>' +
      '<div class="mk-widget"><span class="mk-widget-lbl">Presentes agora</span><span class="mk-widget-val green">' + (k.presentes || 0) + '</span><span class="mk-widget-ctx">de ' + (k.total || 0) + ' na equipe ativa</span></div>' +
      '<div class="mk-widget"><span class="mk-widget-lbl">Alertas</span><span class="mk-widget-val" style="color:var(--orange)">' + ((k.alertas || 0) + intelN) + '</span><span class="mk-widget-ctx">' +
      (intelN > 0 ? (intelN + ' proativos · ') : '') + ((k.alertas || 0) > 0 ? 'Conferir aba Hoje' : 'Tudo ok') + '</span></div>';
  }

  function gpAdmRenderHoje_() {
    const alertEl = document.getElementById('gp-adm-alertas');
    const teamEl = document.getElementById('gp-adm-equipe');
    if (!gpAdmData_ || !teamEl) return;

    const intel = gpAdmData_.alertasInteligentes || [];
    const ponto = gpAdmData_.alertas || [];
    if (alertEl) {
      if (!intel.length && !ponto.length) {
        alertEl.innerHTML = '<div class="gp-adm-card"><p class="gp-adm-muted">Nenhum alerta no momento.</p></div>';
      } else {
        let html = '';
        if (intel.length) {
          html += '<div class="gp-adm-card gp-adm-card--alert"><h3>Proativos</h3>' +
            intel.map(function (a) { return gpAdmAlertRowHtml_(a, 'RH', 'warn'); }).join('') + '</div>';
        }
        if (ponto.length) {
          html += '<div class="gp-adm-card gp-adm-card--alert"><h3>Ponto</h3>' +
            ponto.map(function (a) { return gpAdmAlertRowHtml_(a, 'Pendente', 'warn'); }).join('') + '</div>';
        }
        alertEl.innerHTML = html;
      }
    }

    const cols = gpAdmData_.colaboradores || [];
    teamEl.innerHTML = cols.map(function (c) {
      return '<div class="gp-adm-row">' +
        '<div class="gp-adm-av' + (gpAdmIsOwner_(c) ? ' owner' : '') + '">' + gpAdmInitial_(c.nome) + '</div>' +
        '<div class="gp-adm-row-body"><span class="gp-adm-soft-title">' + esc(c.nome) + '</span><small>' + gpAdmSubline_(c) + '</small></div>' +
        gpAdmStatusBadge_(c) +
        (c.cadastroOk ? '' : '<span class="gp-adm-badge warn">' + (c.cadastroPct || 0) + '%</span>') +
        '<button type="button" class="gp-adm-link" onclick="mkGpAdmVerFicha(' + c.id + (c.cadastroOk ? '' : ',\'cadastro\'') + ')">Ficha</button></div>';
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
        return '<tr><td class="gp-adm-name-cell">' + esc(ln.nome) + '</td>' +
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
      const metaAlert = (gpAdmData_.alertasInteligentes || []).some(function (a) {
        return String(a.codigo || '') === 'META_ABAIXO_' + c.id;
      });
      return '<div class="gp-adm-row"><div class="gp-adm-av">' + gpAdmInitial_(c.nome) + '</div>' +
        '<div class="gp-adm-row-body"><span class="gp-adm-soft-title">' + esc(c.nome) + '</span><small>Meta ' + (m.alvo || 20) + ' loc · hoje ' + (m.atual || 0) + ' · mês ' + (m.locMes || 0) + ' loc</small></div>' +
        (metaAlert ? '<span class="gp-adm-badge warn">Proativo</span>' : (m.bonusDias ? '<span class="gp-adm-badge ok">' + m.bonusDias + ' dia(s) bônus</span>' : '<span class="gp-adm-badge gray">Sem bônus</span>')) +
        '</div>';
    }).join('') || '<p class="gp-adm-muted">Cadastre colaboradores na aba RH (planilha).</p>';
  }

  function gpAdmFmtMoney_(v, tipo) {
    return typeof mkHolFmtMoney_ === 'function' ? mkHolFmtMoney_(v, tipo) : ('R$ ' + Number(v || 0).toFixed(2));
  }

  function gpAdmBuildHoleriteHtml_(f, colab, comp) {
    if (typeof mkHolBuildHtml_ !== 'function') {
      return '<p class="gp-adm-muted">Carregue mk-holerite.js para ver o demonstrativo.</p>';
    }
    return mkHolBuildHtml_({
      folha: f,
      colab: colab || {},
      comp: comp,
      toolbar: true
    });
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
    el.innerHTML = '<table class="gp-adm-table"><tr><th style="text-align:left">Nome</th><th>Quinzena</th><th>Pgto</th><th>Loc mês</th><th>Bônus</th><th>Líquido est.</th><th></th></tr>' +
      folha.map(function (f) {
        const hol = f.holerite || {};
        const q = f.quinzenaLabel || hol.quinzenaLabel || (f.quinzena === 1 ? '1ª' : '2ª');
        const pg = f.pagamentoEm || hol.pagamentoEm || '—';
        return '<tr><td class="gp-adm-name-cell">' + esc(f.nome) + '</td><td>' + esc(q) + '</td><td>' + esc(pg) + '</td><td>' + (f.locMes || 0) + '</td><td>' + Number(f.bonus || 0).toLocaleString('pt-BR') + '</td>' +
          '<td><span class="gp-adm-soft-val">' + Number(f.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + '</span></td>' +
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

  function gpAdmFillComPublicoSelect_() {
    const sel = document.getElementById('gp-com-publico');
    if (!sel || sel.dataset.gpFilled === '1') return;
    const cols = (gpAdmData_ && gpAdmData_.colaboradores) || [];
    cols.filter(function (c) { return c.temRh !== false; }).forEach(function (c) {
      const opt = document.createElement('option');
      opt.value = String(c.id);
      opt.textContent = String(c.nome || '') + ' (ID ' + c.id + ')';
      sel.appendChild(opt);
    });
    sel.dataset.gpFilled = '1';
  }

  function gpAdmNotaStars_(n) {
    var out = '';
    var v = Math.max(0, Math.min(5, Number(n) || 0));
    for (var i = 1; i <= 5; i++) out += i <= v ? '★' : '☆';
    return out;
  }

  function gpAdmNomeById_(id) {
    const c = (gpAdmData_ && gpAdmData_.colaboradores || []).find(function (x) { return Number(x.id) === Number(id); });
    return c ? c.nome : ('ID ' + id);
  }

  function gpAdmFillAvFormSelects_() {
    const colSel = document.getElementById('gp-av-colab');
    const areaSel = document.getElementById('gp-av-area');
    const compInp = document.getElementById('gp-av-comp');
    if (colSel && colSel.dataset.gpFilled !== '1') {
      const cols = (gpAdmData_ && gpAdmData_.colaboradores) || [];
      colSel.innerHTML = cols.filter(function (c) { return c.temRh !== false; }).map(function (c) {
        return '<option value="' + c.id + '">' + esc(c.nome) + '</option>';
      }).join('');
      colSel.dataset.gpFilled = '1';
    }
    if (areaSel && areaSel.dataset.gpFilled !== '1') {
      const areas = (gpAdmData_ && gpAdmData_.competenciasRh) || GP_COMPETENCIAS_RH_;
      areaSel.innerHTML = areas.map(function (a) {
        return '<option value="' + esc(a) + '">' + esc(a) + '</option>';
      }).join('');
      areaSel.dataset.gpFilled = '1';
    }
    if (compInp && !String(compInp.value || '').trim() && gpAdmData_) {
      compInp.value = gpAdmData_.competencia || '';
    }
  }

  function gpAdmRenderAvaliacoes_() {
    gpAdmFillAvFormSelects_();
    const el = document.getElementById('gp-adm-avaliacoes-list');
    if (!el) return;
    const list = (gpAdmData_ && gpAdmData_.avaliacoesRh) || [];
    if (!list.length) {
      el.innerHTML = '<p class="gp-adm-muted">Nenhuma avaliação — registre acima ou instale aba AVALIACOES_RH.</p>';
      return;
    }
    el.innerHTML = list.map(function (a) {
      const nota = Number(a.nota) || 0;
      const tone = nota >= 4 ? 'ok' : (nota >= 3 ? 'blue' : 'warn');
      const meta = [gpAdmNomeById_(a.operadorId), a.competencia, a.criadoEm].filter(Boolean).join(' · ');
      return '<div class="gp-adm-av-row gp-adm-av-row--' + tone + '">' +
        '<div class="gp-adm-av-row-head">' +
        '<span class="gp-adm-badge ' + (nota >= 4 ? 'ok' : (nota >= 3 ? 'blue' : 'warn')) + '">' + gpAdmNotaStars_(nota) + '</span>' +
        '<span class="gp-adm-soft-title">' + esc(a.area || 'Competência') + '</span></div>' +
        (a.observacao ? '<p class="gp-adm-muted" style="margin:0 0 6px">' + esc(a.observacao) + '</p>' : '') +
        '<div class="gp-adm-com-meta">' + esc(meta || '—') + '</div></div>';
    }).join('');
  }

  window.mkGpAdmSalvarAvaliacao_ = async function () {
    const opId = (document.getElementById('gp-av-colab') || {}).value;
    const comp = (document.getElementById('gp-av-comp') || {}).value || (gpAdmData_ && gpAdmData_.competencia) || '';
    const area = (document.getElementById('gp-av-area') || {}).value || '';
    const nota = (document.getElementById('gp-av-nota') || {}).value || '3';
    const observacao = (document.getElementById('gp-av-obs') || {}).value || '';
    if (!opId) {
      if (typeof toast === 'function') toast('Selecione o colaborador', 'warning');
      return;
    }
    if (!String(area).trim()) {
      if (typeof toast === 'function') toast('Selecione a competência avaliada', 'warning');
      return;
    }
    try {
      const d = await api(Object.assign({
        action: 'salvarAvaliacaoRhAdmin',
        operadorId: opId,
        competencia: String(comp).trim(),
        area: String(area).trim(),
        nota: nota,
        observacao: String(observacao).trim()
      }, gpAdmPinParams_()), 30000);
      if (!d.ok) {
        if (typeof toast === 'function') toast(d.erro || 'Erro ao salvar', 'error');
        return;
      }
      if (typeof toast === 'function') toast('Avaliação registrada', 'success');
      const obsEl = document.getElementById('gp-av-obs');
      if (obsEl) obsEl.value = '';
      if (typeof sessionStorage !== 'undefined') {
        try { sessionStorage.removeItem(gpAdmCacheKey_()); } catch (e) { /* ignore */ }
      }
      await window.mkGpAdmLoad_({ force: true });
      mkGpAdmSetTab('avaliacoes');
    } catch (e) {
      if (typeof toast === 'function') toast((e && e.message) || 'Erro de conexão', 'error');
    }
  };

  function gpAdmRenderComunicados_() {
    gpAdmFillComPublicoSelect_();
    const el = document.getElementById('gp-adm-comunicados-list');
    if (!el) return;
    const list = (gpAdmData_ && gpAdmData_.comunicadosRh) || [];
    if (!list.length) {
      el.innerHTML = '<p class="gp-adm-muted">Nenhum comunicado — publique acima ou instale aba COMUNICADOS_RH.</p>';
      return;
    }
    el.innerHTML = list.map(function (c) {
      const urg = String(c.prioridade || '').toLowerCase() === 'urgente';
      const cls = urg ? ' gp-adm-com-row--urgente' : '';
      const badge = urg ? '<span class="gp-adm-badge warn">Urgente</span>' : '<span class="gp-adm-badge ok">Aviso</span>';
      const ativo = c.ativo !== false ? '<span class="gp-adm-badge ok">Ativo</span>' : '<span class="gp-adm-badge gray">Inativo</span>';
      const meta = [c.data, c.publico ? ('Público: ' + c.publico) : '', c.validoAte ? ('até ' + c.validoAte) : ''].filter(Boolean).join(' · ');
      return '<div class="gp-adm-com-row' + cls + '">' +
        '<div class="gp-adm-com-row-head">' + badge + ativo + '<span class="gp-adm-soft-title">' + esc(c.titulo || 'Comunicado') + '</span></div>' +
        '<p class="gp-adm-muted" style="margin:0 0 6px">' + esc(c.mensagem || '') + '</p>' +
        '<div class="gp-adm-com-meta">' + esc(meta || '—') + '</div></div>';
    }).join('');
  }

  window.mkGpAdmSalvarComunicado_ = async function () {
    const titulo = (document.getElementById('gp-com-titulo') || {}).value || '';
    const mensagem = (document.getElementById('gp-com-mensagem') || {}).value || '';
    const publico = (document.getElementById('gp-com-publico') || {}).value || 'TODOS';
    const validoAte = (document.getElementById('gp-com-valido') || {}).value || '';
    const prioridade = (document.getElementById('gp-com-prioridade') || {}).value || 'info';
    if (!String(titulo).trim() || !String(mensagem).trim()) {
      if (typeof toast === 'function') toast('Preencha título e mensagem', 'warning');
      return;
    }
    try {
      const d = await api(Object.assign({
        action: 'salvarComunicadoRhAdmin',
        titulo: String(titulo).trim(),
        mensagem: String(mensagem).trim(),
        publico: publico,
        validoAte: String(validoAte).trim(),
        prioridade: prioridade
      }, gpAdmPinParams_()), 30000);
      if (!d.ok) {
        if (typeof toast === 'function') toast(d.erro || 'Erro ao publicar', 'error');
        return;
      }
      if (typeof toast === 'function') toast('Comunicado publicado', 'success');
      ['gp-com-titulo', 'gp-com-mensagem', 'gp-com-valido'].forEach(function (id) {
        const inp = document.getElementById(id);
        if (inp) inp.value = '';
      });
      const pri = document.getElementById('gp-com-prioridade');
      if (pri) pri.value = 'info';
      if (typeof sessionStorage !== 'undefined') {
        try { sessionStorage.removeItem(gpAdmCacheKey_()); } catch (e) { /* ignore */ }
      }
      await window.mkGpAdmLoad_({ force: true });
      mkGpAdmSetTab('comunicados');
    } catch (e) {
      if (typeof toast === 'function') toast((e && e.message) || 'Erro de conexão', 'error');
    }
  };

  function gpAdmRender_() {
    gpAdmRenderKpis_();
    gpAdmRenderHoje_();
    gpAdmRenderPresenca_();
    gpAdmRenderEscala_();
    gpAdmRenderMetas_();
    gpAdmRenderFolha_();
    gpAdmRenderComunicados_();
    gpAdmRenderAvaliacoes_();
    const compEl = document.getElementById('gp-adm-comp');
    if (compEl && gpAdmData_) compEl.textContent = gpAdmData_.competencia || '';
    gpAdmSetTab_(gpAdmTab_);
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
    return '<strong>GAS desatualizado no Web App.</strong> Publique <strong>Nova versão Web</strong> do deploy <code>AKfycbwakQ...</code> com repo <strong>v1.5.130+</strong> para painel RH completo. ' +
      'No editor Apps Script: Implantar → Editar (lápis) → <strong>Nova versão</strong> (mesmo deploy). ' +
      'Arquivo: <code>MOVIKIDS_Code_v1.5.32...</code> header <strong>v1.5.102</strong>. ' +
      'Enquanto isso, aba <em>Cadastro &amp; sessão</em> funciona; aba <em>Hoje</em> mostra só operadores (modo limitado).';
  }

  window.mkGpAdmLoad_ = async function mkGpAdmLoad_(opts) {
    if (gpAdmLoadPromise_ && !opts?.force) return gpAdmLoadPromise_;
    const cached = !opts?.force ? gpAdmCacheGet_() : null;
    if (cached && cached.ok) {
      gpAdmData_ = cached;
      if (typeof applySessaoAtivaFromApi_ === 'function') applySessaoAtivaFromApi_(cached);
      gpAdmRender_();
      gpAdmSetErr_('');
    } else {
      gpAdmShowLoading_();
    }
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
        gpAdmCacheSet_(d);
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
