import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { EditorialHero } from "@/components/editorial/EditorialHero";
import { PhotoBand } from "@/components/editorial/PhotoBand";
import { breadcrumbJsonLd } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Naggar, Himachal — Things to Do Near Manali",
  description:
    "A quiet guide to Naggar, near Manali: the Roerich gallery, apple orchards, hidden waterfall trails, the Naggar Castle, stargazing and how to reach the valley at 2,000m.",
  alternates: { canonical: "/naggar" },
};

const THINGS = [
  { title: "The Roerich Gallery", text: "The home and mountain studio of painter Nicholas Roerich — a short, beautiful walk from the house through deodar trees." },
  { title: "Naggar Castle", text: "A 500-year-old stone-and-wood castle above the Beas, featuring traditional wood-carved balconies and expansive valley views." },
  { title: "Hidden waterfall trails", text: "Quiet paths through the pine forest that end where the water does — pack tea and make a morning of it." },
  { title: "Bonfire nights", text: "Wool blankets, crackling deodar logs, and no hurry, on our open deck under a wide dark sky." },
  { title: "Stargazing at 2,000m", text: "With little light pollution, the whole sky comes out over the deck. Spot constellations and the Milky Way." },
  { title: "Local Temples", text: "Ancient wood-and-stone temples like Tripura Sundari, built in beautiful pagoda style, steps from the house." },
];

export default function NaggarPage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Naggar", url: "/naggar" },
  ]);

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <EditorialHero
        src="/images/naggar-valley.jpg"
        alt="Deep green pine valleys and layered misty mountain ranges in Naggar, Manali"
        eyebrow="Naggar · Himachal Pradesh"
        title="Days are for wandering."
        intro="Naggar sits quietly above the Beas river at 2,000m — the slower, greener side of the mountain. An old capital of the Kullu valley, it offers an artist's legacy, a heritage castle, orchards, and forest trails. Everything below is a short walk or drive from House of Hulda."
        meta="2,000m Altitude · 22 km from Manali"
      />

      {/* local orchards photoband */}
      <div className="mt-[clamp(56px,10vh,110px)]">
        <PhotoBand
          src="/images/orchard-golden.jpg"
          alt="Golden evening sunlight filtering through apple orchard trees in Naggar, Himachal Pradesh"
          eyebrow="Seasonal Harvest"
          title="A valley made of orchards."
          caption="Our backyard orchard · Naggar"
        >
          <p>
            The hillside surrounding House of Hulda is covered in apple, plum, peach, and apricot trees. In the spring, the valley fills with soft pink and white blossoms. By late summer and autumn, the branches hang heavy with ripe organic fruit.
          </p>
          <p>
            Guests are welcome to wander the orchard, read under the shade of the trees, and pick fresh apples straight from the branch.
          </p>
        </PhotoBand>
      </div>

      {/* things to do */}
      <section className="mx-auto mt-[clamp(60px,11vh,120px)] max-w-[1200px] px-[clamp(20px,5vw,56px)]">
        <h2 className="kicker-rule font-display text-[clamp(26px,3.4vw,40px)] font-medium text-bark">Local Guide</h2>
        <div className="mt-[28px] grid gap-[clamp(18px,2.6vw,28px)] sm:grid-cols-2 lg:grid-cols-3">
          {THINGS.map((t) => (
            <div key={t.title} className="rounded-[16px] border border-bark/8 bg-sand/20 p-[clamp(20px,3.5vw,32px)] shadow-[0_15px_40px_-20px_rgba(46,33,23,0.12)]">
              <div className="mb-[14px] h-[6px] w-[6px] rounded-full bg-clay" />
              <h3 className="m-0 font-display text-[22px] font-medium text-bark">{t.title}</h3>
              <p className="mt-[10px] text-[14px] font-light leading-[1.7] text-deodar">{t.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* reach details */}
      <section className="mx-auto mt-[clamp(60px,11vh,120px)] max-w-[1200px] px-[clamp(20px,5vw,56px)]">
        <div className="rounded-[20px] border border-bark/8 bg-sand/20 p-[clamp(24px,4vw,44px)] shadow-[0_20px_50px_-25px_rgba(46,33,23,0.15)]">
          <h2 className="font-display text-[clamp(24px,3.2vw,36px)] font-medium text-bark">How to reach Naggar</h2>
          <p className="mt-[16px] max-w-[64ch] text-[15px] font-light leading-[1.8] text-deodar">
            Fly to Bhuntar airport (Kullu–Manali), roughly an hour away, or take an overnight Volvo bus from Delhi/Chandigarh to the Patlikuhl junction, from which it is a short 15-minute taxi climb. You can also drive straight to Naggar via the left bank road. Tell us your arrival details and we will help arrange a pickup or send precise directions.
          </p>
          <div className="mt-[24px] flex flex-wrap gap-[12px]">
            <Link href="/blog/things-to-do-naggar" className="rounded-full border border-bark/20 bg-parchment/80 px-[16px] py-[9.5px] text-[11px] font-medium uppercase tracking-[0.12em] text-deodar transition-colors hover:border-clay hover:text-clay">
              12 quiet things to do
            </Link>
            <Link href="/blog/where-to-stay-naggar" className="rounded-full border border-bark/20 bg-parchment/80 px-[16px] py-[9.5px] text-[11px] font-medium uppercase tracking-[0.12em] text-deodar transition-colors hover:border-clay hover:text-clay">
              Where to stay in Naggar
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-[clamp(64px,12vh,130px)] max-w-[1200px] px-[clamp(20px,5vw,56px)] pb-[clamp(40px,8vh,90px)] text-center">
        <h2 className="mx-auto max-w-[20ch] font-display text-[clamp(28px,4vw,52px)] font-medium leading-[1.08] text-bark">
          Make the house your base camp.
        </h2>
        <Link
          href="/#the-invitation"
          className="mt-[28px] inline-block rounded-full bg-clay px-[32px] py-[16px] text-[12px] font-bold uppercase tracking-[0.16em] text-parchment shadow-[0_10px_30px_rgba(176,92,54,0.22)] transition-transform hover:scale-[1.03] hover:bg-clay/90"
        >
          Reserve your stay
        </Link>
      </section>
    </PageShell>
  );
}
