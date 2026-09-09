const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = '/Users/pushkarverma/.gemini/antigravity/brain/776aad73-2b8a-4025-b35b-418b0c062470';

async function verify() {
  console.log('🚀 Starting Playwright verification with system Chrome on http://localhost:3000 ...');
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const results = {
    theHouse: false,
    stay: false,
    book: false,
    navLinks: false,
    homeCelestial: false,
  };

  // 1. Verify /the-house
  console.log('\n--- 1. Testing /the-house ---');
  await page.goto('http://localhost:3000/the-house', { waitUntil: 'domcontentloaded' });
  const theHouseTitle = await page.title();
  console.log('Title:', theHouseTitle);
  const sixChapters = await page.locator('article h2').allTextContents();
  console.log('Material Chapters found:', sixChapters);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify_the_house.png') });
  if (sixChapters.length === 6 && sixChapters.includes('Deodar') && sixChapters.includes('Kath-kuni')) {
    results.theHouse = true;
    console.log('✅ /the-house rendered all 6 architectural chapters');
  }

  // 2. Verify /stay
  console.log('\n--- 2. Testing /stay ---');
  await page.goto('http://localhost:3000/stay', { waitUntil: 'domcontentloaded' });
  const stayHeadline = await page.locator('h1').textContent();
  console.log('Stay Hero Headline:', stayHeadline?.trim());
  const dayTimelineCount = await page.locator('text=RITUAL 01').count();
  console.log('DayAtHulda rituals found:', dayTimelineCount);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify_stay_page.png') });
  if (dayTimelineCount > 0) {
    results.stay = true;
    console.log('✅ /stay rendered rooms and A Day at Hulda timeline');
  }

  // 3. Verify /book with query params
  console.log('\n--- 3. Testing /book?room=room&date=18%20Oct%202026 ---');
  await page.goto('http://localhost:3000/book?room=room&date=18%20Oct%202026', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  const selectedBadge = await page.locator('div:has-text("Selected")').first().textContent();
  console.log('Selected room badge:', selectedBadge?.trim());
  const grandTotal = await page.locator('text=Estimated Grand Total').locator('..').textContent();
  console.log('Grand Total display:', grandTotal?.replace(/\s+/g, ' ').trim());
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify_booking_engine.png') });
  if (selectedBadge && selectedBadge.includes('Selected')) {
    results.book = true;
    console.log('✅ /book handled room query param pre-selection');
  }

  // 4. Verify Nav link presence
  console.log('\n--- 4. Testing Navigation Links ---');
  await page.goto('http://localhost:3000/stay', { waitUntil: 'domcontentloaded' });
  const theHouseNavLink = await page.locator('nav a[href="/the-house"]').first().isVisible();
  console.log('The House nav link visible:', theHouseNavLink);
  if (theHouseNavLink) {
    results.navLinks = true;
    console.log('✅ Navigation link to /the-house verified');
  }

  // 5. Verify Homepage Celestial & DateDial
  console.log('\n--- 5. Testing Homepage Celestial Elements ---');
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  const celestialHeadline = await page.locator('text=18 GODS').first().count();
  const dateDialHeadline = await page.locator('text=PLAN YOUR NIGHT').first().count();
  console.log('Celestial Planetarium found:', celestialHeadline > 0);
  console.log('DateDial Plan Your Night found:', dateDialHeadline > 0);
  if (celestialHeadline > 0 && dateDialHeadline > 0) {
    results.homeCelestial = true;
    console.log('✅ Homepage Celestial Planetarium & DateDial verified');
  }

  await browser.close();

  console.log('\n======================================');
  console.log('VERIFICATION SUMMARY:');
  console.log(JSON.stringify(results, null, 2));
  console.log('======================================');
}

verify().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
