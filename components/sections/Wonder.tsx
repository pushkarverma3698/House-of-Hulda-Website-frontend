import { Reveal } from "@/components/ui/Reveal";

/** ACT V — days and nights. The widest, darkest, most spacious chapter. */
const VIGNETTES = [
  { title: "Hidden waterfalls", text: "Trails that end where the water does.", d: "0s" },
  { title: "Apple orchards", text: "Pick straight from our own trees.", d: "0.5s" },
  { title: "The Roerich legacy", text: "An artist's mountain, a short walk away.", d: "0.9s" },
  { title: "Bonfire nights", text: "Wool blankets, embers, no hurry.", d: "1.3s" },
  { title: "Stargazing", text: "The deck, the dark, the whole sky.", d: "1.7s" },
];

export function Wonder() {
  return (
    <section
      id="wonder"
      aria-label="Act V · Wonder"
      className="min-h-[120vh] px-[clamp(20px,5vw,40px)] py-[18vh] text-center"
    >
      <Reveal className="mx-auto mb-[9vh] max-w-[24ch]">
        <h2 className="m-0 font-display text-[clamp(38px,6vw,82px)] font-medium leading-[1.02] tracking-[-0.015em]">
          Days are for wandering.
          <br />
          <span className="text-cream/60">Nights are for the stars.</span>
        </h2>
        <p className="mx-auto mt-[18px] max-w-[40ch] text-[14px] font-light leading-[1.6] text-cream/60">
          Things to do in Naggar — the Roerich gallery, apple orchards, hidden waterfall
          trails and stargazing, all a short walk from the house.
        </p>
      </Reveal>

      <div className="mx-auto grid max-w-[1100px] gap-[clamp(20px,3vw,40px)] [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
        {VIGNETTES.map((v, i) => (
          <Reveal key={v.title} delay={i * 0.08}>
            <div
              className="mx-auto mb-[16px] h-[9px] w-[9px] rounded-full bg-white shadow-[0_0_14px_3px_rgba(255,255,255,0.5)]"
              style={{ animation: `twinkle ${4 + i * 0.3}s ease-in-out infinite ${v.d}` }}
            />
            <div className="mb-[8px] font-display text-[23px]">{v.title}</div>
            <div className="text-[13px] font-light leading-[1.6] text-cream/65">{v.text}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
