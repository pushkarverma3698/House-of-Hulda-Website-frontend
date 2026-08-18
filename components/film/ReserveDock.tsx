'use client'

import Link from 'next/link'
import { useEffect, useRef, memo } from 'react'
import { useNight } from '@/lib/store/night'
import { getSolarState, formatSceneTime } from '@/lib/astro/sun'

/** Let the opening frame be pure film. The dock arrives once the visitor has
 *  committed to the descent — roughly one thumb-flick in. */
const APPEAR_T = 0.06

/** The closing act's own call to action — the button, not the section. The
 *  section is 55% on screen while its centred button is still below the fold,
 *  so handing over on the section leaves a stretch with no reserve anywhere. */
const FINALE_SELECTOR = '#the-invitation a[href="/book"]'

/**
 * The reserve you can reach.
 *
 * Measured on a 390x844 phone: from t = 0.098 to t = 0.99 — 89% of the page,
 * 11,156px, about fourteen thumb-flicks — the only booking control anywhere on
 * screen was the WhatsApp circle. The header's "Reserve" hides itself the
 * moment you scroll down, which is the exact direction you scroll while you are
 * falling for the place, and the real call to action does not arrive until
 * t = 1.0. So the site collected all its desire at the hearth and the golden
 * hour, and then offered nothing to press for another six screens.
 *
 * This is deliberately not a banner. It is the film's own HUD vocabulary — ink
 * scrim, amber hairline, the running scene clock — docked into the bottom of
 * the screen where a thumb already rests. Phone only: a desktop pointer can
 * reach the header, a thumb curled around a 390px phone cannot.
 */
export const ReserveDock = memo(function ReserveDock() {
  const rootRef = useRef<HTMLDivElement>(null)
  const timeRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let animId: number
    let shown: boolean | null = null

    /**
     * Stand down once the last act is on screen.
     *
     * L-09 puts "Reserve the stay" in the middle of the screen under first
     * light. A second copy of the same words docked below it turns the one
     * moment the page has spent twelve screens building toward into a pair of
     * buttons. The dock exists because that moment used to be six screens
     * away; once the visitor is standing in it, it has done its job.
     *
     * Observed rather than thresholded on `t`: a guessed number leaves either
     * an overlap or — worse — a stretch near the end with no reserve on screen
     * at all, and it silently drifts the next time a section's height changes.
     */
    let finaleVisible = false
    const finale = document.querySelector(FINALE_SELECTOR)
    const observer = finale
      ? new IntersectionObserver(
          ([entry]) => {
            finaleVisible = entry.isIntersecting
            // Drive the change directly. Momentum can carry the finale into
            // view and settle without another sampled scroll frame, and
            // waiting on one would strand the dock on top of the closing act.
            cancelAnimationFrame(animId)
            animId = requestAnimationFrame(update)
          },
          // If the selector ever stops matching, `finale` is null and the dock
          // simply never retires — the failure mode is "reserve stays
          // reachable", which is the right way for this to break.
          { threshold: 0.9 }
        )
      : null
    if (finale && observer) observer.observe(finale)

    const update = () => {
      const { t } = useNight.getState()

      const next = t > APPEAR_T && !finaleVisible
      if (next !== shown) {
        shown = next
        if (rootRef.current) {
          rootRef.current.style.opacity = next ? '1' : '0'
          rootRef.current.style.transform = next ? 'translateY(0)' : 'translateY(120%)'
          // Never leave an invisible bar eating taps over the opening frame.
          rootRef.current.style.pointerEvents = next ? 'auto' : 'none'
        }
      }

      // Same DOM-mutation pattern as TimeRail: this text changes on every
      // sampled frame, and routing it through React would re-render a fixed
      // element sitting over a scrubbing canvas.
      if (timeRef.current) {
        timeRef.current.textContent = formatSceneTime(getSolarState(t).date)
      }
    }

    const unsub = useNight.subscribe(() => {
      cancelAnimationFrame(animId)
      animId = requestAnimationFrame(update)
    })

    update()

    return () => {
      unsub()
      observer?.disconnect()
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <div
      ref={rootRef}
      className="md:hidden fixed inset-x-0 bottom-0 z-40 pointer-events-none transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{
        opacity: 0,
        transform: 'translateY(120%)',
        paddingBottom: 'calc(0.875rem + env(safe-area-inset-bottom))',
      }}
    >
      {/* The film runs edge to edge underneath, so the bar needs a floor to sit
          on or the amber hairline reads as debris over a bright frame. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-ink via-ink/80 to-transparent"
      />

      <div className="px-4 pt-3">
        <Link
          href="/book"
          scroll={false}
          className="flex min-h-[52px] items-center justify-between gap-3 rounded-full border border-amber/40 bg-amber/[0.12] px-6 backdrop-blur-md shadow-[0_0_24px_rgba(217,154,78,0.18)] active:scale-[0.98] transition-transform duration-200"
        >
          <span className="hud-mono text-[11px] font-bold uppercase tracking-widest text-amber">
            Reserve the stay
          </span>
          {/* Ties the action to where the visitor is standing in the story —
              the clock is already the site's way of saying how far you have
              come, and this is the one control that follows you the whole way
              down. */}
          <span className="flex items-center gap-2">
            <span
              ref={timeRef}
              className="hud-mono text-[10px] tracking-widest text-cream/45 tabular-nums"
            >
              15:40
            </span>
            <span className="text-amber/70" aria-hidden="true">
              →
            </span>
          </span>
        </Link>
      </div>
    </div>
  )
})
ReserveDock.displayName = 'ReserveDock'
