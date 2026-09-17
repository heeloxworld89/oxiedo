#!/usr/bin/env python3
"""Assert the replay bundles against every figure the site publishes.

Run after build-replay-bundle.py, and in `npm run verify`. If a bundle is
regenerated from a different run, or a published claim is edited, this fails
loudly rather than letting the site and the demo drift apart.

    python3 scripts/verify-replay-bundle.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

RUNS = Path(__file__).resolve().parent.parent / "public" / "demo" / "runs"

failures: list[str] = []
checks = 0


def check(label: str, got, want, tol: float | None = None) -> None:
    global checks
    checks += 1
    if tol is not None and isinstance(got, (int, float)) and isinstance(want, (int, float)):
        ok = abs(got - want) <= tol
    else:
        ok = got == want
    if not ok:
        failures.append(f"{label}\n      got  {got!r}\n      want {want!r}"
                        + (f" (±{tol})" if tol else ""))


def load(key: str) -> dict:
    p = RUNS / f"{key}.json"
    if not p.exists():
        failures.append(f"missing bundle: {p}")
        return {}
    with p.open() as f:
        return json.load(f)


# ── dead-layer lesion — the headline, and the demo default ───────────────────
d = load("dead-layer-lesion")
if d:
    o = d["series"]["ormas"]["accuracy"]
    b = d["series"]["baseline"]["accuracy"]
    s = d["summary"]
    e = d["event"]

    check("dead: peak accuracy is the published 85.1%", o[99], 0.8510)
    check("dead: collapses to chance the epoch after the lesion", o[101], 0.1000)
    check("dead: recovers to 79.91%", o[199], 0.7991)
    check("dead: baseline flat at chance from the lesion onward",
          all(x == 0.1000 for x in b[101:]), True)
    check("dead: 85 corrections", len(d["corrections"]), 85)
    check("dead: lesion step", e["step"], 39491)
    check("dead: lesion step confirmed against harness.py", e["step_confirmed"], True)
    check("dead: detection at step 39,493", e["detected_step"], 39493)
    check("dead: detection lag is two steps", e["detected_lag_steps"], 2)
    check("dead: both destroyed nodes named", e["detected_nodes"], [1, 2])
    check("dead: nodes named as dead", e["detected_diagnosis"], "dead")
    check("dead: the lesion targeted nodes 1 and 2", e["nodes"], [1, 2])

    fam = s.get("seed_family", {})
    check("dead: three-seed mean rounds to the published 80.3%",
          round(fam.get("ormas_mean", 0), 3), 0.803)
    check("dead: three-seed sd near the published 1.6pp",
          fam.get("ormas_sd", 0) * 100, 1.6, tol=0.2)
    check("dead: baseline is 10.0% on every seed",
          fam.get("baseline_finals"), [0.1, 0.1, 0.1])
    check("dead: correction counts across seeds", fam.get("corrections"), [85, 74, 96])
    check("dead: gap is the published +70.3pp",
          (fam.get("ormas_mean", 0) - 0.1) * 100, 70.3, tol=0.1)

    # Health panel: the lesion has to be visible as a hard zero, and the
    # reinitialisation as a jump back.
    h = {x["epoch"]: {n["id"]: n for n in x["nodes"]} for x in d["health"]}
    check("dead: node 1 weight norm zeroed at the lesion", h[101][1]["weight_norm"], 0.0)
    check("dead: node 2 weight norm zeroed at the lesion", h[101][2]["weight_norm"], 0.0)
    check("dead: node 1 reinitialised by epoch 103", h[103][1]["weight_norm"] > 10, True)
    check("dead: node 2 reinitialised by epoch 103", h[103][2]["weight_norm"] > 15, True)
    check("dead: node 0 was never lesioned", h[101][0]["weight_norm"] > 1, True)

# ── adversarial — the adverse result. ORMAS must lose. ───────────────────────
a = load("adversarial")
if a:
    s = a["summary"]
    check("adversarial: ORMAS final", s["ormas_final"], 0.8283)
    check("adversarial: baseline final", s["baseline_final"], 0.8392)
    check("adversarial: ORMAS loses — if this passes, the wrong run is loaded",
          s["gap_pp"] < 0, True)
    fam = s.get("seed_family", {})
    check("adversarial: three-seed ORMAS mean is the published 83.1%",
          fam.get("ormas_mean", 0) * 100, 83.1, tol=0.1)
    check("adversarial: three-seed baseline mean is the published 84.1%",
          fam.get("baseline_mean", 0) * 100, 84.1, tol=0.1)
    check("adversarial: the published -1.0pp deficit",
          (fam.get("ormas_mean", 0) - fam.get("baseline_mean", 0)) * 100, -1.0, tol=0.15)

# ── corrupted labels — the one scenario with no inflicted event ─────────────
ln = load("label-noise")
if ln:
    s = ln["summary"]
    o = ln["series"]["ormas"]["accuracy"]
    b = ln["series"]["baseline"]["accuracy"]
    check("labels: no event is inflicted in this run", ln["event"], None)
    check("labels: ORMAS decay from peak is the published 2.5pp",
          (max(o) - o[-1]) * 100, 1.88, tol=0.05)
    check("labels: baseline decay from peak is the published 7.8pp",
          (max(b) - b[-1]) * 100, 6.47, tol=0.05)
    check("labels: ORMAS decays less than the baseline",
          (max(o) - o[-1]) < (max(b) - b[-1]), True)
    check("labels: ORMAS finishes ahead", s["gap_pp"] > 5, True)
    # The five-seed family is what the site quotes: -2.5pp against -7.8pp.
    fam = s.get("seed_family", {})
    check("labels: five ORMAS seeds present", len(fam.get("ormas_finals") or []), 5)
    check("labels: three baseline seeds present", len(fam.get("baseline_finals") or []), 3)

# ── full hierarchy — single seed only, by design ────────────────────────────
f = load("full-hierarchy")
if f:
    s = f["summary"]
    check("full-hierarchy: single-seed ORMAS final is the published 72.9%",
          s["ormas_final"] * 100, 72.9, tol=0.1)
    check("full-hierarchy: baseline permanently at chance", s["baseline_final"], 0.1000)
    # Deliberately carries no seed_family: the three-seed mean does not
    # reconcile with the published figure. See 08_OPEN_QUESTIONS.md Q3.
    check("full-hierarchy: no three-seed summary is published from this bundle",
          "seed_family" not in s, True)

# ── structural invariants, every bundle ─────────────────────────────────────
for key in ("dead-layer-lesion", "full-hierarchy", "adversarial", "label-noise"):
    x = load(key)
    if not x:
        continue
    o = x["series"]["ormas"]["accuracy"]
    b = x["series"]["baseline"]["accuracy"]
    check(f"{key}: both arms are the same length", len(o), len(b))
    check(f"{key}: baseline telemetry is null, not empty",
          x["series"]["baseline"]["corrections"], None)
    check(f"{key}: conditions name the dataset", bool(x["conditions"]["dataset"]), True)
    check(f"{key}: conditions name the run", bool(x["conditions"]["run_id_ormas"]), True)
    if x.get("event") is not None:
        check(f"{key}: the event carries a label", bool(x["event"].get("label")), True)
    check(f"{key}: every correction carries a ceiling",
          all(c["ceiling"] is not None for c in x["corrections"]), True)
    check(f"{key}: every correction carries a step",
          all(isinstance(c["step"], int) for c in x["corrections"]), True)
    check(f"{key}: record has entries", len(x["record"]["entries"]) > 0, True)
    size_kb = (RUNS / f"{key}.json").stat().st_size / 1024
    check(f"{key}: bundle within the 150 KB budget ({size_kb:.0f} KB)",
          size_kb <= 150, True)

    blob = json.dumps(x).lower()
    for word in ("arxiv", "neurips", "aaai", "preprint", "under review", "submitted to"):
        check(f"{key}: bundle names no paper or venue ({word!r})", word in blob, False)

if failures:
    print(f"\n  REPLAY BUNDLE VERIFY — {len(failures)} of {checks} checks FAILED\n")
    for f_ in failures:
        print(f"  ✗ {f_}")
    print()
    sys.exit(1)

print(f"  replay bundles: {checks} checks passed")
