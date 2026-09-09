'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { whatsappLink } from '@/lib/site-config'
import Image from 'next/image'

const PRODUCTS = [
  {
    id: 'shawl',
    name: 'Kullu Heritage Shawl',
    provenance: 'Hand-loomed in Rumsu · Pure Himalayan Wool',
    description: 'Woven on traditional handlooms using pure Himalayan wool. Each pattern tells a story of the valley passed down through generations of Rumsu weavers.',
    price: '₹4,500',
    image: '/images/artisan/shawl.jpg'
  },
  {
    id: 'honey',
    name: 'Raw Forest Honey',
    provenance: 'Wild Alpine Flora · Cold Extracted',
    description: 'Harvested from high-altitude wild flora in the upper Parvati & Kullu forests. Cold-extracted, unheated, and completely unprocessed.',
    price: '₹850',
    image: '/images/artisan/honey.jpg'
  },
  {
    id: 'deodar-artifact',
    name: 'Carved Deodar Box',
    provenance: 'Carved by Master Hemraj · Aged Cedar',
    description: 'Hand-carved from aged Deodar cedar wood without nails or screws. Emits a natural, calming woody fragrance that persists for decades.',
    price: '₹2,800',
    image: '/images/artisan/deodar.jpg'
  }
]

export function Marketplace() {
  const [activeProduct, setActiveProduct] = useState<typeof PRODUCTS[0] | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!activeProduct) return
    window.dispatchEvent(new CustomEvent('app-modal-open'))
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveProduct(null)
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      window.dispatchEvent(new CustomEvent('app-modal-close'))
      window.removeEventListener('keydown', handleKey)
    }
  }, [activeProduct])

  const handleOrder = (product: typeof PRODUCTS[0]) => {
    const message = `Hi, I'm interested in purchasing the ${product.name} (${product.price}) from the House of Hulda marketplace.`
    window.open(whatsappLink(message), '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-3 md:pb-0 md:grid md:grid-cols-3 md:gap-6 mt-6 md:mt-8 pointer-events-auto [scrollbar-width:none]">
        {PRODUCTS.map(product => (
          <button 
            key={product.id}
            onClick={() => setActiveProduct(product)}
            className="w-[72vw] sm:w-[50vw] md:w-auto shrink-0 md:shrink group relative flex flex-col text-left overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:border-amber-400/50 hover:shadow-[0_0_25px_rgba(245,158,11,0.15)] transition-all duration-300"
          >
            <div className="aspect-[4/3] md:aspect-square overflow-hidden bg-neutral-900 relative">
              <Image 
                src={product.image} 
                alt={product.name}
                fill
                className="object-cover opacity-90 group-hover:opacity-100 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            <div className="p-4 space-y-1">
              <span className="hud-mono text-[9px] text-amber-400/80 uppercase tracking-wider block">
                {product.provenance}
              </span>
              <h3 className="font-serif text-lg text-white group-hover:text-amber-200 transition-colors">
                {product.name}
              </h3>
              <p className="font-mono text-sm text-amber-400 font-semibold">{product.price}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Slide-over Drawer & Backdrop (teleported to body) */}
      {mounted && createPortal(
        <>
          <div 
            className={`fixed inset-y-0 right-0 w-full md:w-[480px] bg-[#07090e]/95 backdrop-blur-2xl border-l border-white/10 z-[100] transform transition-transform duration-500 ease-out flex flex-col pointer-events-auto shadow-2xl ${
              activeProduct ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {activeProduct && (
              <>
                {/* Mobile drag handle */}
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-3 md:hidden" />

                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <div>
                    <span className="hud-mono text-[10px] tracking-widest uppercase text-amber-400">Artisan Reserve</span>
                    <p className="hud-mono text-[9px] text-cream/40 uppercase mt-0.5">Rumsu Commons</p>
                  </div>
                  <button 
                    onClick={() => setActiveProduct(null)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 hover:border-amber-400 text-cream/80 hover:text-white transition-all text-xs font-mono group"
                  >
                    <span>✕</span>
                    <span className="hidden sm:inline-block text-[9px] text-amber-300/80 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 group-hover:border-amber-400/40">ESC</span>
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  <div className="w-full aspect-square relative">
                    <Image 
                      src={activeProduct.image} 
                      alt={activeProduct.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-8">
                    <span className="hud-mono text-[10px] text-amber-400 uppercase tracking-widest block mb-2">
                      {activeProduct.provenance}
                    </span>
                    <h3 className="font-serif text-3xl mb-4 text-cream">{activeProduct.name}</h3>
                    <p className="text-neutral-300 leading-relaxed mb-8 font-light text-sm sm:text-base">
                      {activeProduct.description}
                    </p>
                    <div className="flex items-end justify-between mb-8 pb-8 border-b border-white/10">
                      <div>
                        <p className="text-xs text-neutral-400 uppercase tracking-widest mb-1">Direct Artisan Price</p>
                        <p className="font-mono text-2xl text-amber-400 font-bold">{activeProduct.price}</p>
                      </div>
                      <p className="text-[11px] text-neutral-400 uppercase tracking-widest text-right leading-snug">
                        Shipped directly from Rumsu<br/>(3-5 Days across India)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-white/10 bg-black/80 backdrop-blur-md">
                  <button 
                    onClick={() => handleOrder(activeProduct)}
                    className="w-full py-4 rounded-xl bg-amber-400 text-black font-mono text-xs uppercase tracking-widest font-bold hover:bg-amber-300 transition-all shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Order via Host WhatsApp</span>
                    <span>→</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Backdrop overlay */}
          {activeProduct && (
            <div 
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90] pointer-events-auto animate-in fade-in duration-300"
              onClick={() => setActiveProduct(null)}
            />
          )}
        </>,
        document.body
      )}
    </>
  )
}
