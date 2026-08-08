#!/bin/bash
cd /Users/pushkarverma/Projects/house-of-hulda
rm -rf .next
pkill -9 -f "next dev" 2>/dev/null
sleep 2
PORT=3001 npm run dev > /tmp/hulda-dev-3001.log 2>&1 &
sleep 4
tail -20 /tmp/hulda-dev-3001.log
