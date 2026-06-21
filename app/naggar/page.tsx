import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Naggar, Himachal — Things to Do Near Manali",
  description:
    "A quiet guide to Naggar, near Manali: the Roerich gallery, apple orchards, hidden waterfall trails, the Naggar Castle, stargazing and how to reach the valley at 2,000m.",
  alternates: { canonical: "/naggar" },
};

const THINGS = [
  { title: "The Roerich Gallery", text: "The home and mountain studio of painter Nicholas Roerich — a short, beautiful walk from the house." },
  { title: "Naggar Castle", text: "A 500-year-old stone-and-wood castle above the Beas, all carved balconies and valley views." },
  { title: "Apple orchards", text: "Pick straight from our own trees in season; the whole hillside turns to fruit in autumn." },
  { title: "Hidden waterfall trails", text: "Quiet paths that end where the water does — pack tea and make a morning of it." },
  { title: "Bonfire nights", text: "Wool blankets, embers and no hurry, on the deck under a wide dark sky." },
  { title: "Stargazing", text: "At 2,000m with little light, the whole sky comes out over the deck." },
];

export default function NaggarPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-[1100px] px-[clamp(20px,5vw,40px)] pt-[clamp(60px,12vh,120px)]">
        <div className="text-[11px] uppercase tracking-[0.34em] text-amber/80">Naggar · Himachal Pradesh</div>
        <h1 className="mt-[16px] max-w-[16ch] font-display text-[clamp(40px,7vw,82px)] font-medium leading-[1.02] tracking-[-0.02em] text-cream">
          Days are for wandering.
        </h1>
        <p className="mt-[22px] max-w-[60ch] text-[clamp(16px,1.9vw,19px)] font-light leading-[1.75] text-cream/80">
          Naggar sits about 22 km from Manali — an old capital of the Kullu valley, set quietly above
          the Beas at 2,000m. It&apos;s the slower, greener side of the mountain: an artist&apos;s
          legacy, a heritage castle, orchards, waterfall trails and the kind of dark sky you forget
          exists. Everything below is a short walk or a short drive from House of Hulda.
        </p>
      </section>

      <section className="mx-auto mt-[clamp(48px,9vh,96px)] max-w-[1100px] px-[clamp(20px,5vw,40px)]">
        <div className="grid gap-[clamp(18px,2.6vw,28px)] sm:grid-cols-2 lg:grid-cols-3">
          {THINGS.map((t) => (
            <div key={t.title} className="rounded-[14px] border border-white/10 bg-white/[0.03] p-[clamp(20px,3vw,28px)]">
              <div className="mb-[14px] h-[8px] w-[8px] rounded-full bg-amber/80 shadow-[0_0_14px_3px_rgba(217,154,78,0.5)]" />
              <h2 className="m-0 font-display text-[22px] font-medium text-cream">{t.title}</h2>
              <p className="mt-[10px] text-[14px] font-light leading-[1.7] text-cream/75">{t.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-[clamp(56px,10vh,110px)] max-w-[1100px] px-[clamp(20px,5vw,40px)]">
        <div className="rounded-[18px] border border-white/10 bg-white/[0.03] p-[clamp(24px,4vw,44px)]">
          <h2 className="font-display text-[clamp(24px,3.2vw,36px)] font-medium text-cream">How to reach Naggar</h2>
          <p className="mt-[16px] max-w-[64ch] text-[15px] font-light leading-[1.8] text-cream/80">
            Fly or drive to Manali, then it&apos;s a 45-minute taxi or local bus to Naggar — about
            22 km along the left bank of the Beas. The nearest airport is Bhuntar (Kullu–Manali),
            roughly an hour away. Tell us your arrival and we&apos;ll send directions to the house and
            help arrange a pickup.
          </p>
          <div className="mt-[20px] flex flex-wrap gap-[12px]">
            <Link href="/blog/things-to-do-naggar" className="rounded-full border border-white/18 px-[15px] py-[9px] text-[11px] uppercase tracking-[0.12em] text-cream/80 transition-colors hover:border-amber/60 hover:text-cream">
              12 quiet things to do
            </Link>
            <Link href="/blog/where-to-stay-naggar" className="rounded-full border border-white/18 px-[15px] py-[9px] text-[11px] uppercase tracking-[0.12em] text-cream/80 transition-colors hover:border-amber/60 hover:text-cream">
              Where to stay in Naggar
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-[clamp(56px,10vh,110px)] max-w-[1100px] px-[clamp(20px,5vw,40px)] pb-[clamp(40px,8vh,90px)] text-center">
        <h2 className="mx-auto max-w-[20ch] font-display text-[clamp(28px,4vw,52px)] font-medium leading-[1.08] text-cream">
          Make the house your base camp.
        </h2>
        <Link
          href="/#the-invitation"
          className="mt-[28px] inline-block rounded-full bg-amber px-[30px] py-[16px] text-[12px] font-bold uppercase tracking-[0.14em] text-ink shadow-[0_10px_30px_rgba(217,154,78,0.28)] transition-transform hover:scale-[1.03]"
        >
          Reserve your stay
        </Link>
      </section>
    </PageShell>
  );
}
