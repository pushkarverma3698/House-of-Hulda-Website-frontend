'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ScrollCanvas } from '@/components/canvas/ScrollCanvas'
import { Preloader } from '@/components/film/Preloader'
import { TimeRail } from '@/components/film/TimeRail'
import { Marketplace } from '@/components/film/Marketplace'
import { Soundscape } from '@/components/film/Soundscape'
import { Navigation } from '@/components/film/Navigation'
import { FilmReel } from '@/components/film/FilmReel'
import { StarCard } from '@/components/sky/StarCard'
import { EIGHTEEN_GODS, CelestialGod } from '@/content/eighteen'
import { useState } from 'react'

const SceneRoot = dynamic(
  () => import('@/components/canvas/SceneRoot').then((mod) => mod.SceneRoot),
  { ssr: false }
)

// Stagger delays for deity grid cascade
const STAGGER_MS = [0,40,80,120,160,200,240,280,320,360,400,440,480,520,560,600,640,680]

export default function Home() {
  const [selectedStar, setSelectedStar] = useState<CelestialGod | null>(null)
  const [isHearthMenuOpen, setIsHearthMenuOpen] = useState(false)

  return (
    <main className="relative min-h-[950vh] bg-transparent text-white font-body selection:bg-amber-500 selection:text-black">
      {/* 2D Master Drone Frame Scrubber Canvas */}
      <ScrollCanvas />

      {/* z-0 Fixed WebGL Canvas (Dynamic Ephemeris, SkyBox, Embers, StarField, PostProcessing) */}
      <SceneRoot />

      {/* Navigation Header */}
      <Navigation />

      {/* z-20 Fixed UI Overlays */}
      <TimeRail />
      <Soundscape />

      {/* Cinematic film-reel scroll progress — top of viewport */}
      <FilmReel />

      {/* z-50 Initial Atmospheric Loader */}
      <Preloader />

      {/* Cinematic overlay: vignette + film grain tied to every act */}
      <div className="cine-overlay" aria-hidden="true" />

      {/* z-10 Transparent Scroll Spacers with Story Beats */}
      <div className="relative z-10 pointer-events-none">

        {/* ═══════════════════════════════════════════
            L-01: 15:40 — THE ROAD STOPS AT RUMSU
            Text lives on the ground — no box.
            A deep bottom gradient anchors it.
        ═══════════════════════════════════════════ */}
        <section className="relative h-[120vh] flex flex-col justify-end pb-28 px-8 md:px-24">
          {/* Directional gradient: reads at any light level */}
          <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none" />
          <div className="relative space-y-5 max-w-2xl">
            <p className="hud-mono text-amber-400 tracking-widest text-[10px] flex items-center gap-2 hero-hint-enter"
              style={{ animationDelay: '0.4s' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              L-01 · 15:40 · ALT 2,180M
            </p>
            <h1 className="hero-title-enter font-serif text-4xl md:text-6xl lg:text-7xl font-normal leading-[1.05] text-white"
              style={{ textShadow: '0 4px 40px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.6)' }}>
              The road stops<br />at Rumsu.
            </h1>
            <p className="hero-sub-enter text-neutral-200 text-base md:text-lg leading-relaxed max-w-xl"
              style={{ textShadow: '0 1px 12px rgba(0,0,0,0.9)' }}>
              Above it, the trail to Chandrakhani — where a storm once tore a basket of eighteen gods off a rishi&apos;s head and scattered them across these peaks.
            </p>
            <p className="hero-sub-enter text-amber-200/70 text-sm font-mono tracking-wide"
              style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)', animationDelay: '1.5s' }}>
              They&apos;re still up there. We have a telescope.
            </p>
            <div className="hero-hint-enter pt-3 flex items-center gap-2 text-neutral-400 text-[10px] font-mono tracking-widest"
              style={{ animationDelay: '1.9s' }}>
              <span className="animate-bounce inline-block">↓</span> SCROLL TO DESCEND INTO THE VALLEY
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            L-02: 16:23 — THE WATER
            Right-side alignment, no box
        ═══════════════════════════════════════════ */}
        <section className="relative h-[120vh] flex flex-col justify-center px-8 md:px-24 items-end">
          <div className="absolute inset-x-0 inset-y-0 bg-gradient-to-l from-black/75 via-black/30 to-transparent pointer-events-none" />
          <div className="relative space-y-4 max-w-lg text-right">
            <p className="hud-mono text-amber-400 tracking-widest text-[10px]">
              L-02 · 16:23 · GLACIAL SPRINGS
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-normal text-white leading-tight"
              style={{ textShadow: '0 2px 24px rgba(0,0,0,0.85)' }}>
              You will hear it<br />before you see it.
            </h2>
            <p className="text-neutral-200 text-sm md:text-base leading-relaxed"
              style={{ textShadow: '0 1px 10px rgba(0,0,0,0.9)' }}>
              Glacial melt from Chandrakhani ridge. Piped into cedar soaking tubs and copper kitchen urns. Cold enough to bite. Pure enough to drink without a filter.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            L-03: 17:07 — DEODAR AND STONE
            Left-side, lower third placement
        ═══════════════════════════════════════════ */}
        <section className="relative h-[120vh] flex flex-col justify-end pb-28 px-8 md:px-24">
          <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />
          <div className="relative space-y-4 max-w-xl">
            <p className="hud-mono text-amber-400 tracking-widest text-[10px]">
              L-03 · 17:07 · KATH-KUNI ARCHITECTURE
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-normal text-white leading-tight"
              style={{ textShadow: '0 2px 24px rgba(0,0,0,0.85)' }}>
              Deodar and stone.
            </h2>
            <p className="text-neutral-200 text-sm md:text-base leading-relaxed"
              style={{ textShadow: '0 1px 10px rgba(0,0,0,0.9)' }}>
              Stacked in alternating courses of dressed mountain schist and hand-hewn cedar. No mortar. No iron nails. The structure tightens with winter frost and breathes with earth tremors.
            </p>
            <p className="text-amber-200/60 text-xs font-mono tracking-wide"
              style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}>
              500 years of mountain engineering in every beam.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            L-04: 17:50 — THE ORCHARD TURNS
            Center, upper-third — the golden hour shot
        ═══════════════════════════════════════════ */}
        <section className="relative h-[120vh] flex flex-col justify-center items-center text-center px-8 md:px-24">
          <div className="absolute inset-x-0 inset-y-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none" />
          <div className="relative space-y-4 max-w-2xl">
            <p className="hud-mono text-amber-300 tracking-widest text-[10px]">
              L-04 · 17:50 · GOLDEN HOUR
            </p>
            <h2 className="font-serif text-4xl md:text-6xl font-normal text-white leading-tight"
              style={{ textShadow: '0 2px 40px rgba(0,0,0,0.7), 0 0 80px rgba(220,150,60,0.15)' }}>
              The orchard turns<br />amber.
            </h2>
            <p className="text-neutral-100/90 text-base md:text-lg leading-relaxed"
              style={{ textShadow: '0 1px 16px rgba(0,0,0,0.9)' }}>
              Ancient Royal Delicious apple trees. Long shadows across grass. The Pir Panjal crest holding the last direct ray of the day.
            </p>
            <p className="text-amber-200/70 text-sm font-mono"
              style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}>
              This light lasts twelve minutes.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            L-05: 18:29 — THE LOFT
            Right-side panel, mid-section
        ═══════════════════════════════════════════ */}
        <section className="relative h-[120vh] flex flex-col justify-center px-8 md:px-24 items-end">
          <div className="absolute inset-x-0 inset-y-0 bg-gradient-to-l from-black/80 via-black/35 to-transparent pointer-events-none" />
          <div className="relative space-y-4 max-w-lg text-right">
            <p className="hud-mono text-amber-400 tracking-widest text-[10px]">
              L-05 · 18:29 · THE LOFT
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-normal text-white leading-tight"
              style={{ textShadow: '0 2px 24px rgba(0,0,0,0.85)' }}>
              The Attic Sanctuary.
            </h2>
            <p className="text-neutral-200 text-sm md:text-base leading-relaxed"
              style={{ textShadow: '0 1px 10px rgba(0,0,0,0.9)' }}>
              Low timber floor seating under a pitched slate roof. Handwoven Kullu blankets. A cup of mountain kahwa as the valley goes dark below you.
            </p>
            <p className="text-neutral-400 text-xs font-mono"
              style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}>
              Warm light. Dusk settling. Nowhere else to be.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            L-06: 19:07 — THE HEARTH
            Center cinematic panel with amber warmth
        ═══════════════════════════════════════════ */}
        <section className="relative h-[120vh] flex flex-col justify-center items-center text-center px-8 md:px-24">
          <div className="absolute inset-x-0 inset-y-0 bg-gradient-to-b from-black/70 via-black/20 to-black/75 pointer-events-none" />
          <div className="relative space-y-5 max-w-xl">
            <p className="hud-mono text-amber-400 tracking-widest text-[10px]">
              L-06 · 19:07 · THE HEARTH
            </p>
            <h2 className="font-serif text-4xl md:text-6xl font-normal text-white leading-tight"
              style={{ textShadow: '0 2px 32px rgba(0,0,0,0.9), 0 0 60px rgba(200,100,30,0.2)' }}>
              The Woodstove<br />Hearth.
            </h2>
            <p className="text-neutral-100/90 text-base md:text-lg leading-relaxed"
              style={{ textShadow: '0 1px 16px rgba(0,0,0,0.9)' }}>
              A cast-iron stove burning aged deodar rootwood. Fresh siddu over wild walnut stuffing. Ghee poured hot at the table.
            </p>
            <p className="text-amber-200/70 text-sm font-mono tracking-wide"
              style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}>
              Outside, the temperature drops toward zero.<br />Inside, pure Himalayan warmth.
            </p>
            <div className="pt-8 pointer-events-auto">
              {!isHearthMenuOpen ? (
                <button
                  onClick={() => setIsHearthMenuOpen(true)}
                  className="px-5 py-2.5 rounded-full border border-amber-500/30 bg-black/40 backdrop-blur-md text-amber-400 font-mono text-xs uppercase tracking-widest hover:border-amber-400 hover:bg-amber-500/10 transition-all flex items-center justify-center gap-2 mx-auto shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                >
                  <span className="w-1 h-1 rounded-full bg-amber-400 animate-ping" />
                  + In the Hearth
                </button>
              ) : (
                <div className="bg-black/60 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6 text-left max-w-sm mx-auto shadow-2xl animate-in zoom-in-95 fade-in duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <span className="hud-mono text-xs tracking-widest uppercase text-amber-500">
                      Heritage Menu
                    </span>
                    <button onClick={() => setIsHearthMenuOpen(false)} className="text-neutral-500 hover:text-white transition-colors">✕</button>
                  </div>
                  <ul className="space-y-4 font-serif text-neutral-200">
                    <li className="flex gap-3 items-start">
                      <span className="text-amber-500/50 mt-1">✦</span>
                      <div>
                        <p className="text-sm md:text-base text-amber-100">Fresh Siddu</p>
                        <p className="text-xs text-neutral-400 font-body">Steamed yeast bread with wild walnut & opium seed stuffing.</p>
                      </div>
                    </li>
                    <li className="flex gap-3 items-start">
                      <span className="text-amber-500/50 mt-1">✦</span>
                      <div>
                        <p className="text-sm md:text-base text-amber-100">Apple Wood Smoked Trout</p>
                        <p className="text-xs text-neutral-400 font-body">Caught in the Tirthan River, smoked slow over orchard trimmings.</p>
                      </div>
                    </li>
                    <li className="flex gap-3 items-start">
                      <span className="text-amber-500/50 mt-1">✦</span>
                      <div>
                        <p className="text-sm md:text-base text-amber-100">Wildflower Honey & Ghee</p>
                        <p className="text-xs text-neutral-400 font-body">Poured hot over every meal. Raw and unfiltered.</p>
                      </div>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            L-07: 19:45 → 23:06 — THE EIGHTEEN GODS
            Interactive Celestial Registry
            Minimal glass panel — this IS an instrument
        ═══════════════════════════════════════════ */}
        <section className="relative min-h-[155vh] flex flex-col justify-center px-6 md:px-16 max-w-6xl mx-auto py-24">
          <div className="space-y-6 bg-black/[0.65] p-6 md:p-10 rounded-2xl backdrop-blur-xl border border-white/[0.07] shadow-2xl pointer-events-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-3">
                <p className="hud-mono text-amber-400 tracking-widest text-[10px] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  L-07 · 19:45 · BORTLE CLASS 1 CELESTIAL VAULT
                </p>
                <h2 className="font-serif text-3xl md:text-5xl font-normal text-neutral-100 leading-tight">
                  The Eighteen Gods<br />in the Sky.
                </h2>
                <p className="text-neutral-400 text-sm md:text-base max-w-lg leading-relaxed">
                  Select any celestial deity to bring up live astronomical coordinates and our 200mm balcony refractor telemetry.
                </p>
              </div>
              <span className="hud-mono text-[10px] text-amber-400/70 border border-amber-400/20 px-3 py-1.5 rounded-full self-start md:self-auto bg-amber-400/5">
                18 OBJECTS ACTIVE
              </span>
            </div>

            {/* Interactive Grid of Eighteen Deities — staggered cascade */}
            <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
              {EIGHTEEN_GODS.map((god, idx) => (
                <button
                  key={god.id}
                  onClick={() => setSelectedStar(god)}
                  className="p-3 rounded-xl bg-white/[0.03] hover:bg-amber-400/[0.08] border border-white/[0.06] hover:border-amber-400/30 text-left transition-all group flex flex-col justify-between h-24 shadow-sm hover:shadow-amber-900/30 hover:shadow-lg hover:scale-[1.02] active:scale-95"
                  style={{ animationDelay: `${STAGGER_MS[idx] || idx * 40}ms` }}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="hud-mono text-[9px] text-amber-400/60 font-mono">
                      #{god.id.toString().padStart(2, '0')}
                    </span>
                    <span className="hud-mono text-[8px] text-neutral-600 uppercase">
                      {god.constellation.slice(0, 3)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-serif text-sm text-neutral-200 group-hover:text-amber-200 transition-colors leading-tight line-clamp-1">
                      {god.deity}
                    </h3>
                    <p className="hud-mono text-[9px] text-neutral-500 truncate mt-0.5">
                      {god.designation.split(' ')[0]}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            L-08: 02:27 — THE VALLEY COMMONS
            Marketplace — minimal wrap, editorial
        ═══════════════════════════════════════════ */}
        <section className="relative min-h-[120vh] flex flex-col justify-center px-6 md:px-16 max-w-6xl mx-auto py-24">
          <div className="space-y-4 bg-black/[0.70] p-8 md:p-12 rounded-2xl backdrop-blur-xl border border-white/[0.06] shadow-2xl">
            <p className="hud-mono text-amber-400 tracking-widest text-[10px]">
              L-08 · 02:27 · THE VALLEY COMMONS
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-normal text-neutral-100 leading-tight">
              Crafted in the Valley.
            </h2>
            <p className="text-neutral-400 text-sm md:text-base leading-relaxed max-w-2xl">
              Everything in House of Hulda comes from local Himalayan hands. Pure wool handlooms, raw wildflower honey, carved deodar keepsakes.
            </p>
            <Marketplace />
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            L-09: 06:05 — DAWN & INVITATION
            Full-bleed. No box. Text on first light.
        ═══════════════════════════════════════════ */}
        <section className="relative h-[100vh] flex flex-col justify-center items-center px-8 text-center">
          <div className="absolute inset-x-0 inset-y-0 bg-gradient-to-b from-black/70 via-black/25 to-black/80 pointer-events-none" />
          <div className="relative space-y-7 max-w-xl">
            <p className="hud-mono text-amber-300 tracking-widest text-[10px]">
              L-09 · 06:05 · FIRST LIGHT
            </p>
            <h2 className="font-serif text-5xl md:text-7xl font-normal text-white leading-tight"
              style={{ textShadow: '0 2px 48px rgba(0,0,0,0.7), 0 0 80px rgba(220,160,80,0.2)' }}>
              Sunrise at 06:14.
            </h2>
            <p className="text-neutral-100/90 text-base md:text-lg leading-relaxed"
              style={{ textShadow: '0 1px 16px rgba(0,0,0,0.8)' }}>
              One secluded residence. One private telescope.<br />
              Eighteen wonders you will remember for the rest of your life.
            </p>

            <Link
              href="/book"
              scroll={false}
              className="pointer-events-auto relative group overflow-hidden px-10 py-4 border border-amber-500/60 bg-black/70 backdrop-blur-xl text-white hud-mono text-xs uppercase tracking-widest hover:border-amber-400 transition-all duration-[600ms] inline-block shadow-2xl rounded-full"
            >
              <span className="relative z-10 transition-colors duration-[600ms] group-hover:text-black font-bold">Reserve The Stay</span>
              <div className="absolute inset-0 bg-amber-400 transform translate-y-full group-hover:translate-y-0 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] z-0" />
            </Link>
          </div>
        </section>

      </div>

      {/* Celestial Deity Inspection Drawer */}
      {selectedStar && (
        <StarCard star={selectedStar} onClose={() => setSelectedStar(null)} />
      )}
    </main>
  )
}
