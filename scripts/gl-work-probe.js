/**
 * Counts WebGL draw calls over a fixed window at two scroll positions: one
 * where the film covers the 3D scene completely, one where the scene is the
 * screen. Answers "is the sky being shaded while it is invisible" with a
 * number rather than an opinion.
 *
 * Usage:
 *   node scripts/gl-work-probe.js [width] [height] [dpr]
 */
const { chromium } = require('playwright')

const SAMPLE_MS = 2000

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

  // Instrument before any app code runs.
  await page.addInitScript(() => {
    window.__glDraws = 0
    for (const proto of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
      if (!proto) continue
      for (const fn of ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced']) {
        const original = proto.prototype[fn]
        if (!original) continue
        proto.prototype[fn] = function (...args) {
          window.__glDraws++
          return original.apply(this, args)
        }
      }
    }
  })

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
  await page.waitForTimeout(6000)

  const sampleAt = async (target) => {
    await page.evaluate((t) => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const to = max * t
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
    }, target)
    await page.waitForTimeout(1500)
    return page.evaluate((ms) => {
      const start = window.__glDraws
      return new Promise((resolve) => {
        setTimeout(() => resolve(window.__glDraws - start), ms)
      })
    }, SAMPLE_MS)
  }

  const hidden = await sampleAt(0.25)
  const visible = await sampleAt(0.85)

  console.log(JSON.stringify({
    window_ms: SAMPLE_MS,
    draws_while_film_covers_scene: hidden,
    draws_while_sky_is_the_screen: visible,
  }, null, 2))

  await browser.close()
})()
