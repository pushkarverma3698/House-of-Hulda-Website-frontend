import Image from "next/image";

interface EditorialHeroProps {
  /** full-bleed background photograph */
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  /** optional supporting line under the headline */
  intro?: string;
  /** small meta line above the eyebrow (e.g. altitude · drive time) */
  meta?: string;
  priority?: boolean;
}

/**
 * The opening frame of every warm editorial page: a tall, full-bleed
 * photograph with a slow ken-burns drift, a warm scrim that grounds the type,
 * and a bottom-anchored title block. This is the single biggest lever on the
 * "boutique mountain stay" feel — image first, words second.
 */
export function EditorialHero({
  src,
  alt,
  eyebrow,
  title,
  intro,
  meta,
  priority = true,
}: EditorialHeroProps) {
  return (
    <header className="relative h-[clamp(460px,82vh,820px)] w-full overflow-hidden bg-bark">
      <div className="absolute inset-0">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="100vw"
          className="kenburns object-cover object-center"
        />
      </div>
      {/* warm cinematic scrim — deep at the base for legibility, clear up top */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-bark/30 via-transparent to-bark/80"
      />
      <div className="relative z-[1] mx-auto flex h-full max-w-[1200px] flex-col justify-end px-[clamp(20px,5vw,56px)] pb-[clamp(34px,7vh,72px)]">
        {meta && (
          <div className="reveal mb-[14px] text-[11px] uppercase tracking-[0.24em] text-sand/80">
            {meta}
          </div>
        )}
        <div className="reveal text-[11px] uppercase tracking-[0.34em] text-amber [text-shadow:0_2px_18px_rgba(0,0,0,0.5)]">
          {eyebrow}
        </div>
        <h1 className="reveal m-0 mt-[16px] max-w-[18ch] font-display text-[clamp(40px,7.4vw,104px)] font-medium leading-[0.98] tracking-[-0.02em] text-parchment [text-shadow:0_6px_44px_rgba(0,0,0,0.45)]">
          {title}
        </h1>
        {intro && (
          <p className="reveal mt-[22px] max-w-[58ch] text-[clamp(15px,1.8vw,19px)] font-light leading-[1.7] text-parchment/90 [text-shadow:0_2px_20px_rgba(0,0,0,0.45)]">
            {intro}
          </p>
        )}
      </div>
    </header>
  );
}
