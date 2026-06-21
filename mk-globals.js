/* MOVI KIDS - estado global compartilhado (Pacote M.17) */

const APP_VERSION = (typeof window !== 'undefined' && window.MK_VERSION) ? window.MK_VERSION : '1.7.95';
const PORTAL_RESPONSAVEL_URL = 'https://ribocg-a11y.github.io/movikids/acompanhar.html';

let PRECOS = {
  'Carro':   { '10min':{v:12,m:10,a:1.00},'20min':{v:22,m:20,a:1.00},'30min':{v:30,m:30,a:1.00},
               '40min':{v:40,m:40,a:1.00},'60min':{v:55,m:60,a:1.00},'3h':{v:130,m:180,a:1.00} },
  'Triciclo': { '10min':{v:12,m:10,a:1.00},'20min':{v:22,m:20,a:1.00},'30min':{v:30,m:30,a:1.00},
               '40min':{v:40,m:40,a:1.00},'60min':{v:55,m:60,a:1.00},'3h':{v:130,m:180,a:1.00} },
  'Pelúcia': { '10min':{v:15,m:10,a:1.20},'20min':{v:25,m:20,a:1.20},'30min':{v:35,m:30,a:1.20},
               '40min':{v:45,m:40,a:1.20},'60min':{v:65,m:60,a:1.20},'3h':{v:150,m:180,a:1.20} }
};

const PLANO_LABELS = { '10min':'10 minutos','20min':'20 minutos','30min':'30 minutos',
                        '40min':'40 minutos','60min':'1 hora','3h':'3 horas' };

let sessions = [];
let statsHoje = { fat: 0, n: 0 };

/** Operação jun/2026: sem envio SMS/WhatsApp — só QR portal até serviço de mensagens contratado. */
const MK_COMUNICACAO_MODO = 'qr_only';

function mkComunicacaoQrOnly_() {
  return MK_COMUNICACAO_MODO === 'qr_only';
}

function mkQrPortalUrl_() {
  return typeof PORTAL_RESPONSAVEL_URL !== 'undefined' ? PORTAL_RESPONSAVEL_URL : 'acompanhar.html';
}

function mkApplyComunicacaoModoUi_() {
  if (!mkComunicacaoQrOnly_()) return;
  const btnSmsNova = document.getElementById('btn-confirmar-iniciar');
  if (btnSmsNova) btnSmsNova.style.display = 'none';
  const hintNova = document.getElementById('nova-fechar-hint');
  if (hintNova) {
    hintNova.textContent = 'O cronômetro só começa após ▶ Iniciar na Home. Comunicação com o responsável: QR do portal na mesa (SMS/WhatsApp pausados).';
  }
  const btnConfirm = document.getElementById('btn-confirmar');
  if (btnConfirm && !btnConfirm.textContent.includes('QR')) {
    btnConfirm.textContent = '✓ Salvar cadastro';
  }
  const btnWaAlert = document.getElementById('btn-wa');
  if (btnWaAlert) btnWaAlert.style.display = 'none';
  const btnWaBv = document.getElementById('btn-wa-bv-send');
  if (btnWaBv) btnWaBv.style.display = 'none';
}

/** Cache sessionStorage com TTL — acelerador FE (SWR). */
function mkSessCacheGet_(key, ttlMs) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (!o || o.ts == null || o.data == null) return null;
    if (Date.now() - o.ts > (ttlMs || 300000)) return null;
    return o.data;
  } catch (e) { return null; }
}

function mkSessCacheSet_(key, data) {
  try {
    if (data == null) return;
    sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), data: data }));
  } catch (e) { /* quota */ }
}

function mkOrientarQrPortal_(contexto) {
  const ctx = contexto ? (' ' + contexto) : '';
  if (typeof toast === 'function') {
    toast('Mostre o QR do portal na mesa para o responsável acompanhar' + ctx + '.', 'info');
  }
}
