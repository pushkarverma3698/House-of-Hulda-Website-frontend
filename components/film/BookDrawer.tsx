'use client'

import { useEffect, useState } from 'react'
import { getLenis } from '@/app/providers'

const PACKAGES = [
  {
    id: 'whole-home',
    title: 'Whole-Home Sanctuary',
    desc: 'The complete estate. Both suites, private balcony, full kitchen access, and undisturbed peace.',
    price: '₹14,500/night',
    capacity: 'Up to 6 Guests'
  },
  {
    id: 'deodar-suite',
    title: 'Deodar Heritage Suite',
    desc: 'The ground floor timber room with attached bath and direct courtyard access.',
    price: '₹7,500/night',
    capacity: '2 Guests'
  },
  {
    id: 'stargazer-loft',
    title: 'Stargazer Shared Loft',
    desc: 'The attic wooden suite with the famous balcony and valley view.',
    price: '₹8,500/night',
    capacity: '2 Guests'
  },
  {
    id: 'creative-residency',
    title: 'Creative Residency (7+ Days)',
    desc: 'Long-term stays for writers, artists, and remote workers.',
    price: 'Custom Pricing',
    capacity: '1-2 Guests'
  }
]

export function BookDrawer({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const lenis = getLenis()
    lenis?.stop()

    return () => {
      lenis?.start()
    }
  }, [])

  const handleBook = (packageTitle: string) => {
    const text = encodeURIComponent(`Hi, I would like to reserve the ${packageTitle} at House of Hulda. Could you check dates for me?`)
    window.open(`https://wa.me/919876543210?text=${text}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end pointer-events-auto">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={`relative w-full sm:w-[480px] h-[100dvh] sm:h-[95vh] sm:mr-4 sm:rounded-2xl bg-black border border-white/10 flex flex-col shadow-2xl transform transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${mounted ? 'translate-x-0 sm:translate-y-0' : 'translate-y-full sm:translate-y-0 sm:translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="font-mono text-xs tracking-widest uppercase text-amber-500">Reserve Your Stay</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-amber-500 p-2"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <p className="text-neutral-300 text-sm leading-relaxed">
            One room. One balcony. High above Naggar. Select your sanctuary to request dates via direct WhatsApp dispatch.
          </p>

          {/* Lunar Cycle & Dark Sky Indicator */}
          <div className="bg-black border border-amber-500/30 p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="hud-mono text-xs tracking-widest uppercase text-amber-500">
                Stargazing Forecast
              </span>
              <span className="text-[10px] text-amber-400/80 uppercase font-mono px-2 py-0.5 border border-amber-500/20 rounded bg-amber-500/5">
                Bortle Class 1
              </span>
            </div>
            
            <div className="flex justify-between items-center px-2 py-3 bg-white/5 rounded-lg border border-white/5">
              <div className="flex flex-col items-center opacity-40">
                <span className="text-xl">🌕</span>
                <span className="hud-mono text-[9px] mt-1">JUL 20</span>
              </div>
              <div className="flex flex-col items-center opacity-60">
                <span className="text-xl">🌗</span>
                <span className="hud-mono text-[9px] mt-1">JUL 28</span>
              </div>
              <div className="flex flex-col items-center scale-110 shadow-[0_0_15px_rgba(245,158,11,0.2)] rounded-full">
                <span className="text-2xl text-black drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]">🌑</span>
                <span className="hud-mono text-[10px] mt-1 text-amber-400 font-bold">AUG 4</span>
              </div>
              <div className="flex flex-col items-center opacity-60">
                <span className="text-xl">🌓</span>
                <span className="hud-mono text-[9px] mt-1">AUG 12</span>
              </div>
            </div>
            
            <p className="text-xs text-neutral-400 font-body leading-relaxed">
              <strong className="text-neutral-200">Dark Sky Window: Aug 1 - Aug 7.</strong> Best visibility for the Milky Way core and the 18 Gods of Chandrakhani. Book early.
            </p>
          </div>
          
          {PACKAGES.map(pkg => (
            <div key={pkg.id} className="border border-white/10 p-6 hover:border-amber-500/50 transition-colors bg-white/5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-serif text-xl">{pkg.title}</h3>
                <span className="font-mono text-xs text-amber-500 whitespace-nowrap ml-4">{pkg.price}</span>
              </div>
              <p className="text-neutral-400 text-sm mb-4">{pkg.desc}</p>
              <div className="flex items-center justify-between mt-6">
                <span className="font-mono text-xs text-neutral-500 tracking-widest uppercase">{pkg.capacity}</span>
                <button 
                  onClick={() => handleBook(pkg.title)}
                  className="px-6 py-2 border border-white/20 text-white font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                >
                  Check Dates
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
