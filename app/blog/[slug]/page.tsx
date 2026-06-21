import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { Markdown } from "@/lib/markdown";
import { getAllPosts, getPost } from "@/lib/blog";
import { SITE } from "@/lib/schema";

interface Params {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `${SITE.url}/blog/${post.slug}`,
    },
  };
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: SITE.name },
    mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
  };

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <article className="mx-auto max-w-[760px] px-[clamp(20px,5vw,40px)] pt-[clamp(60px,12vh,120px)] pb-[clamp(40px,8vh,90px)]">
        <Link href="/blog" className="text-[11px] uppercase tracking-[0.18em] text-cream/55 transition-colors hover:text-cream">
          ← The journal
        </Link>
        {post.date && (
          <div className="mt-[24px] text-[11px] uppercase tracking-[0.16em] text-amber/70">{formatDate(post.date)}</div>
        )}
        <div className="mt-[16px]">
          <Markdown source={post.body} />
        </div>

        <div className="mt-[56px] rounded-[16px] border border-white/10 bg-white/[0.03] p-[clamp(24px,4vw,40px)] text-center">
          <h2 className="m-0 font-display text-[clamp(24px,3.2vw,36px)] font-medium text-cream">
            Come see it for yourself.
          </h2>
          <Link
            href="/#the-invitation"
            className="mt-[22px] inline-block rounded-full bg-amber px-[28px] py-[15px] text-[12px] font-bold uppercase tracking-[0.14em] text-ink shadow-[0_10px_30px_rgba(217,154,78,0.28)] transition-transform hover:scale-[1.03]"
          >
            Reserve your stay
          </Link>
        </div>
      </article>
    </PageShell>
  );
}
