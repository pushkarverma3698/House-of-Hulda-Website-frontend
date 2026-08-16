'use client'

import { useEffect, useRef, useState } from 'react'
import { scrubStats, resetScrubStats, deliveryRatio } from '@/lib/perf/scrubStats'

/**
 * On-device scrub telemetry. Open the site on a real phone with ?debug=perf.
 *
 * The number that matters is DELIVERY: the fraction of frames the film asked
 * for that actually reached the screen. rAF can sit at a healthy 60fps while
 * delivery sits at 5% — smooth scroll, frozen picture — which is what "janky"
 * turned out to mean here. Anything under ~0.8 is visible as stutter.
 *
 * Reads the stats object directly in a rAF rather than through React state, so
 * the instrument does not perturb what it is measuring.
 */
const REFRESH_MS = 250

interface Snapshot {
  delivery: number
  filmFps: number
  activeSec: number
  targetIdx: number
  drawnIdx: number
  tier: string
  proxyResident: number
  proxyMB: number
  midResident: number
  midMB: number
  hiresMB: number
  idxVelocity: number
  decodes: number
  evictions: number
  worstFreezeMs: number
  freezes: number
  tickMs: number
}

export function ScrubDebugOverlay() {
  const [enabled, setEnabled] = useState(false)
  const [snap, setSnap] = useState<Snapshot | null>(null)
  const windowStartRef = useRef(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!new URLSearchParams(window.location.search).has('debug')) return
    setEnabled(true)

    let rafId = 0
    let lastEmit = 0
    windowStartRef.current = performance.now()

    const tick = () => {
      const now = performance.now()
      if (now - lastEmit >= REFRESH_MS) {
        lastEmit = now
        // Divide by time spent SCRUBBING, not wall time. Standing still for ten
        // seconds does not mean the film ran at 4fps.
        const activeSec = Math.max(0.001, scrubStats.activeMs / 1000)
        setSnap({
          delivery: deliveryRatio(),
          filmFps: scrubStats.paintedIdx.size / activeSec,
          activeSec,
          targetIdx: scrubStats.targetIdx,
          drawnIdx: scrubStats.drawnIdx,
          tier: scrubStats.tier,
          proxyResident: scrubStats.proxyResident,
          proxyMB: scrubStats.proxyBytes / 1048576,
          midResident: scrubStats.midResident,
          midMB: scrubStats.midBytes / 1048576,
          hiresMB: scrubStats.hiresBytes / 1048576,
          idxVelocity: scrubStats.idxVelocity,
          decodes: scrubStats.decodes,
          evictions: scrubStats.evictions,
          worstFreezeMs: scrubStats.worstFreezeMs,
          freezes: scrubStats.freezesOver100ms,
          tickMs: scrubStats.tickMsEma,
        })
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  if (!enabled || !snap) return null

  const deliveryPct = Math.round(snap.delivery * 100)
  const deliveryColor =
    snap.delivery >= 0.8 ? 'text-emerald-400' : snap.delivery >= 0.5 ? 'text-amber-400' : 'text-red-400'
  const freezeColor =
    snap.worstFreezeMs < 100 ? 'text-emerald-400' : snap.worstFreezeMs < 250 ? 'text-amber-400' : 'text-red-400'

  const reset = () => {
    resetScrubStats()
    windowStartRef.current = performance.now()
  }

  return (
    <div className="fixed left-2 top-2 z-[100] pointer-events-auto font-mono text-[10px] leading-tight text-white/80 bg-black/85 border border-white/15 rounded-lg p-2.5 w-[188px] shadow-2xl">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] tracking-widest text-amber-400">SCRUB · PERF</span>
        <button onClick={reset} className="text-[9px] text-white/40 hover:text-white px-1 border border-white/15 rounded">
          RESET
        </button>
      </div>

      <div className={`text-2xl font-bold ${deliveryColor}`}>{deliveryPct}%</div>
      <div className="text-[9px] text-white/40 mb-1.5">frames delivered to screen</div>

      <Row label="film fps" value={snap.filmFps.toFixed(1)} />
      <Row label="scrubbed" value={`${snap.activeSec.toFixed(1)}s`} />
      <Row label="rAF tick" value={`${snap.tickMs.toFixed(1)}ms`} />
      <Row
        label="worst freeze"
        value={`${Math.round(snap.worstFreezeMs)}ms`}
        className={freezeColor}
      />
      <Row label="freezes >100ms" value={String(snap.freezes)} />

      <div className="h-px bg-white/10 my-1.5" />

      <Row label="target / drawn" value={`${snap.targetIdx} / ${snap.drawnIdx}`} />
      <Row
        label="tier"
        value={snap.tier}
        className={
          snap.tier === 'hires'
            ? 'text-emerald-400'
            : snap.tier === 'mid'
              ? 'text-sky-400'
              : 'text-white/70'
        }
      />
      <Row
        label="idx vel"
        value={`${snap.idxVelocity.toFixed(3)}/ms`}
        className={snap.idxVelocity > 0.05 ? 'text-amber-400' : 'text-white/70'}
      />
      <Row label="proxy resident" value={`${snap.proxyResident}/240`} />
      <Row label="proxy mem" value={`${snap.proxyMB.toFixed(1)}MB`} />
      <Row label="mid mem" value={`${snap.midResident}f · ${snap.midMB.toFixed(1)}MB`} />
      <Row label="hires mem" value={`${snap.hiresMB.toFixed(1)}MB`} />

      <div className="h-px bg-white/10 my-1.5" />

      <Row label="decodes" value={String(snap.decodes)} />
      <Row
        label="evictions"
        value={String(snap.evictions)}
        className={snap.evictions > 0 ? 'text-amber-400' : 'text-white/70'}
      />
    </div>
  )
}

function Row({ label, value, className = 'text-white/70' }: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-white/35">{label}</span>
      <span className={className}>{value}</span>
    </div>
  )
}
