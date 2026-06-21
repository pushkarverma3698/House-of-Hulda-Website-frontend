"use client";

import { useEffect, useRef } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { BookingPanel } from "@/components/booking/BookingPanel";
import { track } from "@/lib/analytics";

/** ACT VI — choose your quiet. The booking flow lands at the emotional peak. */
export function Invitation() {
  const ref = useRef<HTMLElement>(null);
  const openedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !openedRef.current) {
            openedRef.current = true;
            track("open_booking");
          }
        });
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id="the-invitation"
      aria-label="Act VI · The Invitation"
      className="flex min-h-screen flex-col items-center px-[clamp(20px,5vw,40px)] py-[16vh]"
    >
      <Reveal className="mb-[48px] text-center">
        <h2 className="m-0 font-display text-[clamp(36px,5.4vw,72px)] font-medium leading-[1.04] tracking-[-0.015em]">
          Every stay is a different kind of quiet.
        </h2>
        <p className="mt-[16px] font-display text-[clamp(20px,2.4vw,28px)] italic text-cream/80">
          Choose yours.
        </p>
        <p className="sr-only">
          Book your stay at House of Hulda — a heritage homestay and café in Naggar, Manali.
          Private rooms, a shared attic-loft, the whole home, and creative residencies.
        </p>
      </Reveal>
      <Reveal delay={0.15}>
        <BookingPanel />
      </Reveal>
    </section>
  );
}
