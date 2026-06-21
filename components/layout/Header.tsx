"use client";

import { track } from "@/lib/analytics";

/** Persistent header — logo + a Reserve action reachable at any scroll position. */
export function Header() {
  const toBooking = () => {
    track("cta_click", { source: "header_reserve" });
    document.getElementById("the-invitation")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[55] flex items-center justify-between px-[clamp(20px,4vw,52px)] py-[22px]">
      <a href="#threshold" className="pointer-events-auto block no-underline">
        <div className="font-display text-[22px] font-semibold leading-none tracking-[0.02em] text-cream [text-shadow:0_2px_18px_rgba(0,0,0,0.45)]">
          House&nbsp;of&nbsp;Hulda
        </div>
        <div className="mt-[5px] text-[9.5px] uppercase tracking-[0.34em] text-cream/60">
          Naggar · Manali
        </div>
      </a>
      <button
        onClick={toBooking}
        className="pointer-events-auto rounded-full bg-cream/95 px-[19px] py-[11px] text-[10.5px] font-bold uppercase tracking-[0.18em] text-ink shadow-[0_6px_26px_rgba(0,0,0,0.32)] transition-transform hover:scale-[1.03]"
      >
        Reserve
      </button>
    </header>
  );
}
