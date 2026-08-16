'use client'

import { useEffect, useRef, memo } from 'react'
import { useNight } from '@/lib/store/night'
import { scrubStats } from '@/lib/perf/scrubStats'

export const TOTAL_HERO_FRAMES = 240

/**
 * THREE-TIER FRAME LADDER
 *
 * A decoded 720x1280 RGBA frame costs 3.52 MiB. The 48 MB mobile budget holds
 * 13 of them — 370 px of scroll — while one momentum flick travels ~1,900 px.
 * The cache could never contain the frames the playhead was about to cross, so
 * it thrashed: measured, a single flick decoded 87 frames to display 19 of them
 * (306 MB of GPU churn, 5% of the frames the film asked for).
 *
 * No eviction policy fixes a 5x capacity deficit, so the per-frame cost comes
 * down instead. The 160x284 proxy tier is 177 KB decoded, which puts ALL 240
 * frames resident in 41.7 MB. Nothing is ever evicted and nothing is ever
 * missed, so motion is always smooth.
 *
 * But the proxy is what the viewer looks at for the WHOLE scroll, upscaled
 * ~3.7x to the backing store, and it reads as soft. The tier is chosen by how
 * fast the playhead is moving, not by stillness alone:
 *
 *   fast flick   -> proxy  (160x284, all 240 resident, 3.7x upscale)
 *   slow scroll  -> mid    (320x568, ~33-frame LRU window, 1.9x upscale)
 *   settled      -> hires  (720x1280, 2 frames, 1.2x upscale)
 *
 * The mid tier does not reintroduce the thrash because the deficit that caused
 * it is gone: a slow scroll demands roughly one frame per tick and a 320px JPEG
 * decodes in low single-digit ms, where a 720px one costs 10-15 ms.
 *
 * Regenerate the lower tiers with ./scripts/encode-proxy-frames.sh and
 * ./scripts/encode-mid-frames.sh
 */
export const proxyFrameUrl = (index: number) =>
  `/frames/hero-proxy/frame_${String(index).padStart(3, '0')}.jpg`
const midFrameUrl = (index: number) =>
  `/frames/hero-mid/frame_${String(index).padStart(3, '0')}.jpg`
const hiresFrameUrl = (index: number) =>
  `/frames/hero/frame_${String(index).padStart(3, '0')}.jpg`

/** All 240 proxy frames need 41.7 MB. The budget is headroom over that, not a
 *  target — if it ever binds, the safety valve in evictToBudget has to run. */
const PROXY_BUDGET = 44 * 1024 * 1024

/** Full-resolution frames are only ever shown while the scroll is stationary,
 *  so the mobile tier needs room for the current one and the one before it. */
const HIRES_BUDGET_MOBILE = 8 * 1024 * 1024
const HIRES_BUDGET_DESKTOP = 96 * 1024 * 1024

/** A 320x568 frame is 710 KB decoded, so this is a ~33-frame trailing window.
 *  No mobile/desktop split: 24 MB on top of the proxy tier's 42 MB and two
 *  full-resolution frames is ~73 MB, which the weakest target device holds. */
const MID_BUDGET = 24 * 1024 * 1024

/** Frames per ms, above which the mid tier is skipped entirely and the proxy
 *  carries the scroll unchanged. ~0.05 is 50 frames/sec — past that the eye
 *  cannot resolve the extra detail anyway, and requesting it is what starts a
 *  cache thrashing. Tuned against the ?debug=perf `tier` readout on device. */
const FAST_FLICK_THRESHOLD = 0.05

/** Smoothing for the frame-velocity estimate. A single slow tick between two
 *  fast ones must not flip the tier and trigger a request the flick will
 *  outrun. */
const VELOCITY_EMA_ALPHA = 0.3

/** Concurrency for the background sweep that makes the proxy tier resident.
 *  Browsers multiplex over HTTP/2, so an unbounded fan-out does not queue — it
 *  splits the same pipe and every frame arrives late. */
const PROXY_FILL_CONCURRENCY = 4

/** How long the playhead must hold still before the sharp frame is requested.
 *  Short enough to feel immediate on a deliberate stop, long enough that a
 *  scrub never triggers it. */
const SETTLE_MS = 140

/** Cross-fade from proxy to full resolution, in ms. An instant swap reads as a
 *  glitch; a fade reads as the image "focusing". */
const HIRES_FADE_MS = 220

/** A gap longer than this between frame changes is the user not scrolling, not
 *  the page stalling. Telemetry only. */
const IDLE_GAP_MS = 400

/** Bounded fallback search. Only reachable in the first seconds of a cold load,
 *  before the proxy sweep has made the sequence resident. */
const NEAREST_SEARCH_RADIUS = 48

/** The colour grade is a compositor filter on a fullscreen layer. Quantising it
 *  re-rasterises that layer ~16 times across the whole scroll instead of once
 *  per frame. */
const GRADE_STEPS = 16
const ALPHA_STEPS = 32

const detectCoarsePointer = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768
}

interface CachedFrame {
  bitmap: ImageBitmap
  bytes: number
}

export interface FrameRef {
  bitmap: ImageBitmap
  index: number
}

/**
 * Byte-budgeted LRU of decoded frames.
 *
 * Fetch + Blob + createImageBitmap rather than HTMLImageElement because it is
 * the only path with real cancellation (AbortController actually tears down the
 * request; `img.src = ''` does not) and because it never leaves a second
 * decoded copy alive inside an <img> the browser is free to retain.
 */
class BitmapCache {
  private cache = new Map<number, CachedFrame>()
  private inFlight = new Map<number, AbortController>()
  private bytes = 0

  constructor(
    private readonly urlFor: (index: number) => string,
    private budget: number
  ) {}

  public setBudget(bytes: number): void {
    this.budget = bytes
    this.evictToBudget(-1)
  }

  public get residentCount(): number {
    return this.cache.size
  }

  public get residentBytes(): number {
    return this.bytes
  }

  public has(index: number): boolean {
    return this.cache.has(index)
  }

  /** LRU touch: delete + re-insert moves the entry to the back of the Map. */
  public get(index: number): FrameRef | null {
    const frame = this.cache.get(index)
    if (!frame) return null
    this.cache.delete(index)
    this.cache.set(index, frame)
    return { bitmap: frame.bitmap, index }
  }

  /** Tear down every request except the one we still want. */
  public abortAllExcept(keepIndex: number): void {
    for (const [index, controller] of this.inFlight) {
      if (index === keepIndex) continue
      controller.abort()
      this.inFlight.delete(index)
    }
  }

  public async load(index: number, onDecode?: () => void): Promise<void> {
    if (index < 1 || index > TOTAL_HERO_FRAMES) return
    if (this.cache.has(index) || this.inFlight.has(index)) return

    const controller = new AbortController()
    this.inFlight.set(index, controller)

    try {
      const response = await fetch(this.urlFor(index), { signal: controller.signal })
      if (!response.ok) return

      const blob = await response.blob()
      if (controller.signal.aborted) return

      // Decodes off the main thread. This is the whole point of the pipeline —
      // never hand a raw <img> to drawImage and let it decode during paint.
      const bitmap = await createImageBitmap(blob)
      if (controller.signal.aborted) {
        bitmap.close()
        return
      }

      const bytes = bitmap.width * bitmap.height * 4
      this.cache.set(index, { bitmap, bytes })
      this.bytes += bytes
      scrubStats.decodes++

      // Evict AFTER insert so the cache is never momentarily empty mid-scroll.
      this.evictToBudget(index)
      onDecode?.()
    } catch {
      // Aborted or network failure — the render loop falls back to the nearest
      // resident frame, so a miss is never fatal.
    } finally {
      this.inFlight.delete(index)
    }
  }

  private evictToBudget(protectedIndex: number): void {
    if (this.bytes <= this.budget) return
    for (const index of [...this.cache.keys()]) {
      if (this.bytes <= this.budget) return
      if (index === protectedIndex) continue
      const frame = this.cache.get(index)
      if (frame) {
        frame.bitmap.close() // deterministic VRAM release, no GC wait
        this.bytes -= frame.bytes
        scrubStats.evictions++
      }
      this.cache.delete(index)
    }
  }

  public getNearest(targetIndex: number): FrameRef | null {
    const exact = this.get(targetIndex)
    if (exact) return exact

    for (let offset = 1; offset <= NEAREST_SEARCH_RADIUS; offset++) {
      // Behind first: on a miss, holding the last frame the viewer already saw
      // reads as a pause. Jumping to a future frame reads as a skip.
      const behind = this.get(targetIndex - offset)
      if (behind) return behind
      const ahead = this.get(targetIndex + offset)
      if (ahead) return ahead
    }
    return null
  }

  /**
   * Release every GPU-backed bitmap and tear down in-flight requests. Without
   * this, unmounting leaves the full budget resident for the life of the tab —
   * on a route where no canvas exists to use it — and lets a decode that lands
   * after unmount reignite the render loop against a detached canvas.
   */
  public dispose(): void {
    for (const controller of this.inFlight.values()) controller.abort()
    this.inFlight.clear()
    for (const frame of this.cache.values()) frame.bitmap.close()
    this.cache.clear()
    this.bytes = 0
  }
}

export const proxyCache = new BitmapCache(proxyFrameUrl, PROXY_BUDGET)
export const midCache = new BitmapCache(midFrameUrl, MID_BUDGET)
export const hiresCache = new BitmapCache(hiresFrameUrl, HIRES_BUDGET_DESKTOP)

/**
 * Everything the canvas can display, collapsed to one integer. `t` is written
 * ~17x more often than the output can change (EPSILON is 1/4096 of the scroll,
 * one frame is 1/240 of 70% of it), and every one of those writes used to wake
 * the render loop for a frame it would discard.
 */
const visualKeyFor = (t: number): number => {
  if (t < 0.7) {
    const localT = Math.max(0, Math.min(1, t / 0.7))
    return 1 + Math.floor(localT * (TOTAL_HERO_FRAMES - 1))
  }
  if (t < 0.85) return TOTAL_HERO_FRAMES
  const alpha = Math.max(0, 1.0 - (t - 0.85) / 0.15)
  return TOTAL_HERO_FRAMES + 1 + Math.round(alpha * ALPHA_STEPS)
}

export const ScrollCanvas = memo(function ScrollCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lastTargetIdxRef = useRef<number>(-1)
  const lastDrawnKeyRef = useRef<string>('')
  const lastGradeStepRef = useRef<number>(-1)
  const isRenderingRef = useRef<boolean>(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // alpha:false removes per-frame compositing of a transparent fullscreen
    // layer; desynchronized:true lets the compositor skip a vsync round-trip.
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true })
    if (!ctx) return
    // 'low' picks a cheaper, blurrier resampling kernel. Every tier is upscaled
    // to the backing store, so that filter was compounding the softness — and
    // the draw is one fullscreen blit, not the frame budget's bottleneck.
    ctx.imageSmoothingQuality = 'high'

    const isCoarsePointer = detectCoarsePointer()
    hiresCache.setBudget(isCoarsePointer ? HIRES_BUDGET_MOBILE : HIRES_BUDGET_DESKTOP)

    let animFrameId = 0
    let settleTimerId = 0
    let isDisposed = false
    let idxChangedAt = performance.now()
    let hiresShownAt = 0
    let idxVelocityEma = 0

    const startRender = () => {
      if (isDisposed || isRenderingRef.current) return
      isRenderingRef.current = true
      animFrameId = requestAnimationFrame(render)
    }

    const onFrameDecoded = () => startRender()

    let lastVisualKey = -1
    const unsubNight = useNight.subscribe((state, prevState) => {
      if (state.t === prevState.t) return
      const key = visualKeyFor(state.t)
      if (key === lastVisualKey) return
      lastVisualKey = key
      startRender()
    })

    /**
     * Make the whole proxy sequence resident. 2 MB over the wire, after which
     * the cache can never miss regardless of how fast the user flicks. Starts
     * at frame 1 because that is where the viewer starts; the render loop's own
     * requests jump this queue via the dedupe in load().
     */
    const fillProxyTier = () => {
      let cursor = 1
      const worker = async () => {
        while (cursor <= TOTAL_HERO_FRAMES && !isDisposed) {
          await proxyCache.load(cursor++, onFrameDecoded)
        }
      }
      for (let i = 0; i < PROXY_FILL_CONCURRENCY; i++) void worker()
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, isCoarsePointer ? 1.5 : 2)
      const newWidth = Math.round(window.innerWidth * dpr)
      const newHeight = Math.round(window.innerHeight * dpr)

      // Height-only resizes on mobile are the URL bar hiding/showing. Realloc of
      // a fullscreen 2D backing store mid-scroll is a multi-frame stall, and the
      // cover math below absorbs the ~7% height delta without letterboxing.
      if (isCoarsePointer && canvas.width === newWidth && canvas.width > 0) return
      if (canvas.width === newWidth && canvas.height === newHeight) return

      canvas.width = newWidth
      canvas.height = newHeight

      // Resizing wipes the backing store — invalidate the draw key or the canvas
      // stays black until the next frame index change.
      lastDrawnKeyRef.current = ''
      startRender()
    }

    const drawCover = (bitmap: ImageBitmap, width: number, height: number) => {
      const imgRatio = bitmap.width / bitmap.height
      const canvasRatio = width / height
      let drawWidth = width
      let drawHeight = height
      let offsetX = 0
      let offsetY = 0

      if (canvasRatio > imgRatio) {
        drawHeight = width / imgRatio
        offsetY = (height - drawHeight) / 2
      } else {
        drawWidth = height * imgRatio
        offsetX = (width - drawWidth) / 2
      }

      ctx.drawImage(
        bitmap,
        Math.floor(offsetX),
        Math.floor(offsetY),
        Math.floor(drawWidth),
        Math.floor(drawHeight)
      )
    }

    const render = () => {
      const now = performance.now()
      const t = useNight.getState().t
      const width = canvas.width
      const height = canvas.height

      let targetFrameIdx = 1
      let alpha = 1.0

      if (t < 0.7) {
        const localT = Math.max(0, Math.min(1, t / 0.7))
        targetFrameIdx = 1 + Math.floor(localT * (TOTAL_HERO_FRAMES - 1))
      } else if (t < 0.85) {
        targetFrameIdx = TOTAL_HERO_FRAMES
      } else {
        alpha = Math.max(0, 1.0 - (t - 0.85) / 0.15)
        targetFrameIdx = TOTAL_HERO_FRAMES
      }

      if (targetFrameIdx !== lastTargetIdxRef.current) {
        // How long the outgoing frame held the screen. Measured here rather than
        // at paint time because a stationary playhead is finished, not frozen —
        // gaps longer than IDLE_GAP_MS are the user not scrolling, and counting
        // them reports a 26-second "freeze" for a scroll that never happened.
        const heldMs = now - idxChangedAt
        if (lastTargetIdxRef.current !== -1 && heldMs < IDLE_GAP_MS) {
          scrubStats.activeMs += heldMs
          if (heldMs > scrubStats.worstFreezeMs) scrubStats.worstFreezeMs = heldMs
          if (heldMs > 100) scrubStats.freezesOver100ms++

          // Frames crossed per ms. An idle gap is the user not scrolling, so it
          // must not be averaged in as "very slow" — a resumed flick would then
          // be served the mid tier for the first few frames and miss them.
          const crossed = Math.abs(targetFrameIdx - lastTargetIdxRef.current)
          idxVelocityEma =
            idxVelocityEma * (1 - VELOCITY_EMA_ALPHA) +
            (crossed / Math.max(1, heldMs)) * VELOCITY_EMA_ALPHA
        } else if (heldMs >= IDLE_GAP_MS) {
          // Coming back from a rest: assume slow until proven otherwise, so the
          // first deliberate frame after a pause is sharp.
          idxVelocityEma = 0
        }
        lastTargetIdxRef.current = targetFrameIdx
        idxChangedAt = now
        hiresShownAt = 0
        clearTimeout(settleTimerId)
        // The playhead moved, so frames for the old position are dead weight —
        // free the pipe for the tier the playhead actually needs now.
        hiresCache.abortAllExcept(-1)
        midCache.abortAllExcept(targetFrameIdx)
        // Proxy frames are tiny and the sweep is already fetching them in order;
        // asking directly only matters when the user has outrun the sweep.
        void proxyCache.load(targetFrameIdx, onFrameDecoded)

        // Below flick speed the eye can resolve detail, and a 320px decode is
        // cheap enough to land within the frame. Above it, the proxy carries
        // the scroll exactly as it does today — requesting anything larger is
        // what starts the thrash this ladder exists to prevent.
        if (idxVelocityEma <= FAST_FLICK_THRESHOLD && !midCache.has(targetFrameIdx)) {
          void midCache.load(targetFrameIdx, onFrameDecoded)
        }
      }

      scrubStats.targetIdx = targetFrameIdx
      scrubStats.demandedIdx.add(targetFrameIdx)

      // Only reach for the sharp frame once the playhead has actually stopped.
      const isSettled = now - idxChangedAt >= SETTLE_MS
      if (isSettled && !hiresCache.has(targetFrameIdx)) {
        void hiresCache.load(targetFrameIdx, onFrameDecoded)
      }

      const hires = isSettled ? hiresCache.get(targetFrameIdx) : null
      // Only the exact frame: a stale mid frame from elsewhere in the sequence
      // is worse than the correct proxy one, which getNearest already handles.
      const mid = hires ? null : midCache.get(targetFrameIdx)
      const frame: FrameRef | null =
        hires ?? mid ?? proxyCache.getNearest(targetFrameIdx)

      if (frame) {
        const isHires = hires !== null
        const isMid = mid !== null
        if (isHires && hiresShownAt === 0) hiresShownAt = now

        // Quantise on the NUMBER, not the string — building the template literal
        // every rAF allocated ~60 short-lived strings a second for a value that
        // only takes 16 distinct states across the whole scroll.
        const gradeStep =
          t > 0.4 && t <= 0.85 ? Math.round(Math.min(1, (t - 0.4) / 0.4) * GRADE_STEPS) : -1

        if (gradeStep !== lastGradeStepRef.current) {
          lastGradeStepRef.current = gradeStep
          if (gradeStep < 0) {
            canvas.style.filter = 'none'
          } else {
            const step = gradeStep / GRADE_STEPS
            canvas.style.filter =
              `brightness(${1.0 - step * 0.35}) contrast(${1.0 + step * 0.15}) saturate(${1.0 - step * 0.2})`
          }
        }

        // Cross-fade the sharp frame in over the soft one rather than swapping.
        const fade = isHires
          ? Math.min(1, (now - hiresShownAt) / HIRES_FADE_MS)
          : 1
        const steppedAlpha = Math.round(alpha * ALPHA_STEPS) / ALPHA_STEPS
        const steppedFade = Math.round(fade * ALPHA_STEPS) / ALPHA_STEPS
        const tierKey = isHires ? 'h' : isMid ? 'm' : 'p'
        const drawKey = `${tierKey}_${frame.index}_${steppedAlpha}_${steppedFade}_${width}`

        if (lastDrawnKeyRef.current !== drawKey) {
          // The cover math always covers the full canvas, so at full alpha the
          // clear is a second fullscreen fill for no reason. It is only needed
          // when the frame is composited translucently over the last one.
          const isTranslucent = steppedAlpha < 1 || (isHires && steppedFade < 1)
          if (isTranslucent) ctx.clearRect(0, 0, width, height)

          // Mid-fade, lay the sharp frame over the soft one so no black shows
          // through while the two are blended. Prefer the mid tier underneath —
          // it is what was on screen a moment ago, so the fade reads as the
          // image sharpening rather than as a resolution pop.
          if (isHires && steppedFade < 1) {
            const under =
              midCache.get(frame.index) ??
              proxyCache.get(frame.index) ??
              proxyCache.getNearest(frame.index)
            if (under) {
              ctx.globalAlpha = steppedAlpha
              drawCover(under.bitmap, width, height)
            }
          }

          ctx.globalAlpha = steppedAlpha * (isHires ? steppedFade : 1)
          drawCover(frame.bitmap, width, height)
          ctx.globalAlpha = 1

          lastDrawnKeyRef.current = drawKey
          scrubStats.lastPaintAt = now
          scrubStats.paintedIdx.add(frame.index)
        }

        scrubStats.drawnIdx = frame.index
        scrubStats.tier = isHires ? 'hires' : isMid ? 'mid' : 'proxy'
        scrubStats.proxyResident = proxyCache.residentCount
        scrubStats.proxyBytes = proxyCache.residentBytes
        scrubStats.midResident = midCache.residentCount
        scrubStats.midBytes = midCache.residentBytes
        scrubStats.hiresResident = hiresCache.residentCount
        scrubStats.hiresBytes = hiresCache.residentBytes
        scrubStats.idxVelocity = idxVelocityEma

        if (scrubStats.lastTickAt > 0) {
          const dt = now - scrubStats.lastTickAt
          scrubStats.tickMsEma = scrubStats.tickMsEma * 0.9 + dt * 0.1
        }
        scrubStats.lastTickAt = now

        // Self-terminate once the exact target frame is on screen at full fade.
        // Nothing can change the output until t moves or a decode lands, and
        // both restart the loop.
        if (frame.index === targetFrameIdx && (!isHires || steppedFade >= 1)) {
          isRenderingRef.current = false

          // The settle window has not elapsed yet, and the loop is about to
          // sleep: nothing else would ever fire the request for the sharp
          // frame. Wake once, at exactly the moment it becomes due.
          if (!isHires && !hiresCache.has(targetFrameIdx)) {
            clearTimeout(settleTimerId)
            settleTimerId = window.setTimeout(startRender, SETTLE_MS)
          }
          return
        }
      }

      animFrameId = requestAnimationFrame(render)
    }

    // Sized after `render` exists — resize() restarts the loop on its own.
    resize()
    window.addEventListener('resize', resize, { passive: true })
    fillProxyTier()
    startRender()

    return () => {
      // isDisposed gates startRender: a fetch that resolves after unmount would
      // otherwise schedule a rAF holding this closure's detached canvas alive.
      isDisposed = true
      isRenderingRef.current = false
      unsubNight()
      cancelAnimationFrame(animFrameId)
      clearTimeout(settleTimerId)
      window.removeEventListener('resize', resize)
      proxyCache.dispose()
      midCache.dispose()
      hiresCache.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 object-cover w-full h-full"
    />
  )
})
ScrollCanvas.displayName = 'ScrollCanvas'
