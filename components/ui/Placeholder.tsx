/**
 * Image slot for Phase 1. Instead of a flat gray box, each slot renders a
 * tasteful, tone-matched procedural SCENE (SVG) so the page reads as finished
 * today — then the real photograph drops straight into the same slot for
 * Phase 2 (swap this component for next/image). The label names exactly which
 * shot belongs here, keeping the shoot list and the build in lockstep.
 */
type Tone = "valley" | "warm" | "fire" | "night";

const TONES: Record<Tone, { from: string; to: string; glow: string }> = {
  valley: { from: "#3a4a5c", to: "#161e29", glow: "rgba(180,200,220,0.20)" },
  warm: { from: "#5a3d24", to: "#241608", glow: "rgba(255,196,120,0.28)" },
  fire: { from: "#6e3318", to: "#1f0d06", glow: "rgba(255,150,70,0.34)" },
  night: { from: "#1a2138", to: "#05080f", glow: "rgba(150,175,225,0.22)" },
};

function Scene({ tone }: { tone: Tone }) {
  if (tone === "warm") {
    return (
      <>
        {/* ambient interior wash */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(110% 80% at 68% 22%,rgba(255,196,120,0.38),rgba(0,0,0,0) 58%)" }} />
        {/* wall texture — subtle vertical panelling */}
        <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(90deg,rgba(100,68,36,0.08) 0 1px,transparent 1px 44px)", opacity: 0.7 }} />
        {/* window frame with panes */}
        <div className="absolute" style={{ right: "14%", top: "16%", width: "26%", height: "44%", border: "1.5px solid rgba(255,218,155,0.38)", borderRadius: 3, background: "linear-gradient(168deg,rgba(255,214,148,0.48),rgba(255,172,80,0.14))", boxShadow: "0 0 64px 16px rgba(255,178,82,0.24),inset 0 0 18px rgba(255,200,120,0.12)" }}>
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(255,218,155,0.32)" }} />
          <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(255,218,155,0.28)" }} />
        </div>
        {/* cast light on floor — trapezoid */}
        <div className="absolute" style={{ bottom: "28%", right: "4%", width: "54%", height: "28%", background: "radial-gradient(ellipse at 50% 0%,rgba(255,194,108,0.20),transparent 70%)", clipPath: "polygon(18% 0%,82% 0%,100% 100%,0% 100%)" }} />
        {/* skirting board */}
        <div className="absolute bottom-[29%] left-0 right-0" style={{ height: 1, background: "rgba(130,88,48,0.22)" }} />
        {/* wood-grain floor */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: "30%", background: "repeating-linear-gradient(93deg,rgba(114,72,34,0.40) 0 14px,rgba(86,54,22,0.40) 14px 28px,rgba(100,64,28,0.40) 28px 44px)", maskImage: "linear-gradient(180deg,transparent 0%,#000 48%)" }} />
      </>
    );
  }

  if (tone === "fire") {
    return (
      <>
        {/* deep ember glow from below */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(100% 80% at 50% 110%,rgba(255,138,44,0.50),rgba(180,56,0,0.14) 55%,rgba(0,0,0,0) 75%)" }} />
        {/* table surface */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: "26%", background: "linear-gradient(180deg,rgba(92,56,20,0.75),rgba(56,32,10,0.95))", borderTop: "1px solid rgba(160,104,44,0.22)" }} />
        {/* plate / dish */}
        <div className="absolute" style={{ bottom: "22%", left: "50%", transform: "translateX(-50%)", width: "38%", height: "16%", borderRadius: "50%", background: "radial-gradient(ellipse,rgba(255,196,136,0.16),rgba(160,88,24,0.10))", border: "1px solid rgba(210,148,72,0.20)", boxShadow: "0 4px 28px rgba(200,96,20,0.18)" }} />
        {/* candle body */}
        <div className="absolute rounded-[2px]" style={{ bottom: "38%", left: "29.5%", width: "4%", height: "6%", background: "rgba(240,224,196,0.48)" }} />
        {/* candle flame */}
        <div className="absolute" style={{ bottom: "44%", left: "30%", width: "3%", height: "9%", background: "radial-gradient(ellipse at 50% 80%,rgba(255,228,120,0.96),rgba(255,140,36,0.60),transparent 82%)", clipPath: "polygon(50% 0%,72% 42%,66% 100%,34% 100%,28% 42%)", filter: "blur(0.6px)" }} />
        {/* warm bokeh background specks */}
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(5px 5px at 20% 58%,rgba(255,158,56,0.20),transparent),radial-gradient(4px 4px at 74% 52%,rgba(255,140,44,0.16),transparent),radial-gradient(7px 7px at 50% 65%,rgba(255,180,72,0.12),transparent),radial-gradient(3px 3px at 62% 44%,rgba(255,160,60,0.14),transparent)" }} />
        {/* main heat glow */}
        <div className="absolute" style={{ bottom: 0, left: "50%", transform: "translateX(-50%)", width: "72%", height: "52%", background: "radial-gradient(60% 100% at 50% 100%,rgba(255,172,72,0.44),rgba(255,96,14,0.08) 58%,transparent)", filter: "blur(10px)" }} />
      </>
    );
  }

  // valley / night — layered ridgelines with snow peaks
  return (
    <>
      {tone === "night" && (
        <>
          {/* milky way band */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(128deg,transparent 22%,rgba(148,168,218,0.07) 40%,rgba(178,190,238,0.11) 50%,rgba(148,168,218,0.07) 62%,transparent 80%)", filter: "blur(3px)" }} />
          {/* stars — varied sizes and opacities */}
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(1.6px 1.6px at 18% 22%,#fff,transparent),radial-gradient(1.0px 1.0px at 44% 13%,#d0e0ff,transparent),radial-gradient(1.8px 1.8px at 70% 26%,#fff,transparent),radial-gradient(0.9px 0.9px at 86% 16%,#fff,transparent),radial-gradient(1.2px 1.2px at 32% 34%,#fff,transparent),radial-gradient(0.8px 0.8px at 58% 8%,rgba(255,255,255,0.8),transparent),radial-gradient(1.0px 1.0px at 14% 44%,rgba(255,255,255,0.65),transparent),radial-gradient(1.4px 1.4px at 77% 38%,rgba(200,220,255,0.9),transparent),radial-gradient(0.8px 0.8px at 90% 30%,rgba(255,255,255,0.7),transparent),radial-gradient(1.1px 1.1px at 25% 18%,rgba(255,255,255,0.8),transparent),radial-gradient(1.3px 1.3px at 64% 44%,rgba(220,230,255,0.70),transparent),radial-gradient(0.9px 0.9px at 48% 28%,rgba(255,255,255,0.75),transparent),radial-gradient(1.1px 1.1px at 38% 10%,rgba(200,215,255,0.80),transparent)" }} />
          {/* moon */}
          <div className="absolute" style={{ top: "10%", right: "15%", width: "7%", paddingBottom: "7%", borderRadius: "50%", background: "radial-gradient(circle,rgba(238,246,255,0.92),rgba(200,220,255,0.42) 44%,transparent 72%)", boxShadow: "0 0 48px 20px rgba(176,200,255,0.16)" }} />
        </>
      )}
      {/* far ridge */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: "66%", background: "linear-gradient(180deg,rgba(62,82,106,0.54),rgba(34,48,68,0.76))", clipPath: "polygon(0 62%,10% 42%,22% 56%,36% 32%,50% 50%,64% 34%,76% 52%,88% 38%,100% 50%,100% 100%,0 100%)" }} />
      {/* snow on far peaks */}
      <div className="absolute" style={{ bottom: "57%", left: "34%", width: "5%", height: "9%", background: tone === "night" ? "rgba(196,216,240,0.62)" : "rgba(228,238,252,0.78)", clipPath: "polygon(50% 8%,100% 100%,0 100%)" }} />
      <div className="absolute" style={{ bottom: "60%", left: "62%", width: "4.5%", height: "8%", background: tone === "night" ? "rgba(196,216,240,0.54)" : "rgba(228,238,252,0.68)", clipPath: "polygon(50% 5%,100% 100%,0 100%)" }} />
      {/* near ridge — darker foreground */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: "43%", background: "linear-gradient(180deg,rgba(18,26,40,0.92),rgba(6,10,18,1))", clipPath: "polygon(0 76%,12% 66%,24% 76%,38% 60%,52% 72%,64% 58%,76% 70%,88% 62%,100% 70%,100% 100%,0 100%)" }} />
    </>
  );
}

export function Placeholder({
  label,
  className = "",
  radius = 12,
  tone = "valley",
  src,
  alt,
}: {
  label: string;
  className?: string;
  radius?: number;
  tone?: Tone;
  src?: string;
  alt?: string;
}) {
  const t = TONES[tone];
  return (
    <div
      className={`group relative flex h-full w-full items-end overflow-hidden ${className}`}
      style={{
        background: src ? undefined : `linear-gradient(155deg,${t.from},${t.to})`,
        borderRadius: radius,
      }}
      role="img"
      aria-label={alt ?? label}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt ?? label} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <Scene tone={tone} />
      )}
      {/* a soft top glow + bottom vignette for photographic depth */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(90% 60% at 50% 0%,${t.glow},transparent 70%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg,transparent 45%,rgba(0,0,0,0.38))" }}
      />
      <span
        className={`relative m-4 inline-flex items-center gap-2 font-body text-[10px] uppercase leading-relaxed tracking-[0.14em] text-cream/70 ${src ? "opacity-0 transition-opacity group-hover:opacity-100" : ""}`}
      >
        <span className="inline-block h-[5px] w-[5px] rounded-full bg-amber/70" />
        {label}
      </span>
    </div>
  );
}
