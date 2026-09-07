import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { Markdown } from "@/lib/markdown";
import { getAllPosts, getPost } from "@/lib/blog";
import { SITE, breadcrumbJsonLd, blogPostingJsonLd, faqJsonLd } from "@/lib/schema";

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
      publishedTime: post.date,
      modifiedTime: post.date,
      authors: [post.author || SITE.name],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
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

function extractFaqs(markdown: string): { q: string; a: string }[] {
  const faqIndex = markdown.search(/## (?:Frequently Asked Questions|FAQs|FAQ)/i);
  if (faqIndex === -1) return [];
  const faqSection = markdown.slice(faqIndex);
  const questions: { q: string; a: string }[] = [];
  const regex = /###\s+([^\n]+)\n+([\s\S]*?)(?=(?:\n###\s+|\n##\s+|\n---\s*|$))/g;
  let match;
  while ((match = regex.exec(faqSection)) !== null) {
    const q = match[1].trim();
    const a = match[2]
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\s*\n+\s*/g, " ")
      .trim();
    if (q && a) {
      questions.push({ q, a });
    }
  }
  return questions;
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const wordCount = post.body.trim().split(/\s+/).length;
  const articleJsonLd = blogPostingJsonLd({
    slug: post.slug,
    title: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: post.author,
    keywords: post.keywords,
    wordCount,
  });

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Journal", url: "/blog" },
    { name: post.title, url: `/blog/${post.slug}` },
  ]);

  const faqs = extractFaqs(post.body);
  const faqSchema = faqs.length > 0 ? faqJsonLd(faqs) : null;
  const cleanBody = post.body.replace(/^#\s+[^\n]+\n+/, "");

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      <article className="mx-auto max-w-[760px] px-[clamp(20px,5vw,40px)] pt-[clamp(60px,12vh,120px)] pb-[clamp(40px,8vh,90px)]">
        <Link href="/blog" className="text-[11px] font-medium uppercase tracking-[0.18em] text-deodar transition-colors hover:text-clay">
          ← The journal
        </Link>
        {post.date && (
          <div className="mt-[24px] text-[11px] font-bold uppercase tracking-[0.16em] text-clay">{formatDate(post.date)}</div>
        )}
        <h1 className="mt-[16px] mb-[20px] font-display text-[clamp(28px,4.2vw,46px)] font-medium leading-[1.14] text-bark">
          {post.title}
        </h1>
        <div className="mt-[20px]">
          <Markdown source={cleanBody} />
        </div>

        <div className="mt-[64px] rounded-[20px] border border-bark/8 bg-sand/20 p-[clamp(24px,4vw,40px)] text-center shadow-[0_20px_50px_-25px_rgba(46,33,23,0.12)]">
          <h2 className="m-0 font-display text-[clamp(24px,3.2vw,36px)] font-medium text-bark">
            Come see it for yourself.
          </h2>
          <Link
            href="/book"
            className="mt-[24px] inline-block rounded-full bg-clay px-[30px] py-[15px] text-[12px] font-bold uppercase tracking-[0.16em] text-parchment shadow-[0_10px_30px_rgba(176,92,54,0.22)] transition-transform hover:scale-[1.03] hover:bg-clay/90"
          >
            Reserve your stay
          </Link>
        </div>
      </article>
    </PageShell>
  );
}
