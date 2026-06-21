"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useScrollFrame, useScrollEngine } from "@/lib/scroll-progress";
import { clamp01, todSky, todLabel } from "@/lib/grade";
import { track } from "@/lib/analytics";

const TIMES = [
  { t: 0.0, label: "First Light", time: "06:00 AM", desc: "The valley wakes to mist. Quiet tea on the deck as the peaks catch the first sun." },
  { t: 0.35, label: "Golden Hour", time: "05:30 PM", desc: "Warm light pools on hand-carved deodar beams. The homestay glows." },
  { t: 0.7, label: "Blue Dusk", time: "07:15 PM", desc: "A cold wind descends. Lantern lights flicker on in the attic, calling everyone inside." },
  { t: 1.0, label: "Starlight", time: "10:00 PM", desc: "No valley lights, no city glare. The Milky Way sits directly above the deck." },
];

/**
 * ACT II — the signature showpiece, and the emotional payoff of the whole climb.
 *
 * A cinematic, FULL-BLEED photo reveal (no custom 3D). The section is tall and
 * the inner stage is sticky, so the house holds on screen while the mist lets go
 * and the real golden-hour exterior resolves edge-to-edge.
 *
 * It features a glassmorphic Atmosphere Dial. By default, it ambiently drifts sky
 * colors as the guest scrolls. Clicking any time of day switches to manual mode
 * and smoothly crossfades to that lighting state with poetic descriptions.
 */
export function Arrival() {
  const sectionRef = useRef<HTMLElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);
  const houseRef = useRef<HTMLDivElement>(null);
  const photoTintRef = useRef<HTMLDivElement>(null);
  const reachedRef = useRef(false);
  
  const [activeIndex, setActiveIndex] = useState(1); // default to Golden Hour
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  
  const currentTodRef = useRef(0.35);
  const targetTodRef = useRef(0.35);
  const animationFrameRef = useRef<number | null>(null);
  const activeIndexRef = useRef(1);
  const modeRef = useRef<"auto" | "manual">("auto");
  
  const { reducedMotion } = useScrollEngine();

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const animateToTod = (target: number) => {
    targetTodRef.current = target;
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    const startTime = performance.now();
    const startValue = currentTodRef.current;
    const duration = 1000; // 1s smooth transition

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing: easeInOutCubic
      const ease = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const val = startValue + (target - startValue) * ease;
      currentTodRef.current = val;
      
      if (photoTintRef.current) {
        photoTintRef.current.style.background = todSky(val);
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(tick);
      } else {
        animationFrameRef.current = null;
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(tick);
  };

  useScrollFrame(() => {
    const el = sectionRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const num = vh * 0.5 - r.top;

    // reveal: 0 as the stage enters → 1 once the house is fully held in view
    const local = clamp01(num / (r.height * 0.42));

    if (mistRef.current) mistRef.current.style.opacity = (1 - local).toFixed(3);
    if (houseRef.current) {
      houseRef.current.style.opacity = (0.25 + local * 0.75).toFixed(3);
      houseRef.current.style.transform = reducedMotion
        ? "scale(1)"
        : `scale(${(1.09 - local * 0.09).toFixed(4)})`;
    }

    if (modeRef.current === "auto") {
      // ambient time-of-day: drifts automatically while the house holds.
      const tod = clamp01(num / (r.height - vh * 0.5));
      currentTodRef.current = tod;
      targetTodRef.current = tod;
      if (photoTintRef.current) photoTintRef.current.style.background = todSky(tod);

      // Find closest index
      let closestIdx = 0;
      let minDiff = 999;
      TIMES.forEach((item, idx) => {
        const diff = Math.abs(item.t - tod);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });

      if (closestIdx !== activeIndexRef.current) {
        activeIndexRef.current = closestIdx;
        setActiveIndex(closestIdx);
      }
    }

    if (local > 0.6 && !reachedRef.current) {
      reachedRef.current = true;
      track("reach_arrival");
    }
  });

  const selectTime = (index: number) => {
    setMode("manual");
    activeIndexRef.current = index;
    setActiveIndex(index);
    animateToTod(TIMES[index].t);
    track("cta_click", { action: "select_tod", label: TIMES[index].label });
  };

  const resumeAuto = () => {
    setMode("auto");
    const el = sectionRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const num = vh * 0.5 - r.top;
    const tod = clamp01(num / (r.height - vh * 0.5));
    animateToTod(tod);
    track("cta_click", { action: "resume_auto_tod" });
  };

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
          {/* automatic time-of-day tint over the photo — light at golden hour so the
              real photo stays vivid, deepening toward starlight as you scroll on */}
          <div
            ref={photoTintRef}
            className="pointer-events-none absolute inset-0 opacity-45 mix-blend-soft-light transition-all"
            style={{ background: todSky(0.35) }}
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

          {/* Atmosphere Dial Panel */}
          <div className="mt-[clamp(24px,3.8vh,36px)] w-full max-w-[480px] rounded-[24px] border border-white/10 bg-black/40 p-[20px] backdrop-blur-[16px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between border-b border-white/8 pb-[10px] mb-[16px]">
              <span className="text-[9px] uppercase tracking-[0.25em] text-white/50 flex items-center gap-[6px]">
                <span className={`h-[5px] w-[5px] rounded-full ${mode === "auto" ? "bg-amber animate-pulse" : "bg-white/40"}`} />
                {mode === "auto" ? "Ambient Drift (Active)" : "Manual Light Control"}
              </span>
              {mode === "manual" && (
                <button
                  onClick={resumeAuto}
                  className="text-[9px] uppercase tracking-[0.14em] text-amber underline decoration-amber/30 underline-offset-4 hover:text-amber/80 transition-colors"
                >
                  Resume Drift
                </button>
              )}
            </div>

            {/* Buttons Row */}
            <div className="grid grid-cols-4 gap-[8px]">
              {TIMES.map((item, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <button
                    key={item.label}
                    onClick={() => selectTime(idx)}
                    className="flex flex-col items-center group cursor-pointer"
                    aria-label={`Set atmosphere to ${item.label}`}
                  >
                    <div
                      className={`w-[42px] h-[42px] rounded-full border flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? "border-amber bg-amber/20 text-amber shadow-[0_0_15px_rgba(217,154,78,0.4)]"
                          : "border-white/10 bg-white/5 text-white/60 group-hover:border-white/30 group-hover:bg-white/10 group-hover:text-white"
                      }`}
                    >
                      {idx === 0 && (
                        <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 12v3M4.22 4.22l2.12 2.12m11.32 11.32l2.12 2.12M3 12h3m12 0h3M4.22 19.78l2.12-2.12m11.32-11.32l2.12-2.12" />
                          <circle cx="12" cy="12" r="4" />
                        </svg>
                      )}
                      {idx === 1 && (
                        <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="5" fill="currentColor" className="opacity-20" />
                          <circle cx="12" cy="12" r="5" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
                        </svg>
                      )}
                      {idx === 2 && (
                        <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.07a8.6 8.6 0 0 1-.72 2.63 8.5 8.5 0 1 1-6.42-6.42 8.6 8.6 0 0 1 2.63-.72 8.5 8.5 0 0 0 4.51 4.51Z" />
                        </svg>
                      )}
                      {idx === 3 && (
                        <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3.096 15 8.187 14.187 9 9l.813 5.187L14.904 15l-5.091.904zM19.071 4.929l-.353 2.213-2.213.353 2.213.353.353 2.213.353-2.213 2.213-.353-2.213-.353-.353-2.213z" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-[10px] font-semibold tracking-[0.06em] mt-[6px] transition-colors ${isActive ? "text-amber" : "text-white/40 group-hover:text-white/70"}`}>
                      {item.label}
                    </span>
                    <span className="text-[8px] font-mono text-white/20 mt-[1px]">
                      {item.time}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Description Block */}
            <div className="mt-[16px] min-h-[44px] text-left border-t border-white/5 pt-[12px] flex flex-col justify-center">
              <p className="m-0 font-display italic text-[14px] leading-[1.4] text-cream/90 transition-all duration-300">
                {TIMES[activeIndex].desc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
