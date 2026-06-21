"use client";

import { useEffect } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { track } from "@/lib/analytics";

/** ACT 0 — the world below. Still valley, the light is on, one CTA. */
export function Threshold() {
  useEffect(() => {
    track("view_hero");
  }, []);

  const scrollTo = (e: React.MouseEvent, id: string, source: string) => {
    e.preventDefault();
    track("cta_click", { source });
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="threshold"
      aria-label="Act 0 · Threshold"
      className="flex min-h-screen flex-col items-center justify-center px-[clamp(20px,5vw,40px)] pb-[90px] pt-[120px] text-center"
    >
      <Reveal className="mb-[34px] text-[11px] uppercase tracking-[0.4em] text-cream/65">
        Naggar · Himachal Pradesh · 2,000m
      </Reveal>
      <Reveal
        as="h1"
        delay={0.12}
        className="m-0 max-w-[14ch] text-balance font-display text-[clamp(42px,7.4vw,104px)] font-medium leading-[1.02] tracking-[-0.015em] [text-shadow:0_4px_40px_rgba(0,0,0,0.4)]"
      >
        Somewhere above the noise, a&nbsp;light is on.
      </Reveal>
      <Reveal
        as="p"
        delay={0.26}
        className="mx-0 mb-0 mt-[30px] max-w-[38ch] text-[clamp(15px,1.6vw,19px)] font-light tracking-[0.01em] text-cream/80"
      >
        A kathkuni stone-and-deodar heritage homestay in Naggar, near Manali — with a
        hilltop café, home-cooked Himachali meals, and valley views at 2,000m.
      </Reveal>
      <Reveal delay={0.4} className="mt-[48px] flex items-center gap-[22px]">
        <a
          href="#ascent"
          onClick={(e) => scrollTo(e, "ascent", "hero_begin_ascent")}
          className="rounded-full border border-cream/50 px-[26px] py-[15px] text-[12px] font-semibold uppercase tracking-[0.18em] text-cream transition-colors hover:bg-cream/10"
        >
          Begin the ascent&nbsp;↓
        </a>
        <a
          href="#the-invitation"
          onClick={(e) => scrollTo(e, "the-invitation", "hero_reserve")}
          className="text-[12px] uppercase tracking-[0.14em] text-cream/70 underline decoration-cream/30 underline-offset-[5px]"
        >
          Reserve
        </a>
      </Reveal>
    </section>
  );
}
