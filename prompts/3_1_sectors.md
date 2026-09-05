# 3.1 — Sectors

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

1. `website/design/03_SECTORS.md`
2. `website/ui_ux/03_SECTORS_UI.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- Tab row across the top — five labels, mono 11px tracked. Active takes a 2px `--amber-bright` bottom rule.
- **Tabs are real anchors.** With JS off all five sections render stacked and the tabs jump to them.
- `ComparisonMatrix` per sector, using that sector's own noun — *site* / *region* / *batch* / *corpus*.
- Buyer cards with the **title at the top**, quote dominant beneath, figure in mono.

## Do not

- No WebGL or SVG radar chart. Rejected in `ui_ux/03` — a pentagon of five nodes tells the reader nothing a tab row does not.
- Do not put the buyer's job title at the foot of the card.

## Exit condition

Five sectors render. JS off: all five visible and reachable. Market figures labelled EXTERNAL per `design/13`.

**Then commit.** One commit, message `3.1 sectors`. Nothing else in it.

## Report back in exactly this format

```
TASK        3.1 — Sectors
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        3.2
```

**Stop here. Do not begin 3.2.**
