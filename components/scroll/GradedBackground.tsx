"use client";

import { useRef } from "react";
import { useScrollFrame, useScrollEngine } from "@/lib/scroll-progress";
import { gradeAt, starOpacity, clamp01 } from "@/lib/grade";

/**
 * The fixed, full-viewport graded background — what makes the whole page feel
 * like one continuous shot. Reads scroll progress every frame and mutates only
 * `transform`, `opacity`, and `background` (GPU-friendly; never layout).
 *
 * Layers, back to front: sky gradient · starfield · parallax ridgelines
 * (far→near + trees) · drifting mist · the recurring warm window-light.
 */
export function GradedBackground() {
  const skyRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const mtnRef = useRef<HTMLDivElement>(null);
  const farRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const nearRef = useRef<HTMLDivElement>(null);
  const treesRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  const { reducedMotion } = useScrollEngine();

  useScrollFrame((p) => {
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;

    const g = gradeAt(p);
    if (skyRef.current)
      skyRef.current.style.background = `linear-gradient(180deg, ${g.top} 0%, ${g.mid} 52%, ${g.bot} 100%)`;

    if (starsRef.current) starsRef.current.style.opacity = String(starOpacity(p));

    if (!reducedMotion) {
      const tr = (el: HTMLDivElement | null, frac: number) => {
        if (el) el.style.transform = `translate3d(0, ${p * frac * vh}px, 0)`;
      };
      tr(treesRef.current, 0.85);
      tr(nearRef.current, 0.52);
      tr(midRef.current, 0.3);
      tr(farRef.current, 0.13);
    }
    // ridgelines fade out as we crest into Arrival
    if (mtnRef.current)
      mtnRef.current.style.opacity = String(1 - clamp01((p - 0.34) / 0.16));

    // the warm window-light motif — grows closer through threshold→arrival,
    // then we go "inside" and it dims.
    const w = windowRef.current;
    if (w) {
      const near = clamp01(p / 0.34);
      const op = p < 0.4 ? 0.5 + near * 0.5 : Math.max(0, 0.62 - (p - 0.4) * 1.4);
      w.style.opacity = op.toFixed(3);
      w.style.top = `${26 + near * 15}%`;
      if (!reducedMotion)
        w.style.transform = `translate(-50%,-50%) scale(${(0.5 + near * 1.5).toFixed(3)})`;
    }
  });

  return (
    <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* sky gradient */}
      <div
        ref={skyRef}
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgb(20,30,45) 0%, rgb(54,72,92) 52%, rgb(183,196,205) 100%)",
        }}
      />

      {/* starfield */}
      <div
        ref={starsRef}
        className="absolute inset-0 opacity-0 transition-opacity duration-700"
        style={{
          backgroundImage:
            "radial-gradient(1.4px 1.4px at 12% 18%,#fff,transparent),radial-gradient(1.2px 1.2px at 28% 9%,#cfe0ff,transparent),radial-gradient(1.6px 1.6px at 41% 24%,#fff,transparent),radial-gradient(1px 1px at 57% 12%,#fff,transparent),radial-gradient(1.5px 1.5px at 68% 28%,#e9f0ff,transparent),radial-gradient(1.1px 1.1px at 79% 8%,#fff,transparent),radial-gradient(1.7px 1.7px at 88% 22%,#fff,transparent),radial-gradient(1px 1px at 7% 38%,#fff,transparent),radial-gradient(1.3px 1.3px at 34% 44%,#fff,transparent),radial-gradient(1.5px 1.5px at 62% 40%,#fff,transparent),radial-gradient(1.1px 1.1px at 92% 46%,#cfe0ff,transparent),radial-gradient(1.2px 1.2px at 50% 33%,#fff,transparent)",
        }}
      />

      {/* parallax ridgelines */}
      <div ref={mtnRef} className="absolute inset-0">
        <div
          ref={farRef}
          className="absolute bottom-0 will-change-transform"
          style={{
            left: "-4%",
            right: "-4%",
            height: "78%",
            background: "linear-gradient(180deg,rgba(86,104,124,0.78),rgba(58,74,92,0.92))",
            clipPath:
              "polygon(0 56%,12% 38%,22% 48%,33% 30%,45% 43%,56% 29%,68% 41%,80% 33%,90% 46%,100% 39%,100% 100%,0 100%)",
          }}
        />
        <div
          ref={midRef}
          className="absolute bottom-0 will-change-transform"
          style={{
            left: "-4%",
            right: "-4%",
            height: "66%",
            background: "linear-gradient(180deg,rgba(46,60,76,0.92),rgba(30,40,54,0.98))",
            clipPath:
              "polygon(0 70%,10% 58%,20% 67%,30% 50%,42% 63%,52% 52%,63% 65%,74% 54%,85% 67%,95% 58%,100% 65%,100% 100%,0 100%)",
          }}
        />
        <div
          ref={nearRef}
          className="absolute bottom-0 will-change-transform"
          style={{
            left: "-4%",
            right: "-4%",
            height: "52%",
            background: "linear-gradient(180deg,rgba(20,27,38,0.96),rgba(10,14,22,1))",
            clipPath:
              "polygon(0 86%,8% 76%,18% 85%,28% 72%,38% 83%,50% 70%,60% 81%,72% 72%,82% 83%,92% 74%,100% 81%,100% 100%,0 100%)",
          }}
        />
        {/* foreground trees — hidden on small screens to cut layer count (mobile perf) */}
        <div
          ref={treesRef}
          className="absolute bottom-0 hidden will-change-transform sm:block"
          style={{
            left: "-2%",
            right: "-2%",
            height: "26%",
            background: "linear-gradient(180deg,rgba(7,10,16,0.9),rgba(4,6,10,1))",
            clipPath:
              "polygon(0 60%,4% 34%,7% 58%,11% 28%,15% 56%,19% 22%,23% 54%,28% 30%,32% 56%,37% 24%,42% 54%,47% 32%,52% 52%,57% 26%,62% 56%,67% 30%,72% 54%,77% 22%,82% 56%,87% 30%,91% 54%,95% 28%,100% 56%,100% 100%,0 100%)",
          }}
        />
      </div>

      {/* drifting mist — the universal transition material */}
      <div
        className="absolute"
        style={{
          left: "-12%",
          right: "-12%",
          top: "18%",
          height: "46%",
          background: "radial-gradient(70% 100% at 50% 50%,rgba(225,232,238,0.4),rgba(225,232,238,0) 70%)",
          filter: "blur(8px)",
          animation: "mistDriftA 34s ease-in-out infinite",
          willChange: "transform",
        }}
      />
      <div
        className="absolute"
        style={{
          left: "-12%",
          right: "-12%",
          bottom: "-6%",
          height: "54%",
          background: "radial-gradient(80% 100% at 50% 100%,rgba(214,224,231,0.62),rgba(214,224,231,0) 72%)",
          filter: "blur(6px)",
          animation: "mistDriftB 28s ease-in-out infinite",
          willChange: "transform",
        }}
      />

      {/* the recurring warm window-light */}
      <div
        ref={windowRef}
        className="pointer-events-none absolute will-change-transform"
        style={{ left: "62%", top: "26%", width: 120, height: 120, opacity: 0.55, transform: "translate(-50%,-50%) scale(0.5)" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle,rgba(255,196,120,0.95),rgba(255,170,70,0.5) 28%,rgba(255,150,50,0) 68%)",
            animation: "windowFlicker 5.5s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );
}
