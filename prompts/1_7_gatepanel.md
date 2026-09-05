# 1.7 — GatePanel

> Paste everything below into a fresh session. Nothing above this line.

---

You are building the Oxiedo website. Working directory: `/Users/raad/Desktop/oxido`.

**Context in three lines.** Oxiedo sells ORMAS — a neural network architecture that keeps a
bounded, logged record of every change it makes to itself. The website is 12 static routes. All
copy, colour, typography and layout are already written and verified in `website/design/` and
`website/ui_ux/`. **You are assembling, not authoring.**

**The build plan lives in `Oxiedo Website Codebase/instructions/`.** Code goes in
`Oxiedo Website Codebase/src/`.

## The laws that apply to this task

**Law 1 — the content is finished.** Every sentence exists in `website/design/`. If you need
a sentence that is not there, that is a content gap: stop and say so. Do not invent copy.

**Law 2 — nothing hardcoded that has a token.** No hex, font stack, duration or spacing figure
appears anywhere except `src/styles/tokens.css`. Use `var(--amber-bright)`, never `#F5A623`.

**Law 7 — a claim must trace to a source.** Check every number against
`website/design/13_COPY_RULES.md §Rules for Numbers`. Gated copy stays gated — none has unlocked.

## Read these first, in this order, in this session

1. `website/ui_ux/02_SOLUTIONS_UI.md`
2. `Commercial Plan/19 — SEQUENCING AND GATES.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- `GatePanel.astro` with four fields: gate name, cost, status, **and what happens if it fails**.
- `--bg-base` ground, 1px `--border-muted`, label in `--amber-mid`.
- All four values come from props, sourced from `data/solutions.ts`.

## Do not

- **No progress bar, no percentage, no lock icon.** A progress indicator on an experiment that has not started is fabricated telemetry on a site about honest telemetry.
- Do not omit the failure branch. Stating it is the point of the component.

## Exit condition

Renders with real values for a gated solution. **State why the failure branch is included** — nobody else publishes what happens if their thing does not work.

**Then commit.** One commit, message `1.7 gatepanel`. Nothing else in it.

## Report back in exactly this format

```
TASK        1.7 — GatePanel
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        1.8
```

**Stop here. Do not begin 1.8.**
