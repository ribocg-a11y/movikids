#!/usr/bin/env node
/**
 * I142 — gera HTML + PDF (Edge headless) da conferência do mês por colaboradora.
 * Uso: node scripts/gerar-pdf-holerite-mes.cjs
 */
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'docs', 'entregas', 'holerite-mes-2026-07');
const GAS =
  'https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec';

/** Snapshot metaOperadorTurno 31/07/2026 — fallback se GAS não responder JSON no Node. */
const DIAS_FALLBACK = {
  3: [
    { data: '04/07/2026', loc: 29, bonusValor: 50, juntas: true },
    { data: '08/07/2026', loc: 21, bonusValor: 100, juntas: false },
    { data: '10/07/2026', loc: 23, bonusValor: 50, juntas: true },
    { data: '11/07/2026', loc: 31, bonusValor: 50, juntas: true },
    { data: '12/07/2026', loc: 33, bonusValor: 50, juntas: true },
    { data: '18/07/2026', loc: 22, bonusValor: 50, juntas: true },
    { data: '19/07/2026', loc: 23, bonusValor: 50, juntas: true },
    { data: '22/07/2026', loc: 25, bonusValor: 100, juntas: false },
    { data: '24/07/2026', loc: 32, bonusValor: 50, juntas: true },
    { data: '25/07/2026', loc: 20, bonusValor: 50, juntas: true },
    { data: '26/07/2026', loc: 17, bonusValor: 50, juntas: true },
    { data: '27/07/2026', loc: 21, bonusValor: 100, juntas: false },
    { data: '29/07/2026', loc: 24, bonusValor: 100, juntas: false }
  ],
  4: [
    { data: '04/07/2026', loc: 0, bonusValor: 50, juntas: true },
    { data: '10/07/2026', loc: 0, bonusValor: 50, juntas: true },
    { data: '11/07/2026', loc: 8, bonusValor: 50, juntas: true },
    { data: '12/07/2026', loc: 0, bonusValor: 50, juntas: true },
    { data: '16/07/2026', loc: 26, bonusValor: 100, juntas: false },
    { data: '18/07/2026', loc: 43, bonusValor: 50, juntas: true },
    { data: '19/07/2026', loc: 5, bonusValor: 50, juntas: true },
    { data: '23/07/2026', loc: 21, bonusValor: 100, juntas: false },
    { data: '24/07/2026', loc: 0, bonusValor: 50, juntas: true },
    { data: '25/07/2026', loc: 35, bonusValor: 50, juntas: true },
    { data: '26/07/2026', loc: 20, bonusValor: 50, juntas: true },
    { data: '28/07/2026', loc: 43, bonusValor: 100, juntas: false },
    { data: '30/07/2026', loc: 26, bonusValor: 100, juntas: false }
  ]
};

const COLABS = [
  {
    id: 3,
    nome: 'Raykelly',
    funcao: 'Atendente',
    q1: { salario: 648.4, va: 200, vt: 96.8, bonus: 150, pacote: 998.4 },
    q2: { salario: 752.22, va: 200, vt: 96.8, bonus: 700, pacote: 1652.22 }
  },
  {
    id: 4,
    nome: 'Julia',
    funcao: 'Atendente',
    q1: { salario: 648.4, va: 200, vt: 96.8, bonus: 100, pacote: 948.4 },
    q2: { salario: 752.22, va: 200, vt: 96.8, bonus: 750, pacote: 1702.22 }
  }
];

function money(n) {
  return Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function soma(a, b) {
  return Math.round((Number(a) + Number(b)) * 100) / 100;
}
function dow(dataStr) {
  const p = String(dataStr || '').split('/');
  if (p.length < 3) return '—';
  const d = new Date(Number(p[2]), Number(p[1]) - 1, Number(p[0]));
  return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][d.getDay()] || '—';
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'MOVIKIDS-pdf/1.0' } }, (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

async function fetchDias(opId) {
  const url = `${GAS}?action=metaOperadorTurno&operadorId=${opId}&_t=${Date.now()}`;
  try {
    const r = await getJson(url);
    const dias = (r && r.mes && r.mes.diasBonus) || [];
    if (dias.length) return dias;
  } catch (e) {
    console.warn('metaOperadorTurno falhou op', opId, e.message);
  }
  return DIAS_FALLBACK[opId] || [];
}

function buildHtml(c, dias) {
  const rubricas = [
    ['Salário', c.q1.salario, c.q2.salario],
    ['VA', c.q1.va, c.q2.va],
    ['VT*', c.q1.vt, c.q2.vt],
    ['Bônus', c.q1.bonus, c.q2.bonus]
  ];
  const rows = rubricas
    .map(
      ([n, q1, q2]) =>
        `<tr><td>${n}</td><td class="n">${money(q1)}</td><td class="n">${money(q2)}</td><td class="n">${money(soma(q1, q2))}</td></tr>`
    )
    .join('');
  const diasRows =
    dias
      .map(
        (d) =>
          `<tr><td>${d.data || '—'}</td><td>${dow(d.data)}</td><td class="n">${d.loc != null ? d.loc : '—'}</td><td class="n">${money(d.bonusValor)}${d.juntas ? ' · FSS' : ''}</td></tr>`
      )
      .join('') || '<tr><td colspan="4">Sem detalhe de dias</td></tr>';
  const totalBonus = dias.reduce((s, d) => s + (Number(d.bonusValor) || 0), 0) || soma(c.q1.bonus, c.q2.bonus);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>MOVI KIDS — Holerite ${c.nome} · 07/2026</title>
<style>
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Nunito, Arial, sans-serif; color: #0F172A; margin: 0; padding: 24px; background: #fff; }
  h1 { font-size: 22px; margin: 0 0 4px; color: #1565C0; }
  .sub { font-size: 12px; color: #64748B; margin-bottom: 18px; font-weight: 700; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .04em; color: #1565C0; margin: 22px 0 8px; border-bottom: 2px solid #1565C0; padding-bottom: 6px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; font-weight: 700; margin-bottom: 8px; }
  th { background: #E8F2FF; color: #0D47A1; font-size: 10px; text-transform: uppercase; padding: 8px 6px; border: 1px solid #CBD5E1; }
  td { padding: 7px 6px; border: 1px solid #CBD5E1; }
  td.n, th.n { text-align: right; white-space: nowrap; }
  .note { font-size: 10px; color: #64748B; margin: 4px 0 14px; }
  .tot { background: #F1F5F9; font-weight: 900; }
  .brand { font-weight: 900; }
  .gold { color: #F59E0B; }
</style>
</head>
<body>
  <div class="brand">MOVI <span class="gold">KIDS</span></div>
  <h1>${c.nome}</h1>
  <div class="sub">${c.funcao} · Competência 07/2026 · Conferência Q1 (15/07) + Q2 (31/07) · I141/I142</div>

  <h2>Salário e ganhos</h2>
  <table>
    <thead><tr><th>Rubrica</th><th class="n">Q1 (15/07)</th><th class="n">Q2 (31/07)</th><th class="n">Soma</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p class="note">*VT = referência da quinzena (pago por semana, fora do PIX)</p>

  <h2>Pacote (PIX + VA, sem VT)</h2>
  <table>
    <thead><tr><th></th><th class="n">Q1 (15/07)</th><th class="n">Q2 (31/07)</th><th class="n">Mês</th></tr></thead>
    <tbody>
      <tr><td>Pacote</td><td class="n">${money(c.q1.pacote)}</td><td class="n">${money(c.q2.pacote)}</td><td class="n">${money(soma(c.q1.pacote, c.q2.pacote))}</td></tr>
    </tbody>
  </table>
  <p class="note">Bônus Q2 = resto (ganho mês − pago na 1ª): ${money(c.q2.bonus)}. Pacote = PIX + VA.</p>

  <h2>Dias com bônus de meta</h2>
  <table>
    <thead><tr><th>Data</th><th>Dia</th><th class="n">Locações</th><th class="n">Bônus do dia</th></tr></thead>
    <tbody>
      ${diasRows}
      <tr class="tot"><td colspan="3">Total · ${dias.length || '—'} dia(s)</td><td class="n">${money(totalBonus)}</td></tr>
    </tbody>
  </table>
  <p class="note">FSS = fim de semana com as duas juntas (pot R$100 → R$50 cada). Documento informativo MOVI KIDS.</p>
</body>
</html>`;
}

function findEdge() {
  const candidates = [
    process.env['PROGRAMFILES(X86)'] + '\\Microsoft\\Edge\\Application\\msedge.exe',
    process.env.PROGRAMFILES + '\\Microsoft\\Edge\\Application\\msedge.exe',
    process.env.PROGRAMFILES + '\\Google\\Chrome\\Application\\chrome.exe'
  ];
  return candidates.find((p) => p && fs.existsSync(p)) || null;
}

function htmlToPdf(edge, htmlPath, pdfPath) {
  const absHtml = path.resolve(htmlPath);
  const absPdf = path.resolve(pdfPath);
  const fileUrl = 'file:///' + absHtml.replace(/\\/g, '/');
  const r = spawnSync(
    edge,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-pdf-header-footer',
      `--print-to-pdf=${absPdf}`,
      fileUrl
    ],
    { encoding: 'utf8', timeout: 60000 }
  );
  if (r.status !== 0 || !fs.existsSync(absPdf)) {
    throw new Error('Edge print-to-pdf falhou: ' + (r.stderr || r.stdout || r.status));
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const edge = findEdge();
  if (!edge) throw new Error('Edge/Chrome não encontrado para gerar PDF');

  const indexLinks = [];
  for (const c of COLABS) {
    const dias = await fetchDias(c.id);
    const slug = c.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const htmlPath = path.join(OUT_DIR, `holerite-${slug}-2026-07.html`);
    const pdfPath = path.join(OUT_DIR, `holerite-${slug}-2026-07.pdf`);
    fs.writeFileSync(htmlPath, buildHtml(c, dias), 'utf8');
    htmlToPdf(edge, htmlPath, pdfPath);
    console.log('OK', c.nome, 'dias=', dias.length, '→', pdfPath);
    indexLinks.push({ nome: c.nome, html: path.basename(htmlPath), pdf: path.basename(pdfPath) });
  }

  const index = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>Holerites 07/2026</title>
<style>body{font-family:Segoe UI,Arial,sans-serif;padding:32px;max-width:640px;margin:0 auto}
a{display:block;padding:14px 16px;margin:8px 0;background:#E8F2FF;border-radius:12px;text-decoration:none;color:#0D47A1;font-weight:800}
h1{color:#1565C0}</style></head>
<body>
<h1>MOVI KIDS — Holerites julho/2026</h1>
<p>Conferência Q1/Q2 + dias de bônus (I141/I142).</p>
${indexLinks
  .map(
    (l) =>
      `<a href="${l.pdf}" download>📄 PDF — ${l.nome}</a><a href="${l.html}">👁 HTML — ${l.nome}</a>`
  )
  .join('')}
</body></html>`;
  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), index, 'utf8');
  console.log('Index:', path.join(OUT_DIR, 'index.html'));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
