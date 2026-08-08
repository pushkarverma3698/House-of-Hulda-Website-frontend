"use client";

import React, { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Reveal-on-scroll: text rises and settles once, then unobserves.
 * Honors prefers-reduced-motion via the CSS in globals.css (cross-fade only).
 */
export function Reveal({
  children,
  as: Tag = "div" as ElementType,
  delay = 0,
  className = "",
  ...rest
}: {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
  [key: string]: unknown;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("is-visible");
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return React.createElement(
    Tag,
    {
      ref,
      className: `reveal ${className}`,
      style: { transitionDelay: delay ? `${delay}s` : undefined },
      ...rest,
    },
    children
  );
}
