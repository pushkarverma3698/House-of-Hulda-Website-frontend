'use client'

import { useEffect, useRef, memo } from 'react'
import { useNight } from '@/lib/store/night'

/**
 * FilmReel — a 1px amber line at the very top of the viewport.
 * Advances from left → right as t goes 0 → 1.
 * Zero React setState. Direct DOM width mutation via rAF.
 */
export const FilmReel = memo(function FilmReel() {
  const barRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let animId: number

    const update = () => {
      const { t } = useNight.getState()
      const pct = Math.max(0, Math.min(100, t * 100))

      if (barRef.current)  barRef.current.style.width  = `${pct}%`
      if (dotRef.current)  dotRef.current.style.left   = `${pct}%`
    }

    const unsub = useNight.subscribe(() => {
      cancelAnimationFrame(animId)
      animId = requestAnimationFrame(update)
    })

    update()

    return () => {
      unsub()
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] h-[2px] pointer-events-none"
      aria-hidden="true"
    >
      {/* Track */}
      <div className="absolute inset-0 bg-white/[0.04]" />
      {/* Fill — amber */}
      <div
        ref={barRef}
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-600/70 via-amber-400/90 to-amber-300"
        style={{ width: '0%', transition: 'width 0.08s linear' }}
      />
      {/* Leading dot */}
      <div
        ref={dotRef}
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_2px_rgba(251,191,36,0.5)]"
        style={{ left: '0%' }}
      />
    </div>
  )
})
FilmReel.displayName = 'FilmReel'
