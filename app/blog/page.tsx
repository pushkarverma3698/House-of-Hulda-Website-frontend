import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { EditorialHero } from "@/components/editorial/EditorialHero";
import { getAllPosts } from "@/lib/blog";
import { breadcrumbJsonLd, SITE } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Journal — Naggar, Kathkuni & Slow Mountain Living",
  description:
    "Stories from House of Hulda: kathkuni architecture, things to do in Naggar, Himachali food, and what a slow workation in the Himalayas actually feels like.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Journal — House of Hulda",
    description: "Stories from House of Hulda: kathkuni architecture, things to do in Naggar, Himachali food.",
    url: `${SITE.url}/blog`,
    images: [{ url: "/images/journal-window.jpg", width: 1200, height: 630, alt: "A quiet window corner with a journal overlooking the misty valley" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Journal — House of Hulda",
    description: "Stories from House of Hulda: kathkuni architecture, things to do in Naggar, Himachali food.",
    images: ["/images/journal-window.jpg"],
  },
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
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Journal", url: "/blog" },
  ]);

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <EditorialHero
        src="/images/journal-window.jpg"
        alt="A quiet window corner with a journal overlooking the misty valley at House of Hulda"
        eyebrow="The Journal"
        title="Notes from the valley."
        intro="Slow reading on Naggar, kathkuni stone-and-deodar building, Himachali food, and what a mountain workation or team offsite in the Himalayas really feels like."
        meta="Thoughts · Stories · Guides"
      />

      <section className="mx-auto mt-[clamp(56px,10vh,110px)] max-w-[860px] px-[clamp(20px,5vw,56px)] pb-[clamp(40px,8vh,90px)]">
        <ul className="divide-y divide-bark/10 border-t border-bark/10">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="group block py-[clamp(24px,3.8vh,38px)]">
                {p.date && (
                  <div className="text-[11px] uppercase tracking-[0.16em] text-deodar/60">{formatDate(p.date)}</div>
                )}
                <h2 className="mt-[8px] font-display text-[clamp(24px,3vw,32px)] font-medium leading-[1.2] text-bark transition-colors group-hover:text-clay">
                  {p.title}
                </h2>
                <p className="mt-[10px] max-w-[68ch] text-[14.5px] font-light leading-[1.65] text-deodar">
                  {p.description}
                </p>
                <div className="mt-[14px] text-[11px] font-semibold uppercase tracking-[0.14em] text-clay inline-flex items-center gap-[4px]">
                  Read story <span className="transition-transform group-hover:translate-x-[3px]">→</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
