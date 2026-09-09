'use client'

import {
  TOTAL_HERO_FRAMES,
  hiresFrameUrl,
  proxyFrameUrl,
  isCoarsePointer,
  AVG_MASTER_FRAME_BYTES,
} from '@/lib/film/frames'
import { hiresCache, hiresBudgetFrames, proxyCache } from '@/lib/film/frameCache'
import { useNight } from '@/lib/store/night'

/**
 * THE CURTAIN'S REAL JOB.
 *
 * The preloader used to fetch 40 master frames and then lift on a 4-second
 * timer whether or not anything had arrived. Measured on a 4G profile that is
 * exactly what happened: the timer fired at 4.2 s with 42 frames cached, the
 * remaining 198 were fetched during the scroll, and the frame ladder — which
 * falls back to a 160x284 proxy when the master has not landed — served
 * 95.6% of the film from that proxy. On a 1170x2532 phone backing store that is
 * a 7.3x upscale. The film was not soft because the masters are 720x1280; it
 * was soft because the viewer was almost never looking at them.
 *
 * So the curtain now downloads the whole film, which is what a loading screen
 * is for. The master sequence is 14.7 MB on a phone and 25.6 MB on desktop —
 * three to eight seconds on the 4G/5G links this audience actually has.
 *
 * Three things make that affordable rather than reckless:
 *
 *   1. The curtain lifts on MEASURED THROUGHPUT, not on a timer. Once the
 *      opening run is cached, the only question is whether the rest of the
 *      download will stay ahead of the fastest plausible scroll. When it will,
 *      the curtain lifts and the remainder keeps streaming behind the viewer.
 *   2. The opening run is DECODED, not just fetched. Warming the HTTP cache
 *      leaves the whole decode cost — 5-70 ms a frame — on the scroll's
 *      critical path. These frames are decoded into the same cache the canvas
 *      draws from, so the first beat costs nothing at all.
 *   3. Save-Data and 2G report themselves, and on those the curtain does what
 *      it always did: the opening run, then out of the way.
 */

/** Frames that must be in the HTTP cache before the curtain can lift under any
 *  circumstances, and the run that gets decoded up front. The film is ~24 px of
 *  phone scroll per frame, so this is ~760 px — half a second even at a hard
 *  flick. It is not meant to be a buffer; it is the head start that puts the
 *  download front well ahead of the playhead before either starts moving. */
const OPENING_RUN = 32

/** Concurrency for the master sweep. Browsers multiplex over HTTP/2, so an
 *  unbounded fan-out does not queue — it splits the same pipe and every frame
 *  arrives late. Eight keeps a 4G link saturated without starving the decodes
 *  running alongside it. */
const FETCH_CONCURRENCY = 8

/**
 * The budget the streaming remainder has to beat for the curtain to lift early.
 *
 * The film spans ~5,700 px of phone scroll, so a hard 1,400 px/sec flick crosses
 * it in ~4 s. This is deliberately larger than that, because the two are not
 * racing from the same place: when the curtain lifts, the download front is
 * already tens of frames ahead of a playhead that has not moved, and it keeps
 * that lead because it is not waiting for anything. Measured on a 4G profile
 * lifting under this rule, a 1,400 px/sec pass was served 100% from the master
 * tier — the playhead never caught the front.
 */
const MIN_FILM_TRAVERSAL_MS = 6_000

/**
 * Hard ceiling on the curtain, however slow the link.
 *
 * Past this the visitor is better served by a film that degrades than by a
 * black screen: the sweep keeps running behind them and the ladder steps down
 * in the meantime, so what they lose is sharpness in the later acts, which the
 * download then repairs while they read the earlier ones.
 *
 * Set against the links this audience actually has rather than against the
 * developer's. On a real 8 Mbps 4G the master sequence takes ~15 s to land in
 * full, which is not a wait anyone sits through; at 8 s the curtain lifts with
 * roughly half the film cached, and the remainder arrives long before a reader
 * reaches it. On slow 3G it lifts having cached only the opening, which is
 * exactly the case the proxy tier exists for.
 */
const MAX_CURTAIN_MS = 8_000

/** Floor on the curtain even when everything is already cached, so a warm
 *  reload does not flash the loading screen for one frame. */
const MIN_CURTAIN_MS = 600

export interface FilmPreloadStatus {
  /** Master frames whose bytes are in the HTTP cache. Successes only — a frame
   *  the network refused is not a frame that is ready, and counting it would
   *  let a broken CDN report a complete film. */
  cached: number
  /** Frames the sweep has been through, successful or not. The progress bar's
   *  numerator: it has to reach the end even on a link that is failing. */
  attempted: number
  /** Frames the network would not give up. Non-zero means the ladder will be
   *  stepping down over those stretches however long the curtain holds. */
  failed: number
  /** Master frames decoded into hiresCache and ready to draw with no work. */
  decoded: number
  total: number
  /** 0..1, what the progress bar shows. Honest: it is the film, not a timer. */
  progress: number
  /** Measured wire throughput, bytes/ms. 0 until the first frame lands. */
  bytesPerMs: number
  /** The curtain may lift. */
  ready: boolean
  /** Every master frame is cached. */
  complete: boolean
  /** Why the curtain lifted, for the ?debug=perf overlay and the harness. */
  reason: 'pending' | 'complete' | 'streaming-ahead' | 'ceiling' | 'save-data'
}

const status: FilmPreloadStatus = {
  cached: 0,
  attempted: 0,
  failed: 0,
  decoded: 0,
  total: TOTAL_HERO_FRAMES,
  progress: 0,
  bytesPerMs: 0,
  ready: false,
  complete: false,
  reason: 'pending',
}

export const filmPreloadStatus = (): Readonly<FilmPreloadStatus> => status

// Published unconditionally, unlike the scrub telemetry: scripts/verify-curtain
// has to read it on a plain load, since asking for ?debug would change the very
// thing it is timing by putting an overlay and a rAF loop on the page.
if (typeof window !== 'undefined') {
  ;(window as unknown as { __filmPreload?: () => Readonly<FilmPreloadStatus> }).__filmPreload =
    filmPreloadStatus
}

type Listener = (s: Readonly<FilmPreloadStatus>) => void
const listeners = new Set<Listener>()
export function onFilmPreload(fn: Listener): () => void {
  listeners.add(fn)
  fn(status)
  return () => listeners.delete(fn)
}
const emit = () => {
  for (const fn of listeners) fn(status)
}

/** The link says it cannot afford this. Respect it rather than measuring it. */
function isConstrainedLink(): boolean {
  const conn = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string }
    }
  ).connection
  if (!conn) return false
  if (conn.saveData) return true
  return conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g'
}

let sweepRunning = false
/** Module scope so a sweep that stopped when the visitor left the film can pick
 *  up where it left off rather than re-walking frames already cached. */
let masterCursor = 1

/**
 * Fetch the whole master sequence, in scroll order, decoding the opening run.
 *
 * Idempotent while running — the curtain mounts once, but React strict mode
 * runs effects twice and a second sweep against the same pipe would halve the
 * throughput of the first — and resumable once it has stopped, which it does
 * when the visitor navigates off the film before the download finishes. There
 * is no sense pulling 14.7 MB of frames for a page they have left.
 */
export function startFilmPreload(): void {
  if (sweepRunning || typeof window === 'undefined') return
  if (status.attempted >= TOTAL_HERO_FRAMES) return
  sweepRunning = true

  const startedAt = performance.now()
  let firstByteAt = 0
  let bytes = 0
  const constrained = isConstrainedLink()

  // How many of the opening frames to decode up front. Sized from the master
  // cache's own budget rather than from a constant: decoding past the budget
  // only evicts what was decoded a moment earlier, which spends the curtain's
  // time to arrive at the same cold cache.
  const decodeTarget = constrained ? 0 : Math.min(OPENING_RUN, Math.floor(hiresBudgetFrames() * 0.6))

  const settle = (reason: FilmPreloadStatus['reason']) => {
    if (status.ready) return
    status.ready = true
    status.reason = reason
    emit()
  }

  /**
   * Will the rest of the download stay ahead of the playhead?
   *
   * The curtain does not need the whole film in hand — it needs the guarantee
   * that a viewer cannot scroll to a frame before it arrives. That is a
   * comparison between the remaining bytes at the measured rate and the fastest
   * plausible traversal of the film, and it is the reason this can be generous
   * on a 5G link and careful on a weak one without knowing which it is.
   */
  const reconsider = () => {
    if (status.ready) return
    if (status.cached >= TOTAL_HERO_FRAMES) return settle('complete')
    // Every frame has been tried and some would not come. Holding longer buys
    // nothing; the ladder steps down over those stretches instead.
    if (status.attempted >= TOTAL_HERO_FRAMES) return settle('ceiling')
    if (status.attempted < OPENING_RUN || status.decoded < decodeTarget) return
    // A constrained link never earns 'streaming-ahead', because there is no
    // stream: the bulk download is not happening, so the only honest reason to
    // lift is that the opening run is in and this link has asked for nothing
    // more. The sweep below settles it.
    if (constrained) return
    if (status.bytesPerMs <= 0) return
    const remaining = (TOTAL_HERO_FRAMES - status.cached) * AVG_MASTER_FRAME_BYTES()
    if (remaining / status.bytesPerMs <= MIN_FILM_TRAVERSAL_MS) settle('streaming-ahead')
  }

  const noteProgress = () => {
    status.progress = status.attempted / TOTAL_HERO_FRAMES
    if (firstByteAt > 0) {
      const elapsed = Math.max(1, performance.now() - firstByteAt)
      status.bytesPerMs = bytes / elapsed
    }
    emit()
    reconsider()
  }

  /**
   * One master frame into the HTTP cache. The bytes are drained deliberately:
   * an undrained body holds the connection open and the next frame in the pool
   * waits behind it.
   */
  const warm = async (index: number): Promise<void> => {
    try {
      const response = await fetch(hiresFrameUrl(index), { cache: 'force-cache' })
      if (!response.ok) throw new Error(String(response.status))
      const buf = await response.arrayBuffer()
      if (!firstByteAt) firstByteAt = performance.now()
      bytes += buf.byteLength
      status.cached++
    } catch {
      // Offline, aborted, or a 404. The frame ladder re-requests on demand and
      // steps down in the meantime, so a miss here is never fatal — but it must
      // not be counted as a frame that is ready, or a link that is failing fast
      // would race to a triumphant 'complete'.
      status.failed++
    }
    status.attempted++
    noteProgress()
  }

  const runPool = async (from: number, to: number, limit: number) => {
    const worker = async () => {
      while (masterCursor <= to && filmActive) await warm(masterCursor++)
    }
    if (masterCursor < from) masterCursor = from
    await Promise.all(Array.from({ length: Math.min(limit, to - from + 1) }, worker))
  }

  // The floor tier, in parallel from the first moment. See fillProxyTier for
  // why this belongs to the curtain rather than to the first scroll.
  if (!constrained) fillProxyTier()

  void (async () => {
    // The opening run first and in order, because it is what the curtain is
    // waiting on and what the viewer sees the instant it lifts.
    await runPool(1, Math.min(OPENING_RUN, TOTAL_HERO_FRAMES), FETCH_CONCURRENCY)

    // Decode it out of the cache it was just warmed into. This is the half the
    // old curtain skipped: fetching alone leaves every frame's 5-70 ms decode
    // sitting on the scroll's critical path, so the opening beat was soft even
    // though its bytes had already arrived.
    if (decodeTarget > 0) {
      let cursor = 1
      const decoder = async () => {
        while (cursor <= decodeTarget) {
          await hiresCache.load(cursor++)
          status.decoded = hiresCache.residentCount
          emit()
          reconsider()
        }
      }
      await Promise.all([decoder(), decoder()])
    }
    status.decoded = hiresCache.residentCount
    reconsider()

    if (constrained) {
      // No bulk master download on a link that has said it cannot afford one —
      // but the floor tier still has to exist, and 1.4 MB is within any budget
      // that allows the page at all.
      fillProxyTier()
      settle('save-data')
      sweepRunning = false
      return
    }

    // The rest of the film, still in scroll order so the download front stays
    // ahead of wherever the playhead has got to.
    await runPool(OPENING_RUN + 1, TOTAL_HERO_FRAMES, FETCH_CONCURRENCY)
    sweepRunning = false
    status.complete = status.cached >= TOTAL_HERO_FRAMES
    noteProgress()
    settle(status.complete ? 'complete' : 'ceiling')
  })()

  // Whatever the link is doing, the visitor is not held past the ceiling.
  window.setTimeout(() => settle('ceiling'), MAX_CURTAIN_MS)
}

/**
 * THE FLOOR TIER, SWEPT WHILE THE CURTAIN IS STILL UP.
 *
 * The 160x284 sequence is the ladder's floor: 1.4 MB on the wire for a tier
 * that, once resident, can never miss however hard the viewer flicks. Making it
 * resident costs 240 decodes.
 *
 * Those 240 decodes used to happen during the first scroll, and they were the
 * single largest thing wrong with the scroll after the curtain was fixed. The
 * tiers share one decode pipeline. Measured on the phone profile at 1,400
 * px/sec, a pass spent 75 decodes on the master tier and 185 on this sweep: a
 * background task that exists to cover the master tier's misses was consuming
 * 71% of the throughput that decides whether the master tier misses at all. On
 * the throttled profile it was 14 against 101 — 88%.
 *
 * So it runs here instead, alongside the master download, and the reason it is
 * free here is that the two are bound by different resources. The curtain is
 * network-bound: 14.7 MB of masters saturating the link while the decode
 * pipeline sits idle except for the opening run. These 240 small decodes fit in
 * that idle time exactly, and 1.4 MB is 9% on top of a download the visitor is
 * already waiting through. By the time anything scrolls, the floor is resident
 * and the decode pipeline belongs entirely to the master tier.
 *
 * The fetches are 6 KB each, so what limits the sweep is round trips rather
 * than bytes and it wants width, not restraint — at concurrency 2 behind the
 * master sweep's 8 it had 23 of 240 frames resident by the time the curtain
 * lifted, which is not a floor. Six is wide enough to make the floor real
 * within the curtain and still small against the master sweep it shares the
 * link with: 1.4 MB against 14.7 MB.
 */
const PROXY_FILL_CONCURRENCY = 6

/** How long the playhead must have been still before the sweep takes a turn.
 *  Long enough to sit out the gap between two frames of a slow scroll — one
 *  frame is ~24 px, so even a 200 px/sec read changes it every 120 ms — and
 *  short enough that a pause to read a beat is time the floor can use. */
const PROXY_IDLE_MS = 220

/**
 * Whether a film canvas is mounted.
 *
 * The sweep outlives the curtain by design, so on a route change it would
 * otherwise keep filling a cache that ScrollCanvas has just disposed — holding
 * the full 44 MB resident on a page with nothing to draw it, and re-igniting
 * the render loop against a detached canvas every time a frame landed.
 */
let filmActive = true
export function setFilmActive(active: boolean): void {
  filmActive = active
}

/**
 * Stand aside while the playhead is moving.
 *
 * 240 decodes do not fit in a 2-second curtain, so the sweep outlives it and
 * meets the first scroll — and once anything is scrolling, every decode this
 * sweep takes is one the master tier does not get. Measured with the sweep
 * running freely past the curtain, a desktop pass at 1,400 px/sec spent 48
 * decodes on the master tier and 239 on the floor, and the master's share of
 * the scroll fell from 100% to 75%.
 *
 * The first version of this yielded while the master tier had requests in
 * flight, which sounds like the same thing and is not: a wide stride means the
 * master tier issues FEWER requests, so its in-flight count sits at zero more
 * often, so the sweep ran more freely exactly when the master tier was most
 * starved — and every decode the sweep took widened the stride further. The
 * signal has to be the scroll itself, which is upstream of all of that.
 *
 * Before the curtain lifts there is nothing to yield to and this returns at
 * once, which is where most of the floor gets built. After it, the sweep uses
 * the pauses: a visitor reading a beat gives it a second or two, and a visitor
 * flicking gives it nothing, which is the right way round because a flick is
 * exactly when the master tier needs every decode it can get.
 */
let lastPlayheadMoveAt = 0
if (typeof window !== 'undefined') {
  useNight.subscribe((state, prev) => {
    if (state.t !== prev.t) lastPlayheadMoveAt = performance.now()
  })
}

async function yieldToPlayhead(): Promise<void> {
  if (!status.ready) return
  while (performance.now() - lastPlayheadMoveAt < PROXY_IDLE_MS) {
    await new Promise<void>((resolve) => setTimeout(resolve, PROXY_IDLE_MS))
  }
}

let sweepWorkers = 0

/** Idempotent while running, and restartable once it has stopped — which it
 *  does when the film canvas unmounts and the caches it fills are disposed. */
export function fillProxyTier(): void {
  if (sweepWorkers > 0 || !filmActive) return
  let cursor = 1
  const worker = async () => {
    sweepWorkers++
    try {
      while (cursor <= TOTAL_HERO_FRAMES && filmActive) {
        await yieldToPlayhead()
        await proxyCache.load(cursor++, notifyFrameDecoded)
      }
    } finally {
      sweepWorkers--
    }
  }
  for (let i = 0; i < PROXY_FILL_CONCURRENCY; i++) void worker()
}

/**
 * A decode landed. The render loop parks itself once the frame it wants is on
 * screen, so a frame arriving from either background sweep has to wake it or
 * the picture does not update until the next scroll tick.
 */
const decodeListeners = new Set<() => void>()
export function onFrameDecoded(fn: () => void): () => void {
  decodeListeners.add(fn)
  return () => decodeListeners.delete(fn)
}
function notifyFrameDecoded(): void {
  for (const fn of decodeListeners) fn()
}

/** Kept so the proxy URL builder has one importer and one definition. */
export { proxyFrameUrl, isCoarsePointer }

export const FILM_PRELOAD_TUNING = {
  OPENING_RUN,
  FETCH_CONCURRENCY,
  MIN_FILM_TRAVERSAL_MS,
  MAX_CURTAIN_MS,
  MIN_CURTAIN_MS,
}
