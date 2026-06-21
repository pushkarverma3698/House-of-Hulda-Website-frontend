import { Reveal } from "@/components/ui/Reveal";
import { Placeholder } from "@/components/ui/Placeholder";

/**
 * ACT IV — the café & table. Food is a real hero here: authentic Himachali home
 * cooking, communal breakfasts, and the daytime café in the attic-loft.
 */
export function TheTable() {
  return (
    <section
      id="the-table"
      aria-label="Act IV · The Hulda Café & Table"
      className="mx-auto min-h-[120vh] max-w-[1240px] px-[clamp(20px,5vw,40px)] py-[16vh]"
    >
      <div className="grid items-center gap-[clamp(28px,5vw,72px)] md:[grid-template-columns:1.15fr_0.85fr]">
        <Reveal className="relative">
          <div className="relative h-[clamp(360px,64vh,640px)] overflow-hidden rounded-[14px] shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
            <Placeholder
              label="A Himachali thali — siddu, red rice, dal, chai"
              src="/images/table-himachali.jpg"
              alt="Himachali thali at House of Hulda — siddu, rajma, red rice, dal and chai in clay cups on a low wooden café table"
              radius={14}
              tone="fire"
            />
          </div>
          {/* steam */}
          <div
            className="pointer-events-none absolute h-[60px] w-[8px] rounded-full"
            style={{
              left: "46%",
              top: "28%",
              background: "linear-gradient(0deg,rgba(255,240,220,0),rgba(255,240,220,0.5))",
              filter: "blur(5px)",
              animation: "steamRise 4.2s ease-in infinite",
            }}
          />
          <div
            className="pointer-events-none absolute h-[50px] w-[7px] rounded-full"
            style={{
              left: "54%",
              top: "30%",
              background: "linear-gradient(0deg,rgba(255,240,220,0),rgba(255,240,220,0.45))",
              filter: "blur(5px)",
              animation: "steamRise 5s ease-in infinite 1.2s",
            }}
          />
        </Reveal>

        <div>
          <Reveal className="mb-[18px] text-[11px] uppercase tracking-[0.34em] text-[rgba(255,210,160,0.7)]">
            The Hulda Café &amp; Table
          </Reveal>
          <Reveal
            as="h2"
            delay={0.1}
            className="m-0 font-display text-[clamp(34px,4.6vw,64px)] font-medium leading-[1.05] tracking-[-0.01em]"
          >
            The reason people stay an extra night.
          </Reveal>
          <Reveal
            as="p"
            delay={0.2}
            className="mb-0 mt-[26px] font-display text-[clamp(18px,2vw,24px)] italic leading-[1.5] text-cream/85"
          >
            Himachali home cooking, from the valley and the orchard.
          </Reveal>
          <Reveal
            as="p"
            delay={0.25}
            className="mb-0 mt-[18px] max-w-[42ch] text-[15px] font-light leading-[1.7] text-cream/75"
          >
            Communal breakfasts on the orchard side, slow home-cooked dinners, and a daytime
            café in the attic-loft — low tables, floor cushions, chai that never quite ends.
          </Reveal>
          <Reveal delay={0.3} className="mt-[30px]">
            <a
              href="#the-invitation"
              className="text-[12px] uppercase tracking-[0.14em] text-cream underline decoration-[rgba(217,154,78,0.7)] underline-offset-[6px]"
            >
              Find your stay →
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
