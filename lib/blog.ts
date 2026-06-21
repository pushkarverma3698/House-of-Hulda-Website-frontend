/**
 * Build-time blog loader. Reads the markdown posts in `content/blog`, parses a
 * small YAML frontmatter block, and exposes a typed list + single-post lookup.
 * No runtime deps — posts are read once at build (SSG) via Node fs.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { BUSINESS } from "@/lib/site-config";

const BLOG_DIR = join(process.cwd(), "content", "blog");

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  keywords: string;
  author: string;
}

export interface Post extends PostMeta {
  body: string;
}

/** Parse a simple `key: "value"` frontmatter block + body from raw markdown. */
function parse(raw: string, fallbackSlug: string): Post {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const front: Record<string, string> = {};
  let body = raw;

  if (match) {
    body = match[2];
    for (const line of match[1].split("\n")) {
      const idx = line.indexOf(":");
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      const value = line
        .slice(idx + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      if (key) front[key] = value;
    }
  }

  return {
    slug: front.slug || fallbackSlug,
    title: front.title || fallbackSlug,
    description: front.description || "",
    date: front.date || "",
    keywords: front.keywords || "",
    author: front.author || BUSINESS.name,
    body: sanitize(body),
  };
}

/**
 * Replace authoring placeholders that slipped into the drafts so nothing ships
 * with a literal `[TOKEN]`: wire the real WhatsApp link, drop bracketed notes.
 */
function sanitize(body: string): string {
  return body
    .replace(/https:\/\/wa\.me\/\[WHATSAPP_NUMBER\]/g, `https://wa.me/${BUSINESS.whatsappNumber}`)
    .replace(/\[WHATSAPP_NUMBER\]/g, BUSINESS.whatsappNumber)
    .replace(/\s*\[[A-Z][A-Z0-9 _/-]{2,}\]/g, "")
    .trim();
}

export function getAllPosts(): Post[] {
  const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  return files
    .map((f) => parse(readFileSync(join(BLOG_DIR, f), "utf8"), f.replace(/\.md$/, "")))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): Post | null {
  return getAllPosts().find((p) => p.slug === slug) ?? null;
}
