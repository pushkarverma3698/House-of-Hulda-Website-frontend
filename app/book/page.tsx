'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PACKAGES } from '@/content/packages'

const DATES = [
  "Fri 11 Sep",
  "Fri 18 Sep",
  "Sat 26 Sep",
  "Fri 2 Oct",
  "Sat 10 Oct"
]

export default function BookPage() {
  const [selectedPkgIndex, setSelectedPkgIndex] = useState(0)
  const [nights, setNights] = useState(2)
  const [dateIndex, setDateIndex] = useState(0)

  // Use the rich data from content/packages.ts but formatted for this dark UI
  const packageKeys = Object.keys(PACKAGES) as (keyof typeof PACKAGES)[]
  const selectedPkg = PACKAGES[packageKeys[selectedPkgIndex]]
  
  const total = selectedPkg.rate * nights

  const handleBook = () => {
    const text = encodeURIComponent(`Hi, I would like to reserve the ${selectedPkg.name} at House of Hulda for ${nights} nights arriving ${DATES[dateIndex]}. Could you check availability?`)
    window.open(`https://wa.me/918284008838?text=${text}`, '_blank')
  }

  return (
    <main className="min-h-screen bg-[#0a0f17] text-white relative flex flex-col items-center py-24 px-6 md:px-12 font-body selection:bg-amber-500 selection:text-black">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <Image src="/images/arrival-golden-hour.jpg" alt="Background" fill className="object-cover blur-[60px]" />
        <div className="absolute inset-0 bg-black/80" />
      </div>

      <Link href="/" className="absolute top-8 left-8 text-white/60 hover:text-amber-500 font-mono tracking-widest text-xs uppercase z-50 transition-colors flex items-center gap-2">
        <span className="text-lg leading-none mb-[2px]">←</span> Return to Experience
      </Link>

      <div className="relative z-10 w-full max-w-[1040px] mt-12">
        <div className="mb-12 text-center md:text-left">
          <h1 className="font-display text-[clamp(36px,5.4vw,72px)] font-medium leading-[1.04] tracking-[-0.015em]">Every stay is a different kind of quiet.</h1>
          <p className="mt-4 font-display text-[clamp(20px,2.4vw,28px)] italic text-white/80">Choose yours.</p>
        </div>

        <div className="w-full rounded-[20px] border border-white/10 bg-[rgba(18,15,12,0.6)] p-[clamp(20px,3vw,34px)] shadow-[0_40px_120px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          {/* Package Tabs */}
          <div className="grid gap-[12px] grid-cols-2 md:grid-cols-4">
            {packageKeys.map((key, idx) => {
              const pkg = PACKAGES[key]
              const isSelected = idx === selectedPkgIndex
              return (
                <button
                  key={key}
                  onClick={() => setSelectedPkgIndex(idx)}
                  className={`relative overflow-hidden rounded-[13px] border border-white/10 px-[16px] pb-[18px] pt-[16px] text-left transition-all ${
                    isSelected ? 'bg-white/10' : 'bg-white/[0.03] hover:bg-white/[0.06]'
                  }`}
                >
                  {isSelected && (
                    <span className="pointer-events-none absolute inset-0 rounded-[13px] border-[1.5px] border-[rgba(217,154,78,0.9)] shadow-[0_0_0_1px_rgba(217,154,78,0.5),inset_0_0_30px_rgba(217,154,78,0.16)]" />
                  )}
                  <div className={`font-display text-[18px] leading-[1.1] ${isSelected ? 'text-white' : 'text-white/80'}`}>{pkg.name}</div>
                  <div className={`mt-[8px] text-[10px] uppercase tracking-[0.12em] ${isSelected ? 'text-amber-400/80' : 'text-white/50'}`}>{pkg.tag}</div>
                </button>
              )
            })}
          </div>

          {/* Selected Package Details */}
          <div className="mt-8 grid items-stretch gap-6 lg:gap-12 lg:grid-cols-[1fr_1fr]">
            <div className="relative min-h-[300px] overflow-hidden rounded-[14px]">
              <Image src={selectedPkg.image} alt={selectedPkg.name} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
            
            <div className="flex flex-col">
              <h3 className="m-0 font-display text-[clamp(26px,3vw,38px)] font-medium leading-[1.05] text-white">{selectedPkg.name}</h3>
              <p className="mb-0 mt-4 text-[15px] font-light leading-[1.65] text-white/80">{selectedPkg.blurb}</p>
              
              <div className="mt-5 flex flex-wrap gap-2">
                {selectedPkg.inclusions.map(inc => (
                  <span key={inc} className="rounded-full border border-white/15 px-[11px] py-[5px] text-[10px] tracking-[0.08em] text-white/75 bg-white/5">
                    {inc}
                  </span>
                ))}
              </div>

              {/* Calculator UI */}
              <div className="mt-8 flex flex-wrap items-end gap-6 bg-white/[0.03] p-5 rounded-[14px] border border-white/5">
                <label className="flex flex-col gap-2">
                  <span className="text-[9.5px] uppercase tracking-[0.2em] text-white/55">Arrive</span>
                  <select 
                    value={dateIndex}
                    onChange={(e) => setDateIndex(Number(e.target.value))}
                    className="cursor-pointer rounded-[9px] border border-white/20 bg-white/10 px-[12px] py-[10px] font-body text-[14px] text-white outline-none focus:border-amber-500/50"
                  >
                    {DATES.map((date, i) => (
                      <option key={i} value={i} className="text-black">{date}</option>
                    ))}
                  </select>
                </label>
                <div className="flex flex-col gap-2">
                  <span className="text-[9.5px] uppercase tracking-[0.2em] text-white/55">Nights</span>
                  <div className="flex items-center gap-4 rounded-[9px] border border-white/20 bg-white/10 px-[12px] py-[6px]">
                    <button onClick={() => setNights(Math.max(1, nights - 1))} className="px-2 text-[20px] leading-none text-white/70 hover:text-white">−</button>
                    <span className="min-w-[64px] text-center text-[15px]">{nights} night{nights > 1 ? 's' : ''}</span>
                    <button onClick={() => setNights(nights + 1)} className="px-2 text-[20px] leading-none text-white/70 hover:text-white">+</button>
                  </div>
                </div>
              </div>

              <div className="mt-auto flex flex-wrap items-end justify-between gap-6 pt-8">
                <div>
                  <div className="font-display text-[32px] leading-none text-white">₹{total.toLocaleString('en-IN')}</div>
                  <div className="mt-1.5 text-[10.5px] tracking-[0.1em] text-white/55">
                    ₹{selectedPkg.rate.toLocaleString('en-IN')} / {selectedPkg.rateUnit} · {nights} night{nights > 1 ? 's' : ''} total
                  </div>
                </div>
                <button 
                  onClick={handleBook}
                  className="rounded-full bg-amber-500 px-[28px] py-[15px] text-[12px] font-bold uppercase tracking-[0.14em] text-black shadow-[0_10px_30px_rgba(217,154,78,0.3)] transition-transform hover:scale-[1.03]"
                >
                  Request these dates
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
