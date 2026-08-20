/**
 * Photograph what the film actually looks like WHILE it moves.
 *
 * scripts/measure-scrub.mjs reports which rung of the ladder reached the
 * screen; this one shows it. Two things it has to get right, both of which the
 * obvious approach gets wrong:
 *
 *   - It captures during the scroll, not at its destinations. A still taken
 *     once the playhead has stopped is always sharp — the ladder reaches for
 *     the exact frame the moment it settles — so photographing stops says
 *     nothing about the thing that was wrong.
 *   - It reads the canvas backing store, not the viewport. CDP's screencast
 *     captures CSS pixels, 390x844 on the phone profile, which throws away the
 *     device pixels that ARE the difference between a 160 px frame upscaled
 *     7.3x and a 720 px one upscaled 1.6x. Measured, that downscale collapsed a
 *     2.3x difference in focus to 2%.
 *
 * Each capture is scored for high-frequency energy — the variance of a
 * Laplacian, the standard "is this photograph in focus" measure, which an
 * upscaled proxy frame cannot fake. Scored in the page, off the same ImageData,
 * so the script needs no image library.
 *
 *   node scripts/capture-film.mjs --url http://localhost:3000 --out shots/after
 */
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`)
  return i === -1 ? d : process.argv[i + 1]
}
const url = arg('url', 'http://localhost:3000')
const outDir = arg('out', 'shots')
const profileName = arg('profile', 'phone')
const pxPerSec = Number(arg('px-per-sec', '600'))
const beatCount = Number(arg('beats', '6'))

const PROFILES = {
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  desktop: { viewport: { width: 1512, height: 900 }, deviceScaleFactor: 2, isMobile: false, hasTouch: false },
}
const profile = PROFILES[profileName]
if (!profile) throw new Error(`unknown profile: ${profileName}`)
mkdirSync(outDir, { recursive: true })

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ executablePath: existsSync(CHROMIUM) ? CHROMIUM : undefined })
const context = await browser.newContext(profile)
const page = await context.newPage()
const cdp = await context.newCDPSession(page)
await cdp.send('Network.enable')
await cdp.send('Network.emulateNetworkConditions', {
  offline: false,
  downloadThroughput: (25 * 1024 * 1024) / 8,
  uploadThroughput: (5 * 1024 * 1024) / 8,
  latency: 60,
})

await page.goto(`${url}/?debug=perf`, { waitUntil: 'domcontentloaded' })
await page.waitForFunction(() => !document.querySelector('[data-preloader]'), null, { timeout: 60_000 })
await page.waitForTimeout(500)

const captures = await page.evaluate(
  async ({ pxPerSec, beatCount }) => {
    const lenis = window.__lenis
    const canvas = document.querySelector('canvas')
    const ctx = canvas.getContext('2d')
    const wrapper = document.getElementById('scroll-wrapper') || document.scrollingElement
    const filmPx = (wrapper.scrollHeight - wrapper.clientHeight) * 0.6
    const duration = filmPx / pxPerSec

    /** Variance of the Laplacian over the luma plane. */
    const focusScore = () => {
      const { data, width: w, height: h } = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const luma = new Float32Array(w * h)
      for (let i = 0, p = 0; i < luma.length; i++, p += 4) {
        luma[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2]
      }
      let sum = 0
      let sumSq = 0
      let n = 0
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const i = y * w + x
          const lap = -4 * luma[i] + luma[i - 1] + luma[i + 1] + luma[i - w] + luma[i + w]
          sum += lap
          sumSq += lap * lap
          n++
        }
      }
      const mean = sum / n
      return Math.round((sumSq / n - mean * mean) * 10) / 10
    }

    const shots = []
    const startedAt = performance.now()
    let next = 0
    const watch = () => {
      if (next >= beatCount) return
      const want = (duration * 1000 * (next + 0.5)) / beatCount
      if (performance.now() - startedAt >= want) {
        shots.push({
          atSec: Math.round((performance.now() - startedAt) * 100) / 100000,
          tier: window.__scrubStats.tier,
          targetIdx: window.__scrubStats.targetIdx,
          drawnIdx: window.__scrubStats.drawnIdx,
          focus: focusScore(),
          data: canvas.toDataURL('image/png'),
        })
        next++
      }
      requestAnimationFrame(watch)
    }
    requestAnimationFrame(watch)

    await new Promise((resolve) => {
      lenis.scrollTo(filmPx, { duration, easing: (x) => x, onComplete: resolve })
      setTimeout(resolve, duration * 1000 + 5000)
    })
    return { shots, canvas: `${canvas.width}x${canvas.height}` }
  },
  { pxPerSec, beatCount }
)

const rows = captures.shots.map((shot, i) => {
  const name = `beat${i + 1}.png`
  writeFileSync(`${outDir}/${name}`, Buffer.from(shot.data.split(',')[1], 'base64'))
  return {
    beat: i + 1,
    atSec: shot.atSec,
    tier: shot.tier,
    frame: `${shot.drawnIdx}/${shot.targetIdx}`,
    focus: shot.focus,
    name,
  }
})

console.log(
  JSON.stringify(
    {
      url,
      profile: profileName,
      pxPerSec,
      canvas: captures.canvas,
      tiers: rows.reduce((a, r) => ({ ...a, [r.tier]: (a[r.tier] || 0) + 1 }), {}),
      meanFocus: Math.round((rows.reduce((a, r) => a + r.focus, 0) / rows.length) * 10) / 10,
      beats: rows,
    },
    null,
    2
  )
)
await browser.close()
