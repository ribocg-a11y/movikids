/**
 * MOVI KIDS — I148 planilha: Cancelada → Encerrada row 3046 (Iza/Lois)
 * Sem Nova versão Web GAS — edita LOCACOES via Sheets API OAuth.
 *
 * Pré-requisito: token em ~/.config/google-api/token.json (npm run auth no PC)
 *
 * Uso (PowerShell, pasta C):
 *   node scripts/planilha/corrigir-locacao-3046-oauth.cjs
 *   node scripts/planilha/corrigir-locacao-3046-oauth.cjs --dry-run
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const SS_ID = '1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618';
const ROW = 3046;
const GAS = 'https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec';
const dryRun = process.argv.includes('--dry-run');

function loadGoogleapis() {
  const candidates = [
    path.join(process.cwd(), 'node_modules', 'googleapis'),
    path.join(os.homedir(), 'Projects', 'google-drive-sheets-auth', 'node_modules', 'googleapis'),
    path.join('C:', 'Users', 'riboc', 'Projects', 'google-drive-sheets-auth', 'node_modules', 'googleapis'),
  ];
  for (const p of candidates) {
    try {
      return require(p);
    } catch (e) { /* next */ }
  }
  try {
    return require('googleapis');
  } catch (e) {
    console.error('googleapis nao encontrado. Instale em google-drive-sheets-auth ou: npm i googleapis');
    process.exit(1);
  }
}

function loadCredentials() {
  const base = path.join(os.homedir(), '.config', 'google-api');
  const tokenPath = path.join(base, 'token.json');
  const secretCandidates = [
    path.join(base, 'client_secret.json'),
    path.join(base, 'credentials.json'),
  ];
  if (!fs.existsSync(tokenPath)) {
    console.error('Token ausente:', tokenPath, '— rode: npm run auth (google-drive-sheets-auth)');
    process.exit(1);
  }
  const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
  let secret = null;
  for (const s of secretCandidates) {
    if (fs.existsSync(s)) {
      secret = JSON.parse(fs.readFileSync(s, 'utf8'));
      break;
    }
  }
  return { token, secret };
}

async function fetchJson(url) {
  const res = await fetch(url);
  return res.json();
}

async function main() {
  const before = await fetchJson(`${GAS}?action=verificarSessao&rowIndex=${ROW}`);
  console.log('Antes verificarSessao:', JSON.stringify(before, null, 2));
  if (before.status !== 'Cancelada') {
    console.error('Abort: row', ROW, 'status=', before.status, '(esperado Cancelada)');
    process.exit(1);
  }

  const resumoAntes = await fetchJson(`${GAS}?action=resumoDia&data=29/08/2026&adminPin=1421&force=1`);
  console.log('Caixa antes: fat=', resumoAntes.fat, 'totalMaq=', resumoAntes.totalMaq, 'n=', resumoAntes.n);

  const tag = '[CORRECAO ADM encerrar] Encerramento correto Iza 29/08 bug GAS extras nao cobrados';
  const obsAppend = tag;
  const ecMeta = 'EC:10|Nao cobrar minutos extras operacional 29/08';

  if (dryRun) {
    console.log('DRY RUN — escreveria na linha', ROW, ':');
    console.log('  D=18:44  I/J/K=0/0/22  O=Encerrada  AB=', ecMeta);
    console.log('  R +=', obsAppend);
    process.exit(0);
  }

  const { google } = loadGoogleapis();
  const { token, secret } = loadCredentials();
  const oauth2 = new google.auth.OAuth2(
    (secret && (secret.installed || secret.web || secret).client_id) || token.client_id || process.env.GOOGLE_CLIENT_ID,
    (secret && (secret.installed || secret.web || secret).client_secret) || token.client_secret || process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost'
  );
  const creds = token.tokens || token;
  oauth2.setCredentials({
    access_token: creds.access_token,
    refresh_token: creds.refresh_token,
    expiry_date: creds.expiry_date,
    token_type: creds.token_type || 'Bearer',
  });

  const sheets = google.sheets({ version: 'v4', auth: oauth2 });
  const prefix = "'LOCACOES'!";

  const read = await sheets.spreadsheets.values.get({
    spreadsheetId: SS_ID,
    range: prefix + `R${ROW}:R${ROW}`,
  });
  const obsAtual = String((read.data.values && read.data.values[0] && read.data.values[0][0]) || '').trim();
  const obsNova = obsAtual ? obsAtual + '\n' + obsAppend : obsAppend;

  const data = [
    { range: prefix + `D${ROW}`, values: [['18:44']] },
    { range: prefix + `I${ROW}`, values: [[0]] },
    { range: prefix + `J${ROW}`, values: [[0]] },
    { range: prefix + `K${ROW}`, values: [[22]] },
    { range: prefix + `O${ROW}`, values: [['Encerrada']] },
    { range: prefix + `R${ROW}`, values: [[obsNova]] },
    { range: prefix + `AB${ROW}`, values: [[ecMeta]] },
  ];

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SS_ID,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data,
    },
  });

  console.log('Planilha atualizada linha', ROW);

  await new Promise((r) => setTimeout(r, 2000));
  const after = await fetchJson(`${GAS}?action=verificarSessao&rowIndex=${ROW}`);
  console.log('Depois verificarSessao:', JSON.stringify(after, null, 2));

  const resumoDepois = await fetchJson(`${GAS}?action=resumoDia&data=29/08/2026&adminPin=1421&force=1`);
  console.log('Caixa depois: fat=', resumoDepois.fat, 'totalMaq=', resumoDepois.totalMaq, 'n=', resumoDepois.n);
  console.log('porPagamento Débito:', resumoDepois.porPagamento && resumoDepois.porPagamento['Débito']);

  if (after.status !== 'Encerrada' || Number(after.valorTotal) !== 22) {
    console.error('Validacao falhou — confira a linha na planilha');
    process.exit(1);
  }
  console.log('OK — Iza row 3046 Encerrada R$22 no caixa');
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
