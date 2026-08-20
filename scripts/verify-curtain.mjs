/**
 * The curtain's contract, on the links it actually has to survive.
 *
 * lib/film/preload.ts holds the loading screen until the master film will stay
 * ahead of a scroll, which is a promise about four different situations. This
 * checks all four rather than the one the developer happens to be on:
 *
 *   5G / wifi   the whole film lands and the curtain lifts on 'complete'
 *   4G          it lifts on 'streaming-ahead' with the remainder still coming
 *   slow 3G     it gives up at the ceiling rather than trapping the visitor
 *   Save-Data   it never starts the bulk download at all
 *   warm reload it does not flash: MIN_CURTAIN_MS is a floor, not a target
 *
 *   node scripts/verify-curtain.mjs [--url http://localhost:3000]
 */
import { chromium } from 'playwright'
import { existsSync } from 'node:fs'

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`)
  return i === -1 ? d : process.argv[i + 1]
}
const url = arg('url', 'http://localhost:3000')

const MBPS = (n) => (n * 1024 * 1024) / 8

/**
 * `expect` is the set of reasons that would be honest on that link; `maxMs`
 * is what the visitor will actually sit through. A reason of 'complete' or
 * 'streaming-ahead' is the guarantee that the film will stay ahead of a scroll;
 * 'ceiling' is the admission that it will not, and is only acceptable on a link
 * where holding any longer would be worse.
 */
const CASES = [
  { name: 'wifi / 5G   ', mbps: 100, latency: 10, expect: ['complete', 'streaming-ahead'], maxMs: 4_000 },
  { name: 'fast 4G     ', mbps: 25, latency: 60, expect: ['complete', 'streaming-ahead'], maxMs: 5_000 },
  { name: 'slow 4G     ', mbps: 8, latency: 100, expect: ['streaming-ahead', 'ceiling'], maxMs: 11_000 },
  { name: 'slow 3G     ', mbps: 1.2, latency: 300, expect: ['ceiling'], maxMs: 14_000 },
  // A link that has asked for less must not be given a 14.7 MB download.
  { name: 'Save-Data   ', mbps: 25, latency: 60, saveData: true, expect: ['save-data'], maxMs: 5_000, maxWireMB: 4 },
  // Everything is in the HTTP cache; nothing may go back to the network.
  { name: 'warm reload ', mbps: 25, latency: 60, warm: true, expect: ['complete', 'streaming-ahead'], maxMs: 4_000, maxWireMB: 0.2 },
  // A hundred frames missing. The curtain cannot know that when it lifts — at
  // that point it has only seen the ones that worked — so what is checked here
  // is the end state: it must not hold out for frames that are never coming,
  // and it must not report a film it does not have.
  { name: 'half the CDN', mbps: 25, latency: 60, block: true, expect: ['complete', 'streaming-ahead', 'ceiling'], maxMs: 6_000, settled: { maxCached: 145, minFailed: 95, complete: false } },
]

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ executablePath: existsSync(CHROMIUM) ? CHROMIUM : undefined })

let failures = 0
for (const c of CASES) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  })
  if (c.saveData) {
    // navigator.connection is not settable through CDP, and the branch under
    // test reads it rather than the request header.
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'connection', {
        configurable: true,
        get: () => ({ saveData: true, effectiveType: '4g' }),
      })
    })
  }
  const page = await context.newPage()
  if (c.block) {
    // A regex, not a glob: Playwright's glob matcher is fussy about how `*`
    // spans path segments and a pattern that silently matches nothing turns
    // this case into a second copy of the fast-4G one.
    await page.route(/\/frames\/hero(-desktop)?\/frame_1\d\d\.jpg$/, (route) => route.abort())
  }
  // Counted from CDP rather than from Playwright's response event, because the
  // question for a warm reload is specifically how much came off the WIRE, and
  // a cache hit raises a response event just like a real download does.
  //
  // The byte count has to come from Network.loadingFinished: encodedDataLength
  // is still 0 on responseReceived, so totalling it there reports 0 MB for
  // every link and the assertion it feeds is vacuous.
  let wireBytes = 0
  let cachedResponses = 0
  let requests = 0
  const fromCache = new Set()
  const frameRequests = new Set()
  const cdp = await context.newCDPSession(page)
  cdp.on('Network.responseReceived', (ev) => {
    if (!ev.response.url.includes('/frames/')) return
    requests++
    if (ev.response.fromDiskCache || ev.response.fromPrefetchCache) {
      cachedResponses++
      fromCache.add(ev.requestId)
    } else {
      frameRequests.add(ev.requestId)
    }
  })
  cdp.on('Network.loadingFinished', (ev) => {
    if (!frameRequests.has(ev.requestId) || fromCache.has(ev.requestId)) return
    wireBytes += ev.encodedDataLength || 0
  })
  await cdp.send('Network.enable')
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: MBPS(c.mbps),
    uploadThroughput: MBPS(5),
    latency: c.latency,
  })

  if (c.warm) {
    // Fill the HTTP cache first; the measured load is the second one.
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => window.__filmPreload?.().complete === true, null, { timeout: 120_000 })
    wireBytes = 0
    cachedResponses = 0
    requests = 0
    fromCache.clear()
    frameRequests.clear()
  }

  const startedAt = Date.now()
  await page.goto(`${url}/?debug=perf`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => !document.querySelector('[data-preloader]'), null, { timeout: 60_000 })
  const curtainMs = Date.now() - startedAt
  const status = await page.evaluate(() => {
    const s = window.__filmPreload()
    return { cached: s.cached, failed: s.failed, decoded: s.decoded, reason: s.reason, progress: s.progress }
  })

  // For the failure case, let the sweep finish and check where it ended up.
  let settled = null
  if (c.settled) {
    await page
      .waitForFunction(() => window.__filmPreload().attempted >= 240, null, { timeout: 60_000 })
      .catch(() => {})
    settled = await page.evaluate(() => {
      const s = window.__filmPreload()
      return { cached: s.cached, failed: s.failed, complete: s.complete, progress: s.progress }
    })
  }

  const wireMB = wireBytes / 1048576
  const problems = []
  if (!c.expect.includes(status.reason)) problems.push(`reason ${status.reason}, expected ${c.expect.join('|')}`)
  if (curtainMs > c.maxMs) problems.push(`curtain ${curtainMs}ms > ${c.maxMs}ms`)
  if (c.maxWireMB !== undefined && wireMB > c.maxWireMB) {
    problems.push(`wire ${wireMB.toFixed(2)}MB > ${c.maxWireMB}MB`)
  }
  if (c.settled) {
    if (!settled) problems.push('sweep never finished')
    else {
      if (settled.cached > c.settled.maxCached) {
        problems.push(`reported ${settled.cached} cached with ${settled.failed} failed`)
      }
      if (settled.failed < c.settled.minFailed) {
        problems.push(`only ${settled.failed} failures recorded, expected >= ${c.settled.minFailed}`)
      }
      if (settled.complete !== c.settled.complete) {
        problems.push(`complete=${settled.complete}, expected ${c.settled.complete}`)
      }
      if (settled.progress < 1) problems.push(`progress stalled at ${settled.progress.toFixed(2)}`)
    }
  }
  if (problems.length) failures++
  console.log(
    `${problems.length ? 'FAIL' : 'ok  '} ${c.name} ${String(c.mbps).padStart(5)} Mbps  ` +
      `curtain ${String(curtainMs).padStart(6)} ms  ` +
      `cached ${String(status.cached).padStart(3)}/240  ` +
      `failed ${String(status.failed).padStart(3)}  ` +
      `decoded ${String(status.decoded).padStart(2)}  ` +
      `wire ${wireMB.toFixed(1).padStart(5)} MB  ` +
      `req ${String(requests).padStart(3)} (${cachedResponses} cached)  ` +
      `-> ${status.reason}` +
      (settled ? `  [settled: ${settled.cached} cached, ${settled.failed} failed, complete=${settled.complete}]` : '') +
      (problems.length ? `\n     ${problems.join('; ')}` : '')
  )
  await context.close()
}

await browser.close()
if (failures > 0) {
  console.error(`\n${failures} case(s) did not honour the curtain's contract`)
  process.exit(1)
}
console.log('\nall curtain cases honoured the contract')
