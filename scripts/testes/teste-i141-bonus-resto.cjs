#!/usr/bin/env node
/**
 * I141 — bônus Q2 = resto (mês − pago na 1ª); memorial Ray/Julia 07/2026.
 * Roda sem browser: carrega mk-holerite.js no globalThis.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../..');
const src = fs.readFileSync(path.join(root, 'mk-holerite.js'), 'utf8');
eval(src); // eslint-disable-line no-eval

const g = globalThis;
let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    failed += 1;
    console.error('FAIL:', msg);
  } else {
    console.log('OK:', msg);
  }
}

assert(typeof g.mkHolBonusRestoQ2_ === 'function', 'export mkHolBonusRestoQ2_');
assert(g.mkHolBonusRestoQ2_(850, 150) === 700, 'Ray resto 850−150=700');
assert(g.mkHolBonusRestoQ2_(850, 100) === 750, 'Julia resto 850−100=750');
assert(g.mkHolBonusRestoQ2_(100, 150) === 0, 'resto nunca negativo');

const memRay = g.mkHolQ1PagoMemorial_(3, '07/2026');
const memJul = g.mkHolQ1PagoMemorial_(4, '7/2026');
assert(memRay && memRay.bonus === 150 && memRay.pacote === 998.4, 'memorial Ray 150/998.40');
assert(memJul && memJul.bonus === 100 && memJul.pacote === 948.4, 'memorial Julia 100/948.40');

function holGasQ2(bonusMes) {
  // Simula GAS legado: 50% do mês final na 2ª
  const liquido = 752.22;
  const va = 200;
  const bonusGas = Math.round(bonusMes * 0.5 * 100) / 100;
  return {
    quinzena: 2,
    competencia: '07/2026',
    base: 972.6,
    liquido: liquido,
    bruto: 1621,
    bonus: bonusGas,
    bonusMes: bonusMes,
    vaTotal: va,
    vaMensal: 400,
    incluiBeneficios: true,
    pixQuinzena: Math.round((liquido + bonusGas) * 100) / 100,
    pacoteQuinzena: Math.round((liquido + bonusGas + va) * 100) / 100,
    vtPasses: 96.8,
    pctBeneficios: 0.5
  };
}

const ray = g.mkHolNormalizeHol_(holGasQ2(850), { opId: 3, comp: '07/2026' });
assert(ray.bonusRegra === 'resto', 'Ray regra=resto');
assert(ray.bonus === 700, 'Ray bônus Q2=700 (não 425)');
assert(ray.bonusQ1Pago === 150, 'Ray Q1 pago=150');
assert(Math.abs(ray.pixQuinzena - 1452.22) < 0.01, 'Ray PIX=1452.22');
assert(Math.abs(ray.pacoteQuinzena - 1652.22) < 0.01, 'Ray pacote=1652.22');
assert(ray.vtPasses === 0, 'VT nunca no pacote');

const jul = g.mkHolNormalizeHol_(holGasQ2(850), { opId: 4, comp: '07/2026' });
assert(jul.bonus === 750, 'Julia bônus Q2=750');
assert(jul.bonusQ1Pago === 100, 'Julia Q1 pago=100');
assert(Math.abs(jul.pixQuinzena - 1502.22) < 0.01, 'Julia PIX=1502.22');
assert(Math.abs(jul.pacoteQuinzena - 1702.22) < 0.01, 'Julia pacote=1702.22');

const htmlRay = g.mkHolBuildHtml_({
  folha: { id: 3, nome: 'Raykelly', base: 972.6, bonus: 425, bonusDias: 13, holerite: holGasQ2(850) },
  colab: { id: 3, nome: 'Raykelly', funcao: 'Operadora', admissao: '01/06/2026' },
  comp: '07/2026',
  toolbar: false
});
assert(htmlRay.indexOf('1.652,22') >= 0 || htmlRay.indexOf('1652,22') >= 0, 'HTML Ray pacote 1.652,22');
assert(htmlRay.indexOf('R$ 700,00') >= 0, 'HTML Ray bônus 700');
assert(htmlRay.indexOf('R$ 150,00') >= 0, 'HTML Ray já pago 150');
assert(htmlRay.toLowerCase().indexOf('resto') >= 0, 'HTML Ray menciona resto');

const htmlJul = g.mkHolBuildHtml_({
  folha: { id: 4, nome: 'Julia', base: 972.6, bonus: 425, bonusDias: 13, holerite: holGasQ2(850) },
  colab: { id: 4, nome: 'Julia', funcao: 'Operadora', admissao: '01/06/2026' },
  comp: '07/2026',
  toolbar: false
});
assert(htmlJul.indexOf('1.702,22') >= 0 || htmlJul.indexOf('1702,22') >= 0, 'HTML Julia pacote 1.702,22');
assert(htmlJul.indexOf('R$ 750,00') >= 0, 'HTML Julia bônus 750');
assert(htmlJul.indexOf('R$ 100,00') >= 0, 'HTML Julia já pago 100');

// Sem memorial → aviso (não inventar 50%)
const sem = g.mkHolNormalizeHol_(Object.assign(holGasQ2(850), { competencia: '08/2026' }), { opId: 3, comp: '08/2026' });
assert(sem.bonusRegra === 'incompleta', 'sem memorial = regra incompleta');
assert(sem.bonus === 425, 'sem memorial mantém GAS (não inventa)');

if (failed) {
  console.error('\nI141 FALHOU:', failed, 'assert(s)');
  process.exit(1);
}
console.log('\nI141 OK — ambos holerites (Ray 700/1652.22 · Julia 750/1702.22)');
process.exit(0);
