import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";

interface PhotoBandProps {
  src: string;
  alt: string;
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
  /** image on the right instead of the left */
  flip?: boolean;
  /** optional small caption over the photo */
  caption?: string;
}

/**
 * The editorial workhorse: a magazine band with a tall photograph on one side
 * and a column of warm prose on the other. Alternating `flip` down a page gives
 * the slow, considered rhythm of a print feature.
 */
export function PhotoBand({
  src,
  alt,
  eyebrow,
  title,
  children,
  flip = false,
  caption,
}: PhotoBandProps) {
  return (
    <section className="mx-auto grid max-w-[1200px] items-center gap-[clamp(28px,5vw,72px)] px-[clamp(20px,5vw,56px)] md:grid-cols-2">
      <Reveal className={flip ? "md:order-2" : ""}>
        <figure className="relative m-0 aspect-[4/5] overflow-hidden rounded-[14px] bg-sand shadow-[0_30px_80px_-30px_rgba(46,33,23,0.4)]">
          <Image src={src} alt={alt} fill sizes="(max-width:768px) 100vw, 560px" className="object-cover" />
          {caption && (
            <figcaption className="absolute bottom-[14px] left-[16px] right-[16px] text-[10px] uppercase tracking-[0.2em] text-[rgba(251,247,239,0.92)] [text-shadow:0_1px_10px_rgba(0,0,0,0.6)]">
              {caption}
            </figcaption>
          )}
        </figure>
      </Reveal>

      <Reveal delay={0.08} className={flip ? "md:order-1" : ""}>
        {eyebrow && (
          <div className="kicker-rule text-[11px] uppercase tracking-[0.3em] text-clay">{eyebrow}</div>
        )}
        <h2 className="mt-[20px] font-display text-[clamp(28px,4vw,52px)] font-medium leading-[1.04] tracking-[-0.01em] text-bark">
          {title}
        </h2>
        <div className="mt-[20px] space-y-[16px] text-[clamp(15px,1.55vw,17.5px)] font-light leading-[1.75] text-deodar">
          {children}
        </div>
      </Reveal>
    </section>
  );
}
