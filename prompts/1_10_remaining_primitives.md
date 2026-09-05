# 1.10 — Remaining primitives

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

## Read these first, in this order, in this session

1. `website/design/12_DESIGN_SYSTEM.md`
2. `website/ui_ux/03_SECTORS_UI.md`
3. `website/ui_ux/09_FAQ_UI.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- `Eyebrow.astro` — mono 11px, 0.15em tracking, `--amber-mid`, uppercase.
- `SectionDivider.astro` — rule · centred label · rule.
- `ComparisonMatrix.astro` — two columns, left `--text-secondary` at 0.6 opacity, right `--text-primary` with one amber keyword.
- `LadderSchematic.astro` — Unicode Type 1 schematic rendered from `data/solutions.ts`.
- `Accordion.astro` — **markup and styles only.** Behaviour is Block 4.

## Do not

- Do not add JavaScript to `Accordion.astro`.
- Do not hardcode the ladder contents — it maps over the data file.

## Exit condition

All five render from real data. **`Accordion` renders every panel open with no JS** — verified in a browser with scripts disabled.

**Then commit.** One commit, message `1.10 remaining primitives`. Nothing else in it.

## Report back in exactly this format

```
TASK        1.10 — Remaining primitives
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        2.1
```

**Stop here. Do not begin 2.1.**
