#!/usr/bin/env bash
# Rasterise the replay cards to PNG for og:image.
#
# The cards are authored as SVG by build-replay-cards.py, because SVG can be
# generated deterministically from the bundle with no dependencies and no
# drawing by hand. og:image needs a raster format, and that needs a rasteriser.
#
#   brew install librsvg
#   ./scripts/rasterise-cards.sh
#
# macOS QuickLook can render the SVG without any install, but it renders into a
# square canvas and sips only crops from the centre, so the result is cropped
# wrong. It is deliberately not used as a fallback: a silently mis-cropped
# social card is worse than no card, because nobody checks it before it ships.
set -euo pipefail

cd "$(dirname "$0")/.."
CARDS="public/black-box/cards"

if ! command -v rsvg-convert >/dev/null 2>&1; then
	echo "rsvg-convert not found."
	echo "  brew install librsvg"
	echo
	echo "The SVG cards in $CARDS are complete and current; only the PNG"
	echo "conversion is outstanding."
	exit 1
fi

shopt -s nullglob
count=0
for svg in "$CARDS"/*.svg; do
	png="${svg%.svg}.png"
	rsvg-convert -w 1200 -h 630 "$svg" -o "$png"
	printf "  %-46s %6.1f KB\n" "$(basename "$png")" "$(echo "scale=1; $(stat -f%z "$png")/1024" | bc)"
	count=$((count + 1))
done
echo
echo "rasterised $count cards"
