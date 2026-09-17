#!/usr/bin/env python3
"""Generate the social cards for the replay demo, from the bundles.

The card is the single frame that carries the whole argument: two curves, one
flatlined at chance, one recovering, with the alarm callout naming the damaged
components. Most people who ever encounter this work will only see this image,
so it is generated from the bundle rather than drawn by hand — the numbers on
the card cannot drift from the numbers in the archive.

Every card carries its conditions. A figure loose on a timeline with no
conditions attached reads as an overclaim to the first serious person who sees
it, and the correction costs more than the share was worth.

    python3 scripts/build-replay-cards.py

Writes  public/demo/cards/<key>.svg   (1200x630)

PNG: og:image needs a raster format. With a rasteriser installed:
    rsvg-convert -w 1200 -h 630 public/demo/cards/<key>.svg -o public/demo/cards/<key>.png
    (brew install librsvg)
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RUNS = ROOT / "public" / "demo" / "runs"
OUT = ROOT / "public" / "demo" / "cards"

W, H = 1200, 630
PLOT = {"x": 64, "y": 188, "w": 900, "h": 300}

INK = "#16182B"
PAPER = "#F3F1EA"
ORMAS = "#E09A2B"      # the on-dark variant of --chart-ormas
BASELINE = "#8FA9D4"   # the on-dark variant of --chart-baseline
WARN = "#FF7A7A"
MUTED = "#A3A7B8"


def esc(s: str) -> str:
    return (str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


def path_for(series: list[float]) -> str:
    n = len(series) - 1
    pts = []
    for i, a in enumerate(series):
        x = PLOT["x"] + (i / n) * PLOT["w"]
        y = PLOT["y"] + (1 - a) * PLOT["h"]
        pts.append(f"{x:.1f},{y:.1f}")
    return "M" + " L".join(pts)


def card(bundle: dict) -> str:
    c = bundle["conditions"]
    s = bundle["summary"]
    ev = bundle.get("event") or {}
    o = bundle["series"]["ormas"]["accuracy"]
    b = bundle["series"]["baseline"]["accuracy"]

    ox = PLOT["x"] + PLOT["w"]
    o_end_y = PLOT["y"] + (1 - o[-1]) * PLOT["h"]
    b_end_y = PLOT["y"] + (1 - b[-1]) * PLOT["h"]

    ev_x = PLOT["x"] + (ev.get("epoch", 0) / (len(o) - 1)) * PLOT["w"] if ev else None

    named = ""
    if ev.get("detected_nodes"):
        nodes = " and ".join(f"node {n}" for n in ev["detected_nodes"])
        lag = ev.get("detected_lag_steps")
        if ev.get("step_confirmed") and lag is not None:
            named = (f"named at step {ev['detected_step']:,} — "
                     f"{'one step' if lag == 1 else f'{lag:,} steps'} later, on {nodes}")
        else:
            named = f"named within one epoch, on {nodes}"

    gap = (o[-1] - b[-1]) * 100
    headline = bundle["title"]

    conditions = (f"{c['dataset']} · seed {c['seed']} · run {c['archive_index']} · "
                  f"{c['run_id_ormas']}")

    ev_mark = ""
    if ev_x is not None:
        ev_mark = f'''
  <line x1="{ev_x:.1f}" y1="{PLOT['y']}" x2="{ev_x:.1f}" y2="{PLOT['y'] + PLOT['h']}"
        stroke="{WARN}" stroke-width="2" stroke-dasharray="5 5" opacity="0.8"/>
  <text x="{ev_x - 10:.1f}" y="{PLOT['y'] + 20}" fill="{WARN}" text-anchor="end"
        font-family="ui-monospace, Menlo, monospace" font-size="16">{esc(ev.get('label',''))}</text>'''

    grid = "".join(
        f'<line x1="{PLOT["x"]}" y1="{PLOT["y"] + (1-a)*PLOT["h"]:.1f}" '
        f'x2="{PLOT["x"]+PLOT["w"]}" y2="{PLOT["y"] + (1-a)*PLOT["h"]:.1f}" '
        f'stroke="#2C2F49" stroke-width="1"/>'
        for a in (0, 0.5, 1)
    )

    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <rect width="{W}" height="{H}" fill="{INK}"/>

  <text x="64" y="72" fill="{MUTED}" font-family="ui-monospace, Menlo, monospace"
        font-size="16" letter-spacing="2">ORMAS · THE RECORD, REPLAYED</text>

  <text x="64" y="126" fill="{PAPER}" font-family="Georgia, 'Times New Roman', serif"
        font-size="42" font-weight="600">{esc(headline)}</text>

  <text x="64" y="160" fill="{MUTED}" font-family="Helvetica, Arial, sans-serif"
        font-size="19">{esc(bundle['subtitle'])}</text>

  {grid}
  {ev_mark}

  <path d="{path_for(b)}" fill="none" stroke="{BASELINE}" stroke-width="3"
        stroke-dasharray="7 5" stroke-linejoin="round"/>
  <path d="{path_for(o)}" fill="none" stroke="{ORMAS}" stroke-width="3.5"
        stroke-linejoin="round"/>

  <circle cx="{ox}" cy="{o_end_y:.1f}" r="6" fill="{ORMAS}"/>
  <text x="{ox + 16}" y="{o_end_y - 4:.1f}" fill="{ORMAS}"
        font-family="ui-monospace, Menlo, monospace" font-size="30"
        font-weight="700">{o[-1]*100:.1f}%</text>
  <text x="{ox + 16}" y="{o_end_y + 20:.1f}" fill="{ORMAS}"
        font-family="Helvetica, Arial, sans-serif" font-size="16" opacity="0.9">ORMAS</text>

  <circle cx="{ox}" cy="{b_end_y:.1f}" r="6" fill="{BASELINE}"/>
  <text x="{ox + 16}" y="{b_end_y - 4:.1f}" fill="{BASELINE}"
        font-family="ui-monospace, Menlo, monospace" font-size="30"
        font-weight="700">{b[-1]*100:.1f}%</text>
  <text x="{ox + 16}" y="{b_end_y + 20:.1f}" fill="{BASELINE}"
        font-family="Helvetica, Arial, sans-serif" font-size="16"
        opacity="0.9">standard</text>

  <text x="64" y="548" fill="{PAPER}" font-family="Helvetica, Arial, sans-serif"
        font-size="20">{esc(named) if named else ''}</text>

  <text x="64" y="582" fill="{MUTED}" font-family="Helvetica, Arial, sans-serif"
        font-size="17">{s['corrections_total']} corrections, each with its component, step, magnitude and declared ceiling.</text>

  <text x="64" y="608" fill="{MUTED}" font-family="ui-monospace, Menlo, monospace"
        font-size="13" opacity="0.85">{esc(conditions)}</text>
</svg>
'''


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    keys = sorted(p.stem for p in RUNS.glob("*.json"))
    if not keys:
        print("no bundles found — run build-replay-bundle.py first")
        return 1
    for key in keys:
        with (RUNS / f"{key}.json").open() as f:
            bundle = json.load(f)
        svg = card(bundle)
        path = OUT / f"{key}.svg"
        path.write_text(svg)
        print(f"  {key:22s} {path.stat().st_size/1024:6.1f} KB")
    print(f"\nwrote {len(keys)} cards to {OUT}")
    print("rasterise for og:image with:  rsvg-convert -w 1200 -h 630 <in>.svg -o <out>.png")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
