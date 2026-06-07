/* MOVI KIDS - lançamento avulso (Pacote M.15) */

var avulsoState = { tipo: null, plano: null };

function resetAvulsoForm_() {
  avulsoState = { tipo: null, plano: null };
  ['avulso-motivo','avulso-resp','avulso-crianca','avulso-tel','avulso-veiculo','avulso-pag'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.querySelectorAll('#avulso-tipo-grid .tipo-btn').forEach(b => b.classList.remove('sel'));
  const pw = document.getElementById('avulso-plano-wrap');
  if (pw) pw.style.display = 'none';
  const pg = document.getElementById('avulso-plano-grid');
  if (pg) pg.innerHTML = '';
}

function selAvulsoTipo(el, tipo) {
  avulsoState.tipo = tipo;
  avulsoState.plano = null;
  document.querySelectorAll('#avulso-tipo-grid .tipo-btn').forEach(b => b.classList.remove('sel'));
  el.classList.add('sel');
  const precos = PRECOS[tipo];
  const grid = document.getElementById('avulso-plano-grid');
  const wrap = document.getElementById('avulso-plano-wrap');
  if (!precos || !grid || !wrap) return;
  wrap.style.display = '';
  grid.innerHTML = Object.keys(precos).map(pl =>
    `<div class="plano-btn" onclick="selAvulsoPlano(this,'${pl}')">${PLANO_LABELS[pl] || pl}</div>`
  ).join('');
}

function selAvulsoPlano(el, plano) {
  avulsoState.plano = plano;
  document.querySelectorAll('#avulso-plano-grid .plano-btn').forEach(b => b.classList.remove('sel'));
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
      ...operadorApiParams_()
    });
    if (d.ok) {
      toast('Lancamento avulso #' + d.id + ' registrado', 'success');
      resetAvulsoForm_();
      broadcastInvalidate && broadcastInvalidate();
      syncController(true, 0);
      showPage('home');
    } else toast(d.erro || 'Erro', 'error');
  } catch (e) { toast('Erro de conexão', 'error'); }
  finally {
    if (btn) { btn.disabled = false; btn.textContent = '⚡ Registrar lançamento avulso'; }
  }
}
