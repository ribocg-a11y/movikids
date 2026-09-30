/* MOVI KIDS - lançamento avulso (Pacote M.15) · I159g unidade */

var avulsoState = { tipo: null, plano: null };
var avulsoUnidadeSel_ = 'golden';

function mkAvulsoTiposDaUnidade_(uid) {
  if (uid === 'laville') {
    return [
      { tipo: 'Carro', label: '🚗 Carro' },
      { tipo: 'Triciclo', label: '🛺 Triciclo' },
      { tipo: 'Pelúcia', label: '🧸 Pelúcia' },
      { tipo: 'Drift', label: '🛸 Drift' },
      { tipo: 'Dino', label: '🦖 Dino' }
    ];
  }
  return [
    { tipo: 'Carro', label: '🚗 Carro' },
    { tipo: 'Triciclo', label: '🛺 Triciclo' },
    { tipo: 'Pelúcia', label: '🧸 Pelúcia' }
  ];
}

function mkAvulsoRebuildTipoGrid_() {
  const grid = document.getElementById('avulso-tipo-grid');
  if (!grid) return;
  const tipos = mkAvulsoTiposDaUnidade_(avulsoUnidadeSel_);
  grid.innerHTML = tipos.map(function (t) {
    return '<div class="tipo-btn" onclick="selAvulsoTipo(this,\'' + t.tipo + '\')">' + t.label + '</div>';
  }).join('');
  avulsoState.tipo = null;
  avulsoState.plano = null;
  const pw = document.getElementById('avulso-plano-wrap');
  if (pw) pw.style.display = 'none';
  const pg = document.getElementById('avulso-plano-grid');
  if (pg) pg.innerHTML = '';
  const veic = document.getElementById('avulso-veiculo');
  if (veic) {
    veic.placeholder = 'Ex: Carro 01 (opcional)';
  }
}

function mkSelAvulsoUnidade_(el, uid) {
  avulsoUnidadeSel_ = uid === 'laville' ? 'laville' : 'golden';
  document.querySelectorAll('#avulso-unidade-pills .mk-hold-pill').forEach(function (b) {
    b.classList.toggle('mk-hold-pill--on', b.getAttribute('data-uid') === avulsoUnidadeSel_);
  });
  if (typeof mkUnidadeSet_ === 'function') {
    const r = mkUnidadeSet_(avulsoUnidadeSel_);
    if (r && !r.ok && typeof toast === 'function') {
      toast((r && r.erro) || 'Unidade indisponível', 'warning');
      return;
    }
  }
  if (typeof mkUnidadeAplicarConfig_ === 'function') {
    try { mkUnidadeAplicarConfig_(); } catch (eA) { /* ignore */ }
  }
  mkAvulsoRebuildTipoGrid_();
  if (typeof mkRefreshUnidadeUi_ === 'function') mkRefreshUnidadeUi_();
  if (typeof toast === 'function') {
    const nome = typeof mkUnidadeLabelCurto_ === 'function'
      ? mkUnidadeLabelCurto_(avulsoUnidadeSel_)
      : avulsoUnidadeSel_;
    toast('Avulso: ' + nome + ' · preços/tipos da loja', 'info');
  }
}
window.mkSelAvulsoUnidade_ = mkSelAvulsoUnidade_;

function resetAvulsoForm_() {
  avulsoState = { tipo: null, plano: null };
  ['avulso-motivo', 'avulso-resp', 'avulso-crianca', 'avulso-tel', 'avulso-veiculo', 'avulso-pag'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  if (typeof mkUnidadeId_ === 'function') {
    avulsoUnidadeSel_ = mkUnidadeId_() === 'laville' ? 'laville' : 'golden';
  }
  document.querySelectorAll('#avulso-unidade-pills .mk-hold-pill').forEach(function (b) {
    b.classList.toggle('mk-hold-pill--on', b.getAttribute('data-uid') === avulsoUnidadeSel_);
  });
  mkAvulsoRebuildTipoGrid_();
}

function selAvulsoTipo(el, tipo) {
  avulsoState.tipo = tipo;
  avulsoState.plano = null;
  document.querySelectorAll('#avulso-tipo-grid .tipo-btn').forEach(function (b) { b.classList.remove('sel'); });
  el.classList.add('sel');
  const precos = (typeof PRECOS !== 'undefined' && PRECOS) ? PRECOS[tipo] : null;
  const grid = document.getElementById('avulso-plano-grid');
  const wrap = document.getElementById('avulso-plano-wrap');
  if (!precos || !grid || !wrap) {
    if (typeof toast === 'function') toast('Preços desta unidade ainda não carregaram. Troque a unidade de novo.', 'warning');
    return;
  }
  wrap.style.display = '';
  const labels = typeof PLANO_LABELS !== 'undefined' ? PLANO_LABELS : {};
  grid.innerHTML = Object.keys(precos).map(function (pl) {
    const v = precos[pl] && precos[pl].v != null ? Number(precos[pl].v) : null;
    const preco = v != null ? (' · R$ ' + v.toFixed(2).replace('.', ',')) : '';
    return '<div class="plano-btn" onclick="selAvulsoPlano(this,\'' + pl + '\')">' +
      (labels[pl] || pl) + preco + '</div>';
  }).join('');
}

function selAvulsoPlano(el, plano) {
  avulsoState.plano = plano;
  document.querySelectorAll('#avulso-plano-grid .plano-btn').forEach(function (b) { b.classList.remove('sel'); });
  el.classList.add('sel');
}

async function salvarLancamentoAvulso() {
  const motivo = String(document.getElementById('avulso-motivo')?.value || '').trim();
  const responsavel = String(document.getElementById('avulso-resp')?.value || '').trim();
  const crianca = String(document.getElementById('avulso-crianca')?.value || '').trim();
  const telefone = String(document.getElementById('avulso-tel')?.value || '').trim();
  const veiculo = String(document.getElementById('avulso-veiculo')?.value || '').trim();
  const pagamento = String(document.getElementById('avulso-pag')?.value || '').trim();
  if (motivo.length < 10) { toast('Justificativa obrigatória (mín. 10 caracteres)', 'warning'); return; }
  if (!responsavel || !crianca) { toast('Responsável e criança são obrigatórios', 'warning'); return; }
  if (!avulsoState.tipo || !avulsoState.plano) { toast('Selecione tipo e plano', 'warning'); return; }
  const btn = document.getElementById('btn-avulso');
  if (btn) { btn.disabled = true; btn.textContent = 'Salvando...'; }
  try {
    const d = await api({
      action: 'salvarLancamentoAvulso',
      motivo,
      tipo: avulsoState.tipo,
      plano: avulsoState.plano,
      responsavel,
      crianca,
      telefone,
      veiculo,
      pagamento,
      unidadeId: avulsoUnidadeSel_,
      ...operadorApiParams_()
    });
    if (d.ok) {
      toast('Lancamento avulso #' + d.id + ' registrado', 'success');
      resetAvulsoForm_();
      if (typeof broadcastInvalidate === 'function') broadcastInvalidate();
      if (typeof syncController === 'function') syncController(true, 0);
      showPage('home', { adminBalcao: true });
    } else toast(d.erro || 'Erro', 'error');
  } catch (e) { toast('Erro de conexão', 'error'); }
  finally {
    if (btn) { btn.disabled = false; btn.textContent = '⚡ Registrar lançamento avulso'; }
  }
}
