'use client'
import { hiresCache } from "@/components/canvas/ScrollCanvas"


import { useEffect, useState, useRef } from 'react'

/** Frames that must be in the HTTP cache before the curtain lifts. Enough to
 *  cover the opening beat; ScrollCanvas sweeps the remaining proxy frames
 *  resident behind the user. */
const CRITICAL_FRAME_COUNT = 40
const TOTAL_HERO_FRAMES = 240
/** Browsers multiplex freely over HTTP/2, so an unbounded fan-out does not
 *  queue — it splits the same pipe and every frame arrives late. */
const CRITICAL_CONCURRENCY = 6
const BACKGROUND_CONCURRENCY = 4
const SAFETY_TIMEOUT_MS = 4000



/** Warms the HTTP cache and decodes into GPU memory immediately. */
async function warmFrame(index: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) return
  try {
    await hiresCache.load(index)
  } catch {
    // Cache miss is non-fatal.
  }
}

/** Runs `task` over `items` with at most `limit` in flight. */
async function runPool(
  items: readonly number[],
  limit: number,
  signal: AbortSignal,
  onEach?: () => void
): Promise<void> {
  let cursor = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length && !signal.aborted) {
      const index = items[cursor++]
      await warmFrame(index, signal)
      onEach?.()
    }
  })
  await Promise.all(workers)
}

export function Preloader({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Preloader logic
  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    let hasCompleted = false

    const critical = Array.from({ length: CRITICAL_FRAME_COUNT }, (_, i) => i + 1)
    
    // Protect these frames from being aborted by ScrollCanvas during the opening sequence
    critical.forEach(i => hiresCache.protect(i))

    const completePreloader = () => {
      if (hasCompleted) return
      hasCompleted = true
      setProgress(100)
      setIsReady(true)
      critical.forEach(i => hiresCache.unprotect(i))
    }

    const safetyTimeout = setTimeout(completePreloader, SAFETY_TIMEOUT_MS)

    let loadedCount = 0
    const onCriticalFrame = () => {
      loadedCount++
      if (!hasCompleted) {
        setProgress(Math.floor((loadedCount / critical.length) * 99))
      }
    }

    runPool(critical, CRITICAL_CONCURRENCY, signal, onCriticalFrame)
      .then(() => {
        if (signal.aborted) return
        clearTimeout(safetyTimeout)
        completePreloader()
      })
      .catch(() => {})

    return () => {
      critical.forEach(i => hiresCache.unprotect(i))
      clearTimeout(safetyTimeout)
      controller.abort()
    }
  }, [])

  const handleEnter = () => {
    setIsLoaded(true)
    setTimeout(() => {
      onComplete?.()
      window.dispatchEvent(new Event('start-atmosphere'))
    }, 400)
  }

  // High-performance Parallax logic (Mouse & Gyro)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    let animationFrameId: number

    const handleMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2
      targetY = (e.clientY / window.innerHeight - 0.5) * 2
    }

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return
      const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max)
      targetX = clamp(e.gamma, -30, 30) / 30
      targetY = clamp(e.beta - 45, -30, 30) / 30
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('deviceorientation', handleDeviceOrientation)

    const loop = () => {
      currentX += (targetX - currentX) * 0.1
      currentY += (targetY - currentY) * 0.1

      if (el) {
        el.style.setProperty('--px', currentX.toFixed(3))
        el.style.setProperty('--py', currentY.toFixed(3))
      }
      animationFrameId = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('deviceorientation', handleDeviceOrientation)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  if (isLoaded) return null

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col justify-center bg-black px-8 md:px-24 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isLoaded ? 'opacity-0 scale-105 pointer-events-none blur-md' : 'opacity-100 scale-100 blur-0'
      }`}
    >
      <div className="max-w-md space-y-3 relative">
        <div 
          className="overflow-hidden will-change-transform"
          style={{ transform: 'translate3d(calc(var(--px, 0) * -15px), calc(var(--py, 0) * -15px), 0)' }}
        >
          <p className="font-mono text-xs tracking-widest text-amber-500 uppercase animate-[steamRise_2s_ease-out_forwards]">
            RUMSU OBSERVATORY · SYSTEM BOOT
          </p>
        </div>
        
        <div 
          className="overflow-hidden will-change-transform"
          style={{ transform: 'translate3d(calc(var(--px, 0) * -8px), calc(var(--py, 0) * -8px), 0)' }}
        >
          <p className="font-mono text-[10px] text-white/40 tracking-widest uppercase delay-100">
            32.1198° N, 77.1731° E · ELEV 2,180 M
          </p>
        </div>

        <div 
          className="overflow-hidden will-change-transform"
          style={{ transform: 'translate3d(calc(var(--px, 0) * -3px), calc(var(--py, 0) * -3px), 0)' }}
        >
          <p className="font-mono text-[10px] text-white/30 tracking-widest uppercase delay-200">
            12 OCT · SUNSET 18:04 · ASTRO DARK 19:41
          </p>
        </div>

        {/* 1px Horizon Line Loader - Moves in the opposite direction for strong parallax */}
        <div 
          className="relative w-full max-w-[200px] h-[1px] bg-white/10 mt-8 overflow-hidden will-change-transform"
          style={{ transform: 'translate3d(calc(var(--px, 0) * 15px), calc(var(--py, 0) * 15px), 0)' }}
        >
          <div
            className="absolute top-0 left-0 h-full bg-white/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div 
          className="will-change-transform mt-2 h-10"
          style={{ transform: 'translate3d(calc(var(--px, 0) * 10px), calc(var(--py, 0) * 10px), 0)' }}
        >
          {!isReady ? (
            <p className="font-mono text-xs text-white/30 tracking-widest">
              {progress.toString().padStart(3, '0')}%
            </p>
          ) : (
            <button 
              onClick={handleEnter}
              className="px-6 py-2 border border-amber-500/30 text-amber-500 text-[10px] uppercase font-mono tracking-widest rounded-full hover:bg-amber-500 hover:text-black transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-[pulse_2s_ease-in-out_infinite]"
            >
              Enter Experience
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
