"use client";

import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { track } from "@/lib/analytics";
import { BUSINESS, whatsappLink } from "@/lib/site-config";

const EXPLORE = [
  { href: "/stay", label: "Stay" },
  { href: "/cafe", label: "The Café" },
  { href: "/naggar", label: "Naggar" },
  { href: "/blog", label: "Journal" },
];

/**
 * ACT VII — the coda. The journey opened on "a light is on"; it closes by
 * promising that light stays on for the guest. Image-led, no abstract
 * placeholders: a real warm interior carries the final note, then the footer
 * with real contact details.
 */
export function Coda() {
  const toBooking = (e: React.MouseEvent) => {
    e.preventDefault();
    track("cta_click", { source: "footer_reserve" });
    document.getElementById("the-invitation")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="coda"
      aria-label="Act VII · Coda"
      className="mx-auto max-w-[1240px] px-[clamp(20px,5vw,40px)] pt-[16vh]"
    >
      <Reveal className="mb-[8vh] text-center">
        <div className="mb-[20px] text-[11px] uppercase tracking-[0.34em] text-cream/55">
          The coda
        </div>
        <h2 className="m-0 font-display text-[clamp(34px,5vw,68px)] font-medium leading-[1.04]">
          We&apos;ll keep the light on.
        </h2>
        <p className="mx-auto mt-[20px] max-w-[52ch] text-[clamp(15px,1.7vw,18px)] font-light leading-[1.7] text-cream/75">
          Whenever you make the climb to Naggar, there&apos;s a warm room, a full table and a
          quiet corner of the valley waiting — held by hand, in stone and deodar, at 2,000m.
        </p>
      </Reveal>

      {/* hosts + the house — real interior carries the close */}
      <div className="mb-[12vh] grid items-center gap-[clamp(28px,5vw,64px)] md:grid-cols-2">
        <Reveal>
          <div className="mb-[18px] text-[11px] uppercase tracking-[0.34em] text-cream/55">
            Your hosts
          </div>
          <h3 className="m-0 font-display text-[clamp(28px,3.6vw,46px)] font-medium leading-[1.08]">
            The people who keep the light on.
          </h3>
          <p className="mb-0 mt-[18px] max-w-[46ch] text-[15px] font-light leading-[1.7] text-cream/80">
            We rebuilt a stone-and-deodar kathkuni home the way the valley always built them —
            by hand, no cement — and opened it up: a café in the attic, a table for everyone,
            the orchard for wandering. You arrive a guest and leave family.
          </p>
          <div className="mt-[24px] flex flex-wrap gap-[10px]">
            <a
              href={BUSINESS.social.airbnb}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/18 px-[13px] py-[7px] text-[11px] tracking-[0.1em] text-cream/80 transition-colors hover:border-amber/60 hover:text-cream"
            >
              ★ 4.9 · Airbnb Superhost
            </a>
            <span className="rounded-full border border-white/18 px-[13px] py-[7px] text-[11px] tracking-[0.1em] text-cream/80">
              ★ 4.9 · Google
            </span>
          </div>
          <div className="mt-[28px]">
            <a
              href="#the-invitation"
              onClick={toBooking}
              className="inline-block rounded-full bg-amber px-[26px] py-[14px] text-[11.5px] font-bold uppercase tracking-[0.14em] text-ink shadow-[0_10px_30px_rgba(217,154,78,0.28)] transition-transform hover:scale-[1.03]"
            >
              Reserve your stay
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <figure className="relative m-0 aspect-[4/5] overflow-hidden rounded-[16px] border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.5)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/room-rustic.jpg"
              alt="A warm kathkuni guest room at House of Hulda — hand-plastered walls, deodar beams and lantern light"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <figcaption className="absolute bottom-[16px] left-[18px] right-[18px] text-[10px] uppercase tracking-[0.2em] text-[rgba(255,235,205,0.85)]">
              A room kept warm · House of Hulda, Naggar
            </figcaption>
          </figure>
        </Reveal>
      </div>

      {/* footer */}
      <footer className="flex flex-wrap items-end justify-between gap-[32px] border-t border-white/12 pb-[60px] pt-[48px]">
        <div>
          <div className="font-display text-[26px] font-semibold leading-none">House of Hulda</div>
          <div className="mt-[10px] text-[11px] uppercase tracking-[0.2em] text-cream/55">
            Naggar · Manali · Himachal Pradesh · 2,000m
          </div>
          <div className="mt-[14px] flex flex-wrap items-center gap-[14px]">
            <a
              href={whatsappLink("Hello House of Hulda! I'd love to know more about staying with you.")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("whatsapp_click", { source: "footer" })}
              className="flex items-center gap-[6px] text-[12px] text-cream/70 transition-colors hover:text-cream"
              aria-label="WhatsApp"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {BUSINESS.phoneDisplay}
            </a>
            <span className="text-cream/25">·</span>
            <a
              href={`mailto:${BUSINESS.email}`}
              className="text-[12px] text-cream/70 transition-colors hover:text-cream"
            >
              {BUSINESS.email}
            </a>
          </div>
        </div>
        <div className="flex flex-col items-start gap-[16px] md:items-end">
          <nav className="flex flex-wrap gap-[18px] text-[11px] uppercase tracking-[0.14em] text-cream/60">
            {EXPLORE.map((e) => (
              <Link key={e.href} href={e.href} className="transition-colors hover:text-cream">
                {e.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-[18px]">
            <a
              href={BUSINESS.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-[7px] text-[11px] uppercase tracking-[0.14em] text-cream/60 transition-colors hover:text-cream/90"
              aria-label="Get directions to Naggar, Manali"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              Naggar, HP · Directions
            </a>
            <a
              href={BUSINESS.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] uppercase tracking-[0.14em] text-cream/60 transition-colors hover:text-cream/90"
            >
              Instagram
            </a>
          </div>
        </div>
      </footer>
    </section>
  );
}
