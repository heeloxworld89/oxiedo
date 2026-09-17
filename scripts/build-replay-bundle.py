#!/usr/bin/env python3
"""Build the replay-demo bundles from the experiment archive.

The demo reads these files and nothing else. Every figure it renders comes from
here, so no number is ever typed by hand into a component or a page.

    python3 scripts/build-replay-bundle.py

Reads   /Users/raad/Desktop/oxido/results   (the raw archive, 7.4 GB)
Writes  public/demo/runs/<key>.json          (four bundles, ~100 KB each)

Verified against the archive on 2026-09-17: see
"Replay Demo Plan/01_DATA_TRUTH.md" for the claim-by-claim reconciliation.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ARCHIVE = Path("/Users/raad/Desktop/oxido/results")
OUT = Path(__file__).resolve().parent.parent / "public" / "demo" / "runs"

# Per-diagnosis correction ceilings, as a fraction of the node's own weight norm.
# Source: config.safety_fraction_* in every ORMAS run record.
CEILINGS = {
    "dead": 0.30,
    "saturated": 0.30,
    "oscillating": 0.10,
    "loss_stagnant": 0.10,
    "gradient_dead": 0.25,
    "low_confidence": 0.15,
    "exploded": 0.90,
}

# Scenarios. Paths are relative to ARCHIVE. `seeds` lists the sibling runs used
# for the three-seed summary; `ormas`/`baseline` are the single seed replayed.
SCENARIOS = [
    {
        "key": "dead-layer-lesion",
        "title": "Dead-layer lesion",
        "subtitle": "Two convolutional stages destroyed mid-training",
        "dir": "mass upload of all/ablation/AB",
        "ormas": "ablation_ormas_cnn_dead_s0",
        "baseline": "ablation_standard_cnn_dead_s0",
        "glassbox": "ablation_ormas_cnn_dead_s0_glassbox/glassbox.jsonl",
        "seeds_ormas": ["ablation_ormas_cnn_dead_s0", "ablation_ormas_cnn_dead_s1",
                        "ablation_ormas_cnn_dead_s2"],
        "seeds_baseline": ["ablation_standard_cnn_dead_s0", "ablation_standard_cnn_dead_s1",
                           "ablation_standard_cnn_dead_s2"],
        "event_label": "Layer destroyed",
        "event_description": "Convolutional stages 1 and 2 zeroed.",
        "archive_index": "47 of 67",
    },
    {
        "key": "full-hierarchy",
        "title": "Full-hierarchy lesion",
        "subtitle": "Every convolutional stage zeroed at once",
        "dir": "mass upload of all/layer_a/extreme/EX",
        "ormas": "extreme_totalkill_ormas_cnn_s0",
        "baseline": "extreme_totalkill_standard_cnn_s0",
        "glassbox": "extreme_totalkill_ormas_cnn_s0_glassbox/glassbox.jsonl",
        # Single seed only: the three-seed mean is unreconciled against the
        # published figure. See 08_OPEN_QUESTIONS.md Q3.
        "seeds_ormas": None,
        "seeds_baseline": None,
        "event_label": "Every stage destroyed",
        "event_description": "All convolutional stages zeroed simultaneously.",
        "archive_index": "51 of 67",
    },
    {
        "key": "adversarial",
        "title": "Adversarial weight injection",
        "subtitle": "The one result that goes against us",
        "dir": "mass upload of all/layer_a/extreme/EX",
        "ormas": "extreme_adversarial_ormas_cnn_s0",
        "baseline": "extreme_adversarial_standard_cnn_s0",
        "glassbox": "extreme_adversarial_ormas_cnn_s0_glassbox/glassbox.jsonl",
        "seeds_ormas": ["extreme_adversarial_ormas_cnn_s0", "extreme_adversarial_ormas_cnn_s1",
                        "extreme_adversarial_ormas_cnn_s2"],
        "seeds_baseline": ["extreme_adversarial_standard_cnn_s0",
                           "extreme_adversarial_standard_cnn_s1",
                           "extreme_adversarial_standard_cnn_s2"],
        "event_label": "Adversarial weights injected",
        "event_description": "Crafted perturbation holding nominal activation statistics.",
        "archive_index": "38 of 67",
    },
    {
        # Replaces the 100x weight-explosion run, which was dropped after its
        # curves were plotted: both arms are flat and identical end to end, so a
        # viewer pressing play watched nothing happen for forty seconds. It is a
        # real published result and it stays on /technology; it is not a
        # scenario.
        #
        # This one earns the slot by being a different KIND of failure. Every
        # other scenario is an injury inflicted at a single step. Here the
        # corruption is in the data from the first step, nothing is ever
        # destroyed, and no alarm fires for a catastrophe — the baseline simply
        # decays through the second half of training while ORMAS holds. That is
        # the failure most buyers actually have.
        "key": "label-noise",
        "title": "Corrupted labels",
        "subtitle": "Two in five training labels are wrong, from the first step",
        "dir": "mass upload of all/NeurIPS_2026_results/results",
        "ormas": "exp003_ormas_cnn_cifar10_symmetric40_s0",
        "baseline": "st400_standard_cnn_cifar10_symmetric40_s0",
        "glassbox": "exp003_ormas_cnn_cifar10_symmetric40_s0_glassbox/glassbox.jsonl",
        "seeds_ormas": [f"exp003_ormas_cnn_cifar10_symmetric40_s{i}" for i in range(5)],
        "seeds_baseline": [f"st400_standard_cnn_cifar10_symmetric40_s{i}" for i in range(3)],
        "event_label": None,
        "event_description": None,
        "archive_index": "12 of 67",
    },
]


# ── loading ──────────────────────────────────────────────────────────────────

def find_run(scn: dict, run_id: str) -> Path:
    """Locate a run's JSON, preferring the scenario's own directory."""
    p = ARCHIVE / scn["dir"] / f"{run_id}.json"
    if p.exists():
        return p
    hits = sorted(ARCHIVE.glob(f"**/{run_id}.json"))
    if not hits:
        raise FileNotFoundError(f"{run_id}.json not found anywhere under {ARCHIVE}")
    return max(hits, key=lambda h: h.stat().st_size)


def load(path: Path) -> dict:
    with path.open() as f:
        return json.load(f)


def load_glassbox(scn: dict) -> list[dict]:
    """Load the fullest glassbox for this scenario.

    The EX/EX_1 copies are truncated to nine epochs; layer_a and ablation/AB hold
    the complete 200-epoch files. Always take the longest.
    """
    name = Path(scn["glassbox"]).parent.name
    candidates = [p for p in ARCHIVE.glob(f"**/{name}/glassbox.jsonl")]
    if not candidates:
        return []
    best, best_n = None, -1
    for c in candidates:
        with c.open() as f:
            n = sum(1 for _ in f)
        if n > best_n:
            best, best_n = c, n
    rows = []
    with best.open() as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


# ── shaping ──────────────────────────────────────────────────────────────────

def r(x, places=4):
    return None if x is None else round(float(x), places)


def mean(xs):
    return sum(xs) / len(xs) if xs else None


def sample_sd(xs):
    if not xs or len(xs) < 2:
        return None
    m = mean(xs)
    return (sum((x - m) ** 2 for x in xs) / (len(xs) - 1)) ** 0.5


def build_health(rows: list[dict], steps_per_epoch: int) -> list[dict]:
    """Per-epoch, per-node health. Five fields, the ones the panel renders."""
    out = []
    for row in rows:
        if row.get("channel") != "node_health":
            continue
        nodes = []
        for n in row["data"]["nodes"]:
            nodes.append({
                "id": int(n["node_id"]),
                "goodness": r(n.get("goodness"), 3),
                "state": n.get("lifecycle_state"),
                "weight_norm": r(n.get("weight_norm"), 2),
                "activation_norm": r(n.get("activation_norm"), 1),
            })
        out.append({"epoch": row["epoch"], "nodes": nodes})
    out.sort(key=lambda e: e["epoch"])
    return out


def build_corrections(doc: dict, steps_per_epoch: int) -> list[dict]:
    """Every correction event, verbatim. Never sampled — there are only 45–264."""
    events = (doc.get("diagnostics", {})
                 .get("correction_details", {})
                 .get("events", []) or [])
    out = []
    for e in events:
        step = e.get("step")
        diagnosis = e.get("diagnosis")
        out.append({
            "step": step,
            "epoch": (step // steps_per_epoch) if isinstance(step, int) else None,
            "node": e.get("node_id"),
            "diagnosis": diagnosis,
            "goodness_before": r(e.get("goodness_before")),
            "loss_before": r(e.get("loss_before")),
            "magnitude": r(e.get("correction_magnitude")),
            "ceiling": CEILINGS.get(diagnosis),
        })
    out.sort(key=lambda c: (c["step"] if c["step"] is not None else 0))
    return out


def build_record(scn, o_doc, rows, corrections, lesion_epoch, acc_o) -> dict:
    """Mirrors the GlassBox Flight Recorder structure.

    Fields the archive does not carry are omitted, never invented. An absent
    field is honest; a fabricated one ends the credibility position.
    """
    pulses = {x["epoch"]: x["data"] for x in rows if x.get("channel") == "training_pulse"}
    epochs_with = sum(1 for p in pulses.values() if (p.get("corrections") or 0) > 0)
    steps = [c["step"] for c in corrections if c["step"] is not None]
    epochs_c = [c["epoch"] for c in corrections if c["epoch"] is not None]

    peak = max(acc_o) if acc_o else None
    peak_epoch = acc_o.index(peak) if peak is not None else None

    record = {
        "generated_from": scn["glassbox"],
        "identity": {
            "nodes": None,
            "params": (o_doc.get("metadata") or {}).get("param_count"),
        },
        "mission": {
            "epochs": len(acc_o),
            "initial": r(acc_o[0]) if acc_o else None,
            "peak": r(peak),
            "peak_epoch": peak_epoch,
            "final": r(acc_o[-1]) if acc_o else None,
            "corrections": len(corrections),
            "epochs_with_corrections": epochs_with,
            "window": [min(epochs_c), max(epochs_c)] if epochs_c else None,
        },
        "entries": corrections,
    }

    topo = next((x for x in rows if x.get("channel") == "topology"), None)
    if topo:
        record["identity"]["nodes"] = topo["data"].get("total_nodes")

    if lesion_epoch is not None and len(acc_o) > lesion_epoch + 1:
        pre, post = acc_o[lesion_epoch], acc_o[lesion_epoch + 1]
        record["shock"] = {
            "epoch": lesion_epoch + 1,
            "pre": r(pre),
            "post": r(post),
            "severity_pp": r((pre - post) * 100, 2),
        }
        post_window = [c for c in corrections
                       if c["epoch"] is not None and c["epoch"] == lesion_epoch + 1]
        record["response"] = post_window[:12]
        if peak and acc_o[-1] is not None and pre > post:
            reclaimed = (acc_o[-1] - post) / (pre - post) * 100
            record["recovery"] = {
                "to": r(acc_o[-1]),
                "by_epoch": len(acc_o) - 1,
                "reclaimed_pct": round(reclaimed),
            }
    return record


def build(scn: dict) -> dict:
    o_path = find_run(scn, scn["ormas"])
    b_path = find_run(scn, scn["baseline"])
    o, b = load(o_path), load(b_path)
    cfg = o.get("config") or o.get("run_config") or {}
    rows = load_glassbox(scn)

    pulses = [x for x in rows if x.get("channel") == "training_pulse"]
    steps_per_epoch = None
    if pulses:
        steps_per_epoch = pulses[0]["data"].get("total_forward_passes")
    if not steps_per_epoch:
        steps_per_epoch = 391  # CIFAR-10, batch 128

    acc_o = [r(a) for a in o["metrics"]["accuracy_per_epoch"]]
    acc_b = [r(a) for a in b["metrics"]["accuracy_per_epoch"]]
    n = min(len(acc_o), len(acc_b))
    acc_o, acc_b = acc_o[:n], acc_b[:n]

    corrections = build_corrections(o, steps_per_epoch)
    health = build_health(rows, steps_per_epoch)

    lesion_epoch = cfg.get("lesion_epoch") if cfg.get("lesion_enabled") else None

    # The lesion lands after epoch `lesion_epoch` has trained and been evaluated.
    # harness.py uses (epoch + 1) * steps_per_epoch for the same boundary.
    event = None
    if lesion_epoch is not None:
        lesion_step = (lesion_epoch + 1) * steps_per_epoch
        detection = next((c for c in corrections if c["step"] >= lesion_step), None)
        event = {
            "type": cfg.get("lesion_type"),
            "label": scn["event_label"],
            "epoch": lesion_epoch + 1,
            "step": lesion_step,
            "step_confirmed": True,   # verified against src/benchmark/harness.py
            "nodes": cfg.get("lesion_node_ids") or [],
            "description": scn["event_description"],
        }
        if detection:
            event["detected_step"] = detection["step"]
            event["detected_lag_steps"] = detection["step"] - lesion_step
            same = [c for c in corrections if c["step"] == detection["step"]]
            event["detected_nodes"] = sorted({c["node"] for c in same})
            event["detected_diagnosis"] = detection["diagnosis"]

    topo = next((x for x in rows if x.get("channel") == "topology"), None)
    topology = {"nodes": []}
    if topo:
        topology["nodes"] = [{
            "id": int(nd["node_id"]),
            "in": nd.get("input_dim"),
            "out": nd.get("output_dim"),
            "params": nd.get("param_count"),
        } for nd in topo["data"].get("nodes", [])]

    def finals(ids):
        if not ids:
            return None
        out = []
        for rid in ids:
            try:
                d = load(find_run(scn, rid))
            except FileNotFoundError:
                continue
            out.append(r(d["metrics"]["final_test_accuracy"]))
        return out or None

    fo = finals(scn["seeds_ormas"])
    fb = finals(scn["seeds_baseline"])

    def corr_counts(ids):
        if not ids:
            return None
        out = []
        for rid in ids:
            try:
                d = load(find_run(scn, rid))
            except FileNotFoundError:
                continue
            out.append((d.get("diagnostics", {})
                         .get("correction_details", {})
                         .get("total_corrections")))
        return out or None

    summary = {
        "ormas_final": acc_o[-1],
        "ormas_peak": max(acc_o),
        "ormas_peak_epoch": acc_o.index(max(acc_o)),
        "baseline_final": acc_b[-1],
        "baseline_peak": max(acc_b),
        "gap_pp": r((acc_o[-1] - acc_b[-1]) * 100, 2),
        "corrections_total": len(corrections),
        "corrections_by_diagnosis": (o.get("diagnostics", {})
                                      .get("correction_details", {})
                                      .get("corrections_by_type")),
        "corrections_by_node": (o.get("diagnostics", {})
                                 .get("correction_details", {})
                                 .get("corrections_by_node")),
    }
    if event and "detected_step" in event:
        summary["detection_step"] = event["detected_step"]
        summary["detection_lag_steps"] = event["detected_lag_steps"]
    if fo:
        summary["seed_family"] = {
            "ormas_finals": fo,
            "ormas_mean": r(mean(fo)),
            "ormas_sd": r(sample_sd(fo)),
            "baseline_finals": fb,
            "baseline_mean": r(mean(fb)) if fb else None,
            "corrections": corr_counts(scn["seeds_ormas"]),
        }

    return {
        "schema": 1,
        "key": scn["key"],
        "title": scn["title"],
        "subtitle": scn["subtitle"],
        "conditions": {
            "dataset": "CIFAR-100" if cfg.get("dataset") == "cifar100" else "CIFAR-10",
            "seed": cfg.get("seed"),
            "epochs": len(acc_o),
            "steps_per_epoch": steps_per_epoch,
            "architecture": f"{cfg.get('mode', 'cnn').upper()}, "
                            f"{len(topology['nodes'])} instrumented nodes",
            "params_ormas": (o.get("metadata") or {}).get("param_count"),
            "params_baseline": (b.get("metadata") or {}).get("param_count"),
            "hardware": "NVIDIA RTX 3090",
            "run_id_ormas": scn["ormas"],
            "run_id_baseline": scn["baseline"],
            "archive_index": scn["archive_index"],
        },
        "topology": topology,
        "event": event,
        "series": {
            "ormas": {
                "accuracy": acc_o,
                "corrections": o["metrics"].get("corrections_per_epoch", [])[:n],
            },
            # null, not [] — the component renders null as "no such quantity is
            # computed by this architecture". An empty array reads as loading.
            "baseline": {"accuracy": acc_b, "corrections": None},
        },
        "health": health,
        "corrections": corrections,
        "summary": summary,
        "record": build_record(scn, o, rows, corrections, lesion_epoch, acc_o),
        "caveats": [
            "All results on CIFAR-10 or CIFAR-100. No clinical, financial or "
            "defence data has been used.",
            "Failures are detected and repaired during training, where gradients "
            "and labels exist.",
        ],
    }


def main() -> int:
    if not ARCHIVE.exists():
        print(f"archive not found: {ARCHIVE}", file=sys.stderr)
        return 1
    OUT.mkdir(parents=True, exist_ok=True)
    for scn in SCENARIOS:
        bundle = build(scn)
        path = OUT / f"{scn['key']}.json"
        with path.open("w") as f:
            json.dump(bundle, f, separators=(",", ":"))
        kb = path.stat().st_size / 1024
        ev = bundle.get("event") or {}
        lag = ev.get("detected_lag_steps")
        print(f"  {scn['key']:22s} {kb:7.1f} KB  "
              f"epochs={len(bundle['series']['ormas']['accuracy'])} "
              f"health={len(bundle['health'])} "
              f"corrections={len(bundle['corrections'])}"
              + (f"  detection=+{lag} steps" if lag is not None else ""))
    print(f"\nwrote {len(SCENARIOS)} bundles to {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
