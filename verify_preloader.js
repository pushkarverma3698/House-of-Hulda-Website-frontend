const { chromium } = require('playwright');

(async () => {
  console.log('Starting Playwright...');
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  let frameRequests = 0;
  const start = Date.now();

  page.on('request', request => {
    if (request.url().includes('/frames/hero/frame_')) {
      frameRequests++;
    }
  });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  
  console.log('Waiting for preloader to finish (should take ~2-6 seconds depending on network)...');
  
  // The preloader sets progress to 100 and then adds opacity-0 class
  // Wait for the opacity-0 class to appear on the preloader wrapper
  try {
    await page.waitForFunction(() => {
      const el = document.querySelector('.fixed.inset-0.z-50');
      return el && el.classList.contains('opacity-0');
    }, { timeout: 15000 });
    console.log(`Preloader finished after ${(Date.now() - start)}ms`);
  } catch (e) {
    console.log('Preloader wait timed out or element not found.', e);
  }

  console.log(`Total frame requests before preloader closed: ${frameRequests}`);
  
  if (frameRequests >= 78) {
    console.log('SUCCESS: All required frames were requested by the preloader.');
  } else {
    console.log('WARNING: Not all frames were requested before completion.');
  }

  await browser.close();
  process.exit(0);
})();
