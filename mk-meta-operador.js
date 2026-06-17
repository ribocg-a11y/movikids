/* MOVI KIDS — Meta operadores (20 loc/turno · R$100/dia) */

let _metaLastAtingiu = null;
let _metaRefreshBusy = false;

/** Espelha metaOperadorCfg_ no GAS v1.5.93+ (fallback FE se ping menor que 1.5.93). */
const MK_META_CFG = {
  1: {
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

function mkMetaResolveOperadorId_() {
  const params = typeof operadorApiParams_ === 'function' ? operadorApiParams_() : {};
  if (params.operadorId && Number(params.operadorId) > 0) return Number(params.operadorId);
  const srv = typeof mkAuthGetSessaoServidor_ === 'function' ? mkAuthGetSessaoServidor_() : null;
  if (srv && srv.operadorId) return Number(srv.operadorId);
  return 1;
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

/** Conta encerradas hoje no horário do turno (até GAS v1.5.93 ir ao ar). */
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
  const nome = String(d.operador || MK_META_CFG[d.operadorId]?.nome || 'Operador').split(' ')[0];

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
    if (diasMeta === 0) subTxt += ' · histórico do mês após GAS v1.5.93';
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
    tile.hidden = true;
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
  } catch (e) { /* GAS antigo ou offline — fallback abaixo */ }
  if (!rendered) {
    const local = mkMetaComputeLocal_(opId);
    if (local) mkMetaRenderKpi_(local);
    else tile.hidden = true;
  }
  _metaRefreshBusy = false;
}

window.mkMetaRefresh_ = mkMetaRefresh_;
window.mkMetaRenderKpi_ = mkMetaRenderKpi_;
