const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(3500);
  await page.screenshot({ path: '/Users/pushkarverma/.gemini/antigravity/brain/659c9a80-e38a-42c8-822c-cd8bdc754371/view_t0.png' });

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.35));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/Users/pushkarverma/.gemini/antigravity/brain/659c9a80-e38a-42c8-822c-cd8bdc754371/view_t35.png' });

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.70));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/Users/pushkarverma/.gemini/antigravity/brain/659c9a80-e38a-42c8-822c-cd8bdc754371/view_t70.png' });

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.90));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/Users/pushkarverma/.gemini/antigravity/brain/659c9a80-e38a-42c8-822c-cd8bdc754371/view_t90.png' });

  await browser.close();
  console.log('Done capturing screenshots!');
})();
