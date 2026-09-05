'use client'

import { useState } from 'react'
import { whatsappLink } from '@/lib/site-config'
import Image from 'next/image'

const PRODUCTS = [
  {
    id: 'shawl',
    name: 'Kullu Heritage Shawl',
    description: 'Woven on traditional handlooms using pure Himalayan wool. Each pattern tells a story of the valley.',
    price: '₹4,500',
    image: '/images/artisan/shawl.jpg'
  },
  {
    id: 'honey',
    name: 'Raw Forest Honey',
    description: 'Harvested from high-altitude wild flora. Cold-extracted and completely unprocessed.',
    price: '₹850',
    image: '/images/artisan/honey.jpg'
  },
  {
    id: 'deodar-artifact',
    name: 'Carved Deodar Box',
    description: 'Hand-carved from aged Deodar cedar wood. Emits a natural, calming woody fragrance that lasts for decades.',
    price: '₹2,800',
    image: '/images/artisan/deodar.jpg'
  }
]

export function Marketplace() {
  const [activeProduct, setActiveProduct] = useState<typeof PRODUCTS[0] | null>(null)

  // Was hard-coded to wa.me/919876543210 — a placeholder. Every other WhatsApp
  // entry point on the site already routes through site-config, which is where
  // the real number lives; this path and the booking drawer were the two that
  // did not, so both dead-ended. whatsappLink encodes the message itself.
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
            className="w-[68vw] sm:w-[48vw] md:w-auto shrink-0 md:shrink group relative flex flex-col text-left overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm hover:border-amber-500/50 transition-all duration-300"
          >
            <div className="aspect-[4/3] md:aspect-square overflow-hidden bg-neutral-900 relative">
              <Image 
                src={product.image} 
                alt={product.name}
                fill
                className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <h3 className="font-serif text-lg text-white mb-1">{product.name}</h3>
              <p className="font-mono text-sm text-amber-500">{product.price}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Slide-over Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-[480px] bg-black/95 backdrop-blur-xl border-l border-white/10 z-[100] transform transition-transform duration-500 ease-out flex flex-col pointer-events-auto ${
          activeProduct ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {activeProduct && (
          <>
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="font-mono text-xs tracking-widest uppercase text-amber-500">Artisan Reserve</h2>
              <button 
                onClick={() => setActiveProduct(null)}
                className="text-white hover:text-amber-500 p-2"
              >
                ✕
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
                <h3 className="font-serif text-3xl mb-4">{activeProduct.name}</h3>
                <p className="text-neutral-300 leading-relaxed mb-8">
                  {activeProduct.description}
                </p>
                <div className="flex items-end justify-between mb-8 pb-8 border-b border-white/10">
                  <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Price</p>
                    <p className="font-mono text-2xl text-amber-500">{activeProduct.price}</p>
                  </div>
                  <p className="text-xs text-neutral-500 uppercase tracking-widest text-right">
                    Ships PAN India<br/>(3-5 Days)
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/10 bg-black">
              <button 
                onClick={() => handleOrder(activeProduct)}
                className="w-full py-4 bg-amber-500 text-black font-mono text-xs uppercase tracking-widest font-bold hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
              >
                Order via WhatsApp
              </button>
            </div>
          </>
        )}
      </div>

      {/* Backdrop overlay */}
      {activeProduct && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] pointer-events-auto"
          onClick={() => setActiveProduct(null)}
        />
      )}
    </>
  )
}
