import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageShell } from "@/components/layout/PageShell";
import { EditorialHero } from "@/components/editorial/EditorialHero";
import { DayAtHulda } from "@/components/editorial/DayAtHulda";
import { PACKAGES, MOOD_ORDER, formatINR } from "@/content/packages";
import { breadcrumbJsonLd, faqJsonLd, SITE } from "@/lib/schema";
import { COMMON_FAQ } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Where to Stay — Private Rooms, Attic Loft & Whole-Home in Naggar",
  description:
    "Stay at House of Hulda, a kathkuni stone-and-deodar heritage homestay in Naggar, near Manali. Choose a private room, a bed in the attic café-loft, the whole home, or a long creative residency.",
  alternates: { canonical: "/stay" },
  openGraph: {
    title: "Where to Stay — House of Hulda",
    description: "Stay at House of Hulda, a kathkuni heritage homestay in Naggar, near Manali.",
    url: `${SITE.url}/stay`,
    images: [{ url: "/images/room-morning.jpg", width: 1200, height: 630, alt: "A quiet guest room at House of Hulda" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Where to Stay — House of Hulda",
    description: "Stay at House of Hulda, a kathkuni heritage homestay in Naggar, near Manali.",
    images: ["/images/room-morning.jpg"],
  },
};

const GALLERY = [
  { src: "/images/room-lantern.jpg", alt: "Private kathkuni room with warm lantern light and Himachali wool bedding" },
  { src: "/images/room-rustic.jpg", alt: "Hand-plastered mud walls and deodar beams in a House of Hulda guest room" },
  { src: "/images/room-guitar.jpg", alt: "The attic café-loft with floor seating and a guitar in the corner" },
  { src: "/images/bath-view.jpg", alt: "Bathroom with a mountain valley view at House of Hulda" },
];

const ROOM_AWAKENINGS: Record<string, { prompt: string; detail: string; capacityBadge: string }> = {
  room: {
    prompt: "You wake to golden sunlight catching mud-plastered walls.",
    detail:
      "A crack of wood fire in the bukhari down the hall. Heavy hand-loomed pattu wool pulled up to your chin. The fragrance of Himalayan cedar warmed by early morning mountain sun.",
    capacityBadge: "2 GUESTS · PRIVATE ROOM · ENSUITE",
  },
  loft: {
    prompt: "You wake under ancient deodar rafters, footsteps below in the café.",
    detail:
      "Morning tea brewing on the iron stove. The orchard branches tapping softly on the skylight window. Floor cushions, soft acoustic tunes, and mountain air that clears your mind instantly.",
    capacityBadge: "1–2 GUESTS · ATTIC CAFE LOFT · SHARED BATH",
  },
  home: {
    prompt: "You wake to the entire mountain estate belonging only to your people.",
    detail:
      "Kids running across timber planks barefoot. Fresh hot parathas and apple preserve laid on the big walnut dining table. The valley ridge unfolding quietly outside your private stone balcony.",
    capacityBadge: "UP TO 6 GUESTS · 3 BEDROOMS · FULL ESTATE",
  },
  residency: {
    prompt: "You wake to quiet days where hours stretch out uncounted.",
    detail:
      "A sturdy wooden desk beside a panoramic window. High-speed fibre internet when you need the world, absolute silence when you don't. The perfect balance between focused work and slow living.",
    capacityBadge: "1–2 GUESTS · EXTENDED RETREAT · HALF BOARD",
  },
};

export default function StayPage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Stay", url: "/stay" },
  ]);

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(COMMON_FAQ)) }} />

      <EditorialHero
        src="/images/room-morning.jpg"
        alt="A quiet guest room at House of Hulda with hand-plastered walls and mountain light filtering in"
        eyebrow="Where to stay"
        title="What will you wake up to?"
        intro="House of Hulda is a hand-built kathkuni sanctuary in Rumsu, Naggar. Stone and century-old deodar, no cement, the way the valley has built for five hundred years. Stay your way: a private room, a bed under the café eaves, the whole home for your circle, or a long creative residency."
        meta="2,180m · Rumsu · Naggar, Himachal"
      />

      {/* The Stays: Emotional Room Discovery */}
      <section className="mx-auto mt-[clamp(56px,10vh,110px)] max-w-[1200px] px-[clamp(20px,5vw,56px)]">
        <div className="flex items-center gap-3 mb-4">
          <span className="hud-mono text-[10px] tracking-[0.24em] uppercase text-clay font-bold">
            Accommodations
          </span>
          <span className="w-8 h-[1px] bg-clay/30" />
          <span className="hud-mono text-[10px] tracking-wider text-deodar/60">
            CHOOSE YOUR SANCTUARY
          </span>
        </div>

        <h2 className="font-display text-[clamp(30px,4.5vw,50px)] font-medium text-bark tracking-tight leading-tight mb-12">
          Four ways to sleep inside
          <br />
          <span className="italic font-light opacity-80">living wood and stone.</span>
        </h2>

        <div className="grid gap-[clamp(32px,5vw,56px)] sm:grid-cols-2">
          {MOOD_ORDER.map((id) => {
            const p = PACKAGES[id];
            const awakening = ROOM_AWAKENINGS[id];

            return (
              <article
                key={id}
                className="group flex flex-col justify-between overflow-hidden rounded-[20px] border border-bark/10 bg-sand/20 shadow-[0_15px_40px_-20px_rgba(46,33,23,0.15)] transition-all duration-300 hover:translate-y-[-3px] hover:shadow-[0_25px_55px_-20px_rgba(46,33,23,0.25)]"
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative aspect-[16/11] overflow-hidden bg-sand">
                    <Image
                      src={p.image}
                      alt={p.label}
                      fill
                      sizes="(max-width:640px) 100vw, 540px"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bark/70 via-bark/20 to-transparent" />

                    {/* Capacity Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="inline-block rounded-full bg-black/60 px-3 py-1 hud-mono text-[9.5px] uppercase tracking-wider text-cream/90 backdrop-blur-md border border-white/10">
                        {awakening?.capacityBadge || p.tag}
                      </span>
                    </div>

                    {/* Rate pill */}
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-white text-right">
                      <span className="font-display text-base font-semibold text-amber-300">
                        {formatINR(p.rate)}
                      </span>
                      <span className="text-[10px] text-cream/70 font-mono ml-1">
                        / {p.rateUnit}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-[clamp(22px,4vw,34px)]">
                    <h3 className="m-0 font-display text-[clamp(24px,3.2vw,32px)] font-medium text-bark">
                      {p.name}
                    </h3>
                    <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-clay">
                      {p.tag}
                    </div>

                    {/* The Emotional Awakening Box */}
                    {awakening && (
                      <div className="mt-4 p-3.5 rounded-xl bg-parchment/70 border border-bark/10">
                        <p className="font-display italic text-[15px] text-bark/90 font-medium">
                          &ldquo;{awakening.prompt}&rdquo;
                        </p>
                        <p className="mt-1.5 text-[13px] font-light leading-relaxed text-deodar/80">
                          {awakening.detail}
                        </p>
                      </div>
                    )}

                    <p className="mt-4 text-[14px] font-light leading-[1.7] text-deodar">
                      {p.blurb}
                    </p>

                    {/* Inclusions Tags */}
                    <div className="mt-5 flex flex-wrap gap-2">
                      {p.inclusions.map((inc) => (
                        <span
                          key={inc}
                          className="rounded-full border border-bark/12 bg-parchment/60 px-2.5 py-1 text-[10px] tracking-[0.06em] text-deodar"
                        >
                          {inc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Direct Action Footer */}
                <div className="px-[clamp(22px,4vw,34px)] pb-[clamp(22px,4vw,34px)] pt-0">
                  <Link
                    href={`/book?room=${id}`}
                    className="w-full py-3 rounded-full bg-bark hover:bg-clay text-parchment font-medium hud-mono text-[11px] uppercase tracking-[0.18em] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-98 text-center"
                  >
                    <span>Reserve {p.name}</span>
                    <span>→</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-8 text-center text-[12.5px] leading-[1.6] text-deodar/70 max-w-xl mx-auto">
          Direct bookings guarantee complimentary artisan Himachali breakfast, local guide assistance,
          and zero third-party commissions.
        </p>
      </section>

      {/* A Day at Hulda Mountain Timeline */}
      <DayAtHulda variant="light" />

      {/* Architectural Hook: The House */}
      <section className="mx-auto mt-6 max-w-[1200px] px-[clamp(20px,5vw,56px)]">
        <div className="relative overflow-hidden rounded-3xl border border-bark/12 bg-sand/30 p-8 sm:p-12 md:p-16 shadow-[0_20px_50px_-20px_rgba(46,33,23,0.15)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="hud-mono text-[10px] tracking-[0.24em] uppercase text-clay font-bold mb-2">
                Indigenous Craft
              </div>
              <h2 className="font-display text-[clamp(26px,3.8vw,42px)] font-medium text-bark tracking-tight leading-snug">
                Built without nails.
                <br />
                <span className="italic font-light opacity-80">Designed to dance with earthquakes.</span>
              </h2>
              <p className="mt-4 text-[14.5px] md:text-[15.5px] font-light leading-relaxed text-deodar max-w-2xl">
                Explore the architectural story of House of Hulda: century-old deodar beams, hand-chiseled slate
                foundations, and the six elemental materials that make this building breathe.
              </p>
            </div>
            <div className="lg:col-span-4 flex lg:justify-end">
              <Link
                href="/the-house"
                className="inline-flex items-center gap-2.5 rounded-full bg-bark px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-parchment transition-all hover:bg-clay hover:shadow-lg active:scale-95"
              >
                <span>Read The Architecture Story</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery: Mud, Wool & Lantern Light */}
      <section className="mx-auto mt-[clamp(60px,11vh,120px)] max-w-[1200px] px-[clamp(20px,5vw,56px)]">
        <div className="flex items-center gap-3 mb-3">
          <span className="hud-mono text-[10px] tracking-[0.2em] uppercase text-clay font-bold">Atmosphere</span>
          <span className="w-8 h-[1px] bg-clay/30" />
        </div>
        <h2 className="font-display text-[clamp(26px,3.4vw,40px)] font-medium text-bark">
          Mud, wool and lantern light.
        </h2>
        <div className="mt-[28px] grid grid-cols-2 gap-[clamp(12px,2.4vw,24px)] md:grid-cols-4">
          {GALLERY.map((g) => (
            <div
              key={g.src}
              className="relative aspect-[3/4] overflow-hidden rounded-[16px] border border-bark/8 bg-sand shadow-[0_15px_40px_-20px_rgba(46,33,23,0.25)] group"
            >
              <Image
                src={g.src}
                alt={g.alt}
                fill
                sizes="(max-width:768px) 50vw, 260px"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Wonder & Local Wandering */}
      <section className="mx-auto mt-[clamp(60px,11vh,120px)] max-w-[1200px] px-[clamp(20px,5vw,56px)]">
        <div className="flex items-center gap-3 mb-3">
          <span className="hud-mono text-[10px] tracking-[0.2em] uppercase text-clay font-bold">The Surrounds</span>
          <span className="w-8 h-[1px] bg-clay/30" />
        </div>
        <h2 className="font-display text-[clamp(26px,3.4vw,40px)] font-medium text-bark">
          Days are for wandering. Nights are for the stars.
        </h2>
        <p className="mt-[18px] max-w-[48ch] text-[15px] font-light leading-[1.6] text-deodar">
          Things to do in Rumsu and Naggar — the Roerich art estate, apple orchards, hidden glacial waterfall trails, and Bortle Class 1 dark sky stargazing, all steps from the front door.
        </p>
        <div className="mt-[40px] grid gap-[clamp(20px,3vw,30px)] sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Hidden Waterfalls", desc: "Ancient shepherd footpaths that terminate where clear glacial water cascades over mossy slate." },
            { title: "Apple Orchards", desc: "Pick crisp Golden Delicious apples directly from seventy-year-old orchard trees on the property." },
            { title: "The Roerich Legacy", desc: "The estate of Russian painter Nicholas Roerich, who painted these exact Himalayan peaks, a short walk away." },
            { title: "Bonfire & Hearth Nights", desc: "Heavy wool blankets, aromatic cedar embers, mountain herbal tea, and no hurry." },
            { title: "Bortle 1 Stargazing", desc: "Step onto the timber deck under pitch darkness to witness the Milky Way arching over Chandrakhani Pass." },
            { title: "Naggar Castle & Heritage", desc: "Medieval wooden castle built with interlocking kathkuni timber overlooking the entire Beas valley." }
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-[16px] border border-bark/8 bg-sand/30 p-[24px] shadow-[0_10px_30px_-15px_rgba(46,33,23,0.1)] transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="mb-[12px] h-[6px] w-[6px] rounded-full bg-clay" />
              <h3 className="font-display text-[20px] font-medium text-bark">{item.title}</h3>
              <p className="mt-[8px] text-[14px] leading-[1.6] text-deodar font-light">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Hosts & FAQ */}
      <section className="mx-auto mt-[clamp(60px,11vh,120px)] max-w-[1200px] px-[clamp(20px,5vw,56px)]">
        <div className="grid gap-[clamp(40px,6vw,80px)] md:grid-cols-2">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="hud-mono text-[10px] tracking-[0.2em] uppercase text-clay font-bold">Hospitality</span>
              <span className="w-8 h-[1px] bg-clay/30" />
            </div>
            <h2 className="font-display text-[clamp(26px,3.4vw,40px)] font-medium text-bark">
              The House of Hulda Family.
            </h2>
            <p className="mt-[20px] text-[15px] font-light leading-[1.7] text-deodar">
              We rebuilt this stone-and-deodar kathkuni home in Rumsu, Naggar at 2,180m altitude. Built entirely by hand, with no cement, exactly the way the valley has always built them. We opened it up: a café in the attic, a table for everyone, and the apple orchard for wandering. You arrive a guest and leave as family.
            </p>
            <div className="mt-[24px] flex flex-wrap gap-[10px]">
              <span className="rounded-full border border-bark/15 px-[14px] py-[6px] text-[11px] font-medium tracking-[0.08em] text-bark">
                ★ 4.9 · Airbnb Superhost
              </span>
              <span className="rounded-full border border-bark/15 px-[14px] py-[6px] text-[11px] font-medium tracking-[0.08em] text-bark">
                ★ 4.9 · Google Reviews
              </span>
            </div>
          </div>
          <div>
            <h2 className="font-display text-[22px] font-medium text-bark mb-[24px]">Common Questions</h2>
            <div className="space-y-[16px]">
              {COMMON_FAQ.map((faq, i) => (
                <details key={i} className="group border-b border-bark/10 pb-[16px] [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-bark/90 hover:text-bark">
                    <span>{faq.q}</span>
                    <span className="text-[20px] font-light text-clay transition-transform duration-300 group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-[12px] text-[14.5px] font-light leading-[1.65] text-deodar/90">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-[clamp(64px,12vh,130px)] max-w-[1200px] px-[clamp(20px,5vw,56px)] pb-[clamp(40px,8vh,90px)] text-center">
        <h2 className="mx-auto max-w-[20ch] font-display text-[clamp(28px,4vw,52px)] font-medium leading-[1.08] text-bark">
          Every stay is a different kind of quiet.
        </h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/book"
            className="inline-block rounded-full bg-clay px-[36px] py-[16px] text-[12px] font-bold uppercase tracking-[0.16em] text-parchment shadow-[0_10px_30px_rgba(176,92,54,0.22)] transition-transform hover:scale-[1.03] hover:bg-clay/90"
          >
            Check Dates &amp; Reserve Room
          </Link>
          <Link
            href="/the-house"
            className="inline-block rounded-full border border-bark/20 px-[28px] py-[16px] text-[12px] font-medium uppercase tracking-[0.16em] text-bark transition-colors hover:bg-bark/5"
          >
            Explore Kath-kuni Craft
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
