'use client'

import { useEffect, useRef, memo } from 'react'
import { useNight } from '@/lib/store/night'

const TOTAL_HERO_FRAMES = 240

function padFrame(num: number): string {
  return String(num).padStart(3, '0')
}

export const ScrollCanvas = memo(function ScrollCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const framesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_HERO_FRAMES).fill(null))
  const lastDrawnIdxRef = useRef<number>(0)
  const isMountedRef = useRef<boolean>(true)

  useEffect(() => {
    isMountedRef.current = true
    const frames = framesRef.current

    // Step 1: Preload critical initial keyframes immediately (first 25 frames)
    for (let i = 1; i <= Math.min(25, TOTAL_HERO_FRAMES); i++) {
      const img = new Image()
      img.src = `/frames/hero/frame_${padFrame(i)}.jpg`
      img.onload = () => {
        if (isMountedRef.current) frames[i - 1] = img
      }
      frames[i - 1] = img
    }

    // Step 2: Progressive background preloading of remaining frames (26 to 240) in non-blocking batches
    const loadBatch = (start: number, batchSize: number) => {
      if (!isMountedRef.current || start > TOTAL_HERO_FRAMES) return
      const end = Math.min(TOTAL_HERO_FRAMES, start + batchSize - 1)
      for (let i = start; i <= end; i++) {
        if (!frames[i - 1]) {
          const img = new Image()
          img.src = `/frames/hero/frame_${padFrame(i)}.jpg`
          img.onload = () => {
            if (isMountedRef.current) frames[i - 1] = img
          }
          frames[i - 1] = img
        }
      }
      if (end < TOTAL_HERO_FRAMES) {
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          ;(window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => loadBatch(end + 1, batchSize))
        } else {
          setTimeout(() => loadBatch(end + 1, batchSize), 40)
        }
      }
    }

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      ;(window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => loadBatch(26, 30))
    } else {
      setTimeout(() => loadBatch(26, 30), 100)
    }

    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

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

      // Precise 240-frame sequence mapping:
      // t in [0.0, 0.70] spans frames 1 to 240 (drone dive -> orchard -> dormer window -> master sanctuary)
      // t in [0.70, 0.85] holds master sanctuary with warm dusk grading
      // t in [0.85, 1.00] fades alpha to reveal Three.js Celestial Night & StarField
      let targetFrameIdx = 0
      let alpha = 1.0

      if (t < 0.70) {
        const localT = Math.max(0, Math.min(1, t / 0.70))
        targetFrameIdx = Math.floor(localT * (TOTAL_HERO_FRAMES - 1))
      } else if (t < 0.85) {
        targetFrameIdx = TOTAL_HERO_FRAMES - 1
        alpha = 1.0
      } else {
        const fadeProgress = (t - 0.85) / 0.15
        alpha = Math.max(0, 1.0 - fadeProgress)
        targetFrameIdx = TOTAL_HERO_FRAMES - 1
      }

      // Find the closest ready image to avoid any frame flicker or blank screens
      const frames = framesRef.current
      let drawImg: HTMLImageElement | null = null
      const directImg = frames[targetFrameIdx]
      if (directImg && directImg.complete && directImg.naturalWidth > 0) {
        drawImg = directImg
        lastDrawnIdxRef.current = targetFrameIdx
      } else {
        // Fallback: search backwards and forwards for nearest loaded frame
        for (let offset = 1; offset < 25; offset++) {
          const prev = frames[targetFrameIdx - offset]
          if (prev && prev.complete && prev.naturalWidth > 0) {
            drawImg = prev
            break
          }
          const next = frames[targetFrameIdx + offset]
          if (next && next.complete && next.naturalWidth > 0) {
            drawImg = next
            break
          }
        }
        if (!drawImg && frames[lastDrawnIdxRef.current]?.complete) {
          drawImg = frames[lastDrawnIdxRef.current]
        }
      }

      if (drawImg && drawImg.complete && drawImg.naturalWidth > 0) {
        // Atmospheric twilight grading as dusk falls (t > 0.40)
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

        // Crisp cover-fit calculation with aspect ratio preservation
        const imgRatio = drawImg.naturalWidth / drawImg.naturalHeight
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
