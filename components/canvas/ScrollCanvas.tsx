'use client'

import { useEffect, useRef, memo } from 'react'
import { useNight } from '@/lib/store/night'
import { scrubStats } from '@/lib/perf/scrubStats'
import { TOTAL_HERO_FRAMES } from '@/lib/film/frames'
import {
  proxyCache,
  midCache,
  hiresCache,
  type Drawable,
  type FrameRef,
} from '@/lib/film/frameCache'
import {
  onFrameDecoded as onFilmFrameDecoded,
  setFilmActive,
  fillProxyTier,
} from '@/lib/film/preload'
import { isCoarsePointer } from '@/lib/film/frames'

export { TOTAL_HERO_FRAMES }

/**
 * FRAME LADDER — THE MASTER, OR AS CLOSE TO IT AS THE DEVICE ALLOWS
 *
 * Four encodings of the film exist: a 160x284 proxy, a 320x568 mid, and the
 * 720x1280 master in two quantisations (see lib/film/frames.ts). This file
 * decides which one the viewer actually looks at.
 *
 * The ladder used to pick a tier by scroll velocity, dropping to the proxy above
 * a flick threshold and only reaching for the master once the scroll had come to
 * a full stop. Both halves misfired against the real geometry — the film spans
 * ~5,700 px of mobile scroll across 240 frames, so one frame is ~24 px and an
 * ordinary 1,400 px/sec scroll is 59 frames/sec, above almost all of the
 * threshold — and the fix was to trade TEMPORAL resolution for SPATIAL
 * resolution rather than the other way round. Eye motion blur hides a dropped
 * frame; it does not hide a 7.3x upscale, because the blur runs along the axis
 * of travel while the softness is in every direction at once.
 *
 *   keeping up  -> every frame, from the master
 *   outrunning  -> every STRIDE-th frame from the master, gaps covered by a
 *                  bounded near-search, stride derived from measured decode cost
 *   cache miss  -> mid, then the proxy, which stays fully resident as the floor
 *
 * That was right, and it was not enough. Measured on a 4G phone profile at
 * 1,400 px/sec, the master still reached the screen for 4.4% of paints, because
 * the ladder was being asked to schedule around a download that had barely
 * started: the curtain lifted on a 4-second timer with 42 of 240 frames cached,
 * so nearly every master request during the scroll was a cold network fetch
 * competing with the proxy sweep for the same pipe.
 *
 * That is now the curtain's problem, and it solves it — lib/film/preload.ts
 * puts the whole master sequence in the HTTP cache before lifting. What is left
 * here is a pipeline bound by DECODE alone, and the numbers below are retuned
 * for that: a fetch that hits the cache costs ~1 ms instead of ~25, so the
 * concurrency that starved the read-ahead when every request was a real
 * download is now the concurrency that keeps it fed.
 *
 * Regenerate the lower tiers with ./scripts/encode-proxy-frames.sh and
 * ./scripts/encode-mid-frames.sh
 */

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

/**
 * WHY THERE IS NO FEEDBACK CONTROLLER HERE.
 *
 * The obvious way to set the stride is to close a loop on the symptom: measure
 * the share of the scroll served by the master tier, and widen the stride when
 * it sags. That was tried, and it is unstable in exactly the case it exists for.
 *
 * At a wide stride the read-ahead stops asking for the frame under the playhead
 * — deliberately, because at speed that request is stale before it lands — and
 * asks only for frames a stride apart, well ahead. If those land late, nothing
 * near the playhead is resident, the hit rate falls further, and the controller
 * responds by widening the stride again. Measured on the phone profile the loop
 * ran to the ceiling within a second and sat there with a 1% hit rate, while the
 * same scroll at a fixed stride of 1 served 97%.
 *
 * The stride has to come from a model of the pipeline, not from its output. What
 * was wrong before was the model's input, not its form — see
 * BitmapCache.loadMsEma.
 */

/** Smoothing for the master-tier hit rate. Telemetry only: it is what the
 *  ?debug=perf overlay reports as the ladder's health, and nothing schedules
 *  from it. */
const HIT_EMA_ALPHA = 0.08

/** Expected fetch-and-decode latency for one master frame, in ms, used to set
 *  how far ahead the read-ahead starts. It only has to be large enough that a
 *  requested frame is still in front of the playhead when it arrives: too small
 *  and every prefetch is stale on arrival, too large and the read-ahead runs
 *  off into film the viewer may never reach.
 *
 *  150 covered a ~25 ms network fetch plus a decode. The curtain now leaves the
 *  whole sequence in the HTTP cache, so the fetch half is ~1 ms and what
 *  remains is decode — but decode is also the half that varies by an order of
 *  magnitude across devices, so this stays generous rather than being cut to
 *  match a fast phone. */
const HIRES_LEAD_MS = 120

/** Smoothing for the frame-velocity estimate. A single slow tick between two
 *  fast ones must not flip the tier and trigger a request the flick will
 *  outrun. */
const VELOCITY_EMA_ALPHA = 0.3

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
const HIRES_PREFETCH_AHEAD = 16

/** Concurrency for master-tier requests.
 *
 *  This was 2, and for the right reason at the time: every request was a real
 *  ~25 ms network fetch competing with a 240-frame proxy sweep over the same
 *  pipe, and three concurrent cold fetches plus their decodes produced 350 ms
 *  stalls.
 *
 *  Neither half of that is true any more. The curtain leaves the whole master
 *  sequence in the HTTP cache before it lifts, so a request is a cache read and
 *  a decode; and the proxy sweep no longer starts until the curtain is gone,
 *  and runs at concurrency 2 when it does. What bounds the tier now is decode
 *  throughput alone, createImageBitmap decodes off the main thread, and holding
 *  the in-flight count at 2 leaves that capacity unused — which shows up as the
 *  read-ahead falling behind a fast scroll and the ladder stepping down to a
 *  tier the viewer can see is softer. */
const HIRES_FETCH_CONCURRENCY = 4

/** Floor for how far from the target a resident sharp frame may be and still be
 *  drawn instead of a softer tier. Two frames is ~48 px of scroll — during
 *  motion that reads as a fractionally late film, which is invisible, where
 *  dropping to the proxy reads as the picture dissolving, which is not.
 *
 *  This is the minimum, for when the film is being read slowly and the exact
 *  frame is worth waiting for. HIRES_LAG_TOLERANCE_MS widens it under motion. */
const HIRES_NEAREST_RADIUS = 2

/**
 * HOW LATE A SHARP FRAME MAY BE.
 *
 * This is the whole spatial-versus-temporal trade, stated as a number, and it
 * is where the ladder was still giving the picture away.
 *
 * The radius used to be max(2, stride/2) — at the strides real scrolling
 * produces, that is 2. So a sharp frame three indices behind the playhead was
 * rejected and the paint fell through to a 160x284 proxy: the film swapped a
 * 50 ms lag nobody can see for a 7.3x upscale everybody can. Measured on the
 * phone profile, that rejection was most of the 43% of paints still coming from
 * the proxy after the curtain had cached the whole film.
 *
 * A frame's staleness is a time, not a count, so the radius is derived from
 * one: at the current frame velocity, how many indices fit in the lag the eye
 * will accept? 120 ms is about two frames of a 60 Hz refresh — well inside what
 * reads as a film that is fractionally behind the thumb, and nowhere near the
 * ~250 ms where a scrub starts to feel disconnected from the hand.
 *
 * It collapses to HIRES_NEAREST_RADIUS as the playhead slows, so coming to a
 * stop still lands on the exact frame rather than settling for a near one.
 */
const HIRES_LAG_TOLERANCE_MS = 120

/** Ceiling on that widening. Past ~10 frames the near-search stops being "the
 *  film is slightly behind" and starts being "the film is showing a different
 *  moment", and at that distance the composition can genuinely have changed. */
const HIRES_MAX_RADIUS = 10

/** How close a resident proxy frame has to be before the render loop stops
 *  asking for the exact one. The floor's job is to be there at all, not to be
 *  on the exact index — at a 7.3x upscale a neighbouring frame is
 *  indistinguishable, and the request it saves is a decode the master tier
 *  gets instead. */
const PROXY_NEAREST_RADIUS = 3

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

    const coarsePointer = isCoarsePointer()

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
    // Share of the recent scroll served by the master tier. Reported, not
    // scheduled from — see the note above HIT_EMA_ALPHA.
    let hiresHitEma = 1

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
      const dpr = Math.min(window.devicePixelRatio || 1, coarsePointer ? 3 : 2)
      const newWidth = Math.round(window.innerWidth * dpr)
      const newHeight = Math.round(window.innerHeight * dpr)

      // Height-only resizes on mobile are the URL bar hiding/showing. Realloc of
      // a fullscreen 2D backing store mid-scroll is a multi-frame stall, and the
      // cover math below absorbs the ~7% height delta without letterboxing.
      if (coarsePointer && canvas.width === newWidth && canvas.width > 0) return
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
      fit = !coarsePointer && fieldPx >= APERTURE_MIN_FIELD_PX ? 'aperture' : 'cover'
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
        // asking directly only matters when the user has outrun the sweep AND
        // the master tier has nothing to show here.
        //
        // Unconditionally, this was the largest consumer of the decode pipeline
        // during a scroll — one request per frame change, ~240 a pass. Measured
        // on the phone profile at 1,400 px/sec, a pass spent 70 decodes on the
        // master tier and 171 on the floor, and the floor is by definition only
        // drawn when the master tier failed. It was manufacturing the misses it
        // existed to cover.
        if (
          !hiresCache.hasWithin(targetFrameIdx, hiresRadius) &&
          !proxyCache.hasWithin(targetFrameIdx, PROXY_NEAREST_RADIUS)
        ) {
          void proxyCache.load(targetFrameIdx, onFrameDecoded)
        }

        // The mid tier only when the master is actually missing here.
        //
        // This used to fire on every frame change, unconditionally, on the
        // reasoning that a 320 px decode is cheap and it is what stands in when
        // the master has not landed. Both clauses are true in isolation and
        // wrong together: it put a second decode next to every master decode,
        // for ~240 frames a pass, competing for exactly the throughput that
        // decides whether the master lands at all. Measured over a full scroll
        // the tier reached the screen for 0.0% of paints — it was paying for
        // itself out of the budget of the tier it exists to back up.
        //
        // Asking only when the near-search has nothing sharp keeps it as the
        // graceful step down it was meant to be, and hands the throughput back.
        if (
          !hiresCache.has(targetFrameIdx) &&
          !hiresCache.hasWithin(targetFrameIdx, hiresRadius) &&
          !midCache.has(targetFrameIdx)
        ) {
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
          hiresCache.loadMsEma > 0
            ? HIRES_FETCH_CONCURRENCY / hiresCache.loadMsEma
            : HIRES_SUSTAINED_RATE
        hiresStride = Math.max(
          1,
          Math.min(HIRES_MAX_STRIDE, Math.ceil(idxVelocityEma / sustainedRate))
        )
        // The near-search has to span half a stride in each direction or frames
        // landing mid-gap find nothing sharp and fall through to the proxy,
        // which would undo the striding entirely — and it has to span the lag
        // the eye will accept, or the tier is discarded for being a few tens of
        // milliseconds late. See HIRES_LAG_TOLERANCE_MS.
        hiresRadius = Math.min(
          HIRES_MAX_RADIUS,
          Math.max(
            HIRES_NEAREST_RADIUS,
            Math.ceil(hiresStride / 2),
            Math.ceil(idxVelocityEma * HIRES_LAG_TOLERANCE_MS)
          )
        )
        scrubStats.hiresStride = hiresStride
        scrubStats.hiresRadius = hiresRadius
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

      // The frame directly under the playhead, but only once it has stopped
      // moving — or while the pipeline is keeping up with every frame anyway.
      //
      // This used to run on every render tick, unconditionally, and it quietly
      // undid the striding above it. The block that sets the stride is explicit
      // that at speed this is the single worst request available: a decode takes
      // longer than the frame stays current, so it is stale before it lands, and
      // because it is re-issued on every tick it occupies the concurrency
      // permanently — starving the read-ahead that would have arrived in time.
      // The stride was computed, the guard was written, and then this line asked
      // for the frame anyway.
      const isSettled = now - idxChangedAt >= SETTLE_MS
      if ((isSettled || hiresStride === 1) && !hiresCache.has(targetFrameIdx)) {
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

        // Which tier is on screen, counted per tick rather than per paint —
        // a sharp frame held across a near-search radius paints once and stays
        // up for a dozen ticks, so counting paints reports the tier that
        // changes most often instead of the tier the viewer is looking at.
        // This is both the quality number the overlay shows and the signal the
        // stride controller closes on, and reading it per paint had the
        // controller driving the stride to its ceiling to correct an error that
        // was in the measurement.
        scrubStats.onScreenByTier[isHires ? 'hires' : isMid ? 'mid' : 'proxy']++
        hiresHitEma = hiresHitEma * (1 - HIT_EMA_ALPHA) + (isHires ? 1 : 0) * HIT_EMA_ALPHA
        scrubStats.hiresHitEma = hiresHitEma

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
    // The background sweeps live in lib/film/preload.ts and run while the
    // curtain is up; all this loop needs from them is to be woken when one of
    // their decodes lands, because it parks itself as soon as the frame it
    // wants is on screen.
    const unsubDecoded = onFilmFrameDecoded(onFrameDecoded)
    setFilmActive(true)
    // A remount arrives with the caches disposed and the sweep stopped, so it
    // has to be restarted; on a first mount the curtain has already started it
    // and this is a no-op.
    fillProxyTier()
    startRender()

    return () => {
      // isDisposed gates startRender: a fetch that resolves after unmount would
      // otherwise schedule a rAF holding this closure's detached canvas alive.
      isDisposed = true
      isRenderingRef.current = false
      unsubNight()
      unsubDecoded()
      setFilmActive(false)
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
