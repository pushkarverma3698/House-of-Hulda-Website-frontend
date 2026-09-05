import {
  TOTAL_HERO_FRAMES,
  hiresFrameUrl,
  midFrameUrl,
  proxyFrameUrl,
  isCoarsePointer,
  MASTER_FRAME_DECODED_BYTES,
} from '@/lib/film/frames'
import { scrubStats } from '@/lib/perf/scrubStats'

/** Bounded fallback search. Only reachable in the first seconds of a cold load,
 *  before the proxy sweep has made the sequence resident. */
const NEAREST_SEARCH_RADIUS = 48

/** All 240 proxy frames need 41.7 MB. The budget is headroom over that, not a
 *  target — if it ever binds, the safety valve in evictToBudget has to run. */
const PROXY_BUDGET = 44 * 1024 * 1024

/** A 320x568 frame is 710 KB decoded. The mid tier is the step down when the
 *  master has not landed, so it only needs a working window around the
 *  playhead, not residency. */
const MID_BUDGET = 16 * 1024 * 1024

/**
 * HOW MANY MASTER FRAMES STAY DECODED.
 *
 * A decoded 720x1280 frame is 3.52 MiB, so the whole 240-frame film would be
 * 845 MiB and full residency is not on the table at any budget. What IS on the
 * table is a window wide enough that the read-ahead never has to re-decode a
 * frame the playhead is about to reach again, and wide enough to absorb a
 * scroll that reverses.
 *
 * The old figures were 56 MB on a phone (16 frames) and 96 MB on desktop (27).
 * Measured over a full 1,400 px/sec pass, the phone budget was pinned at
 * 52.7 MB with the cache evicting throughout — the window was smaller than the
 * read-ahead it had to hold, so frames were being decoded, evicted, and decoded
 * again inside one scroll.
 *
 * Scaled from navigator.deviceMemory where the browser reports it, because the
 * spread between a 2 GB Android and an 8 GB iPhone is exactly the spread
 * between "this budget is reckless" and "this budget is leaving the film soft
 * for no reason". The proxy tier's 42 MB sits underneath all of these.
 */
const hiresBudgetBytes = (): number => {
  const frames = hiresBudgetFrames()
  return frames * MASTER_FRAME_DECODED_BYTES
}

export const hiresBudgetFrames = (): number => {
  const gb =
    typeof navigator !== 'undefined' &&
    typeof (navigator as Navigator & { deviceMemory?: number }).deviceMemory === 'number'
      ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory!
      : isCoarsePointer()
        ? 4
        : 8
  // The window has to span the read-ahead plus a short trail behind: the
  // read-ahead reaches lead + HIRES_PREFETCH_AHEAD * stride, which at the
  // strides real scrolling produces is ~40 frames, and the near-search wants
  // another ten behind the playhead for a scroll that reverses. Below ~24 the
  // window is narrower than that and the cache decodes, evicts and re-decodes
  // inside one pass; much above ~64 it is holding film the viewer left minutes
  // ago at 3.5 MiB a frame.
  //
  // 24 frames (84 MB) on a 2 GB phone, 32 (113 MB) on a 4 GB one, 64 (225 MB)
  // on an 8 GB desktop. iOS Safari does not implement deviceMemory at all, so a
  // coarse pointer with no reading lands on the 4 GB rung.
  return Math.max(24, Math.min(64, Math.round(gb * 8)))
}

/** Anything the cover/aperture math can measure and drawImage can take. The
 *  ambient surround is an HTMLCanvasElement; every film frame is an
 *  ImageBitmap. */
export type Drawable = ImageBitmap | HTMLCanvasElement

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
export class BitmapCache {
  private cache = new Map<number, CachedFrame>()
  private inFlight = new Map<number, { controller: AbortController, promise: Promise<void> }>()
  private protectedIndices = new Set<number>()
  private bytes = 0

  constructor(
    private readonly urlFor: (index: number) => string,
    private budget: number,
    private readonly tier: 'hires' | 'mid' | 'proxy'
  ) {}

  public protect(index: number): void {
    this.protectedIndices.add(index)
  }

  public unprotect(index: number): void {
    this.protectedIndices.delete(index)
  }

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
    for (const [index, { controller }] of this.inFlight) {
      if (index === keepIndex || this.protectedIndices.has(index)) continue
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
    for (const [index, { controller }] of this.inFlight) {
      if (this.protectedIndices.has(index)) continue
      if (index >= lo && index <= hi) continue
      controller.abort()
      this.inFlight.delete(index)
    }
  }

  public get inFlightCount(): number {
    return this.inFlight.size
  }

  /**
   * Rolling mean of how long one frame takes to go from requested to resident,
   * in ms — fetch, blob, decode, insert, everything.
   *
   * The scheduler divides this into the tier's concurrency to get a sustainable
   * frame rate, which is Little's law and only holds if the latency is the WHOLE
   * latency. It used to time createImageBitmap alone, on the reasoning that
   * decode is what bounds the tier. Decode is what bounds it, but the timing was
   * still wrong: measured on the phone profile the model reported a pipeline
   * that could sustain every frame of a 72 frames/sec scroll, while the tier was
   * actually landing 21 a second — a 3.4x overestimate, from the fetch, the blob
   * read and the wait for a free decoder thread all falling outside the window
   * being timed.
   *
   * A stride derived from an overestimate is a stride of 1, so the read-ahead
   * asked for every consecutive frame, landed one in three, and left gaps wider
   * than any near-search could cover. Timing the whole round trip is what makes
   * the derived stride land near the 3-4 the throughput actually implies.
   */
  public loadMsEma = 0
  private static readonly LOAD_EMA_ALPHA = 0.25

  /**
   * Is anything within `radius` resident? The read-only half of
   * getNearestWithin, for schedulers that want to know whether this tier can
   * cover a frame without disturbing the LRU order by touching it.
   */
  public hasWithin(targetIndex: number, radius: number): boolean {
    if (this.cache.has(targetIndex)) return true
    for (let offset = 1; offset <= radius; offset++) {
      if (this.cache.has(targetIndex - offset)) return true
      if (this.cache.has(targetIndex + offset)) return true
    }
    return false
  }

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

  public load(index: number, onDecode?: () => void): Promise<void> {
    if (index < 1 || index > TOTAL_HERO_FRAMES) return Promise.resolve()
    if (this.cache.has(index)) return Promise.resolve()

    const existing = this.inFlight.get(index)
    if (existing) return existing.promise

    const controller = new AbortController()
    const promise = this.loadInternal(index, controller, onDecode)
    this.inFlight.set(index, { controller, promise })
    return promise
  }

  private async loadInternal(index: number, controller: AbortController, onDecode?: () => void): Promise<void> {
    const requestedAt = performance.now()
    try {
      const response = await fetch(this.urlFor(index), { signal: controller.signal })
      if (!response.ok) return

      const blob = await response.blob()
      if (controller.signal.aborted) return

      const bitmap = await createImageBitmap(blob)
      const loadMs = performance.now() - requestedAt
      this.loadMsEma =
        this.loadMsEma === 0
          ? loadMs
          : this.loadMsEma * (1 - BitmapCache.LOAD_EMA_ALPHA) + loadMs * BitmapCache.LOAD_EMA_ALPHA
          
      if (controller.signal.aborted) {
        bitmap.close()
        return
      }

      const bytes = bitmap.width * bitmap.height * 4
      this.cache.set(index, { bitmap, bytes })
      this.bytes += bytes
      scrubStats.decodes++
      scrubStats.decodesByTier[this.tier]++

      this.evictToBudget(index)
      onDecode?.()
    } catch {
      // Aborted or network failure
    } finally {
      this.inFlight.delete(index)
    }
  }

  private evictToBudget(protectedIndex: number): void {
    if (this.bytes <= this.budget) return
    for (const index of [...this.cache.keys()]) {
      if (this.bytes <= this.budget) return
      if (index === protectedIndex || this.protectedIndices.has(index)) continue
      const frame = this.cache.get(index)
      if (frame) {
        frame.bitmap.close()
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
      const behind = this.get(targetIndex - offset)
      if (behind) return behind
      const ahead = this.get(targetIndex + offset)
      if (ahead) return ahead
    }
    return null
  }

  public dispose(): void {
    for (const { controller } of this.inFlight.values()) controller.abort()
    this.inFlight.clear()
    for (const frame of this.cache.values()) frame.bitmap.close()
    this.cache.clear()
    this.bytes = 0
    // The telemetry mirror is written from the render loop, which has just
    // stopped, so without this the overlay — and anything checking that a route
    // change actually released the film — goes on reporting the memory this
    // cache held right up to the moment it let it go.
    if (this.tier === 'proxy') {
      scrubStats.proxyResident = 0
      scrubStats.proxyBytes = 0
    } else if (this.tier === 'mid') {
      scrubStats.midResident = 0
      scrubStats.midBytes = 0
    } else {
      scrubStats.hiresResident = 0
      scrubStats.hiresBytes = 0
    }
  }
}

export const proxyCache = new BitmapCache(proxyFrameUrl, PROXY_BUDGET, 'proxy')
export const midCache = new BitmapCache(midFrameUrl, MID_BUDGET, 'mid')
export const hiresCache = new BitmapCache(hiresFrameUrl, hiresBudgetBytes(), 'hires')
