#!/bin/bash
set -euo pipefail

rm -rf public/frames/hero public/frames/hero-desktop public/frames/hero-mid public/frames/hero-proxy public/frames/hero-mid-desktop public/frames/hero-proxy-desktop
mkdir -p public/frames/hero public/frames/hero-desktop public/frames/hero-mid public/frames/hero-proxy public/frames/hero-mid-desktop public/frames/hero-proxy-desktop

echo "Extracting Mobile (hero)..."
ffmpeg -v error -y -i public/videos/master_mobile_optimized.mp4 -qscale:v 2 public/frames/hero/frame_%03d.jpg
echo "Extracting Mobile (hero-mid)..."
ffmpeg -v error -y -i public/videos/master_mobile_optimized.mp4 -vf "scale=320:-2:flags=lanczos" -qscale:v 4 public/frames/hero-mid/frame_%03d.jpg
echo "Extracting Mobile (hero-proxy)..."
ffmpeg -v error -y -i public/videos/master_mobile_optimized.mp4 -vf "scale=160:-2:flags=lanczos" -qscale:v 6 public/frames/hero-proxy/frame_%03d.jpg

echo "Extracting Desktop (hero-desktop)..."
ffmpeg -v error -y -i public/videos/master_scroll_optimized.mp4 -qscale:v 2 public/frames/hero-desktop/frame_%03d.jpg
echo "Extracting Desktop (hero-mid-desktop)..."
ffmpeg -v error -y -i public/videos/master_scroll_optimized.mp4 -vf "scale=568:-2:flags=lanczos" -qscale:v 4 public/frames/hero-mid-desktop/frame_%03d.jpg
echo "Extracting Desktop (hero-proxy-desktop)..."
ffmpeg -v error -y -i public/videos/master_scroll_optimized.mp4 -vf "scale=284:-2:flags=lanczos" -qscale:v 6 public/frames/hero-proxy-desktop/frame_%03d.jpg

echo "Done!"
