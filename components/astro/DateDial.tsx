'use client'

import React, { useState } from 'react'
import Link from 'next/link'

interface NightPlan {
  id: string
  arrivalDate: string
  nightDate: string
  month: string
  arrivalDay: number
  nightDay: number
  darkSky: string
  moonPct: string
  moonPhase: string
  visibility: 'EXCELLENT' | 'PRISTINE' | 'OPTIMAL' | 'GOOD'
  godsStatus: 'ALL 18 VISIBLE' | '16 VISIBLE' | '14 VISIBLE'
  milkyWay: string
  highlight: string
}

const AUTUMN_NIGHTS: NightPlan[] = [
  {
    id: 'oct-11',
    arrivalDate: '11 OCT',
    nightDate: '12 OCT',
    month: 'OCTOBER',
    arrivalDay: 11,
    nightDay: 12,
    darkSky: '20:17 — 05:02',
    moonPct: '18%',
    moonPhase: 'Waxing Crescent',
    visibility: 'EXCELLENT',
    godsStatus: 'ALL 18 VISIBLE',
    milkyWay: 'BEST 23:30–03:10',
    highlight: 'Galactic core aligns with Chandrakhani crest under pitch darkness.',
  },
  {
    id: 'oct-12',
    arrivalDate: '12 OCT',
    nightDate: '13 OCT',
    month: 'OCTOBER',
    arrivalDay: 12,
    nightDay: 13,
    darkSky: '20:18 — 05:03',
    moonPct: '24%',
    moonPhase: 'Waxing Crescent',
    visibility: 'PRISTINE',
    godsStatus: 'ALL 18 VISIBLE',
    milkyWay: 'BEST 23:25–03:00',
    highlight: 'Orion and Pleiades rise above the orchard ridge at midnight.',
  },
  {
    id: 'oct-18',
    arrivalDate: '18 OCT',
    nightDate: '19 OCT',
    month: 'OCTOBER',
    arrivalDay: 18,
    nightDay: 19,
    darkSky: '20:23 — 05:08',
    moonPct: '58%',
    moonPhase: 'Waxing Gibbous',
    visibility: 'OPTIMAL',
    godsStatus: '16 VISIBLE',
    milkyWay: 'BEST 01:10–04:30',
    highlight: 'Silver mountain peaks illuminated by moonset before galaxy reveal.',
  },
  {
    id: 'oct-25',
    arrivalDate: '25 OCT',
    nightDate: '26 OCT',
    month: 'OCTOBER',
    arrivalDay: 25,
    nightDay: 26,
    darkSky: '20:30 — 05:14',
    moonPct: '4%',
    moonPhase: 'New Moon Window',
    visibility: 'PRISTINE',
    godsStatus: 'ALL 18 VISIBLE',
    milkyWay: 'BEST 22:45–03:40',
    highlight: 'True Bortle Class 1 black sky. Deep sky nebulae visible to naked eye.',
  },
  {
    id: 'nov-02',
    arrivalDate: '02 NOV',
    nightDate: '03 NOV',
    month: 'NOVEMBER',
    arrivalDay: 2,
    nightDay: 3,
    darkSky: '20:38 — 05:21',
    moonPct: '12%',
    moonPhase: 'Waxing Crescent',
    visibility: 'EXCELLENT',
    godsStatus: 'ALL 18 VISIBLE',
    milkyWay: 'BEST 22:15–02:50',
    highlight: 'Crisp pre-winter transparency with zero atmospheric haze.',
  },
  {
    id: 'nov-10',
    arrivalDate: '10 NOV',
    nightDate: '11 NOV',
    month: 'NOVEMBER',
    arrivalDay: 10,
    nightDay: 11,
    darkSky: '20:45 — 05:28',
    moonPct: '2%',
    moonPhase: 'Taurus Meteor Peak',
    visibility: 'PRISTINE',
    godsStatus: 'ALL 18 VISIBLE',
    milkyWay: 'BEST 22:00–02:30',
    highlight: 'Taurid fireballs streak over the Pir Panjal snowline.',
  }
]

export function DateDial() {
  const [selectedNightId, setSelectedNightId] = useState<string>('oct-11')
  const activePlan = AUTUMN_NIGHTS.find((p) => p.id === selectedNightId) || AUTUMN_NIGHTS[0]

  return (
    <section className="relative my-0 w-full max-w-5xl mx-auto px-0 md:px-4 pointer-events-auto">
      <div className="relative overflow-hidden p-4 sm:p-6 md:p-8 rounded-3xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
        
        {/* Subtle Ambient Radial Warmth */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* 1. Header (Human Typography + Instrument Seasoning) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              <span className="hud-mono text-xs tracking-[0.25em] text-amber-400 uppercase font-semibold">
                PLAN YOUR NIGHT · BORTLE CLASS 1
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-normal text-cream leading-tight tracking-tight">
              Look Up Into The High Sky.
            </h2>
            <p className="text-cream/80 text-sm md:text-base font-body max-w-xl leading-relaxed">
              Select your mountain dates. We compute the exact celestial darkness and alignment over Naggar Ridge at 2,180m elevation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="hud-mono text-[10px] text-cream/50 uppercase tracking-widest">ELEVATION</span>
            <span className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 hud-mono text-xs font-bold">
              2,180 M
            </span>
          </div>
        </div>

        {/* 2. Date Selection (Arrival & Night Inputs) */}
        <div className="py-6">
          <span className="hud-mono text-[10px] text-amber-400/80 uppercase tracking-widest block mb-3 font-semibold">
            Choose Stargazing Window
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {AUTUMN_NIGHTS.map((plan) => {
              const isSelected = plan.id === selectedNightId
              return (
                <button
                  key={plan.id}
                  onClick={() => setSelectedNightId(plan.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between min-h-[96px] group ${
                    isSelected
                      ? 'border-amber-400 bg-amber-400/15 shadow-[0_0_24px_rgba(245,158,11,0.3)] scale-[1.02]'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="hud-mono text-[8.5px] uppercase tracking-wider text-cream/40">
                      {plan.month}
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-transparent'}`} />
                  </div>

                  <div className="my-1.5">
                    <div className="hud-mono text-[9px] text-cream/50 uppercase">ARRIVAL</div>
                    <div className={`font-display text-lg font-medium ${isSelected ? 'text-amber-300' : 'text-cream'}`}>
                      {plan.arrivalDate}
                    </div>
                  </div>

                  <div className="hud-mono text-[9px] text-amber-300/80">
                    NIGHT: {plan.nightDate}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 3. Ephemeris Telemetry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 py-2">
          {/* Card 1: Dark Sky */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
            <span className="hud-mono text-[9px] uppercase tracking-widest text-cream/50">DARK SKY</span>
            <div className="my-2">
              <span className="font-mono text-lg sm:text-xl font-bold text-amber-300">{activePlan.darkSky}</span>
            </div>
            <span className="text-[10px] text-cream/60 font-body">Astronomical darkness</span>
          </div>

          {/* Card 2: Moon */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
            <span className="hud-mono text-[9px] uppercase tracking-widest text-cream/50">MOON</span>
            <div className="my-2 flex items-baseline gap-2">
              <span className="font-mono text-lg sm:text-xl font-bold text-cream">{activePlan.moonPct}</span>
              <span className="text-[10px] font-serif italic text-amber-200/80">{activePlan.moonPhase}</span>
            </div>
            <span className="text-[10px] text-cream/60 font-body">Minimal light wash</span>
          </div>

          {/* Card 3: Visibility */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
            <span className="hud-mono text-[9px] uppercase tracking-widest text-cream/50">VISIBILITY</span>
            <div className="my-2">
              <span className="hud-mono text-lg sm:text-xl font-bold text-emerald-400">{activePlan.visibility}</span>
            </div>
            <span className="text-[10px] text-cream/60 font-body">Bortle Class 1 rating</span>
          </div>

          {/* Card 4: 18 Gods */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
            <span className="hud-mono text-[9px] uppercase tracking-widest text-cream/50">18 GODS</span>
            <div className="my-2">
              <span className="hud-mono text-lg sm:text-xl font-bold text-amber-300">{activePlan.godsStatus}</span>
            </div>
            <span className="text-[10px] text-cream/60 font-body">Above valley peaks</span>
          </div>

          {/* Card 5: Milky Way */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between col-span-2 md:col-span-1">
            <span className="hud-mono text-[9px] uppercase tracking-widest text-cream/50">MILKY WAY</span>
            <div className="my-2">
              <span className="font-mono text-sm sm:text-base font-bold text-cream">{activePlan.milkyWay}</span>
            </div>
            <span className="text-[10px] text-cream/60 font-body">Galactic core window</span>
          </div>
        </div>

        {/* 4. Emotional Invitation & Killer Hospitality CTA */}
        <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/15 via-white/[0.03] to-transparent border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1">
            <p className="font-serif italic text-xl sm:text-2xl text-cream font-normal leading-snug">
              &ldquo;Bring a blanket. We&apos;ll light the fire.&rdquo;
            </p>
            <p className="text-xs sm:text-sm text-amber-200/80 font-body">
              {activePlan.highlight}
            </p>
          </div>

          <Link
            href={`/book?date=${encodeURIComponent(activePlan.arrivalDate)}`}
            className="w-full md:w-auto px-8 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-ink font-semibold hud-mono text-xs tracking-widest uppercase transition-all duration-300 shadow-[0_0_24px_rgba(245,158,11,0.4)] hover:shadow-[0_0_32px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 text-center shrink-0 flex items-center justify-center gap-2 group"
          >
            <span>Reserve This Night</span>
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>

      </div>
    </section>
  )
}
