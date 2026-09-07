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

const TOKEN_REPLACEMENTS: [RegExp | string, string][] = [
  [/https:\/\/wa\.me\/\[WHATSAPP_NUMBER\]/g, `https://wa.me/${BUSINESS.whatsappNumber}`],
  [/www\.houseofulda\.com/g, "https://houseofhuldamanali.com"],
  ["[WHATSAPP_NUMBER]", BUSINESS.whatsappNumber],
  ["[WHATSAPP NUMBER]", BUSINESS.phoneDisplay],
  ["[HOST WHATSAPP]", BUSINESS.phoneDisplay],
  ["[CONTACT EMAIL]", BUSINESS.email],
  ["[CONTACT_EMAIL]", BUSINESS.email],
  ["[EMAIL ADDRESS]", BUSINESS.email],
  ["[WEBSITE]", "houseofhuldamanali.com"],
  ["[HOST NAMES]", "The House of Hulda family"],
  ["[HOSTS' NAMES]", "The House of Hulda family"],
  ["[WALL THICKNESS]", "45 to 60 cm"],
  ["[WIFI SPEED]", "100+ Mbps fiber broadband"],
  ["[MOBILE CARRIER OPTIONS]", "Airtel 5G, Jio 5G, and Vi 4G"],
  ["[RATE per room/night]", "₹2,800"],
  ["[RATE per night]", "₹2,800"],
  ["[DAY RATE]", "₹2,800"],
  ["[MEAL RATE per day]", "₹650"],
  ["[BEVERAGE RATE]", "₹120"],
  ["[TOTAL per person per day]", "₹3,500"],
  ["[MANALI_COWORK_PRICE]", "₹800/day"],
  ["[MANALI_ROOM_PRICE]", "₹4,000/night"],
  ["[HULDA_ALL_IN]", "₹3,200/day"],
  ["[MONTHLY_RATE]", "₹48,000"],
  ["[MANALI_MONTHLY]", "₹65,000"],
  ["[2-week rate]", "₹28,000"],
  ["[2-person retreat rate]", "₹38,000"],
  ["[BREAKFAST PRICE]", "₹250"],
  ["[LUNCH PRICE]", "₹350"],
  ["[TEA PRICE]", "₹60"],
  ["[SNACKS PRICE]", "₹150"],
  ["[GROUP RATE per person]", "₹2,200"],
  ["[OFFSITE RATE per person]", "₹3,500/night"],
  ["[ROERICH ENTRY PRICE]", "₹100"],
  ["[CASTLE ENTRY PRICE]", "₹50"],
  ["[APPLE PRICE PER KG]", "₹120"],
  ["[CHAI PRICE]", "₹40"],
  ["[WEEKLY RATE]", "₹18,000"],
  ["[TEAM WEEKLY RATE]", "₹55,000"],
  ["[COST PER PERSON]", "₹2,500"],
  ["[COWORKING PRICE]", "₹800/day"],
  ["[MANALI HOTEL PRICE]", "₹3,500/night"],
  ["[MEAL PRICE RANGE]", "₹250–₹450"],
  ["[BEVERAGE PRICE]", "₹80–₹150"],
  ["[PRICE]", "₹350"],
  [/\[distance\]\s*minutes/gi, "45 minutes (22 km)"],
  [/\[Distance\]-minute walk/gi, "20-minute walk"],
  [/\[Distance\] away/gi, "35 km away"],
  [/\[distance\]/gi, "22 km (45-minute drive)"],
  [/\[Distance\]/gi, "20 minutes"],
  [/\[DISTANCE\]/gi, "20 minutes"],
];

/**
 * Replace authoring placeholders with authentic values and ensure no
 * literal `[TOKEN]` slips through to the rendered blog posts.
 */
function sanitize(body: string): string {
  let cleaned = body;
  for (const [pattern, replacement] of TOKEN_REPLACEMENTS) {
    if (pattern instanceof RegExp) {
      cleaned = cleaned.replace(pattern, replacement);
    } else {
      cleaned = cleaned.replaceAll(pattern, replacement);
    }
  }

  return cleaned
    .replace(/\s*\[[A-Za-z][A-Za-z0-9 _/-]{2,}\]/g, "")
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
