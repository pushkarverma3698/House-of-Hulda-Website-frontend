'use client'
import { hiresCache, warmRemainingHighResFrames } from "@/components/canvas/ScrollCanvas"


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
      warmRemainingHighResFrames()
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
    warmRemainingHighResFrames()
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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black px-6 md:px-12 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isLoaded ? 'opacity-0 scale-105 pointer-events-none blur-md' : 'opacity-100 scale-100 blur-0'
      }`}
    >
      {/* Subtle warm ambient glow behind the estate crest */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.07)_0%,_transparent_70%)] pointer-events-none" />

      <div className="max-w-xl w-full text-center space-y-5 relative">
        <div 
          className="overflow-hidden will-change-transform space-y-2.5"
          style={{ transform: 'translate3d(calc(var(--px, 0) * -12px), calc(var(--py, 0) * -12px), 0)' }}
        >
          <p className="hud-mono text-[10px] md:text-xs tracking-[0.3em] text-amber-400 uppercase flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            High Alpine Sanctuary · Naggar Ridge
          </p>
          <h1 className="font-display italic font-light text-4xl sm:text-5xl md:text-6xl text-cream tracking-tight drop-shadow-[0_2px_24px_rgba(245,158,11,0.18)]">
            House of Hulda
          </h1>
          <p className="hud-mono text-[10px] sm:text-xs text-cream/45 tracking-[0.25em] uppercase">
            Rumsu · 2,180M · 32.1198° N, 77.1731° E · Bortle Class 1
          </p>
        </div>

        {/* 1px Horizon Line Loader - Warm amber glow with smooth progress */}
        <div 
          className="relative w-full max-w-[240px] h-[1.5px] bg-white/10 mx-auto mt-6 overflow-hidden rounded-full will-change-transform"
          style={{ transform: 'translate3d(calc(var(--px, 0) * 12px), calc(var(--py, 0) * 12px), 0)' }}
        >
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500/50 via-amber-400 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.6)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div 
          className="will-change-transform mt-3 h-12 flex items-center justify-center"
          style={{ transform: 'translate3d(calc(var(--px, 0) * 8px), calc(var(--py, 0) * 8px), 0)' }}
        >
          {!isReady ? (
            <p className="font-mono text-xs text-amber-400/60 tracking-widest">
              {progress.toString().padStart(3, '0')}%
            </p>
          ) : (
            <button 
              onClick={handleEnter}
              className="group px-8 py-3.5 border border-amber-400/50 bg-amber-400/10 hover:bg-amber-400 text-amber-300 hover:text-black text-xs font-mono tracking-[0.18em] uppercase rounded-full transition-all duration-300 shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 flex items-center justify-center gap-3 mx-auto"
            >
              <span>Step Inside the Sanctuary</span>
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 text-sm">→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
