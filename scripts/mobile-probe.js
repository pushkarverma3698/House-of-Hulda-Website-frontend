/**
 * Mobile experience probe.
 *
 * Answers questions a desktop audit cannot: how tall is this page in thumb-
 * flicks, what is on screen while the visitor is falling for the place, what is
 * still rendering that nobody can see, and where do the tap targets sit
 * relative to the parts of the screen a hand can actually reach.
 *
 * Usage:
 *   node scripts/mobile-probe.js [width] [height] [dpr]
 */
const { chromium } = require('playwright')

const STOPS = [0, 0.12, 0.25, 0.38, 0.5, 0.62, 0.72, 0.85, 0.96, 1]

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

  // ── Page shape ────────────────────────────────────────────────────────────
  const shape = await page.evaluate(() => {
    const doc = document.documentElement
    return {
      scrollHeight: doc.scrollHeight,
      viewport: window.innerHeight,
      screens: +(doc.scrollHeight / window.innerHeight).toFixed(1),
      filmFit: doc.dataset.filmFit ?? '(unset)',
      canvases: [...document.querySelectorAll('canvas')].map((c) => ({
        w: c.width,
        h: c.height,
        cssW: Math.round(c.getBoundingClientRect().width),
        cssH: Math.round(c.getBoundingClientRect().height),
      })),
    }
  })

  // ── Sections in scroll-fraction space ─────────────────────────────────────
  const sections = await page.evaluate(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    return [...document.querySelectorAll('main > div > section')].map((s, i) => {
      const r = s.getBoundingClientRect()
      const top = r.top + window.scrollY
      return {
        i: i + 1,
        px: Math.round(r.height),
        enters: +(top / max).toFixed(3),
        centred: +((top + r.height / 2 - window.innerHeight / 2) / max).toFixed(3),
      }
    })
  })

  // ── Tap targets under 44px, and where fixed chrome sits ───────────────────
  const targets = await page.evaluate(() => {
    const small = []
    for (const el of document.querySelectorAll('a,button,[role="button"]')) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      if (r.width < 44 || r.height < 44) {
        small.push({
          tag: el.tagName,
          label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40),
          w: Math.round(r.width),
          h: Math.round(r.height),
        })
      }
    }
    const fixed = []
    for (const el of document.querySelectorAll('body *')) {
      if (getComputedStyle(el).position !== 'fixed') continue
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      fixed.push({
        cls: (el.className.toString?.() || '').slice(0, 40),
        top: Math.round(r.top),
        bottom: Math.round(window.innerHeight - r.bottom),
        h: Math.round(r.height),
      })
    }
    return { small, fixed: fixed.slice(0, 12) }
  })

  // ── Walk the story, reporting what a visitor can act on at each stop ──────
  const walk = []
  for (const stop of STOPS) {
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
    await page.waitForTimeout(1200)

    const at = await page.evaluate(() => {
      const vh = window.innerHeight
      const vw = window.innerWidth
      const onScreen = (el) => {
        const r = el.getBoundingClientRect()
        return r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw &&
          getComputedStyle(el).visibility !== 'hidden' &&
          +getComputedStyle(el).opacity > 0.05
      }
      // Anything that takes the visitor toward booking.
      const ctas = [...document.querySelectorAll('a,button')]
        .filter((el) => /reserve|book|whatsapp|enquir|stay/i.test(
          (el.getAttribute('aria-label') || el.textContent || '')
        ))
        .filter(onScreen)
        .map((el) => {
          const r = el.getBoundingClientRect()
          return {
            label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 24),
            y: Math.round(r.top),
          }
        })

      const film = document.querySelector('canvas')
      const gl = document.querySelectorAll('canvas')[1]
      return {
        t: +(window.scrollY / (document.documentElement.scrollHeight - vh)).toFixed(3),
        filmOpacity: film ? +(getComputedStyle(film).opacity) : null,
        glOpacity: gl ? +(getComputedStyle(gl).opacity) : null,
        ctas,
      }
    })
    walk.push({ stop, ...at })
  }

  // ── Is the 3D scene doing work nobody can see? ────────────────────────────
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(1500)
  const glWork = await page.evaluate(() => {
    return new Promise((resolve) => {
      let frames = 0
      const t0 = performance.now()
      const tick = () => {
        frames++
        if (performance.now() - t0 < 2000) requestAnimationFrame(tick)
        else resolve({ fps: +(frames / ((performance.now() - t0) / 1000)).toFixed(1) })
      }
      requestAnimationFrame(tick)
    })
  })

  console.log(JSON.stringify({ viewport: `${width}x${height}@${dpr}`, shape, sections, targets, walk, glWork }, null, 2))
  await browser.close()
})()
