/* Rodar no console do balcao (v1.7.87) apos login. Retorna array de checks. */
(async function mkTabletProtocolo_() {
  const out = [];
  const push = (id, ok, detail) => out.push({ id, ok, !!ok, detail: String(detail ?? '') });
  const op = Object.assign(
    typeof operadorApiParams_ === 'function' ? operadorApiParams_() : { operador: 'TESTE_CODEX' },
    typeof mkAuthAdminPinParams_ === 'function' ? mkAuthAdminPinParams_() : { adminPin: '1416', authRole: 'admin' }
  );
  const stamp = Date.now();
  const tel = '989' + String(Math.floor(1e7 + Math.random() * 9e7));
  const rows = [];

  async function syncWait() {
    await sincronizarServidor(true);
    await new Promise(r => setTimeout(r, 800));
  }

  function findRow(row) {
    return sessions.find(x => Number(x.rowIndex) === Number(row));
  }

  function remSec(s) {
    return typeof calcRemaining === 'function' ? calcRemaining(s) : null;
  }

  function fmtRem(sec) {
    if (sec == null) return '?';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  try {
    // --- F5 ---
    const salvar = await api({
      action: 'salvarLocacao', tipo: 'Carro', plano: '10min', veiculo: 'Carro 01',
      pagamento: 'PIX', responsavel: 'TESTE TABLET F5', crianca: 'F5_' + stamp, telefone: tel,
      observacao: '[TESTE] protocolo tablet F5'
    }, 35000);
    if (!salvar.ok) { push('F5.salvar', false, salvar.erro || 'fail'); return out; }
    rows.push(salvar.rowIndex);
    await syncWait();
    let s = findRow(salvar.rowIndex);
    if (!s) { push('F5.sync', false, 'sessao ausente'); return out; }
    const remPend = remSec(s);
    push('F5.pendente', remPend === 600, 'rem=' + remPend + ' (' + fmtRem(remPend) + ')');

    await new Promise(r => setTimeout(r, 20000));
    s = findRow(salvar.rowIndex);
    const remWait = remSec(s);
    push('F5.espera20s', remWait === 600, 'rem=' + remWait);

    renderCards();
    const btnBefore = document.querySelector('#card-' + salvar.rowIndex + ' .btn-iniciar');
    const btnHtmlBefore = btnBefore ? btnBefore.innerHTML : '';
    if (typeof iniciarContagemDireto_ === 'function') iniciarContagemDireto_(salvar.rowIndex);
    else await api({ action: 'iniciarTimer', rowIndex: salvar.rowIndex, timestamp: Date.now() }, 35000);
    await new Promise(r => setTimeout(r, 1200));
    const btnAfter = document.querySelector('#card-' + salvar.rowIndex + ' .btn-iniciar');
    const iniciando = (btnAfter && /Iniciando/i.test(btnAfter.innerHTML)) || /iniciad/i.test(btnHtmlBefore + (btnAfter?.innerHTML || ''));
    s = findRow(salvar.rowIndex);
    const remStart = remSec(s);
    push('F5.btn.imediato', iniciando || (s && s.started), btnAfter ? btnAfter.innerHTML : 'sem btn');
    push('F5.iniciar.rem', remStart >= 598 && remStart <= 601, 'rem=' + remStart + ' (' + fmtRem(remStart) + ')');

    // --- F11 prep: mesma locacao ativa ---
    const remBalcao = remStart;
    const portal = await api({ action: 'buscarPortalResponsavel', telefone: tel.replace(/[^0-9]/g, '') }, 35000);
    let remPortal = null;
    if (portal.ok && portal.locacoes && portal.locacoes.length) {
      const loc = portal.locacoes.find(l => Number(l.rowIndex) === Number(salvar.rowIndex)) || portal.locacoes[0];
      const ts = Number(loc.startTimestamp || 0);
      const mins = Number(loc.mins || 10);
      const now = Date.now();
      if (String(loc.status) === 'Pendente' || ts < 1e12) remPortal = mins * 60;
      else remPortal = Math.floor(mins * 60 - (now - ts) / 1000);
    }
    const driftF11 = (remPortal == null) ? 999 : Math.abs(remBalcao - remPortal);
    push('F11.portal.vs.balcao', remPortal != null && driftF11 <= 2, 'balcao=' + remBalcao + ' portal=' + remPortal + ' drift=' + driftF11 + 's');

    // --- F10: localStorage + segunda leitura (simula reload) ---
    saveSessions();
    const cached = JSON.parse(localStorage.getItem('mk_sessions') || '[]');
    const sCache = cached.find(x => Number(x.rowIndex) === Number(salvar.rowIndex));
    const remCache = sCache ? remSec(Object.assign({}, s, sCache)) : null;
    const driftF10 = remCache == null ? 999 : Math.abs(remBalcao - remCache);
    push('F10.cache.vs.live', remCache != null && driftF10 <= 2, 'live=' + remBalcao + ' cache=' + remCache + ' drift=' + driftF10 + 's');

    const sessionsBackup = JSON.stringify(sessions);
    sessions = JSON.parse(cached);
    startTimerLoop();
    const sReload = findRow(salvar.rowIndex);
    const remReload = remSec(sReload);
    const driftReload = remReload == null ? 999 : Math.abs(remBalcao - remReload);
    push('F10.reload.sessions', remReload != null && driftReload <= 2, 'antes=' + remBalcao + ' pos-restore=' + remReload);
    sessions = JSON.parse(sessionsBackup);

    // --- F7 alerta 5 min (timestamp 5m30s atras) ---
    const tel7 = '989' + String(Math.floor(1e7 + Math.random() * 9e7));
    const salvar7 = await api({
      action: 'salvarLocacao', tipo: 'Triciclo', plano: '10min', veiculo: 'Triciclo 01',
      pagamento: 'PIX', responsavel: 'TESTE TABLET F7', crianca: 'F7_5M_' + stamp, telefone: tel7,
      observacao: '[TESTE] alerta 5min'
    }, 35000);
    if (!salvar7.ok) { push('F7.salvar', false, salvar7.erro); }
    else {
      rows.push(salvar7.rowIndex);
      const ts5 = Date.now() - (5 * 60 + 30) * 1000;
      await api({ action: 'iniciarTimer', rowIndex: salvar7.rowIndex, timestamp: ts5 }, 35000);
      await syncWait();
      let s7 = findRow(salvar7.rowIndex);
      if (s7) {
        s7.startTimestamp = ts5;
      s7.started = true;
      s7.alertFired5 = false;
        s7.alertFiredExp = false;
        checkTimer(s7);
        const modal5 = document.getElementById('alert-modal');
        const title5 = document.getElementById('alert-title')?.textContent || '';
        const show5 = modal5 && modal5.classList.contains('show');
        push('F7.alerta.5min', show5 && /5 minutos/i.test(title5), 'show=' + show5 + ' title=' + title5);
        if (typeof fecharAlerta === 'function') fecharAlerta();
      }
    }

    // --- F7 expirado (timestamp 10m10s atras) ---
    const tel7b = '989' + String(Math.floor(1e7 + Math.random() * 9e7));
    const salvar7b = await api({
      action: 'salvarLocacao', tipo: 'Carro', plano: '10min', veiculo: 'Carro 02',
      pagamento: 'PIX', responsavel: 'TESTE TABLET F7B', crianca: 'F7_EXP_' + stamp, telefone: tel7b,
      observacao: '[TESTE] alerta expirado'
    }, 35000);
    if (!salvar7b.ok) { push('F7b.salvar', false, salvar7b.erro); }
    else {
      rows.push(salvar7b.rowIndex);
      const tsExp = Date.now() - (10 * 60 + 10) * 1000;
      await api({ action: 'iniciarTimer', rowIndex: salvar7b.rowIndex, timestamp: tsExp }, 35000);
      await syncWait();
      let s7b = findRow(salvar7b.rowIndex);
      if (s7b) {
        s7b.startTimestamp = tsExp;
        s7b.started = true;
        s7b.alertFired5 = true;
        s7b.alertFiredExp = false;
        checkTimer(s7b);
        const modalE = document.getElementById('alert-modal');
        const titleE = document.getElementById('alert-title')?.textContent || '';
        const showE = modalE && modalE.classList.contains('show');
        push('F7.alerta.expirado', showE && /esgotado/i.test(titleE), 'show=' + showE + ' title=' + titleE);
        if (typeof fecharAlerta === 'function') fecharAlerta();
      }
    }

    // cleanup locacoes teste
    for (const row of rows) {
      try {
        await api({ action: 'encerrarLocacao', rowIndex: row, minUsados: 0 }, 35000);
      } catch (e) { /* ignore */ }
    }
    await syncWait();
    push('cleanup.browser', true, rows.length + ' encerradas');

  } catch (e) {
    push('error', false, e && e.message ? e.message : String(e));
  }

  return { version: typeof APP_VERSION !== 'undefined' ? APP_VERSION : '', checks: out, ok: out.every(c => c.ok) };
})();
