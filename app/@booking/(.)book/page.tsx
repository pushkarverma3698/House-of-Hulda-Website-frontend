'use client'

import BookPage from '@/app/book/page'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BookingIntercept() {
  const router = useRouter()

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0f17] overflow-y-auto animate-in slide-in-from-bottom-10 fade-in duration-500">
      {/* Intercept overlay close button to prevent hard navigation to / */}
      <button 
        onClick={() => router.back()} 
        className="fixed top-8 right-8 text-white/60 hover:text-amber-500 font-mono tracking-widest text-xs uppercase z-[110] transition-colors flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-xl hover:bg-white/10 hover:scale-105"
      >
        Close <span className="text-lg leading-none mb-[2px]">✕</span>
      </button>
      
      {/* Render the full book page inside the modal wrapper */}
      <div className="relative z-[100]">
        <BookPage />
      </div>
    </div>
  )
}
