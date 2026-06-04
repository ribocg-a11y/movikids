/* MOVI KIDS — Login operadores v1.6.73 */
(function () {
  const SESSION_KEY = 'mk_auth_session_v1';
  const LEGACY_OPERADOR_KEY = 'mk_operador_atual_v1';

  let selectedOp = null;
  let operadoresCache = [];

  function getSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setSession(s) {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
      if (s && s.nome) localStorage.setItem(LEGACY_OPERADOR_KEY, s.nome);
    } catch (e) {}
  }

  function clearSession() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(LEGACY_OPERADOR_KEY);
    } catch (e) {}
  }

  window.mkAuthGetSession = getSession;
  window.mkAuthIsAdmin = () => {
    const s = getSession();
    return !!(s && s.role === 'admin');
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

  window.trocarOperador = function trocarOperador() {
    if (typeof adminLogout === 'function' && window.isAdmin) adminLogout();
    clearSession();
    selectedOp = null;
    showGate();
    hideApp();
    toast('Sessao encerrada. Faca login novamente.', 'warning');
  };

  function hideApp() {
    const app = document.getElementById('app');
    const gate = document.getElementById('mk-auth-gate');
    if (app) app.style.display = 'none';
    if (gate) gate.style.display = 'flex';
  }

  function showApp() {
    const app = document.getElementById('app');
    const gate = document.getElementById('mk-auth-gate');
    if (gate) gate.style.display = 'none';
    if (app) app.style.display = '';
    if (typeof atualizarOperadorUI_ === 'function') atualizarOperadorUI_();
    applyRoleNav_();
  }

  function applyRoleNav_() {
    const admin = mkAuthIsAdmin();
    const navAdmin = document.getElementById('nav-admin');
    const sbGer = document.getElementById('sb-gerenciar-btn');
    const sbAdminSec = document.getElementById('sb-admin-section');
    if (navAdmin) navAdmin.style.display = admin ? '' : 'none';
    if (sbGer) sbGer.style.display = admin ? 'none' : '';
    if (sbAdminSec && !admin && typeof hideAdminSidebar === 'function') hideAdminSidebar();
    if (admin && typeof adminLogin === 'function' && !window.isAdmin) adminLogin();
  }

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

  function buildPinRow(containerId, count) {
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
      });
      inp.addEventListener('keydown', e => {
        if (e.key === 'Backspace' && !inp.value && idx > 0) inputs[idx - 1].focus();
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

  function renderOpList() {
    const sel = document.getElementById('mk-op-select');
    const btn = document.getElementById('mk-btn-proceed');
    const hint = document.getElementById('mk-op-pin-hint');
    if (!sel) return;
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
        if (btn) btn.disabled = !selectedOp;
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
    if (btn) btn.disabled = !selectedOp;
  }

  function escapeHtml_(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  async function loadOperadores() {
    const d = await api({ action: 'listarOperadoresLogin' });
    if (!d.ok) throw new Error(d.erro || 'Falha ao carregar operadores');
    operadoresCache = d.operadores || [];
    renderOpList();
    return d;
  }

  async function onProceed() {
    if (!selectedOp) return;
    showErr('mk-login-err', '');
    showErr('mk-create-err', '');
    try {
      const d = await api({ action: 'verificarOperadorLogin', operadorId: selectedOp.id });
      if (!d.ok) {
        showErr('mk-login-err', d.erro || 'Erro');
        return;
      }
      const op = d.operador || selectedOp;
      selectedOp = op;
      if (op.hasPin) {
        document.getElementById('mk-login-name').textContent = op.nome;
        clearPins(loginPins);
        showStep('mk-step-login-pin');
      } else {
        document.getElementById('mk-create-name').textContent = op.nome;
        clearPins(createPins1);
        clearPins(createPins2);
        showStep('mk-step-create-pin');
      }
    } catch (e) {
      showErr('mk-login-err', e.message || 'Sem conexao');
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
      const d = await api({
        action: 'definirPinOperador',
        operadorId: selectedOp.id,
        pin,
        pinConfirmar: pin2
      });
      if (!d.ok) {
        showErr('mk-create-err', d.erro || 'Erro');
        clearPins(createPins1);
        clearPins(createPins2);
        return;
      }
      finishLogin_(d.operador, d.role || 'operador');
    } catch (e) {
      showErr('mk-create-err', e.message || 'Sem conexao');
    }
  }

  async function onLoginPin() {
    const pin = readPins(loginPins);
    if (pin.length !== 4) {
      showErr('mk-login-err', 'Digite o PIN de 4 digitos');
      return;
    }
    try {
      const d = await api({ action: 'loginOperador', operadorId: selectedOp.id, pin });
      if (!d.ok) {
        showErr('mk-login-err', d.erro || 'PIN incorreto');
        clearPins(loginPins);
        return;
      }
      finishLogin_(d.operador, d.role || 'operador');
    } catch (e) {
      showErr('mk-login-err', e.message || 'Sem conexao');
    }
  }

  async function onAdminLogin() {
    const pin = readPins(adminPins);
    if (pin.length !== 4) {
      showErr('mk-admin-err', 'Digite o PIN de 4 digitos');
      return;
    }
    try {
      const d = await api({ action: 'loginAdmin', adminPin: pin });
      if (!d.ok) {
        showErr('mk-admin-err', d.erro || 'PIN incorreto');
        clearPins(adminPins);
        return;
      }
      finishLogin_(d.operador, 'admin');
    } catch (e) {
      showErr('mk-admin-err', e.message || 'Sem conexao');
    }
  }

  function finishLogin_(operador, role) {
    setSession({
      id: operador.id,
      nome: operador.nome,
      role: role || 'operador',
      loggedAt: Date.now()
    });
    showGate(false);
    showApp();
    if (typeof init === 'function' && !window._mkAppInited) {
      window._mkAppInited = true;
      init();
    } else if (typeof atualizarOperadorUI_ === 'function') {
      atualizarOperadorUI_();
    }
    toast('Bem-vindo, ' + operador.nome, 'success');
  }

  function showGate(show) {
    const gate = document.getElementById('mk-auth-gate');
    if (!gate) return;
    gate.style.display = show === false ? 'none' : 'flex';
  }

  function wireEvents() {
    document.getElementById('mk-btn-proceed')?.addEventListener('click', onProceed);
    document.getElementById('mk-btn-save-pin')?.addEventListener('click', onSavePin);
    document.getElementById('mk-btn-do-login')?.addEventListener('click', onLoginPin);
    document.getElementById('mk-btn-admin-login')?.addEventListener('click', onAdminLogin);
    document.getElementById('mk-btn-admin-entry')?.addEventListener('click', () => {
      clearPins(adminPins);
      showErr('mk-admin-err', '');
      showStep('mk-step-admin');
    });
    document.getElementById('mk-btn-back-create')?.addEventListener('click', () => showStep('mk-step-select'));
    document.getElementById('mk-btn-back-login')?.addEventListener('click', () => {
      selectedOp = null;
      showStep('mk-step-select');
      renderOpList();
    });
    document.getElementById('mk-btn-back-admin')?.addEventListener('click', () => showStep('mk-step-select'));
  }

  window.mkAuthBoot = async function mkAuthBoot() {
    loginPins = buildPinRow('mk-login-pin', 4);
    createPins1 = buildPinRow('mk-create-pin-1', 4);
    createPins2 = buildPinRow('mk-create-pin-2', 4);
    adminPins = buildPinRow('mk-admin-pin', 4);
    wireEvents();

    const splash = document.getElementById('splash');
    const existing = getSession();
    if (existing && existing.nome) {
      if (splash) {
        splash.classList.add('hide');
        setTimeout(() => splash.classList.add('gone'), 550);
      }
      showGate(false);
      showApp();
      applyRoleNav_();
      if (typeof init === 'function') {
        window._mkAppInited = true;
        await init();
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
      if (!operadoresCache.length) {
        showErr('mk-login-err', 'Nenhum operador cadastrado. Admin deve cadastrar na area administrativa.');
      }
    } catch (e) {
      showErr('mk-login-err', (e.message || 'Erro') + ' — publique GAS v1.5.32 no mesmo deploy.');
    }
  };

  window.mkAuthAdminPinParams_ = function () {
    return { adminPin: '1416' };
  };

  window.cadastrarOperadorAdmin_ = async function cadastrarOperadorAdmin_(nome) {
    const n = String(nome || '').trim();
    if (!n) {
      toast('Informe o nome do operador', 'warning');
      return;
    }
    try {
      const d = await api({
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

  window.refreshOperadoresAdmin_ = async function refreshOperadoresAdmin_() {
    const el = document.getElementById('mk-admin-ops-list');
    if (!el) return;
    try {
      const d = await api({ action: 'listarOperadoresAdmin', ...mkAuthAdminPinParams_() });
      if (!d.ok) {
        el.innerHTML = '<p style="color:var(--txt3)">' + escapeHtml_(d.erro || 'Erro') + '</p>';
        return;
      }
      el.innerHTML = (d.operadores || []).map(op =>
        `<div class="mk-admin-op-row"><span>${escapeHtml_(op.nome)}</span>
         <span class="mk-op-meta">${op.hasPin ? 'PIN ok' : 'Sem PIN'}</span></div>`
      ).join('') || '<p style="color:var(--txt3)">Nenhum operador</p>';
    } catch (e) {
      el.innerHTML = '<p style="color:var(--txt3)">Erro ao listar</p>';
    }
  };
})();
