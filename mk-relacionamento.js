/* MOVI KIDS - CRM relacionamento / responsaveis (Pacote M.13) */

var relEditCurrent = null;

// RELACIONAMENTO
// ═══════════════════════════════════════════════════════════
function relPhone_(tel) {
  const d = String(tel || '').replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return d || '-';
}

function relMoney_(v) {
  const n = Number(v || 0);
  return 'R$ ' + n.toFixed(2).replace('.', ',');
}

function relToggleHist(idx) {
  const el = document.getElementById('rel-hist-' + idx);
  if (el) el.classList.toggle('show');
}

function abrirEditarResponsavel(idx) {
  const r = relacionamentoCache[idx];
  if (!r) return;
  relEditCurrent = r;
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
  set('rel-edit-nome', r.responsavel || '');
  set('rel-edit-tel', r.telefone || '');
  set('rel-edit-criancas', (r.criancas || []).join(', '));
  set('rel-edit-obs', r.observacao || '');
  set('rel-edit-motivo', 'Atualizacao do cadastro de relacionamento.');
  document.getElementById('rel-modal')?.classList.add('show');
}

function fecharResponsavelRel() {
  document.getElementById('rel-modal')?.classList.remove('show');
  relEditCurrent = null;
}

async function salvarResponsavelRel() {
  const btn = document.getElementById('rel-save');
  const nome = document.getElementById('rel-edit-nome')?.value.trim() || '';
  const tel = document.getElementById('rel-edit-tel')?.value.replace(/\D/g,'') || '';
  const criancas = document.getElementById('rel-edit-criancas')?.value || '';
  const obs = document.getElementById('rel-edit-obs')?.value.trim() || '';
  const motivo = document.getElementById('rel-edit-motivo')?.value.trim() || 'Atualizacao do cadastro de relacionamento.';
  if (!nome || !tel) { toast('Nome e telefone são obrigatórios.', 'error'); return; }
  if (btn) { btn.textContent = 'Salvando...'; btn.disabled = true; }
  try {
    const res = await api({
      action: 'salvarResponsavel',
      responsavel: nome,
      telefone: tel,
      criancas,
      observacao: obs,
      motivo
    }, 25000);
    if (!res.ok) {
      toast('Atualize o Apps Script para v1.5.24: ' + (res.erro || 'acao indisponivel'), 'error');
      return;
    }
    toast('Cadastro do responsavel salvo.', 'success');
    fecharResponsavelRel();
    carregarRelacionamento();
  } catch(e) {
    toast('Falha ao salvar cadastro. Verifique internet e Apps Script v1.5.24.', 'error');
  } finally {
    if (btn) { btn.textContent = 'Salvar cadastro'; btn.disabled = false; }
  }
}

async function carregarRelacionamento() {
  const q = document.getElementById('rel-busca')?.value.trim() || '';
  const container = document.getElementById('rel-container');
  if (!container) return;
  container.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div>';

  try {
    const res = await api({ action:'listarResponsaveis', q, limite: 80 }, 25000);
    if (!res.ok) {
      container.innerHTML = '<div class="empty"><div class="empty-icon">⚠️</div><h3>Atualize o Apps Script</h3><p>Esta pagina precisa da v1.5.23 ou superior.</p></div>';
      return;
    }
    relacionamentoCache = (res.responsaveis || []).slice().sort((a, b) => {
      const an = String(a.responsavel || '').trim();
      const bn = String(b.responsavel || '').trim();
      return an.localeCompare(bn, 'pt-BR', { sensitivity: 'base' });
    });
    if (!relacionamentoCache.length) {
      container.innerHTML = '<div class="empty"><div class="empty-icon">👥</div><h3>Nenhum responsavel encontrado</h3><p>Tente outro nome ou telefone.</p></div>';
      return;
    }
    container.innerHTML = relacionamentoCache.map((r, idx) => {
      const kids = (r.criancas || []).map(c => `<span class="rel-kid">${escHtml(c)}</span>`).join('') || '<span class="rel-kid">Sem crianca</span>';
      const hist = (r.historico || []).map(h => `
        <div class="rel-hitem">
          <span>${escHtml(h.data || '')} ${escHtml(h.horaInicio || '')} · ${escHtml(h.crianca || '')} · ${escHtml(h.plano || '')}</span>
          <strong>${relMoney_(h.valorTotal)}</strong>
        </div>`).join('');
      const totalLoc = Number(r.totalLocacoes || 0);
      const encerradas = Number(r.encerradas || 0);
      const locLabel = totalLoc === 1 ? 'locação' : 'locações';
      const canonBadge = r.cadastroCanonico ? '<span class="rel-badge" title="Cadastro na aba RESPONSAVEIS">Cadastro</span>' : '';
      return `<div class="rel-card">
        <div class="rel-top">
          <div>
            <div class="rel-name">${escHtml(r.responsavel || 'Responsavel sem nome')}${canonBadge}</div>
            <div class="rel-phone">📱 ${relPhone_(r.telefone)}</div>
          </div>
          <div class="rel-metrics">${totalLoc} ${locLabel}${encerradas ? (' · ' + encerradas + ' enc.') : ''}<br>${relMoney_(r.faturamento)} total</div>
        </div>
        <div class="rel-kids">${kids}</div>
        <div class="rel-last">Ultima visita: ${escHtml(r.ultimaData || '-')} ${escHtml(r.ultimaHora || '')}<br>Ultimo: ${escHtml(r.ultimoVeiculo || '-')} · ${escHtml(r.ultimoPlano || '-')} · ${escHtml(r.ultimoPagamento || '-')}</div>
        <div class="rel-actions">
          <button class="rel-primary" onclick="abrirNovaComResponsavel(relacionamentoCache[${idx}])">Nova locação</button>
          <button class="rel-primary" onclick="abrirNovaComResponsavel(relacionamentoCache[${idx}], true)">Nova crianca</button>
          <button class="rel-secondary" onclick="abrirEditarResponsavel(${idx})">Editar</button>
          <button class="rel-secondary" onclick="relToggleHist(${idx})">Histórico</button>
        </div>
        <div class="rel-history" id="rel-hist-${idx}">${hist || '<div class="rel-hitem"><span>Sem histórico detalhado</span></div>'}</div>
      </div>`;
    }).join('');
  } catch(e) {
    container.innerHTML = '<div class="empty"><div class="empty-icon">⚠️</div><h3>Falha ao carregar</h3><p>Verifique internet e se o Apps Script v1.5.23 foi reimplantado.</p></div>';
  }
}
