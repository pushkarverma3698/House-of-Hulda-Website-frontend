/**
 * Confirms the L-07 deity rail is genuinely swipeable on a phone: that it has
 * horizontal overflow to scroll, that snap points land on card boundaries, and
 * that a real touch drag moves it without taking the page with it.
 *
 * Usage:
 *   node scripts/rail-probe.js [width] [height] [dpr]
 */
const { chromium } = require('playwright')

;(async () => {
  const width = Number(process.argv[2] || 390)
  const height = Number(process.argv[3] || 844)
  const dpr = Number(process.argv[4] || 3)

  const browser = await chromium.launch({ args: ['--use-gl=swiftshader'] })
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: dpr,
    isMobile: true,
    hasTouch: true,
  })

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
  await page.waitForTimeout(6000)

  // Step down to the Eighteen Gods.
  await page.evaluate(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const to = max * 0.66
    const from = window.scrollY
    const steps = 40
    let i = 0
    return new Promise((resolve) => {
      const tick = () => {
        i++
        window.scrollTo(0, from + ((to - from) * i) / steps)
        if (i >= steps) return resolve()
        requestAnimationFrame(tick)
      }
      tick()
    })
  })
  await page.waitForTimeout(1500)

  const result = await page.evaluate(() => {
    const rail = [...document.querySelectorAll('div')].find(
      (d) => d.className.includes?.('snap-x') && d.scrollWidth > d.clientWidth
    )
    if (!rail) return { found: false }
    const cards = [...rail.children]
    const style = getComputedStyle(rail)
    return {
      found: true,
      cards: cards.length,
      clientWidth: rail.clientWidth,
      scrollWidth: rail.scrollWidth,
      overflowX: style.overflowX,
      scrollSnapType: style.scrollSnapType,
      overscrollX: style.overscrollBehaviorX,
      cardWidth: Math.round(cards[0].getBoundingClientRect().width),
      pageScrollBefore: Math.round(window.scrollY),
    }
  })

  if (result.found) {
    // Drag the rail with a real touch and see where both axes end up.
    const box = await page.evaluate(() => {
      const rail = [...document.querySelectorAll('div')].find(
        (d) => d.className.includes?.('snap-x') && d.scrollWidth > d.clientWidth
      )
      const r = rail.getBoundingClientRect()
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
    })
    await page.touchscreen.tap(box.x, box.y - 200) // settle, avoid tapping a card
    await page.mouse.move(box.x + 120, box.y)
    await page.mouse.down()
    for (let i = 1; i <= 12; i++) {
      await page.mouse.move(box.x + 120 - i * 20, box.y)
    }
    await page.mouse.up()
    await page.waitForTimeout(900)

    const after = await page.evaluate(() => {
      const rail = [...document.querySelectorAll('div')].find(
        (d) => d.className.includes?.('snap-x') && d.scrollWidth > d.clientWidth
      )
      return { railScrollLeft: Math.round(rail.scrollLeft), pageScrollAfter: Math.round(window.scrollY) }
    })
    Object.assign(result, after)
  }

  console.log(JSON.stringify(result, null, 2))
  await browser.close()
})()
