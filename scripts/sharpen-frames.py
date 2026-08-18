#!/usr/bin/env python3
"""
sharpen-frames.py — recover perceived sharpness in the hero film tiers.

WHY THIS EXISTS
  The master frame set at public/frames/hero is 720x1280. A current phone's
  canvas backing store asks for ~1,150-1,440px wide and a 1080p desktop
  asks for ~1,920px wide, so even the "sharp" tier is a 1.6x-2.7x real-time
  upscale done by the browser's canvas compositor. That upscale is what
  reads as softness in a manual review — confirmed visually (screenshot
  crops of the L-05 cabin shot show soft porch railings and foliage even
  in the settled, full-resolution tier).

  This is not a scheduling bug — components/canvas/ScrollCanvas.tsx already
  gets the hi-res tier on screen as much as the decode pipeline allows
  (see docs/superpowers/specs/2026-08-16-scroll-sharpness-and-url-bar-design.md).
  It is a source-resolution ceiling. Actually raising the master's pixel
  count would require a re-master (no higher-res source exists in this
  repo — public/frames/hero IS the master) and would also grow the decoded
  in-memory footprint the frame ladder was carefully budgeted around for
  an iPhone 11-class device, risking the exact cache-thrash the proxy tier
  exists to prevent.

  What IS available without touching that budget: an offline unsharp-mask
  pass. Same pixel dimensions in, same pixel dimensions out — the decoded
  byte budget in ScrollCanvas.tsx (width * height * 4) is untouched, so the
  frame ladder's resident-frame-count math for every device class is
  unaffected. Only the JPEG bytes change. This is standard broadcast/DI
  color-grade practice for exactly this situation (soft AI-generated
  source): recover edge contrast that the source already implies but the
  encode/compression buried.

USAGE
  python3 scripts/sharpen-frames.py            # process all tiers
  python3 scripts/sharpen-frames.py --report   # size report only

Regenerates hero-mid and hero-proxy FROM the newly sharpened hero master via
Lanczos downscale, so all three tiers stay visually consistent instead of two
of them still tracing back to the softer original.
"""
import os
import sys
from PIL import Image, ImageFilter, ImageEnhance

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HERO_DIR = os.path.join(REPO_ROOT, "public/frames/hero")
MID_DIR = os.path.join(REPO_ROOT, "public/frames/hero-mid")
PROXY_DIR = os.path.join(REPO_ROOT, "public/frames/hero-proxy")

TOTAL_FRAMES = 240

# Master tier: dimensions untouched (720x1280 stays 720x1280). Tuned against
# a visual A/B on frame_120 (the L-05 cabin/orchard shot) — this radius/percent
# recovers real edge contrast in foliage and porch railings without haloing
# around the highest-contrast edges in the frame (the string lights against
# the dark porch). q=85 lands the re-encoded file within ~2KB of the
# original's size despite the added high-frequency detail sharpening adds.
MASTER_UNSHARP = dict(radius=2.2, percent=180, threshold=3)
MASTER_CONTRAST = 1.05
MASTER_SATURATION = 1.04
MASTER_QUALITY = 85

# Mid tier (320 wide): downscaling with Lanczos from an already-sharpened
# master already recovers most apparent sharpness; this is a light top-up,
# not a second full pass — oversharpening at this size shows as haloing much
# sooner than at full resolution.
MID_WIDTH = 320
MID_UNSHARP = dict(radius=1.0, percent=90, threshold=2)
MID_QUALITY = 74

# Proxy tier (160 wide): this tier is only ever seen during a fast flick,
# where eye motion blur is doing the masking, not pixel detail — additional
# sharpening here is not worth the halo risk. Lanczos downscale from the
# sharpened master only.
PROXY_WIDTH = 160
PROXY_QUALITY = 68


def frame_path(dir_, index):
    return os.path.join(dir_, f"frame_{index:03d}.jpg")


def dir_bytes(dir_):
    total = 0
    for name in os.listdir(dir_):
        total += os.path.getsize(os.path.join(dir_, name))
    return total


def report():
    for label, dir_ in [("hero", HERO_DIR), ("hero-mid", MID_DIR), ("hero-proxy", PROXY_DIR)]:
        n = len([f for f in os.listdir(dir_) if f.endswith(".jpg")])
        mb = dir_bytes(dir_) / (1024 * 1024)
        print(f"{label:12s}: {n} frames, {mb:.1f} MB on disk")


def sharpen_master(index):
    path = frame_path(HERO_DIR, index)
    im = Image.open(path).convert("RGB")
    im = im.filter(ImageFilter.UnsharpMask(**MASTER_UNSHARP))
    im = ImageEnhance.Contrast(im).enhance(MASTER_CONTRAST)
    im = ImageEnhance.Color(im).enhance(MASTER_SATURATION)
    im.save(path, quality=MASTER_QUALITY, optimize=True)
    return im


def derive_tier(master_im, out_dir, width, unsharp, quality, index):
    w, h = master_im.size
    height = round(h * (width / w) / 2) * 2  # even height, matches the old ffmpeg -2 behavior
    im = master_im.resize((width, height), Image.LANCZOS)
    if unsharp:
        im = im.filter(ImageFilter.UnsharpMask(**unsharp))
    im.save(frame_path(out_dir, index), quality=quality, optimize=True)


def main():
    if "--report" in sys.argv:
        report()
        return

    for d in (HERO_DIR, MID_DIR, PROXY_DIR):
        if not os.path.isdir(d):
            print(f"error: {d} does not exist", file=sys.stderr)
            sys.exit(1)

    for index in range(1, TOTAL_FRAMES + 1):
        master_im = sharpen_master(index)
        derive_tier(master_im, MID_DIR, MID_WIDTH, MID_UNSHARP, MID_QUALITY, index)
        derive_tier(master_im, PROXY_DIR, PROXY_WIDTH, None, PROXY_QUALITY, index)
        if index % 40 == 0:
            print(f"  ...{index}/{TOTAL_FRAMES}")

    print("done")
    report()


if __name__ == "__main__":
    main()
