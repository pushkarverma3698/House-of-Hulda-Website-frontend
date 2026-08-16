'use client'

import { useEffect, useRef, memo } from 'react'
import { useNight } from '@/lib/store/night'

const TOTAL_HERO_FRAMES = 240
const frameUrl = (index: number) =>
  `/frames/hero/frame_${String(index).padStart(3, '0')}.jpg`

/**
 * Decoded ImageBitmaps are GPU-backed and are NOT bounded by a frame count.
 * A 720x1280 RGBA bitmap is 3.7MB, so a 45-frame mobile cap is a ~166MB
 * allocation — iOS Safari discards the tab well before that. Budget in BYTES
 * and measure each bitmap, so the budget stays correct if the frame ladder
 * is ever re-encoded at a different resolution.
 */
const MOBILE_BITMAP_BUDGET = 48 * 1024 * 1024
const DESKTOP_BITMAP_BUDGET = 192 * 1024 * 1024

const PRELOAD_AHEAD_MOBILE = 8
const PRELOAD_BEHIND_MOBILE = 2
const PRELOAD_AHEAD_DESKTOP = 24
const PRELOAD_BEHIND_DESKTOP = 6

/** Bounded fallback search — an unbounded radiating scan costs up to 480 Map
 *  probes per rAF while the cache is cold, which is exactly when we are slow. */
const NEAREST_SEARCH_RADIUS = 40

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

/**
 * Byte-budgeted LRU of decoded frames.
 *
 * Fetch + Blob + createImageBitmap rather than HTMLImageElement because it is
 * the only path with real cancellation (AbortController actually tears down the
 * request; `img.src = ''` does not) and because it never leaves a second
 * decoded copy alive inside an <img> the browser is free to retain.
 */
class FrameCache {
  private cache = new Map<number, CachedFrame>()
  private inFlight = new Map<number, AbortController>()
  private bytes = 0
  private budget = DESKTOP_BITMAP_BUDGET

  public setBudget(bytes: number): void {
    this.budget = bytes
    this.evictToBudget(-1)
  }

  public cancelOutsideWindow(targetIndex: number, ahead: number, behind: number): void {
    for (const [index, controller] of this.inFlight) {
      if (index < targetIndex - behind || index > targetIndex + ahead) {
        controller.abort()
        this.inFlight.delete(index)
      }
    }
  }

  /** LRU touch: delete + re-insert moves the entry to the back of the Map. */
  public get(index: number): CachedFrame | undefined {
    const frame = this.cache.get(index)
    if (!frame) return undefined
    this.cache.delete(index)
    this.cache.set(index, frame)
    return frame
  }

  public async load(index: number, onDecode?: () => void): Promise<void> {
    if (this.cache.has(index) || this.inFlight.has(index)) return

    const controller = new AbortController()
    this.inFlight.set(index, controller)

    try {
      const response = await fetch(frameUrl(index), { signal: controller.signal })
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

      // Evict AFTER insert so the cache is never momentarily empty mid-scroll.
      this.evictToBudget(index)
      onDecode?.()
    } catch {
      // Aborted or network failure — the render loop falls back to the nearest
      // cached frame, so a miss is never fatal.
    } finally {
      this.inFlight.delete(index)
    }
  }

  private evictToBudget(protectedIndex: number): void {
    for (const index of this.cache.keys()) {
      if (this.bytes <= this.budget) return
      if (index === protectedIndex) continue

      const frame = this.cache.get(index)
      if (frame) {
        frame.bitmap.close() // deterministic VRAM release, no GC wait
        this.bytes -= frame.bytes
      }
      this.cache.delete(index)
    }
  }

  public getNearestLoaded(targetIndex: number): { bitmap: ImageBitmap; index: number } | null {
    const exact = this.get(targetIndex)
    if (exact) return { bitmap: exact.bitmap, index: targetIndex }

    for (let offset = 1; offset <= NEAREST_SEARCH_RADIUS; offset++) {
      const behind = this.get(targetIndex - offset)
      if (behind) return { bitmap: behind.bitmap, index: targetIndex - offset }

      const ahead = this.get(targetIndex + offset)
      if (ahead) return { bitmap: ahead.bitmap, index: targetIndex + offset }
    }

    return null
  }
}

export const globalFrameCache = new FrameCache()

export const ScrollCanvas = memo(function ScrollCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lastTargetIdxRef = useRef<number>(-1)
  const lastDrawnKeyRef = useRef<string>('')
  const lastDrawnFilterRef = useRef<string>('')
  const isRenderingRef = useRef<boolean>(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // alpha:false removes per-frame compositing of a transparent fullscreen
    // layer; desynchronized:true lets the compositor skip a vsync round-trip.
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true })
    if (!ctx) return
    ctx.imageSmoothingQuality = 'low'

    const cache = globalFrameCache
    const isCoarsePointer = detectCoarsePointer()
    const aheadWindow = isCoarsePointer ? PRELOAD_AHEAD_MOBILE : PRELOAD_AHEAD_DESKTOP
    const behindWindow = isCoarsePointer ? PRELOAD_BEHIND_MOBILE : PRELOAD_BEHIND_DESKTOP

    cache.setBudget(isCoarsePointer ? MOBILE_BITMAP_BUDGET : DESKTOP_BITMAP_BUDGET)

    let animFrameId = 0

    const startRender = () => {
      if (!isRenderingRef.current) {
        isRenderingRef.current = true
        animFrameId = requestAnimationFrame(render)
      }
    }

    const onFrameDecoded = () => startRender()

    const unsubNight = useNight.subscribe((state, prevState) => {
      if (state.t !== prevState.t) startRender()
    })

    cache.load(1, onFrameDecoded)
    cache.load(2, onFrameDecoded)
    cache.load(3, onFrameDecoded)

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, isCoarsePointer ? 1.5 : 2)
      const newWidth = Math.round(window.innerWidth * dpr)
      const newHeight = Math.round(window.innerHeight * dpr)

      // Height-only resizes on mobile are the URL bar hiding/showing. Realloc of
      // a fullscreen 2D backing store mid-scroll is a multi-frame stall.
      if (isCoarsePointer && canvas.width === newWidth && canvas.width > 0) return
      if (canvas.width === newWidth && canvas.height === newHeight) return

      canvas.width = newWidth
      canvas.height = newHeight

      // Resizing wipes the backing store — invalidate the draw key or the canvas
      // stays black until the next frame index change.
      lastDrawnKeyRef.current = ''
      startRender()
    }

    const render = () => {
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
        const previousIdx = lastTargetIdxRef.current
        const delta = previousIdx === -1 ? 1 : Math.abs(targetFrameIdx - previousIdx)
        lastTargetIdxRef.current = targetFrameIdx

        cache.load(targetFrameIdx, onFrameDecoded)
        cache.cancelOutsideWindow(targetFrameIdx, aheadWindow * Math.max(1, delta), behindWindow)

        // Velocity-aware stride. At speed the frames between here and the next
        // rAF will never be shown, so requesting them only starves the frames
        // that will be. Stride the lookahead by the observed frame velocity
        // instead of dropping it entirely.
        const stride = Math.max(1, Math.min(delta, 8))
        const direction = previousIdx === -1 || targetFrameIdx >= previousIdx ? 1 : -1

        for (let i = 1; i <= aheadWindow; i++) {
          const idx = targetFrameIdx + direction * i * stride
          if (idx >= 1 && idx <= TOTAL_HERO_FRAMES) cache.load(idx, onFrameDecoded)
        }
        for (let i = 1; i <= behindWindow; i++) {
          const idx = targetFrameIdx - direction * i
          if (idx >= 1 && idx <= TOTAL_HERO_FRAMES) cache.load(idx, onFrameDecoded)
        }
      }

      const cachedFrame = cache.getNearestLoaded(targetFrameIdx)

      if (cachedFrame) {
        const { bitmap } = cachedFrame

        let targetFilter = 'none'
        if (t > 0.4 && t <= 0.85) {
          const raw = Math.min(1, (t - 0.4) / 0.4)
          const step = Math.round(raw * GRADE_STEPS) / GRADE_STEPS
          const brightness = 1.0 - step * 0.35
          const contrast = 1.0 + step * 0.15
          const saturate = 1.0 - step * 0.2
          targetFilter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturate})`
        }

        if (lastDrawnFilterRef.current !== targetFilter) {
          canvas.style.filter = targetFilter
          lastDrawnFilterRef.current = targetFilter
        }

        const steppedAlpha = Math.round(alpha * ALPHA_STEPS) / ALPHA_STEPS
        const drawKey = `${cachedFrame.index}_${steppedAlpha}_${width}`

        if (lastDrawnKeyRef.current !== drawKey) {
          ctx.clearRect(0, 0, width, height)
          ctx.globalAlpha = steppedAlpha

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

          lastDrawnKeyRef.current = drawKey
        }

        // Self-terminate once the exact target frame is on screen. Nothing can
        // change the output until either t moves or a decode lands, and both
        // restart the loop.
        if (cachedFrame.index === targetFrameIdx) {
          isRenderingRef.current = false
          return
        }
      }

      animFrameId = requestAnimationFrame(render)
    }

    // Sized after `render` exists — resize() restarts the loop on its own.
    resize()
    window.addEventListener('resize', resize, { passive: true })
    startRender()

    return () => {
      unsubNight()
      cancelAnimationFrame(animFrameId)
      window.removeEventListener('resize', resize)
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
