#!/usr/bin/env node
/**
 * Limpeza obrigatória após testes na planilha MOVI KIDS (Cloud/Node).
 * Equivalente a LIMPAR_SESSOES_TESTE_AGORA.ps1 — sem OAuth local.
 *
 * Uso: node scripts/limpar-testes-pos-auditoria.cjs
 *      node scripts/limpar-testes-pos-auditoria.cjs --dry-run
 */
'use strict';

const https = require('https');

const BASE = process.env.MK_GAS_EXEC_URL ||
  'https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec';
const ADMIN_PIN = process.env.MK_ADMIN_PIN || '1421';
const MOTIVO = process.argv.includes('--motivo')
  ? process.argv[process.argv.indexOf('--motivo') + 1]
  : 'Limpeza automatica pos-teste Codex MOVI KIDS';
const DRY = process.argv.includes('--dry-run');

function api(params, timeoutMs = 120000) {
  const q = new URLSearchParams({ ...params, _t: String(Date.now()) }).toString();
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout ' + params.action)), timeoutMs);
    const follow = (url, hops = 0) => {
      https.get(url, { headers: { 'User-Agent': 'MOVI-CLEANUP' } }, (res) => {
        if (hops < 5 && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return follow(res.headers.location, hops + 1);
        }
        let d = '';
        res.on('data', (c) => { d += c; });
        res.on('end', () => {
          clearTimeout(t);
          try { resolve(JSON.parse(d)); } catch (e) { reject(new Error(d.slice(0, 200))); }
        });
      }).on('error', (e) => { clearTimeout(t); reject(e); });
    };
    follow(BASE + '?' + q);
  });
}

function isTestLoc(loc) {
  const t = String(loc.telefone || '').replace(/\D/g, '');
  const r = String(loc.responsavel || '');
  const c = String(loc.crianca || '');
  const o = String(loc.observacao || loc.obs || '').toUpperCase();
  if (/^9899999/.test(t)) return true;
  if (/^Teste|^TESTE/i.test(r)) return true;
  if (/^TESTE_|^CRON_|^DRAWER_E_/i.test(c)) return true;
  if (['BT', 'P', 'X', 'BrowserTest', 'DebugTest', 'ParityTest', 'OperadorTeste', 'TestOp', 'TESTE', 'TESTE_EDIT'].includes(r)) return true;
  if (r === 'X' && c === 'Y') return true;
  if (o.includes('[TESTE]') || o.includes('TESTE_CODEX')) return true;
  return false;
}

(async () => {
  const report = { dryRun: DRY, steps: [] };

  if (DRY) {
    const ativas = await api({ action: 'listarAtivas' }, 60000);
    const testes = (ativas.locacoes || []).filter(isTestLoc);
    report.steps.push({ step: 'dry-run', testes });
    console.log(JSON.stringify(report, null, 2));
    process.exit(testes.length ? 1 : 0);
  }

  const limpar = await api({
    action: 'limparLocacoesTesteAdmin',
    adminPin: ADMIN_PIN,
    motivo: MOTIVO,
    soHoje: '1'
  });
  report.steps.push({ step: 'limparLocacoesTesteAdmin', ok: limpar.ok, total: limpar.total, anuladas: limpar.anuladas });

  const ativas = await api({ action: 'listarAtivas' }, 60000);
  const testes = (ativas.locacoes || []).filter(isTestLoc);
  for (const loc of testes) {
    const c = await api({
      action: 'cancelarLocacao',
      rowIndex: loc.rowIndex,
      motivo: MOTIVO,
      operador: 'Administrador',
      authRole: 'admin',
      adminPin: ADMIN_PIN
    }, 60000);
    report.steps.push({ step: 'cancelarLocacao', row: loc.rowIndex, ok: c.ok, id: loc.id, crianca: loc.crianca });
  }

  const limpar2 = await api({
    action: 'limparLocacoesTesteAdmin',
    adminPin: ADMIN_PIN,
    motivo: MOTIVO + ' pass2',
    soHoje: '1'
  });
  report.steps.push({ step: 'limpar2', total: limpar2.total });

  const final = await api({ action: 'listarAtivas' }, 60000);
  report.finalAtivas = (final.locacoes || []).length;
  report.finalTest = (final.locacoes || []).filter(isTestLoc);

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.finalTest.length ? 1 : 0);
})().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: e.message }));
  process.exit(1);
});
