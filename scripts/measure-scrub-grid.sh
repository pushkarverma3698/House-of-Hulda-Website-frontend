#!/bin/sh
# Run the scrub harness across the profiles that matter and print the numbers
# side by side. `cpu 4` is a deliberate stress case: Chrome's CPU throttle slows
# image decode as well as script, and this container has no hardware JPEG path,
# so it is harsher than a current phone rather than representative of one.
LABEL="${1:-run}"
URL="${URL:-http://localhost:3000}"
GRID="${2:-phone/1/1400 phone/1/600 phone/1/300 phone/4/600 desktop/1/1400 desktop/1/600}"
for spec in $GRID; do
  P=$(echo "$spec" | cut -d/ -f1); C=$(echo "$spec" | cut -d/ -f2); V=$(echo "$spec" | cut -d/ -f3)
  node "$(dirname "$0")/measure-scrub.mjs" --profile "$P" --cpu "$C" --px-per-sec "$V" --url "$URL" \
    --label "$LABEL·$P·cpu$C·${V}px/s" 2>/dev/null | python3 -c "
import sys,json
d=json.load(sys.stdin)
e=d['atScrollEnd']
print('%-30s curtain=%5dms cached=%3d(%4.1fMB) | hires=%5.1f%% mid=%4.1f%% proxy=%5.1f%% | delivery=%5.1f%% ticks=%3d dec(h/m/p)=%3d/%2d/%3d | stride=%d r=%2d hit=%.2f vel=%.3f px=%3d | freeze=%4dms >100=%2d tick=%5.1fms' % (
  d['label'], d['curtainMs'], d['wireAtCurtain']['hires']['n'], d['wireAtCurtain']['hires']['mb'],
  100*e['hiresShare'], 100*e['midShare'], 100*e['proxyShare'], 100*e['delivery'],
  e['ticks'], e['decodesByTier']['hires'], e['decodesByTier']['mid'], e['decodesByTier']['proxy'], e['hiresStride'], e['hiresRadius'], e['hiresHitEma'], e['idxVelocity'], e['proxyResident'], e['worstFreezeMs'], e['freezesOver100ms'], e['tickMsEma']))
"
done
