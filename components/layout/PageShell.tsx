import Link from "next/link";
import { BUSINESS, whatsappLink } from "@/lib/site-config";
import { PageHeader } from "./PageHeader";

const NAV = [
  { href: "/stay", label: "Stay" },
  { href: "/cafe", label: "Café" },
  { href: "/naggar", label: "Naggar" },
  { href: "/blog", label: "Journal" },
];

/**
 * Warm editorial chrome for the content routes (/stay, /cafe, /naggar, /blog).
 *
 * The cinematic homepage stays dark; these pages flip to a bright, printed-paper
 * world — bone stock, deodar-brown ink, terracotta accents — the way a boutique
 * mountain stay actually presents itself. A barely-there paper grain + warm
 * vignette keep the background from reading as flat white. The footer drops back
 * into deep deodar so the page closes on a warm, grounded note.
 */
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-bone text-bark">
      <div aria-hidden className="paper-vignette" />
      <div aria-hidden className="paper-grain" />

      <PageHeader />

      <main className="relative z-[3]">{children}</main>

      <footer className="relative z-[3] mt-[clamp(60px,12vh,140px)] bg-bark text-[rgba(246,241,231,0.92)]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-start justify-between gap-[36px] px-[clamp(20px,5vw,56px)] py-[clamp(48px,8vh,84px)]">
          <div className="max-w-[34ch]">
            <div className="font-display text-[26px] font-semibold leading-none text-parchment">House of Hulda</div>
            <div className="mt-[12px] text-[11px] uppercase tracking-[0.2em] text-cream/55">
              Naggar · Manali · Himachal Pradesh · 2,000m
            </div>
            <p className="mt-[16px] text-[14px] font-light leading-[1.7] text-cream/70">
              A hand-built kathkuni home in stone and deodar — rooms, an attic café and a table for
              everyone, held open above the Kullu valley.
            </p>
            <div className="mt-[18px] flex flex-wrap items-center gap-[14px] text-[13px]">
              <a
                href={whatsappLink("Hello House of Hulda! I'd love to know more about staying with you.")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/85 transition-colors hover:text-amber"
              >
                {BUSINESS.phoneDisplay}
              </a>
              <span className="text-cream/25">·</span>
              <a href={`mailto:${BUSINESS.email}`} className="text-cream/85 transition-colors hover:text-amber">
                {BUSINESS.email}
              </a>
            </div>
          </div>

          <div className="flex flex-col items-start gap-[16px] md:items-end">
            <nav className="flex flex-wrap gap-[18px] text-[11px] uppercase tracking-[0.16em] text-cream/65">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="transition-colors hover:text-amber">
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-wrap items-center gap-[16px] text-[11px] uppercase tracking-[0.14em] text-cream/65">
              <a
                href={BUSINESS.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-amber"
                aria-label="Directions to House of Hulda, Naggar"
              >
                Directions
              </a>
              <a href={BUSINESS.social.instagram} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-amber">
                Instagram
              </a>
              <a href={BUSINESS.social.airbnb} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-amber">
                Airbnb
              </a>
            </div>
            <Link
              href="/#the-invitation"
              className="mt-[6px] rounded-full bg-amber/10 border border-amber/30 px-[22px] py-[12px] text-[11px] font-bold uppercase tracking-[0.1em] text-amber transition-all shadow-[0_0_15px_rgba(217,154,78,0.15)] hover:bg-amber/20 hover:border-amber/60 hover:shadow-[0_0_20px_rgba(217,154,78,0.4)] active:scale-95"
            >
              Reserve your stay
            </Link>
          </div>
        </div>
        <div className="border-t border-cream/10 px-[clamp(20px,5vw,56px)] py-[20px] text-[11px] text-cream/40">
          <div className="mx-auto max-w-[1200px]">
            © {new Date().getFullYear()} {BUSINESS.legalName} · Naggar, Himachal Pradesh
          </div>
        </div>
      </footer>
    </div>
  );
}
