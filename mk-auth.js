/* MOVI KIDS — Login operadores v1.7.30 (supervisor) */
(function () {
  const SESSION_KEY = 'mk_auth_session_v1';
  const LEGACY_OPERADOR_KEY = 'mk_operador_atual_v1';
  const AUTH_ACTIVITY_KEY = 'mk_auth_last_activity';
  const AUTH_IDLE_MS = 60 * 60 * 1000;
  const AUTH_TOUCH_GAS_MS = 3 * 60 * 1000;

  let selectedOp = null;
  let _lastGasTouchAt = 0;
  let operadoresCache = [];
  let sessaoAtivaRemota = null;
  let _loadingOps = false;
  let _authBusy = false;

  function apiCall(params, timeoutMs) {
    const fn = typeof window !== 'undefined' && window.api;
    if (typeof fn !== 'function') {
      throw new Error('Sistema ainda carregando. Atualize a pagina (Ctrl+F5).');
    }
    return fn(params, timeoutMs);
  }

  function getSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function authActivityBaseline_() {
    try {
      const last = Number(localStorage.getItem(AUTH_ACTIVITY_KEY) || 0);
      if (last) return last;
      const s = getSession();
      if (s && s.loggedAt) return Number(s.loggedAt);
    } catch (e) { /* ignore */ }
    return 0;
  }

  function touchAuthActivity_() {
    try { localStorage.setItem(AUTH_ACTIVITY_KEY, String(Date.now())); } catch (e) {}
    touchSessaoOperadorGasDebounced_();
  }
  window.mkAuthTouchActivity_ = touchAuthActivity_;
  window.MK_AUTH_IDLE_MS = AUTH_IDLE_MS;

  function isAuthIdleExpired_() {
    if (!mkAuthIsLoggedIn()) return false;
    try {
      const baseline = authActivityBaseline_();
      if (!baseline) return true;
      return Date.now() - baseline >= AUTH_IDLE_MS;
    } catch (e) {
      return false;
    }
  }

  function mkAuthIdleRemainingMs_() {
    if (!mkAuthIsLoggedIn()) return AUTH_IDLE_MS;
    const baseline = authActivityBaseline_();
    if (!baseline) return 0;
    return Math.max(0, AUTH_IDLE_MS - (Date.now() - baseline));
  }
  window.mkAuthIdleRemainingMs_ = mkAuthIdleRemainingMs_;
  window.mkAuthIsIdleExpired_ = isAuthIdleExpired_;

  async function touchSessaoOperadorGasDebounced_() {
    const s = getSession();
    let opId = (s && s.id && s.id !== 'ADMIN') ? Number(s.id) : 0;
    if (!opId && sessaoAtivaRemota && sessaoAtivaRemota.operadorId) {
      opId = Number(sessaoAtivaRemota.operadorId);
    }
    if (!opId) return;
    const now = Date.now();
    if (now - _lastGasTouchAt < AUTH_TOUCH_GAS_MS) return;
    _lastGasTouchAt = now;
    try {
      await apiCall({ action: 'touchSessaoOperador', operadorId: opId }, 15000);
    } catch (e) { /* offline */ }
  }

  function mkHasLocacaoAbertaNoTablet_() {
    function hasAberta(list) {
      if (!Array.isArray(list)) return false;
      return list.some(s => {
        if (!s) return false;
        const st = String(s.status);
        return st === 'Ativa' || st === 'Pendente';
      });
    }
    try {
      if (typeof window !== 'undefined' && Array.isArray(window.sessions)) {
        return hasAberta(window.sessions);
      }
      const raw = localStorage.getItem('mk_sessions');
      if (!raw) return false;
      return hasAberta(JSON.parse(raw));
    } catch (e) {
      return false;
    }
  }
  window.mkHasLocacaoAbertaNoTablet_ = mkHasLocacaoAbertaNoTablet_;

  window.mkAuthReleaseBalcaoServer_ = async function mkAuthReleaseBalcaoServer_(opts) {
    opts = opts || {};
    const s = getSession();
    const pinParams = typeof mkAuthAdminPinParams_ === 'function' ? mkAuthAdminPinParams_() : { adminPin: '1416' };
    const srv = sessaoAtivaRemota;
    const preferAdmin = !!(opts.preferAdmin || opts.inatividade || window.isAdmin ||
      (s && s.role === 'admin') || (srv && srv.nome));

    if (!preferAdmin && s && s.id && s.id !== 'ADMIN' && s.role !== 'admin') {
      try {
        const d = await apiCall(Object.assign({
          action: 'liberarSessaoOperador',
          operadorId: s.id,
          _t: Date.now()
        }, pinParams), 20000);
        if (d && d.ok) {
          sessaoAtivaRemota = d.sessaoAtiva || null;
          mkAuthSyncSessaoBalcaoUI_(sessaoAtivaRemota);
          return true;
        }
      } catch (e) { /* offline */ }
    }

    if (preferAdmin || (srv && srv.nome)) {
      try {
        const d = await apiCall(Object.assign({
          action: 'liberarSessaoOperadorAdmin',
          _t: Date.now()
        }, pinParams), 20000);
        if (d && d.ok) {
          sessaoAtivaRemota = d.sessaoAtiva || null;
          mkAuthSyncSessaoBalcaoUI_(sessaoAtivaRemota);
          return true;
        }
      } catch (e) { /* offline */ }
    }
    return false;
  };

  function setSession(s) {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
      if (s && s.nome) localStorage.setItem(LEGACY_OPERADOR_KEY, s.nome);
      touchAuthActivity_();
      if (typeof window.mkPersistAuthSession === 'function') window.mkPersistAuthSession();
    } catch (e) {}
  }

  function clearSession() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(LEGACY_OPERADOR_KEY);
      localStorage.removeItem(AUTH_ACTIVITY_KEY);
      localStorage.removeItem('mk_auth_session_persist_v1');
      localStorage.removeItem('mk_auth_session_persist_at');
      localStorage.removeItem('mk_admin_ui_persist');
    } catch (e) {}
  }

  window.mkAuthGetSession = getSession;
  window.mkAuthIsAdmin = () => {
    const s = getSession();
    return !!(s && s.role === 'admin');
  };
  window.mkAuthIsSupervisor = () => {
    const s = getSession();
    return !!(s && s.role === 'supervisor');
  };
  window.mkAuthIsSupervisorOrAdmin_ = () => mkAuthIsAdmin() || mkAuthIsSupervisor();
  /** ADM pode encerrar/fechar alerta sem SMS de extra (emergencia operacional). */
  window.mkAdminIgnoraSmsObrigatorio_ = () => {
    if (mkAuthIsAdmin()) return true;
    try {
      const leg = sessionStorage.getItem('mk_auth_session');
      const s = leg ? JSON.parse(leg) : null;
      if (s && s.role === 'admin') return true;
    } catch (e) {}
    return !!(typeof window !== 'undefined' && window.isAdmin);
  };
  window.mkAuthIsLoggedIn = () => !!getSession();

  window.operadorAtual_ = function operadorAtual_() {
    const s = getSession();
    return s && s.nome ? String(s.nome).trim() : '';
  };

  window.operadorApiParams_ = function operadorApiParams_() {
    const s = getSession();
    if (!s) return {};
    const out = { operador: s.nome };
    if (s.id && s.id !== 'ADMIN') out.operadorId = s.id;
    if (s.role) out.authRole = s.role;
    return out;
  };

  function isSessaoBloqueadaPara_(operadorId) {
    if (!sessaoAtivaRemota || !operadorId) return false;
    return Number(sessaoAtivaRemota.operadorId) !== Number(operadorId);
  }

  function msgOperadorJaLogado_(nome) {
    const n = String(nome || 'outro operador').trim();
    return 'O operador ' + n + ' ja esta logado no sistema. So o administrador pode entrar enquanto isso.';
  }

  function handleSessaoOcupada_(d, errId) {
    if (d && d.sessaoAtiva) sessaoAtivaRemota = d.sessaoAtiva;
    if (selectedOp && sessaoAtivaRemota && Number(selectedOp.id) === Number(sessaoAtivaRemota.operadorId)) {
      updateSessaoLockUI_();
      return;
    }
    const nome = (d && d.sessaoAtiva && d.sessaoAtiva.nome) ||
      (d && d.erro && d.erro.replace(/.*operador\s+/i, '').split(' ja')[0]) || 'outro operador';
    const msg = msgOperadorJaLogado_(nome);
    showErr(errId || 'mk-login-err', msg);
    updateSessaoLockUI_();
    if (typeof alert === 'function') alert(msg);
  }

  function updateSessaoLockUI_() {
    const el = document.getElementById('mk-sessao-lock');
    const btn = document.getElementById('mk-btn-proceed');
    if (!sessaoAtivaRemota) {
      if (el) { el.style.display = 'none'; el.textContent = ''; }
      if (btn && selectedOp) btn.disabled = false;
      return;
    }
    const mesmoOperador = selectedOp && Number(selectedOp.id) === Number(sessaoAtivaRemota.operadorId);
    if (el) {
      el.style.display = 'block';
      if (mesmoOperador) {
        el.style.background = 'var(--blue-lt)';
        el.style.color = 'var(--blue-dk)';
        el.style.borderColor = 'var(--blue)';
        el.textContent = sessaoAtivaRemota.nome + ' pode entrar de novo (sessao sera renovada).';
      } else {
        el.style.background = '';
        el.style.color = '';
        el.style.borderColor = '';
        el.textContent = msgOperadorJaLogado_(sessaoAtivaRemota.nome);
      }
    }
    const bloqueia = !selectedOp || isSessaoBloqueadaPara_(selectedOp.id);
    if (btn) btn.disabled = bloqueia;
  }

  function updateOperadoresSessaoBanner_(sessao) {
    document.querySelectorAll('.mk-ops-sessao-banner').forEach(el => {
      if (!sessao || !sessao.nome) {
        el.style.display = 'none';
        el.textContent = '';
        return;
      }
      el.style.display = 'block';
      el.style.background = '';
      el.style.color = '';
      el.style.borderColor = '';
      el.textContent = 'Sessão ativa no balcão: ' + sessao.nome + '. Use o botão abaixo para liberar se precisar.';
    });
  }

  /** Atualiza banner, login lock e rodapé (sb-sessao) de uma vez. */
  function mkAuthSyncSessaoBalcaoUI_(sessao) {
    sessaoAtivaRemota = sessao && sessao.nome ? sessao : null;
    updateSessaoLockUI_();
    updateOperadoresSessaoBanner_(sessaoAtivaRemota);
    if (typeof atualizarOperadorUI_ === 'function') {
      atualizarOperadorUI_(sessaoAtivaRemota);
    }
  }

  function applySessaoAtivaFromApi_(d) {
    mkAuthSyncSessaoBalcaoUI_((d && d.sessaoAtiva) ? d.sessaoAtiva : null);
  }

  window.mkAuthGetSessaoServidor_ = function mkAuthGetSessaoServidor_() {
    return sessaoAtivaRemota;
  };

  let _turnoPollBusy = false;
  let _reconcileBusy = false;

  /** Operador local sem sessão correspondente no GAS = acesso fantasma (comum em PWA após liberar no servidor). */
  async function mkAuthReconcileSessaoFantasma_(d) {
    if (_reconcileBusy) return false;
    const s = getSession();
    if (!s || !s.nome) return false;
    if (s.role === 'admin' || s.id === 'ADMIN' || mkAuthIsAdmin()) return false;
    if (!d || !d.ok) return false;

    const srv = d.sessaoAtiva;
    const localId = Number(s.id);
    const srvId = srv && srv.operadorId ? Number(srv.operadorId) : 0;
    const fantasma = !srvId || srvId !== localId;
    if (!fantasma) return false;

    _reconcileBusy = true;
    try {
      await trocarOperador('fantasma');
      return true;
    } finally {
      _reconcileBusy = false;
    }
  }
  window.mkAuthReconcileSessaoFantasma_ = mkAuthReconcileSessaoFantasma_;

  window.mkAuthRefreshSessaoTurno_ = async function mkAuthRefreshSessaoTurno_() {
    if (!mkAuthIsLoggedIn() || _turnoPollBusy) return;
    _turnoPollBusy = true;
    try {
      const d = await apiCall({ action: 'listarOperadoresLogin' }, 20000);
      if (d && d.ok) {
        const kicked = await mkAuthReconcileSessaoFantasma_(d);
        if (!kicked) applySessaoAtivaFromApi_(d);
      }
    } catch (e) { /* offline */ }
    finally { _turnoPollBusy = false; }
  };

  window.trocarOperador = async function trocarOperador(motivo) {
    const liberarInatividade = motivo === 'inatividade' || motivo === 'fantasma';
    try {
      await mkAuthReleaseBalcaoServer_({
        inatividade: liberarInatividade,
        preferAdmin: liberarInatividade || !!window.isAdmin
      });
    } catch (e) { /* offline */ }

    if (window.isAdmin && typeof adminTeardownUI_ === 'function') adminTeardownUI_();
    else if (window.isAdmin && typeof adminLogout === 'function') adminLogout();

    const s = getSession();
    if (s && s.role === 'admin' && typeof mkAuthExitAdmin_ === 'function') mkAuthExitAdmin_();
    sessaoAtivaRemota = null;
    clearSession();
    selectedOp = null;
    if (typeof mobMenuClose_ === 'function') mobMenuClose_();
    showGate(true);
    hideApp();
    showStep('mk-step-select');
    try { await loadOperadores(); } catch (e) { /* ignore */ }
    const msg = motivo === 'inatividade'
      ? 'Sessão encerrada: 1 hora sem atividade. Faça login novamente.'
      : motivo === 'fantasma'
        ? 'Turno neste aparelho não confere com o servidor. Faça login de novo.'
        : 'Sessão encerrada. Faça login novamente.';
    toast(msg, 'warning');
  };

  let _authIdleBusy = false;
  async function checkAuthIdle_() {
    if (!mkAuthIsLoggedIn() || _authIdleBusy) return;
    if (!isAuthIdleExpired_()) return;
    if (mkHasLocacaoAbertaNoTablet_()) return;
    _authIdleBusy = true;
    try {
      await trocarOperador('inatividade');
    } finally {
      _authIdleBusy = false;
    }
  }

  function initAuthIdleWatch_() {
    if (window._mkAuthIdleWired) return;
    window._mkAuthIdleWired = true;
    ['click', 'keydown', 'touchstart', 'scroll'].forEach(ev => {
      document.addEventListener(ev, () => {
        if (mkAuthIsLoggedIn()) touchAuthActivity_();
      }, { passive: true });
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkAuthIdle_();
        mkAuthRefreshSessaoTurno_();
        if (typeof verificarNovaVersao === 'function') verificarNovaVersao();
      }
    });
    setInterval(checkAuthIdle_, 60000);
  }

  function hideApp() {
    const app = document.getElementById('app');
    const gate = document.getElementById('mk-auth-gate');
    if (app) app.style.display = 'none';
    if (gate) gate.style.display = 'flex';
  }

  let _turnoPollInterval = null;
  function startTurnoPoll_() {
    if (_turnoPollInterval) return;
    _turnoPollInterval = setInterval(() => {
      if (mkAuthIsLoggedIn()) mkAuthRefreshSessaoTurno_();
    }, 60000);
  }

  function showApp() {
    const app = document.getElementById('app');
    const gate = document.getElementById('mk-auth-gate');
    if (gate) gate.style.display = 'none';
    if (app) app.style.display = '';
    if (typeof atualizarOperadorUI_ === 'function') atualizarOperadorUI_();
    mkAuthRefreshSessaoTurno_();
    startTurnoPoll_();
    applyRoleNav_();
  }

  function applyRoleNav_() {
    const admin = mkAuthIsAdmin() || !!(typeof window !== 'undefined' && window.isAdmin);
    const supervisor = mkAuthIsSupervisor();
    const sbGer = document.getElementById('sb-gerenciar-btn');
    if (sbGer) sbGer.style.display = (admin || supervisor) ? 'none' : '';
    if (admin && typeof showAdminSidebar === 'function') showAdminSidebar();
    else if (supervisor && typeof showSupervisorSidebar === 'function') showSupervisorSidebar();
    else if (typeof hideAdminSidebar === 'function') hideAdminSidebar();
  }

  /** Sai do modo administrador: perfil ADM volta ao login; operador+PIN admin so fecha o painel ADM. */
  window.mkAuthExitAdmin_ = function mkAuthExitAdmin_() {
    const s = getSession();
    if (s && s.role === 'admin') {
      clearSession();
      selectedOp = null;
      sessaoAtivaRemota = null;
      showGate(true);
      hideApp();
      showStep('mk-step-select');
      loadOperadores().catch(() => renderOpList(false));
      if (typeof toast === 'function') {
        toast('Sessão administrativa encerrada. Escolha operador ou admin.', 'warning');
      }
    }
    applyRoleNav_();
  };
  window.applyRoleNav_ = applyRoleNav_;

  function showStep(id) {
    document.querySelectorAll('#mk-auth-gate .mk-auth-step').forEach(el => {
      el.classList.toggle('hidden', el.id !== id);
    });
  }

  function showErr(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    if (msg) {
      el.textContent = msg;
      el.style.display = 'block';
    } else {
      el.textContent = '';
      el.style.display = 'none';
    }
  }

  function buildPinRow(containerId, count, onComplete) {
    const c = document.getElementById(containerId);
    if (!c) return [];
    c.innerHTML = '';
    const inputs = [];
    for (let i = 0; i < count; i++) {
      const inp = document.createElement('input');
      inp.type = 'password';
      inp.inputMode = 'numeric';
      inp.maxLength = 1;
      inp.className = 'mk-pin-box';
      inp.autocomplete = 'off';
      const idx = i;
      inp.addEventListener('input', () => {
        inp.value = inp.value.replace(/\D/g, '').slice(0, 1);
        if (inp.value && idx < count - 1) inputs[idx + 1].focus();
        if (onComplete && inputs.every(x => x.value.length === 1)) {
          clearTimeout(c._mkPinTimer);
          c._mkPinTimer = setTimeout(() => onComplete(), 150);
        }
      });
      inp.addEventListener('keydown', e => {
        if (e.key === 'Backspace' && !inp.value && idx > 0) inputs[idx - 1].focus();
        if (e.key === 'Enter' && onComplete) onComplete();
      });
      c.appendChild(inp);
      inputs.push(inp);
    }
    return inputs;
  }

  let loginPins = [];
  let createPins1 = [];
  let createPins2 = [];
  let adminPins = [];

  function readPins(inputs) {
    return inputs.map(i => i.value).join('');
  }

  function clearPins(inputs) {
    inputs.forEach(i => { i.value = ''; });
    if (inputs[0]) inputs[0].focus();
  }

  function renderOpList(loading) {
    const sel = document.getElementById('mk-op-select');
    const btn = document.getElementById('mk-btn-proceed');
    const hint = document.getElementById('mk-op-pin-hint');
    if (!sel) {
      console.warn('[mk-auth] #mk-op-select ausente — atualize o cache (Ctrl+F5).');
      return;
    }
    if (loading) {
      sel.innerHTML = '<option value="">Carregando operadores...</option>';
      sel.disabled = true;
      if (btn) btn.disabled = true;
      return;
    }
    sel.disabled = false;
    const prev = selectedOp ? String(selectedOp.id) : '';
    sel.innerHTML = '<option value="">Selecione o operador</option>' +
      operadoresCache.map(op =>
        `<option value="${op.id}">${escapeHtml_(op.nome)}</option>`
      ).join('');
    if (prev && operadoresCache.some(o => String(o.id) === prev)) {
      sel.value = prev;
      selectedOp = operadoresCache.find(o => String(o.id) === prev) || null;
    } else {
      sel.value = '';
      selectedOp = null;
    }
    if (!sel._mkWired) {
      sel._mkWired = true;
      sel.addEventListener('change', () => {
        const id = sel.value;
        selectedOp = operadoresCache.find(o => String(o.id) === id) || null;
        if (btn) btn.disabled = !selectedOp || isSessaoBloqueadaPara_(selectedOp.id);
        updateSessaoLockUI_();
        if (hint) {
          if (!selectedOp) {
            hint.style.display = 'none';
            hint.textContent = '';
          } else if (!selectedOp.hasPin) {
            hint.style.display = 'block';
            hint.textContent = 'Primeiro acesso: voce criara um PIN de 4 digitos na proxima etapa.';
          } else {
            hint.style.display = 'block';
            hint.textContent = 'Digite seu PIN na proxima etapa.';
          }
        }
      });
    }
    sel.dispatchEvent(new Event('change'));
    if (btn) btn.disabled = !selectedOp || (selectedOp && isSessaoBloqueadaPara_(selectedOp.id));
    updateSessaoLockUI_();
  }

  function escapeHtml_(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  async function loadOperadores() {
    if (_loadingOps) return;
    _loadingOps = true;
    renderOpList(true);
    showErr('mk-login-err', '');
    try {
      let d = null;
      const pre = typeof window !== 'undefined' && window.__mkLoginOpsPromise;
      if (pre && typeof pre.then === 'function') {
        try { d = await pre; } catch (e) { /* retry below */ }
      }
      const tries = d && d.ok ? 0 : 3;
      for (let i = 0; i < tries; i++) {
        try {
          d = await apiCall({ action: 'listarOperadoresLogin' }, 30000);
          if (d && d.ok) break;
        } catch (e) {
          if (i === tries - 1) throw e;
          await new Promise(r => setTimeout(r, 800 * (i + 1)));
        }
      }
      if (!d || !d.ok) throw new Error((d && d.erro) || 'Falha ao carregar operadores');
      operadoresCache = Array.isArray(d.operadores) ? d.operadores : [];
      applySessaoAtivaFromApi_(d);
      renderOpList(false);
      if (!operadoresCache.length) {
        showErr('mk-login-err', 'Nenhum operador ativo. Cadastre em Administração > Operadores.');
      }
      return d;
    } finally {
      _loadingOps = false;
    }
  }

  async function onProceed() {
    if (!selectedOp) return;
    if (isSessaoBloqueadaPara_(selectedOp.id)) {
      handleSessaoOcupada_({ sessaoAtiva: sessaoAtivaRemota }, 'mk-login-err');
      return;
    }
    showErr('mk-login-err', '');
    showErr('mk-create-err', '');
    try {
      const d = await apiCall({ action: 'verificarOperadorLogin', operadorId: selectedOp.id });
      if (!d.ok) {
        if (d.code === 409 || (d.erro && d.erro.indexOf('ja esta logado') >= 0)) {
          handleSessaoOcupada_(d, 'mk-login-err');
          return;
        }
        showErr('mk-login-err', d.erro || 'Erro');
        return;
      }
      applySessaoAtivaFromApi_(d);
      const op = d.operador || selectedOp;
      selectedOp = op;
      if (op.hasPin) {
        document.getElementById('mk-login-name').textContent = op.nome;
        showErr('mk-login-pin-err', '');
        loginPins = buildPinRow('mk-login-pin', 4, () => onLoginPin());
        clearPins(loginPins);
        showStep('mk-step-login-pin');
      } else {
        document.getElementById('mk-create-name').textContent = op.nome;
        clearPins(createPins1);
        clearPins(createPins2);
        showStep('mk-step-create-pin');
      }
    } catch (e) {
      showErr('mk-login-err', e.message || 'Sem conexão');
    }
  }

  async function onSavePin() {
    const pin = readPins(createPins1);
    const pin2 = readPins(createPins2);
    if (pin.length !== 4 || pin2.length !== 4) {
      showErr('mk-create-err', 'Digite 4 numeros em ambos os campos');
      return;
    }
    try {
      const d = await apiCall({
        action: 'definirPinOperador',
        operadorId: selectedOp.id,
        pin,
        pinConfirmar: pin2
      });
      if (!d.ok) {
        if (d.code === 409 || (d.erro && d.erro.indexOf('ja esta logado') >= 0)) {
          handleSessaoOcupada_(d, 'mk-create-err');
          clearPins(createPins1);
          clearPins(createPins2);
          return;
        }
        showErr('mk-create-err', d.erro || 'Erro');
        clearPins(createPins1);
        clearPins(createPins2);
        return;
      }
      applySessaoAtivaFromApi_(d);
      await finishLogin_(d.operador, d.role || 'operador', d);
    } catch (e) {
      showErr('mk-create-err', e.message || 'Sem conexão');
    }
  }

  async function onLoginPin() {
    if (!selectedOp) {
      showErr('mk-login-pin-err', 'Selecione o operador novamente.');
      showStep('mk-step-select');
      return;
    }
    const pin = readPins(loginPins);
    if (pin.length !== 4) {
      showErr('mk-login-pin-err', 'Digite o PIN de 4 digitos');
      return;
    }
    const btn = document.getElementById('mk-btn-do-login');
    if (btn) { btn.disabled = true; btn.textContent = 'Entrando...'; }
    showErr('mk-login-pin-err', '');
    try {
      const d = await apiCall({ action: 'loginOperador', operadorId: selectedOp.id, pin });
      if (!d.ok) {
        if (d.code === 409 || (d.erro && d.erro.indexOf('ja esta logado') >= 0)) {
          handleSessaoOcupada_(d, 'mk-login-pin-err');
          clearPins(loginPins);
          return;
        }
        showErr('mk-login-pin-err', d.erro || 'PIN incorreto');
        clearPins(loginPins);
        return;
      }
      applySessaoAtivaFromApi_(d);
      await finishLogin_(d.operador, d.role || 'operador', d);
    } catch (e) {
      showErr('mk-login-pin-err', e.message || 'Sem conexão');
      clearPins(loginPins);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Entrar'; }
    }
  }

  async function onAdminLogin() {
    if (_authBusy) return;
    const pin = readPins(adminPins);
    if (pin.length !== 4) {
      showErr('mk-admin-err', 'Digite os 4 numeros do PIN administrativo (1416).');
      return;
    }
    const btn = document.getElementById('mk-btn-admin-login');
    if (btn) { btn.disabled = true; btn.textContent = 'Entrando...'; }
    showErr('mk-admin-err', '');
    _authBusy = true;
    try {
      const d = await apiCall({ action: 'loginAdmin', adminPin: pin });
      if (!d.ok) {
        showErr('mk-admin-err', d.erro || 'PIN administrativo incorreto');
        clearPins(adminPins);
        return;
      }
      applySessaoAtivaFromApi_(d);
      await finishLogin_(d.operador, 'admin', d);
    } catch (e) {
      showErr('mk-admin-err', e.message || 'Sem conexão com o servidor');
      clearPins(adminPins);
    } finally {
      _authBusy = false;
      if (btn) { btn.disabled = false; btn.textContent = 'Entrar'; }
    }
  }

  async function finishLogin_(operador, role, sessaoExtra) {
    const isAdminRole = role === 'admin';
    const srvAt = sessaoExtra && sessaoExtra.sessaoAtiva ? sessaoExtra.sessaoAtiva : null;
    const loggedAt = (isAdminRole ? Date.now() : (srvAt && srvAt.loggedAt) || Date.now());
    setSession({
      id: operador.id,
      nome: operador.nome,
      role: role || 'operador',
      loggedAt: loggedAt
    });
    const splash = document.getElementById('splash');
    if (splash) {
      splash.classList.add('hide');
      splash.classList.add('gone');
    }
    showGate(false);
    const app = document.getElementById('app');
    if (app) app.style.display = 'flex';
    const gate = document.getElementById('mk-auth-gate');
    if (gate) gate.style.display = 'none';

    if (isAdminRole && typeof adminLogin === 'function') {
      adminLogin();
      if (typeof mkAuthRefreshSessaoTurno_ === 'function') {
        try { await mkAuthRefreshSessaoTurno_(); } catch (e) { /* offline */ }
      }
    } else {
      showApp();
      if (typeof showPage === 'function') showPage('home');
      if (typeof atualizarOperadorUI_ === 'function') atualizarOperadorUI_();
    }

    if (!window._mkAppInited && typeof init === 'function') {
      window._mkAppInited = true;
      init().catch(e => {
        console.error('[mk-auth] init apos login:', e);
        toast('Login ok. Sincronizando em segundo plano...', 'warning');
      });
    } else if (typeof syncController === 'function') {
      syncController(true, 0).catch(() => {});
    }

    toast('Bem-vindo, ' + operador.nome, 'success');
  }

  function showGate(show) {
    const gate = document.getElementById('mk-auth-gate');
    if (!gate) return;
    gate.style.display = show === false ? 'none' : 'flex';
  }

  function wireEvents() {
    if (window._mkAuthEventsWired) return;
    window._mkAuthEventsWired = true;
    document.getElementById('mk-btn-proceed')?.addEventListener('click', onProceed);
    document.getElementById('mk-btn-save-pin')?.addEventListener('click', onSavePin);
    document.getElementById('mk-btn-do-login')?.addEventListener('click', onLoginPin);
    document.getElementById('mk-btn-admin-login')?.addEventListener('click', onAdminLogin);
    document.getElementById('mk-btn-admin-entry')?.addEventListener('click', () => {
      showErr('mk-admin-err', '');
      showStep('mk-step-admin');
      adminPins = buildPinRow('mk-admin-pin', 4, () => onAdminLogin());
      clearPins(adminPins);
      if (adminPins[0]) adminPins[0].focus();
    });
    document.getElementById('mk-btn-back-create')?.addEventListener('click', () => showStep('mk-step-select'));
    document.getElementById('mk-btn-back-login')?.addEventListener('click', () => {
      selectedOp = null;
      showStep('mk-step-select');
      renderOpList();
    });
    document.getElementById('mk-btn-back-admin')?.addEventListener('click', () => showStep('mk-step-select'));
    document.querySelectorAll('.mk-liberar-sessao-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (typeof mkAuthLiberarSessaoOperadorAdmin_ === 'function') mkAuthLiberarSessaoOperadorAdmin_();
      });
    });
  }

  window.mkAuthBoot = async function mkAuthBoot() {
    if (!window.__mkLoginOpsPromise && typeof window.api === 'function') {
      window.__mkLoginOpsPromise = apiCall({ action: 'listarOperadoresLogin' }, 30000);
    }
    if (typeof window.mkRestoreAuthSession === 'function') window.mkRestoreAuthSession();
    loginPins = buildPinRow('mk-login-pin', 4, () => onLoginPin());
    createPins1 = buildPinRow('mk-create-pin-1', 4);
    createPins2 = buildPinRow('mk-create-pin-2', 4);
    adminPins = buildPinRow('mk-admin-pin', 4, () => onAdminLogin());
    wireEvents();

    const splash = document.getElementById('splash');
    initAuthIdleWatch_();

    const existing = getSession();
    if (existing && existing.nome) {
      const idleExpired = isAuthIdleExpired_();
      const locAberta = mkHasLocacaoAbertaNoTablet_();
      if (idleExpired && !locAberta) {
        try {
          await mkAuthReleaseBalcaoServer_({ inatividade: true, preferAdmin: true });
        } catch (e) { /* offline */ }
        clearSession();
        hideApp();
        showGate(true);
        showStep('mk-step-select');
        try { await loadOperadores(); } catch (e) { renderOpList(false); }
        toast('Sessão expirada (1h sem uso). Faça login novamente.', 'warning');
        return;
      }
      let bootOps = null;
      try {
        bootOps = await (window.__mkLoginOpsPromise || apiCall({ action: 'listarOperadoresLogin' }, 30000));
      } catch (e) { /* offline */ }
      if (bootOps && bootOps.ok && await mkAuthReconcileSessaoFantasma_(bootOps)) return;
      if (bootOps && bootOps.ok) applySessaoAtivaFromApi_(bootOps);
      if (!idleExpired) touchAuthActivity_();
      if (splash) {
        splash.classList.add('hide');
        setTimeout(() => splash.classList.add('gone'), 550);
      }
      showGate(false);
      const app = document.getElementById('app');
      if (app) app.style.display = 'flex';
      if (existing.role === 'admin' && typeof adminLogin === 'function') {
        adminLogin();
      } else {
        showApp();
        applyRoleNav_();
        if (typeof showPage === 'function') showPage('home');
        try {
          if (localStorage.getItem('mk_admin_ui_persist') === '1' && typeof adminLogin === 'function') {
            adminLogin();
          }
        } catch (e) { /* ignore */ }
      }
      if (typeof atualizarOperadorUI_ === 'function') atualizarOperadorUI_();
      if (typeof init === 'function') {
        window._mkAppInited = true;
        init().catch(e => console.error('[mk-auth] init apos restore:', e));
      }
      return;
    }

    hideApp();
    showGate(true);
    if (splash) {
      splash.classList.add('hide');
      setTimeout(() => splash.classList.add('gone'), 550);
    }
    showStep('mk-step-select');
    try {
      await loadOperadores();
    } catch (e) {
      renderOpList(false);
      showErr('mk-login-err', (e.message || 'Erro') + ' — confira conexão e GAS v1.5.32 no mesmo deploy.');
    }
  };

  window.mkAuthAdminPinParams_ = function () {
    const p = { adminPin: '1416' };
    if (mkAuthIsAdmin()) p.authRole = 'admin';
    return p;
  };

  function mkAuthShowLiberarStatus_(ok, msg) {
    document.querySelectorAll('.mk-ops-sessao-banner').forEach(el => {
      el.style.display = 'block';
      el.style.background = ok ? '#E8F5E9' : '#FFEBEE';
      el.style.color = ok ? '#1B5E20' : '#B71C1C';
      el.style.borderColor = ok ? '#A5D6A7' : '#FFCDD2';
      el.textContent = msg;
    });
  }

  window.mkAuthLiberarSessaoOperadorAdmin_ = async function () {
    const btns = document.querySelectorAll('.mk-liberar-sessao-btn');
    const labels = [];
    btns.forEach(btn => {
      labels.push(btn.textContent);
      btn.disabled = true;
      btn.textContent = 'Liberando...';
    });
    try {
      const pinParams = typeof mkAuthAdminPinParams_ === 'function' ? mkAuthAdminPinParams_() : { adminPin: '1416' };
      const d = await apiCall(Object.assign({
        action: 'liberarSessaoOperadorAdmin',
        _t: Date.now()
      }, pinParams), 30000);
      if (!d || !d.ok) {
        const msg = (d && d.erro) || 'Nao foi possivel liberar. Confirme conexao e GAS publicado.';
        mkAuthShowLiberarStatus_(false, 'Falha: ' + msg);
        toast(msg, 'error');
        alert(msg);
        return;
      }
      const srvLivre = !d.sessaoAtiva;
      mkAuthSyncSessaoBalcaoUI_(srvLivre ? null : d.sessaoAtiva);
      if (typeof refreshOperadoresAdmin_ === 'function') await refreshOperadoresAdmin_();
      const ainda = sessaoAtivaRemota && sessaoAtivaRemota.nome;
      if (ainda) {
        const aviso = 'Servidor ainda mostra ' + ainda.nome + ' logado(a). Tente de novo ou peca para encerrar turno no tablet.';
        mkAuthShowLiberarStatus_(false, aviso);
        toast(aviso, 'error');
        alert(aviso);
        return;
      }
      mkAuthShowLiberarStatus_(true, d.mensagem || 'Balcao liberado. Nenhum operador logado agora.');
      toast(d.mensagem || 'Sessao do balcao liberada', 'success');
    } catch (e) {
      const msg = (e && e.message) || 'Erro de conexao';
      mkAuthShowLiberarStatus_(false, 'Falha: ' + msg);
      toast(msg, 'error');
      alert('Falha ao liberar sessao: ' + msg);
    } finally {
      btns.forEach((btn, i) => {
        btn.disabled = false;
        btn.textContent = labels[i] || '🔓 Liberar sessão do balcão (operador esqueceu Sair)';
      });
    }
  };

  window.mkOpDeslogarBalcao = async function mkOpDeslogarBalcao(id, nome) {
    fecharMenusOperador_();
    if (!confirm('Deslogar ' + nome + ' do balcao?\n\nLibera a sessao para outro operador entrar.')) return;
    const pinParams = typeof mkAuthAdminPinParams_ === 'function' ? mkAuthAdminPinParams_() : { adminPin: '1416' };
    try {
      let d = await apiCall(Object.assign({
        action: 'liberarSessaoOperador',
        operadorId: id,
        _t: Date.now()
      }, pinParams), 30000);
      if (!d || !d.ok) {
        d = await apiCall(Object.assign({
          action: 'liberarSessaoOperadorAdmin',
          _t: Date.now()
        }, pinParams), 30000);
        if (!d || !d.ok) {
          const msg = (d && d.erro) || 'Erro ao deslogar';
          mkAuthShowLiberarStatus_(false, 'Falha: ' + msg);
          toast(msg, 'error');
          alert(msg);
          return;
        }
      }
      mkAuthSyncSessaoBalcaoUI_(d.sessaoAtiva || null);
      if (typeof refreshOperadoresAdmin_ === 'function') await refreshOperadoresAdmin_();
      if (sessaoAtivaRemota && sessaoAtivaRemota.nome) {
        const aviso = 'Servidor ainda mostra ' + sessaoAtivaRemota.nome + ' logado(a).';
        mkAuthShowLiberarStatus_(false, aviso);
        toast(aviso, 'error');
        return;
      }
      mkAuthShowLiberarStatus_(true, (d.mensagem || nome + ' deslogado(a) do balcao.'));
      toast(d.mensagem || 'Operador deslogado do balcao', 'success');
    } catch (e) {
      const msg = (e && e.message) || 'Erro';
      mkAuthShowLiberarStatus_(false, 'Falha: ' + msg);
      toast(msg, 'error');
    }
  };

  window.cadastrarOperadorAdmin_ = async function cadastrarOperadorAdmin_(nome) {
    const n = String(nome || '').trim();
    if (!n) {
      toast('Informe o nome do operador', 'warning');
      return;
    }
    try {
      const d = await apiCall({
        action: 'cadastrarOperadorSistema',
        nome: n,
        ...mkAuthAdminPinParams_()
      });
      if (!d.ok) {
        toast(d.erro || 'Erro', 'error');
        return;
      }
      toast('Operador cadastrado: ' + d.operador.nome, 'success');
      await refreshOperadoresAdmin_();
    } catch (e) {
      toast('Erro de conexao', 'error');
    }
  };

  function fecharMenusOperador_() {
    document.querySelectorAll('.mk-op-menu.open').forEach(m => m.classList.remove('open'));
  }

  window.mkOpToggleMenu = function mkOpToggleMenu(ev, id) {
    ev.stopPropagation();
    const menu = document.getElementById('mk-op-menu-' + id);
    if (!menu) return;
    const abrir = !menu.classList.contains('open');
    fecharMenusOperador_();
    if (abrir) menu.classList.add('open');
  };

  document.addEventListener('click', () => fecharMenusOperador_());

  async function opAdminApi_(action, extra) {
    return apiCall({ action, ...mkAuthAdminPinParams_(), ...extra });
  }

  window.mkOpSetPerfil = async function mkOpSetPerfil(id, nome, perfilAtual) {
    fecharMenusOperador_();
    const atual = perfilAtual === 'supervisor' ? 'supervisor' : 'operador';
    const novo = prompt(
      'Perfil de ' + nome + ':\n\noperador = balcao padrao\nsupervisor = editar/cancelar + caixa/historico\n\nDigite operador ou supervisor:',
      atual
    );
    if (novo === null) return;
    const limpo = String(novo).trim().toLowerCase();
    if (limpo !== 'operador' && limpo !== 'supervisor') {
      toast('Use operador ou supervisor', 'warning');
      return;
    }
    try {
      const d = await opAdminApi_('definirPerfilOperadorAdmin', { operadorId: id, perfil: limpo });
      if (!d.ok) {
        toast(d.erro || 'Erro', 'error');
        return;
      }
      toast('Perfil de ' + nome + ': ' + limpo, 'success');
      await refreshOperadoresAdmin_();
    } catch (e) {
      toast('Erro de conexao', 'error');
    }
  };

  window.mkOpEditar = async function mkOpEditar(id, nomeAtual) {
    fecharMenusOperador_();
    const nome = prompt('Novo nome do operador:', nomeAtual || '');
    if (nome === null) return;
    const limpo = String(nome).trim();
    if (!limpo) {
      toast('Nome invalido', 'warning');
      return;
    }
    try {
      const d = await opAdminApi_('editarOperadorSistema', { operadorId: id, nome: limpo });
      if (!d.ok) {
        toast(d.erro || 'Erro', 'error');
        return;
      }
      toast('Operador atualizado: ' + d.operador.nome, 'success');
      await refreshOperadoresAdmin_();
    } catch (e) {
      toast('Erro de conexao', 'error');
    }
  };

  window.mkOpResetarPin = async function mkOpResetarPin(id, nome) {
    fecharMenusOperador_();
    if (!confirm('Resetar PIN de ' + nome + '?\n\nNo proximo login sera necessario criar um PIN novo.')) return;
    try {
      const d = await apiCall({
        action: 'resetarPinOperadorAdmin',
        operadorId: id,
        adminPin: '1416'
      });
      if (!d || !d.ok) {
        const msg = (d && d.erro) || 'Acao indisponivel no servidor';
        const hint = msg.indexOf('desconhecida') >= 0
          ? '\n\nO Apps Script precisa ser v1.5.32+ (resetarPinOperadorAdmin). Abra o ping e confira a versao.'
          : '\n\nConfirme PIN admin 1416 e que o GAS foi reimplantado.';
        toast(msg, 'error');
        alert('Nao foi possivel resetar o PIN:\n' + msg + hint);
        return;
      }
      const op = d.operador || {};
      if (op.hasPin) {
        alert('O servidor ainda reporta PIN definido. Abra a planilha, aba OPERADORES_SISTEMA, e apague as colunas pinHash e pinSalt da linha de ' + nome + '.');
      }
      toast((d.mensagem || 'PIN resetado') + ' — badge deve mostrar Sem PIN.', 'success');
      await refreshOperadoresAdmin_();
    } catch (e) {
      const msg = (e && e.message) || 'Erro de conexao';
      toast(msg, 'error');
      alert('Falha ao resetar PIN: ' + msg + '\n\nTeste: https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping');
    }
  };

  window.mkOpExcluir = async function mkOpExcluir(id, nome) {
    fecharMenusOperador_();
    if (!confirm('Excluir operador ' + nome + '?\n\nEle nao podera mais fazer login.')) return;
    try {
      const d = await opAdminApi_('excluirOperadorSistema', { operadorId: id });
      if (!d.ok) {
        toast(d.erro || 'Erro', 'error');
        return;
      }
      toast('Operador removido', 'success');
      await refreshOperadoresAdmin_();
    } catch (e) {
      toast('Erro de conexao', 'error');
    }
  };

  window.refreshOperadoresAdmin_ = async function refreshOperadoresAdmin_() {
    const el = document.getElementById('mk-admin-ops-list');
    if (!el) return;
    try {
      const pinParams = typeof mkAuthAdminPinParams_ === 'function' ? mkAuthAdminPinParams_() : { adminPin: '1416' };
      const d = await apiCall(Object.assign({ action: 'listarOperadoresAdmin', _t: Date.now() }, pinParams), 30000);
      if (!d.ok) {
        el.innerHTML = '<p style="color:var(--red)">' + escapeHtml_(d.erro || 'Erro') + '</p>';
        return;
      }
      applySessaoAtivaFromApi_(d);
      const ops = d.operadores || [];
      const sessaoId = sessaoAtivaRemota ? Number(sessaoAtivaRemota.operadorId) : 0;
      if (!ops.length) {
        el.innerHTML = '<p style="color:var(--txt3)">Nenhum operador cadastrado</p>';
        return;
      }
      el.innerHTML = ops.map(op => {
        const badgeCls = op.hasPin ? 'ok' : 'warn';
        const badgeTxt = op.hasPin ? 'PIN definido' : 'Sem PIN';
        const perfil = (op.perfil === 'supervisor') ? 'Supervisor' : 'Operador';
        const logadoAgora = sessaoId && Number(op.id) === sessaoId;
        const nomeJs = JSON.stringify(op.nome || '');
        return `<div class="mk-op-card" data-id="${op.id}">
          <div class="mk-op-card-main">
            <span class="mk-op-card-name">${escapeHtml_(op.nome)}</span>
            <span class="mk-op-card-badge ${badgeCls}">${badgeTxt}</span>
            <span class="mk-op-card-badge">${perfil}</span>
            ${logadoAgora ? '<span class="mk-op-card-badge ok">Logado no balcao</span>' : ''}
          </div>
          <div class="mk-op-card-actions">
            <button type="button" class="mk-op-menu-btn" aria-label="Acoes" onclick="mkOpToggleMenu(event, ${op.id})">⋮</button>
            <div class="mk-op-menu" id="mk-op-menu-${op.id}">
              ${logadoAgora ? `<button type="button" onclick="event.stopPropagation(); mkOpDeslogarBalcao(${op.id}, ${nomeJs})">🔓 Deslogar do balcao</button>` : ''}
              <button type="button" onclick="event.stopPropagation(); mkOpSetPerfil(${op.id}, ${nomeJs}, ${JSON.stringify(op.perfil || 'operador')})">👤 Perfil</button>
              <button type="button" onclick="event.stopPropagation(); mkOpEditar(${op.id}, ${nomeJs})">✏️ Editar</button>
              <button type="button" onclick="event.stopPropagation(); mkOpResetarPin(${op.id}, ${nomeJs})">🔑 Resetar PIN</button>
              <button type="button" class="danger" onclick="event.stopPropagation(); mkOpExcluir(${op.id}, ${nomeJs})">🗑️ Excluir</button>
            </div>
          </div>
        </div>`;
      }).join('');
    } catch (e) {
      const msg = (e && e.message) || 'Erro de conexao';
      el.innerHTML = '<p style="color:var(--red)">' + escapeHtml_(msg) + '</p>';
      toast('Erro ao listar operadores: ' + msg, 'error');
    }
  };
})();
