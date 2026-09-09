'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface RoomOption {
  id: string
  name: string
  subtitle: string
  capacity: string
  bedrooms: string
  rate: number
  rateUnit: string
  minNights: number
  image: string
  gallery: string[]
  inclusions: string[]
  description: string
  highlight: string
}

const ROOM_OPTIONS: RoomOption[] = [
  {
    id: 'home',
    name: 'The Whole House',
    subtitle: 'Private kathkuni estate for families and creative cohorts',
    capacity: 'Up to 6 guests',
    bedrooms: '3 bedrooms · 2 baths',
    rate: 9000,
    rateUnit: 'estate / night',
    minNights: 2,
    image: '/images/arrival-golden-hour.jpg',
    gallery: ['/images/arrival-golden-hour.jpg', '/images/arrival_courtyard_dusk.jpg', '/images/cafe-attic.jpg'],
    inclusions: [
      'Entire kathkuni house & private grounds',
      'Attic café & indoor woodstove hearth',
      'Farm-fresh Himachali breakfast included',
      'Orchard bonfire & telescope night access',
      'Dedicated mountain host & cook assistance',
    ],
    description: 'Take the entire century-old stone-and-deodar sanctuary. Built without nails, interlocking dry slate and fragrant timber that flexes with the mountain. The valley below is completely yours.',
    highlight: 'Recommended for families & retreats seeking absolute mountain solitude.',
  },
  {
    id: 'room',
    name: 'The Kathkuni Room',
    subtitle: 'Mud plaster walls, deodar beams & warm brass lantern light',
    capacity: '2 guests',
    bedrooms: '1 King Bed · Ensuite Bath',
    rate: 2800,
    rateUnit: 'room / night',
    minNights: 1,
    image: '/images/room-lantern.jpg',
    gallery: ['/images/room-lantern.jpg', '/images/room-morning.jpg', '/images/room-rustic.jpg'],
    inclusions: [
      'Private kathkuni heritage bedroom',
      'Himachali breakfast with orchard honey',
      'Mountain valley & pine forest view',
      'Continuous hot water & artisan toiletries',
      'Daytime access to attic café & library',
    ],
    description: 'Hand-plastered local mud walls that insulate against mountain frost, fitted with hand-woven Himachali wool bedding, deodar cedar joinery, and a quiet window overlooking Rumsu village.',
    highlight: 'The classic Himalayan sanctuary experience.',
  },
  {
    id: 'loft',
    name: 'The Attic Loft',
    subtitle: 'Under the deodar eaves in the top-floor café loft',
    capacity: '1–2 guests',
    bedrooms: 'Loft Bed · Shared Bath',
    rate: 900,
    rateUnit: 'guest / night',
    minNights: 1,
    image: '/images/cafe-attic.jpg',
    gallery: ['/images/cafe-attic.jpg', '/images/room-guitar.jpg'],
    inclusions: [
      'Cosy bed tucked under deodar rafters',
      'Himachali morning tea & light breakfast',
      'Direct floor cushion café access',
      'Starry skylight views over Pir Panjal',
      'High-speed wifi & community bonfire',
    ],
    description: 'A bohemian mountain hideaway under the sloped slate roof. Wake to morning cedar light and café aromas, with floor-cushion seating and a guitar resting in the corner.',
    highlight: 'Ideal for solo hikers and mindful wanderers.',
  },
  {
    id: 'residency',
    name: 'Creative Residency',
    subtitle: 'A slower, longer stay for writers, designers and deep thinkers',
    capacity: '1–2 guests',
    bedrooms: 'Private Room · Dedicated Work Desk',
    rate: 2400,
    rateUnit: 'room / night',
    minNights: 5,
    image: '/images/workation-desk.jpg',
    gallery: ['/images/workation-desk.jpg', '/images/journal-window.jpg', '/images/room-day.jpg'],
    inclusions: [
      'Private room with solid timber writing desk',
      'High-speed optical fibre internet & power backup',
      'Daily breakfast & slow-cooked hearth dinner',
      'Unlimited mountain herbal teas & pour-overs',
      'Quiet orchard work spots & library access',
    ],
    description: 'Designed for deep uninterrupted creative focus. Days empty out so the page can fill. Mountain silence punctuated only by wind in the apple branches and pine crackle.',
    highlight: 'Longer stays of 5+ nights with curated half-board dining.',
  },
]

const UPCOMING_DATES = [
  '11 Oct 2026',
  '12 Oct 2026',
  '18 Oct 2026',
  '25 Oct 2026',
  '02 Nov 2026',
  '10 Nov 2026',
]

const HOSPITALITY_EXTRAS = [
  { id: 'stargazing', name: 'Guided Stargazing & High-Power Telescope', price: 500, detail: 'Session with our resident astronomer on Naggar Ridge' },
  { id: 'walk', name: 'Kathkuni Architectural Walk with Village Elder', price: 600, detail: '2-hour discovery of nail-less timber joinery craft' },
  { id: 'siddu', name: 'Fresh Siddu & Local Walnut Ghee Tasting', price: 400, detail: 'Authentic Himachali slow culinary workshop' },
  { id: 'shuttle', name: '4x4 Mountain Jeep Transfer from Naggar Castle', price: 800, detail: 'Scenic ascent up to 2,180m elevation' },
]

function BookContent() {
  const searchParams = useSearchParams()
  const [selectedRoomId, setSelectedRoomId] = useState<string>('home')
  const [arrivalDate, setArrivalDate] = useState<string>(UPCOMING_DATES[0])
  const [nights, setNights] = useState<number>(2)
  const [guestsCount, setGuestsCount] = useState<number>(2)
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  const [guestName, setGuestName] = useState<string>('')
  const [guestPhone, setGuestPhone] = useState<string>('')

  // Prepopulate room or date if query params are present
  useEffect(() => {
    const roomParam = searchParams.get('room')
    if (roomParam && ROOM_OPTIONS.some((r) => r.id === roomParam)) {
      setSelectedRoomId(roomParam)
    }
    const dateParam = searchParams.get('date')
    if (dateParam) {
      setArrivalDate(dateParam)
    }
  }, [searchParams])

  const activeRoom = ROOM_OPTIONS.find((r) => r.id === selectedRoomId) || ROOM_OPTIONS[0]

  const toggleExtra = (extraId: string) => {
    setSelectedExtras((prev) =>
      prev.includes(extraId) ? prev.filter((id) => id !== extraId) : [...prev, extraId]
    )
  }

  const extrasCost = useMemo(() => {
    return selectedExtras.reduce((sum, id) => {
      const found = HOSPITALITY_EXTRAS.find((e) => e.id === id)
      return sum + (found ? found.price : 0)
    }, 0)
  }, [selectedExtras])

  const roomSubtotal = activeRoom.rate * nights
  const grandTotal = roomSubtotal + extrasCost

  const handleReserve = (e: React.FormEvent) => {
    e.preventDefault()
    const extrasList = selectedExtras
      .map((id) => HOSPITALITY_EXTRAS.find((e) => e.id === id)?.name)
      .filter(Boolean)
      .join(', ')

    const message = `Hello House of Hulda,

I would like to make a direct reservation:
• Stay: ${activeRoom.name}
• Arrival: ${arrivalDate}
• Duration: ${nights} Night(s)
• Guests: ${guestsCount}
${extrasList ? `• Extras: ${extrasList}\n` : ''}• Estimated Total: ₹${grandTotal.toLocaleString('en-IN')}

Guest Name: ${guestName || 'Valued Guest'}
Contact: ${guestPhone || 'Not provided'}

Could you please confirm availability and transfer details?`

    const url = `https://wa.me/918284008838?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <main className="min-h-screen bg-[#070b12] text-cream relative py-12 md:py-20 px-4 sm:px-8 md:px-12 font-body selection:bg-amber-400 selection:text-black">
      {/* Ambient background atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
        <Image src="/images/arrival-golden-hour.jpg" alt="Estate Ambient" fill className="object-cover blur-[80px]" />
        <div className="absolute inset-0 bg-[#05080e]/85" />
      </div>

      {/* Top Header Navigation */}
      <div className="relative z-20 max-w-6xl mx-auto flex items-center justify-between pb-8 border-b border-white/10">
        <Link 
          href="/"
          className="hud-mono text-xs uppercase tracking-widest text-cream/60 hover:text-amber-300 transition-colors flex items-center gap-2 group"
        >
          <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">←</span>
          Return to Experience
        </Link>
        <div className="hud-mono text-[10px] text-amber-400/90 tracking-widest uppercase flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          Direct Estate Reservation · 2,180M
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto mt-8 sm:mt-12 space-y-12">
        
        {/* Page Hero: Human Typography (The Meal) */}
        <div className="space-y-3 text-center md:text-left">
          <p className="hud-mono text-xs text-amber-400 tracking-[0.25em] uppercase font-semibold">
            CHOOSE YOUR STAY
          </p>
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-cream">
            Somewhere above the noise,<br />
            <span className="italic font-serif text-amber-200/90 font-light">a light is on for you.</span>
          </h1>
          <p className="text-cream/80 text-sm sm:text-base font-body max-w-2xl leading-relaxed">
            Every room at House of Hulda is built with hand-cut metamorphic stone, interlocking deodar cedar, and natural mud plaster. Select your sanctuary below.
          </p>
        </div>

        {/* Dignified Direct Booking Value Proposition (No Tacky Banners) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="hud-mono text-[10px] text-amber-400 uppercase tracking-widest font-semibold">
              ✦ The Direct Reservation Promise
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-1">
            <div className="space-y-1">
              <h4 className="font-display text-sm sm:text-base text-cream font-medium">Best Available Rate</h4>
              <p className="text-xs text-cream/60 font-body leading-relaxed">Guaranteed best price with zero third-party OTA commission markup.</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-display text-sm sm:text-base text-cream font-medium">Himachali Breakfast</h4>
              <p className="text-xs text-cream/60 font-body leading-relaxed">Hot homemade siddu, fresh orchard honey, walnuts & churned butter included.</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-display text-sm sm:text-base text-cream font-medium">Mountain Arrival Help</h4>
              <p className="text-xs text-cream/60 font-body leading-relaxed">Direct coordination for 4x4 mountain shuttle from Naggar castle or valley bus stand.</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-display text-sm sm:text-base text-cream font-medium">Resident Host & Guide</h4>
              <p className="text-xs text-cream/60 font-body leading-relaxed">Direct WhatsApp concierge for stargazing forecasts, trail routes & hearth dinners.</p>
            </div>
          </div>
        </div>

        {/* Large Photographic Room Selector Cards */}
        <div className="space-y-4">
          <h3 className="hud-mono text-xs uppercase tracking-widest text-cream/60">
            Step 1: Choose Your Accommodation
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {ROOM_OPTIONS.map((room) => {
              const isSelected = room.id === selectedRoomId
              return (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`group relative rounded-3xl overflow-hidden border transition-all duration-500 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-400 bg-white/[0.04] shadow-[0_0_35px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50'
                      : 'border-white/10 bg-black/40 hover:border-white/25 hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Photo Container */}
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-black/60">
                    <Image
                      src={room.image}
                      alt={room.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070b12] via-transparent to-black/30" />
                    
                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 hud-mono text-[9px] text-cream/90 uppercase tracking-wider">
                        {room.capacity}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-400/40 hud-mono text-[10px] text-amber-300 font-bold uppercase">
                        ₹{room.rate.toLocaleString('en-IN')} / {room.rateUnit}
                      </span>
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute bottom-3 right-4 px-3 py-1 rounded-full bg-amber-400 text-black font-mono text-[9.5px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                        <span>Selected</span>
                        <span>✓</span>
                      </div>
                    )}
                  </div>

                  {/* Room Details */}
                  <div className="p-6 sm:p-7 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="hud-mono text-[10px] text-amber-400/80 uppercase tracking-widest">
                        {room.bedrooms}
                      </div>
                      <h3 className="font-display text-2xl sm:text-3xl font-normal text-cream group-hover:text-amber-200 transition-colors">
                        {room.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-cream/75 font-body leading-relaxed">
                        {room.description}
                      </p>
                    </div>

                    {/* Inclusions Tags */}
                    <div className="space-y-3 pt-2">
                      <div className="flex flex-wrap gap-1.5">
                        {room.inclusions.map((inc, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] text-cream/70 font-body"
                          >
                            ✓ {inc}
                          </span>
                        ))}
                      </div>
                      <p className="text-[11px] font-serif italic text-amber-200/80">
                        ✦ {room.highlight}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 5-Step Continuous Reservation Module */}
        <div className="p-6 sm:p-10 rounded-3xl bg-black/60 backdrop-blur-xl border border-white/15 shadow-[0_20px_80px_rgba(0,0,0,0.8)] space-y-8">
          <div className="border-b border-white/10 pb-4">
            <h3 className="hud-mono text-xs uppercase tracking-widest text-amber-400 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Step 2 & 3: Configure Dates, Guests & Experiences
            </h3>
          </div>

          <form onSubmit={handleReserve} className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Arrival Date */}
              <div className="space-y-2">
                <label className="hud-mono text-[10px] uppercase tracking-widest text-cream/60 block">
                  Arrival Date
                </label>
                <select
                  value={arrivalDate}
                  onChange={(e) => setArrivalDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/15 text-cream text-sm font-mono focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  {UPCOMING_DATES.map((date) => (
                    <option key={date} value={date} className="bg-[#070b12] text-cream">
                      {date}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nights */}
              <div className="space-y-2">
                <label className="hud-mono text-[10px] uppercase tracking-widest text-cream/60 block">
                  Duration (Nights)
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setNights((n) => Math.max(activeRoom.minNights, n - 1))}
                    className="w-11 h-11 rounded-2xl bg-white/[0.05] border border-white/15 hover:border-amber-400 text-cream font-mono text-lg flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="font-mono text-base text-cream font-bold min-w-8 text-center">
                    {nights}
                  </span>
                  <button
                    type="button"
                    onClick={() => setNights((n) => n + 1)}
                    className="w-11 h-11 rounded-2xl bg-white/[0.05] border border-white/15 hover:border-amber-400 text-cream font-mono text-lg flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Guests */}
              <div className="space-y-2">
                <label className="hud-mono text-[10px] uppercase tracking-widest text-cream/60 block">
                  Number of Guests
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setGuestsCount((g) => Math.max(1, g - 1))}
                    className="w-11 h-11 rounded-2xl bg-white/[0.05] border border-white/15 hover:border-amber-400 text-cream font-mono text-lg flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="font-mono text-base text-cream font-bold min-w-8 text-center">
                    {guestsCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setGuestsCount((g) => Math.min(8, g + 1))}
                    className="w-11 h-11 rounded-2xl bg-white/[0.05] border border-white/15 hover:border-amber-400 text-cream font-mono text-lg flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Step 4: Hospitality Extras */}
            <div className="space-y-3 pt-2">
              <label className="hud-mono text-[10px] uppercase tracking-widest text-cream/60 block">
                Step 4: Curated Mountain Experiences (Optional)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {HOSPITALITY_EXTRAS.map((extra) => {
                  const isChecked = selectedExtras.includes(extra.id)
                  return (
                    <div
                      key={extra.id}
                      onClick={() => toggleExtra(extra.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center justify-between ${
                        isChecked
                          ? 'border-amber-400 bg-amber-400/10 shadow-sm'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                      }`}
                    >
                      <div className="space-y-0.5 pr-2">
                        <div className="font-display text-sm text-cream font-medium">{extra.name}</div>
                        <div className="text-[11px] text-cream/60 font-body">{extra.detail}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono text-xs text-amber-300 font-bold">+₹{extra.price}</div>
                        <span className={`text-[10px] font-mono ${isChecked ? 'text-amber-400' : 'text-cream/30'}`}>
                          {isChecked ? 'Added ✓' : 'Select'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Step 5: Guest Details & Pricing Summary */}
            <div className="pt-4 border-t border-white/10 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="hud-mono text-[10px] uppercase tracking-widest text-cream/60 block">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aranya Sharma"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/15 text-cream text-sm font-body focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder:text-cream/30"
                  />
                </div>

                <div className="space-y-2">
                  <label className="hud-mono text-[10px] uppercase tracking-widest text-cream/60 block">
                    WhatsApp Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/15 text-cream text-sm font-mono focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder:text-cream/30"
                  />
                </div>
              </div>

              {/* Price Calculation Card */}
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="hud-mono text-[10px] uppercase tracking-widest text-cream/50">
                    Transparent Tariff Breakdown
                  </div>
                  <div className="text-xs text-cream/80 font-body">
                    {activeRoom.name} ({nights} nights × ₹{activeRoom.rate.toLocaleString('en-IN')})
                    {extrasCost > 0 ? ` + Experiences (₹${extrasCost.toLocaleString('en-IN')})` : ''}
                  </div>
                  <div className="text-[11px] text-amber-300/80 font-serif italic">
                    Includes organic breakfast, bonfire access, and valley taxes. Zero hidden fees.
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="hud-mono text-[10px] text-cream/50 uppercase tracking-widest">
                    Estimated Grand Total
                  </div>
                  <div className="font-display text-3xl font-medium text-amber-300">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 px-8 rounded-full bg-amber-400 hover:bg-amber-300 text-ink font-semibold hud-mono text-xs tracking-widest uppercase transition-all duration-300 shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] hover:scale-[1.01] active:scale-98 flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>Request Direct Reservation with Estate Host</span>
                <span className="text-sm">→</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </main>
  )
}

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-sand/10 text-bark flex flex-col items-center justify-center p-8">
          <div className="hud-mono text-xs tracking-widest text-clay uppercase animate-pulse">
            House of Hulda · 2,180m
          </div>
          <div className="font-display text-2xl font-medium text-bark mt-2">
            Preparing your mountain reservation...
          </div>
        </div>
      }
    >
      <BookContent />
    </Suspense>
  )
}
