'use client'

import { useEffect, useState } from 'react'

export function Preloader({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // We want to preload the first 60 frames (critical initial sequence)
    // plus every 10th frame (skeleton sequence for fast scrolling)
    const framesToPreload: number[] = []
    
    // Critical initial sequence
    for (let i = 1; i <= 60; i++) {
      framesToPreload.push(i)
    }
    // Skeleton frames for the rest
    for (let i = 70; i <= 240; i += 10) {
      framesToPreload.push(i)
    }

    const totalToLoad = framesToPreload.length
    let loadedCount = 0
    let hasCompleted = false

    const pendingImages = new Set<HTMLImageElement>()

    const completePreloader = () => {
      if (hasCompleted) return
      hasCompleted = true
      
      // Cancel all pending image loads immediately to free the network queue for ScrollCanvas
      pendingImages.forEach(img => {
        img.src = ''
      })
      pendingImages.clear()
      
      setProgress(100)
      setTimeout(() => {
        setIsLoaded(true)
        onComplete?.()
      }, 400)
    }

    // Safety timeout: If connection is too slow, force entry after 6 seconds
    const safetyTimeout = setTimeout(() => {
      completePreloader()
    }, 6000)

    // Load each frame
    framesToPreload.forEach((frameIdx) => {
      const img = new Image()
      pendingImages.add(img)
      
      const onImageLoad = () => {
        pendingImages.delete(img)
        if (hasCompleted) return
        loadedCount++
        // Calculate progress (cap at 99% until fully complete)
        const pct = Math.floor((loadedCount / totalToLoad) * 99)
        setProgress(pct)

        if (loadedCount === totalToLoad) {
          clearTimeout(safetyTimeout)
          completePreloader()
        }
      }

      img.onload = onImageLoad
      img.onerror = onImageLoad // If it fails, treat it as "done" so we don't hang
      
      const paddedIdx = String(frameIdx).padStart(3, '0')
      img.src = `/frames/hero/frame_${paddedIdx}.jpg`
    })

    return () => {
      clearTimeout(safetyTimeout)
      pendingImages.forEach(img => {
        img.src = ''
      })
      pendingImages.clear()
    }
  }, [onComplete])

  if (isLoaded) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-center bg-black px-8 md:px-24 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        progress >= 100 ? 'opacity-0 scale-105 pointer-events-none blur-md' : 'opacity-100 scale-100 blur-0'
      }`}
    >
      <div className="max-w-md space-y-3">
        <div className="overflow-hidden">
          <p className="font-mono text-xs tracking-widest text-amber-500 uppercase animate-[steamRise_2s_ease-out_forwards]">
            RUMSU OBSERVATORY · SYSTEM BOOT
          </p>
        </div>
        
        <div className="overflow-hidden">
          <p className="font-mono text-[10px] text-white/40 tracking-widest uppercase delay-100">
            32.1198° N, 77.1731° E · ELEV 2,180 M
          </p>
        </div>

        <div className="overflow-hidden">
          <p className="font-mono text-[10px] text-white/30 tracking-widest uppercase delay-200">
            12 OCT · SUNSET 18:04 · ASTRO DARK 19:41
          </p>
        </div>

        {/* 1px Horizon Line Loader */}
        <div className="relative w-full max-w-[200px] h-[1px] bg-white/10 mt-8 overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-white/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="font-mono text-xs text-white/30 tracking-widest mt-2">
          {progress.toString().padStart(3, '0')}%
        </p>
      </div>
    </div>
  )
}
