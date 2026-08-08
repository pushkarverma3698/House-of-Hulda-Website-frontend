'use client'

import { useEffect, useRef, memo } from 'react'
import { useNight } from '@/lib/store/night'

const TOTAL_HERO_FRAMES = 240
const CACHE_SIZE = 40
const PRELOAD_WINDOW_AHEAD = 20
const PRELOAD_WINDOW_BEHIND = 5

function padFrame(num: number): string {
  return String(num).padStart(3, '0')
}

class FrameCache {
  private cache = new Map<number, HTMLImageElement>()
  private inFlight = new Set<number>()
  
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
    
    // Evict oldest if we exceed capacity
    if (this.cache.size >= CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey !== undefined) {
        const img = this.cache.get(oldestKey)
        if (img) {
          img.src = '' // Free memory aggressively
        }
        this.cache.delete(oldestKey)
      }
    }

    this.inFlight.add(index)
    
    try {
      const img = new Image()
      
      // Wait for network load first, then attempt decode
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error(`Failed to load frame ${index}`))
        img.src = `/frames/hero/frame_${padFrame(index)}.jpg`
      })

      // Try background decode, but don't block if it fails
      try {
        await img.decode()
      } catch (e) {
        // ignore decode error, the image is loaded anyway
      }
      
      this.cache.set(index, img)
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
    
    // Search radiating outwards
    for (let offset = 1; offset < CACHE_SIZE / 2; offset++) {
      const imgMinus = this.get(targetIndex - offset)
      if (imgMinus) return imgMinus
      
      const imgPlus = this.get(targetIndex + offset)
      if (imgPlus) return imgPlus
    }
    
    return null
  }
}

export const ScrollCanvas = memo(function ScrollCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cacheRef = useRef(new FrameCache())
  const lastTargetIdxRef = useRef<number>(-1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return
    const cache = cacheRef.current

    let animFrameId: number
    
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
    }

    resize()
    window.addEventListener('resize', resize)

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

      // Preload window management
      if (targetFrameIdx !== lastTargetIdxRef.current) {
        lastTargetIdxRef.current = targetFrameIdx
        
        // Priority 1: Current frame
        cache.load(targetFrameIdx)
        
        // Priority 2: Look ahead (we assume forward scroll is more likely)
        for (let i = 1; i <= PRELOAD_WINDOW_AHEAD; i++) {
          const idx = targetFrameIdx + i
          if (idx <= TOTAL_HERO_FRAMES) cache.load(idx)
        }
        
        // Priority 3: Look behind
        for (let i = 1; i <= PRELOAD_WINDOW_BEHIND; i++) {
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
          ctx.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturate})`
        } else {
          ctx.filter = 'none'
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

        ctx.drawImage(drawImg, offsetX, offsetY, drawWidth, drawHeight)
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
