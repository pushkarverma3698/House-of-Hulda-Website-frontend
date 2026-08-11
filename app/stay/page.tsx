import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageShell } from "@/components/layout/PageShell";
import { EditorialHero } from "@/components/editorial/EditorialHero";
import { PACKAGES, MOOD_ORDER, formatINR } from "@/content/packages";
import { breadcrumbJsonLd, SITE } from "@/lib/schema";
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

export default function StayPage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Stay", url: "/stay" },
  ]);

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <EditorialHero
        src="/images/room-morning.jpg"
        alt="A quiet guest room at House of Hulda with hand-plastered walls and mountain light filtering in"
        eyebrow="Where to stay"
        title="A room kept warm, above the noise."
        intro="House of Hulda is a hand-built kathkuni home in Naggar — stone and deodar, no cement, the way the valley has built for centuries. Stay your way: a private room, a single bed in the attic café-loft, the whole house for your people, or a long, slow creative residency."
        meta="2,000m · Naggar, Himachal"
      />

      {/* the stays */}
      <section className="mx-auto mt-[clamp(56px,10vh,110px)] max-w-[1200px] px-[clamp(20px,5vw,56px)]">
        <div className="grid gap-[clamp(24px,4vw,36px)] sm:grid-cols-2">
          {MOOD_ORDER.map((id) => {
            const p = PACKAGES[id];
            return (
              <article
                key={id}
                className="overflow-hidden rounded-[16px] border border-bark/8 bg-sand/20 shadow-[0_15px_40px_-20px_rgba(46,33,23,0.15)] transition-all hover:translate-y-[-2px] hover:shadow-[0_20px_50px_-20px_rgba(46,33,23,0.22)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-sand">
                  <Image src={p.image} alt={p.label} fill sizes="(max-width:640px) 100vw, 540px" className="object-cover transition-transform duration-700 hover:scale-[1.03]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-bark/40 to-transparent" />
                </div>
                <div className="p-[clamp(20px,3.5vw,32px)]">
                  <div className="flex items-baseline justify-between gap-[12px]">
                    <h2 className="m-0 font-display text-[clamp(24px,3vw,32px)] font-medium text-bark">{p.name}</h2>
                    <div className="whitespace-nowrap text-[13.5px] font-semibold text-bark/70">
                      {formatINR(p.rate)} <span className="text-deodar/50 font-normal">/ {p.rateUnit}</span>
                    </div>
                  </div>
                  <div className="mt-[6px] text-[10.5px] font-bold uppercase tracking-[0.16em] text-clay">{p.tag}</div>
                  <p className="mt-[14px] text-[14.5px] font-light leading-[1.7] text-deodar">{p.blurb}</p>
                  <div className="mt-[18px] flex flex-wrap gap-[8px]">
                    {p.inclusions.map((inc) => (
                      <span key={inc} className="rounded-full border border-bark/12 bg-parchment/60 px-[11px] py-[5px] text-[10px] tracking-[0.06em] text-deodar">
                        {inc}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-[32px] text-[12px] leading-[1.6] text-deodar/60">
          Rates are indicative per night and confirmed with your dates. Minimum nights apply on the
          whole home and the creative residency.
        </p>
      </section>

      {/* gallery */}
      <section className="mx-auto mt-[clamp(60px,11vh,120px)] max-w-[1200px] px-[clamp(20px,5vw,56px)]">
        <h2 className="kicker-rule font-display text-[clamp(26px,3.4vw,40px)] font-medium text-bark">Mud, wool and lantern light.</h2>
        <div className="mt-[28px] grid grid-cols-2 gap-[clamp(12px,2.4vw,24px)] md:grid-cols-4">
          {GALLERY.map((g) => (
            <div key={g.src} className="relative aspect-[3/4] overflow-hidden rounded-[12px] border border-bark/8 bg-sand shadow-[0_15px_40px_-20px_rgba(46,33,23,0.25)]">
              <Image src={g.src} alt={g.alt} fill sizes="(max-width:768px) 50vw, 260px" className="object-cover transition-transform duration-700 hover:scale-[1.04]" />
            </div>
          ))}
        </div>
      </section>

      {/* wonder */}
      <section className="mx-auto mt-[clamp(60px,11vh,120px)] max-w-[1200px] px-[clamp(20px,5vw,56px)]">
        <h2 className="kicker-rule font-display text-[clamp(26px,3.4vw,40px)] font-medium text-bark">Days are for wandering. Nights are for the stars.</h2>
        <p className="mt-[18px] max-w-[44ch] text-[15px] font-light leading-[1.6] text-deodar">
          Things to do in Naggar — the Roerich gallery, apple orchards, hidden waterfall trails and stargazing, all a short walk from the house.
        </p>
        <div className="mt-[40px] grid gap-[clamp(24px,4vw,36px)] sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Hidden waterfalls", desc: "Trails that end where the water does." },
            { title: "Apple orchards", desc: "Pick straight from our own trees." },
            { title: "The Roerich legacy", desc: "An artist's mountain, a short walk away." },
            { title: "Bonfire nights", desc: "Wool blankets, embers, no hurry." },
            { title: "Stargazing", desc: "The deck, the dark, the whole sky." }
          ].map((item, i) => (
            <div key={i} className="rounded-[16px] border border-bark/8 bg-sand/30 p-[24px] shadow-[0_10px_30px_-15px_rgba(46,33,23,0.1)] transition-transform hover:-translate-y-1">
              <div className="mb-[12px] h-[6px] w-[6px] rounded-full bg-clay" />
              <h3 className="font-display text-[20px] font-medium text-bark">{item.title}</h3>
              <p className="mt-[8px] text-[14px] leading-[1.6] text-deodar">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* hosts & faq */}
      <section className="mx-auto mt-[clamp(60px,11vh,120px)] max-w-[1200px] px-[clamp(20px,5vw,56px)]">
        <div className="grid gap-[clamp(40px,6vw,80px)] md:grid-cols-2">
          <div>
            <h2 className="kicker-rule font-display text-[clamp(26px,3.4vw,40px)] font-medium text-bark">The House of Hulda Family.</h2>
            <p className="mt-[20px] text-[15px] font-light leading-[1.7] text-deodar">
              We rebuilt this stone-and-deodar kathkuni home in Naggar, Himachal Pradesh at 2,000m altitude. Built entirely by hand, with no cement, exactly the way the valley has always built them. We opened it up: a café in the attic, a table for everyone, the apple orchard for wandering. You arrive a guest and leave as family.
            </p>
            <div className="mt-[24px] flex flex-wrap gap-[10px]">
              <span className="rounded-full border border-bark/15 px-[14px] py-[6px] text-[11px] font-medium tracking-[0.08em] text-bark">★ 4.9 · Airbnb Superhost</span>
              <span className="rounded-full border border-bark/15 px-[14px] py-[6px] text-[11px] font-medium tracking-[0.08em] text-bark">★ 4.9 · Google Reviews</span>
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
        <Link
          href="/#the-invitation"
          className="mt-[28px] inline-block rounded-full bg-clay px-[32px] py-[16px] text-[12px] font-bold uppercase tracking-[0.16em] text-parchment shadow-[0_10px_30px_rgba(176,92,54,0.22)] transition-transform hover:scale-[1.03] hover:bg-clay/90"
        >
          Check dates &amp; reserve
        </Link>
      </section>
    </PageShell>
  );
}
