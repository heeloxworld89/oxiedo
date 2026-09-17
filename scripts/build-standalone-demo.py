#!/usr/bin/env python3
"""Build a single self-contained HTML file carrying the replay demo.

One file, no server, no network. Everything inlined: the stylesheets, the
component script, the fonts, and all four replay bundles. It opens from disk,
survives being attached to an email, and can be handed to an evaluator who has
no access to anything of ours.

    npm run build && python3 scripts/build-standalone-demo.py

Writes  dist/black-box-standalone.html

Why a separate artefact rather than a link to the site: the people this is sent
to — an investor, a journalist, a model-risk function — frequently cannot reach
an external URL from the machine they read mail on, and a demo that needs a
network round-trip to show its first frame is a demo that does not get watched.
"""
from __future__ import annotations

import base64
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
SRC = DIST / "black-box" / "index.html"
OUT = DIST / "black-box-standalone.html"
SITE = "https://oxiedo.com"


def inline_css(html: str) -> str:
    def repl(m: re.Match) -> str:
        href = m.group(1)
        path = DIST / href.lstrip("/")
        if not path.exists():
            return m.group(0)
        css = path.read_text()
        css = inline_fonts(css)
        return f"<style>{css}</style>"

    return re.sub(r'<link rel="stylesheet" href="(/_astro/[^"]+\.css)"\s*/?>', repl, html)


def inline_fonts(css: str) -> str:
    """Fonts as data URIs. Without them the page falls back to system faces and
    the numbers in the telemetry stop lining up, because the readout is set in a
    tabular monospace and the fallback is not."""
    def repl(m: re.Match) -> str:
        url = m.group(1)
        path = DIST / url.lstrip("/")
        if not path.exists():
            return m.group(0)
        b64 = base64.b64encode(path.read_bytes()).decode()
        return f"url(data:font/woff2;base64,{b64})"

    return re.sub(r'url\((/fonts/[^)]+\.woff2)\)', repl, css)


def inline_scripts(html: str) -> str:
    def repl(m: re.Match) -> str:
        src = m.group(1)
        path = DIST / src.lstrip("/")
        if not path.exists():
            return ""
        # The nav and view-transition scripts have nothing to drive in a single
        # file, and the client router would try to intercept links that now
        # point off-site.
        if "ClientRouter" in src:
            return ""
        return f"<script type=\"module\">{path.read_text()}</script>"

    return re.sub(r'<script type="module" src="(/_astro/[^"]+\.js)"\s*>\s*</script>', repl, html)


def absolutise_links(html: str) -> str:
    """Every in-site link becomes an absolute oxiedo.com URL. A relative href in
    a file opened from disk resolves against the filesystem and 404s."""
    html = re.sub(r'href="(/(?!/)[^"#?]*)"', lambda m: f'href="{SITE}{m.group(1)}"', html)
    html = re.sub(r'href="(/[^"]*[#?][^"]*)"', lambda m: f'href="{SITE}{m.group(1)}"', html)
    return html


def strip_head_noise(html: str) -> str:
    """Canonical, sitemap, icons and preloads all point at paths that do not
    exist beside a single file. A canonical tag on a detached copy is also
    actively wrong: it would tell a crawler this file is the page."""
    for pat in (
        r'<link rel="canonical"[^>]*>',
        r'<link rel="icon"[^>]*>',
        r'<link rel="apple-touch-icon"[^>]*>',
        r'<link rel="manifest"[^>]*>',
        r'<link rel="preload"[^>]*>',
        r'<link rel="sitemap"[^>]*>',
        r'<meta property="og:[^>]*>',
        r'<meta name="twitter:[^>]*>',
    ):
        html = re.sub(pat, "", html)
    return html


def embed_bundles(html: str) -> str:
    runs = sorted((DIST / "black-box" / "runs").glob("*.json"))
    data = {p.stem: json.loads(p.read_text()) for p in runs}
    payload = json.dumps(data, separators=(",", ":"))
    tag = (
        "<script>window.__REPLAY_BUNDLES__=" + payload + ";</script>"
    )
    return html.replace("</head>", tag + "</head>", 1)


def main() -> int:
    if not SRC.exists():
        print("dist/black-box/index.html not found — run `npm run build` first")
        return 1

    html = SRC.read_text()
    html = strip_head_noise(html)
    html = inline_css(html)
    html = inline_scripts(html)
    html = embed_bundles(html)
    html = absolutise_links(html)

    banner = (
        '<div style="background:#16182B;color:#F3F1EA;padding:10px 16px;'
        'font:14px/1.5 system-ui,sans-serif;text-align:center">'
        'Self-contained copy of the replay at '
        f'<a href="{SITE}/black-box" style="color:#A5A0FF">oxiedo.com/demo</a>. '
        'Every figure is read from an archived run embedded in this file.'
        "</div>"
    )
    html = html.replace("<body", banner + "<body", 1) if "<body" not in html else html
    html = re.sub(r"(<body[^>]*>)", r"\1" + banner, html, count=1)

    OUT.write_text(html)
    kb = OUT.stat().st_size / 1024
    print(f"  dist/black-box-standalone.html   {kb:.0f} KB")

    # A leftover absolute asset path means something did not inline, and the file
    # would silently render unstyled on a machine with no network.
    leftovers = re.findall(r'(?:src|href)="(/(?:_astro|fonts|icons|demo)/[^"]*)"', html)
    if leftovers:
        print("  WARNING — un-inlined assets remain:")
        for l in sorted(set(leftovers)):
            print(f"    {l}")
        return 1
    print("  no un-inlined assets")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
