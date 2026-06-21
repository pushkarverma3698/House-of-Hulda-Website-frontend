"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useScrollFrame, useScrollEngine } from "@/lib/scroll-progress";
import { clamp01, todSky, todLabel } from "@/lib/grade";
import { track } from "@/lib/analytics";

/**
 * ACT II — the signature showpiece, and the emotional payoff of the whole climb.
 *
 * Per the locked product decision this is NOT custom 3D for v1: it's a
 * cinematic, FULL-BLEED photo reveal. The section is tall + the inner stage is
 * sticky, so the house holds on screen while the mist lets go and the real
 * golden-hour exterior resolves edge-to-edge — a film title card over the place
 * itself. A time-of-day slider cross-fades sunrise → starlight over the photo.
 */
export function Arrival() {
  const sectionRef = useRef<HTMLElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);
  const houseRef = useRef<HTMLDivElement>(null);
  const photoTintRef = useRef<HTMLDivElement>(null);
  const reachedRef = useRef(false);
  const { reducedMotion } = useScrollEngine();

  const [tod, setTod] = useState(0.35);

  useEffect(() => {
    if (photoTintRef.current) photoTintRef.current.style.background = todSky(tod);
  }, [tod]);

  useScrollFrame(() => {
    const el = sectionRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0 as the stage enters → 1 once it is fully held in view
    const local = clamp01((vh * 0.5 - r.top) / (r.height * 0.42));

    if (mistRef.current) mistRef.current.style.opacity = (1 - local).toFixed(3);
    if (houseRef.current) {
      houseRef.current.style.opacity = (0.25 + local * 0.75).toFixed(3);
      // start slightly zoomed and settle — the frame "breathes" into place
      houseRef.current.style.transform = reducedMotion
        ? "scale(1)"
        : `scale(${(1.09 - local * 0.09).toFixed(4)})`;
    }
    if (local > 0.6 && !reachedRef.current) {
      reachedRef.current = true;
      track("reach_arrival");
    }
  });

  return (
    <section ref={sectionRef} id="arrival" aria-label="Act II · Arrival" className="relative h-[260vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-ink">
        {/* full-bleed house — the real golden-hour exterior, the moment you arrive */}
        <div
          ref={houseRef}
          className="absolute inset-0 will-change-transform"
          style={{ opacity: 0.25, transform: "scale(1.09)" }}
        >
          <Image
            src="/images/arrival-golden-hour.jpg"
            alt="House of Hulda kathkuni heritage homestay glowing at golden hour above the Naggar valley, Manali"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* time-of-day tint over the photo (driven by the slider) — kept light at
              golden hour so the real photo stays vivid, deepening toward starlight */}
          <div
            ref={photoTintRef}
            className="pointer-events-none absolute inset-0 opacity-45 mix-blend-soft-light"
            style={{ background: todSky(tod) }}
          />
          {/* cinematic legibility scrims: title-card top + grounded bottom */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg,rgba(0,0,0,0.5) 0%,rgba(0,0,0,0.12) 26%,rgba(0,0,0,0) 48%,rgba(0,0,0,0.34) 74%,rgba(0,0,0,0.72) 100%)",
            }}
          />
        </div>

        {/* the arrival mist that lets go, uncovering the house */}
        <div
          ref={mistRef}
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(75% 80% at 50% 46%,rgba(232,236,240,0.96),rgba(226,231,238,0.66) 52%,rgba(216,224,232,0.18) 82%)",
            filter: "blur(8px)",
          }}
        />

        {/* content overlay — bottom-anchored film title card */}
        <div className="relative z-[2] flex h-full flex-col items-center justify-end px-[clamp(20px,5vw,40px)] pb-[clamp(40px,7vh,76px)] pt-[96px] text-center">
          <p className="reveal mb-[18px] font-display text-[clamp(20px,2.6vw,30px)] italic text-[rgba(255,244,228,0.92)] [text-shadow:0_2px_24px_rgba(0,0,0,0.55)]">
            The mist lets go.
          </p>

          <h2 className="m-0 font-display text-[clamp(48px,8.5vw,116px)] font-medium leading-[0.92] tracking-[-0.02em] text-cream [text-shadow:0_6px_44px_rgba(0,0,0,0.55)]">
            You&apos;ve arrived.
          </h2>

          <div className="mt-[18px] text-[clamp(9px,1.1vw,11px)] uppercase tracking-[0.28em] text-[rgba(255,240,220,0.78)] [text-shadow:0_2px_18px_rgba(0,0,0,0.6)]">
            House of Hulda · Naggar · built in stone &amp; deodar · 2,000m
          </div>

          {/* time-of-day control */}
          <div className="mt-[clamp(22px,3.2vh,34px)] flex flex-col items-center gap-[9px] rounded-[16px] border border-white/20 bg-black/30 px-[22px] py-[13px] backdrop-blur-[8px]">
            <div className="flex items-center gap-[12px] text-[10px] uppercase tracking-[0.22em] text-[rgba(255,244,228,0.78)]">
              <span>Sunrise</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={tod}
                onChange={(e) => setTod(parseFloat(e.target.value))}
                aria-label="Time of day, sunrise to starlight"
                className="w-[min(280px,56vw)] cursor-pointer accent-amber"
              />
              <span>Starlight</span>
            </div>
            <div className="font-display text-[17px] italic text-[rgba(255,244,228,0.95)]">
              {todLabel(tod)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
