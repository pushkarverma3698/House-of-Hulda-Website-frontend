"use client";

/**
 * The scroll engine's heart: a single source of normalized scroll progress
 * (0→1) plus a frame-subscription model. Components that animate per-frame
 * (graded background, parallax, altitude counter, progress bar) register a
 * callback and mutate the DOM directly via refs — we never re-render React on
 * scroll, which keeps the cinematic 60fps on mid-range phones.
 *
 * Smooth scroll via Lenis, disabled under prefers-reduced-motion.
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import Lenis from "lenis";

type FrameCallback = (progress: number) => void;

interface ScrollEngine {
  subscribe: (cb: FrameCallback) => () => void;
  /** latest progress, readable on demand (e.g. for initial paint) */
  current: () => number;
  reducedMotion: boolean;
}

const ScrollContext = createContext<ScrollEngine | null>(null);

export function useScrollEngine(): ScrollEngine {
  const ctx = useContext(ScrollContext);
  if (!ctx) throw new Error("useScrollEngine must be used within <ScrollProvider>");
  return ctx;
}

/** Register a per-frame callback; auto-unsubscribes on unmount. */
export function useScrollFrame(cb: FrameCallback): void {
  const engine = useScrollEngine();
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(() => {
    return engine.subscribe((p) => ref.current(p));
  }, [engine]);
}

export function ScrollProvider({ children }: { children: ReactNode }) {
  const subsRef = useRef(new Set<FrameCallback>());
  const progressRef = useRef(0);
  const reducedRef = useRef(false);

  const engineRef = useRef<ScrollEngine>({
    subscribe: (cb) => {
      subsRef.current.add(cb);
      cb(progressRef.current);
      return () => subsRef.current.delete(cb);
    },
    current: () => progressRef.current,
    reducedMotion: false,
  });

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    reducedRef.current = reduced;
    engineRef.current.reducedMotion = reduced;

    const compute = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight || 1;
      const p = Math.max(0, Math.min(1, window.scrollY / max));
      progressRef.current = p;
      subsRef.current.forEach((cb) => cb(p));
    };

    let lenis: Lenis | null = null;
    let rafId = 0;
    let scrollScheduled = false;

    if (reduced) {
      // Native scroll, rAF-throttled — no smoothing, story intact.
      const onScroll = () => {
        if (scrollScheduled) return;
        scrollScheduled = true;
        requestAnimationFrame(() => {
          scrollScheduled = false;
          compute();
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      compute();
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    }

    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on("scroll", compute);
    const raf = (time: number) => {
      lenis?.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    window.addEventListener("resize", compute, { passive: true });
    compute();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", compute);
      lenis?.destroy();
    };
  }, []);

  return (
    <ScrollContext.Provider value={engineRef.current}>
      {children}
    </ScrollContext.Provider>
  );
}
