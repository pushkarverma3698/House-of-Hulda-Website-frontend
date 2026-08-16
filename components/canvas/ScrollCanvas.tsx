'use client'

import { useEffect, useRef, memo } from 'react'
import { useNight } from '@/lib/store/night'

const TOTAL_HERO_FRAMES = 240
// Hard limits for memory management
const MAX_MOBILE_CACHE_SIZE = 15
const MAX_DESKTOP_CACHE_SIZE = 60
const PRELOAD_WINDOW_AHEAD = 20
const PRELOAD_WINDOW_BEHIND = 5

function padFrame(num: number): string {
  return String(num).padStart(3, '0')
}

class FrameCache {
  private cache = new Map<number, HTMLImageElement>()
  private inFlight = new Map<number, HTMLImageElement>()
  
  public cancelOutsideWindow(targetIndex: number, windowAhead: number, windowBehind: number) {
    for (const [idx, img] of this.inFlight.entries()) {
      if (idx < targetIndex - windowBehind || idx > targetIndex + windowAhead) {
        img.src = '' // Cancel network load immediately
        this.inFlight.delete(idx)
      }
    }
  }

  public get(index: number): HTMLImageElement | undefined {
    // LRU trick: delete and re-insert to move to back of Map (most recently used)
    if (this.cache.has(index)) {
      const img = this.cache.get(index)!
      this.cache.delete(index)
      this.cache.set(index, img)
      return img
    }
    return undefined
  }

  public async load(index: number, onDecode?: () => void) {
    if (this.cache.has(index) || this.inFlight.has(index)) return
    
    const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || ('ontouchstart' in window))
    const CACHE_SIZE = isMobile ? MAX_MOBILE_CACHE_SIZE : MAX_DESKTOP_CACHE_SIZE

    const img = new Image()
    this.inFlight.set(index, img)
    
    try {
      // Wait for network load first
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error(`Failed to load frame ${index}`))
        img.src = `/frames/hero/frame_${padFrame(index)}.jpg`
      })

      // If we cancelled this frame while it was loading over network, abort decode
      if (!this.inFlight.has(index)) return

      // Try background decode, but don't block if it fails
      try {
        await img.decode()
      } catch (e) {}
      
      // Check again just in case it was cancelled during decode
      if (!this.inFlight.has(index)) return

      this.cache.set(index, img)

      // Evict oldest only AFTER we have successfully loaded a new frame.
      // This prevents the cache from becoming empty during fast scrolls.
      while (this.cache.size > CACHE_SIZE) {
        const oldestKey = this.cache.keys().next().value
        if (oldestKey !== undefined) {
          const oldImg = this.cache.get(oldestKey)
          if (oldImg) oldImg.src = ''
          this.cache.delete(oldestKey)
        }
      }

      onDecode?.()
    } catch (e) {
      // Load failed
    } finally {
      this.inFlight.delete(index)
    }
  }

  public getNearestLoaded(targetIndex: number): HTMLImageElement | null {
    const exact = this.get(targetIndex)
    if (exact) return exact
    
    // Search radiating outwards unbounded until a frame is found
    for (let offset = 1; offset < TOTAL_HERO_FRAMES; offset++) {
      const imgMinus = this.get(targetIndex - offset)
      if (imgMinus) return imgMinus
      
      const imgPlus = this.get(targetIndex + offset)
      if (imgPlus) return imgPlus
    }
    
    return null
  }
}
export const globalFrameCache = new FrameCache()

export const ScrollCanvas = memo(function ScrollCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lastTargetIdxRef = useRef<number>(-1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    // Optimizations: alpha:false removes compositing overhead, desynchronized:true reduces latency
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true })
    if (!ctx) return
    ctx.imageSmoothingQuality = 'low'
    const cache = globalFrameCache

    let animFrameId: number
    
    // Eagerly load initial sequence on mount
    cache.load(1)
    cache.load(2)
    cache.load(3)

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const newWidth = window.innerWidth * dpr
      const newHeight = window.innerHeight * dpr
      
      const isMobile = window.innerWidth < 768 || ('ontouchstart' in window)
      // Critical Mobile Perf: Ignore height-only resize events (caused by URL bar hiding/showing).
      // Reallocating a 2D canvas backing store during scroll causes massive stutter.
      if (isMobile && canvas.width === newWidth && canvas.width > 0) {
        return 
      }

      canvas.width = newWidth
      canvas.height = newHeight
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })

    const render = () => {
      const t = useNight.getState().t
      const width = canvas.width
      const height = canvas.height

      ctx.clearRect(0, 0, width, height)

      let targetFrameIdx = 1
      let alpha = 1.0

      if (t < 0.70) {
        const localT = Math.max(0, Math.min(1, t / 0.70))
        targetFrameIdx = 1 + Math.floor(localT * (TOTAL_HERO_FRAMES - 1))
      } else if (t < 0.85) {
        targetFrameIdx = TOTAL_HERO_FRAMES
        alpha = 1.0
      } else {
        const fadeProgress = (t - 0.85) / 0.15
        alpha = Math.max(0, 1.0 - fadeProgress)
        targetFrameIdx = TOTAL_HERO_FRAMES
      }

      // Preload window management (mobile-optimized)
      if (targetFrameIdx !== lastTargetIdxRef.current) {
        lastTargetIdxRef.current = targetFrameIdx
        
        // Priority 1: Current frame
        cache.load(targetFrameIdx)
        
        const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || ('ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0)))
        const aheadWindow = isMobile ? 6 : PRELOAD_WINDOW_AHEAD
        const behindWindow = isMobile ? 3 : PRELOAD_WINDOW_BEHIND

        // Immediately cancel any in-flight requests that are outside our new active window
        cache.cancelOutsideWindow(targetFrameIdx, aheadWindow, behindWindow)

        // Priority 2: Look ahead
        for (let i = 1; i <= aheadWindow; i++) {
          const idx = targetFrameIdx + i
          if (idx <= TOTAL_HERO_FRAMES) cache.load(idx)
        }
        
        // Priority 3: Look behind
        for (let i = 1; i <= behindWindow; i++) {
          const idx = targetFrameIdx - i
          if (idx >= 1) cache.load(idx)
        }
      }

      const drawImg = cache.getNearestLoaded(targetFrameIdx)

      if (drawImg && drawImg.complete && drawImg.naturalWidth > 0) {
        if (t > 0.40 && t <= 0.85) {
          const twilightProgress = Math.min(1, (t - 0.40) / 0.40)
          const brightness = 1.0 - twilightProgress * 0.35
          const contrast = 1.0 + twilightProgress * 0.15
          const saturate = 1.0 - twilightProgress * 0.20
          // Use hardware-accelerated CSS filter on the DOM element instead of slow ctx.filter
          canvas.style.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturate})`
        } else {
          canvas.style.filter = 'none'
        }

        ctx.globalAlpha = alpha

        const imgRatio = drawImg.naturalWidth / drawImg.naturalHeight
        const canvasRatio = width / height
        let drawWidth = width
        let drawHeight = height
        let offsetX = 0
        let offsetY = 0

        // Phase 2 Safe Area Contract: 
        // Force cover-fit keeping center subject intact
        if (canvasRatio > imgRatio) {
          drawHeight = width / imgRatio
          offsetY = (height - drawHeight) / 2
        } else {
          drawWidth = height * imgRatio
          offsetX = (width - drawWidth) / 2
        }

        // Critical Perf: Force integer coordinates to avoid expensive GPU sub-pixel interpolation on mobile
        ctx.drawImage(
          drawImg, 
          Math.floor(offsetX), 
          Math.floor(offsetY), 
          Math.floor(drawWidth), 
          Math.floor(drawHeight)
        )
      }

      animFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
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
