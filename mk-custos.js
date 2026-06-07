/* MOVI KIDS - pagina Custos (Pacote M.14) */

var catSel = 'Energia';
var custosHoje = [];

async function loadCustosHoje() {
  // FIX #7: apenas busca custos (stats já vêm de carregarInicio/sincronizarServidor)
  try {
    const hoje  = new Date();
    const mm    = String(hoje.getMonth()+1).padStart(2,'0');
    const yyyy  = hoje.getFullYear();
    const dc    = await api({ action: 'listarCustos', mes: mm, ano: yyyy, ...apiParamsComAuth_() });
    if (dc.ok) {
      const dataHoje = String(hoje.getDate()).padStart(2,'0') + '/' + mm + '/' + yyyy;
      custosHoje = dc.custos.filter(c => String(c.data) === dataHoje);
      renderCustos();
    }
  } catch(e) { console.error('loadCustosHoje:', e); } // BUG4-FIX
}

function selCat(el, cat) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('sel'));
  el.classList.add('sel');
  catSel = cat;
}

async function salvarCusto() {
  const desc = document.getElementById('custo-desc').value.trim();
  const val  = parseFloat(document.getElementById('custo-val').value);

  if (!desc)        { toast('Digite uma descrição', 'error'); return; }
  if (!val || val <= 0) { toast('Valor inválido', 'error'); return; }

  const btn = document.getElementById('btn-custo');
  btn.textContent = '⏳ Salvando...'; btn.disabled = true;

  try {
    const d = await api({
      action:    'salvarCusto',
      descricao: desc,
      categoria: catSel,
      valor:     val
    });

    if (!d.ok) { toast('Erro: ' + d.erro, 'error'); return; }

    document.getElementById('custo-desc').value = '';
    document.getElementById('custo-val').value  = '';
    toast('✅ Custo registrado!', 'success');
    await loadCustosHoje();
  } catch {
    toast('Erro de conexão.', 'error');
  } finally {
    btn.textContent = '💾 Salvar Custo'; btn.disabled = false;
  }
}

function renderCustos() {
  const container = document.getElementById('custo-list');
  if (!custosHoje || custosHoje.length === 0) {
    container.innerHTML = `<div class="empty"><div class="empty-icon">💰</div><h3>Sem custos hoje</h3></div>`;
    return;
  }
  container.innerHTML = custosHoje.slice().reverse().map(c => {
    const v = Number(c.valor).toFixed(2).replace('.',',');
    return `<div class="hist-item">
      <div class="hi-left">
        <div class="hi-tipo">${c.categoria}</div>
        <div class="hi-names">${escHtml(c.descricao)}</div>
        <div class="hi-det">📅 ${c.data} · ${c.hora}</div>
      </div>
      <div class="hi-right">
        <div class="hi-valor" style="color:var(--red)">R$ ${v}</div>
      </div>
    </div>`;
  }).join('');
}
