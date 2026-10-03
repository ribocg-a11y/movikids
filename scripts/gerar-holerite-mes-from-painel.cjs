#!/usr/bin/env node
/**
 * I169 — gera HTML+PDF holerite a partir de painelGestaoPessoasAdmin (JSON).
 * Uso:
 *   node scripts/gerar-holerite-mes-from-painel.cjs entregas/holerite-mes-2026-09/painel-09-2026.json
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const jsonPath = process.argv[2] || path.join(ROOT, 'entregas', 'holerite-mes-2026-09', 'painel-09-2026.json');

function money(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function slug(nome) {
  return String(nome || 'colab')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
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
    ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${absPdf}`, fileUrl],
    { encoding: 'utf8', timeout: 90000 }
  );
  if (r.status !== 0 || !fs.existsSync(absPdf)) {
    throw new Error('print-to-pdf falhou: ' + (r.stderr || r.stdout || r.status));
  }
}

function buildHtml(f, comp) {
  const h = f.holerite || {};
  const q = Number(h.quinzena || f.quinzena || 2);
  const qLabel = h.quinzenaLabel || f.quinzenaLabel || (q === 1 ? '1ª quinzena' : '2ª quinzena');
  const pgto = h.pagamentoEm || f.pagamentoEm || '—';
  const alert = Number(h.liquido != null ? h.liquido : f.total) < 0
    ? '<div class="alert">⚠ PIX/líquido negativo — conferir faltas/descontos com RH antes de pagar.</div>'
    : '';

  const rows = [
    ['Salário contratual', h.salarioContratual],
    ['Salário proporcional', h.salarioProporcional || h.base],
    ['Bruto quinzena', h.bruto],
    ['Adiantamento Q1 (desconto Q2)', h.adiantamentoQ1],
    ['Bônus (quinzena)', h.bonus != null ? h.bonus : f.bonus],
    ['Bônus mês (referência)', h.bonusMes],
    ['Faltas (desconto)', h.faltas != null ? h.faltas : f.faltas],
    ['INSS', h.inss],
    ['IRRF', h.irrf],
    ['VT quinzena (ref. / pago semanal)', h.vt],
    ['VA quinzena', h.vaTotal],
    ['Total descontos', h.totalDescontos],
    ['Salário líquido', h.liquido != null ? h.liquido : f.total],
    ['PIX quinzena', h.pixQuinzena != null ? h.pixQuinzena : f.total],
    ['Pacote (PIX + VA)', h.pacoteQuinzena],
    ['FGTS 8% (encargo empregador)', h.fgts]
  ];

  const bodyRows = rows
    .map(([k, v]) => `<tr><td>${k}</td><td class="n">R$ ${money(v)}</td></tr>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>MOVI KIDS — Holerite ${f.nome} · ${comp}</title>
<style>
  @page { size: A4; margin: 12mm; }
  body { font-family: 'Segoe UI', Nunito, Arial, sans-serif; color: #0F172A; margin: 0; padding: 20px; }
  .brand { font-weight: 900; font-size: 18px; color: #1565C0; }
  .gold { color: #F59E0B; }
  h1 { font-size: 20px; margin: 8px 0 4px; }
  .sub { font-size: 12px; color: #64748B; font-weight: 700; margin-bottom: 14px; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #F8FAFC; padding: 12px; border: 1px solid #E2E8F0; border-radius: 10px; font-size: 12px; font-weight: 700; margin-bottom: 14px; }
  .meta span { display: block; font-size: 9px; color: #64748B; text-transform: uppercase; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; font-weight: 700; }
  th { background: #E8F2FF; color: #0D47A1; font-size: 10px; text-transform: uppercase; padding: 8px; border: 1px solid #CBD5E1; text-align: left; }
  td { padding: 7px 8px; border: 1px solid #CBD5E1; }
  td.n { text-align: right; white-space: nowrap; }
  .alert { background: #FEF2F2; color: #B91C1C; border: 1px solid #FECACA; padding: 10px 12px; border-radius: 8px; font-weight: 800; font-size: 12px; margin-bottom: 12px; }
  .foot { margin-top: 14px; font-size: 10px; color: #64748B; line-height: 1.45; }
  .kpi { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin: 12px 0; }
  .kpi div { background: #E8F2FF; border-radius: 10px; padding: 10px; text-align: center; }
  .kpi b { display: block; font-size: 16px; color: #0D47A1; }
  .kpi span { font-size: 9px; text-transform: uppercase; color: #64748B; font-weight: 800; }
</style>
</head>
<body>
  <div class="brand">MOVI <span class="gold">KIDS</span></div>
  <h1>${f.nome}</h1>
  <div class="sub">Competência ${comp} · ${qLabel} · pgto ${pgto} · Loc mês ${f.locMes || 0} · I169</div>
  ${alert}
  <div class="meta">
    <div><span>CNPJ</span>66.664.255/0001-67</div>
    <div><span>Empresa</span>MOVI KIDS Brincadeiras LTDA</div>
    <div><span>Matrícula</span>MK-${String(f.id).padStart(3, '0')}</div>
    <div><span>Quinzena</span>${q}ª · ${pgto}</div>
  </div>
  <div class="kpi">
    <div><span>PIX</span><b>R$ ${money(h.pixQuinzena != null ? h.pixQuinzena : f.total)}</b></div>
    <div><span>Pacote</span><b>R$ ${money(h.pacoteQuinzena)}</b></div>
    <div><span>Bônus</span><b>R$ ${money(h.bonus != null ? h.bonus : f.bonus)}</b></div>
  </div>
  <table>
    <thead><tr><th>Rubrica</th><th class="n">Valor</th></tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
  <p class="foot">Documento informativo para contadora/RH. VT é pago semanalmente e não soma no PIX. Pacote = PIX + VA. FGTS é encargo do empregador. Gerado a partir do painel admin competência ${comp}.</p>
</body>
</html>`;
}

function main() {
  if (!fs.existsSync(jsonPath)) {
    console.error('JSON não encontrado:', jsonPath);
    process.exit(1);
  }
  const painel = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  if (!painel || !painel.ok || !Array.isArray(painel.folha) || !painel.folha.length) {
    console.error('painel.folha vazio ou inválido');
    process.exit(1);
  }
  const comp = String(painel.competencia || '09/2026');
  const ym = comp.replace('/', '-').split('-').reverse().join('-'); // 2026-09 if 09/2026
  const parts = comp.split('/');
  const outDir = path.join(ROOT, 'entregas', `holerite-mes-${parts[1]}-${parts[0]}`);
  fs.mkdirSync(outDir, { recursive: true });

  const edge = findEdge();
  if (!edge) throw new Error('Edge/Chrome não encontrado');

  const links = [];
  for (const f of painel.folha) {
    const s = slug(f.nome);
    const htmlPath = path.join(outDir, `holerite-${s}-${parts[1]}-${parts[0]}.html`);
    const pdfPath = path.join(outDir, `holerite-${s}-${parts[1]}-${parts[0]}.pdf`);
    fs.writeFileSync(htmlPath, buildHtml(f, comp), 'utf8');
    htmlToPdf(edge, htmlPath, pdfPath);
    const neg = Number((f.holerite && f.holerite.liquido) != null ? f.holerite.liquido : f.total) < 0;
    console.log('OK', f.nome, neg ? '⚠ NEGATIVO' : '', '→', path.basename(pdfPath));
    links.push({
      nome: f.nome,
      html: path.basename(htmlPath),
      pdf: path.basename(pdfPath),
      pix: (f.holerite && f.holerite.pixQuinzena) != null ? f.holerite.pixQuinzena : f.total,
      neg
    });
  }

  const index = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>Holerites ${comp}</title>
<style>
body{font-family:Segoe UI,Arial,sans-serif;padding:32px;max-width:720px;margin:0 auto;color:#0F172A}
a{display:block;padding:14px 16px;margin:8px 0;background:#E8F2FF;border-radius:12px;text-decoration:none;color:#0D47A1;font-weight:800}
.warn{background:#FEF2F2;color:#B91C1C}
h1{color:#1565C0} .note{color:#64748B;font-size:13px;font-weight:700}
</style></head>
<body>
<h1>MOVI KIDS — Holerites ${comp}</h1>
<p class="note">Pacote para contadora · 2ª quinzena · gerado ${new Date().toLocaleString('pt-BR')} · I169</p>
${links
  .map(
    (l) =>
      `<a class="${l.neg ? 'warn' : ''}" href="${l.pdf}" download>📄 PDF — ${l.nome} · PIX R$ ${money(l.pix)}${l.neg ? ' ⚠' : ''}</a>
<a href="${l.html}">👁 HTML — ${l.nome}</a>`
  )
  .join('')}
<p class="note">Abrir no Pages: /movikids/entregas/holerite-mes-${parts[1]}-${parts[0]}/</p>
</body></html>`;
  fs.writeFileSync(path.join(outDir, 'index.html'), index, 'utf8');
  // keep source JSON next to package if not already
  const destJson = path.join(outDir, path.basename(jsonPath));
  if (path.resolve(jsonPath) !== path.resolve(destJson)) {
    fs.copyFileSync(jsonPath, destJson);
  }
  console.log('Index:', path.join(outDir, 'index.html'));
  console.log('ym=', ym, 'comp=', comp);
}

main();
