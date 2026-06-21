"use client";

import { useRef } from "react";
import { useScrollFrame } from "@/lib/scroll-progress";

/** Thin scroll-progress hairline at the very top — graded amber→ember. */
export function ProgressBar() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollFrame((p) => {
    if (ref.current) ref.current.style.transform = `scaleX(${p})`;
  });
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px]" aria-hidden>
      <div
        ref={ref}
        className="h-full w-full origin-left"
        style={{
          transform: "scaleX(0)",
          background: "linear-gradient(90deg,rgba(217,154,78,0.9),rgba(194,96,58,0.9))",
        }}
      />
    </div>
  );
}
