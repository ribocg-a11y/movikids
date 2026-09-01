#!/usr/bin/env node
/**
 * I150 / I150b — cenários financeiros Dashboard (readonly)
 * Base DRE · Projetado 3m · Ritmo 3d — validação contra kpiMes GAS
 */
'use strict';

const BASE =
  process.env.MK_GAS_EXEC ||
  'https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec';
const ADMIN_PIN = process.env.MK_ADMIN_PIN || '1421';

const checks = [];
let status = 'ok';

function add(name, st, detail = '') {
  checks.push({ name, status: st, detail });
  if (st === 'fail') status = 'fail';
  else if (st === 'warn' && status === 'ok') status = 'warn';
}

async function api(params) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}?${q}`, { redirect: 'follow' });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`JSON inválido (${params.action}): ${text.slice(0, 200)}`);
  }
}

function near(a, b, tol = 1) {
  return Math.abs(Number(a) - Number(b)) <= tol;
}

(async () => {
  const startedAt = new Date().toISOString();

  try {
    const ping = await api({ action: 'ping' });
    if (!ping.ok) throw new Error('ping falhou');
    add('ping', 'ok', ping.versao || ping.sistema);

    const kpi = await api({ action: 'kpiMes', adminPin: ADMIN_PIN, mes: 8, ano: 2026 });
    if (!kpi.ok) throw new Error(`kpiMes: ${kpi.erro || 'fail'}`);
    add('kpiMes.ago2026', 'ok', `fatMes=${kpi.fatMes} nMes=${kpi.nMes}`);

    const cf = kpi.cenariosFinanceiros;
    if (!cf || typeof cf !== 'object') {
      add('cenariosFinanceiros', 'fail', 'campo ausente — GAS precisa v1.5.214+');
      throw new Error('cenariosFinanceiros ausente');
    }
    add('cenariosFinanceiros', 'ok', 'presente');

    const required = [
      'baseDreMes',
      'baseDreManutencao',
      'projetado3mMes',
      'ritmo3dMes',
      'ritmo3dDiaria',
      'baseDreDetalhe',
    ];
    for (const k of required) {
      if (cf[k] == null) add(`cf.${k}`, 'fail', 'null');
      else add(`cf.${k}`, 'ok', String(cf[k]).slice(0, 80));
    }

    if (Number(cf.baseDreManutencao) !== 1200) {
      add('I150b.manutencao', 'fail', `esperado 1200, got ${cf.baseDreManutencao}`);
    } else {
      add('I150b.manutencao', 'ok', 'R$ 1200/mês');
    }

    if (!near(cf.projetado3mMes, 11875.2, 5)) {
      add('projetado3m.ref', 'warn', `ago/26 ref ~11875, got ${cf.projetado3mMes}`);
    } else {
      add('projetado3m.ref', 'ok', String(cf.projetado3mMes));
    }

    if (!near(cf.ritmo3dMes, kpi.fatMes, 0.01)) {
      add('ritmo.fechado', 'fail', `ritmo3dMes ${cf.ritmo3dMes} != fatMes ${kpi.fatMes}`);
    } else {
      add('ritmo.fechado', 'ok', 'mês fechado = real acumulado');
    }

    if (cf.baseDreMes >= cf.projetado3mMes && cf.projetado3mMes > 0) {
      add('base.lt.projetado.ago', 'warn', 'ago/26 base DRE > projetado 3m (esperado neste mês)');
    } else {
      add('base.lt.projetado.ago', 'ok', 'base DRE abaixo projetado 3m');
    }

    const legacy = await api({ action: 'buscarKPIsAdmin', adminPin: ADMIN_PIN, mes: 8, ano: 2026 });
    if (!legacy.ok) throw new Error(`buscarKPIsAdmin: ${legacy.erro}`);
    if (legacy.fatMes !== kpi.fatMes || legacy.nMes !== kpi.nMes) {
      add('paridade.kpi', 'fail', `legacy fat=${legacy.fatMes} n=${legacy.nMes}`);
    } else {
      add('paridade.kpi', 'ok', 'kpiMes = buscarKPIsAdmin');
    }

    const schema = await api({ action: 'validarSchema' });
    const dash = schema.resultado?.DASHBOARD;
    if (dash?.ok) add('validarSchema.DASHBOARD', 'ok', 'ok');
    else add('validarSchema.DASHBOARD', 'warn', `erros=${(dash?.faltando || []).length}`);

    const ativas = await api({ action: 'listarAtivas' });
    add('listarAtivas', ativas.ok ? 'ok' : 'fail', `total=${ativas.total ?? '?'}`);
  } catch (e) {
    status = 'fail';
    add('exception', 'fail', e.message);
  }

  const out = {
    test: 'I150-cenarios-financeiros',
    status,
    startedAt,
    finishedAt: new Date().toISOString(),
    checks,
  };
  console.log(JSON.stringify(out, null, 2));
  process.exit(status === 'fail' ? 1 : 0);
})();
