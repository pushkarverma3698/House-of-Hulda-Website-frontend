'use client'

import { useNight, actFor } from '@/lib/store/night'
import { getSolarState, formatSceneTime } from '@/lib/astro/sun'
import { useEffect, useRef, memo } from 'react'

export const TimeRail = memo(function TimeRail() {
  const actRef = useRef<HTMLSpanElement>(null)
  const timeRef = useRef<HTMLParagraphElement>(null)
  const altRef = useRef<HTMLParagraphElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLElement>(null)

  /**
   * Yield while reading, exactly as the header does.
   *
   * On a phone there is no fixed position the story copy never reaches, so the
   * last collisions left after this panel was moved and made translucent were
   * the ones where a section's eyebrow passed through it in transit. Chrome
   * that all gets out of the way on the same gesture reads as one deliberate
   * behaviour; chrome where one piece hides and another does not reads as a
   * bug. Driven straight from the DOM rather than through state, since this
   * component already updates itself outside React for the same reason.
   */
  useEffect(() => {
    let lastY = window.scrollY
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        const dy = y - lastY
        if (Math.abs(dy) > 12) {
          const hide = y > 220 && dy > 0
          if (railRef.current) {
            railRef.current.style.opacity = hide ? '0' : '1'
            railRef.current.style.transform = hide ? 'translateY(-0.75rem)' : 'translateY(0)'
          }
          lastY = y
        }
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    let animId: number
    const updateDOM = () => {
      const { t } = useNight.getState()
      const solar = getSolarState(t)
      const roundedAlt = Math.round(solar.altitude)
      const altFormatted = `${roundedAlt > 0 ? '+' : ''}${roundedAlt}°`
      const actId = actFor(t)

      if (actRef.current) actRef.current.textContent = actId
      if (timeRef.current) timeRef.current.textContent = formatSceneTime(solar.date)
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
    /* Docked under the header rather than pinned to the vertical middle.
       The middle-right is exactly where the story copy sits: measured across a
       half-screen sweep of the whole film, this panel landed on the copy in
       seven of the nine acts, covering up to 29% of the text block — and it
       reliably took the closing line of each act, which is where the best
       sentence is. On mobile it collapses to a single quiet line; the vertical
       progress bar is redundant with FilmReel at the top of the viewport. */
    <aside
      ref={railRef}
      aria-label="Observatory Telemetry"
      className="film-hud fixed right-4 top-[4.75rem] transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:!opacity-100 md:!translate-y-0 md:right-6 md:top-1/2 md:-translate-y-1/2 z-20 flex flex-row md:flex-col items-center md:items-end gap-2 md:gap-3 pointer-events-none font-mono text-xs select-none"
    >
      {/* On a phone this is a burned-in timecode, not a panel. The solid pill
          version destroyed whatever it landed on, and on a viewport this narrow
          there is no fixed position the story copy never reaches — so the panel
          is dropped and the readout is set at low opacity with a shadow to
          carry it. It stays readable over the film and no longer occludes a
          headline when the two cross. The full instrument returns at md. */}
      <div className="flex items-center gap-2 px-0 py-0 md:px-2.5 md:py-1 md:rounded-full md:bg-black/50 md:backdrop-blur-md md:border md:border-white/10 md:shadow-lg">
        <span
          ref={actRef}
          className="text-amber-400/70 md:text-amber-400 font-bold tracking-widest [text-shadow:0_1px_4px_rgba(0,0,0,0.95)]"
        >
          L-01
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70 md:bg-amber-400 animate-pulse" />
      </div>

      <div className="flex items-baseline gap-2 md:block md:text-right md:space-y-0.5 px-0 py-0 md:px-3 md:py-2 md:rounded-xl md:bg-black/50 md:backdrop-blur-md md:border md:border-white/10 md:shadow-lg">
        <p
          ref={timeRef}
          className="text-[11px] md:text-sm font-semibold text-neutral-100/75 md:text-neutral-100 tracking-widest [text-shadow:0_1px_4px_rgba(0,0,0,0.95)]"
        >
          15:40
        </p>
        <p
          ref={altRef}
          className="text-[9px] md:text-[10px] text-neutral-300/55 md:text-neutral-400 font-mono tracking-wider [text-shadow:0_1px_4px_rgba(0,0,0,0.95)]"
        >
          SUN ALT +32°
        </p>
      </div>

      <div className="hidden md:block w-[2px] h-24 bg-white/10 rounded-full my-1 relative overflow-hidden">
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
