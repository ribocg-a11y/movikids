/* MOVI KIDS — Minutos extras no encerrar (I85 UX v1.9.98) — FE only, GAS inalterado */

function mkExtraPagStorageKey_(s) {
  return 'mk_extra_pag_v1_' + String((s && (s.rowIndex || s.id)) || '');
}

function mkExtraPagRestore_(session) {
  if (!session) return;
  if (session._extraPagamento || session._cancelarExtras) return;
  try {
    const raw = localStorage.getItem(mkExtraPagStorageKey_(session));
    if (!raw) return;
    const o = JSON.parse(raw);
    if (o.pag) session._extraPagamento = o.pag;
    if (o.cancel) session._cancelarExtras = true;
    if (o.just) session._justificativaExtras = o.just;
  } catch (e) {}
}

function mkExtraPagPersist_(session) {
  if (!session) return;
  try {
    localStorage.setItem(mkExtraPagStorageKey_(session), JSON.stringify({
      pag: session._extraPagamento || '',
      cancel: !!session._cancelarExtras,
      just: session._justificativaExtras || ''
    }));
  } catch (e) {}
  if (typeof saveSessions === 'function') saveSessions();
}

function mkExtraPagClear_(session) {
  if (!session) return;
  try { localStorage.removeItem(mkExtraPagStorageKey_(session)); } catch (e) {}
  session._extraPagamento = '';
  session._cancelarExtras = false;
  session._justificativaExtras = '';
}

function mkEncExtraNeedsInput_(fin) {
  return !!(fin && fin.minExtraCobrados > 0 && !fin.somentePlano);
}

function mkEncExtraReadJustFromDom_(scope, forValidate) {
  const id = scope === 'alert' ? 'alert-enc-extra-just' : 'enc-extra-just';
  const el = document.getElementById(id);
  if (!el) return '';
  const v = String(el.value || '');
  // I85: nunca .trim() no oninput — apaga espaço entre palavras enquanto digita
  return forValidate ? v.trim() : v;
}

function mkEncExtraSyncJustToSession_(session, scope) {
  if (!session || !session._cancelarExtras) return;
  session._justificativaExtras = mkEncExtraReadJustFromDom_(scope, false);
}

function mkEncExtraValidateState_(session, fin) {
  if (!mkEncExtraNeedsInput_(fin)) return { ok: true };
  if (session._cancelarExtras) {
    const txt = String(session._justificativaExtras || '').trim();
    if (txt.length < 5) {
      return {
        ok: false,
        msg: 'Escreva por que não vai cobrar os minutos extras (mín. 5 caracteres).',
        field: 'just'
      };
    }
    return { ok: true, cancelarExtras: true, justificativaExtras: txt };
  }
  const pag = session._extraPagamento || '';
  if (!pag) {
    return {
      ok: false,
      msg: 'Toque como o cliente pagou os minutos extras — depois confirme o encerramento.',
      field: 'pag'
    };
  }
  return { ok: true, extraPagamento: pag };
}

function mkEncExtraFinForSession_(session, incluirExtraAdm) {
  if (typeof resolverMinUsadosEncerrar_ === 'function') {
    return resolverMinUsadosEncerrar_(session, !!incluirExtraAdm);
  }
  return { minExtraCobrados: 0, somentePlano: false, minUsados: session.mins, vExtra: 0, vTotal: 0 };
}

function mkEncExtraSamePagLabel_(session) {
  const pag = String(session.pagamento || '').trim();
  if (!pag || pag === 'Não informado') return '';
  return pag;
}

function mkEncExtraRenderChecklist_(session, fin, listId) {
  const list = document.getElementById(listId);
  if (!list) return;
  if (!mkEncExtraNeedsInput_(fin)) {
    list.hidden = true;
    list.innerHTML = '';
    return;
  }
  list.hidden = false;
  const ready = mkEncExtraValidateState_(session, fin).ok;
  const step2Done = ready;
  const items = [
    { ok: true, text: 'Tempo contabilizado (' + fin.minUsados + ' min)' },
    {
      ok: step2Done,
      text: step2Done
        ? (session._cancelarExtras
          ? 'Extra: não cobrado (justificativa OK)'
          : 'Extra pago via ' + session._extraPagamento)
        : 'Informar pagamento dos minutos extras'
    },
    { ok: ready, text: ready ? 'Pronto para encerrar' : 'Confirmar encerramento (bloqueado)' }
  ];
  list.innerHTML = items.map(function (it) {
    return '<div class="enc-checklist-row' + (it.ok ? ' ok' : ' pending') + '">' +
      '<span class="enc-checklist-icon">' + (it.ok ? '✓' : '○') + '</span>' +
      '<span>' + it.text + '</span></div>';
  }).join('');
}

function mkEncExtraRenderHint_(session, fin, hintId, scope) {
  const hint = document.getElementById(hintId);
  if (!hint) return;
  if (!mkEncExtraNeedsInput_(fin)) {
    hint.hidden = true;
    hint.textContent = '';
    return;
  }
  const val = mkEncExtraValidateState_(session, fin);
  if (val.ok) {
    hint.hidden = true;
    hint.textContent = '';
    return;
  }
  hint.hidden = false;
  hint.textContent = val.msg;
  if (val.field === 'just') {
    const j = document.getElementById(scope === 'alert' ? 'alert-enc-extra-just' : 'enc-extra-just');
    if (j) j.classList.add('enc-extra-field-warn');
  }
}

function mkEncExtraSyncPagButtons_(session, scope) {
  const pag = session._extraPagamento || '';
  const cancelOn = !!session._cancelarExtras;
  const sel = scope === 'alert' ? '#alert-enc-extra-wrap .enc-extra-pag-btn' : '#enc-extra-wrap .enc-extra-pag-btn';
  document.querySelectorAll(sel).forEach(function (b) {
    b.classList.toggle('active', !cancelOn && b.getAttribute('data-pag') === pag);
    b.disabled = cancelOn;
  });
}

function mkEncExtraSyncScopeUi_(session, fin, scope) {
  if (!session || !fin) return;
  const isAlert = scope === 'alert';
  const wrapId = isAlert ? 'alert-enc-extra-wrap' : 'enc-extra-wrap';
  const wrap = document.getElementById(wrapId);
  if (!wrap) return;

  const show = mkEncExtraNeedsInput_(fin);
  wrap.hidden = !show;
  if (!show) return;

  const lead = document.getElementById(isAlert ? 'alert-enc-extra-lead' : 'enc-extra-lead');
  if (lead) {
    lead.textContent = fin.minExtraCobrados + ' min extras · R$ ' +
      fin.vExtra.toFixed(2).replace('.', ',') +
      ' — toque como o cliente pagou (ou marque não cobrar).';
  }

  const sameBtn = document.getElementById(isAlert ? 'alert-enc-extra-same-btn' : 'enc-extra-same-btn');
  const samePag = mkEncExtraSamePagLabel_(session);
  if (sameBtn) {
    if (samePag) {
      sameBtn.hidden = false;
      sameBtn.textContent = '↩ Mesmo pagamento do plano (' + samePag + ')';
      sameBtn.disabled = !!session._cancelarExtras;
    } else {
      sameBtn.hidden = true;
    }
  }

  const cancel = document.getElementById(isAlert ? 'alert-enc-extra-cancel' : 'enc-extra-cancel');
  const justWrap = document.getElementById(isAlert ? 'alert-enc-extra-just-wrap' : 'enc-extra-just-wrap');
  const just = document.getElementById(isAlert ? 'alert-enc-extra-just' : 'enc-extra-just');
  if (cancel) cancel.checked = !!session._cancelarExtras;
  if (justWrap) justWrap.hidden = !session._cancelarExtras;
  if (just && document.activeElement !== just) {
    just.value = session._justificativaExtras || '';
  }

  mkEncExtraSyncPagButtons_(session, scope);

  mkEncExtraRenderChecklist_(session, fin, isAlert ? 'alert-enc-checklist' : 'enc-checklist');
  mkEncExtraRenderHint_(session, fin, isAlert ? 'alert-enc-extra-hint' : 'enc-extra-hint', scope);
}

function mkEncExtraScrollToPay_(scope) {
  const id = scope === 'alert' ? 'alert-enc-extra-wrap' : 'enc-extra-wrap';
  const wrap = document.getElementById(id);
  if (wrap) {
    wrap.hidden = false;
    wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function mkEncExtraBindConfirmBtn_(session, fin, btnId, ready) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  if (btnId === 'btn-enc-alert') {
    btn.onclick = ready
      ? function () { if (typeof encerrarDireto === 'function') encerrarDireto(); }
      : function (e) {
          if (e) { e.preventDefault(); e.stopPropagation(); }
          mkEncExtraScrollToPay_('alert');
          if (typeof toast === 'function') {
            toast('Toque PIX, Crédito, Débito ou Dinheiro abaixo.', 'warning');
          }
          mkEncExtraRefreshAll_(session);
        };
  } else {
    btn.onclick = ready
      ? function () { if (typeof confirmarEncerrar === 'function') confirmarEncerrar(); }
      : function (e) {
          if (e) { e.preventDefault(); e.stopPropagation(); }
          mkEncExtraScrollToPay_('drawer');
          if (typeof toast === 'function') {
            toast('Toque como o cliente pagou os minutos extras.', 'warning');
          }
          mkEncExtraRefreshAll_(session);
        };
  }
}

function mkEncExtraUpdateConfirmBtn_(session, fin, btnId) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  if (!mkEncExtraNeedsInput_(fin)) {
    btn.disabled = false;
    btn.removeAttribute('aria-disabled');
    btn.classList.remove('enc-btn-blocked');
    if (btnId === 'btn-enc-alert') btn.textContent = '✓ Encerrar locação';
    else btn.textContent = '✓ Confirmar encerramento';
    mkEncExtraBindConfirmBtn_(session, fin, btnId, true);
    return;
  }
  const ready = mkEncExtraValidateState_(session, fin).ok;
  btn.disabled = false;
  btn.setAttribute('aria-disabled', ready ? 'false' : 'true');
  btn.classList.toggle('enc-btn-blocked', !ready);
  if (btnId === 'btn-enc-alert') {
    btn.textContent = ready ? '✓ Encerrar locação' : '① Informe pagamento do extra';
  } else {
    btn.textContent = ready ? '✓ Confirmar encerramento' : '① Informe pagamento do extra';
  }
  mkEncExtraBindConfirmBtn_(session, fin, btnId, ready);
}

function mkEncExtraRefreshUiOnly_(session, fin) {
  mkEncExtraRenderChecklist_(session, fin, 'enc-checklist');
  mkEncExtraRenderChecklist_(session, fin, 'alert-enc-checklist');
  mkEncExtraRenderHint_(session, fin, 'enc-extra-hint', 'drawer');
  mkEncExtraRenderHint_(session, fin, 'alert-enc-extra-hint', 'alert');
  mkEncExtraUpdateConfirmBtn_(session, fin, 'btn-enc-confirm');
  mkEncExtraUpdateConfirmBtn_(session, fin, 'btn-enc-alert');
}

function mkEncExtraRefreshAll_(session, opts) {
  opts = opts || {};
  if (!session) return;
  if (!opts.skipRestore) mkExtraPagRestore_(session);
  const admChk = document.getElementById('enc-adm-extra-local');
  const fin = mkEncExtraFinForSession_(session, !!(admChk && admChk.checked));
  if (opts.light) {
    mkEncExtraRefreshUiOnly_(session, fin);
  } else {
    mkEncExtraSyncScopeUi_(session, fin, 'drawer');
    mkEncExtraSyncScopeUi_(session, fin, 'alert');
    mkEncExtraUpdateConfirmBtn_(session, fin, 'btn-enc-confirm');
    mkEncExtraUpdateConfirmBtn_(session, fin, 'btn-enc-alert');
  }
  if (!opts.skipCards && typeof renderCards === 'function') renderCards();
}

var _mkEncExtraPickGuardAt_ = 0;

function mkEncExtraPickPag_(pag, scope) {
  const now = Date.now();
  if (now - _mkEncExtraPickGuardAt_ < 350) return;
  _mkEncExtraPickGuardAt_ = now;
  const session = scope === 'alert'
    ? (typeof alertSession !== 'undefined' ? alertSession : null)
    : (typeof encSession !== 'undefined' ? encSession : null);
  if (!session) return;
  session._extraPagamento = pag;
  session._cancelarExtras = false;
  session._justificativaExtras = '';
  const cancelId = scope === 'alert' ? 'alert-enc-extra-cancel' : 'enc-extra-cancel';
  const cancel = document.getElementById(cancelId);
  if (cancel) cancel.checked = false;
  const justWrapId = scope === 'alert' ? 'alert-enc-extra-just-wrap' : 'enc-extra-just-wrap';
  const justWrap = document.getElementById(justWrapId);
  if (justWrap) justWrap.hidden = true;
  mkExtraPagPersist_(session);
  mkEncExtraRefreshAll_(session);
  if (typeof toast === 'function') {
    toast('Extra registrado: ' + pag + '. Agora pode encerrar.', 'success');
  }
}

function mkEncExtraPickSamePag_(scope) {
  const session = scope === 'alert'
    ? (typeof alertSession !== 'undefined' ? alertSession : null)
    : (typeof encSession !== 'undefined' ? encSession : null);
  if (!session) return;
  const pag = mkEncExtraSamePagLabel_(session);
  if (!pag) return;
  mkEncExtraPickPag_(pag, scope);
}

function mkEncExtraToggleCancel_(scope) {
  const session = scope === 'alert'
    ? (typeof alertSession !== 'undefined' ? alertSession : null)
    : (typeof encSession !== 'undefined' ? encSession : null);
  if (!session) return;
  const cancelId = scope === 'alert' ? 'alert-enc-extra-cancel' : 'enc-extra-cancel';
  const cancel = document.getElementById(cancelId);
  const on = !!(cancel && cancel.checked);
  session._cancelarExtras = on;
  if (on) {
    session._extraPagamento = '';
  } else {
    session._justificativaExtras = '';
    const just = document.getElementById(scope === 'alert' ? 'alert-enc-extra-just' : 'enc-extra-just');
    if (just) just.value = '';
  }
  mkExtraPagPersist_(session);
  mkEncExtraRefreshAll_(session);
}

function mkEncExtraOnJustInput_(scope) {
  const session = scope === 'alert'
    ? (typeof alertSession !== 'undefined' ? alertSession : null)
    : (typeof encSession !== 'undefined' ? encSession : null);
  if (!session) return;
  session._justificativaExtras = mkEncExtraReadJustFromDom_(scope, false);
  mkExtraPagPersist_(session);
  mkEncExtraRefreshAll_(session, { light: true, skipCards: true, skipRestore: true });
}

function mkEncExtraCardBannerHtml_(s) {
  if (!s || !s.started) return '';
  const rem = typeof calcRemaining === 'function' ? calcRemaining(s) : 0;
  if (rem > 0) return '';
  mkExtraPagRestore_(s);
  const fin = mkEncExtraFinForSession_(s, false);
  if (!mkEncExtraNeedsInput_(fin)) return '';
  if (mkEncExtraValidateState_(s, fin).ok) {
    const label = s._cancelarExtras ? 'Extra não cobrado ✓' : ('Extra: ' + s._extraPagamento + ' ✓');
    return '<div class="sc-extra-pay-ok">' + label + ' · toque Encerrar</div>';
  }
  return '<div class="sc-extra-pay-warn">⏱ ' + fin.minExtraCobrados +
    ' min extra · toque como pagou antes de encerrar</div>';
}

function mkEncExtraInitForSession_(session, scope) {
  if (!session) return;
  mkExtraPagRestore_(session);
  const fin = mkEncExtraFinForSession_(session, false);
  mkEncExtraSyncScopeUi_(session, fin, scope);
  const btnId = scope === 'alert' ? 'btn-enc-alert' : 'btn-enc-confirm';
  mkEncExtraUpdateConfirmBtn_(session, fin, btnId);
}

window.mkEncExtraPickPag_ = mkEncExtraPickPag_;
window.mkEncExtraPickSamePag_ = mkEncExtraPickSamePag_;
window.mkEncExtraToggleCancel_ = mkEncExtraToggleCancel_;
window.mkEncExtraOnJustInput_ = mkEncExtraOnJustInput_;
