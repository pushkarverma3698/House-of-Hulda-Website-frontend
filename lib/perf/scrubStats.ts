/**
 * Live scrub telemetry, written by ScrollCanvas and read by the ?debug=perf
 * overlay.
 *
 * A plain mutable object on purpose: this is sampled inside the render loop at
 * up to 60Hz, and routing it through React state would make the instrument
 * change the thing it is measuring.
 */
export interface ScrubStats {
  /** Frame index the scroll position is asking for right now. */
  targetIdx: number
  /** Frame index actually on screen. Diverges from targetIdx on a cache miss. */
  drawnIdx: number
  /** Which ladder rung is on screen. */
  tier: 'proxy' | 'mid' | 'hires' | 'none'

  proxyResident: number
  proxyBytes: number
  midResident: number
  midBytes: number
  hiresResident: number
  hiresBytes: number

  /** Smoothed frame indices crossed per ms. Above FAST_FLICK_THRESHOLD the mid
   *  tier is skipped — this is the number that says whether the gate is firing
   *  where it should. */
  idxVelocity: number

  /** Cumulative since the last reset. */
  decodes: number
  evictions: number
  /** Distinct frame indices that actually reached the screen. */
  paintedIdx: Set<number>
  /** Distinct frame indices the scroll asked for. */
  demandedIdx: Set<number>

  lastPaintAt: number
  /** Longest single frame freeze, ms. The number that reads as "jank".
   *  Only accumulated while the playhead is actually moving — a stationary page
   *  is not frozen, it is finished, and counting its idle time would report a
   *  26-second "freeze" for a scroll that never happened. */
  worstFreezeMs: number
  freezesOver100ms: number
  /** Wall time spent actively scrubbing. The denominator for film fps. */
  activeMs: number

  /** rAF health of the render loop itself. */
  lastTickAt: number
  tickMsEma: number
}

export const scrubStats: ScrubStats = {
  targetIdx: 0,
  drawnIdx: 0,
  tier: 'none',
  proxyResident: 0,
  proxyBytes: 0,
  midResident: 0,
  midBytes: 0,
  hiresResident: 0,
  hiresBytes: 0,
  idxVelocity: 0,
  decodes: 0,
  evictions: 0,
  paintedIdx: new Set<number>(),
  demandedIdx: new Set<number>(),
  lastPaintAt: 0,
  worstFreezeMs: 0,
  freezesOver100ms: 0,
  activeMs: 0,
  lastTickAt: 0,
  tickMsEma: 0,
}

export function resetScrubStats(): void {
  scrubStats.decodes = 0
  scrubStats.evictions = 0
  scrubStats.paintedIdx.clear()
  scrubStats.demandedIdx.clear()
  scrubStats.worstFreezeMs = 0
  scrubStats.freezesOver100ms = 0
  scrubStats.activeMs = 0
  scrubStats.lastPaintAt = 0
  scrubStats.tickMsEma = 0
}

/**
 * Fraction of the frames the film asked for that the screen actually showed.
 * This is the number that corresponds to how the scroll FEELS — rAF can sit at
 * 60fps while this sits at 0.05 and the result looks like a broken slideshow.
 */
export function deliveryRatio(): number {
  const demanded = scrubStats.demandedIdx.size
  if (demanded === 0) return 1
  return scrubStats.paintedIdx.size / demanded
}
