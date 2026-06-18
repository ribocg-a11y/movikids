import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const feUrl = process.env.MK_FE_URL || 'https://ribocg-a11y.github.io/movikids/?force=1.8.20';
const adminPin = process.env.MK_ADMIN_PIN || '1416';
const js = readFileSync(join(__dirname, 'TESTE_ALERTAS_TABLET_BROWSER.js'), 'utf8');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await page.goto(feUrl, { waitUntil: 'networkidle', timeout: 90000 });
  await page.click('#mk-hub-admin', { timeout: 20000 });
  await page.waitForSelector('#mk-step-admin:not(.hidden)', { timeout: 15000 });
  const pinInputs = page.locator('#mk-admin-pin input.mk-pin-box');
  for (let i = 0; i < adminPin.length; i++) {
    await pinInputs.nth(i).fill(adminPin[i]);
  }
  await page.click('#mk-btn-admin-login');
  await page.waitForFunction(() => {
    const a = document.getElementById('app');
    return a && getComputedStyle(a).display !== 'none';
  }, null, { timeout: 60000 });
  await page.waitForFunction(() => typeof api === 'function' && typeof checkTimer === 'function', null, { timeout: 60000 });
  const result = await page.evaluate(async (code) => {
    return await eval(code);
  }, js);
  console.log(JSON.stringify({ ok: !!(result && result.ok), result }, null, 2));
  process.exit(result && result.ok ? 0 : 1);
} catch (e) {
  console.log(JSON.stringify({ ok: false, error: e.message, stack: e.stack }, null, 2));
  process.exit(1);
} finally {
  await browser.close();
}
