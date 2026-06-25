/* Alertas tablet: triggerAlert5 / triggerAlertExpired via checkTimer (sem espera real).
 * Rodar logado no balcao (admin PIN 1416). Retorna { ok, checks }.
 */
(async function mkAlertasTablet_() {
  const out = [];
  const push = (id, ok, detail) => out.push({ id, ok: !!ok, detail: String(detail ?? '') });
  const op = Object.assign(
    typeof operadorApiParams_ === 'function' ? operadorApiParams_() : { operador: 'TESTE_ALERTAS' },
    typeof mkAuthAdminPinParams_ === 'function' ? mkAuthAdminPinParams_() : { adminPin: '1421', authRole: 'admin' }
  );
  const stamp = Date.now();
  const rows = [];

  async function syncWait() {
    if (typeof sincronizarServidor === 'function') {
      await sincronizarServidor(true);
      await new Promise(r => setTimeout(r, 800));
    }
  }

  function findRow(row) {
    return (typeof sessions !== 'undefined' ? sessions : []).find(x => Number(x.rowIndex) === Number(row));
  }

  function remSec(s) {
    return typeof calcRemaining === 'function' ? calcRemaining(s) : null;
  }

  function readModal() {
    const modal = document.getElementById('alert-modal');
    const title = document.getElementById('alert-title')?.textContent || '';
    const sub = document.getElementById('alert-sub')?.textContent || '';
    const btnWa = document.getElementById('btn-wa');
    return {
      show: !!(modal && modal.classList.contains('show')),
      danger: !!(modal && modal.classList.contains('danger')),
      title,
      sub,
      waDisplay: btnWa ? btnWa.style.display : '',
      qrOnly: typeof mkComunicacaoQrOnly_ === 'function' && mkComunicacaoQrOnly_()
    };
  }

  try {
    push('fe.version', typeof APP_VERSION !== 'undefined', APP_VERSION || '?');
    const qrOnly = typeof mkComunicacaoQrOnly_ === 'function' && mkComunicacaoQrOnly_();
    push('fe.qr_only', true, qrOnly ? 'qr_only ativo' : ('modo legado/sms — deploy FE 1.8.20+ para qr_only'));

    if (typeof checkTimer !== 'function') {
      push('checkTimer', false, 'funcao ausente');
      return { ok: false, checks: out };
    }

    // --- Alerta 5 min (timestamp 5m30s atras) ---
    const tel5 = '989' + String(Math.floor(1e7 + Math.random() * 9e7));
    const salvar5 = await api({
      action: 'salvarLocacao', tipo: 'Triciclo', plano: '10min', veiculo: 'Triciclo 01',
      pagamento: 'PIX', responsavel: 'TESTE ALERTA 5M', crianca: 'ALERT_5M_' + stamp, telefone: tel5,
      observacao: '[TESTE] alerta 5min browser'
    }, 35000);
    if (!salvar5.ok) { push('5m.salvar', false, salvar5.erro || 'fail'); return { ok: false, checks: out }; }
    rows.push(salvar5.rowIndex);

    const ts5 = Date.now() - (5 * 60 + 30) * 1000;
    await api({ action: 'iniciarTimer', rowIndex: salvar5.rowIndex, timestamp: ts5 }, 35000);
    await syncWait();

    let s5 = findRow(salvar5.rowIndex);
    if (!s5) { push('5m.sync', false, 'sessao ausente'); }
    else {
      // GAS v1.5.66+ grava serverTs se drift > 2min; para checkTimer simulamos elapsed no FE
      s5.startTimestamp = ts5;
      s5.started = true;
      const rem = remSec(s5);
      push('5m.janela', rem > 0 && rem <= 300, 'rem=' + rem + 's');
      s5.alertFired5 = false;
      s5.alertFiredExp = false;
      checkTimer(s5);
      const m5 = readModal();
      push('5m.modal.show', m5.show, 'show=' + m5.show);
      push('5m.modal.title', /5 minutos/i.test(m5.title), m5.title);
      push('5m.modal.sem.danger', !m5.danger, 'danger=' + m5.danger);
      push('5m.qr.sem.sms', !qrOnly || m5.waDisplay === 'none', 'waDisplay=' + m5.waDisplay + ' qrOnly=' + qrOnly);
      if (qrOnly) push('5m.qr.sub', /QR|verbalmente/i.test(m5.sub), m5.sub.slice(0, 80));
      if (typeof fecharAlerta === 'function') fecharAlerta();
      const modalA = document.getElementById('alert-modal');
      if (modalA) modalA.classList.remove('show', 'danger');
      push('5m.fechar', !document.getElementById('alert-modal')?.classList.contains('show'), 'modal fechado');
    }

    // --- Alerta esgotado (timestamp 10m10s atras) ---
    const telE = '989' + String(Math.floor(1e7 + Math.random() * 9e7));
    const salvarE = await api({
      action: 'salvarLocacao', tipo: 'Carro', plano: '10min', veiculo: 'Carro 02',
      pagamento: 'PIX', responsavel: 'TESTE ALERTA EXP', crianca: 'ALERT_EXP_' + stamp, telefone: telE,
      observacao: '[TESTE] alerta expirado browser'
    }, 35000);
    if (!salvarE.ok) { push('exp.salvar', false, salvarE.erro || 'fail'); }
    else {
      rows.push(salvarE.rowIndex);
      const tsExp = Date.now() - (10 * 60 + 10) * 1000;
      const iniE = await api({ action: 'iniciarTimer', rowIndex: salvarE.rowIndex, timestamp: tsExp }, 35000);
      push('exp.iniciar', iniE.ok, iniE.erro || 'ok');
      await syncWait();
      await new Promise(r => setTimeout(r, 400));
      let sE = findRow(salvarE.rowIndex);
      if (!sE) { push('exp.sync', false, 'sessao ausente'); }
      else {
        sE.startTimestamp = tsExp;
        sE.started = true;
        sE.status = 'Ativa';
        sE.alertFired5 = true;
        sE.alertFiredExp = false;
        const remE = remSec(sE);
        push('exp.janela', remE <= 0, 'rem=' + remE + 's started=' + sE.started);
        checkTimer(sE);
        const mE = readModal();
        push('exp.modal.show', mE.show, 'show=' + mE.show);
        push('exp.modal.title', /esgotado/i.test(mE.title), mE.title);
        push('exp.qr.sem.sms.obrigatorio', !qrOnly || !mE.danger, 'danger=' + mE.danger + ' qrOnly=' + qrOnly);
        push('exp.qr.sem.btn.wa', !qrOnly || mE.waDisplay === 'none', 'waDisplay=' + mE.waDisplay);
        if (qrOnly) push('exp.qr.sub', /QR|portal/i.test(mE.sub), mE.sub.slice(0, 80));
        if (typeof fecharAlerta === 'function') fecharAlerta();
        push('exp.fechar', !document.getElementById('alert-modal')?.classList.contains('show'), 'modal fechado');
      }
    }

    // cleanup
    for (const row of rows) {
      try {
        const s = findRow(row);
        const mins = s && s.mins ? Number(s.mins) : 10;
        await api(Object.assign({ action: 'encerrarLocacao', rowIndex: row, minUsados: mins }, op), 35000);
      } catch (e) { /* ignore */ }
    }
    await syncWait();
    push('cleanup.browser', true, rows.length + ' encerrada(s)');

  } catch (e) {
    push('error', false, e && e.message ? e.message : String(e));
  }

  const ok = out.every(c => c.ok);
  return { ok, version: typeof APP_VERSION !== 'undefined' ? APP_VERSION : '', checks: out };
})();
