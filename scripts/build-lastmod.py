#!/usr/bin/env python3
"""Per-route last-modified dates, from git, written to src/data/lastmod.json.

WHY THIS IS A SCRIPT AND NOT A BUILD-TIME GIT CALL. Vercel builds from a shallow clone. A
`git log` against a file in a shallow checkout returns the boundary commit's date, or nothing
at all, so computing this during `astro build` would produce 26 identical wrong dates on
production and 26 correct ones locally — the worst possible outcome, because it looks right
everywhere it is checked. The dates are resolved here, on a full checkout, and committed as
data. The build reads JSON and needs no git.

WHY PER-ROUTE DATES AT ALL. The sitemap used `new Date()` for every URL, so all 26 routes
claimed to change on every deploy. Google states plainly that it ignores <lastmod> once it
decides a site's values are unreliable, and "everything changed, again" is the canonical
example. A wrong lastmod is worse than none: it spends the signal and gets nothing.

WHAT COUNTS AS A CHANGE. A route's own page file, plus the data module it renders from. NOT
the layout, the nav or the footer — those touch every page, and letting them count would
rebuild exactly the "everything changed" pattern this exists to remove. A footer edit is not
a change to /licensing.
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "data" / "lastmod.json"
TODAY = __import__("datetime").date.today().isoformat()

# Route -> the files whose content the route actually reflects.
STATIC = {
    "/": ["src/pages/index.astro"],
    "/product": ["src/pages/product.astro", "src/data/features.ts"],
    "/technology": ["src/pages/technology.astro"],
    "/black-box": ["src/pages/black-box.astro", "src/components/ReplayDemo.astro"],
    "/sectors": ["src/pages/sectors.astro", "src/data/sectors.ts"],
    "/licensing": ["src/pages/licensing.astro"],
    "/invest": ["src/pages/invest.astro"],
    "/faq": ["src/pages/faq.astro", "src/data/faq.ts"],
    "/data": ["src/pages/data.astro"],
    "/about": ["src/pages/about.astro"],
    "/careers": ["src/pages/careers.astro"],
    "/contact": ["src/pages/contact.astro"],
    "/insights": ["src/pages/insights/index.astro"],
    "/press": ["src/pages/press.astro"],
}


def dirty(rel: str) -> bool:
    """True if `rel` has uncommitted changes — staged or not."""
    out = subprocess.run(
        ["git", "status", "--porcelain", "--", rel],
        cwd=ROOT, capture_output=True, text=True,
    ).stdout.strip()
    return bool(out)


def git_date(rel: str) -> str | None:
    """Commit date of the last commit touching `rel`, as YYYY-MM-DD.

    A file with uncommitted edits is dated today. Without this the table is always one
    commit stale for exactly the files being changed — the script runs before the commit
    that contains them, so every route would ship with the date of the PREVIOUS time it
    was touched, which is the one date that is definitely wrong.
    """
    if dirty(rel):
        return TODAY
    try:
        out = subprocess.run(
            ["git", "log", "-1", "--format=%cs", "--", rel],
            cwd=ROOT, capture_output=True, text=True, check=True,
        ).stdout.strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None
    return out or None


def newest(paths: list[str]) -> str | None:
    dates = [d for d in (git_date(p) for p in paths) if d]
    return max(dates) if dates else None


def ids_from(module: str, pattern: str) -> list[str]:
    """Pull the `id: '...'` values out of a data module, in file order."""
    import re
    text = (ROOT / module).read_text()
    return re.findall(pattern, text, re.M)


def main() -> int:
    if (ROOT / ".git").exists() is False:
        print("build-lastmod: not a git checkout, refusing to write guesses", file=sys.stderr)
        return 1

    shallow = subprocess.run(
        ["git", "rev-parse", "--is-shallow-repository"],
        cwd=ROOT, capture_output=True, text=True,
    ).stdout.strip()
    if shallow == "true":
        print("build-lastmod: SHALLOW CHECKOUT — dates would be wrong; refusing", file=sys.stderr)
        return 1

    table: dict[str, str] = {}
    for route, files in STATIC.items():
        d = newest(files)
        if not d:
            print(f"build-lastmod: no git date for {route} ({files})", file=sys.stderr)
            return 1
        table[route] = d

    # Generated routes: the template plus the data module that defines them.
    feat = newest(["src/pages/product/[id].astro", "src/data/features.ts"])
    for fid in ids_from("src/data/features.ts", r"^\t\tid: '([a-z-]+)'"):
        table[f"/product/{fid}"] = feat
    sect = newest(["src/pages/sectors/[id].astro", "src/data/sectors.ts"])
    for sid in ids_from("src/data/sectors.ts", r"^\t\tid: '([a-z-]+)'"):
        table[f"/sectors/{sid}"] = sect

    OUT.write_text(json.dumps(dict(sorted(table.items())), indent="\t") + "\n")
    span = f"{min(table.values())} … {max(table.values())}"
    print(f"  lastmod: {len(table)} routes, real dates spanning {span}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
