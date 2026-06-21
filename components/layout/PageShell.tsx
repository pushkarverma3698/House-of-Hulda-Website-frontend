import Link from "next/link";
import { BUSINESS, whatsappLink } from "@/lib/site-config";

/**
 * Static cinematic chrome for the content routes (/stay, /cafe, /naggar, /blog).
 * No scroll engine here — these are calm, readable cluster pages that still wear
 * the house's dark, warm, deodar-and-lantern aesthetic.
 */
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      {/* fixed graded backdrop */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 80% at 50% -10%, rgba(217,154,78,0.10), transparent 55%), linear-gradient(180deg, #0a0f17 0%, #0d1119 55%, #120f0c 100%)",
        }}
      />

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/8 bg-[rgba(10,15,23,0.62)] px-[clamp(20px,4vw,52px)] py-[18px] backdrop-blur-[10px]">
        <Link href="/" className="block no-underline">
          <div className="font-display text-[20px] font-semibold leading-none tracking-[0.02em] text-cream">
            House&nbsp;of&nbsp;Hulda
          </div>
          <div className="mt-[5px] text-[9px] uppercase tracking-[0.34em] text-cream/55">
            Naggar · Manali
          </div>
        </Link>
        <nav className="flex items-center gap-[clamp(12px,2vw,26px)] text-[11px] uppercase tracking-[0.16em] text-cream/70">
          <Link href="/stay" className="hidden transition-colors hover:text-cream sm:inline">Stay</Link>
          <Link href="/cafe" className="hidden transition-colors hover:text-cream sm:inline">Café</Link>
          <Link href="/naggar" className="hidden transition-colors hover:text-cream sm:inline">Naggar</Link>
          <Link href="/blog" className="hidden transition-colors hover:text-cream sm:inline">Journal</Link>
          <Link
            href="/#the-invitation"
            className="rounded-full bg-cream/95 px-[16px] py-[9px] text-[10px] font-bold tracking-[0.16em] text-ink transition-transform hover:scale-[1.03]"
          >
            Reserve
          </Link>
        </nav>
      </header>

      <main className="relative z-[1]">{children}</main>

      <footer className="border-t border-white/10 px-[clamp(20px,5vw,40px)] py-[48px]">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-end justify-between gap-[24px]">
          <div>
            <div className="font-display text-[22px] font-semibold leading-none text-cream">House of Hulda</div>
            <div className="mt-[10px] text-[11px] uppercase tracking-[0.2em] text-cream/55">
              Naggar · Manali · Himachal Pradesh · 2,000m
            </div>
            <div className="mt-[12px] flex flex-wrap items-center gap-[14px] text-[12px] text-cream/70">
              <a
                href={whatsappLink("Hello House of Hulda! I'd love to know more about staying with you.")}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-cream"
              >
                {BUSINESS.phoneDisplay}
              </a>
              <span className="text-cream/25">·</span>
              <a href={`mailto:${BUSINESS.email}`} className="transition-colors hover:text-cream">
                {BUSINESS.email}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-[18px] text-[11px] uppercase tracking-[0.14em] text-cream/60">
            <a href={BUSINESS.social.instagram} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-cream">
              Instagram
            </a>
            <a href={BUSINESS.social.airbnb} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-cream">
              Airbnb
            </a>
            <Link href="/#the-invitation" className="transition-colors hover:text-cream">Reserve</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
