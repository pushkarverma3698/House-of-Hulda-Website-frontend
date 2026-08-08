const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  
  // Wait for preloader to disappear
  console.log('Waiting for preloader...');
  await page.waitForTimeout(4000);
  
  console.log('Capturing L-08 Marketplace...');
  // Scroll to L-08 which is around t=0.80 -> 0.90
  await page.evaluate(() => {
    window.scrollTo({ top: document.body.scrollHeight * 0.85, behavior: 'auto' });
  });
  await page.waitForTimeout(2000); // allow canvas and UI to settle
  await page.screenshot({ path: 'marketplace.png' });
  
  console.log('Capturing L-09 Booking Drawer...');
  // Scroll to the end
  await page.evaluate(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' });
  });
  await page.waitForTimeout(1000);
  
  // Click 'Reserve The Stay'
  const reserveBtn = await page.$('text=Reserve The Stay');
  if (reserveBtn) {
    await reserveBtn.click();
    console.log('Clicked Reserve The Stay');
  } else {
    console.log('Could not find Reserve The Stay button');
  }
  
  await page.waitForTimeout(2000); // wait for drawer animation
  await page.screenshot({ path: 'booking_drawer.png' });

  await browser.close();
  
  // Move screenshots to artifacts dir so the user can see them
  const brainDir = '/Users/pushkarverma/.gemini/antigravity/brain/659c9a80-e38a-42c8-822c-cd8bdc754371/';
  fs.renameSync('marketplace.png', path.join(brainDir, 'marketplace.png'));
  fs.renameSync('booking_drawer.png', path.join(brainDir, 'booking_drawer.png'));
  console.log('Screenshots saved to artifacts.');
}

captureScreenshots().catch(console.error);
