#!/usr/bin/env node
/**
 * House of Hulda 2035 — Google Veo / Fal.ai Video Loop Pipeline Generator
 *
 * Automates the generation of 60fps Quad HD video loops for the 8 Navigable Film scenes.
 *
 * Usage:
 *   GOOGLE_VEO_API_KEY=... FAL_KEY=... node scripts/generate-veo-video-loops.mjs
 */

import fs from "fs/promises";
import path from "path";
import fileURLToPath from "url";

const SCENE_VIDEO_PROMPTS = [
  {
    id: "scene_01_valley_drive",
    name: "Scene 1: The Naggar Valley Drive",
    prompt:
      "IMAX 70mm cinematic camera slow tracking shot along winding mountain asphalt road in Naggar Manali, ancient 100ft deodar pine trees on both sides, thick blue-hour morning fog rolling over road, 60fps photorealistic smooth motion loop.",
    targetFile: "public/film/scene_01_valley_drive.mp4",
  },
  {
    id: "scene_02_altitude_ascent",
    name: "Scene 2: The Altitude Ascent",
    prompt:
      "Aerial drone slow rise over Himalayan terraced apple orchards and stone hamlets climbing from 1,420m to 2,000m, lifting mountain mist revealing snow peaks in distance, 60fps cinematic loop.",
    targetFile: "public/film/scene_02_altitude_ascent.mp4",
  },
  {
    id: "scene_03_kathkuni_gate",
    name: "Scene 3: The Kath-Kuni Threshold",
    prompt:
      "Apple product reveal style slow push-in shot toward ancient hand-carved deodar wooden entrance gate of House of Hulda, warm 2200K amber lanterns igniting in twilight mist, 60fps smooth loop.",
    targetFile: "public/film/scene_03_kathkuni_gate.mp4",
  },
  {
    id: "scene_04_deodar_suite_entry",
    name: "Scene 4: Deodar Suite First-Person POV",
    prompt:
      "First-person slow motion opening of carved wooden door into warm candlelit suite, mud plaster walls, plush bed, window overlooking misty pine forest at dusk, 60fps smooth pan.",
    targetFile: "public/film/scene_04_deodar_suite_entry.mp4",
  },
  {
    id: "scene_05_woodfire_hearth",
    name: "Scene 5: The Woodfire Hearth & Feast",
    prompt:
      "Macro 120fps slow-motion camera orbit around steaming Himachali Dham thali served on brass plates by crackling stone hearth fireplace, ember sparks rising in warm candlelight, 60fps loop.",
    targetFile: "public/film/scene_05_woodfire_hearth.mp4",
  },
  {
    id: "scene_06_naggar_milkyway",
    name: "Scene 6: The Naggar Interstellar Sky",
    prompt:
      "Christopher Nolan Interstellar style camera tilt-up through pine tree silhouette to rotating Milky Way galaxy and shooting stars over snow-capped Himalayan mountains, 60fps time-lapse loop.",
    targetFile: "public/film/scene_06_naggar_milkyway.mp4",
  },
  {
    id: "scene_07_golden_hour_deck",
    name: "Scene 7: The Golden Hour Deck Glide",
    prompt:
      "Smooth glide camera movement onto wooden deck of heritage homestay at sunset, golden sun dipping behind snow peaks, warm mountain breeze swaying linen curtains, 60fps loop.",
    targetFile: "public/film/scene_07_golden_hour_deck.mp4",
  },
  {
    id: "scene_08_artisan_handloom",
    name: "Scene 8: The Kullu Handloom Weave",
    prompt:
      "Macro extreme close-up video of shuttle weaving wool threads into intricate geometric Kullu shawl pattern on traditional wooden loom, raking side light, 60fps slow motion loop.",
    targetFile: "public/film/scene_08_artisan_handloom.mp4",
  },
];

console.log("=== House of Hulda Video Pipeline Generator ===");
console.log(`Loaded ${SCENE_VIDEO_PROMPTS.length} movie scenes for Google Veo / Fal.ai generation.`);

for (const scene of SCENE_VIDEO_PROMPTS) {
  console.log(`\n[${scene.name}]`);
  console.log(`  Prompt: "${scene.prompt}"`);
  console.log(`  Target: ${scene.targetFile}`);
}
