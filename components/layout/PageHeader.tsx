"use client";

import Link from "next/link";
import { useState } from "react";

const NAV = [
  { href: "/stay", label: "Stay" },
  { href: "/cafe", label: "Café" },
  { href: "/naggar", label: "Naggar" },
  { href: "/blog", label: "Journal" },
];

export function PageHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-bark/8 bg-[rgba(246,241,231,0.82)] backdrop-blur-[12px]">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-[clamp(20px,5vw,56px)] py-[15px]">
        <Link href="/" className="block no-underline">
          <div className="font-display text-[21px] font-semibold leading-none tracking-[0.01em] text-bark">
            House&nbsp;of&nbsp;Hulda
          </div>
          <div className="mt-[5px] text-[9px] uppercase tracking-[0.34em] text-deodar/70">
            Naggar · Manali
          </div>
        </Link>
        <nav className="flex items-center gap-[clamp(14px,2vw,28px)] text-[11px] uppercase tracking-[0.16em] text-deodar">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hidden transition-colors hover:text-clay sm:inline">
              {n.label}
            </Link>
          ))}
          <Link
            href="/#the-invitation"
            className="rounded-full bg-amber/10 border border-amber/30 px-[17px] py-[9px] text-[10px] font-bold tracking-[0.1em] text-amber transition-all shadow-[0_0_15px_rgba(217,154,78,0.15)] hover:bg-amber/20 hover:border-amber/60 hover:shadow-[0_0_20px_rgba(217,154,78,0.4)] active:scale-95"
          >
            Reserve
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            className="sm:hidden p-1.5 rounded-full border border-bark/15 text-bark flex items-center justify-center transition-colors hover:bg-bark/5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </nav>
      </div>

      {menuOpen && (
        <div className="absolute top-full right-[clamp(20px,5vw,56px)] mt-2 w-48 bg-bone border border-bark/10 rounded-2xl p-4 flex flex-col gap-3 shadow-[0_15px_40px_-20px_rgba(46,33,23,0.15)] sm:hidden animate-in fade-in zoom-in-95 duration-200 z-50">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setMenuOpen(false)}
              className="text-[12px] uppercase tracking-[0.16em] text-deodar hover:text-clay py-1 border-b border-bark/5 last:border-0"
            >
              {n.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
