import type { Config } from "tailwindcss";

/**
 * Design tokens from the story bible's color & light system.
 * The per-scroll grade is computed at runtime in lib/grade.ts; these tokens
 * are the static brand colors used for UI chrome, text, and accents.
 */
const config: Config = {
  // Every `hover:` rule compiles inside `@media (hover: hover)`.
  //
  // There are 119 of them and a phone cannot hover. What iOS does instead is
  // apply :hover on tap and leave it applied until you tap something else — so
  // a deity tile you opened and closed stays lit and scaled at 1.02, and the
  // grid ends up with a trail of tiles that look selected and are not. The
  // effect is a UI that appears to be stuck.
  future: { hoverOnlyWhenSupported: true },
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm cream — primary text/UI on dark grade
        cream: "#f3ece1",
        ink: "#1a120b",
        // Brand accent (window-light amber) + ember
        amber: "#d99a4e",
        ember: "#c2603a",
        // Base canvas before grade kicks in
        canvas: "#0a0f17",

        // ── Warm editorial palette (light sub-pages: /stay /cafe /naggar /blog) ──
        parchment: "#FBF7EF", // lightest surface
        bone: "#F6F1E7", // page background
        sand: "#ECE2CF", // bands / cards
        clay: "#B05C36", // terracotta accent + buttons
        bark: "#2E2117", // primary text on light
        deodar: "#5A4632", // secondary brown text
        moss: "#6F6B4C", // sage tertiary
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        body: ["var(--font-mulish)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        eyebrow: "0.34em",
        label: "0.2em",
      },
      transitionTimingFunction: {
        // a long exhale
        exhale: "cubic-bezier(.2,.7,.2,1)",
      },
    },
  },
  plugins: [],
};

export default config;
