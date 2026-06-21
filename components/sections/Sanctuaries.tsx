import { Reveal } from "@/components/ui/Reveal";
import { Placeholder } from "@/components/ui/Placeholder";

/**
 * ACT III — the rooms. Honest product: hand-built kathkuni (stone + deodar)
 * spaces — private mud-plastered rooms, a shared attic-loft above the café, and
 * common baths with hot water. Real photography of the actual house.
 */
const ROOMS = [
  {
    id: "room-lantern",
    src: "/images/room-lantern.jpg",
    alt: "Kathkuni bedroom — mud-plaster walls, deodar beams, warm lantern light and Himachali wool",
    caption: "The private room",
    offset: false,
  },
  {
    id: "room-guitar",
    src: "/images/room-guitar.jpg",
    alt: "A warm room with a guitar, plants and a low wooden table at House of Hulda",
    caption: "Corners to linger",
    offset: true,
  },
  {
    id: "bath-view",
    src: "/images/bath-view.jpg",
    alt: "Clean modern bathroom with hot-water geyser and a forest view through the window",
    caption: "The bath · hot water, forest view",
    offset: false,
  },
];

export function Sanctuaries() {
  return (
    <section
      id="sanctuaries"
      aria-label="Act III · Sanctuaries"
      className="mx-auto min-h-screen max-w-[1240px] px-[clamp(20px,5vw,40px)] py-[18vh]"
    >
      <Reveal className="mb-[8vh] max-w-[36ch]">
        <div className="mb-[18px] text-[11px] uppercase tracking-[0.34em] text-cream/55">
          Wood &amp; light
        </div>
        <h2 className="m-0 font-display text-[clamp(34px,5vw,62px)] font-medium leading-[1.04] tracking-[-0.01em]">
          Mud, wool, and lantern light.
        </h2>
        <p className="mb-0 mt-[22px] max-w-[46ch] text-[16px] font-light leading-[1.7] text-cream/80">
          Hand-built in kathkuni — stone and deodar, no cement, the way the valley has
          built for centuries. Take a{" "}
          <span className="text-cream">private room</span>, a{" "}
          <span className="text-cream">bed in the attic-loft</span> above the café, or the{" "}
          <span className="text-cream">whole house</span> for your people.
        </p>
      </Reveal>

      <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
        {ROOMS.map((r, i) => (
          <Reveal key={r.id} delay={i * 0.08} className={r.offset ? "mt-[6vh]" : ""}>
            <div className="h-[clamp(280px,42vh,420px)]">
              <Placeholder label={r.caption} src={r.src} alt={r.alt} tone="warm" />
            </div>
            <div className="mt-[14px] text-[10.5px] uppercase tracking-[0.2em] text-cream/60">
              {r.caption}
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal
        as="p"
        className="mx-auto mb-0 mt-[9vh] max-w-[26ch] text-center font-display text-[clamp(22px,3vw,34px)] italic text-cream/90"
      >
        Rooms that hold the warmth in.
      </Reveal>
    </section>
  );
}
