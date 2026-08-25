#!/usr/bin/env python3
"""
sharpen-frames.py — recover perceived sharpness in the hero film tiers.

WHY THIS EXISTS
  The master frame set is 720x1280. A current phone's canvas backing store
  asks for ~1,150-1,440px wide and a 1080p desktop asks for ~1,920px, so
  even the "sharp" tier is a 1.6x-2.7x real-time upscale done by the
  browser's canvas compositor. That upscale is what reads as softness in a
  manual review — confirmed visually (screenshot crops of the L-05 cabin
  shot show soft porch railings and foliage even in the settled,
  full-resolution tier).

  This is not a scheduling bug — components/canvas/ScrollCanvas.tsx already
  gets the hi-res tier on screen as much as the decode pipeline allows
  (see docs/superpowers/specs/2026-08-16-scroll-sharpness-and-url-bar-design.md).
  It is a source-resolution ceiling. Actually raising the master's pixel
  count would require a re-master (no higher-res source exists in this
  repo) and would also grow the decoded in-memory footprint the frame
  ladder was carefully budgeted around for an iPhone 11-class device,
  risking the exact cache-thrash the proxy tier exists to prevent.

  What IS available without touching that budget: an offline unsharp-mask
  pass. Same pixel dimensions in, same pixel dimensions out — the decoded
  byte budget in ScrollCanvas.tsx (width * height * 4) is untouched, so the
  frame ladder's resident-frame-count math for every device class is
  unaffected. Only the encoded bytes change. This is standard broadcast/DI
  color-grade practice for exactly this situation (soft AI-generated
  source): recover edge contrast that the source already implies but the
  encode/compression buried.

PIPELINE (as of the hero-desktop / webp mid+proxy split)
  Two independent full-resolution masters now exist — hero/ (mobile, a
  hardware-decode-friendly re-encode) and hero-desktop/ (desktop, full
  original quality) — both sharpened here, independently, since they are
  not byte-identical inputs. hero-mid/ and hero-proxy/ are shared across
  device classes (ScrollCanvas.tsx's proxyFrameUrl/midFrameUrl carry no
  device branch, only hiresFrameUrl does) and are encoded as WebP; they are
  derived from the sharpened mobile master via Lanczos downscale, same as
  before the webp switch.

USAGE
  python3 scripts/sharpen-frames.py            # process all tiers
  python3 scripts/sharpen-frames.py --report   # size report only
"""
import os
import sys
from PIL import Image, ImageFilter, ImageEnhance

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HERO_DIR = os.path.join(REPO_ROOT, "public/frames/hero")
HERO_DESKTOP_DIR = os.path.join(REPO_ROOT, "public/frames/hero-desktop")
MID_DIR = os.path.join(REPO_ROOT, "public/frames/hero-mid")
PROXY_DIR = os.path.join(REPO_ROOT, "public/frames/hero-proxy")

TOTAL_FRAMES = 240

# Master tiers: dimensions untouched (720x1280 stays 720x1280). Tuned against
# a visual A/B on frame_120 (the L-05 cabin/orchard shot) — this radius/percent
# recovers real edge contrast in foliage and porch railings without haloing
# around the highest-contrast edges in the frame (the string lights against
# the dark porch).
MASTER_UNSHARP = dict(radius=2.2, percent=180, threshold=3)
MASTER_CONTRAST = 1.05
MASTER_SATURATION = 1.04
# Mobile master is already a smaller, hardware-decode-friendly re-encode
# (~65KB/frame); match that budget rather than reflating it back toward the
# original's ~110KB. Desktop keeps the full original quality it was
# specifically re-added to preserve.
HERO_QUALITY = 78
HERO_DESKTOP_QUALITY = 90

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


def dir_bytes(dir_):
    total = 0
    for name in os.listdir(dir_):
        total += os.path.getsize(os.path.join(dir_, name))
    return total


def report():
    for label, dir_, ext in [
        ("hero", HERO_DIR, "jpg"),
        ("hero-desktop", HERO_DESKTOP_DIR, "jpg"),
        ("hero-mid", MID_DIR, "webp"),
        ("hero-proxy", PROXY_DIR, "webp"),
    ]:
        n = len([f for f in os.listdir(dir_) if f.endswith(f".{ext}")])
        mb = dir_bytes(dir_) / (1024 * 1024)
        print(f"{label:14s}: {n} frames, {mb:.1f} MB on disk")


def sharpen_master(dir_, index, quality):
    path = os.path.join(dir_, f"frame_{index:03d}.jpg")
    im = Image.open(path).convert("RGB")
    im = im.filter(ImageFilter.UnsharpMask(**MASTER_UNSHARP))
    im = ImageEnhance.Contrast(im).enhance(MASTER_CONTRAST)
    im = ImageEnhance.Color(im).enhance(MASTER_SATURATION)
    im.save(path, quality=quality, optimize=True)
    return im


def derive_webp_tier(master_im, out_dir, width, unsharp, quality, index):
    w, h = master_im.size
    height = round(h * (width / w) / 2) * 2  # even height
    im = master_im.resize((width, height), Image.LANCZOS)
    if unsharp:
        im = im.filter(ImageFilter.UnsharpMask(**unsharp))
    out_path = os.path.join(out_dir, f"frame_{index:03d}.webp")
    im.save(out_path, "WEBP", quality=quality, method=6)


def main():
    if "--report" in sys.argv:
        report()
        return

    for d in (HERO_DIR, HERO_DESKTOP_DIR, MID_DIR, PROXY_DIR):
        if not os.path.isdir(d):
            print(f"error: {d} does not exist", file=sys.stderr)
            sys.exit(1)

    for index in range(1, TOTAL_FRAMES + 1):
        mobile_master = sharpen_master(HERO_DIR, index, HERO_QUALITY)
        sharpen_master(HERO_DESKTOP_DIR, index, HERO_DESKTOP_QUALITY)
        derive_webp_tier(mobile_master, MID_DIR, MID_WIDTH, MID_UNSHARP, MID_QUALITY, index)
        derive_webp_tier(mobile_master, PROXY_DIR, PROXY_WIDTH, None, PROXY_QUALITY, index)
        if index % 40 == 0:
            print(f"  ...{index}/{TOTAL_FRAMES}")

    print("done")
    report()


if __name__ == "__main__":
    main()
