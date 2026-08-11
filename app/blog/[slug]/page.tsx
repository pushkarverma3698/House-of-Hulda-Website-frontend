import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { Markdown } from "@/lib/markdown";
import { getAllPosts, getPost } from "@/lib/blog";
import { SITE, breadcrumbJsonLd } from "@/lib/schema";

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
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: post.author || "House of Hulda Host",
      jobTitle: "Heritage Host & Resident",
      worksFor: { "@type": "Organization", name: SITE.name, url: SITE.url },
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
      logo: { "@type": "ImageObject", url: `${SITE.url}/og.jpg` },
    },
    image: `${SITE.url}/og.jpg`,
    mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
  };

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Journal", url: "/blog" },
    { name: post.title, url: `/blog/${post.slug}` },
  ]);

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <article className="mx-auto max-w-[760px] px-[clamp(20px,5vw,40px)] pt-[clamp(60px,12vh,120px)] pb-[clamp(40px,8vh,90px)]">
        <Link href="/blog" className="text-[11px] font-medium uppercase tracking-[0.18em] text-deodar transition-colors hover:text-clay">
          ← The journal
        </Link>
        {post.date && (
          <div className="mt-[24px] text-[11px] font-bold uppercase tracking-[0.16em] text-clay">{formatDate(post.date)}</div>
        )}
        <div className="mt-[20px]">
          <Markdown source={post.body} />
        </div>

        <div className="mt-[64px] rounded-[20px] border border-bark/8 bg-sand/20 p-[clamp(24px,4vw,40px)] text-center shadow-[0_20px_50px_-25px_rgba(46,33,23,0.12)]">
          <h2 className="m-0 font-display text-[clamp(24px,3.2vw,36px)] font-medium text-bark">
            Come see it for yourself.
          </h2>
          <Link
            href="/#the-invitation"
            className="mt-[24px] inline-block rounded-full bg-clay px-[30px] py-[15px] text-[12px] font-bold uppercase tracking-[0.16em] text-parchment shadow-[0_10px_30px_rgba(176,92,54,0.22)] transition-transform hover:scale-[1.03] hover:bg-clay/90"
          >
            Reserve your stay
          </Link>
        </div>
      </article>
    </PageShell>
  );
}
