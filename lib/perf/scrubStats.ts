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

  /** Read-ahead stride and near-search radius the ladder has settled on, and
   *  the master-tier hit rate the stride controller is closing on. Together
   *  these say WHY the ladder is serving what it is serving. */
  hiresStride: number
  hiresRadius: number
  hiresHitEma: number

  /** Smoothed frame indices crossed per ms. Above FAST_FLICK_THRESHOLD the mid
   *  tier is skipped — this is the number that says whether the gate is firing
   *  where it should. */
  idxVelocity: number

  /** Cumulative since the last reset. */
  decodes: number
  /** Decodes attributed to each tier. The tiers share one decode pipeline, so
   *  this is what says whether a background sweep is spending the throughput
   *  the master tier needed. */
  decodesByTier: { hires: number; mid: number; proxy: number }
  evictions: number
  /** Distinct frame indices that actually reached the screen. */
  paintedIdx: Set<number>
  /** Distinct frame indices the scroll asked for. */
  demandedIdx: Set<number>

  /**
   * Render ticks on which each rung of the ladder was the source of what was on
   * screen. Delivery says how many of the asked-for frames reached the screen;
   * this says what they LOOKED like when they got there. A 100% delivery served
   * entirely from the 160 px proxy is a smooth scroll through a blurry film,
   * which is the failure mode this counter exists to make visible.
   *
   * Counted per TICK, not per paint, and the difference is not academic. A
   * sharp frame is held across every target index inside the near-search
   * radius, so it paints once and stays on screen for a dozen ticks; a proxy
   * frame matches its index exactly and repaints on every one of them. Counting
   * paints therefore reports the tier that changes most often rather than the
   * tier the viewer is looking at — measured, it read a scroll that was sharp
   * two thirds of the time as 3% sharp, and the stride controller reading that
   * number drove the stride to its ceiling trying to fix a problem that was in
   * the instrument.
   */
  onScreenByTier: { hires: number; mid: number; proxy: number }

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
  hiresStride: 1,
  hiresRadius: 2,
  hiresHitEma: 1,
  decodes: 0,
  decodesByTier: { hires: 0, mid: 0, proxy: 0 },
  evictions: 0,
  paintedIdx: new Set<number>(),
  demandedIdx: new Set<number>(),
  onScreenByTier: { hires: 0, mid: 0, proxy: 0 },
  lastPaintAt: 0,
  worstFreezeMs: 0,
  freezesOver100ms: 0,
  activeMs: 0,
  lastTickAt: 0,
  tickMsEma: 0,
}

if (typeof window !== 'undefined') {
  ;(window as any).__scrubStats = scrubStats
}

export function resetScrubStats(): void {
  scrubStats.decodes = 0
  scrubStats.decodesByTier.hires = 0
  scrubStats.decodesByTier.mid = 0
  scrubStats.decodesByTier.proxy = 0
  scrubStats.evictions = 0
  scrubStats.paintedIdx.clear()
  scrubStats.demandedIdx.clear()
  scrubStats.onScreenByTier.hires = 0
  scrubStats.onScreenByTier.mid = 0
  scrubStats.onScreenByTier.proxy = 0
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

/**
 * Fraction of the scroll spent looking at the full-resolution tier.
 *
 * The companion to deliveryRatio(). Delivery can be driven to 100% by serving
 * everything from the proxy, so on its own it cannot tell a sharp film from a
 * smooth blur; this is the number that says the picture was actually sharp.
 */
export function hiresShare(): number {
  const { hires, mid, proxy } = scrubStats.onScreenByTier
  const total = hires + mid + proxy
  if (total === 0) return 0
  return hires / total
}
