/**
 * Grava escala Golden: Raykelly 10h–16h seg–sáb (dom OFF);
 * Karen 16h–22h seg–sáb (dom OFF). Competências 10/2026 e 11/2026.
 *
 *   node scripts/planilha/upsert-escala-golden-turnos.cjs
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const SS_ID = '1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618';
const ABA = 'ESCALA_COLABORADORES';
const COMPS = ['10/2026', '11/2026'];
const RAY = { id: 3, dias: ['10–16', '10–16', '10–16', '10–16', '10–16', '10–16', 'OFF'], obs: 'Raykelly — 10h–16h seg–sáb · folga domingo' };
const KAREN = { id: 5, dias: ['16–22', '16–22', '16–22', '16–22', '16–22', '16–22', 'OFF'], obs: 'Karen — 16h–22h seg–sáb · folga domingo' };

function loadGoogleapis() {
  const candidates = [
    path.join(process.cwd(), 'node_modules', 'googleapis'),
    path.join(os.homedir(), 'Projects', 'google-drive-sheets-auth', 'node_modules', 'googleapis'),
    path.join('C:', 'Users', 'riboc', 'Projects', 'google-drive-sheets-auth', 'node_modules', 'googleapis'),
  ];
  for (const p of candidates) {
    try { return require(p); } catch (e) { /* next */ }
  }
  return require('googleapis');
}

function loadCredentials() {
  const base = path.join(os.homedir(), '.config', 'google-api');
  const tokenPath = path.join(base, 'token.json');
  if (!fs.existsSync(tokenPath)) {
    console.error('Token ausente:', tokenPath, '— rode npm run auth em google-drive-sheets-auth');
    process.exit(1);
  }
  const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
  let secret = null;
  for (const s of [path.join(base, 'client_secret.json'), path.join(base, 'credentials.json')]) {
    if (fs.existsSync(s)) { secret = JSON.parse(fs.readFileSync(s, 'utf8')); break; }
  }
  return { token, secret };
}

function normComp(v) {
  const s = String(v == null ? '' : v).trim();
  const m = s.match(/^(\d{1,2})[\/\-](\d{4})$/);
  if (m) return String(m[1]).padStart(2, '0') + '/' + m[2];
  return s;
}

async function main() {
  const { google } = loadGoogleapis();
  const { token, secret } = loadCredentials();
  const inst = (secret && (secret.installed || secret.web || secret)) || {};
  const oauth2 = new google.auth.OAuth2(
    inst.client_id || token.client_id || process.env.GOOGLE_CLIENT_ID,
    inst.client_secret || token.client_secret || process.env.GOOGLE_CLIENT_SECRET,
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
  const got = await sheets.spreadsheets.values.get({
    spreadsheetId: SS_ID,
    range: "'" + ABA + "'!A1:J200",
    valueRenderOption: 'FORMATTED_VALUE',
  });
  const rows = got.data.values || [];
  if (!rows.length) {
    console.error('Aba vazia');
    process.exit(1);
  }
  function findRow(opId, comp) {
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i] || [];
      if (Number(r[0]) === opId && normComp(r[1]) === comp) return i + 1;
    }
    return 0;
  }
  const people = [RAY, KAREN];
  const toUpdate = [];
  const toAppend = [];
  for (const p of people) {
    for (const comp of COMPS) {
      const a1row = findRow(p.id, comp);
      const values = [p.id, comp].concat(p.dias).concat([p.obs]);
      if (a1row) {
        toUpdate.push({ range: "'" + ABA + "'!A" + a1row + ":J" + a1row, values: [values] });
        console.log('update row', a1row, 'id', p.id, comp);
      } else {
        toAppend.push(values);
        console.log('append id', p.id, comp);
      }
    }
  }
  if (toUpdate.length) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SS_ID,
      requestBody: { valueInputOption: 'USER_ENTERED', data: toUpdate },
    });
  }
  if (toAppend.length) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SS_ID,
      range: "'" + ABA + "'!A:J",
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: toAppend },
    });
  }
  console.log(JSON.stringify({ ok: true, updated: toUpdate.length, appended: toAppend.length }, null, 2));
}

main().catch(function (e) {
  console.error(e.message || e);
  process.exit(1);
});
