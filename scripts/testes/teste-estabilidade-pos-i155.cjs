#!/usr/bin/env node
/**
 * Bateria estabilidade MOVI KIDS pós-I155 (08/09/2026)
 * - latency / HTML404 rate
 * - lookback I155
 * - parity listarAtivas × carregarInicio
 * - endpoints críticos readonly
 */
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https'); // unused kept for clarity — fetch is used
const http = require('http');

const GAS =
  'https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec';
const PAGES = 'https://ribocg-a11y.github.io/movikids';
const ADMIN_PIN = process.env.MK_ADMIN_PIN || '1421';

async function fetchRaw(url, timeoutMs = 60000) {
  const t0 = Date.now();
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ac.signal,
      redirect: 'follow',
      headers: { Accept: 'application/json,text/plain,*/*' },
    });
    const data = await res.text();
    const ms = Date.now() - t0;
    const ct = String(res.headers.get('content-type') || '');
    let json = null;
    let kind = 'other';
    if (/text\/html/i.test(ct) || /^\s*<!DOCTYPE/i.test(data) || /unable to open the file/i.test(data)) {
      kind = 'html404';
    } else {
      try {
        json = JSON.parse(data);
        kind = json && json.ok === false ? 'json_err' : 'json_ok';
      } catch (e) {
        kind = res.status >= 400 ? 'http_' + res.status : 'non_json';
      }
    }
    return {
      ok: kind === 'json_ok',
      kind,
      ms,
      status: res.status,
      json,
      snippet: data.slice(0, 120).replace(/\s+/g, ' '),
    };
  } catch (e) {
    const ms = Date.now() - t0;
    const name = e && e.name === 'AbortError' ? 'timeout' : 'net_' + ((e && e.code) || 'err');
    return { ok: false, kind: name, ms, status: 0, json: null, snippet: String((e && e.message) || e) };
  } finally {
    clearTimeout(timer);
  }
}

function gas(action, params = {}, timeoutMs = 60000) {
  const q = new URLSearchParams({ action, ...params });
  return fetchRaw(`${GAS}?${q.toString()}`, timeoutMs);
}

function pct(n, d) {
  return d ? ((100 * n) / d).toFixed(1) + '%' : 'n/a';
}

function stats(arr) {
  if (!arr.length) return { n: 0 };
  const s = [...arr].sort((a, b) => a - b);
  const sum = s.reduce((a, b) => a + b, 0);
  return {
    n: s.length,
    min: s[0],
    p50: s[Math.floor((s.length - 1) * 0.5)],
    p90: s[Math.floor((s.length - 1) * 0.9)],
    max: s[s.length - 1],
    avg: Math.round(sum / s.length),
  };
}

async function battery(action, n, params = {}, timeoutMs = 60000, gapMs = 400) {
  const results = [];
  for (let i = 0; i < n; i++) {
    results.push(await gas(action, params, timeoutMs));
    if (gapMs && i < n - 1) await new Promise((r) => setTimeout(r, gapMs));
  }
  const ok = results.filter((r) => r.ok);
  const html404 = results.filter((r) => r.kind === 'html404');
  const timeouts = results.filter((r) => r.kind === 'timeout');
  const otherFail = results.filter((r) => !r.ok && r.kind !== 'html404' && r.kind !== 'timeout');
  return {
    action,
    n,
    ok: ok.length,
    html404: html404.length,
    timeouts: timeouts.length,
    otherFail: otherFail.length,
    okRate: pct(ok.length, n),
    html404Rate: pct(html404.length, n),
    latencyOkMs: stats(ok.map((r) => r.ms)),
    latencyAllMs: stats(results.map((r) => r.ms)),
    kinds: results.map((r) => `${r.kind}:${r.ms}ms`),
    lastOk: ok.length ? ok[ok.length - 1].json : null,
  };
}

async function main() {
  const report = {
    suite: 'ESTABILIDADE_POS_I155',
    startedAt: new Date().toISOString(),
    checks: [],
  };
  const add = (name, status, detail, extra) => {
    report.checks.push({ name, status, detail, ...(extra || {}) });
    const icon = status === 'ok' ? '✅' : status === 'warn' ? '⚠️' : '❌';
    console.log(`${icon} ${name}: ${detail}`);
  };

  // ── FE / Pages ──
  const ver = await fetchRaw(`${PAGES}/mk-version.js`, 15000);
  const verM = (ver.snippet || '').match(/MK_VERSION\s*=\s*['"]([^'"]+)/);
  add('fe.pages.version', verM && verM[1] === '1.9.114' ? 'ok' : 'fail', verM ? verM[1] : ver.kind);

  const sw = await fetchRaw(`${PAGES}/sw.js`, 15000);
  const swM = (sw.snippet || '').match(/SW_VERSION\s*=\s*['"]([^'"]+)/);
  add('fe.pages.sw', swM && swM[1] === '1.9.114' ? 'ok' : 'warn', swM ? swM[1] : sw.kind);

  // ── Ping battery ──
  const pingB = await battery('ping', 12, {}, 90000, 300);
  add(
    'battery.ping',
    pingB.html404 === 0 && pingB.ok >= 11 ? 'ok' : pingB.ok >= 10 ? 'warn' : 'fail',
    `ok=${pingB.ok}/12 html404=${pingB.html404} p50=${pingB.latencyOkMs.p50}ms max=${pingB.latencyAllMs.max}ms`,
    pingB
  );
  const pingVer = pingB.lastOk && pingB.lastOk.versao;
  add('gas.ping.versao', pingVer === 'v1.5.220' ? 'ok' : 'fail', String(pingVer || 'n/a'));

  // ── listarAtivas battery (critical path) ──
  const laB = await battery('listarAtivas', 10, {}, 60000, 500);
  const lookback = laB.lastOk && laB.lastOk.lookback;
  add(
    'battery.listarAtivas',
    laB.html404 === 0 && laB.ok >= 9 ? 'ok' : laB.ok >= 7 ? 'warn' : 'fail',
    `ok=${laB.ok}/10 html404=${laB.html404} lookback=${lookback} p50=${laB.latencyOkMs.p50}ms max=${laB.latencyAllMs.max}ms`,
    laB
  );
  add(
    'i155.lookback.ativas',
    lookback === 600 ? 'ok' : 'fail',
    `lookback=${lookback}`
  );

  // cache hit probe: 3 calls back-to-back (should be faster after first)
  const cacheProbe = [];
  for (let i = 0; i < 3; i++) cacheProbe.push(await gas('listarAtivas', {}, 60000));
  const cacheOk = cacheProbe.filter((r) => r.ok);
  const cacheMs = cacheOk.map((r) => r.ms);
  add(
    'i155.cache.probe',
    cacheOk.length === 3 && cacheMs[1] < 8000 && cacheMs[2] < 8000
      ? 'ok'
      : cacheOk.length === 3
        ? 'warn'
        : 'fail',
    `ms=[${cacheMs.join(',')}] (2º/3º esperados <8s se cache 8s)`
  );

  // ── carregarInicio ──
  const ciB = await battery('carregarInicio', 5, {}, 60000, 600);
  const ciLook = ciB.lastOk && ciB.lastOk.lookback;
  add(
    'battery.carregarInicio',
    ciB.html404 === 0 && ciB.ok >= 4 ? 'ok' : ciB.ok >= 3 ? 'warn' : 'fail',
    `ok=${ciB.ok}/5 html404=${ciB.html404} lookback=${ciLook} p50=${ciB.latencyOkMs.p50}ms max=${ciB.latencyAllMs.max}ms`,
    ciB
  );
  add('i155.lookback.inicio', ciLook === 600 ? 'ok' : 'fail', `lookback=${ciLook}`);

  // ── Paridade ──
  const la = await gas('listarAtivas', {}, 60000);
  const ci = await gas('carregarInicio', {}, 60000);
  if (la.ok && ci.ok) {
    const idsLa = new Set((la.json.locacoes || []).map((x) => String(x.id)));
    const idsCi = new Set((ci.json.ativos || []).map((x) => String(x.id)));
    const onlyLa = [...idsLa].filter((id) => !idsCi.has(id));
    const onlyCi = [...idsCi].filter((id) => !idsLa.has(id));
    const same = onlyLa.length === 0 && onlyCi.length === 0;
    add(
      'parity.ativas',
      same ? 'ok' : 'fail',
      `listar=${idsLa.size} inicio=${idsCi.size}` +
        (same ? '' : ` onlyLa=${onlyLa.join(',')} onlyCi=${onlyCi.join(',')}`)
    );
    // startTimestamp on Ativa
    const ativas = (la.json.locacoes || []).filter((x) => x.status === 'Ativa');
    const badTs = ativas.filter((x) => !x.startTimestamp || Number(x.startTimestamp) <= 0);
    add(
      'i43.startTimestamp',
      badTs.length === 0 ? 'ok' : 'fail',
      `ativas=${ativas.length} semTs=${badTs.map((x) => x.id).join(',') || 0}`
    );
  } else {
    add('parity.ativas', 'fail', `la=${la.kind} ci=${ci.kind}`);
  }

  // ── Endpoints críticos readonly ──
  const endpoints = [
    ['validarSchema', {}, 90000],
    ['resumoDia', {}, 90000],
    ['listarHistorico', { dias: '1' }, 90000],
    ['listarAuditoriaAdmin', { adminPin: ADMIN_PIN, lookback: '200' }, 90000],
    ['operacaoConfig', {}, 30000],
  ];
  for (const [action, params, to] of endpoints) {
    const r = await gas(action, params, to);
    let detail = `${r.kind} ${r.ms}ms`;
    let status = r.ok ? 'ok' : r.kind === 'html404' ? 'warn' : 'fail';
    if (r.ok && action === 'validarSchema') {
      detail += ` schemaOk=${r.json.schemaOk != null ? r.json.schemaOk : r.json.ok}`;
    }
    if (r.ok && action === 'listarAuditoriaAdmin') {
      const rows = r.json.rows || r.json.itens || r.json.auditoria || [];
      const top = rows[0];
      const topData = top && (top.data || top.Data || top[1] || '');
      detail += ` n=${rows.length} top=${topData}`;
      // I154: top should be recent (08/09 or today-ish), not 31/08 sort bug
      if (String(topData).startsWith('31/')) status = 'warn';
    }
    if (r.ok && action === 'resumoDia') {
      const s = r.json.stats || r.json.resumo || r.json;
      detail += ` n=${s.n != null ? s.n : '?'} nSessoes=${s.nSessoes != null ? s.nSessoes : '?'}`;
    }
    add(`endpoint.${action}`, status, detail);
  }

  // ── Concurrent stress (3 parallel listarAtivas) ──
  const tConc = Date.now();
  const conc = await Promise.all([
    gas('listarAtivas', {}, 60000),
    gas('listarAtivas', {}, 60000),
    gas('carregarInicio', {}, 60000),
  ]);
  const concOk = conc.filter((r) => r.ok).length;
  const conc404 = conc.filter((r) => r.kind === 'html404').length;
  add(
    'stress.concurrent3',
    conc404 === 0 && concOk === 3 ? 'ok' : concOk >= 2 ? 'warn' : 'fail',
    `ok=${concOk}/3 html404=${conc404} wall=${Date.now() - tConc}ms kinds=${conc.map((r) => r.kind + ':' + r.ms).join('|')}`
  );

  // ── FE reliability static (local files) ──
  const root = path.resolve(__dirname, '../..');
  const read = (f) => {
    try {
      return fs.readFileSync(path.join(root, f), 'utf8');
    } catch (e) {
      return '';
    }
  };
  const api = read('mk-api.js');
  const off = read('mk-offline-queue.js');
  const sync = read('mk-sync.js');
  add(
    'fe.i154.gas-unstable',
    api.includes('gas-unstable') && off.includes('gas-unstable') ? 'ok' : 'fail',
    'HTML/404 → fila offline'
  );
  add('fe.i154b.retry', api.includes('isUnstableErr_') && api.includes('I154b') ? 'ok' : 'fail', 'retry 1x 404/5xx');
  add(
    'fe.i154b.timeout45',
    /MK_LISTAR_ATIVAS_TIMEOUT_MS\s*=\s*45000/.test(sync) ? 'ok' : 'fail',
    'listarAtivas timeout 45s'
  );
  add(
    'fe.i151.reconcile',
    sync.includes('mkReconcileFantasmasEmergencia_') || read('mk-core.js').includes('mkReconcileFantasmasEmergencia_')
      ? 'ok'
      : 'warn',
    'reconcile fantasma'
  );

  // Summary
  const fails = report.checks.filter((c) => c.status === 'fail');
  const warns = report.checks.filter((c) => c.status === 'warn');
  report.status = fails.length ? 'fail' : warns.length ? 'warn' : 'ok';
  report.summary = `fail=${fails.length} warn=${warns.length} ok=${report.checks.length - fails.length - warns.length}`;
  report.finishedAt = new Date().toISOString();

  console.log('\n=== RESUMO ===');
  console.log(report.summary);
  console.log(JSON.stringify({ status: report.status, fails: fails.map((f) => f.name), warns: warns.map((w) => w.name) }, null, 2));

  const outPath = path.join(root, 'docs/ativos/EVIDENCIA_ESTABILIDADE_POS_I155_2026-09-08.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log('wrote', outPath);
  process.exit(fails.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
