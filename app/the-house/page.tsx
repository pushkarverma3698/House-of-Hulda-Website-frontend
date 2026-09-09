import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { breadcrumbJsonLd, SITE } from "@/lib/schema";

export const metadata: Metadata = {
  title: "The House — Indigenous Kath-kuni Himalayan Architecture",
  description:
    "Explore the craft of House of Hulda in Rumsu, Naggar. Built with century-old deodar timber, hand-quarried slate, and interlocking kath-kuni dry masonry without nails or cement.",
  alternates: { canonical: "/the-house" },
  openGraph: {
    title: "The House — House of Hulda",
    description:
      "A living architectural study in Himalayan kath-kuni stone and deodar craftsmanship.",
    url: `${SITE.url}/the-house`,
    images: [{ url: "/images/arrival-golden-hour.jpg", width: 1200, height: 630, alt: "House of Hulda kath-kuni architecture" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The House — House of Hulda",
    description:
      "A living architectural study in Himalayan kath-kuni stone and deodar craftsmanship.",
    images: ["/images/arrival-golden-hour.jpg"],
  },
};

interface MaterialChapter {
  num: string;
  title: string;
  native: string;
  subtitle: string;
  specs: { label: string; value: string }[];
  prose: string[];
  image: string;
  caption: string;
}

const CHAPTERS: MaterialChapter[] = [
  {
    num: "01",
    title: "Deodar",
    native: "Cedrus deodara · Timber of the Gods",
    subtitle: "A tree that has weathered centuries before becoming a beam.",
    specs: [
      { label: "Origin", value: "Fallen windfall from upper Naggar forests" },
      { label: "Property", value: "Natural oleoresin, fungal and pest resistant" },
      { label: "Aroma", value: "Warm aromatic cedar note in dry heat" },
    ],
    prose: [
      "In the Kullu valley, deodar is not treated as mere timber; it is revered as devdaru, the wood of the gods. The beams carrying House of Hulda were sourced from mature, naturally fallen logs.",
      "The wood breathes with the mountain humidity. As winter sets in and temperatures dip below freezing, the deodar contracts tightly around the stones, locking the structure against Himalayan blizzards. In warm weather, it releases a subtle, grounding fragrance that perfumes every room.",
    ],
    image: "/images/artisan/deodar.jpg",
    caption: "Aged deodar grain, hand-planed and oiled with cold-pressed walnut oil.",
  },
  {
    num: "02",
    title: "Stone",
    native: "Metamorphic Slate & River Rock",
    subtitle: "The immense thermal sponge of the foundation.",
    specs: [
      { label: "Masonry", value: "Hand-dressed metamorphic stone" },
      { label: "Thermal Mass", value: "Retains daytime heat for 10–14 hours" },
      { label: "Foundation", value: "Directly anchored into hillside bedrock" },
    ],
    prose: [
      "Every stone was split by hand along its natural cleavage planes. The lower plinth of House of Hulda is built entirely of dry stone masonry—no cement, no slurry, no modern adhesives.",
      "The massive two-foot-thick walls act as a natural thermal battery. During the bright, clear Himalayan days, the dark slate absorbs solar radiation. Long after the sun dips behind the ridge at 17:00, the stones gently release their stored warmth into the living quarters.",
    ],
    image: "/images/room-rustic.jpg",
    caption: "Dry-stone interior wall hand-plastered with clay, straw, and cow-dung wash.",
  },
  {
    num: "03",
    title: "Kath-kuni",
    native: "Interlocking Corner Architecture",
    subtitle: "Built without iron nails to dance with earthquakes.",
    specs: [
      { label: "Technique", value: "Alternating double-timber courses with stone infill" },
      { label: "Fasteners", value: "Wooden dowels (maan) — zero steel nails" },
      { label: "Seismic Resilience", value: "Elastic joint dissipation (Grade V safe)" },
    ],
    prose: [
      "Kath-kuni literally translates to 'wood corner' (kath = wood, kuni = corner). It is the indigenous earthquake-resistant vernacular architecture that has kept Kullu's temples and homesteads standing through centuries of tectonic shifts.",
      "Two parallel wooden beams are laid horizontally, followed by cross-beams that interlock at right angles using lap joints. The empty cavities are hand-packed with stone rubble. Because no rigid mortar is used, the entire building acts like an elastic basket during tremors, dissipating kinetic energy harmlessly through friction.",
    ],
    image: "/images/arrival-golden-hour.jpg",
    caption: "The corner joinery of House of Hulda at golden hour, showing alternating cedar and stone.",
  },
  {
    num: "04",
    title: "Fire",
    native: "Bukhari & The Hearth",
    subtitle: "The living, crackling center of Himalayan domestic life.",
    specs: [
      { label: "Apparatus", value: "Traditional cast-iron bukhari stove" },
      { label: "Fuel", value: "Dry pinecones and deodar windfall scraps" },
      { label: "Function", value: "Room heating, boiling kettle, and communal anchor" },
    ],
    prose: [
      "In a mountain homestead at 2,180 metres, life convenes where the smoke rises. The cast-iron bukhari radiates steady, deep radiant heat that reaches through wool socks and thick cardigans.",
      "At dusk, cedar cones crackle in the grate. A brass kettle of water with cinnamon, wild mint, and black tea simmers perpetually on the flat iron top. Around the hearth, travelers and valley locals sit side by side, sharing mountain folklore as the snow falls silently outside.",
    ],
    image: "/images/himachali_culinary_hearth.jpg",
    caption: "The traditional kitchen hearth where wild greens, fresh siddu, and stews simmer over flame.",
  },
  {
    num: "05",
    title: "Wool",
    native: "Pattu & Desi Sheep Fleece",
    subtitle: "Spun by hand on mountain pit-looms for sub-zero nights.",
    specs: [
      { label: "Fleece", value: "Gaddi & Kinnauri indigenous sheep" },
      { label: "Weave", value: "Hand-thrown shuttle loom with geometrical border" },
      { label: "Weight", value: "Dense high-micron wool, untreated and non-synthetic" },
    ],
    prose: [
      "Mountain beds require real weight. Every blanket at House of Hulda is an authentic Himachali pattu, sheared from local high-altitude sheep that graze above the treeline in summer.",
      "Woven on ancestral wooden looms by women in Rumsu and Naggar, the wool retains its natural lanolin. It blocks cold drafts completely while allowing the body to breathe, ensuring deep, uninterrupted sleep even when the temperature drops to -8°C.",
    ],
    image: "/images/artisan/shawl.jpg",
    caption: "Hand-spun mountain pattu blanket with traditional valley geometric borders.",
  },
  {
    num: "06",
    title: "Light",
    native: "Solar Geometry & Alpenglow",
    subtitle: "Designed around the sun's trajectory across the valley.",
    specs: [
      { label: "Orientation", value: "South-Southeast facing slope" },
      { label: "Window Design", value: "Recessed timber casements framing snow peaks" },
      { label: "Night Illumination", value: "Low-kelvin warm lanterns protecting night vision" },
    ],
    prose: [
      "House of Hulda is oriented precisely along the sun's winter arc. The first morning light crests the eastern ridge and pours into the bedrooms by 07:10, warming the mud plaster and greeting early risers.",
      "By evening, recessed windows frame the glowing violet silhouette of the Dhauladhar range. At night, we keep electric lighting discreet and amber-toned, ensuring that when you step onto the terrace, your eyes are already adjusted to the cosmic sweep of the Milky Way.",
    ],
    image: "/images/orchard-golden.jpg",
    caption: "Morning light breaking through the apple orchard and illuminating the timber deck.",
  },
];

export default function TheHousePage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "The House", url: "/the-house" },
  ]);

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      {/* Hero Header */}
      <section className="relative mx-auto max-w-[1200px] px-[clamp(20px,5vw,56px)] pt-[clamp(40px,7vh,80px)]">
        <div className="flex items-center gap-3 mb-4">
          <span className="hud-mono text-[10.5px] uppercase tracking-[0.24em] text-clay font-bold">
            Architectural Study
          </span>
          <span className="w-8 h-[1px] bg-clay/30" />
          <span className="hud-mono text-[10.5px] uppercase tracking-wider text-deodar/60">
            KATH-KUNI · RUMSU · 2,180M
          </span>
        </div>

        <h1 className="font-display text-[clamp(36px,5.8vw,68px)] font-medium leading-[1.08] tracking-tight text-bark max-w-3xl">
          Six materials.
          <br />
          <span className="italic font-light opacity-80">One quiet house above the road.</span>
        </h1>

        <p className="mt-6 max-w-[58ch] text-[clamp(15px,1.8vw,18px)] font-light leading-[1.7] text-deodar">
          House of Hulda was built using the ancient kath-kuni tradition of the Western Himalayas.
          No Portland cement. No steel rebar. Only dry-stone, deodar timber, hand-loomed wool, and the
          thermal wisdom of five hundred years of mountain building.
        </p>

        {/* Hero Image */}
        <div className="relative mt-12 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-bark/10 shadow-[0_20px_50px_-20px_rgba(46,33,23,0.25)]">
          <Image
            src="/images/arrival_courtyard_dusk.jpg"
            alt="House of Hulda courtyard at dusk"
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bark/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex items-center justify-between text-white/90 hud-mono text-[11px]">
            <span>HOUSE OF HULDA · COURTYARD ELEVATION</span>
            <span>2,180 METRES ELEVATION</span>
          </div>
        </div>

        {/* Quick Architectural Specs Ribbon */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-xl border border-bark/10 bg-sand/30 backdrop-blur-sm">
          <div>
            <div className="hud-mono text-[10px] uppercase tracking-wider text-deodar/60">Tradition</div>
            <div className="font-display text-lg font-medium text-bark mt-0.5">Kath-Kuni</div>
          </div>
          <div>
            <div className="hud-mono text-[10px] uppercase tracking-wider text-deodar/60">Fasteners</div>
            <div className="font-display text-lg font-medium text-bark mt-0.5">Zero Iron Nails</div>
          </div>
          <div>
            <div className="hud-mono text-[10px] uppercase tracking-wider text-deodar/60">Wall Thickness</div>
            <div className="font-display text-lg font-medium text-bark mt-0.5">600mm Dry Stone</div>
          </div>
          <div>
            <div className="hud-mono text-[10px] uppercase tracking-wider text-deodar/60">Seismic Behavior</div>
            <div className="font-display text-lg font-medium text-bark mt-0.5">Elastic Friction Joint</div>
          </div>
        </div>
      </section>

      {/* Chapters: The Six Materials */}
      <section className="mx-auto mt-[clamp(60px,12vh,120px)] max-w-[1200px] px-[clamp(20px,5vw,56px)] space-y-28 md:space-y-36">
        {CHAPTERS.map((ch, idx) => {
          const isEven = idx % 2 === 1;
          return (
            <article
              key={ch.num}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center ${
                isEven ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Image Side */}
              <div className={`lg:col-span-6 ${isEven ? "lg:order-2" : "lg:order-1"}`}>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-bark/10 shadow-[0_15px_40px_-20px_rgba(46,33,23,0.2)] bg-sand/40 group">
                  <Image
                    src={ch.image}
                    alt={ch.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 560px"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bark/50 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-3 left-4 right-4 text-[11px] hud-mono text-white/90 drop-shadow">
                    {ch.caption}
                  </div>
                </div>
              </div>

              {/* Text Side */}
              <div className={`lg:col-span-6 ${isEven ? "lg:order-1" : "lg:order-2"}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="hud-mono text-sm font-bold text-clay tracking-wider">
                    {ch.num}
                  </span>
                  <span className="text-bark/20">•</span>
                  <span className="hud-mono text-[10px] tracking-[0.2em] uppercase text-deodar/60">
                    {ch.native}
                  </span>
                </div>

                <h2 className="font-display text-[clamp(28px,3.8vw,44px)] font-medium text-bark tracking-tight leading-tight">
                  {ch.title}
                </h2>
                <p className="mt-2 font-display italic text-[clamp(16px,2vw,20px)] text-deodar/80 font-light">
                  {ch.subtitle}
                </p>

                <div className="mt-5 space-y-4 text-[14.5px] md:text-[15.5px] font-light leading-relaxed text-deodar">
                  {ch.prose.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>

                {/* Specs Pill Box */}
                <div className="mt-6 pt-5 border-t border-bark/10 space-y-2">
                  {ch.specs.map((s) => (
                    <div key={s.label} className="flex items-baseline justify-between text-[12px]">
                      <span className="hud-mono text-deodar/60 uppercase tracking-wider text-[10px]">
                        {s.label}
                      </span>
                      <span className="font-medium text-bark text-right">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* Invitation Section */}
      <section className="mx-auto mt-[clamp(70px,14vh,140px)] max-w-[1200px] px-[clamp(20px,5vw,56px)]">
        <div className="rounded-3xl border border-bark/12 bg-sand/30 p-8 sm:p-12 md:p-16 text-center max-w-3xl mx-auto shadow-[0_20px_50px_-20px_rgba(46,33,23,0.15)]">
          <div className="hud-mono text-[10px] tracking-[0.26em] uppercase text-clay font-bold mb-3">
            Experience The Craft
          </div>
          <h2 className="font-display text-[clamp(28px,4vw,44px)] font-medium text-bark tracking-tight leading-snug">
            Sleep inside wood and stone that breathe.
          </h2>
          <p className="mt-4 text-[15px] md:text-[16px] font-light leading-relaxed text-deodar max-w-xl mx-auto">
            Experience the natural quiet and warmth of traditional kath-kuni living. Reserve your room
            or book the entire home for your residency.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 rounded-full bg-bark px-7 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-parchment transition-all hover:bg-clay hover:shadow-lg active:scale-95"
            >
              <span>Choose Your Stay</span>
              <span>→</span>
            </Link>
            <Link
              href="/stay"
              className="inline-flex items-center gap-2 rounded-full border border-bark/20 px-6 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-bark transition-colors hover:bg-bark/5"
            >
              <span>View All Rooms</span>
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
