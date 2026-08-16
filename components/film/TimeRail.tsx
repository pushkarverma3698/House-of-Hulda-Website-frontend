'use client'

import { useNight, actFor } from '@/lib/store/night'
import { getSolarState } from '@/lib/astro/sun'
import { useEffect, useRef, memo } from 'react'

export const TimeRail = memo(function TimeRail() {
  const actRef = useRef<HTMLSpanElement>(null)
  const timeRef = useRef<HTMLParagraphElement>(null)
  const altRef = useRef<HTMLParagraphElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let animId: number
    const updateDOM = () => {
      const { t } = useNight.getState()
      const solar = getSolarState(t)
      const hours = solar.date.getHours().toString().padStart(2, '0')
      const mins = solar.date.getMinutes().toString().padStart(2, '0')
      const roundedAlt = Math.round(solar.altitude)
      const altFormatted = `${roundedAlt > 0 ? '+' : ''}${roundedAlt}°`
      const actId = actFor(t)

      if (actRef.current) actRef.current.textContent = actId
      if (timeRef.current) timeRef.current.textContent = `${hours}:${mins}`
      if (altRef.current) altRef.current.textContent = `SUN ALT ${altFormatted}`
      if (barRef.current) barRef.current.style.height = `${Math.max(5, Math.round(t * 100))}%`
    }

    const unsub = useNight.subscribe(() => {
      cancelAnimationFrame(animId)
      animId = requestAnimationFrame(updateDOM)
    })

    // Initial pass
    updateDOM()

    return () => {
      unsub()
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <aside
      aria-label="Observatory Telemetry"
      className="fixed right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col items-end gap-3 pointer-events-none font-mono text-xs select-none"
    >
      <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/70 md:bg-black/50 md:backdrop-blur-md border border-white/10 shadow-lg">
        <span ref={actRef} className="text-amber-400 font-bold tracking-widest">
          L-01
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      </div>

      <div className="text-right space-y-0.5 px-3 py-2 rounded-xl bg-black/70 md:bg-black/50 md:backdrop-blur-md border border-white/10 shadow-lg">
        <p ref={timeRef} className="text-sm font-semibold text-neutral-100 tracking-widest">
          15:40
        </p>
        <p ref={altRef} className="text-[10px] text-neutral-400 font-mono tracking-wider">
          SUN ALT +32°
        </p>
      </div>

      <div className="w-[2px] h-24 bg-white/10 rounded-full my-1 relative overflow-hidden">
        <div
          ref={barRef}
          className="absolute top-0 w-full bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"
          style={{ height: '5%' }}
        />
      </div>
    </aside>
  )
})
TimeRail.displayName = 'TimeRail'
