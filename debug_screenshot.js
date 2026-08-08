const { chromium } = require('playwright');

async function getScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  try {
    console.log('Navigating...');
    await page.goto('http://localhost:3000', { timeout: 15000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000); // wait for preloader
    
    // Screenshot 1: L-01
    await page.screenshot({ path: '/Users/pushkarverma/.gemini/antigravity/brain/659c9a80-e38a-42c8-822c-cd8bdc754371/debug_L01.png' });
    
    // Scroll to L-08 (t=0.85 approx)
    console.log('Scrolling to L-08...');
    await page.evaluate(() => {
      window.scrollTo({ top: document.body.scrollHeight * 0.85, behavior: 'auto' });
    });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/Users/pushkarverma/.gemini/antigravity/brain/659c9a80-e38a-42c8-822c-cd8bdc754371/debug_L08.png' });

    // Scroll to bottom (L-09)
    console.log('Scrolling to L-09...');
    await page.evaluate(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' });
    });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/Users/pushkarverma/.gemini/antigravity/brain/659c9a80-e38a-42c8-822c-cd8bdc754371/debug_L09.png' });

    console.log('Screenshots taken!');
  } catch (e) {
    console.error(e);
  }
  
  await browser.close();
}

getScreenshots().catch(console.error);
