/* MOVI KIDS — Meta operadores (20 loc/turno · R$100/dia) */

let _metaLastBonus = null;
let _metaRefreshBusy = false;

/** Meta 20 loc/turno · R$100 só se **21+** loc (acima da meta). */
const MK_META_CFG = {
  3: {
    nome: 'Raykelly',
    ativo: true,
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
  },
  4: {
    nome: 'Atendente 2',
    ativo: false,
    meta: 20,
    bonus: 100,
    inicio: '',
    escala: {
      0: [13, 21],
      1: null,
      2: [14, 22],
      3: null,
      4: [14, 22],
      5: [14, 22],
      6: [12, 22]
    }
  }
};

function mkMetaCfgAtiva_(opId) {
  const cfg = MK_META_CFG[Number(opId)];
  if (!cfg || cfg.ativo === false) return null;
  if (!cfg.inicio) return null;
  return cfg;
}

function mkMetaResolveOperadorId_(hint) {
  if (hint && hint.operadorId && mkMetaCfgAtiva_(hint.operadorId)) {
    return Number(hint.operadorId);
  }
  const params = typeof operadorApiParams_ === 'function' ? operadorApiParams_() : {};
  const srv = typeof mkAuthGetSessaoServidor_ === 'function' ? mkAuthGetSessaoServidor_() : null;
  if (srv && srv.operadorId && mkMetaCfgAtiva_(srv.operadorId)) {
    return Number(srv.operadorId);
  }
  if (params.operadorId && mkMetaCfgAtiva_(params.operadorId)) {
    return Number(params.operadorId);
  }
  return 0;
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
  const cfg = mkMetaCfgAtiva_(opId);
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
      metaOk: n >= cfg.meta,
      atingiu: n > cfg.meta,
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
  } else if (h.metaOk || (n >= meta && !h.atingiu)) {
    val.textContent = n + '/' + meta;
    val.style.fontSize = '';
    tile.classList.add('is-meta-warn');
  } else {
    val.textContent = n + '/' + meta;
    val.style.fontSize = '';
    if (h.emTurno) tile.classList.add('is-meta-warn');
  }

  const diasBonus = Number(mes.diasComMeta) || 0;
  const bonus = Number(mes.bonusEstimado) || diasBonus * (Number(d.bonus) || 100);
  let subTxt;
  if (d.fonte === 'local') {
    subTxt = 'Turno ' + (h.shiftLabel || '') + ' · bônus a partir da ' + (meta + 1) + 'ª loc';
  } else {
    subTxt = diasBonus + (diasBonus === 1 ? ' dia' : ' dias') + ' com bônus no mês';
    if (bonus > 0) subTxt += ' · R$ ' + bonus.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    if (!h.folga && h.shiftLabel && h.shiftLabel !== 'folga') {
      subTxt = 'Turno ' + h.shiftLabel + ' · ' + subTxt;
    }
  }
  if (!h.folga && n >= meta && !h.atingiu && sub) {
    subTxt = 'Meta ok · falta ' + (meta + 1 - n) + ' loc p/ R$ ' + (Number(d.bonus) || 100);
  }
  if (sub) sub.textContent = subTxt;

  if (h.atingiu && _metaLastBonus === false && typeof toast === 'function') {
    toast('Bônus! ' + n + ' locações — +R$ ' + (Number(d.bonus) || 100) + ' no turno 🎉', 'success', 6000);
  }
  _metaLastBonus = !!h.atingiu;
}

function mkMetaRefreshInstant_() {
  const tile = document.getElementById('stat-meta-tile');
  if (!tile) return;
  const opId = mkMetaResolveOperadorId_(window._mkLastMetaTurno);
  if (!opId || !mkMetaCfgAtiva_(opId)) {
    mkMetaShowTile_(tile, false);
    return;
  }
  const local = mkMetaComputeLocal_(opId);
  if (local) mkMetaRenderKpi_(local);
  else mkMetaShowTile_(tile, false);
}

/** Usa metaTurno do carregarInicio (1 request) ou contagem local imediata. */
function mkMetaApplyFromInicio_(d) {
  const tile = document.getElementById('stat-meta-tile');
  if (d && d.metaTurno && d.metaTurno.configurado !== false) {
    window._mkLastMetaTurno = d.metaTurno;
    mkMetaRenderKpi_(Object.assign({ ok: true }, d.metaTurno));
    return;
  }
  window._mkLastMetaTurno = null;
  const opId = mkMetaResolveOperadorId_();
  if (!opId || !mkMetaCfgAtiva_(opId)) {
    mkMetaShowTile_(tile, false);
    return;
  }
  mkMetaRefreshInstant_();
  mkMetaRefreshMesAsync_();
}

function mkMetaRefresh_() {
  if (window._mkLastMetaTurno && window._mkLastMetaTurno.configurado !== false) {
    mkMetaRenderKpi_(Object.assign({ ok: true }, window._mkLastMetaTurno));
    return;
  }
  mkMetaRefreshInstant_();
  mkMetaRefreshMesAsync_();
}

let _metaMesTimer = null;
function mkMetaRefreshMesAsync_() {
  if (_metaMesTimer) clearTimeout(_metaMesTimer);
  _metaMesTimer = setTimeout(function() { mkMetaRefreshMesFromServer_(); }, 80);
}

async function mkMetaRefreshMesFromServer_() {
  if (_metaRefreshBusy) return;
  const opId = mkMetaResolveOperadorId_(window._mkLastMetaTurno);
  if (!opId || !mkMetaCfgAtiva_(opId)) return;
  _metaRefreshBusy = true;
  try {
    const params = Object.assign(
      { action: 'metaOperadorTurno', operadorId: opId, _t: Date.now() },
      typeof apiParamsComAuth_ === 'function' ? apiParamsComAuth_() : {}
    );
    const d = await api(params, 20000);
    if (d && d.ok && d.configurado !== false) {
      window._mkLastMetaTurno = d;
      mkMetaRenderKpi_(d);
    }
  } catch (e) { /* mantém valor local/inicio */ }
  _metaRefreshBusy = false;
}

window.mkMetaRefresh_ = mkMetaRefresh_;
window.mkMetaRefreshInstant_ = mkMetaRefreshInstant_;
window.mkMetaApplyFromInicio_ = mkMetaApplyFromInicio_;
window.mkMetaRenderKpi_ = mkMetaRenderKpi_;
