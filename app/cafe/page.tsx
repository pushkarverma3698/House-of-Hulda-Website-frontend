import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { EditorialHero } from "@/components/editorial/EditorialHero";
import { PhotoBand } from "@/components/editorial/PhotoBand";
import { breadcrumbJsonLd, SITE } from "@/lib/schema";

export const metadata: Metadata = {
  title: "The Hulda Café & Table — Himachali Home Cooking in Naggar",
  description:
    "A daytime attic café and a communal table at House of Hulda, Naggar. Himachali home-cooked thalis, mountain breakfasts, fresh coffee and slow afternoons with a valley view.",
  alternates: { canonical: "/cafe" },
  openGraph: {
    title: "The Hulda Café & Table",
    description: "Himachali home-cooked thalis, mountain breakfasts, and fresh coffee at House of Hulda, Naggar.",
    url: `${SITE.url}/cafe`,
    images: [{ url: "/images/cafe-attic.jpg", width: 1200, height: 630, alt: "The cozy attic loft café at House of Hulda" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Hulda Café & Table",
    description: "Himachali home-cooked thalis, mountain breakfasts, and fresh coffee at House of Hulda, Naggar.",
    images: ["/images/cafe-attic.jpg"],
  },
};

const MENU = [
  { name: "Communal Breakfast", note: "Eggs, parathas, orchard fruit, masala chai and filter coffee, shared at one long table to start the day together." },
  { name: "Café All Day", note: "Pour-over coffee, mint tea, fresh soups and seasonal small plates — the attic stays open through the afternoon." },
  { name: "From the Orchard", note: "Apples, plums, peaches, and apricots in season, picked straight from our own organic trees surrounding the house." },
  { name: "Locally Sourced", note: "Wild honey, forest mushrooms, local cheeses, and organic red rice sourced from small Kullu valley farms." },
];

export default function CafePage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Café", url: "/cafe" },
  ]);

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <EditorialHero
        src="/images/cafe-attic.jpg"
        alt="The cozy attic loft café under deodar wood beams at House of Hulda, Naggar"
        eyebrow="The Café &amp; Table"
        title="The reason people stay an extra night."
        intro="Up in the attic-loft, under deodar beams, a small café runs all day — and at night the long table fills with whoever's home. The food is Himachali and home-cooked: siddu and rajma, ghee and red rice, garden greens and orchard fruit, brought to a table set with wildflowers."
        meta="Fresh &amp; Local · 09:00 AM - 06:00 PM"
      />

      {/* featured thali photoband */}
      <div className="mt-[clamp(56px,10vh,110px)]">
        <PhotoBand
          src="/images/table-himachali.jpg"
          alt="A traditional Himachali Thali with Siddu, rajma, and local greens served on a wooden platter at House of Hulda"
          eyebrow="The Masterplate"
          title="The Himachali Thali"
          caption="Himachali Thali · Siddu, Rajma &amp; Ghee"
        >
          <p>
            Our signature thali is a slow-cooked tribute to the valley. We steam fresh, soft <strong>siddu</strong> (local yeast-fermented bread stuffed with poppy seeds or walnuts), pour warm, hand-churned ghee over it, and serve it with slow-simmered rajma, local black dal, red rice, and seasonal greens from our garden.
          </p>
          <p>
            It is home cooking in its truest form — hearty, nourishing, and made from scratch by local hands using recipes passed down through generations.
          </p>
        </PhotoBand>
      </div>

      {/* menu list */}
      <section className="mx-auto mt-[clamp(60px,11vh,120px)] max-w-[1200px] px-[clamp(20px,5vw,56px)]">
        <h2 className="kicker-rule font-display text-[clamp(26px,3.4vw,40px)] font-medium text-bark">At the table</h2>
        <div className="mt-[28px] grid gap-[clamp(16px,2.4vw,28px)] sm:grid-cols-2">
          {MENU.map((m) => (
            <div key={m.name} className="rounded-[16px] border border-bark/8 bg-sand/20 p-[clamp(20px,3.5vw,32px)] shadow-[0_15px_40px_-20px_rgba(46,33,23,0.12)]">
              <h3 className="m-0 font-display text-[22px] font-medium text-bark">{m.name}</h3>
              <p className="mt-[10px] text-[14.5px] font-light leading-[1.7] text-deodar">{m.note}</p>
            </div>
          ))}
        </div>
        <p className="mt-[28px] max-w-[60ch] text-[13px] leading-[1.7] text-deodar/60">
          Meals are home-cooked to the day&apos;s catch from the garden and market, so the table
          changes with the season. Tell us about dietary needs when you book — we cook around them.
        </p>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-[clamp(64px,12vh,130px)] max-w-[1200px] px-[clamp(20px,5vw,56px)] pb-[clamp(40px,8vh,90px)] text-center">
        <h2 className="mx-auto max-w-[20ch] font-display text-[clamp(28px,4vw,52px)] font-medium leading-[1.08] text-bark">
          Come up for breakfast. Stay for the valley.
        </h2>
        <Link
          href="/#the-invitation"
          className="mt-[28px] inline-block rounded-full bg-clay px-[32px] py-[16px] text-[12px] font-bold uppercase tracking-[0.16em] text-parchment shadow-[0_10px_30px_rgba(176,92,54,0.22)] transition-transform hover:scale-[1.03] hover:bg-clay/90"
        >
          Reserve a table &amp; a room
        </Link>
      </section>
    </PageShell>
  );
}
