"use client";

import { useRef } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { useScrollFrame } from "@/lib/scroll-progress";
import { formatAltitude } from "@/lib/grade";

/** ACT I — leaving the valley. Climbing parallax + scroll-bound altitude counter. */
export function Ascent() {
  const altRef = useRef<HTMLDivElement>(null);
  useScrollFrame((p) => {
    if (altRef.current) altRef.current.textContent = formatAltitude(p);
  });

  return (
    <section
      id="ascent"
      aria-label="Act I · Ascent"
      className="flex min-h-[160vh] flex-col items-center justify-between px-[clamp(20px,5vw,40px)] py-[30vh] text-center"
    >
      <Reveal>
        <div className="mb-[14px] text-[11px] uppercase tracking-[0.34em] text-cream/55">
          Altitude
        </div>
        <div
          ref={altRef}
          className="font-display text-[clamp(48px,9vw,120px)] font-medium leading-none tracking-[-0.02em] tabular-nums [text-shadow:0_3px_30px_rgba(0,0,0,0.4)]"
        >
          1,420m
        </div>
      </Reveal>
      <Reveal
        as="p"
        className="m-0 max-w-[18ch] font-display text-[clamp(26px,4vw,48px)] italic leading-[1.2]"
      >
        The road runs out.
        <br />
        Keep climbing.
      </Reveal>
      <Reveal
        as="p"
        className="m-0 font-display text-[clamp(24px,3.4vw,40px)] italic leading-[1.2] text-cream/85"
      >
        The air thins.
      </Reveal>
      <Reveal
        as="p"
        className="m-0 font-display text-[clamp(24px,3.4vw,40px)] italic leading-[1.2] text-cream/70"
      >
        The noise falls away.
      </Reveal>
    </section>
  );
}
