/* MOVI KIDS — Meta operadores (20 loc/turno · R$100/dia) + hero motivacional */

let _metaLastBonus = null;
let _metaRefreshBusy = false;
let _metaLastN = null;
let _metaCelebrateLevel = null;
let _metaConfettiAnim = false;
let _metaConfettiPieces = [];
let _metaHeroDismissTimer = null;

/** Hero motivacional: reta final (≤5 loc) + celebração; só sessão operador (não admin). */
const MK_META_HERO_FALTAM_MAX = 5;
const MK_META_HERO_DISMISS_MS = 8500;

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

const MK_META_PHRASES_CHASE = [
  '{nome}, reta final! Cada criança conta — você consegue! 💪',
  'Quase lá! Mais {faltam} aventuras e a meta é sua ✨',
  'Você manda! Faltam só {faltam} — foco na reta final 🎯',
  'Cada sorriso na loja te aproxima da meta. Bora! 🚗💛',
  '{nome}, {faltam} locações te separam do R$ {bonus} extra! 🔥'
];

const MK_META_PHRASES_META = [
  'META BATIDA! {nome}, você arrasou hoje! 🏆',
  'Parabéns, {nome}! 20 locações — orgulho Movi Kids! 🎉',
  'Isso aí! Meta do turno conquistada com maestria! ⭐'
];

const MK_META_PHRASES_BONUS = [
  'BÔNUS GARANTIDO! +R$ {bonus} no holerite — sensacional! 🎊',
  '{nome} campeã! Mais uma locação = mais R$ {bonus}! 🌟'
];

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

/** Operador logado no balcão com meta ativa — oculta para admin/supervisor. */
function mkMetaSessaoOperadorAtiva_() {
  if (typeof mkAuthIsAdmin === 'function' && mkAuthIsAdmin()) return 0;
  if (typeof window !== 'undefined' && window.isAdmin) return 0;
  return mkMetaResolveOperadorId_();
}

function mkMetaShouldShowHero_(d) {
  const sessOp = mkMetaSessaoOperadorAtiva_();
  if (!sessOp) return false;
  const dOp = Number(d.operadorId) || mkMetaResolveOperadorId_(d);
  if (dOp !== sessOp) return false;

  const h = d.hoje || {};
  if (h.folga) return false;

  const meta = Number(d.meta) || 20;
  const n = Number(h.n) || 0;
  const faltam = Math.max(0, meta - n);

  if (_metaHeroDismissTimer) return true;

  if (n >= meta) {
    if (_metaLastN !== null && _metaLastN < meta && n >= meta) return true;
    if (_metaLastN !== null && _metaLastN <= meta && n > meta) return true;
    return false;
  }

  return faltam <= MK_META_HERO_FALTAM_MAX && faltam >= 1;
}

function mkMetaScheduleDismiss_() {
  if (_metaHeroDismissTimer) clearTimeout(_metaHeroDismissTimer);
  _metaHeroDismissTimer = setTimeout(function() {
    _metaHeroDismissTimer = null;
    mkMetaHideHero_();
  }, MK_META_HERO_DISMISS_MS);
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
  else tile.setAttribute('aria-hidden', 'true');
}

function mkMetaFirstName_(nome) {
  return String(nome || 'Operador').trim().split(/\s+/)[0];
}

let _metaLastPhraseKey = '';
let _metaCachedPhrase = '';

function mkMetaPickPhrase_(list, vars, forceNew) {
  const key = vars.n + '|' + vars.mode;
  if (!forceNew && key === _metaLastPhraseKey && _metaCachedPhrase) {
    return _metaCachedPhrase;
  }
  let idx = 0;
  try {
    idx = parseInt(sessionStorage.getItem('mk_meta_phrase_i') || '0', 10) || 0;
  } catch (e) { idx = 0; }
  const tpl = list[idx % list.length];
  try {
    sessionStorage.setItem('mk_meta_phrase_i', String((idx + 1) % list.length));
  } catch (e2) { /* ignore */ }
  _metaCachedPhrase = tpl
    .replace(/\{nome\}/g, vars.nome)
    .replace(/\{faltam\}/g, String(vars.faltam))
    .replace(/\{bonus\}/g, String(vars.bonus));
  _metaLastPhraseKey = key;
  return _metaCachedPhrase;
}

function mkMetaResizeConfettiCanvas_() {
  const canvas = document.getElementById('mk-meta-confetti-canvas');
  if (!canvas) return null;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  return canvas;
}

function mkMetaFireConfetti_() {
  const canvas = mkMetaResizeConfettiCanvas_();
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const colors = ['#FFD54F', '#FB8C00', '#29B6F6', '#66BB6A', '#EF5350', '#AB47BC'];
  _metaConfettiPieces = [];
  for (let i = 0; i < 100; i++) {
    _metaConfettiPieces.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 80,
      w: 6 + Math.random() * 6,
      h: 10 + Math.random() * 8,
      vy: 2 + Math.random() * 4,
      vx: -2 + Math.random() * 4,
      rot: Math.random() * 360,
      vr: -6 + Math.random() * 12,
      c: colors[i % colors.length]
    });
  }
  if (_metaConfettiAnim) return;
  _metaConfettiAnim = true;
  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;
    _metaConfettiPieces.forEach((p) => {
      p.y += p.vy;
      p.x += p.vx;
      p.rot += p.vr;
      if (p.y < canvas.height + 40) alive++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (alive > 0) requestAnimationFrame(tick);
    else {
      _metaConfettiAnim = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  tick();
}

function mkMetaSpawnBalloons_() {
  const box = document.getElementById('mk-meta-balloons');
  if (!box) return;
  box.innerHTML = '';
  const emojis = ['🎈', '🎈', '🎈', '🎊', '⭐', '🎉'];
  for (let i = 0; i < 8; i++) {
    const b = document.createElement('span');
    b.className = 'mk-balloon';
    b.textContent = emojis[i % emojis.length];
    b.style.left = (8 + i * 11 + Math.random() * 6) + '%';
    b.style.animationDelay = (i * 0.35) + 's';
    b.style.fontSize = (22 + Math.random() * 14) + 'px';
    box.appendChild(b);
  }
}

function mkMetaCelebrate_(level, d, n, meta, bonusVal, nome) {
  if (_metaCelebrateLevel === level) return;
  _metaCelebrateLevel = level;
  mkMetaSpawnBalloons_();
  mkMetaFireConfetti_();
  mkMetaScheduleDismiss_();
  if (typeof toast === 'function') {
    if (level === 'bonus') {
      toast('Bônus! ' + n + ' locações — +R$ ' + bonusVal + ' no turno 🎉', 'success', 6000);
    } else {
      toast('Meta batida! Parabéns, ' + nome + '! 🏆', 'success', 5000);
    }
  }
}

function mkMetaHideHero_() {
  if (_metaHeroDismissTimer) {
    clearTimeout(_metaHeroDismissTimer);
    _metaHeroDismissTimer = null;
  }
  mkMetaShowTile_(document.getElementById('stat-meta-tile'), false);
  mkMetaShowTile_(document.getElementById('mk-meta-hero-wrap'), false);
}

function mkMetaRenderHero_(d) {
  const hero = document.getElementById('mk-meta-hero-wrap');
  if (!hero || !d || !d.ok || d.configurado === false) {
    mkMetaHideHero_();
    return;
  }

  if (!mkMetaShouldShowHero_(d)) {
    mkMetaHideHero_();
    return;
  }

  mkMetaShowTile_(document.getElementById('stat-meta-tile'), false);
  mkMetaShowTile_(hero, true);

  const h = d.hoje || {};
  const mes = d.mes || {};
  const meta = Number(d.meta) || 20;
  const bonusVal = Number(d.bonus) || 100;
  const n = Number(h.n) || 0;
  const opId = Number(d.operadorId) || mkMetaResolveOperadorId_();
  const nome = mkMetaFirstName_(d.operador || MK_META_CFG[opId]?.nome || 'Operador');
  const faltam = Math.max(0, meta - n);

  const elBadge = document.getElementById('mk-meta-hero-badge');
  const elRatio = document.getElementById('mk-meta-hero-ratio');
  const elNum = document.getElementById('mk-meta-hero-num');
  const elCountLbl = document.getElementById('mk-meta-hero-count-lbl');
  const elPhrase = document.getElementById('mk-meta-hero-phrase');
  const elBar = document.getElementById('mk-meta-hero-bar');
  const elFoot = document.getElementById('mk-meta-hero-foot');
  const elCountWrap = document.getElementById('mk-meta-hero-count');

  hero.classList.remove('is-celebrate');

  if (elBadge) elBadge.textContent = 'Meta · ' + nome;
  if (elRatio) elRatio.textContent = n + '/' + meta;
  if (elBar) elBar.style.width = Math.min(100, (n / meta) * 100) + '%';

  const vars = { nome: nome, faltam: faltam, bonus: bonusVal, n: n, mode: 'folga' };
  const shiftFoot = h.shiftLabel && h.shiftLabel !== 'folga'
    ? 'Turno ' + h.shiftLabel + ' · '
    : '';

  if (h.folga) {
    mkMetaHideHero_();
    _metaLastN = n;
    return;
  }

  if (elNum) elNum.style.fontSize = '';

  if (h.atingiu) {
    hero.classList.add('is-celebrate');
    vars.mode = 'bonus';
    if (elNum) elNum.textContent = n + '/' + meta + '+';
    if (elCountLbl) elCountLbl.innerHTML = 'bônus<br>garantido!';
    if (elPhrase) elPhrase.textContent = mkMetaPickPhrase_(MK_META_PHRASES_BONUS, vars, _metaLastN !== null && n > _metaLastN);
    if (elFoot) {
      elFoot.textContent = '+' + (n - meta) + ' acima da meta · R$ ' + bonusVal + ' creditado no turno';
    }
    if (_metaLastN !== null && n > meta && _metaCelebrateLevel !== 'bonus') {
      mkMetaCelebrate_('bonus', d, n, meta, bonusVal, nome);
    }
  } else if (h.metaOk || n >= meta) {
    hero.classList.add('is-celebrate');
    vars.mode = 'meta';
    if (elNum) elNum.textContent = '✓';
    if (elCountLbl) elCountLbl.innerHTML = 'meta<br>conquistada!';
    if (elPhrase) elPhrase.textContent = mkMetaPickPhrase_(MK_META_PHRASES_META, vars, _metaLastN !== null && n > _metaLastN);
    if (elFoot) {
      elFoot.textContent = 'Parabéns, ' + nome + '! Agora cada loc extra vale R$ ' + bonusVal;
    }
    if (_metaLastN !== null && n >= meta && !h.atingiu && _metaCelebrateLevel !== 'meta' && _metaCelebrateLevel !== 'bonus') {
      mkMetaCelebrate_('meta', d, n, meta, bonusVal, nome);
    }
  } else {
    if (elCountWrap) elCountWrap.style.display = '';
    if (elNum) elNum.textContent = String(faltam);
    if (elCountLbl) {
      elCountLbl.innerHTML = faltam === 1 ? 'locação<br>para a meta' : 'locações<br>para a meta';
    }
    vars.mode = 'chase';
    if (elPhrase) elPhrase.textContent = mkMetaPickPhrase_(MK_META_PHRASES_CHASE, vars, _metaLastN !== null && n > _metaLastN);
    const diasBonus = Number(mes.diasComMeta) || 0;
    const bonusMes = Number(mes.bonusEstimado) || diasBonus * bonusVal;
    let foot = shiftFoot + 'bônus R$ ' + bonusVal + ' na ' + (meta + 1) + 'ª locação';
    if (d.fonte !== 'local' && bonusMes > 0) {
      foot = shiftFoot + diasBonus + (diasBonus === 1 ? ' dia' : ' dias') + ' com bônus no mês · R$ ' + bonusMes.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    if (elFoot) elFoot.textContent = foot;
    if (n >= meta - 1 && n < meta && elFoot) {
      elFoot.textContent = shiftFoot + 'Meta ok · falta ' + (meta + 1 - n) + ' loc p/ R$ ' + bonusVal;
    }
  }

  if (_metaLastN === null) _metaCelebrateLevel = h.atingiu ? 'bonus' : (h.metaOk ? 'meta' : null);
  _metaLastN = n;

  if (h.atingiu && _metaLastBonus === false && typeof toast === 'function') {
    /* legado — hero já celebra */
  }
  _metaLastBonus = !!h.atingiu;
}

function mkMetaRenderKpi_(d) {
  mkMetaRenderHero_(d);
}

function mkMetaRefreshInstant_() {
  const hero = document.getElementById('mk-meta-hero-wrap');
  if (!hero) return;
  const opId = mkMetaSessaoOperadorAtiva_();
  if (!opId || !mkMetaCfgAtiva_(opId)) {
    mkMetaHideHero_();
    return;
  }
  const local = mkMetaComputeLocal_(opId);
  if (local) mkMetaRenderKpi_(local);
  else mkMetaHideHero_();
}

function mkMetaApplyFromInicio_(d) {
  if (d && d.metaTurno && d.metaTurno.configurado !== false) {
    window._mkLastMetaTurno = d.metaTurno;
    mkMetaRenderKpi_(Object.assign({ ok: true }, d.metaTurno));
    return;
  }
  window._mkLastMetaTurno = null;
  const opId = mkMetaSessaoOperadorAtiva_();
  if (!opId || !mkMetaCfgAtiva_(opId)) {
    mkMetaHideHero_();
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
  const opId = mkMetaSessaoOperadorAtiva_() || mkMetaResolveOperadorId_(window._mkLastMetaTurno);
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

if (typeof window !== 'undefined') {
  window.addEventListener('resize', function() {
    if (!_metaConfettiAnim) mkMetaResizeConfettiCanvas_();
  });
}

window.mkMetaRefresh_ = mkMetaRefresh_;
window.mkMetaRefreshInstant_ = mkMetaRefreshInstant_;
window.mkMetaApplyFromInicio_ = mkMetaApplyFromInicio_;
window.mkMetaRenderKpi_ = mkMetaRenderKpi_;
