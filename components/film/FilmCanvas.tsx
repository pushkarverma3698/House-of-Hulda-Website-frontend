"use client";

import { useEffect, useRef } from "react";
import { useScrollFrame, useScrollEngine } from "@/lib/scroll-progress";
import { ScrubEngine, FilmSegment } from "./ScrubEngine";

const FILM_SEGMENTS: FilmSegment[] = [
  { id: "valley-drive", pRange: [0.0, 0.15], totalFrames: 120 },
  { id: "ascent-rise", pRange: [0.15, 0.35], totalFrames: 180 },
  { id: "arrival-gate", pRange: [0.35, 0.55], totalFrames: 240 },
  { id: "suite-entry", pRange: [0.55, 0.70], totalFrames: 150 },
  { id: "hearth-feast", pRange: [0.70, 0.85], totalFrames: 180 },
  { id: "milky-way", pRange: [0.85, 1.00], totalFrames: 200 },
];

/**
 * Navigable Film Canvas Component
 *
 * Renders the 60fps scroll-scrubbed cinematic film backdrop. Decodes video sequences
 * into a single HTML5 canvas with spring physics, making the entire website feel like
 * an interactive, high-end cinema trailer.
 */
export function FilmCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ScrubEngine | null>(null);
  const { reducedMotion } = useScrollEngine();

  useEffect(() => {
    if (!canvasRef.current || reducedMotion) return;

    const engine = new ScrubEngine(FILM_SEGMENTS);
    engine.attachCanvas(canvasRef.current);
    engineRef.current = engine;

    const handleResize = () => engine.resizeCanvas();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      engine.destroy();
    };
  }, [reducedMotion]);

  useScrollFrame((p) => {
    if (engineRef.current) {
      engineRef.current.updateScroll(p);
    }
  });

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full object-cover"
      aria-hidden="true"
    />
  );
}
