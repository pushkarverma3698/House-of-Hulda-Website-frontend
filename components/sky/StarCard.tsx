'use client'

import { CelestialGod } from '@/content/eighteen'
import { memo, useState, useEffect } from 'react'

export const StarCard = memo(function StarCard({
  star,
  onClose,
}: {
  star: CelestialGod
  onClose: () => void
}) {
  const [isTelescopeView, setIsTelescopeView] = useState(false)
  const [jitter, setJitter] = useState({ ra: 0, dec: 0 })

  useEffect(() => {
    if (!isTelescopeView) return
    const interval = setInterval(() => {
      setJitter({ ra: (Math.random() - 0.5) * 0.005, dec: (Math.random() - 0.5) * 0.005 })
    }, 100)
    return () => clearInterval(interval)
  }, [isTelescopeView])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end pointer-events-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Telescope View Overlay */}
      {isTelescopeView && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black animate-in fade-in duration-1000">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, transparent 20%, #000 70%)' }} />
          {/* Simulated optical distortion and noise */}
          <div className="absolute inset-0 mix-blend-screen opacity-10 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          
          <div className="relative w-[90vmin] h-[90vmin] sm:w-[80vmin] sm:h-[80vmin] rounded-full overflow-hidden border-[1px] border-amber-500/20 shadow-[0_0_100px_rgba(245,158,11,0.1)] flex items-center justify-center bg-black">
            {/* Deep Sky Simulated Background (Dark blue/black gradient with radial mask) */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/40 via-black to-black opacity-60 animate-pulse" />
            
            {/* Center target representation (simulated object) */}
            <div className="w-16 h-16 rounded-full bg-white/10 blur-xl animate-pulse" style={{ transform: `translate(${jitter.ra * 1000}px, ${jitter.dec * 1000}px)` }} />
            <div className="absolute w-2 h-2 bg-amber-200/80 rounded-full blur-[1px]" style={{ transform: `translate(${jitter.ra * 1000}px, ${jitter.dec * 1000}px)` }} />

            {/* Crosshairs */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-full h-[1px] bg-amber-500/30" />
              <div className="h-full w-[1px] bg-amber-500/30 absolute" />
              <div className="w-32 h-32 border border-amber-500/40 rounded-full absolute" />
              <div className="w-1 h-1 bg-amber-500 rounded-full absolute" />
            </div>

            {/* Telemetry Readout */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
               <span className="hud-mono text-[10px] text-amber-500 bg-black/50 px-3 py-1 rounded-full border border-amber-500/30">
                 BALCONY REFRACTOR 200MM
               </span>
            </div>
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-8">
              <div className="text-center">
                <span className="hud-mono text-[9px] text-amber-500/70 block mb-1">TARGET RA</span>
                <span className="font-mono text-xs text-amber-400">
                  {star.ra.substring(0,6)} <span className="text-amber-400/50">{(Math.abs(jitter.ra)).toFixed(4)}</span>
                </span>
              </div>
              <div className="text-center">
                <span className="hud-mono text-[9px] text-amber-500/70 block mb-1">TARGET DEC</span>
                <span className="font-mono text-xs text-amber-400">
                  {star.dec.substring(0,6)} <span className="text-amber-400/50">{(Math.abs(jitter.dec)).toFixed(4)}</span>
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setIsTelescopeView(false)}
            className="absolute top-6 right-6 px-4 py-2 rounded-full border border-white/20 bg-black/50 text-white font-mono text-xs uppercase tracking-widest hover:border-amber-400 transition-colors z-50 backdrop-blur-md"
          >
            Exit Optics
          </button>
        </div>
      )}

      {/* Slide-over Card */}
      <div className="relative w-full sm:w-[480px] h-[100dvh] sm:h-[90vh] sm:mr-6 sm:rounded-2xl bg-neutral-950/95 border border-white/10 flex flex-col shadow-2xl backdrop-blur-xl animate-in slide-in-from-right duration-500 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="space-y-1">
            <span className="hud-mono text-[10px] text-amber-400 tracking-widest uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              DEITY #{star.id} · {star.constellation.toUpperCase()}
            </span>
            <h2 className="font-serif text-2xl text-neutral-100">{star.deity}</h2>
            <p className="hud-mono text-xs text-neutral-400">{star.deityRole}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close star details"
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Celestial designation & Object title */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-serif text-lg text-amber-200">{star.name}</span>
              <span className="hud-mono text-xs text-amber-400/80 bg-amber-400/10 px-2 py-0.5 rounded">
                {star.designation}
              </span>
            </div>
            <p className="text-sm text-neutral-300 italic font-body">{star.observationNote}</p>
          </div>

          {/* Technical Telemetry Grid */}
          <div className="grid grid-cols-2 gap-3 hud-mono text-xs">
            <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Right Ascension</span>
              <p className="text-neutral-200 font-semibold">{star.ra}</p>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Declination</span>
              <p className="text-neutral-200 font-semibold">{star.dec}</p>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Visual Magnitude</span>
              <p className="text-neutral-200 font-semibold">+{star.magnitude.toFixed(1)} mag</p>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Distance</span>
              <p className="text-neutral-200 font-semibold">{star.distanceLightYears}</p>
            </div>
          </div>

          {/* Lore & Living Tradition */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <h3 className="hud-mono text-xs tracking-widest uppercase text-amber-500">
              Living Tradition of Chandrakhani
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed font-body">
              {star.lore}
            </p>
          </div>

          {/* Balcony Observation info */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-3">
            <div>
              <p className="hud-mono text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-2">
                🔭 House of Hulda 200mm Refractor
              </p>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Visible directly from our upper timber balcony starting at {star.riseTimeLocal} local time during clear mountain nights.
              </p>
            </div>
            <button
              onClick={() => setIsTelescopeView(true)}
              className="w-full py-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Engage Optics
            </button>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-6 border-t border-white/10 bg-neutral-900/60 flex items-center justify-between">
          <span className="hud-mono text-[10px] text-neutral-500">
            OBSERVATION #0{star.id} / 18
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white text-black font-mono text-xs font-semibold uppercase tracking-widest hover:bg-amber-400 transition-colors"
          >
            Return to Sky
          </button>
        </div>
      </div>
    </div>
  )
})
StarCard.displayName = 'StarCard'
