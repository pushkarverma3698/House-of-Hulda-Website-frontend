"use client";

import { useRef } from "react";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { useScrollFrame, useScrollEngine } from "@/lib/scroll-progress";
import { formatAltitude, clamp01 } from "@/lib/grade";

/** ACT I — leaving the valley. Climbing parallax + scroll-bound altitude counter. */
export function Ascent() {
  const altRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useScrollEngine();

  useScrollFrame((p) => {
    if (altRef.current) altRef.current.textContent = formatAltitude(p);

    if (bgRef.current) {
      // Ascent is active from p=0.0 to p=0.33
      const local = clamp01(p / 0.33);
      // Bell curve: peaks in the middle of the ascent segment
      const opacity = Math.sin(local * Math.PI) * 0.32;
      bgRef.current.style.opacity = opacity.toFixed(3);

      if (!reducedMotion) {
        // Shift upwards slightly and scale out, simulating climbing
        const yOffset = -(local * 10).toFixed(2); // translate up to -10%
        const scale = (1.05 + local * 0.08).toFixed(3);
        bgRef.current.style.transform = `translate3d(0, ${yOffset}%, 0) scale(${scale})`;
      }
    }
  });

  return (
    <section
      id="ascent"
      aria-label="Act I · Ascent"
      className="relative flex min-h-[160vh] flex-col items-center justify-between px-[clamp(20px,5vw,40px)] py-[30vh] text-center overflow-hidden"
    >
      {/* Parallax background image showing the forest/valley climb */}
      <div
        ref={bgRef}
        className="pointer-events-none absolute inset-0 -z-10 bg-ink opacity-0 transition-opacity duration-300"
        style={{ transform: "scale(1.05)" }}
      >
        <Image
          src="/images/naggar-valley.jpg"
          alt="Climbing high above the valley in Naggar, Manali"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Gradients to blend back into the dark homepage theme */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #0a0f17 0%, rgba(10,15,23,0.4) 20%, rgba(10,15,23,0.4) 80%, #0a0f17 100%)",
          }}
        />
      </div>

      <Reveal>
        <div className="mb-[14px] text-[11px] uppercase tracking-[0.34em] text-cream/55">
          Altitude
        </div>
        <div
          ref={altRef}
          className="font-display text-[clamp(48px,9vw,120px)] font-medium leading-none tracking-[-0.02em] tabular-nums [text-shadow:0_3px_30px_rgba(0,0,0,0.4)] text-cream"
        >
          1,420m
        </div>
      </Reveal>
      <Reveal
        as="p"
        className="m-0 max-w-[18ch] font-display text-[clamp(26px,4vw,48px)] italic leading-[1.2] text-cream"
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
