const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/Users/pushkarverma/.gemini/antigravity/brain/659c9a80-e38a-42c8-822c-cd8bdc754371/ui_editorial_restored.png' });
  await browser.close();
})();
