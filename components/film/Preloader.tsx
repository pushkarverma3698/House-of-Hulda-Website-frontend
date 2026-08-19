'use client'

import { useEffect, useState } from 'react'

/** Frames that must be in the HTTP cache before the curtain lifts. Enough to
 *  cover the opening beat; ScrollCanvas sweeps the remaining proxy frames
 *  resident behind the user. */
const CRITICAL_FRAME_COUNT = 40
/** Browsers multiplex freely over HTTP/2, so an unbounded fan-out does not
 *  queue — it splits the same pipe and every frame arrives late. */
const CRITICAL_CONCURRENCY = 6
const SAFETY_TIMEOUT_MS = 4000

/**
 * The HIGH-RES tier. Since 4G/5G is ubiquitous, we use the 4-second loading
 * window to pre-fetch the first 40 pristine 4K/720p hardware-accelerated JPEGs.
 * This guarantees a razor-sharp opening beat when the curtain lifts, dropping
 * back to nearest-cached proxy frames only if the connection is strictly 3G/EDGE.
 */
const frameUrl = (index: number) => {
  if (typeof window === 'undefined') return `/frames/hero/frame_${String(index).padStart(3, '0')}.jpg`
  const isDesktop = !window.matchMedia('(pointer: coarse)').matches && window.innerWidth >= 768
  return isDesktop
    ? `/frames/hero-desktop/frame_${String(index).padStart(3, '0')}.jpg`
    : `/frames/hero/frame_${String(index).padStart(3, '0')}.jpg`
}

/** Warms the HTTP cache. The bitmap cache in ScrollCanvas decodes from here. */
async function warmFrame(index: number, signal: AbortSignal): Promise<void> {
  try {
    const response = await fetch(frameUrl(index), { signal })
    await response.arrayBuffer() // must drain or the connection stays open
  } catch {
    // Aborted or offline — ScrollCanvas re-requests on demand.
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
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    let hasCompleted = false

    const critical = Array.from({ length: CRITICAL_FRAME_COUNT }, (_, i) => i + 1)

    const completePreloader = () => {
      if (hasCompleted) return
      hasCompleted = true
      setProgress(100)
      setTimeout(() => {
        setIsLoaded(true)
        onComplete?.()
      }, 400)
    }

    // Slow connection: enter anyway. ScrollCanvas degrades to nearest-cached.
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
        // The rest of the sequence is swept resident by ScrollCanvas, which
        // decodes as it goes — warming it twice here would only compete for the
        // same pipe.
      })
      .catch(() => {})

    return () => {
      clearTimeout(safetyTimeout)
      controller.abort()
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
