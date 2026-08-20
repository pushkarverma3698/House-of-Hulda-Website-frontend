/**
 * Scrub-quality harness.
 *
 * Drives the film past the playhead at a fixed, realistic scroll velocity and
 * reports what the viewer would actually have seen: how long the curtain held,
 * how many bytes it spent, what fraction of the asked-for frames reached the
 * screen, and — the number this work is about — what fraction of those were the
 * full-resolution master rather than a proxy.
 *
 *   node scripts/measure-scrub.mjs [--profile phone|desktop] [--px-per-sec 1400]
 *                                 [--url http://localhost:3000]
 *                                 [--label baseline] [--out results.json]
 *
 * Requires the site to be running (`npm run build && npm start`).
 */
import { chromium } from 'playwright'
import { writeFileSync, existsSync } from 'node:fs'

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`)
  return i === -1 ? fallback : process.argv[i + 1]
}

const PROFILES = {
  // A current mid-to-high phone: small viewport, dpr 3, coarse pointer, and a
  // CPU slow enough that software JPEG decode actually costs what it costs.
  phone: {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    cpuThrottle: 4,
    // Fast 4G, which is the connection the brief assumes.
    network: { downloadThroughput: (25 * 1024 * 1024) / 8, uploadThroughput: (5 * 1024 * 1024) / 8, latency: 60 },
  },
  desktop: {
    viewport: { width: 1512, height: 900 },
    deviceScaleFactor: 2,
    isMobile: false,
    hasTouch: false,
    cpuThrottle: 1,
    network: { downloadThroughput: (60 * 1024 * 1024) / 8, uploadThroughput: (10 * 1024 * 1024) / 8, latency: 20 },
  },
}

const profileName = arg('profile', 'phone')
const profile = PROFILES[profileName]
if (!profile) throw new Error(`unknown profile: ${profileName}`)
const pxPerSec = Number(arg('px-per-sec', '1400'))
const cpuOverride = arg('cpu', null)
const baseUrl = arg('url', 'http://localhost:3000')
const label = arg('label', profileName)
const outPath = arg('out', null)

// This box ships a Chromium that predates the pinned @playwright/test build, so
// point at it rather than downloading a second copy.
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch({
  executablePath: existsSync(CHROMIUM) ? CHROMIUM : undefined,
  args: ['--autoplay-policy=no-user-gesture-required'],
})
const context = await browser.newContext({
  viewport: profile.viewport,
  deviceScaleFactor: profile.deviceScaleFactor,
  isMobile: profile.isMobile,
  hasTouch: profile.hasTouch,
})
const page = await context.newPage()

// Every frame byte that crosses the wire, bucketed by tier, so "the preloader
// downloads the high quality frames" is a measurement and not a claim.
const wire = { hires: { n: 0, bytes: 0 }, mid: { n: 0, bytes: 0 }, proxy: { n: 0, bytes: 0 }, other: { n: 0, bytes: 0 } }
const firstByteAt = { value: 0 }
const started = Date.now()
page.on('response', async (res) => {
  const url = res.url()
  if (!url.includes('/frames/')) return
  let bucket = 'other'
  if (url.includes('/hero-proxy/')) bucket = 'proxy'
  else if (url.includes('/hero-mid/')) bucket = 'mid'
  else if (url.includes('/hero')) bucket = 'hires'
  let size = 0
  try {
    size = Number((await res.headerValue('content-length')) || 0)
  } catch { /* response gone */ }
  if (!firstByteAt.value) firstByteAt.value = Date.now() - started
  wire[bucket].n++
  wire[bucket].bytes += size
})

const cdp = await context.newCDPSession(page)
await cdp.send('Network.enable')
await cdp.send('Network.emulateNetworkConditions', { offline: false, ...profile.network })
const cpuRate = cpuOverride ? Number(cpuOverride) : profile.cpuThrottle
if (cpuRate > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpuRate })

const navStart = Date.now()
await page.goto(`${baseUrl}/?debug=perf`, { waitUntil: 'domcontentloaded' })

// The curtain is gone when the preloader unmounts itself.
await page.waitForFunction(
  () => !document.querySelector('[data-preloader]') && !document.querySelector('.fixed.inset-0.z-50'),
  null,
  { timeout: 60_000 }
)
const curtainMs = Date.now() - navStart
const wireAtCurtain = JSON.parse(JSON.stringify(wire))

await page.waitForFunction(() => !!window.__scrubStats, null, { timeout: 15_000 })

// Let the render loop settle on frame 1 before the clock starts.
await page.waitForTimeout(400)

// Reset the counters. resetScrubStats is not reachable from the page, so the
// fields the report reads are cleared by hand.
await page.evaluate(() => {
  const stats = window.__scrubStats
  stats.decodes = 0
  stats.decodesByTier.hires = 0
  stats.decodesByTier.mid = 0
  stats.decodesByTier.proxy = 0
  stats.evictions = 0
  stats.paintedIdx.clear()
  stats.demandedIdx.clear()
  stats.onScreenByTier.hires = 0
  stats.onScreenByTier.mid = 0
  stats.onScreenByTier.proxy = 0
  stats.worstFreezeMs = 0
  stats.freezesOver100ms = 0
  stats.activeMs = 0
})

const filmSec = await page.evaluate(async (pxPerSec) => {
  const lenis = window.__lenis
  const wrapper = document.getElementById('scroll-wrapper') || document.scrollingElement
  const limit = wrapper.scrollHeight - wrapper.clientHeight
  // t = 0 .. FILM_END_T (0.6) is the stretch where frames are on screen; past
  // it the sky owns the canvas and there is nothing left to measure.
  const filmPx = limit * 0.6
  const duration = filmPx / pxPerSec

  // Lenis's own animation, driven linearly, so the playhead advances at exactly
  // the asked-for px/sec through exactly the pipeline a visitor's scroll uses.
  // Wheel events cannot hit a target velocity (Lenis transforms every delta)
  // and writing scrollTop cannot either (Lenis rewrites it each frame).
  await new Promise((resolve) => {
    lenis.scrollTo(filmPx, { duration, easing: (x) => x, onComplete: resolve })
    setTimeout(resolve, duration * 1000 + 3000)
  })
  // Snapshot the moment the playhead stops. Everything after this is the
  // settle — the read-ahead landing, the focus-in fade — and folding it into
  // the scroll's numbers flatters them: a frame that arrives after the viewer
  // has gone past is not a frame that was delivered.
  const stats = window.__scrubStats
  const t = stats.onScreenByTier
  const ticks = t.hires + t.mid + t.proxy
  const atScrollEnd = {
    delivery: stats.demandedIdx.size ? +(stats.paintedIdx.size / stats.demandedIdx.size).toFixed(3) : 1,
    hiresShare: ticks ? +(t.hires / ticks).toFixed(3) : 0,
    midShare: ticks ? +(t.mid / ticks).toFixed(3) : 0,
    proxyShare: ticks ? +(t.proxy / ticks).toFixed(3) : 0,
    demanded: stats.demandedIdx.size,
    delivered: stats.paintedIdx.size,
    ticks,
    decodes: stats.decodes,
    decodesByTier: { ...stats.decodesByTier },
    hiresStride: stats.hiresStride,
    hiresRadius: stats.hiresRadius,
    hiresHitEma: +stats.hiresHitEma.toFixed(2),
    idxVelocity: +stats.idxVelocity.toFixed(4),
    proxyResident: stats.proxyResident,
    worstFreezeMs: Math.round(stats.worstFreezeMs),
    freezesOver100ms: stats.freezesOver100ms,
    // Wall time per render tick while the playhead was actually moving. Read
    // after the settle this is meaningless — the loop sleeps between wakes and
    // one long gap dominates the EMA.
    tickMsEma: +stats.tickMsEma.toFixed(1),
  }

  await new Promise((r) => setTimeout(r, 600))
  return { filmPx: Math.round(filmPx), duration: +duration.toFixed(2), atScrollEnd }
}, pxPerSec)

const result = await page.evaluate(() => {
  const stats = window.__scrubStats
  const byTier = stats.onScreenByTier
  const ticks = byTier.hires + byTier.mid + byTier.proxy
  const wrapper = document.getElementById('scroll-wrapper') || document.scrollingElement
  return {
    scrollPx: Math.round(wrapper.scrollTop),
    scrubSec: +(stats.activeMs / 1000).toFixed(2),
    finalTargetIdx: stats.targetIdx,
    delivered: stats.paintedIdx.size,
    demanded: stats.demandedIdx.size,
    delivery: stats.demandedIdx.size ? +(stats.paintedIdx.size / stats.demandedIdx.size).toFixed(3) : 1,
    hiresShare: ticks ? +(byTier.hires / ticks).toFixed(3) : 0,
    midShare: ticks ? +(byTier.mid / ticks).toFixed(3) : 0,
    proxyShare: ticks ? +(byTier.proxy / ticks).toFixed(3) : 0,
    ticks,
    decodes: stats.decodes,
    evictions: stats.evictions,
    worstFreezeMs: Math.round(stats.worstFreezeMs),
    freezesOver100ms: stats.freezesOver100ms,
    tickMsEma: +stats.tickMsEma.toFixed(1),
    hiresResidentMB: +(stats.hiresBytes / 1048576).toFixed(1),
    proxyResident: stats.proxyResident,
    midResidentMB: +(stats.midBytes / 1048576).toFixed(1),
  }
})

const mb = (b) => +(b / 1048576).toFixed(2)
const report = {
  label,
  profile: profileName,
  cpuThrottle: cpuRate,
  pxPerSec,
  curtainMs,
  firstFrameByteMs: firstByteAt.value,
  wireAtCurtain: {
    hires: { n: wireAtCurtain.hires.n, mb: mb(wireAtCurtain.hires.bytes) },
    mid: { n: wireAtCurtain.mid.n, mb: mb(wireAtCurtain.mid.bytes) },
    proxy: { n: wireAtCurtain.proxy.n, mb: mb(wireAtCurtain.proxy.bytes) },
  },
  wireTotal: {
    hires: { n: wire.hires.n, mb: mb(wire.hires.bytes) },
    mid: { n: wire.mid.n, mb: mb(wire.mid.bytes) },
    proxy: { n: wire.proxy.n, mb: mb(wire.proxy.bytes) },
  },
  filmPx: filmSec.filmPx,
  scrollSec: filmSec.duration,
  atScrollEnd: filmSec.atScrollEnd,
  afterSettle: result,
}

console.log(JSON.stringify(report, null, 2))
if (outPath) writeFileSync(outPath, JSON.stringify(report, null, 2))

await browser.close()
