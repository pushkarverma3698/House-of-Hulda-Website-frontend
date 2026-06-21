import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "The Hulda Café & Table — Himachali Home Cooking in Naggar",
  description:
    "A daytime attic café and a communal table at House of Hulda, Naggar. Himachali home-cooked thalis, mountain breakfasts, fresh coffee and slow afternoons with a valley view.",
  alternates: { canonical: "/cafe" },
};

const MENU = [
  { name: "The Himachali Thali", note: "Siddu, rajma-chawal, dal, ghee, seasonal sabzi — the full mountain plate." },
  { name: "Communal Breakfast", note: "Eggs, parathas, orchard fruit, masala chai and filter coffee, shared at one table." },
  { name: "Café All Day", note: "Coffee, mint tea, soups and small plates — the attic stays open through the afternoon." },
  { name: "From the Orchard", note: "Apples, plums and apricots in season, picked from our own trees." },
];

export default function CafePage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-[1100px] px-[clamp(20px,5vw,40px)] pt-[clamp(60px,12vh,120px)]">
        <div className="text-[11px] uppercase tracking-[0.34em] text-amber/80">The Hulda Café &amp; Table</div>
        <h1 className="mt-[16px] max-w-[18ch] font-display text-[clamp(40px,7vw,82px)] font-medium leading-[1.02] tracking-[-0.02em] text-cream">
          The reason people stay an extra night.
        </h1>
        <p className="mt-[22px] max-w-[60ch] text-[clamp(16px,1.9vw,19px)] font-light leading-[1.75] text-cream/80">
          Up in the attic-loft, under deodar beams, a small café runs all day — and at night the
          long table fills with whoever&apos;s home. The food is Himachali and home-cooked: siddu and
          rajma, ghee and red rice, garden greens and orchard fruit, brought to a table set with
          wildflowers.
        </p>
      </section>

      <section className="mx-auto mt-[clamp(40px,8vh,80px)] max-w-[1100px] px-[clamp(20px,5vw,40px)]">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[18px] border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.5)]">
          <Image
            src="/images/table-himachali.jpg"
            alt="A Himachali thali on a wooden table at House of Hulda café, Naggar — dal, rajma, red rice, ghee and chai"
            fill
            priority
            sizes="(max-width:1100px) 100vw, 1100px"
            className="object-cover"
          />
        </div>
      </section>

      <section className="mx-auto mt-[clamp(56px,10vh,110px)] max-w-[1100px] px-[clamp(20px,5vw,40px)]">
        <h2 className="font-display text-[clamp(26px,3.4vw,40px)] font-medium text-cream">At the table</h2>
        <div className="mt-[28px] grid gap-[clamp(16px,2.4vw,28px)] sm:grid-cols-2">
          {MENU.map((m) => (
            <div key={m.name} className="rounded-[14px] border border-white/10 bg-white/[0.03] p-[clamp(20px,3vw,28px)]">
              <h3 className="m-0 font-display text-[22px] font-medium text-cream">{m.name}</h3>
              <p className="mt-[10px] text-[14.5px] font-light leading-[1.7] text-cream/75">{m.note}</p>
            </div>
          ))}
        </div>
        <p className="mt-[24px] max-w-[60ch] text-[13px] leading-[1.7] text-cream/50">
          Meals are home-cooked to the day&apos;s catch from the garden and market, so the table
          changes with the season. Tell us about dietary needs when you book — we cook around them.
        </p>
      </section>

      <section className="mx-auto mt-[clamp(56px,10vh,110px)] max-w-[1100px] px-[clamp(20px,5vw,40px)] pb-[clamp(40px,8vh,90px)] text-center">
        <h2 className="mx-auto max-w-[20ch] font-display text-[clamp(28px,4vw,52px)] font-medium leading-[1.08] text-cream">
          Come up for breakfast. Stay for the valley.
        </h2>
        <Link
          href="/#the-invitation"
          className="mt-[28px] inline-block rounded-full bg-amber px-[30px] py-[16px] text-[12px] font-bold uppercase tracking-[0.14em] text-ink shadow-[0_10px_30px_rgba(217,154,78,0.28)] transition-transform hover:scale-[1.03]"
        >
          Reserve a table &amp; a room
        </Link>
      </section>
    </PageShell>
  );
}
