const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });
  
  await page.goto('http://localhost:3000');
  
  // 1. Screenshot Preloader immediately
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/Users/pushkarverma/.gemini/antigravity/brain/659c9a80-e38a-42c8-822c-cd8bdc754371/ui_preloader.png' });
  
  // Wait for Preloader to finish
  await page.waitForTimeout(3000);
  
  // 2. Screenshot L-01
  await page.screenshot({ path: '/Users/pushkarverma/.gemini/antigravity/brain/659c9a80-e38a-42c8-822c-cd8bdc754371/ui_L01.png' });
  
  // 3. Scroll to L-09 and open Drawer
  await page.evaluate(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  });
  await page.waitForTimeout(2000);
  
  // Click Reserve The Stay
  await page.click('text=Reserve The Stay');
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: '/Users/pushkarverma/.gemini/antigravity/brain/659c9a80-e38a-42c8-822c-cd8bdc754371/ui_drawer.png' });
  
  await browser.close();
})();
