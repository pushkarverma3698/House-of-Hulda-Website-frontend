/**
 * Design-audit capture rig.
 *
 * Walks the film at fixed scroll fractions and captures a frame at each, at a
 * given viewport, so two branches can be compared like with like. Scrolls in
 * steps rather than jumping, because the frame cache is filled by a sweep that
 * starts at frame 1 — a jump lands on frames that are not resident yet and
 * captures black.
 *
 * Usage:
 *   node scripts/audit-shots.js <outDir> [width] [height] [dpr]
 */
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const STOPS = [0.0, 0.08, 0.2, 0.32, 0.45, 0.58, 0.68, 0.75, 0.85, 0.95]

;(async () => {
  const outDir = process.argv[2] || 'shots/audit'
  const width = Number(process.argv[3] || 1512)
  const height = Number(process.argv[4] || 900)
  const dpr = Number(process.argv[5] || 2)

  fs.mkdirSync(outDir, { recursive: true })

  const browser = await chromium.launch({ args: ['--use-gl=swiftshader'] })
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: dpr,
    isMobile: width < 768,
    hasTouch: width < 768,
  })

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
  // Let the proxy sweep make the sequence resident before scrubbing.
  await page.waitForTimeout(6000)

  for (const stop of STOPS) {
    // Step into position so the cache is never asked for a frame it has not
    // had a chance to fetch.
    await page.evaluate((target) => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const to = max * target
      const from = window.scrollY
      const steps = 24
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
    }, stop)
    // Long enough for the sharp tier to land and the focus-in fade to finish.
    await page.waitForTimeout(2500)

    const name = `t${String(Math.round(stop * 100)).padStart(3, '0')}.png`
    await page.screenshot({ path: path.join(outDir, name) })
    process.stdout.write(`${name} `)
  }

  await browser.close()
  console.log(`\ncaptured ${STOPS.length} stops -> ${outDir}`)
})()
