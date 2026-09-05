# 1.5 — TelemetryBlock

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

**Law 2 — nothing hardcoded that has a token.** No hex, font stack, duration or spacing figure
appears anywhere except `src/styles/tokens.css`. Use `var(--amber-bright)`, never `#F5A623`.

## Read these first, in this order, in this session

1. `website/design/12_DESIGN_SYSTEM.md`
2. `website/ui_ux/02_SOLUTIONS_UI.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- `TelemetryBlock.astro`: `#060606` ground, 1px `--border-subtle`, JetBrains Mono 13px, `--lh-mono`, `overflow-x: auto`.
- Optional right-aligned caption label. Optional amber emphasis on a single term.

## Do not

- **No syntax-highlighting palette.** A second colour system on top of the identity is how palettes drift.
- Do not let the block force horizontal page scroll — it scrolls inside its own container.

## Exit condition

The homepage flight-recorder excerpt (`ui_ux/01 §1`) renders inside it **without horizontal overflow at 390px**.

**Then commit.** One commit, message `1.5 telemetryblock`. Nothing else in it.

## Report back in exactly this format

```
TASK        1.5 — TelemetryBlock
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        1.6
```

**Stop here. Do not begin 1.6.**
