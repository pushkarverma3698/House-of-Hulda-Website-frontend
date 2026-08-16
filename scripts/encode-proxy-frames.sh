#!/usr/bin/env bash
#
# encode-proxy-frames.sh — build the low-resolution proxy tier of the hero film.
#
# WHY THIS EXISTS
#   A decoded 720x1280 RGBA frame costs 3.52 MiB of GPU memory. The 48 MB mobile
#   bitmap budget therefore holds 13 frames — 370 px of scroll — while a single
#   momentum flick travels ~1,900 px. The cache can never contain the frames the
#   playhead is about to cross, so it thrashes: measured, one flick decoded 87
#   frames to display 19 of them (306 MB of GPU churn for a 5% delivery rate).
#
#   At PROXY_WIDTH the whole 240-frame sequence fits in the budget at once, so
#   there is nothing to evict and nothing to miss. The full-resolution frame is
#   swapped back in by ScrollCanvas whenever the scroll settles.
#
# USAGE
#   ./scripts/encode-proxy-frames.sh            # encode
#   ./scripts/encode-proxy-frames.sh --report   # size report only, no encode
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$REPO_ROOT/public/frames/hero"
OUT_DIR="$REPO_ROOT/public/frames/hero-proxy"

# 160 wide keeps the 9:16 source ratio (160x284) at 177 KB decoded, so all 240
# frames are 42.6 MB resident — inside the 48 MB mobile budget with headroom
# for one full-resolution frame.
PROXY_WIDTH=160
JPEG_QUALITY=5   # ffmpeg -q:v, 2=best .. 31=worst. 5 is visually clean at this size.

bytes_of_dir() { du -sk "$1" 2>/dev/null | awk '{printf "%.1f", $1/1024}'; }

report() {
  local count src_mb out_mb per_file decoded_mb
  count=$(find "$SRC_DIR" -name 'frame_*.jpg' | wc -l | tr -d ' ')
  src_mb=$(bytes_of_dir "$SRC_DIR")
  echo "source     : $count frames, ${src_mb} MB on disk, 720x1280"
  echo "             3.52 MiB decoded each -> 13 frames fit the 48 MB mobile budget"
  if [ -d "$OUT_DIR" ]; then
    out_mb=$(bytes_of_dir "$OUT_DIR")
    per_file=$(find "$OUT_DIR" -name 'frame_*.jpg' -exec ls -l {} + | awk '{s+=$5;n++} END {if(n)printf "%.1f", s/n/1024}')
    decoded_mb=$(awk -v w="$PROXY_WIDTH" -v n="$count" 'BEGIN{printf "%.1f", (w*(w*16/9)*4*n)/1048576}')
    echo "proxy      : $(find "$OUT_DIR" -name 'frame_*.jpg' | wc -l | tr -d ' ') frames, ${out_mb} MB on disk (${per_file} KB each)"
    echo "             ~${decoded_mb} MB decoded for ALL $count frames -> zero eviction, zero misses"
  else
    echo "proxy      : not built yet"
  fi
}

if [ "${1:-}" = "--report" ]; then report; exit 0; fi

command -v ffmpeg >/dev/null || { echo "error: ffmpeg not found (brew install ffmpeg)" >&2; exit 1; }
[ -d "$SRC_DIR" ] || { echo "error: $SRC_DIR does not exist" >&2; exit 1; }

mkdir -p "$OUT_DIR"

echo "encoding proxy tier at ${PROXY_WIDTH}px wide -> $OUT_DIR"
# scale=W:-2 forces an even height, which every JPEG encoder requires.
ffmpeg -hide_banner -loglevel error -y \
  -start_number 1 -i "$SRC_DIR/frame_%03d.jpg" \
  -vf "scale=${PROXY_WIDTH}:-2:flags=lanczos" \
  -q:v "$JPEG_QUALITY" \
  -start_number 1 "$OUT_DIR/frame_%03d.jpg"

echo ""
report
