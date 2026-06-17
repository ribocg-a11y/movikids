/* MOVI KIDS — Meta operadores (20 loc/turno · R$100/dia) */

let _metaLastAtingiu = null;
let _metaRefreshBusy = false;

function mkMetaResolveOperadorId_() {
  const params = typeof operadorApiParams_ === 'function' ? operadorApiParams_() : {};
  if (params.operadorId && Number(params.operadorId) > 0) return Number(params.operadorId);
  const srv = typeof mkAuthGetSessaoServidor_ === 'function' ? mkAuthGetSessaoServidor_() : null;
  if (srv && srv.operadorId) return Number(srv.operadorId);
  return 1;
}

function mkMetaRenderKpi_(d) {
  const tile = document.getElementById('stat-meta-tile');
  const val = document.getElementById('stat-meta-val');
  const lbl = document.getElementById('stat-meta-lbl');
  const sub = document.getElementById('stat-meta-sub');
  if (!tile || !val) return;

  if (!d || !d.ok || d.configurado === false) {
    tile.hidden = true;
    return;
  }

  tile.hidden = false;
  tile.classList.remove('is-meta-ok', 'is-meta-warn', 'is-meta-idle');

  const h = d.hoje || {};
  const mes = d.mes || {};
  const meta = Number(d.meta) || 20;
  const n = Number(h.n) || 0;
  const nome = String(d.operador || 'Operador').split(' ')[0];

  if (lbl) lbl.textContent = 'Meta · ' + nome;

  if (h.folga) {
    val.textContent = 'Folga';
    val.style.fontSize = '22px';
    tile.classList.add('is-meta-idle');
  } else if (h.atingiu) {
    val.textContent = n + '/' + meta + ' ✓';
    val.style.fontSize = '';
    tile.classList.add('is-meta-ok');
  } else {
    val.textContent = n + '/' + meta;
    val.style.fontSize = '';
    if (h.emTurno) tile.classList.add('is-meta-warn');
  }

  const diasMeta = Number(mes.diasComMeta) || 0;
  const bonus = Number(mes.bonusEstimado) || diasMeta * (Number(d.bonus) || 100);
  let subTxt = diasMeta + (diasMeta === 1 ? ' dia' : ' dias') + ' com meta no mês';
  if (bonus > 0) subTxt += ' · R$ ' + bonus.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (!h.folga && h.shiftLabel && h.shiftLabel !== 'folga') {
    subTxt = 'Turno ' + h.shiftLabel + ' · ' + subTxt;
  }
  if (sub) sub.textContent = subTxt;

  if (h.atingiu && _metaLastAtingiu === false && typeof toast === 'function') {
    toast('Meta batida! +' + (Number(d.bonus) || 100) + ' reais no turno de hoje 🎉', 'success', 6000);
  }
  _metaLastAtingiu = !!h.atingiu;
}

async function mkMetaRefresh_() {
  if (_metaRefreshBusy) return;
  const tile = document.getElementById('stat-meta-tile');
  if (!tile) return;
  const opId = mkMetaResolveOperadorId_();
  if (!opId) {
    tile.hidden = true;
    return;
  }
  _metaRefreshBusy = true;
  try {
    const params = Object.assign(
      { action: 'metaOperadorTurno', operadorId: opId, _t: Date.now() },
      typeof apiParamsComAuth_ === 'function' ? apiParamsComAuth_() : {}
    );
    const d = await api(params, 20000);
    mkMetaRenderKpi_(d);
  } catch (e) {
    if (tile) tile.hidden = true;
  } finally {
    _metaRefreshBusy = false;
  }
}

window.mkMetaRefresh_ = mkMetaRefresh_;
window.mkMetaRenderKpi_ = mkMetaRenderKpi_;
