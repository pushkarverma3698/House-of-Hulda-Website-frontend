const { chromium } = require('playwright');

async function getConsoleLogs() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => logs.push(`[pageerror] ${err.message}`));
  
  try {
    await page.goto('http://localhost:3000', { timeout: 10000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000); // wait a bit to let React render/crash
  } catch (e) {
    logs.push(`[navigation error] ${e.message}`);
  }
  
  console.log('--- CONSOLE LOGS ---');
  console.log(logs.join('\n'));
  console.log('--------------------');
  
  await browser.close();
}

getConsoleLogs().catch(console.error);
