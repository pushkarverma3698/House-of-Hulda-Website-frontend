const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  
  // Ensure videos directory exists
  if (!fs.existsSync('videos')) {
    fs.mkdirSync('videos');
  }

  const iPhone = devices['iPhone 14 Pro Max'];
  const context = await browser.newContext({
    ...iPhone,
    recordVideo: {
      dir: 'videos/',
    }
  });

  const page = await context.newPage();
  
  console.log("Navigating to localhost:3000...");
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });

  console.log("Waiting for preloader to finish (6s)...");
  await page.waitForTimeout(6000);

  console.log("Starting cinematic scroll...");
  // Simulate an incredibly smooth thumb scrub (100 ticks, very slow)
  for (let i = 0; i < 150; i++) {
    await page.mouse.wheel(0, 40);
    await page.waitForTimeout(20);
  }

  // Pause to show the sky shifting to golden hour
  console.log("Pausing for golden hour...");
  await page.waitForTimeout(2500);

  // Scroll into the night
  console.log("Scrolling into the night...");
  for (let i = 0; i < 120; i++) {
    await page.mouse.wheel(0, 50);
    await page.waitForTimeout(20);
  }

  console.log("Pausing for the deep night sky...");
  await page.waitForTimeout(2500);

  // Open the navigation menu
  console.log("Tapping the mobile menu...");
  await page.click('button[aria-label="Toggle navigation menu"]');
  await page.waitForTimeout(1500);

  // Tap "Reserve" in the navigation
  console.log("Tapping Reserve CTA...");
  await page.click('text=Reserve');

  console.log("Waiting for Booking Drawer/Page to open...");
  await page.waitForTimeout(3000);

  // Scroll a bit inside the booking page to show the layout
  console.log("Scrolling inside the Booking page...");
  for (let i = 0; i < 50; i++) {
    await page.mouse.wheel(0, 60);
    await page.waitForTimeout(20);
  }
  
  await page.waitForTimeout(2000);

  console.log("Finalizing video...");
  const videoPath = await page.video().path();
  await context.close();
  await browser.close();

  console.log(`Demo recorded successfully: ${videoPath}`);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
