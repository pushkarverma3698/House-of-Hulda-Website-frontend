const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = '/Users/pushkarverma/.gemini/antigravity/brain/776aad73-2b8a-4025-b35b-418b0c062470';

async function testScrollEnding(isMobile = false) {
  const modeName = isMobile ? 'Mobile' : 'Desktop';
  console.log(`\n======================================================`);
  console.log(`🧪 Testing Scroll Ending & Boundary Physics [${modeName}]`);
  console.log(`======================================================`);

  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext(
    isMobile
      ? {
          viewport: { width: 390, height: 844 },
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
          hasTouch: true,
          isMobile: true,
        }
      : {
          viewport: { width: 1440, height: 900 },
        }
  );

  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    const loc = msg.location();
    if (msg.type() === 'error' && !loc?.url?.includes('favicon.ico')) {
      consoleErrors.push(`[CONSOLE ERROR] ${msg.text()} (${loc?.url})`);
    }
  });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

  // Dismiss preloader
  const enterBtn = page.locator('text=Step Inside the Sanctuary');
  await enterBtn.waitFor({ state: 'visible', timeout: 15000 });
  await enterBtn.click();
  await page.waitForTimeout(800);

  // Wait for Lenis initialization
  await page.waitForFunction(() => window.__lenis != null);

  // Initial state check
  const initialState = await page.evaluate(() => {
    const lenis = window.__lenis;
    const wrapper = document.getElementById('scroll-wrapper');
    return {
      limit: lenis.limit,
      scrollHeight: wrapper.scrollHeight,
      clientHeight: wrapper.clientHeight,
      lerp: lenis.options.lerp,
    };
  });
  console.log('Initial setup state:', initialState);

  // Smooth scroll into final landing
  console.log('Simulating smooth arrival into destination (L-10)...');
  await page.evaluate(() => {
    return new Promise((resolve) => {
      const lenis = window.__lenis;
      lenis.scrollTo(lenis.limit, {
        duration: 1.5,
        onComplete: resolve,
      });
    });
  });

  await page.waitForTimeout(600);

  const pFinalState = await page.evaluate(() => {
    const lenis = window.__lenis;
    const l10 = document.getElementById('the-invitation');
    const h2 = l10.querySelector('h2');
    const h2Style = window.getComputedStyle(h2);
    const p = lenis.limit > 0 ? lenis.scroll / lenis.limit : 0;
    return {
      scroll: Math.round(lenis.scroll),
      limit: lenis.limit,
      progress: parseFloat(p.toFixed(4)),
      velocity: parseFloat(lenis.velocity.toFixed(3)),
      visuals: {
        h2Opacity: h2Style.opacity,
        h2Filter: h2Style.filter,
        h2Transform: h2Style.transform,
      }
    };
  });
  console.log('Final resting state (at limit 1.0):', pFinalState);

  const screenshotPath = path.join(ARTIFACTS_DIR, `verify_scroll_ending_${modeName.toLowerCase()}.png`);
  await page.screenshot({ path: screenshotPath });
  console.log(`📸 Screenshot captured: ${screenshotPath}`);

  if (consoleErrors.length > 0) {
    console.log('⚠️ Console errors detected:', consoleErrors);
  } else {
    console.log('✅ 0 Console errors detected (excluding favicon)');
  }

  await browser.close();

  return {
    initialState,
    pFinalState,
    hasNoErrors: consoleErrors.length === 0,
    reachedEndCleanly: pFinalState.progress === 1,
    visualsIntact: pFinalState.visuals.h2Opacity === '1' && pFinalState.visuals.h2Filter === 'blur(0px)',
  };
}

async function main() {
  const desktop = await testScrollEnding(false);
  const mobile = await testScrollEnding(true);

  console.log('\n================ SUMMARY ================');
  console.log('Desktop verification:', desktop);
  console.log('Mobile verification:', mobile);

  if (
    desktop.reachedEndCleanly &&
    desktop.visualsIntact &&
    desktop.hasNoErrors &&
    mobile.reachedEndCleanly &&
    mobile.visualsIntact &&
    mobile.hasNoErrors
  ) {
    console.log('\n🎉 ALL SCROLL ENDING TESTS PASSED EMPIRICALLY!');
    process.exit(0);
  } else {
    console.error('\n❌ SOME VERIFICATION CRITERIA FAILED');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
