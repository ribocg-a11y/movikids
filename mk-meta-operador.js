/* MOVI KIDS — Meta operadores (20 loc/turno · R$100/dia) */

let _metaLastAtingiu = null;
let _metaRefreshBusy = false;

/** id real na planilha OPERADORES_SISTEMA (Raykelly = 3, não 1). */
const MK_META_CFG = {
  3: {
    nome: 'Raykelly',
    meta: 20,
    bonus: 100,
    inicio: '2026-06-16',
    escala: {
      0: [13, 21],
      1: [14, 22],
      2: null,
      3: [14, 22],
      4: null,
      5: [14, 22],
      6: [10, 20]
    }
  }
};

function mkMetaConfiguredIds_() {
  return Object.keys(MK_META_CFG).map(Number).filter((id) => id > 0);
}

function mkMetaResolveOperadorId_() {
  const params = typeof operadorApiParams_ === 'function' ? operadorApiParams_() : {};
  const cfgIds = mkMetaConfiguredIds_();
  if (params.operadorId && MK_META_CFG[Number(params.operadorId)]) {
    return Number(params.operadorId);
  }
  const srv = typeof mkAuthGetSessaoServidor_ === 'function' ? mkAuthGetSessaoServidor_() : null;
  if (srv && srv.operadorId && MK_META_CFG[Number(srv.operadorId)]) {
    return Number(srv.operadorId);
  }
  return cfgIds[0] || 0;
}

function mkMetaShiftLabel_(shift) {
  if (!shift) return 'folga';
  const pad = (n) => String(n).padStart(2, '0');
  return pad(shift[0]) + 'h–' + pad(shift[1]) + 'h';
}

function mkMetaParseHm_(s) {
  const p = String(s || '').trim().split(':');
  if (p.length < 2) return null;
  return (parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0);
}

function mkMetaInShift_(mins, shift) {
  if (!shift || mins == null) return false;
  return mins >= shift[0] * 60 && mins < shift[1] * 60;
}

function mkMetaComputeLocal_(opId) {
  const cfg = MK_META_CFG[Number(opId)];
  if (!cfg) return null;
  const now = new Date();
  const dow = now.getDay();
  const shift = cfg.escala[dow];
  const minsNow = now.getHours() * 60 + now.getMinutes();
  const list = typeof encHojeData !== 'undefined' ? encHojeData : [];
  let n = 0;
  if (shift) {
    list.forEach((e) => {
      const hm = mkMetaParseHm_(e.horaFim || e.horaInicio);
      if (hm != null && mkMetaInShift_(hm, shift)) n++;
    });
  }
  return {
    ok: true,
    configurado: true,
    operador: cfg.nome,
    operadorId: Number(opId),
    meta: cfg.meta,
    bonus: cfg.bonus,
    fonte: 'local',
    hoje: {
      n,
      meta: cfg.meta,
      atingiu: n >= cfg.meta,
      emTurno: mkMetaInShift_(minsNow, shift),
      folga: !shift,
      shiftLabel: mkMetaShiftLabel_(shift)
    },
    mes: { diasComMeta: 0, diasTrabalhados: 0, bonusEstimado: 0 }
  };
}

function mkMetaShowTile_(tile, show) {
  if (!tile) return;
  tile.hidden = !show;
  if (show) tile.removeAttribute('hidden');
}

function mkMetaRenderKpi_(d) {
  const tile = document.getElementById('stat-meta-tile');
  const val = document.getElementById('stat-meta-val');
  const lbl = document.getElementById('stat-meta-lbl');
  const sub = document.getElementById('stat-meta-sub');
  if (!tile || !val) return;

  if (!d || !d.ok || d.configurado === false) {
    mkMetaShowTile_(tile, false);
    return;
  }

  mkMetaShowTile_(tile, true);
  tile.classList.remove('is-meta-ok', 'is-meta-warn', 'is-meta-idle');

  const h = d.hoje || {};
  const mes = d.mes || {};
  const meta = Number(d.meta) || 20;
  const n = Number(h.n) || 0;
  const opId = Number(d.operadorId) || mkMetaResolveOperadorId_();
  const nome = String(d.operador || MK_META_CFG[opId]?.nome || 'Operador').split(' ')[0];

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
  let subTxt;
  if (d.fonte === 'local') {
    subTxt = 'Turno ' + (h.shiftLabel || '') + ' · hoje no balcão';
  } else {
    subTxt = diasMeta + (diasMeta === 1 ? ' dia' : ' dias') + ' com meta no mês';
    if (bonus > 0) subTxt += ' · R$ ' + bonus.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    if (!h.folga && h.shiftLabel && h.shiftLabel !== 'folga') {
      subTxt = 'Turno ' + h.shiftLabel + ' · ' + subTxt;
    }
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
  if (!opId || !MK_META_CFG[opId]) {
    mkMetaShowTile_(tile, false);
    return;
  }
  _metaRefreshBusy = true;
  let rendered = false;
  try {
    const params = Object.assign(
      { action: 'metaOperadorTurno', operadorId: opId, _t: Date.now() },
      typeof apiParamsComAuth_ === 'function' ? apiParamsComAuth_() : {}
    );
    const d = await api(params, 20000);
    if (d && d.ok && d.configurado !== false) {
      mkMetaRenderKpi_(d);
      rendered = true;
    }
  } catch (e) { /* fallback local */ }
  if (!rendered) {
    const local = mkMetaComputeLocal_(opId);
    if (local) mkMetaRenderKpi_(local);
    else mkMetaShowTile_(tile, false);
  }
  _metaRefreshBusy = false;
}

window.mkMetaRefresh_ = mkMetaRefresh_;
window.mkMetaRenderKpi_ = mkMetaRenderKpi_;
