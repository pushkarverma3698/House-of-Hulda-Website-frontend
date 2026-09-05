#!/bin/bash
set -euo pipefail

rm -rf public/frames-v2/hero public/frames-v2/hero-desktop public/frames-v2/hero-mid public/frames-v2/hero-proxy public/frames-v2/hero-mid-desktop public/frames-v2/hero-proxy-desktop
mkdir -p public/frames-v2/hero public/frames-v2/hero-desktop public/frames-v2/hero-mid public/frames-v2/hero-proxy public/frames-v2/hero-mid-desktop public/frames-v2/hero-proxy-desktop

echo "Extracting Mobile (hero)..."
ffmpeg -v error -y -i public/videos/master_mobile_test.mp4 -qscale:v 2 public/frames-v2/hero/frame_%03d.jpg
echo "Extracting Mobile (hero-mid)..."
ffmpeg -v error -y -i public/videos/master_mobile_test.mp4 -vf "scale=320:-2:flags=lanczos" -qscale:v 4 public/frames-v2/hero-mid/frame_%03d.jpg
echo "Extracting Mobile (hero-proxy)..."
ffmpeg -v error -y -i public/videos/master_mobile_test.mp4 -vf "scale=160:-2:flags=lanczos" -qscale:v 6 public/frames-v2/hero-proxy/frame_%03d.jpg

echo "Extracting Desktop (hero-desktop)..."
ffmpeg -v error -y -i public/videos/master_scroll_test.mp4 -qscale:v 2 public/frames-v2/hero-desktop/frame_%03d.jpg
echo "Extracting Desktop (hero-mid-desktop)..."
ffmpeg -v error -y -i public/videos/master_scroll_test.mp4 -vf "scale=568:-2:flags=lanczos" -qscale:v 4 public/frames-v2/hero-mid-desktop/frame_%03d.jpg
echo "Extracting Desktop (hero-proxy-desktop)..."
ffmpeg -v error -y -i public/videos/master_scroll_test.mp4 -vf "scale=284:-2:flags=lanczos" -qscale:v 6 public/frames-v2/hero-proxy-desktop/frame_%03d.jpg

echo "Done!"
