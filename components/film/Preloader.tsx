'use client'

import { useEffect, useState } from 'react'

export function Preloader({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Simulate initial asset & WebGL compilation loading
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsLoaded(true)
            onComplete?.()
          }, 400)
          return 100
        }
        return prev + Math.floor(Math.random() * 15) + 5
      })
    }, 120)

    return () => clearInterval(interval)
  }, [onComplete])

  if (isLoaded) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-center bg-black px-8 md:px-24 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        progress >= 100 ? 'opacity-0 scale-105 pointer-events-none blur-md' : 'opacity-100 scale-100 blur-0'
      }`}
    >
      <div className="max-w-md space-y-3">
        <div className="overflow-hidden">
          <p className="font-mono text-xs tracking-widest text-amber-500 uppercase animate-[steamRise_2s_ease-out_forwards]">
            RUMSU OBSERVATORY · SYSTEM BOOT
          </p>
        </div>
        
        <div className="overflow-hidden">
          <p className="font-mono text-[10px] text-white/40 tracking-widest uppercase delay-100">
            32.1198° N, 77.1731° E · ELEV 2,180 M
          </p>
        </div>

        <div className="overflow-hidden">
          <p className="font-mono text-[10px] text-white/30 tracking-widest uppercase delay-200">
            12 OCT · SUNSET 18:04 · ASTRO DARK 19:41
          </p>
        </div>

        {/* 1px Horizon Line Loader */}
        <div className="relative w-full max-w-[200px] h-[1px] bg-white/10 mt-8 overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-white/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="font-mono text-xs text-white/30 tracking-widest mt-2">
          {progress.toString().padStart(3, '0')}%
        </p>
      </div>
    </div>
  )
}
