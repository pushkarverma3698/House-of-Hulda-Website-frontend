import type { Config } from "tailwindcss";

/**
 * Design tokens from the story bible's color & light system.
 * The per-scroll grade is computed at runtime in lib/grade.ts; these tokens
 * are the static brand colors used for UI chrome, text, and accents.
 */
const config: Config = {
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
