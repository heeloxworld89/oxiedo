# 3.4 — Invest

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

**Law 3 — every page renders completely with JavaScript disabled.** Content defaults to visible.
JS adds a `js` class to `<html>` and only then may anything hide. Test by disabling JS in a
browser, not by reading CSS.

**Law 7 — a claim must trace to a source.** Check every number against
`website/design/13_COPY_RULES.md §Rules for Numbers`. Gated copy stays gated — none has unlocked.

## Read these first, in this order, in this session

1. `website/design/08_INVEST.md`
2. `website/ui_ux/08_INVEST_UI.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- Metric bento of four, using only figures that exist: `+70.3 pp` · `383 experiments` · `16,316 lines` · `7 solutions, 1 available`.
- Ladder with price bands and gating experiments per row.
- **'What is open' gets more visual weight than the metric bento above it.**

## Do not

- **No TAM figure.** `design/13` treats analyst market sizes as soft and every commercial case is bottom-up. A TAM here contradicts the corpus's own methodology.
- No projection sparklines — there is no revenue history and a drawn curve implies data that does not exist.
- No progress bar or allocation-window indicator. A simulated raise meter is fabricated data on a page arguing this company does not fabricate data.

## Exit condition

No TAM, no simulated indicators. The disclosure panel is visually dominant over the metrics.

**Then commit.** One commit, message `3.4 invest`. Nothing else in it.

## Report back in exactly this format

```
TASK        3.4 — Invest
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        3.5
```

**Stop here. Do not begin 3.5.**
