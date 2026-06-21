import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageShell } from "@/components/layout/PageShell";
import { PACKAGES, MOOD_ORDER, formatINR } from "@/content/packages";

export const metadata: Metadata = {
  title: "Where to Stay — Private Rooms, Attic Loft & Whole-Home in Naggar",
  description:
    "Stay at House of Hulda, a kathkuni stone-and-deodar heritage homestay in Naggar, near Manali. Choose a private room, a bed in the attic café-loft, the whole home, or a long creative residency.",
  alternates: { canonical: "/stay" },
};

const GALLERY = [
  { src: "/images/room-lantern.jpg", alt: "Private kathkuni room with warm lantern light and Himachali wool bedding" },
  { src: "/images/room-rustic.jpg", alt: "Hand-plastered mud walls and deodar beams in a House of Hulda guest room" },
  { src: "/images/room-guitar.jpg", alt: "The attic café-loft with floor seating and a guitar in the corner" },
  { src: "/images/bath-view.jpg", alt: "Bathroom with a mountain valley view at House of Hulda" },
];

export default function StayPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-[1100px] px-[clamp(20px,5vw,40px)] pt-[clamp(60px,12vh,120px)]">
        <div className="text-[11px] uppercase tracking-[0.34em] text-amber/80">Where to stay</div>
        <h1 className="mt-[16px] max-w-[16ch] font-display text-[clamp(40px,7vw,82px)] font-medium leading-[1.02] tracking-[-0.02em] text-cream">
          A room kept warm, above the noise.
        </h1>
        <p className="mt-[22px] max-w-[60ch] text-[clamp(16px,1.9vw,19px)] font-light leading-[1.75] text-cream/80">
          House of Hulda is a hand-built kathkuni home in Naggar — stone and deodar, no cement, the
          way the valley has built for centuries. Stay your way: a private room, a single bed in the
          attic café-loft, the whole house for your people, or a long, slow creative residency.
        </p>
      </section>

      {/* the stays */}
      <section className="mx-auto mt-[clamp(48px,9vh,96px)] max-w-[1100px] px-[clamp(20px,5vw,40px)]">
        <div className="grid gap-[clamp(20px,3vw,32px)] sm:grid-cols-2">
          {MOOD_ORDER.map((id) => {
            const p = PACKAGES[id];
            return (
              <article
                key={id}
                className="overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.03]"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image src={p.image} alt={p.label} fill sizes="(max-width:640px) 100vw, 540px" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-[clamp(20px,3vw,30px)]">
                  <div className="flex items-baseline justify-between gap-[12px]">
                    <h2 className="m-0 font-display text-[clamp(24px,3vw,32px)] font-medium text-cream">{p.name}</h2>
                    <div className="whitespace-nowrap text-[13px] text-cream/60">
                      {formatINR(p.rate)} <span className="text-cream/40">/ {p.rateUnit}</span>
                    </div>
                  </div>
                  <div className="mt-[6px] text-[11px] uppercase tracking-[0.14em] text-amber/70">{p.tag}</div>
                  <p className="mt-[14px] text-[14.5px] font-light leading-[1.7] text-cream/75">{p.blurb}</p>
                  <div className="mt-[16px] flex flex-wrap gap-[8px]">
                    {p.inclusions.map((inc) => (
                      <span key={inc} className="rounded-full border border-white/15 px-[11px] py-[5px] text-[10px] tracking-[0.06em] text-cream/70">
                        {inc}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-[28px] text-[12px] leading-[1.6] text-cream/45">
          Rates are indicative per night and confirmed with your dates. Minimum nights apply on the
          whole home and the creative residency.
        </p>
      </section>

      {/* gallery */}
      <section className="mx-auto mt-[clamp(56px,10vh,110px)] max-w-[1100px] px-[clamp(20px,5vw,40px)]">
        <h2 className="font-display text-[clamp(26px,3.4vw,40px)] font-medium text-cream">Mud, wool and lantern light.</h2>
        <div className="mt-[28px] grid grid-cols-2 gap-[clamp(12px,2vw,20px)] md:grid-cols-4">
          {GALLERY.map((g) => (
            <div key={g.src} className="relative aspect-[3/4] overflow-hidden rounded-[12px] border border-white/10">
              <Image src={g.src} alt={g.alt} fill sizes="(max-width:768px) 50vw, 260px" className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-[clamp(56px,10vh,110px)] max-w-[1100px] px-[clamp(20px,5vw,40px)] pb-[clamp(40px,8vh,90px)] text-center">
        <h2 className="mx-auto max-w-[20ch] font-display text-[clamp(28px,4vw,52px)] font-medium leading-[1.08] text-cream">
          Every stay is a different kind of quiet.
        </h2>
        <Link
          href="/#the-invitation"
          className="mt-[28px] inline-block rounded-full bg-amber px-[30px] py-[16px] text-[12px] font-bold uppercase tracking-[0.14em] text-ink shadow-[0_10px_30px_rgba(217,154,78,0.28)] transition-transform hover:scale-[1.03]"
        >
          Check dates &amp; reserve
        </Link>
      </section>
    </PageShell>
  );
}
