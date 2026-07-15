/**
 * MOVI KIDS — cria/atualiza aba VIABILIDADE_NEGOCIO via OAuth (PC).
 *
 * Pré-requisito: npm run auth em google-drive-sheets-auth
 *
 * Uso (PowerShell, pasta auth):
 *   cd C:\Users\riboc\Projects\google-drive-sheets-auth
 *   node C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\scripts\criar-aba-viabilidade-negocio-oauth.js
 *
 * Ou, se o repo movikids estiver no mesmo PC e você já puxou a branch:
 *   node scripts\criar-aba-viabilidade-negocio-oauth.js
 *   (com NODE_PATH apontando para google-drive-sheets-auth\node_modules)
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const SS_ID = '1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618';
const ABA = 'VIABILIDADE_NEGOCIO';

function loadGoogleapis() {
  const candidates = [
    path.join(process.cwd(), 'node_modules', 'googleapis'),
    path.join(os.homedir(), 'Projects', 'google-drive-sheets-auth', 'node_modules', 'googleapis'),
    path.join('C:', 'Users', 'riboc', 'Projects', 'google-drive-sheets-auth', 'node_modules', 'googleapis'),
  ];
  for (const p of candidates) {
    try {
      return require(p);
    } catch (e) { /* try next */ }
  }
  try {
    return require('googleapis');
  } catch (e) {
    console.error('googleapis nao encontrado. Rode a partir de google-drive-sheets-auth (onde ha node_modules).');
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
    console.error('Token ausente:', tokenPath, '— rode: npm run auth');
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

async function main() {
  const { google } = loadGoogleapis();
  const { token, secret } = loadCredentials();

  const oauth2 = new google.auth.OAuth2(
    (secret && (secret.installed || secret.web || secret).client_id) || token.client_id || process.env.GOOGLE_CLIENT_ID,
    (secret && (secret.installed || secret.web || secret).client_secret) || token.client_secret || process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost'
  );
  // token.json formats vary
  const creds = token.tokens || token;
  oauth2.setCredentials({
    access_token: creds.access_token,
    refresh_token: creds.refresh_token,
    expiry_date: creds.expiry_date,
    token_type: creds.token_type || 'Bearer',
  });

  const sheets = google.sheets({ version: 'v4', auth: oauth2 });

  const meta = await sheets.spreadsheets.get({ spreadsheetId: SS_ID });
  let sheetId = null;
  for (const s of meta.data.sheets || []) {
    if (s.properties.title === ABA) {
      sheetId = s.properties.sheetId;
      break;
    }
  }

  if (sheetId == null) {
    const add = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SS_ID,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: ABA,
              tabColor: { red: 0.08, green: 0.4, blue: 0.75 },
              gridProperties: { frozenRowCount: 5, columnCount: 8, rowCount: 100 },
            },
          },
        }],
      },
    });
    sheetId = add.data.replies[0].addSheet.properties.sheetId;
    console.log('Aba criada:', ABA);
  } else {
    // limpar conteudo
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SS_ID,
      range: `'${ABA}'!A1:H100`,
    });
    console.log('Aba existente limpa:', ABA);
  }

  const dias = [
    [1, 'Qua', 19, 503.8, 130.8],
    [2, 'Qui', 17, 350.2, 8.2],
    [3, 'Sex', 20, 423, 25],
    [4, 'Sab', 41, 806.8, 18.8],
    [5, 'Dom', 4, 55.2, 1.2],
    [6, 'Seg', 16, 327.2, 14.2],
    [7, 'Ter', 28, 530.8, 35.8],
    [8, 'Qua', 23, 518.8, 70.8],
    [9, 'Qui', 17, 476.2, 59.2],
    [10, 'Sex', 25, 745, 0],
    [11, 'Sab', 40, 824, 11],
    [12, 'Dom', 33, 819, 0],
    [13, 'Seg', 21, 548, 0],
    [14, 'Ter', 21, 453, 0],
    [15, 'Qua*', 5, 86, 0],
  ];

  const values = [];
  const row = (r) => { while (values.length < r) values.push(['', '', '', '', '', '', '', '']); };
  const set = (r, c, v) => {
    row(r);
    while (values[r - 1].length < c) values[r - 1].push('');
    values[r - 1][c - 1] = v;
  };

  set(1, 1, 'MOVI KIDS — VIABILIDADE DO NEGOCIO (memorial dinamico)');
  set(2, 1, 'Fonte: ESTUDO_NEGOCIO_BREAK_EVEN_TICKET_2026-07.md · kpiMes · FOLHA B68 · CTO · CUSTOS');
  set(3, 1, 'Amarelo = editar. Formulas em pt-BR. Atualizado 15/07/2026.');

  set(5, 1, 'A — ENTRADA DO MES (editar)');
  set(6, 1, 'Competencia (mes/ano)'); set(6, 2, '07/2026');
  set(7, 1, 'Dias no mes'); set(7, 2, 31);
  set(8, 1, 'Dias operando'); set(8, 2, 15);
  set(9, 1, 'Faturamento mes (R$)'); set(9, 2, 7467);
  set(10, 1, 'N locacoes mes'); set(10, 2, 330);
  set(11, 1, 'Extras mes (R$)'); set(11, 2, 375);
  set(12, 1, 'Locacoes com extra (n)'); set(12, 2, 50);
  set(13, 1, 'Atualizado em'); set(13, 2, '15/07/2026');
  set(14, 1, 'Obs'); set(14, 2, '15/07 parcial · 05/07 jogo BR fechou cedo');

  set(16, 1, 'B — CUSTOS FIXOS MENSAIS (editar)');
  set(17, 1, 'Item'); set(17, 2, 'Valor (R$)'); set(17, 3, 'Fonte'); set(17, 4, 'Status');
  set(18, 1, 'CTO / aluguel shopping'); set(18, 2, 1300); set(18, 3, 'ctoPagar'); set(18, 4, 'OK');
  set(19, 1, 'Folha empregador (B68)'); set(19, 2, 5253.96); set(19, 3, 'aba FOLHA'); set(19, 4, 'OK');
  set(20, 1, 'Energia (CUSTOS)'); set(20, 2, 100.8); set(20, 3, 'aba CUSTOS'); set(20, 4, 'OK');
  set(21, 1, 'Manutencao'); set(21, 2, 0); set(21, 3, 'CUSTOS'); set(21, 4, 'LANCAR');
  set(22, 1, 'Contadora / honorarios'); set(22, 2, 0); set(22, 3, 'CUSTOS Outros'); set(22, 4, 'LANCAR');
  set(23, 1, 'Material / insumos'); set(23, 2, 0); set(23, 3, 'CUSTOS'); set(23, 4, 'LANCAR');
  set(24, 1, 'Sistemas / SMS / outros'); set(24, 2, 0); set(24, 3, 'CUSTOS'); set(24, 4, 'LANCAR');
  set(25, 1, 'Reserva ops (opcional)'); set(25, 2, 0); set(25, 3, 'politica socio'); set(25, 4, 'opc');

  set(27, 1, 'Soma CUSTOS operacionais (sem folha/CTO)'); set(27, 2, '=B20+B21+B22+B23+B24+B25');
  set(28, 1, 'Custo total SEM folha (CUS+CTO)'); set(28, 2, '=B27+B18');
  set(29, 1, 'Custo total COM folha'); set(29, 2, '=B28+B19');

  set(31, 1, 'C — INDICADORES CALCULADOS');
  set(32, 1, 'Ticket medio (R$/loc)'); set(32, 2, '=SE(B10>0;ARRED(B9/B10;2);0)');
  set(33, 1, '% extras no faturamento'); set(33, 2, '=SE(B9>0;ARRED(B11/B9;3);0)');
  set(34, 1, 'Fat / dia operando'); set(34, 2, '=SE(B8>0;ARRED(B9/B8;2);0)');
  set(35, 1, 'Loc / dia operando'); set(35, 2, '=SE(B8>0;ARRED(B10/B8;1);0)');
  set(36, 1, 'Custo / dia SEM folha'); set(36, 2, '=SE(B7>0;ARRED(B28/B7;2);0)');
  set(37, 1, 'Custo / dia COM folha'); set(37, 2, '=SE(B7>0;ARRED(B29/B7;2);0)');
  set(38, 1, 'Break-even SEM folha (loc/dia)'); set(38, 2, '=SE(B32>0;ARRED.PARA.CIMA(B36/B32;0);0)');
  set(39, 1, 'Break-even COM folha (loc/dia)'); set(39, 2, '=SE(B32>0;ARRED.PARA.CIMA(B37/B32;0);0)');
  set(40, 1, 'Resultado mes SEM folha'); set(40, 2, '=B9-B27-B18');
  set(41, 1, 'Margem SEM folha %'); set(41, 2, '=SE(B9>0;ARRED(B40/B9;3);0)');
  set(42, 1, 'Folha proporcional'); set(42, 2, '=SE(B7>0;ARRED(B19*B8/B7;2);0)');
  set(43, 1, 'Resultado COM folha (pro-rata)'); set(43, 2, '=B40-B42');
  set(44, 1, 'Margem COM folha %'); set(44, 2, '=SE(B9>0;ARRED(B43/B9;3);0)');

  set(46, 1, 'D — GATES');
  set(47, 1, 'Gate'); set(47, 2, 'Criterio'); set(47, 3, 'Valor'); set(47, 4, 'OK?');
  set(48, 1, 'Negocio base positivo'); set(48, 2, 'Margem sem folha >= 10%'); set(48, 3, '=B41'); set(48, 4, '=SE(B41>=0,1;"SIM";"NAO")');
  set(49, 1, 'BE com folha viavel'); set(49, 2, 'Loc/dia >= BE com folha'); set(49, 3, '=B35'); set(49, 4, '=SE(B35>=B39;"SIM";"NAO")');
  set(50, 1, 'Reserva apos folha'); set(50, 2, 'Resultado >= 2500'); set(50, 3, '=B43'); set(50, 4, '=SE(B43>=2500;"SIM";"NAO")');
  set(51, 1, 'Dados suficientes'); set(51, 2, 'Dias >= 12'); set(51, 3, '=B8'); set(51, 4, '=SE(B8>=12;"SIM";"NAO")');
  set(52, 1, 'CUSTOS completos?'); set(52, 2, 'Contadora+manut > 0'); set(52, 3, '=B21+B22'); set(52, 4, '=SE(B21+B22>0;"SIM";"NAO - LANCAR")');

  set(54, 1, 'E — SABADO x DIA UTIL');
  set(55, 1, 'Grupo'); set(55, 2, 'Dias'); set(55, 3, 'Loc'); set(55, 4, 'Fat'); set(55, 5, 'Extra'); set(55, 6, 'Loc/dia'); set(55, 7, 'Fat/dia'); set(55, 8, 'Ticket');
  set(56, 1, 'Sabados (04+11)'); set(56, 2, 2); set(56, 3, 81); set(56, 4, 1630.8); set(56, 5, 29.8);
  set(56, 6, '=SE(B56>0;ARRED(C56/B56;1);0)'); set(56, 7, '=SE(B56>0;ARRED(D56/B56;2);0)'); set(56, 8, '=SE(C56>0;ARRED(D56/C56;2);0)');
  set(57, 1, 'Dias uteis (sem 15)'); set(57, 2, 10); set(57, 3, 207); set(57, 4, 4876); set(57, 5, 344);
  set(57, 6, '=SE(B57>0;ARRED(C57/B57;1);0)'); set(57, 7, '=SE(B57>0;ARRED(D57/B57;2);0)'); set(57, 8, '=SE(C57>0;ARRED(D57/C57;2);0)');
  set(58, 1, 'Domingos'); set(58, 2, 2); set(58, 3, 37); set(58, 4, 874.2); set(58, 5, 1.2);
  set(58, 6, '=SE(B58>0;ARRED(C58/B58;1);0)'); set(58, 7, '=SE(B58>0;ARRED(D58/B58;2);0)'); set(58, 8, '=SE(C58>0;ARRED(D58/C58;2);0)');

  set(61, 1, 'F — DIA A DIA JUL/2026');
  set(62, 1, 'Dia'); set(62, 2, 'Semana'); set(62, 3, 'Loc'); set(62, 4, 'Fat'); set(62, 5, 'Extra'); set(62, 6, 'Ticket'); set(62, 7, '>=BE sem'); set(62, 8, '>=BE com');
  for (let i = 0; i < dias.length; i++) {
    const r = 63 + i;
    const d = dias[i];
    set(r, 1, d[0]); set(r, 2, d[1]); set(r, 3, d[2]); set(r, 4, d[3]); set(r, 5, d[4]);
    set(r, 6, '=SE(C' + r + '>0;ARRED(D' + r + '/C' + r + ';2);0)');
    set(r, 7, '=SE(C' + r + '>=$B$38;"SIM";"NAO")');
    set(r, 8, '=SE(C' + r + '>=$B$39;"SIM";"NAO")');
  }
  set(78, 1, '* Dia 15 parcial se medicao antecipada · 05 = jogo BR');

  set(80, 1, 'G — VEREDITO');
  set(81, 1, 'Negocio saudavel?'); set(81, 2, '=SE(E(D48="SIM";D49="SIM");"SIM — ritmo cobre folha";"ATENCAO")');
  set(82, 1, 'Metricas corretas?'); set(82, 2, '=SE(D52="SIM";"SIM — CUSTOS completos";"PARCIAL — falta B21-B24")');
  set(83, 1, 'Metas sustentam?'); set(83, 2, '=SE(B39>0;"BE com folha = "&B39&" loc/dia · ritmo ="&B35;"sem ticket")');
  set(84, 1, 'Para onde vamos?'); set(84, 2, '1) Completar CUSTOS  2) Escala sabado  3) Extra dia util  4) Payback ~11/2026');

  set(87, 1, 'H — PAYBACK');
  set(88, 1, 'Investimento total I (R$)'); set(88, 2, 69410);
  set(89, 1, 'Resultado acumulado (R$)'); set(89, 2, 16711.57);
  set(90, 1, '% recuperado'); set(90, 2, '=SE(B88>0;ARRED(B89/B88;3);0)');
  set(91, 1, 'Falta recuperar'); set(91, 2, '=B88-B89');
  set(92, 1, 'Previsao payback'); set(92, 2, '11/2026');

  await sheets.spreadsheets.values.update({
    spreadsheetId: SS_ID,
    range: `'${ABA}'!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });

  // amarelo nas celulas editaveis
  const yellow = { red: 1, green: 0.992, blue: 0.906 };
  const green = { red: 0.91, green: 0.96, blue: 0.91 };
  const reqs = [];
  function paint(r1, c1, r2, c2, color) {
    reqs.push({
      repeatCell: {
        range: { sheetId, startRowIndex: r1 - 1, endRowIndex: r2, startColumnIndex: c1 - 1, endColumnIndex: c2 },
        cell: { userEnteredFormat: { backgroundColor: color } },
        fields: 'userEnteredFormat.backgroundColor',
      },
    });
  }
  paint(6, 2, 14, 2, yellow);
  paint(18, 2, 25, 2, yellow);
  paint(56, 2, 58, 5, yellow);
  paint(63, 3, 77, 5, yellow);
  paint(88, 2, 89, 2, yellow);
  paint(92, 2, 92, 2, yellow);
  paint(27, 2, 29, 2, green);
  paint(32, 2, 44, 2, green);
  paint(56, 6, 58, 8, green);

  reqs.push({
    updateDimensionProperties: {
      range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 },
      properties: { pixelSize: 280 },
      fields: 'pixelSize',
    },
  });

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SS_ID,
    requestBody: { requests: reqs },
  });

  console.log('OK — aba VIABILIDADE_NEGOCIO pronta.');
  console.log('Abra: https://docs.google.com/spreadsheets/d/' + SS_ID + '/edit#gid=' + sheetId);
  console.log('Proximo: preencher amarelo B21 Manutencao e B22 Contadora.');
}

main().catch((e) => {
  console.error('FALHA:', e.message || e);
  if (e.response && e.response.data) console.error(JSON.stringify(e.response.data, null, 2));
  process.exit(1);
});
