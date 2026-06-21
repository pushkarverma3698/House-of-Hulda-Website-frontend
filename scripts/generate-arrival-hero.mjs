#!/usr/bin/env node
/**
 * One-off P0 image generator — same API path as nano-banana-mcp.
 * Usage: GEMINI_API_KEY=... node scripts/generate-arrival-hero.mjs
 */
import { GoogleGenAI } from "@google/genai";
import fs from "fs/promises";
import path from "path";
import os from "os";

const PROMPT =
  "Cinematic landscape photography, Naggar valley Himachal Pradesh at golden hour. Traditional Kath Kuni heritage homestay — stone and deodar wood, slate roof, warm glowing windows — emerging from lifting mist on a forested ridge at 2,000m. Snow-capped Kullu valley peaks in background. Atmospheric, handcrafted, still, unhurried. No people. No text. Photorealistic, editorial travel photography, warm amber honey light, subtle film grain. Wide composition, house centered in lower third.";

async function resolveApiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try {
    const settingsPath = path.join(os.homedir(), ".claude", "settings.json");
    const settings = JSON.parse(await fs.readFile(settingsPath, "utf8"));
    const key = settings?.mcpServers?.["nano-banana"]?.env?.GEMINI_API_KEY;
    if (key) return key;
  } catch {
    /* fall through */
  }
  console.error("Set GEMINI_API_KEY or configure nano-banana in ~/.claude/settings.json");
  process.exit(1);
}

const apiKey = await resolveApiKey();

const genAI = new GoogleGenAI({ apiKey, apiVersion: "v1alpha" });
const imagesDir = path.join(os.homedir(), "nano-banana-images");
await fs.mkdir(imagesDir, { recursive: true });

console.log("Generating arrival hero...");
const response = await genAI.models.generateContent({
  model: "gemini-3.1-flash-image",
  contents: PROMPT,
});

let savedPath = null;
if (response.candidates?.[0]?.content?.parts) {
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData?.data) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `generated-${timestamp}-arrival.png`;
      savedPath = path.join(imagesDir, fileName);
      await fs.writeFile(savedPath, Buffer.from(part.inlineData.data, "base64"));
      console.log("Saved:", savedPath);
    }
  }
}

if (!savedPath) {
  console.error("No image returned from model");
  process.exit(1);
}

console.log(savedPath);
