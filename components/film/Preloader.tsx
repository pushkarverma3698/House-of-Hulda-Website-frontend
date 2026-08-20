import { useEffect, useState, useRef } from 'react'

import {
  startFilmPreload,
  onFilmPreload,
  FILM_PRELOAD_TUNING,
  type FilmPreloadStatus,
} from '@/lib/film/preload'

/**
 * The curtain.
 *
 * It holds while lib/film/preload.ts pulls the master film down, and the bar it
 * draws is that download's real progress rather than a timer's — see that file
 * for why the whole film, and for how the lift decision is made.
 *
 * What changed here: this component used to own the fetching. It warmed 40
 * frames into the HTTP cache, lifted on a 4-second timeout regardless of what
 * had arrived, and left every frame's decode on the scroll's critical path. The
 * fetching now lives next to the cache the canvas draws from, so the frames the
 * curtain pays for are decoded and ready rather than merely downloaded.
 */
export function Preloader({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // The curtain holds until the film says it is safe to lift.
  useEffect(() => {
    const mountedAt = performance.now()
    let liftTimer = 0
    let hasCompleted = false

    const complete = () => {
      if (hasCompleted) return
      hasCompleted = true
      setProgress(100)
      // The fade-out is 1200 ms of CSS; unmount after the opening 400 ms of it
      // so the film is already live underneath as the curtain dissolves.
      liftTimer = window.setTimeout(() => {
        setIsLoaded(true)
        onComplete?.()
      }, 400)
    }

    const unsubscribe = onFilmPreload((s: Readonly<FilmPreloadStatus>) => {
      if (hasCompleted) return
      setProgress(Math.min(99, Math.floor(s.progress * 100)))
      if (!s.ready) return
      // Never flash. On a warm reload every frame is already in the HTTP cache
      // and `ready` arrives in the same tick the curtain mounted.
      const held = performance.now() - mountedAt
      if (held >= FILM_PRELOAD_TUNING.MIN_CURTAIN_MS) complete()
      else liftTimer = window.setTimeout(complete, FILM_PRELOAD_TUNING.MIN_CURTAIN_MS - held)
    })

    startFilmPreload()

    return () => {
      unsubscribe()
      clearTimeout(liftTimer)
    }
  }, [onComplete])

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
      // Gamma is roughly -90 to 90 (left/right). Clamp to -30 to 30.
      targetX = clamp(e.gamma, -30, 30) / 30
      // Beta is front/back. Assume holding at 45 degrees.
      targetY = clamp(e.beta - 45, -30, 30) / 30
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('deviceorientation', handleDeviceOrientation)

    const loop = () => {
      // Lerp for buttery smooth physics
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
      data-preloader=""
      className={`fixed inset-0 z-50 flex flex-col justify-center bg-black px-8 md:px-24 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        progress >= 100 ? 'opacity-0 scale-105 pointer-events-none blur-md' : 'opacity-100 scale-100 blur-0'
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
          className="will-change-transform mt-2"
          style={{ transform: 'translate3d(calc(var(--px, 0) * 10px), calc(var(--py, 0) * 10px), 0)' }}
        >
          <p className="font-mono text-xs text-white/30 tracking-widest">
            {progress.toString().padStart(3, '0')}%
          </p>
        </div>
      </div>
    </div>
  )
}
