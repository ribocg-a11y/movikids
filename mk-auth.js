/* MOVI KIDS — Login operadores v1.6.79 */
(function () {
  const SESSION_KEY = 'mk_auth_session_v1';
  const LEGACY_OPERADOR_KEY = 'mk_operador_atual_v1';

  let selectedOp = null;
  let operadoresCache = [];
  let sessaoAtivaRemota = null;
  let _loadingOps = false;

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
      return;
    }
    const msg = msgOperadorJaLogado_(sessaoAtivaRemota.nome);
    if (el) {
      el.style.display = 'block';
      el.textContent = msg;
    }
    const bloqueia = !selectedOp || isSessaoBloqueadaPara_(selectedOp.id);
    if (btn && bloqueia) btn.disabled = true;
  }

  function applySessaoAtivaFromApi_(d) {
    sessaoAtivaRemota = (d && d.sessaoAtiva) ? d.sessaoAtiva : null;
    updateSessaoLockUI_();
  }

  window.trocarOperador = async function trocarOperador() {
    const s = getSession();
    if (s && s.role !== 'admin' && s.id && s.id !== 'ADMIN') {
      try {
        await apiCall({ action: 'liberarSessaoOperador', operadorId: s.id });
      } catch (e) { /* offline */ }
      sessaoAtivaRemota = null;
    }
    if (typeof adminLogout === 'function' && window.isAdmin) adminLogout();
    clearSession();
    selectedOp = null;
    showGate(true);
    hideApp();
    showStep('mk-step-select');
    try { await loadOperadores(); } catch (e) { /* ignore */ }
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
    if (admin && typeof adminLogin === 'function' && !(typeof isAdmin !== 'undefined' && isAdmin)) adminLogin();
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
          setTimeout(() => onComplete(), 80);
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
        showErr('mk-login-err', 'Nenhum operador ativo. Cadastre em Administracao > Operadores.');
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
      await finishLogin_(d.operador, d.role || 'operador');
    } catch (e) {
      showErr('mk-create-err', e.message || 'Sem conexao');
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
      await finishLogin_(d.operador, d.role || 'operador');
    } catch (e) {
      showErr('mk-login-pin-err', e.message || 'Sem conexao');
      clearPins(loginPins);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Entrar'; }
    }
  }

  async function onAdminLogin() {
    const pin = readPins(adminPins);
    if (pin.length !== 4) {
      showErr('mk-admin-err', 'Digite o PIN de 4 digitos');
      return;
    }
    try {
      const d = await apiCall({ action: 'loginAdmin', adminPin: pin });
      if (!d.ok) {
        showErr('mk-admin-err', d.erro || 'PIN incorreto');
        clearPins(adminPins);
        return;
      }
      await finishLogin_(d.operador, 'admin');
    } catch (e) {
      showErr('mk-admin-err', e.message || 'Sem conexao');
    }
  }

  async function finishLogin_(operador, role) {
    setSession({
      id: operador.id,
      nome: operador.nome,
      role: role || 'operador',
      loggedAt: Date.now()
    });
    showGate(false);
    showApp();
    const splash = document.getElementById('splash');
    if (splash) {
      splash.classList.add('hide');
      splash.classList.add('gone');
    }
    try {
      if (typeof init === 'function' && !window._mkAppInited) {
        window._mkAppInited = true;
        await init();
      } else if (typeof syncController === 'function') {
        await syncController(true, 0);
      }
    } catch (e) {
      console.error('[mk-auth] init apos login:', e);
      toast('Login ok, mas falhou carregar dados. Puxe para atualizar.', 'warning');
    }
    if (typeof atualizarOperadorUI_ === 'function') atualizarOperadorUI_();
    if (role === 'admin' && typeof adminLogin === 'function') {
      adminLogin();
    } else if (typeof showPage === 'function') {
      showPage('home');
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
    loginPins = buildPinRow('mk-login-pin', 4, () => onLoginPin());
    createPins1 = buildPinRow('mk-create-pin-1', 4);
    createPins2 = buildPinRow('mk-create-pin-2', 4);
    adminPins = buildPinRow('mk-admin-pin', 4, () => onAdminLogin());
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
    } catch (e) {
      renderOpList(false);
      showErr('mk-login-err', (e.message || 'Erro') + ' — confira conexao e GAS v1.5.32 no mesmo deploy.');
    }
  };

  window.mkAuthAdminPinParams_ = function () {
    const p = { adminPin: '1416' };
    if (mkAuthIsAdmin()) p.authRole = 'admin';
    return p;
  };

  window.mkAuthLiberarSessaoOperadorAdmin_ = async function () {
    try {
      const d = await apiCall({ action: 'liberarSessaoOperadorAdmin', ...mkAuthAdminPinParams_() });
      if (!d.ok) {
        toast(d.erro || 'Erro', 'error');
        return;
      }
      sessaoAtivaRemota = null;
      updateSessaoLockUI_();
      toast(d.mensagem || 'Sessao liberada', 'success');
      await loadOperadores();
    } catch (e) {
      toast('Erro de conexao', 'error');
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
      const d = await opAdminApi_('resetarPinOperadorAdmin', { operadorId: id });
      if (!d.ok) {
        toast(d.erro || 'Erro ao resetar PIN', 'error');
        alert(d.erro || 'Nao foi possivel resetar o PIN. Confirme que entrou como administrador (PIN 1416).');
        return;
      }
      toast(d.mensagem || 'PIN resetado', 'success');
      await refreshOperadoresAdmin_();
    } catch (e) {
      const msg = (e && e.message) || 'Erro de conexao';
      toast(msg, 'error');
      alert('Falha ao resetar PIN: ' + msg);
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
      const d = await apiCall({ action: 'listarOperadoresAdmin', ...mkAuthAdminPinParams_() });
      if (!d.ok) {
        el.innerHTML = '<p style="color:var(--txt3)">' + escapeHtml_(d.erro || 'Erro') + '</p>';
        return;
      }
      const ops = d.operadores || [];
      if (!ops.length) {
        el.innerHTML = '<p style="color:var(--txt3)">Nenhum operador cadastrado</p>';
        return;
      }
      el.innerHTML = ops.map(op => {
        const badgeCls = op.hasPin ? 'ok' : 'warn';
        const badgeTxt = op.hasPin ? 'PIN definido' : 'Sem PIN';
        const nomeJs = JSON.stringify(op.nome || '');
        return `<div class="mk-op-card" data-id="${op.id}">
          <div class="mk-op-card-main">
            <span class="mk-op-card-name">${escapeHtml_(op.nome)}</span>
            <span class="mk-op-card-badge ${badgeCls}">${badgeTxt}</span>
          </div>
          <div class="mk-op-card-actions">
            <button type="button" class="mk-op-menu-btn" aria-label="Acoes" onclick="mkOpToggleMenu(event, ${op.id})">⋮</button>
            <div class="mk-op-menu" id="mk-op-menu-${op.id}">
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
