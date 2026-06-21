import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Journal — Naggar, Kathkuni & Slow Mountain Living",
  description:
    "Stories from House of Hulda: kathkuni architecture, things to do in Naggar, Himachali food, and what a slow workation in the Himalayas actually feels like.",
  alternates: { canonical: "/blog" },
};

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <PageShell>
      <section className="mx-auto max-w-[860px] px-[clamp(20px,5vw,40px)] pt-[clamp(60px,12vh,120px)]">
        <div className="text-[11px] uppercase tracking-[0.34em] text-amber/80">The journal</div>
        <h1 className="mt-[16px] font-display text-[clamp(40px,7vw,80px)] font-medium leading-[1.02] tracking-[-0.02em] text-cream">
          Notes from the valley.
        </h1>
        <p className="mt-[20px] max-w-[56ch] text-[clamp(16px,1.9vw,19px)] font-light leading-[1.75] text-cream/80">
          Slow reading on Naggar, kathkuni stone-and-deodar building, Himachali food and what a
          mountain workation really feels like.
        </p>
      </section>

      <section className="mx-auto mt-[clamp(44px,8vh,80px)] max-w-[860px] px-[clamp(20px,5vw,40px)] pb-[clamp(40px,8vh,90px)]">
        <ul className="divide-y divide-white/10 border-t border-white/10">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="group block py-[clamp(22px,3.4vh,34px)]">
                {p.date && (
                  <div className="text-[11px] uppercase tracking-[0.16em] text-cream/45">{formatDate(p.date)}</div>
                )}
                <h2 className="mt-[8px] font-display text-[clamp(22px,3vw,30px)] font-medium leading-[1.2] text-cream transition-colors group-hover:text-amber">
                  {p.title}
                </h2>
                <p className="mt-[10px] max-w-[64ch] text-[14.5px] font-light leading-[1.65] text-cream/65">
                  {p.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
