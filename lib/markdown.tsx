/**
 * A deliberately small markdown → React renderer for the blog posts. It covers
 * exactly the subset the drafts use — headings, bold, links, unordered lists,
 * horizontal rules and paragraphs — with no third-party dependency. Internal
 * links render with next/link; external links open safely in a new tab.
 */
import { Fragment, type ReactNode } from "react";
import Link from "next/link";

const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

function renderInline(text: string, keyBase: string): ReactNode[] {
  const parts = text.split(INLINE).filter(Boolean);
  return parts.map((part, i) => {
    const key = `${keyBase}-${i}`;
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) return <strong key={key}>{bold[1]}</strong>;
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const [, label, href] = link;
      if (href.startsWith("/")) {
        return (
          <Link key={key} href={href} className="text-amber underline-offset-4 hover:underline">
            {label}
          </Link>
        );
      }
      return (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber underline-offset-4 hover:underline"
        >
          {label}
        </a>
      );
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
}

export function Markdown({ source }: { source: string }) {
  const blocks = source.split(/\n{2,}/);

  return (
    <>
      {blocks.map((raw, i) => {
        const block = raw.trim();
        if (!block) return null;
        const key = `b-${i}`;

        if (block === "---") return <hr key={key} className="my-[40px] border-white/12" />;

        if (block.startsWith("### "))
          return (
            <h3 key={key} className="mt-[40px] mb-[14px] font-display text-[clamp(20px,2.4vw,26px)] font-medium text-cream">
              {renderInline(block.slice(4), key)}
            </h3>
          );
        if (block.startsWith("## "))
          return (
            <h2 key={key} className="mt-[52px] mb-[18px] font-display text-[clamp(26px,3.4vw,38px)] font-medium leading-[1.15] text-cream">
              {renderInline(block.slice(3), key)}
            </h2>
          );
        if (block.startsWith("# "))
          return (
            <h2 key={key} className="mt-[8px] mb-[20px] font-display text-[clamp(30px,4.4vw,48px)] font-medium leading-[1.1] text-cream">
              {renderInline(block.slice(2), key)}
            </h2>
          );

        if (/^[-*] /.test(block)) {
          const items = block.split("\n").filter((l) => /^[-*] /.test(l.trim()));
          return (
            <ul key={key} className="my-[18px] list-disc space-y-[8px] pl-[22px] text-cream/80">
              {items.map((li, j) => (
                <li key={`${key}-${j}`} className="leading-[1.7]">
                  {renderInline(li.trim().replace(/^[-*] /, ""), `${key}-${j}`)}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={key} className="my-[18px] text-[clamp(15px,1.7vw,17px)] font-light leading-[1.85] text-cream/80">
            {renderInline(block, key)}
          </p>
        );
      })}
    </>
  );
}
