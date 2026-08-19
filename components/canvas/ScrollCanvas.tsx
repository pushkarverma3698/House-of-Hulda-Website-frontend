'use client'

import { useEffect, useRef, memo } from 'react'
import { useNight } from '@/lib/store/night'
import { scrubStats } from '@/lib/perf/scrubStats'

export const TOTAL_HERO_FRAMES = 240

/**
 * FRAME LADDER — SHARP BY DEFAULT, STEPPED UNDER LOAD
 *
 * Three encodings of the film exist: a 160x284 proxy, a 320x568 mid, and the
 * 720x1280 master. What changed is which one the viewer actually looks at.
 *
 * The ladder used to pick a tier by scroll velocity, dropping to the proxy above
 * a flick threshold and only reaching for the master once the scroll had come to
 * a full stop. Both halves of that misfired against the real geometry:
 *
 *   - The film spans ~5,000 px of mobile scroll across 240 frames, so one frame
 *     is ~21 px and an ordinary 1,400 px/sec scroll is 67 frames/sec. The
 *     threshold sat below almost all real scrolling, so the 160 px proxy was
 *     what the viewer saw for essentially the whole film.
 *   - Gating the master on stillness meant the frames a viewer spends nearly all
 *     their time looking at — the ones being scrolled through — could never be
 *     sharp by construction.
 *
 * Measured at 1,400 px/sec on an iPhone 15 Pro profile, the sharp tier was on
 * screen for 9.3% of frames.
 *
 * The ladder now trades TEMPORAL resolution for SPATIAL resolution instead of
 * the other way round. Eye motion blur hides a dropped frame; it does not hide a
 * 9x upscale, because the blur runs along the axis of travel while the softness
 * is in every direction at once. So when the playhead outruns the pipeline we
 * stop trying to deliver every frame and deliver sharp ones instead:
 *
 *   keeping up  -> every frame, from the master
 *   outrunning  -> every STRIDE-th frame from the master, gaps covered by a
 *                  bounded near-search, stride derived from measured decode cost
 *   cache miss  -> mid, then the proxy, which stays fully resident as the floor
 *
 * Decode, not network, is the constraint: a full-resolution frame fetches in
 * ~23 ms and decodes in 5-70 ms depending on whether the device has a hardware
 * JPEG path. The stride is therefore derived from BitmapCache.decodeMsEma at run
 * time rather than from a constant, so a fast phone strides 1 and holds every
 * frame sharp while a slow one degrades to stepping rather than to mush.
 *
 * Regenerate the lower tiers with ./scripts/encode-proxy-frames.sh and
 * ./scripts/encode-mid-frames.sh
 *
 * NOTE: the master is 720x1280 and a current phone asks for ~1,440 px wide at
 * native, so even the sharp tier is a ~2x upscale. Closing that last step needs
 * a re-master, not a scheduling change.
 */
export const proxyFrameUrl = (index: number) =>
  `/frames/hero-proxy/frame_${String(index).padStart(3, '0')}.webp`
const midFrameUrl = (index: number) =>
  `/frames/hero-mid/frame_${String(index).padStart(3, '0')}.webp`
const hiresFrameUrl = (index: number) => {
  if (typeof window === 'undefined') return `/frames/hero/frame_${String(index).padStart(3, '0')}.jpg`
  const isDesktop = !window.matchMedia('(pointer: coarse)').matches && window.innerWidth >= 768
  return isDesktop
    ? `/frames/hero-desktop/frame_${String(index).padStart(3, '0')}.jpg`
    : `/frames/hero/frame_${String(index).padStart(3, '0')}.jpg`
}

/** All 240 proxy frames need 41.7 MB. The budget is headroom over that, not a
 *  target — if it ever binds, the safety valve in evictToBudget has to run. */
const PROXY_BUDGET = 44 * 1024 * 1024

/** Full-resolution frames now carry the scroll itself, not just the stops, so
 *  the mobile tier holds a real working window instead of two frames. At
 *  3.52 MiB decoded that is ~16 frames — enough for HIRES_PREFETCH_AHEAD to stay
 *  ahead of a deliberate scroll and to keep a short trail behind it for the
 *  bounded backward search in getNearestWithin. On top of the proxy tier's
 *  41.7 MB and the mid tier's 24 MB this lands near 122 MB, which is within
 *  what current iOS/Android Safari and Chrome hold for a foreground tab. */
const HIRES_BUDGET_MOBILE = 56 * 1024 * 1024
const HIRES_BUDGET_DESKTOP = 96 * 1024 * 1024

/** A 320x568 frame is 710 KB decoded, so this is a ~33-frame trailing window.
 *  No mobile/desktop split: 24 MB on top of the proxy tier's 42 MB and two
 *  full-resolution frames is ~73 MB, which the weakest target device holds. */
const MID_BUDGET = 24 * 1024 * 1024

/**
 * Frames per ms the full-resolution pipeline can actually sustain — fetch a
 * ~134 KB JPEG and decode it to 720x1280, HIRES_FETCH_CONCURRENCY at a time.
 * The read-ahead stride is derived from this, and deriving it from the pipeline
 * rather than from a notion of "what counts as a flick" is the point.
 *
 * This replaces a FAST_FLICK_THRESHOLD that was set to 0.05 — 50 frames/sec — on
 * the reasoning that the eye cannot resolve detail past that speed. Two things
 * were wrong with it. Against the real geometry the film spans ~5,000 px of
 * mobile scroll across 240 frames, so one frame is ~21 px and an ordinary
 * sustained scroll of 1,400 px/sec is already 67 frames/sec: the threshold was
 * above almost all real scrolling, so the 160 px proxy was what the viewer
 * looked at for the whole film. And the premise itself does not hold — eye
 * motion blur hides a dropped *frame*, but it does not hide a 9x upscale,
 * because the blur runs along the axis of travel while the softness is in every
 * direction at once.
 *
 * So the ladder now trades temporal resolution for spatial resolution rather
 * than the other way round. Measured: at 1,400 px/sec the old ladder delivered
 * 9.3% of frames from the sharp tier, and setting this threshold from the
 * pipeline's real ceiling rather than from flick speed is what moves it.
 */
const HIRES_SUSTAINED_RATE = 0.02

/** Upper bound on the read-ahead stride. At stride 8 the film plays back at an
 *  eighth of its authored rate, which is the point where stepping stops reading
 *  as motion and starts reading as a slideshow; past there the proxy's
 *  smoothness is genuinely the better trade. */
const HIRES_MAX_STRIDE = 8

/** Expected fetch-and-decode latency for one full-resolution frame, in ms, used
 *  to set how far ahead the read-ahead starts. It does not need to be exact —
 *  it only has to be large enough that a requested frame is still in front of
 *  the playhead when it arrives. Too small and every prefetch is stale on
 *  arrival; too large and the read-ahead runs off into film the viewer may
 *  never reach. */
const HIRES_LEAD_MS = 150

/** Smoothing for the frame-velocity estimate. A single slow tick between two
 *  fast ones must not flip the tier and trigger a request the flick will
 *  outrun. */
const VELOCITY_EMA_ALPHA = 0.3

/** Concurrency for the background sweep that makes the proxy tier resident.
 *  Browsers multiplex over HTTP/2, so an unbounded fan-out does not queue — it
 *  splits the same pipe and every frame arrives late. */
const PROXY_FILL_CONCURRENCY = 4

/** How long the playhead must hold still before the sharp frame is requested.
 *  Kept only as the trigger for the focus-in cross-fade on a deliberate stop —
 *  the sharp frame itself is now requested unconditionally, on every frame
 *  change, because waiting for a stop is what made the whole film soft. */
const SETTLE_MS = 140

/** How many frames ahead of the playhead to fetch at full resolution, in the
 *  direction of travel. Without this the sharp tier is always chasing: the
 *  request for frame N is issued as the playhead arrives at N and lands after it
 *  has gone, so the exact frame is never resident when it is needed and the
 *  fallback is a 160 px proxy. Fetching forward turns the sharp tier from a
 *  thing that arrives late into a thing that is already there. */
const HIRES_PREFETCH_AHEAD = 10

/** Concurrency for full-resolution fetches. The proxy sweep is already using
 *  part of the pipe, and a prefetch fan-out wide enough to compete with it
 *  starves the one frame the playhead actually needs right now.
 *
 *  Two, not three: resuming from a pause resets the velocity estimate to zero,
 *  which selects stride 1 and queues a burst of consecutive full-resolution
 *  frames. Measured, three concurrent 720x1280 decodes in that burst produced
 *  350 ms stalls; two holds the same tier occupancy without them. */
const HIRES_FETCH_CONCURRENCY = 2

/** Floor for how far from the target a resident sharp frame may be and still be
 *  drawn instead of the proxy. Two frames is ~42 px of scroll — during motion
 *  that reads as a fractionally late film, which is invisible, where dropping to
 *  the proxy reads as the picture dissolving, which is not.
 *
 *  The effective radius is raised to half the current stride at run time; this
 *  is only the minimum, for when the film is being read slowly. */
const HIRES_NEAREST_RADIUS = 2

/** Near-search radius for the mid tier. Wider than the sharp tier's because the
 *  mid tier is the graceful step down rather than the target: at 4.5x upscale a
 *  frame three away is still a considerably better picture than the 9x proxy,
 *  and this is the band that decides whether outrunning the sharp tier reads as
 *  a slight softening or as the image falling apart. */
const MID_NEAREST_RADIUS = 3

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

/**
 * WHERE THE FILM ENDS AND THE SKY BEGINS
 *
 * The film is a descent: valley, orchard, the house, then inside it. Its last
 * frame is a lit interior. The story told over it goes the other way — it opens
 * out, from the hearth at 19:07 to a Bortle Class 1 sky at 19:45, the eighteen
 * deities, and dawn.
 *
 * These used to be 0.7 / 0.85 / 1.0: the film reached its last frame at t=0.7
 * and then HELD that frame, fully opaque, until 0.85. Measured against the
 * layout, the sections land at
 *
 *     L-06 The Hearth      centred at t = 0.602
 *     L-07 The Eighteen Gods  enters at t = 0.711, centred at 0.747
 *     L-08 The Valley Commons enters at t = 0.882
 *
 * so the stargazing centrepiece — telescope telemetry, eighteen gods, the whole
 * reason the site exists — was composited on top of a frozen photograph of a
 * bed with the lights on, and so was the marketplace, and so was half the
 * closing call to action. The WebGL sky underneath it was already good; it was
 * simply never visible.
 *
 * Re-timed against those measurements: the film now plays its full 240 frames
 * by the time L-06 is centred, holds only long enough to read that beat, and
 * has dissolved before L-07 enters. Everything from 0.70 on belongs to the sky.
 */
const FILM_END_T = 0.6
const DISSOLVE_START_T = 0.64
const DISSOLVE_END_T = 0.7

/** Where the night grade starts closing down the picture. */
const GRADE_START_T = 0.4

/**
 * THE APERTURE — how a 9:16 film is presented on a landscape screen.
 *
 * The master is 720x1280, shot vertical. Cover-fitting it to a desktop viewport
 * does two things, and both of them are why the film reads soft:
 *
 *   - It scales 720 px of source across a 3024 px backing store (1512 CSS px at
 *     dpr 2) — a 4.2x upscale, before the tier ladder has made a single
 *     decision. No scheduling change reaches it, because the pixels do not
 *     exist.
 *   - It crops the frame to the middle 32% of its height. The snowline, the
 *     cloud break, the whole sense of altitude the copy is describing sits
 *     above the crop. Desktop visitors have never seen the peaks.
 *
 * So on a landscape screen the film is drawn CONTAINED, in a tall centred
 * aperture at close to its native resolution — 871 device px wide at
 * 1512x900 dpr 2, a 1.21x upscale instead of 4.2x — with the full composition
 * intact. The surround is the same frame drawn 32 px wide and blown back up:
 * the upscale is the blur, so an ambient field that tracks the film's own
 * colour costs one extra drawImage and no filter.
 *
 * Phones are untouched. A 390x844 phone lands the film at 0.99x with the full
 * frame already visible — cover is exactly right there and always was.
 */
const APERTURE_HEIGHT_RATIO = 0.86

/** The master's aspect. Needed before any bitmap has decoded, to size the
 *  aperture for the layout on the very first resize. */
const FRAME_ASPECT_W = 720
const FRAME_ASPECT_H = 1280

/** Below this much CSS-pixel field on each side there is nowhere for the story
 *  copy to go, so a small desktop window keeps the full-bleed treatment. */
const APERTURE_MIN_FIELD_PX = 300

/** Width of the ambient downsample. Small enough that blowing it back up to the
 *  full canvas is a smooth field rather than a second, competing picture. */
const AMBIENT_W = 32

/** How far the ambient field is sunk behind the aperture. Under ~0.5 it reads
 *  as a blurry duplicate of the frame competing with the sharp one; past ~0.72
 *  it goes to flat black and the screen reads as empty rather than as a lit
 *  room around a window. The night grade multiplies this later in the film, so
 *  it is set from how the daylight acts look. */
const AMBIENT_SINK = 0.58

/**
 * The dissolve is a CSS opacity on the canvas ELEMENT, not a globalAlpha on its
 * contents. Two reasons: the context is `alpha: false`, so compositing the
 * frame translucently against its own backing store fades towards black rather
 * than towards what is behind the canvas; and an element opacity is a
 * compositor property, so the whole handoff costs no redraws at all — the
 * render loop stays asleep through it.
 */
const DISSOLVE_STEPS = 32

const detectCoarsePointer = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768
}

/** Anything the cover/aperture math can measure and drawImage can take. The
 *  ambient surround is an HTMLCanvasElement; every film frame is an
 *  ImageBitmap. */
type Drawable = ImageBitmap | HTMLCanvasElement

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

  /**
   * Tear down requests for frames the playhead can no longer reach, keeping the
   * ones inside [lo, hi]. abortAllExcept is wrong for a prefetching tier: it
   * cancels the read-ahead on every frame change, which is every ~21 px of
   * scroll, so no forward request ever survives long enough to land and the
   * tier can only ever serve the frame the playhead has already passed.
   */
  public abortOutsideWindow(lo: number, hi: number): void {
    for (const [index, controller] of this.inFlight) {
      if (index >= lo && index <= hi) continue
      controller.abort()
      this.inFlight.delete(index)
    }
  }

  public get inFlightCount(): number {
    return this.inFlight.size
  }

  /**
   * Rolling mean of createImageBitmap duration for this tier, in ms.
   *
   * The scheduler needs this because decode, not network, is what bounds the
   * sharp tier — measured on one device, fetching a full-resolution frame took
   * 23 ms and decoding it 62 ms — and because that figure varies by an order of
   * magnitude across devices: hardware JPEG decode on a current phone is single
   * digits, software decode is not. Hard-coding a throughput assumption gets one
   * class of device right and the rest wrong, so the stride is derived from what
   * decode is actually costing here, now.
   */
  public decodeMsEma = 0
  private static readonly DECODE_EMA_ALPHA = 0.25

  /**
   * Nearest resident frame within a tight radius, preferring the one behind.
   * Separate from getNearest so the sharp tier can accept a slightly stale
   * frame during motion without inheriting that tier's 48-frame search, which
   * would happily draw a frame from a completely different shot.
   */
  public getNearestWithin(targetIndex: number, radius: number): FrameRef | null {
    const exact = this.get(targetIndex)
    if (exact) return exact
    for (let offset = 1; offset <= radius; offset++) {
      const behind = this.get(targetIndex - offset)
      if (behind) return behind
      const ahead = this.get(targetIndex + offset)
      if (ahead) return ahead
    }
    return null
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
      const decodeStart = performance.now()
      const bitmap = await createImageBitmap(blob)
      this.decodeMsEma =
        this.decodeMsEma === 0
          ? performance.now() - decodeStart
          : this.decodeMsEma * (1 - BitmapCache.DECODE_EMA_ALPHA) +
            (performance.now() - decodeStart) * BitmapCache.DECODE_EMA_ALPHA
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

/** The frame the playhead is asking for at this scroll position. */
const frameIndexFor = (t: number): number => {
  if (t >= FILM_END_T) return TOTAL_HERO_FRAMES
  const localT = Math.max(0, Math.min(1, t / FILM_END_T))
  return 1 + Math.floor(localT * (TOTAL_HERO_FRAMES - 1))
}

/**
 * The film's opacity at this scroll position, quantised.
 *
 * Applied to the canvas element rather than to its contents — see
 * DISSOLVE_STEPS. Past DISSOLVE_END_T this is 0 and the sky owns the screen.
 */
const dissolveFor = (t: number): number => {
  if (t <= DISSOLVE_START_T) return 1
  if (t >= DISSOLVE_END_T) return 0
  const remaining = 1 - (t - DISSOLVE_START_T) / (DISSOLVE_END_T - DISSOLVE_START_T)
  return Math.round(remaining * DISSOLVE_STEPS) / DISSOLVE_STEPS
}

/**
 * Everything the canvas can display, collapsed to one integer. `t` is written
 * ~17x more often than the output can change (EPSILON is 1/4096 of the scroll,
 * one frame is 1/240 of 60% of it), and every one of those writes used to wake
 * the render loop for a frame it would discard.
 *
 * The dissolve is deliberately NOT part of this key: it is an element opacity
 * set straight from the subscription, so it needs no repaint and must not wake
 * the loop.
 */
const visualKeyFor = (t: number): number => frameIndexFor(t)

export const ScrollCanvas = memo(function ScrollCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lastTargetIdxRef = useRef<number>(-1)
  const lastTierRef = useRef<'hires' | 'mid' | 'proxy' | ''>('')
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
    // Derived from velocity on every frame change; read again at draw time, so
    // they live alongside the velocity estimate rather than inside the block.
    let hiresStride = 1
    let hiresRadius = HIRES_NEAREST_RADIUS

    const startRender = () => {
      if (isDisposed || isRenderingRef.current) return
      isRenderingRef.current = true
      animFrameId = requestAnimationFrame(render)
    }

    const onFrameDecoded = () => startRender()

    let lastVisualKey = -1
    let lastDissolve = -1
    const applyDissolve = (t: number) => {
      const next = dissolveFor(t)
      if (next === lastDissolve) return
      lastDissolve = next
      canvas.style.opacity = String(next)
      // Once the film is gone it must not keep eating the sky's fill rate, and
      // it must not be a compositing layer the browser still blends every frame.
      canvas.style.visibility = next === 0 ? 'hidden' : 'visible'
    }
    applyDissolve(useNight.getState().t)

    const unsubNight = useNight.subscribe((state, prevState) => {
      if (state.t === prevState.t) return
      applyDissolve(state.t)
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
      // The phone cap used to be 1.5. On every current handset that is a second,
      // invisible softening applied after all the tier work: an iPhone 15 is
      // 1179x2556 physical, the canvas backed it at 590x1278, and the browser
      // then stretched that box 2.0x to reach the screen. Nothing downstream can
      // recover from it, and it applies even to a perfectly sharp frame.
      //
      // Uncapping it on phones is affordable precisely because their viewports
      // are small: 1179x2556 is 3.0 MP against the 8.3 MP a desktop asks for at
      // dpr 2, and the film layer's per-frame cost is one fullscreen drawImage,
      // not a shaded scene. The WebGL layer stays capped at dpr 1 in SceneRoot,
      // which is where the fill-rate cost actually lives.
      const dpr = Math.min(window.devicePixelRatio || 1, isCoarsePointer ? 3 : 2)
      const newWidth = Math.round(window.innerWidth * dpr)
      const newHeight = Math.round(window.innerHeight * dpr)

      // Height-only resizes on mobile are the URL bar hiding/showing. Realloc of
      // a fullscreen 2D backing store mid-scroll is a multi-frame stall, and the
      // cover math below absorbs the ~7% height delta without letterboxing.
      if (isCoarsePointer && canvas.width === newWidth && canvas.width > 0) return
      if (canvas.width === newWidth && canvas.height === newHeight) return

      canvas.width = newWidth
      canvas.height = newHeight
      applyFit()

      // Resizing wipes the backing store — invalidate the draw key or the canvas
      // stays black until the next frame index change.
      lastDrawnKeyRef.current = ''
      startRender()
    }

    /**
     * Decide between the aperture and full-bleed cover, and publish the answer
     * on <html> so the story layout can key off the same decision.
     *
     * One source of truth on purpose. The copy is placed in the field beside
     * the aperture, so a CSS media query guessing independently at when the
     * aperture is active would put the copy in a column that is not there.
     */
    const applyFit = () => {
      const apertureCssWidth =
        window.innerHeight * APERTURE_HEIGHT_RATIO * (FRAME_ASPECT_W / FRAME_ASPECT_H)
      const fieldPx = (window.innerWidth - apertureCssWidth) / 2
      fit = !isCoarsePointer && fieldPx >= APERTURE_MIN_FIELD_PX ? 'aperture' : 'cover'
      document.documentElement.dataset.filmFit = fit
    }

    const drawCover = (bitmap: Drawable, width: number, height: number) => {
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

    // The ambient surround. Reused across draws — allocating a canvas per frame
    // would put a fresh backing store into the GC path 60 times a second.
    const ambient = document.createElement('canvas')
    const ambientCtx = ambient.getContext('2d', { alpha: false })

    const apertureRect = (bitmap: Drawable, width: number, height: number) => {
      const drawHeight = Math.floor(height * APERTURE_HEIGHT_RATIO)
      const drawWidth = Math.floor(drawHeight * (bitmap.width / bitmap.height))
      return {
        x: Math.floor((width - drawWidth) / 2),
        y: Math.floor((height - drawHeight) / 2),
        w: drawWidth,
        h: drawHeight,
      }
    }

    /**
     * Everything behind the aperture: the ambient field and the frame's edge.
     *
     * Separate from the frame draw because it is drawn once per paint at full
     * opacity, while the frame itself may be drawn twice — the outgoing tier
     * then the incoming one — under a cross-fade alpha. Painting the backdrop
     * inside that would apply the fade to the surround as well, and the field
     * would pulse darker on every focus-in.
     */
    const drawBackdrop = (bitmap: Drawable, width: number, height: number) => {
      // The frame drawn tiny, then blown back up to fill: the upscale is the
      // blur, so this is a colour field that tracks the film for the cost of
      // two drawImage calls and no filter.
      if (ambientCtx) {
        const ah = Math.max(1, Math.round((AMBIENT_W * bitmap.height) / bitmap.width))
        if (ambient.width !== AMBIENT_W || ambient.height !== ah) {
          ambient.width = AMBIENT_W
          ambient.height = ah
        }
        ambientCtx.drawImage(bitmap, 0, 0, AMBIENT_W, ah)
        drawCover(ambient, width, height)
      } else {
        ctx.fillStyle = '#060a10'
        ctx.fillRect(0, 0, width, height)
      }

      // Sink it, so it reads as the light spilling off the frame rather than as
      // a second, softer copy of the picture competing with the sharp one.
      ctx.fillStyle = `rgba(6, 10, 16, ${AMBIENT_SINK})`
      ctx.fillRect(0, 0, width, height)

      // A hairline, so the aperture terminates as an edge rather than as the
      // point where the picture happens to stop.
      const r = apertureRect(bitmap, width, height)
      ctx.strokeStyle = 'rgba(243, 236, 225, 0.10)'
      ctx.lineWidth = Math.max(1, Math.round(height / 900))
      ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1)
    }

    /** 'aperture' on a landscape desktop window with room for the copy beside
     *  the film; 'cover' everywhere else, which is every phone. */
    let fit: 'cover' | 'aperture' = 'cover'

    const drawFrame = (bitmap: Drawable, width: number, height: number) => {
      if (fit === 'cover') {
        drawCover(bitmap, width, height)
        return
      }
      const r = apertureRect(bitmap, width, height)
      ctx.drawImage(bitmap, r.x, r.y, r.w, r.h)
    }

    const render = () => {
      const now = performance.now()
      const t = useNight.getState().t
      const width = canvas.width
      const height = canvas.height

      const targetFrameIdx = frameIndexFor(t)

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
        const direction = targetFrameIdx >= lastTargetIdxRef.current ? 1 : -1
        lastTargetIdxRef.current = targetFrameIdx
        idxChangedAt = now
        // Only reset the focus-in fade when the sharp tier is not already what
        // is on screen. Now that hires carries the scroll, resetting on every
        // frame change would re-run a 220 ms fade ~50 times a second and the
        // film would read as pulsing rather than as one continuous shot.
        if (lastTierRef.current !== 'hires') hiresShownAt = 0
        clearTimeout(settleTimerId)
        midCache.abortAllExcept(targetFrameIdx)
        // Proxy frames are tiny and the sweep is already fetching them in order;
        // asking directly only matters when the user has outrun the sweep.
        void proxyCache.load(targetFrameIdx, onFrameDecoded)

        // The mid tier is now a fallback under hires rather than a
        // velocity-selected destination, so it is always worth having: a 320 px
        // decode is low single-digit ms and it is what stands in when the sharp
        // frame has not landed yet.
        if (!midCache.has(targetFrameIdx)) {
          void midCache.load(targetFrameIdx, onFrameDecoded)
        }

        // Read ahead at full resolution in the direction of travel, thinning the
        // read-ahead in proportion to how far the playhead is outrunning the
        // pipeline. This is the whole trade: above HIRES_SUSTAINED_RATE we stop
        // asking for every frame at full resolution — which yields almost none
        // of them — and ask for every STRIDE-th one, which we actually get.
        //
        // The stride is derived, not picked. A fixed stride is wrong at some
        // speed by construction: too small and the requests still outrun the
        // pipeline, too large and the film steps when it did not need to.
        // Frames per ms this device can actually decode, from what decode is
        // costing right now rather than from a constant. HIRES_SUSTAINED_RATE is
        // only the seed, used until the first full-resolution frame has been
        // timed.
        const sustainedRate =
          hiresCache.decodeMsEma > 0
            ? HIRES_FETCH_CONCURRENCY / hiresCache.decodeMsEma
            : HIRES_SUSTAINED_RATE
        hiresStride = Math.max(
          1,
          Math.min(HIRES_MAX_STRIDE, Math.ceil(idxVelocityEma / sustainedRate))
        )
        // The near-search has to span half a stride in each direction or frames
        // landing mid-gap find nothing sharp and fall through to the proxy,
        // which would undo the striding entirely.
        hiresRadius = Math.max(HIRES_NEAREST_RADIUS, Math.ceil(hiresStride / 2))
        const stride = hiresStride

        // How far ahead the read-ahead has to START. A request is only worth
        // issuing if the playhead has not already passed the frame by the time
        // it lands, and at speed that rules out the adjacent frames: at 67
        // frames/sec a ~150 ms fetch-and-decode covers ten frames of travel, so
        // asking for the next one produces a frame that is stale on arrival and
        // is then aborted by the window trim below — paid for, and thrown away.
        // This was the whole reason striding alone did not move the number.
        const lead = Math.max(
          stride,
          Math.ceil(idxVelocityEma * HIRES_LEAD_MS)
        )
        const reach = lead + HIRES_PREFETCH_AHEAD * stride

        // Keep the in-flight requests still inside the window — cancelling them
        // on every frame change is what kept the sharp tier permanently behind
        // the playhead. The trailing edge keeps hiresRadius frames behind the
        // playhead, because those are exactly the ones the near-search draws.
        const lo = direction > 0 ? targetFrameIdx - hiresRadius : targetFrameIdx - reach
        const hi = direction > 0 ? targetFrameIdx + reach : targetFrameIdx + hiresRadius
        hiresCache.abortOutsideWindow(lo, hi)

        // Ask for the frame under the playhead only while the pipeline can still
        // keep up with every frame. Above that, it is the single worst request
        // available: at 67 frames/sec a decode takes longer than the frame stays
        // current, so it is stale before it lands — and because it is issued on
        // every frame change it occupies both concurrency slots permanently,
        // starving the read-ahead that would actually have arrived in time.
        // Measured, this one request was consuming 102 fetches in 2.5 s to put
        // 5 frames on screen.
        if (stride === 1) {
          void hiresCache.load(targetFrameIdx, onFrameDecoded)
        }
        for (let step = 0; step < HIRES_PREFETCH_AHEAD; step++) {
          if (hiresCache.inFlightCount >= HIRES_FETCH_CONCURRENCY) break
          const ahead = targetFrameIdx + (lead + step * stride) * direction
          if (ahead < 1 || ahead > TOTAL_HERO_FRAMES) break
          if (hiresCache.has(ahead)) continue
          void hiresCache.load(ahead, onFrameDecoded)
        }
      }

      scrubStats.targetIdx = targetFrameIdx
      scrubStats.demandedIdx.add(targetFrameIdx)

      const isSettled = now - idxChangedAt >= SETTLE_MS
      if (!hiresCache.has(targetFrameIdx)) {
        void hiresCache.load(targetFrameIdx, onFrameDecoded)
      }

      // The sharp tier is no longer gated on the scroll having stopped. It was
      // that gate, not the fetch cost, that made the film soft in motion: the
      // frame the viewer spends nearly all their time looking at is one the
      // playhead is moving through, and the gate guaranteed that frame was
      // served from the 160 px proxy.
      //
      // Standing still still buys something — the exact frame rather than one up
      // to HIRES_NEAREST_RADIUS away — but the difference is now two frames of
      // lag, not a change of resolution.
      //
      // The exact frame is preferred and the near one is only a floor, in that
      // order unconditionally. Gating the near one on motion would mean coming
      // to a stop could drop a sharp neighbouring frame in favour of the proxy
      // while the exact frame was still in flight, i.e. the picture would get
      // worse at the moment the viewer stopped to look at it.
      const hires =
        hiresCache.get(targetFrameIdx) ??
        hiresCache.getNearestWithin(targetFrameIdx, hiresRadius)
      // The mid tier gets the same bounded near-search as the sharp one. Matching
      // only the exact index meant that whenever the sharp tier missed, the mid
      // tier missed for the identical reason — the playhead had moved on — and
      // the fallback collapsed straight to the 160 px proxy. Measured over a full
      // scroll, the mid tier was serving 0.0% of frames: it was costing a request
      // and a decode per frame change and never once reaching the screen.
      const mid = hires
        ? null
        : midCache.getNearestWithin(targetFrameIdx, MID_NEAREST_RADIUS)
      const frame: FrameRef | null =
        hires ?? mid ?? proxyCache.getNearest(targetFrameIdx)

      if (frame) {
        const isHires = hires !== null
        const isMid = mid !== null
        if (isHires && hiresShownAt === 0) hiresShownAt = now
        lastTierRef.current = isHires ? 'hires' : isMid ? 'mid' : 'proxy'

        // Quantise on the NUMBER, not the string — building the template literal
        // every rAF allocated ~60 short-lived strings a second for a value that
        // only takes 16 distinct states across the whole scroll.
        // Reaches full grade as the dissolve starts, so the film is at its
        // darkest at the moment it hands over to the sky rather than snapping
        // back to an ungraded frame partway through.
        const gradeStep =
          t > GRADE_START_T
            ? Math.round(
                Math.min(1, (t - GRADE_START_T) / (DISSOLVE_START_T - GRADE_START_T)) * GRADE_STEPS
              )
            : -1

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
        const steppedFade = Math.round(fade * ALPHA_STEPS) / ALPHA_STEPS
        const tierKey = isHires ? 'h' : isMid ? 'm' : 'p'
        const drawKey = `${tierKey}_${frame.index}_${steppedFade}_${width}_${fit}`

        if (lastDrawnKeyRef.current !== drawKey) {
          // In aperture mode the frame does not cover the canvas, so the
          // surround is repainted on every paint. In cover mode the draw fills
          // everything and the clear is only needed while two tiers blend.
          if (fit === 'aperture') {
            drawBackdrop(frame.bitmap, width, height)
          } else if (isHires && steppedFade < 1) {
            ctx.clearRect(0, 0, width, height)
          }

          // Mid-fade, lay the sharp frame over the soft one so no black shows
          // through while the two are blended. Prefer the mid tier underneath —
          // it is what was on screen a moment ago, so the fade reads as the
          // image sharpening rather than as a resolution pop.
          if (isHires && steppedFade < 1) {
            const under =
              midCache.get(frame.index) ??
              proxyCache.get(frame.index) ??
              proxyCache.getNearest(frame.index)
            if (under) drawFrame(under.bitmap, width, height)
          }

          ctx.globalAlpha = isHires ? steppedFade : 1
          drawFrame(frame.bitmap, width, height)
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
      // The story layout keys off this. Leaving it set on a route where no film
      // canvas exists would place that route's copy in a column beside nothing.
      delete document.documentElement.dataset.filmFit
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
