/* MOVI KIDS — Gestão Pessoas ADM · página Operadores (FASE 15) */
(function () {
  'use strict';

  let gpAdmData_ = null;
  let gpAdmTab_ = 'hoje';
  const GP_COMPETENCIAS_RH_ = ['Atendimento ao cliente', 'Pontualidade e presença', 'Metas de locação', 'Trabalho em equipe', 'Cuidado com a frota'];
  let gpAdmSelId_ = null;
  let gpAdmFichaSub_ = 'jornada';
  let gpAdmLoadPromise_ = null;
  let gpAdmCompSel_ = '';
  let gpAdmLoadSeq_ = 0;
  /** true só enquanto lite/full do painel RH está em voo (não confundir com Promise resolvida). */
  let gpAdmPanelInFlight_ = false;
  /** Última lista rápida (inclui órfãos fora do painel RH, ex. cadastro incompleto). */
  let gpAdmQuickCols_ = null;

  const GP_ADM_CACHE_TTL = 5 * 60 * 1000;

  function gpAdmCacheKey_(comp) {
    const raw = comp || gpAdmCompSel_ || '';
    const norm = String(raw).replace(/\//g, '');
    const now = new Date();
    const cur = String(now.getMonth() + 1).padStart(2, '0') + String(now.getFullYear());
    return 'mk_gp_adm_v4_' + (norm || cur);
  }

  /** Painel full (escala+folha) — abas pesadas. */
  function gpAdmIsFullPanel_(d) {
    if (!d || d._partial || d._fromQuick) return false;
    const esc = d.escala && d.escala.linhas && d.escala.linhas.length;
    const fol = d.folha && d.folha.length;
    return !!(esc || fol);
  }

  /**
   * I126 — payload já veio de painelGestaoPessoasAdmin (lite ou full).
   * Nunca substituir por stubs do hydrate rápido.
   */
  function gpAdmHasPanelPayload_(d) {
    if (!d || d._fromQuick) return false;
    if (d.lite === true || d.lite === false) return true;
    if (d.escala && d.escala.linhas && d.escala.linhas.length) return true;
    if (d.folha && d.folha.length) return true;
    return (d.colaboradores || []).some(function (c) {
      return c && c.ponto && (c.ponto.entrada || c.ponto.status === 'dentro');
    });
  }

  /** Presente = ponto aberto OU logado no balcão (mesma regra do badge). */
  function gpAdmIsPresente_(c) {
    if (!c) return false;
    if (c.logadoBalcao) return true;
    if (c.ponto && c.ponto.status === 'dentro') return true;
    return false;
  }

  function gpAdmRecalcKpis_(d) {
    if (!d) return;
    const cols = d.colaboradores || [];
    if (!d.kpis) d.kpis = {};
    d.kpis.total = cols.length;
    d.kpis.presentes = cols.filter(gpAdmIsPresente_).length;
    if (!d._fromQuick) {
      d.kpis.comTurno = cols.filter(function (c) { return !!(c.turno); }).length;
    }
  }

  /** Mantém colaboradores da lista rápida que o painel RH omitiu (ex. throw no GAS / cadastro incompleto). */
  function gpAdmMergeQuickOrphans_(panelCols) {
    const cols = (panelCols || []).slice();
    const quick = gpAdmQuickCols_ || [];
    if (!quick.length) return cols;
    const seen = {};
    cols.forEach(function (c) { seen[Number(c.id)] = true; });
    quick.forEach(function (q) {
      const id = Number(q.id);
      if (!seen[id]) {
        seen[id] = true;
        cols.push(Object.assign({}, q, { _orphanQuick: true }));
      }
    });
    cols.sort(function (a, b) { return String(a.nome).localeCompare(String(b.nome), 'pt-BR'); });
    return cols;
  }

  /**
   * I126c — sem faixa vermelha de “painel rápido”.
   * Escala/Hoje/Metas já funcionam no lite; Folha/Avaliações mostram loading no próprio painel.
   * Só alerta erro real (falha de API / fallback sem painel).
   */
  function gpAdmSyncStatusBanner_() {
    if (!gpAdmData_) {
      gpAdmSetErr_('');
      return;
    }
    if (gpAdmData_._fallback && !gpAdmHasPanelPayload_(gpAdmData_)) {
      gpAdmSetErr_(gpAdmGasPendingHtml_());
      return;
    }
    gpAdmSetErr_('');
  }

  /** Folha, Avaliações e Ficha (jornada/ponto dia a dia) precisam do painel full. */
  function gpAdmTabNeedsFullPanel_(tab) {
    return tab === 'folha' || tab === 'avaliacoes' || tab === 'presenca';
  }

  function gpAdmHasFolhaData_() {
    return !!(gpAdmData_ && gpAdmData_.folha && gpAdmData_.folha.length);
  }

  function gpAdmHasFullJornada_() {
    return (gpAdmData_ && gpAdmData_.colaboradores || []).some(function (c) {
      return c && c.jornada && c.jornada.dias && c.jornada.dias.length && !c.jornada._lite;
    });
  }

  function gpAdmPanelStillPartial_() {
    return !!(gpAdmData_ && (gpAdmData_._partial || gpAdmData_.lite === true || gpAdmData_._fromQuick));
  }

  function gpAdmShowJornadaLoading_() {
    const el = document.getElementById('gp-adm-ficha-main');
    if (el) {
      el.innerHTML = '<p class="gp-adm-muted gp-adm-loading">Carregando jornada / ponto da competência…</p>';
    }
  }

  function gpAdmEnsureFullPanel_(reason) {
    // Já temos full (folha ou jornada real) e não estamos em lite
    if (!gpAdmPanelStillPartial_() && (gpAdmHasFolhaData_() || gpAdmHasFullJornada_())) return;
    if (gpAdmPanelInFlight_) {
      if (reason === 'folha') gpAdmShowFolhaLoading_(gpAdmCompLabel_(gpAdmCompSel_ || (gpAdmData_ && gpAdmData_.competencia) || ''));
      if (reason === 'presenca') gpAdmShowJornadaLoading_();
      return;
    }
    if (typeof window.mkGpAdmLoad_ === 'function') {
      if (reason === 'presenca') gpAdmShowJornadaLoading_();
      window.mkGpAdmLoad_({
        force: true,
        skipLite: true,
        competencia: gpAdmCompSel_ || (gpAdmData_ && gpAdmData_.competencia) || ''
      });
    }
  }

  function gpAdmRenderTab_(tab) {
    if (!gpAdmData_) return;
    if (tab === 'escala') gpAdmRenderEscala_();
    else if (tab === 'metas') gpAdmRenderMetas_();
    else if (tab === 'folha') gpAdmRenderFolha_();
    else if (tab === 'comunicados') gpAdmRenderComunicados_();
    else if (tab === 'avaliacoes') gpAdmRenderAvaliacoes_();
    else if (tab === 'hoje') { gpAdmRenderKpis_(); gpAdmRenderHoje_(); }
    else if (tab === 'presenca') gpAdmRenderPresenca_();
  }

  function gpAdmCacheGet_(comp) {
    return typeof mkSessCacheGet_ === 'function' ? mkSessCacheGet_(gpAdmCacheKey_(comp), GP_ADM_CACHE_TTL) : null;
  }

  function gpAdmCacheSet_(data) {
    if (typeof mkSessCacheSet_ === 'function' && data && data.ok) {
      mkSessCacheSet_(gpAdmCacheKey_(data.competencia || gpAdmCompSel_), data);
    }
  }

  function gpAdmCompOptions_() {
    if (window.MK_GestaoPessoas && typeof MK_GestaoPessoas.competenciasList === 'function') {
      return MK_GestaoPessoas.competenciasList(12);
    }
    const list = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      list.push(String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear());
    }
    return list;
  }

  function gpAdmCompLabel_(comp) {
    if (window.MK_GestaoPessoas && typeof MK_GestaoPessoas.mesLabel === 'function') {
      return MK_GestaoPessoas.mesLabel(comp);
    }
    return comp;
  }

  function gpAdmSyncCompSelect_() {
    gpAdmBindCompSelect_();
    const sel = document.getElementById('gp-adm-comp-sel');
    if (!sel) return;
    const cur = (gpAdmData_ && gpAdmData_.competencia) || gpAdmCompSel_ || '';
    if (!sel.options.length) {
      gpAdmCompOptions_().forEach(function (c) {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = gpAdmCompLabel_(c);
        sel.appendChild(opt);
      });
    }
    if (cur) {
      gpAdmCompSel_ = cur;
      sel.value = cur;
    }
  }

  function gpAdmBindCompSelect_() {
    const sel = document.getElementById('gp-adm-comp-sel');
    if (!sel || sel.dataset.gpBound === '1') return;
    sel.dataset.gpBound = '1';
    sel.addEventListener('change', function () {
      window.mkGpAdmCompChange_(sel.value);
    });
  }

  function gpAdmShowFolhaLoading_(compLabel) {
    const folha = document.getElementById('gp-adm-folha');
    if (folha) {
      folha.innerHTML = '<p class="gp-adm-muted gp-adm-loading">Carregando folha de ' + esc(compLabel || '…') + '…</p>';
    }
    mkGpAdmFecharHolerite_();
  }

  window.mkGpAdmCompChange_ = function (comp) {
    const next = String(comp || '').trim();
    if (!next || next === gpAdmCompSel_) return;
    gpAdmCompSel_ = next;
    const sel = document.getElementById('gp-adm-comp-sel');
    if (sel) sel.disabled = true;
    gpAdmShowFolhaLoading_(gpAdmCompLabel_(next));
    if (typeof sessionStorage !== 'undefined') {
      try { sessionStorage.removeItem(gpAdmCacheKey_(gpAdmCompSel_)); } catch (e) { /* ignore */ }
    }
    window.mkGpAdmLoad_({ force: true, competencia: gpAdmCompSel_ }).finally(function () {
      if (sel) sel.disabled = false;
    });
  };

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
    const compEl = document.getElementById('gp-adm-comp-sel');
    if (compEl && !compEl.options.length) gpAdmSyncCompSelect_();
    const presSel = document.getElementById('gp-adm-presenca-sel');
    if (presSel) {
      presSel.innerHTML = '<option value="">Carregando colaboradores…</option>';
      presSel.disabled = true;
    }
    const fichaMain = document.getElementById('gp-adm-ficha-main');
    if (fichaMain) fichaMain.innerHTML = '<p class="gp-adm-muted gp-adm-loading">Carregando jornada…</p>';
    const fichaAside = document.getElementById('gp-adm-ficha-aside');
    if (fichaAside) fichaAside.innerHTML = '<p class="gp-adm-muted gp-adm-loading">Carregando perfil…</p>';
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
    if (c._orphanQuick) return '<span class="gp-adm-badge warn">Fora do RH</span>';
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
    gpAdmRenderTab_(tab);
    if (!gpAdmData_ && typeof window.mkGpAdmLoad_ === 'function') {
      window.mkGpAdmLoad_();
    } else if (gpAdmTabNeedsFullPanel_(tab)) {
      gpAdmEnsureFullPanel_(tab);
    }
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
    // I128 — Ficha precisa da jornada full (lite vem com dias [])
    gpAdmEnsureFullPanel_('presenca');
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
    const editBtn = '<button type="button" class="btn btn-secondary gp-adm-cad-edit-btn" style="margin-top:10px;width:100%;padding:8px 12px;font-size:13px" onclick="mkGpAdmEditarCadastro_(' + Number(c.id) + ')">Editar cadastro (nome, CPF…)</button>';
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
          '<div class="gp-adm-cad-kv-grid">' + kv + '</div>' + editBtn + '</section>';
      }
      const pend = pendingItems.map(function (lbl) {
        return '<li class="gp-adm-cad-pend">' + esc(lbl) + '</li>';
      }).join('');
      return '<section class="gp-adm-aside-block gp-adm-aside-block--warn">' +
        '<h4>Cadastro RH</h4><span class="gp-adm-badge warn">' + pct + '% · ' + pendingItems.length + ' pendente(s)</span>' +
        '<div class="gp-adm-cad-progress" role="progressbar" aria-valuenow="' + pct + '"><div class="gp-adm-cad-progress-bar" style="width:' + pct + '%"></div></div>' +
        '<p class="gp-adm-aside-hint">Admin pode editar abaixo · colaborador também em <strong>Meus dados</strong>.</p>' +
        '<ul class="gp-adm-cad-pend-list">' + pend + '</ul>' + editBtn + '</section>';
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
      '<div class="gp-adm-cad-list">' + rows + '</div>' + editBtn + '</div>';
  }

  window.mkGpAdmEditarCadastro_ = function (opId) {
    const c = gpAdmColabById_(opId);
    if (!c) {
      if (typeof toast === 'function') toast('Colaborador não encontrado', 'warning');
      return;
    }
    const cad = c.cadastro || {};
    const host = document.getElementById('gp-adm-ficha-aside') || document.getElementById('gp-adm-comunicados-list');
    if (!host) return;
    const fields = gpAdmCadastroLabels_();
    const formHtml = fields.map(function (f) {
      const v = String(cad[f.key] || '').trim();
      const req = gpAdmCadastroReqKeys_().indexOf(f.key) >= 0;
      return '<label class="gp-adm-cad-edit-field" style="display:block;margin:0 0 8px">' +
        '<span style="font-size:11px;font-weight:800;color:var(--txt2)">' + esc(f.label) + (req ? ' *' : '') + '</span>' +
        '<input class="form-input" data-cad-key="' + esc(f.key) + '" value="' + esc(v) + '" style="width:100%;margin-top:3px"></label>';
    }).join('');
    let box = document.getElementById('gp-adm-cad-edit-box');
    if (!box) {
      box = document.createElement('div');
      box.id = 'gp-adm-cad-edit-box';
      box.className = 'gp-adm-aside-block';
      box.style.marginTop = '12px';
      host.appendChild(box);
    }
    box.innerHTML =
      '<h4>Editar cadastro — ' + esc(c.nome || ('ID ' + opId)) + '</h4>' +
      '<p class="gp-adm-aside-hint">Salva na planilha RH (admin). Julia também pode editar em Colaboradores → Meus dados.</p>' +
      formHtml +
      '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">' +
      '<button type="button" class="btn btn-primary" style="padding:8px 14px;font-size:13px" onclick="mkGpAdmSalvarCadastro_(' + Number(opId) + ')">Salvar cadastro</button>' +
      '<button type="button" class="btn btn-secondary" style="padding:8px 14px;font-size:13px" onclick="document.getElementById(\'gp-adm-cad-edit-box\').remove()">Cancelar</button>' +
      '</div>';
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  window.mkGpAdmSalvarCadastro_ = async function (opId) {
    const box = document.getElementById('gp-adm-cad-edit-box');
    if (!box) return;
    const payload = { operadorId: opId, salvarParcial: 'sim' };
    box.querySelectorAll('[data-cad-key]').forEach(function (inp) {
      payload[inp.getAttribute('data-cad-key')] = String(inp.value || '').trim();
    });
    if (!String(payload.nomeCompleto || '').trim()) {
      if (typeof toast === 'function') toast('Nome completo é obrigatório', 'warning');
      return;
    }
    try {
      const d = await api(Object.assign({ action: 'salvarCadastroRhAdmin' }, payload, gpAdmPinParams_()), 45000);
      if (!d || !d.ok) {
        if (typeof toast === 'function') toast((d && d.erro) || 'Erro ao salvar cadastro', 'error');
        return;
      }
      if (typeof toast === 'function') toast('Cadastro RH atualizado', 'success');
      box.remove();
      try { sessionStorage.removeItem(gpAdmCacheKey_()); } catch (e) { /* ignore */ }
      await window.mkGpAdmLoad_({ force: true });
    } catch (e) {
      if (typeof toast === 'function') toast((e && e.message) || 'Erro de conexão', 'error');
    }
  };

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
    if (!gpAdmData_) {
      if (sel) {
        sel.innerHTML = '<option value="">Carregando colaboradores…</option>';
        sel.disabled = true;
      }
      return;
    }
    const cols = gpAdmData_.colaboradores || [];
    if (sel) {
      sel.disabled = false;
      if (!cols.length) {
        sel.innerHTML = '<option value="">Nenhum colaborador cadastrado</option>';
      } else {
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
    if (!j || !j.dias || !j.dias.length || j._lite) {
      // I128 — lite/partial ainda sem jornada: carregar full em vez de “sem dias”
      if (gpAdmPanelStillPartial_() || gpAdmPanelInFlight_ || !gpAdmHasFullJornada_()) {
        el.innerHTML = intelBlock +
          '<div class="gp-adm-card"><p class="gp-adm-muted gp-adm-loading">Carregando jornada / ponto de ' +
          esc(c.nome || 'colaborador') + '…</p></div>';
        gpAdmEnsureFullPanel_('presenca');
        return;
      }
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
    gpAdmRecalcKpis_(gpAdmData_);
    const k = gpAdmData_.kpis || {};
    const intelN = k.alertasIntel || (gpAdmData_.alertasInteligentes || []).length;
    const ctxPres = gpAdmData_._fromQuick
      ? 'provisório (lista rápida)'
      : ('de ' + (k.total || 0) + ' na equipe ativa');
    el.innerHTML =
      '<div class="mk-widget"><span class="mk-widget-lbl">Colaboradores</span><span class="mk-widget-val">' + (k.total || 0) + '</span><span class="mk-widget-ctx">' + (k.comTurno || 0) + ' com turno cadastrado</span></div>' +
      '<div class="mk-widget"><span class="mk-widget-lbl">Presentes agora</span><span class="mk-widget-val green">' + (k.presentes || 0) + '</span><span class="mk-widget-ctx">' + ctxPres + '</span></div>' +
      '<div class="mk-widget"><span class="mk-widget-lbl">Alertas</span><span class="mk-widget-val" style="color:var(--orange)">' + ((k.alertas || 0) + intelN) + '</span><span class="mk-widget-ctx">' +
      (intelN > 0 ? (intelN + ' proativos · ') : '') + ((k.alertas || 0) > 0 ? 'Conferir aba Hoje' : 'Tudo ok') + '</span></div>';
    gpAdmSyncStatusBanner_();
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
    if (!el || !gpAdmData_) return;
    const e = gpAdmData_.escala;
    if (!e) {
      el.innerHTML = '<p class="gp-adm-muted gp-adm-loading">Carregando escala…</p>';
      return;
    }
    const linhas = e.linhas || [];
    if (!linhas.length) {
      const hint = gpAdmData_._partial
        ? 'Aguardando painel RH (GAS v1.5.179+). Se persistir, republicar Nova versão Web.'
        : 'Escala não cadastrada para ' + esc(e.competencia || '') + '.';
      el.innerHTML = '<p class="gp-adm-muted">' + hint + '</p>';
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
    const content = document.getElementById('gp-adm-holerite-content');
    if (list) list.hidden = false;
    if (content) content.innerHTML = '';
    if (view) {
      view.hidden = true;
      view.setAttribute('aria-hidden', 'true');
    }
  };

  function gpAdmRenderFolha_() {
    const el = document.getElementById('gp-adm-folha');
    if (!el || !gpAdmData_) return;
    const compLbl = gpAdmCompLabel_(gpAdmData_.competencia || gpAdmCompSel_ || '');
    const folha = gpAdmData_.folha || [];
    if (!folha.length) {
      if (gpAdmData_._partial || gpAdmData_.lite === true || gpAdmData_._fromQuick || gpAdmLoadPromise_) {
        el.innerHTML = '<p class="gp-adm-muted gp-adm-loading">Carregando folha de <strong>' + esc(compLbl) + '</strong>…</p>';
      } else {
        el.innerHTML = '<p class="gp-adm-muted">Folha indisponível para ' + esc(compLbl) + ' — instale abas RH ou cadastre colaboradores.</p>';
      }
      return;
    }
    el.innerHTML = '<p class="gp-adm-folha-comp-hint">Exibindo competência <strong>' + esc(compLbl) + '</strong></p>' +
      '<table class="gp-adm-table"><tr><th style="text-align:left">Nome</th><th>Quinzena</th><th>Pgto</th><th>Loc mês</th><th>Bônus</th><th>Líquido est.</th><th></th></tr>' +
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
    if (!sel) return;
    const cur = String(sel.value || 'TODOS');
    const cols = (gpAdmData_ && gpAdmData_.colaboradores) || [];
    sel.innerHTML = '<option value="TODOS">TODOS</option>' + cols.filter(function (c) {
      return c.temRh !== false;
    }).map(function (c) {
      return '<option value="' + c.id + '">' + esc(c.nome || '') + ' (ID ' + c.id + ')</option>';
    }).join('');
    sel.value = cur;
    if (!sel.value) sel.value = 'TODOS';
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
      const pubRaw = String(c.publico || 'TODOS').trim();
      const pubLabel = (!pubRaw || pubRaw.toUpperCase() === 'TODOS')
        ? 'TODOS'
        : (gpAdmNomeById_(pubRaw) + ' (ID ' + pubRaw + ')');
      const meta = [c.data, 'Público: ' + pubLabel, c.validoAte ? ('até ' + c.validoAte) : ''].filter(Boolean).join(' · ');
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
    gpAdmSyncCompSelect_();
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

  function gpAdmMapColabQuick_(c, sessaoId) {
    const pct = typeof c.cadastroPct === 'number' ? c.cadastroPct : 0;
    return {
      id: c.id, nome: c.nome, hasPin: c.hasPin !== false, perfil: c.perfil || 'operador',
      funcao: c.funcao || 'Operador', turno: c.turno || '', admissao: c.admissao || '',
      cadastroPct: pct, cadastroOk: pct >= 100, temRh: true,
      ponto: { status: 'fora', entrada: null, saida: null, _provisorio: true },
      logadoBalcao: sessaoId === Number(c.id),
      metas: { alvo: 20, atual: 0, locMes: 0, bonusDias: 0, bonusTotal: 0 },
      folhaPonto: []
    };
  }

  async function gpAdmFetchColabListRh_() {
    if (window.MK_GestaoPessoas && typeof MK_GestaoPessoas.listarColaboradores === 'function') {
      const list = await MK_GestaoPessoas.listarColaboradores();
      let sessaoAtiva = null;
      try {
        const pin = gpAdmPinParams_();
        const ops = await api(Object.assign({ action: 'listarOperadoresAdmin', _t: Date.now() }, pin), 15000);
        if (ops && ops.ok) sessaoAtiva = ops.sessaoAtiva || null;
      } catch (e) { /* ok */ }
      return { ok: true, colaboradores: list, sessaoAtiva: sessaoAtiva };
    }
    return api({ action: 'listarColaboradoresGestao', _t: Date.now() }, 30000);
  }

  async function gpAdmHydrateColabQuick_() {
    try {
      const r = await gpAdmFetchColabListRh_();
      if (!r || !r.ok) return false;
      const sessaoId = r.sessaoAtiva && r.sessaoAtiva.operadorId ? Number(r.sessaoAtiva.operadorId) : 0;
      const cols = (r.colaboradores || []).filter(function (c) { return c.hasPin !== false; })
        .map(function (c) { return gpAdmMapColabQuick_(c, sessaoId); });
      cols.sort(function (a, b) { return String(a.nome).localeCompare(String(b.nome), 'pt-BR'); });
      gpAdmQuickCols_ = cols;
      const now = new Date();
      const comp = gpAdmCompSel_ || (String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear());
      // I126: se lite/full já chegou, só mescla cadastro/sessão — nunca zera ponto/escala
      if (gpAdmHasPanelPayload_(gpAdmData_)) {
        const byId = {};
        cols.forEach(function (c) { byId[Number(c.id)] = c; });
        gpAdmData_.colaboradores = (gpAdmData_.colaboradores || []).map(function (c) {
          const q = byId[Number(c.id)];
          if (!q) return c;
          return Object.assign({}, c, {
            cadastroPct: q.cadastroPct, cadastroOk: q.cadastroOk, logadoBalcao: q.logadoBalcao,
            funcao: q.funcao || c.funcao, admissao: q.admissao || c.admissao,
            turno: c.turno || q.turno
          });
        });
        gpAdmData_.colaboradores = gpAdmMergeQuickOrphans_(gpAdmData_.colaboradores);
        gpAdmRecalcKpis_(gpAdmData_);
      } else {
        gpAdmData_ = {
          ok: true, competencia: comp, colaboradores: cols,
          escala: { competencia: comp, colunas: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'], linhas: [] },
          folha: [], alertas: (gpAdmData_ && gpAdmData_.alertas) || [], alertasTotal: (gpAdmData_ && gpAdmData_.alertasTotal) || 0,
          alertasInteligentes: [],
          kpis: {
            total: cols.length,
            presentes: cols.filter(gpAdmIsPresente_).length,
            comTurno: cols.filter(function (c) { return !!c.turno; }).length,
            alertas: (gpAdmData_ && gpAdmData_.kpis && gpAdmData_.kpis.alertas) || 0,
            alertasIntel: 0
          },
          sessaoAtiva: r.sessaoAtiva, _partial: true, _fromQuick: true
        };
      }
      gpAdmCompSel_ = comp;
      if (typeof applySessaoAtivaFromApi_ === 'function') applySessaoAtivaFromApi_(r);
      gpAdmRenderPresenca_();
      gpAdmRenderKpis_();
      gpAdmRenderHoje_();
      gpAdmRenderEscala_();
      gpAdmRenderMetas_();
      return true;
    } catch (e) {
      return false;
    }
  }

  async function gpAdmLoadFallback_(errMsg) {
    const pin = gpAdmPinParams_();
    let rh = { ok: false, colaboradores: [], sessaoAtiva: null };
    try {
      rh = await gpAdmFetchColabListRh_();
    } catch (e) { /* fallback operadores */ }
    const ops = rh.ok && rh.colaboradores.length
      ? rh
      : await api(Object.assign({ action: 'listarOperadoresAdmin', _t: Date.now() }, pin), 30000);
    if (!ops.ok) throw new Error(ops.erro || errMsg);
    let alertas = { alertas: [], total: 0 };
    try {
      alertas = await api(Object.assign({ action: 'alertasPontoGestaoAdmin' }, pin), 20000);
    } catch (e) { /* v1.5.98+ */ }
    const sessaoId = ops.sessaoAtiva && ops.sessaoAtiva.operadorId ? Number(ops.sessaoAtiva.operadorId) : 0;
    const now = new Date();
    const comp = String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
    const src = ops.colaboradores || ops.operadores || [];
    const colaboradores = src.filter(function (c) { return c.hasPin !== false; }).map(function (c) {
      return typeof c.cadastroPct === 'number'
        ? gpAdmMapColabQuick_(c, sessaoId)
        : {
          id: c.id, nome: c.nome, hasPin: c.hasPin, perfil: c.perfil || 'operador',
          funcao: 'Operador', turno: '', admissao: '', cadastroPct: 0, temRh: false,
          ponto: { status: 'fora', entrada: null, saida: null },
          logadoBalcao: sessaoId === Number(c.id),
          metas: { alvo: 20, atual: 0, locMes: 0, bonusDias: 0, bonusTotal: 0 },
          folhaPonto: []
        };
    });
    gpAdmQuickCols_ = colaboradores;
    gpAdmData_ = {
      competencia: comp, colaboradores: colaboradores,
      escala: { competencia: comp, colunas: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'], linhas: [] },
      folha: [], alertas: alertas.alertas || [], alertasTotal: alertas.total || 0,
      kpis: {
        total: colaboradores.length,
        presentes: colaboradores.filter(gpAdmIsPresente_).length,
        comTurno: colaboradores.filter(function (c) { return !!c.turno; }).length,
        alertas: alertas.total || 0
      },
      sessaoAtiva: ops.sessaoAtiva, _fallback: true, _fromQuick: true, _partial: true
    };
    if (typeof applySessaoAtivaFromApi_ === 'function') applySessaoAtivaFromApi_(ops);
    gpAdmRender_();
  }

  function gpAdmGasPendingHtml_() {
    return '<strong>Painel RH completo indisponível.</strong> Republicar GAS header <strong>v1.5.179</strong> (Nova versão Web no deploy <code>AKfycbwakQ...</code>). ' +
      'Modo básico abaixo — lista e alertas de ponto.';
  }

  async function gpAdmLoadAlertasQuick_() {
    try {
      const alertas = await api(Object.assign({ action: 'alertasPontoGestaoAdmin', _t: Date.now() }, gpAdmPinParams_()), 25000);
      if (!alertas || !alertas.ok || !gpAdmData_) return;
      gpAdmData_.alertas = alertas.alertas || [];
      gpAdmData_.alertasTotal = alertas.total || 0;
      if (gpAdmData_.kpis) gpAdmData_.kpis.alertas = alertas.total || 0;
      gpAdmRenderHoje_();
      gpAdmRenderKpis_();
    } catch (e) { /* ok */ }
  }

  function gpAdmApplyPanelPayload_(d, compReq, opts) {
    if (!d || !d.ok) return false;
    const isLite = d.lite === true || !!(opts && opts.asLite);
    d._fromQuick = false;
    if (isLite) {
      d._partial = true;
      d.lite = true;
    } else {
      delete d._partial;
      d.lite = false;
    }
    d.colaboradores = gpAdmMergeQuickOrphans_(d.colaboradores || []);
    gpAdmRecalcKpis_(d);
    // Preserva alertas rápidos se o painel vier sem eles
    if ((!d.alertas || !d.alertas.length) && gpAdmData_ && gpAdmData_.alertas && gpAdmData_.alertas.length) {
      d.alertas = gpAdmData_.alertas;
      d.alertasTotal = gpAdmData_.alertasTotal || d.alertas.length;
      if (d.kpis) d.kpis.alertas = d.alertasTotal;
    }
    gpAdmData_ = d;
    gpAdmCompSel_ = d.competencia || compReq || gpAdmCompSel_;
    if (typeof applySessaoAtivaFromApi_ === 'function') applySessaoAtivaFromApi_(d);
    gpAdmRender_();
    gpAdmSyncStatusBanner_();
    return true;
  }

  /** Retorna Promise do lite→full. I126c: inFlight separado; full sempre. */
  function gpAdmLoadPainelBackground_(seq, compReq, opts) {
    gpAdmPanelInFlight_ = true;
    return (async function () {
      let liteOk = false;
      const skipLite = !!(opts && opts.skipLite);
      if (!skipLite) {
        try {
          const litePayload = Object.assign({
            action: 'painelGestaoPessoasAdmin', lite: '1', _t: Date.now()
          }, gpAdmPinParams_());
          if (compReq) litePayload.competencia = compReq;
          const lite = await api(litePayload, 45000);
          if (seq !== gpAdmLoadSeq_) return;
          if (lite && lite.ok) {
            liteOk = true;
            gpAdmApplyPanelPayload_(lite, compReq, { asLite: true });
          }
        } catch (eLite) {
          if (seq !== gpAdmLoadSeq_) return;
        }
      }
      try {
        const apiPayload = Object.assign({ action: 'painelGestaoPessoasAdmin', _t: Date.now() }, gpAdmPinParams_());
        if (compReq) apiPayload.competencia = compReq;
        const d = await api(apiPayload, 90000);
        if (seq !== gpAdmLoadSeq_) return;
        if (!d.ok) {
          if (!liteOk && !gpAdmHasPanelPayload_(gpAdmData_)) {
            const errTxt = esc(d.erro || 'Erro painel RH');
            gpAdmSetErr_('<strong>Painel RH:</strong> ' + errTxt + ' · Republicar GAS <strong>v1.5.205</strong> (Nova versão Web).');
            if (typeof toast === 'function') toast(d.erro || 'Painel RH indisponível', 'error');
          } else if (gpAdmTab_ === 'folha' || gpAdmTab_ === 'avaliacoes') {
            if (typeof toast === 'function') toast(d.erro || 'Folha indisponível — tente de novo', 'error');
          }
          return;
        }
        gpAdmApplyPanelPayload_(d, compReq, {});
        gpAdmCacheSet_(gpAdmData_);
        if (opts && opts.force && (gpAdmTab_ === 'folha' || gpAdmTab_ === 'avaliacoes') && typeof toast === 'function') {
          toast('Folha de ' + gpAdmCompLabel_(gpAdmCompSel_) + ' carregada', 'success');
        }
        if (gpAdmTab_ === 'cadastro' && typeof refreshOperadoresAdmin_ === 'function') await refreshOperadoresAdmin_();
      } catch (e) {
        if (seq !== gpAdmLoadSeq_) return;
        if (!gpAdmHasPanelPayload_(gpAdmData_)) {
          const msg = (e && e.message) || 'Erro de conexão';
          gpAdmSetErr_(esc(msg) + ' <span class="gp-adm-muted">Modo básico ativo.</span>');
        } else if ((gpAdmTab_ === 'folha' || gpAdmTab_ === 'avaliacoes') && typeof toast === 'function') {
          toast('Folha: falha ao carregar — abra a aba de novo', 'error');
        }
      } finally {
        if (seq === gpAdmLoadSeq_) gpAdmPanelInFlight_ = false;
      }
    })();
  }

  window.mkGpAdmLoad_ = async function mkGpAdmLoad_(opts) {
    // I126b/c: early-return ANTES do seq++; promise resolvida não bloqueia Folha (usa panelInFlight)
    if (gpAdmPanelInFlight_ && !opts?.force) return gpAdmLoadPromise_ || Promise.resolve();
    if (gpAdmLoadPromise_ && !opts?.force && !gpAdmPanelInFlight_) {
      /* hydrate já terminou e painel também — ok reutilizar */
      if (gpAdmHasFolhaData_() || gpAdmHasPanelPayload_(gpAdmData_)) return gpAdmLoadPromise_;
    }
    const seq = ++gpAdmLoadSeq_;
    const compReq = (opts && opts.competencia) ? String(opts.competencia).trim() : (gpAdmCompSel_ || '');
    if (compReq) gpAdmCompSel_ = compReq;
    const cached = !opts?.force ? gpAdmCacheGet_(compReq) : null;
    if (cached && cached.ok && !(cached._partial || cached.lite === true) && cached.folha && cached.folha.length) {
      if (seq !== gpAdmLoadSeq_) return gpAdmLoadPromise_;
      cached._fromQuick = false;
      delete cached._partial;
      cached.lite = false;
      gpAdmData_ = cached;
      gpAdmCompSel_ = cached.competencia || compReq || gpAdmCompSel_;
      if (typeof applySessaoAtivaFromApi_ === 'function') applySessaoAtivaFromApi_(cached);
      gpAdmRender_();
      gpAdmSyncStatusBanner_();
    } else if (opts?.force && opts.skipLite) {
      gpAdmShowFolhaLoading_(gpAdmCompLabel_(compReq || gpAdmCompSel_ || ''));
    } else if (!gpAdmHasPanelPayload_(gpAdmData_)) {
      gpAdmShowLoading_();
    }
    gpAdmLoadPromise_ = (async function () {
      try {
        const panelP = gpAdmLoadPainelBackground_(seq, compReq, opts);
        await gpAdmHydrateColabQuick_();
        await gpAdmLoadAlertasQuick_();
        gpAdmRenderHoje_();
        gpAdmSyncStatusBanner_();
        await panelP;
        gpAdmSyncStatusBanner_();
      } catch (e) {
        if (seq !== gpAdmLoadSeq_) return;
        if (!gpAdmHasPanelPayload_(gpAdmData_)) {
          try { await gpAdmLoadFallback_(e.message || 'Erro'); } catch (e2) { /* ignore */ }
          if (!gpAdmData_) await gpAdmHydrateColabQuick_();
        }
        gpAdmSyncStatusBanner_();
      } finally {
        if (seq === gpAdmLoadSeq_) {
          gpAdmLoadPromise_ = null;
          gpAdmPanelInFlight_ = false;
        }
      }
    })();
    return gpAdmLoadPromise_;
  };

  gpAdmBindCompSelect_();
})();
