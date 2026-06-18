/* MOVI KIDS — Gestão Pessoas ADM · página Operadores (FASE 15) */
(function () {
  'use strict';

  let gpAdmData_ = null;
  let gpAdmTab_ = 'hoje';
  let gpAdmSelId_ = null;

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

  function gpAdmStatusBadge_(c) {
    if (c.logadoBalcao) return '<span class="gp-adm-badge ok">No balcão</span>';
    if (c.ponto && c.ponto.status === 'dentro') return '<span class="gp-adm-badge ok">Presente</span>';
    if (c.ponto && c.ponto.entrada && c.ponto.saida) return '<span class="gp-adm-badge gray">Turno encerrado</span>';
    if (c.ponto && !c.ponto.entrada && c.turno) return '<span class="gp-adm-badge warn">Sem ponto</span>';
    return '<span class="gp-adm-badge gray">Fora</span>';
  }

  function gpAdmSubline_(c) {
    const parts = [];
    if (c.turno) parts.push(c.turno);
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
    gpAdmSetTab_('presenca');
    gpAdmRenderPresenca_();
  };

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
        '<div class="gp-adm-av' + (c.perfil === 'supervisor' ? ' owner' : '') + '">' + gpAdmInitial_(c.nome) + '</div>' +
        '<div class="gp-adm-row-body"><strong>' + esc(c.nome) + '</strong><small>' + gpAdmSubline_(c) + '</small></div>' +
        gpAdmStatusBadge_(c) +
        '<button type="button" class="gp-adm-link" onclick="mkGpAdmVerFicha(' + c.id + ')">Ficha</button></div>';
    }).join('') || '<p class="gp-adm-muted">Nenhum colaborador.</p>';
  }

  function gpAdmRenderPresenca_() {
    const el = document.getElementById('gp-adm-presenca');
    const sel = document.getElementById('gp-adm-presenca-sel');
    if (!el || !gpAdmData_) return;
    const cols = gpAdmData_.colaboradores || [];
    if (sel) {
      const cur = gpAdmSelId_ || (cols[0] && cols[0].id);
      sel.innerHTML = cols.map(function (c) {
        return '<option value="' + c.id + '"' + (Number(c.id) === Number(cur) ? ' selected' : '') + '>' + esc(c.nome) + '</option>';
      }).join('');
      sel.onchange = function () {
        gpAdmSelId_ = Number(sel.value);
        gpAdmRenderPresencaTable_();
      };
      gpAdmSelId_ = Number(sel.value) || cur;
    }
    gpAdmRenderPresencaTable_();
  }

  function gpAdmRenderPresencaTable_() {
    const el = document.getElementById('gp-adm-presenca-table');
    if (!el || !gpAdmData_) return;
    const c = (gpAdmData_.colaboradores || []).find(function (x) { return Number(x.id) === Number(gpAdmSelId_); });
    if (!c) {
      el.innerHTML = '<p class="gp-adm-muted">Selecione um colaborador.</p>';
      return;
    }
    const rows = c.folhaPonto || [];
    if (!rows.length) {
      el.innerHTML = '<p class="gp-adm-muted">Sem registros de ponto nesta competência.</p>';
      return;
    }
    el.innerHTML = '<table class="gp-adm-table"><tr><th>Data</th><th>Entrada</th><th>Saída</th><th>Horas</th><th>Loc turno</th><th>Meta</th></tr>' +
      rows.slice().reverse().map(function (r) {
        const metaOk = c.metas && c.metas.alvo && Number(c.metas.atual) >= c.metas.alvo + 1;
        return '<tr><td>' + esc(r.data) + '</td><td>' + esc(r.entrada || '—') + '</td><td>' + esc(r.saida || '—') + '</td><td>' + esc(r.horas || '—') + '</td>' +
          '<td>' + (c.metas ? c.metas.atual : '—') + '</td><td>' + (metaOk ? '<span style="color:var(--green)">+R$100</span>' : '—') + '</td></tr>';
      }).join('') + '</table>';
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

  function gpAdmRenderFolha_() {
    const el = document.getElementById('gp-adm-folha');
    if (!el || !gpAdmData_) return;
    const folha = gpAdmData_.folha || [];
    if (!folha.length) {
      el.innerHTML = '<p class="gp-adm-muted">Folha indisponível — instale abas RH ou cadastre colaboradores.</p>';
      return;
    }
    el.innerHTML = '<table class="gp-adm-table"><tr><th style="text-align:left">Nome</th><th>Loc mês</th><th>Bônus dias</th><th>Base</th><th>Bônus R$</th><th>Total est.</th></tr>' +
      folha.map(function (f) {
        return '<tr><td style="text-align:left">' + esc(f.nome) + '</td><td>' + (f.locMes || 0) + '</td><td>' + (f.bonusDias || 0) + '</td>' +
          '<td>' + Number(f.base || 0).toLocaleString('pt-BR') + '</td><td>' + Number(f.bonus || 0).toLocaleString('pt-BR') + '</td>' +
          '<td><strong>' + Number(f.total || 0).toLocaleString('pt-BR') + '</strong></td></tr>';
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

  window.mkGpAdmLoad_ = async function mkGpAdmLoad_() {
    const errEl = document.getElementById('gp-adm-err');
    if (errEl) errEl.textContent = '';
    try {
      const d = await api(Object.assign({ action: 'painelGestaoPessoasAdmin', _t: Date.now() }, gpAdmPinParams_()), 45000);
      if (!d.ok) {
        const msg = d.erro || 'Erro ao carregar gestão';
        if (errEl) {
          errEl.innerHTML = esc(msg) + (String(msg).indexOf('ausentes') >= 0
            ? ' <button type="button" class="gp-adm-link" onclick="mkGpAdmInstalarAbas_()">Instalar abas agora</button>'
            : '');
        }
        if (typeof refreshOperadoresAdmin_ === 'function') await refreshOperadoresAdmin_();
        return;
      }
      gpAdmData_ = d;
      if (typeof applySessaoAtivaFromApi_ === 'function') applySessaoAtivaFromApi_(d);
      gpAdmRender_();
      if (gpAdmTab_ === 'cadastro' && typeof refreshOperadoresAdmin_ === 'function') await refreshOperadoresAdmin_();
    } catch (e) {
      const msg = (e && e.message) || 'Erro de conexão';
      if (errEl) errEl.textContent = msg;
      if (typeof refreshOperadoresAdmin_ === 'function') await refreshOperadoresAdmin_();
      if (typeof toast === 'function') toast(msg, 'error');
    }
  };
})();
