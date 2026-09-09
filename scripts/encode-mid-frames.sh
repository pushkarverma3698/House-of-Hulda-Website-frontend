#!/usr/bin/env bash
#
# encode-mid-frames.sh — build the middle tier of the hero film.
#
# WHY THIS EXISTS
#   The proxy tier (160 px wide) exists so all 240 frames stay resident and a
#   fast flick can never miss. But it is what the viewer looks at for the whole
#   scroll, upscaled ~3.7x to the canvas backing store, and it reads as soft.
#
#   The full-resolution tier cannot carry motion: 3.52 MiB decoded per frame
#   means a cache that thrashes at flick speed (measured: 87 decodes for 19
#   paints, 5% delivery). So a middle tier carries the case in between —
#   deliberate, slow scrolling, which is how the page is actually read.
#
#   At MID_WIDTH a decoded frame is 727 KB, so a ~33-frame LRU window is 24 MB.
#   ScrollCanvas only requests this tier when scroll velocity is below
#   FAST_FLICK_THRESHOLD; above it the proxy carries the frame unchanged.
#
#   These frames are fetched on demand, never preloaded — the cold-start
#   payload stays at the proxy tier's 2.0 MB.
#
# USAGE
#   ./scripts/encode-mid-frames.sh            # encode
#   ./scripts/encode-mid-frames.sh --report   # size report only, no encode
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$REPO_ROOT/public/frames/hero"
OUT_DIR="$REPO_ROOT/public/frames/hero-mid"

# 320 wide keeps the 9:16 source ratio (320x568) at 727 KB decoded. On a phone
# with DPR capped at 1.5 the canvas backing store is ~585 px wide, so this is a
# 1.9x upscale against the proxy tier's 3.7x.
MID_WIDTH=320
JPEG_QUALITY=5   # ffmpeg -q:v, 2=best .. 31=worst. Matches the proxy tier.

bytes_of_dir() { du -sk "$1" 2>/dev/null | awk '{printf "%.1f", $1/1024}'; }

report() {
  local count out_mb per_file decoded_each window_mb
  count=$(find "$SRC_DIR" -name 'frame_*.jpg' | wc -l | tr -d ' ')
  echo "source     : $count frames, 720x1280"
  if [ -d "$OUT_DIR" ]; then
    out_mb=$(bytes_of_dir "$OUT_DIR")
    per_file=$(find "$OUT_DIR" -name 'frame_*.jpg' -exec ls -l {} + | awk '{s+=$5;n++} END {if(n)printf "%.1f", s/n/1024}')
    decoded_each=$(awk -v w="$MID_WIDTH" 'BEGIN{printf "%.0f", (w*int(w*16/9)*4)/1024}')
    window_mb=$(awk -v w="$MID_WIDTH" 'BEGIN{printf "%.1f", (w*int(w*16/9)*4*33)/1048576}')
    echo "mid        : $(find "$OUT_DIR" -name 'frame_*.jpg' | wc -l | tr -d ' ') frames, ${out_mb} MB on disk (${per_file} KB each)"
    echo "             ${decoded_each} KB decoded each -> ~${window_mb} MB for a 33-frame window"
    echo "             fetched on demand, NOT preloaded: cold start stays at the proxy tier"
  else
    echo "mid        : not built yet"
  fi
}

if [ "${1:-}" = "--report" ]; then report; exit 0; fi

command -v ffmpeg >/dev/null || { echo "error: ffmpeg not found (brew install ffmpeg)" >&2; exit 1; }
[ -d "$SRC_DIR" ] || { echo "error: $SRC_DIR does not exist" >&2; exit 1; }

mkdir -p "$OUT_DIR"

echo "encoding mid tier at ${MID_WIDTH}px wide -> $OUT_DIR"
# scale=W:-2 forces an even height, which every JPEG encoder requires.
ffmpeg -hide_banner -loglevel error -y \
  -start_number 1 -i "$SRC_DIR/frame_%03d.jpg" \
  -vf "scale=${MID_WIDTH}:-2:flags=lanczos" \
  -q:v "$JPEG_QUALITY" \
  -start_number 1 "$OUT_DIR/frame_%03d.jpg"

echo ""
report
