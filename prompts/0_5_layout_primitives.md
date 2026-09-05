# 0.5 — Layout primitives

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

**Law 8 — stop at the exit condition.** Do not continue into the next task because it looks small.

## Read these first, in this order, in this session

1. `website/design/12_DESIGN_SYSTEM.md`
2. `website/ui_ux/00_SYSTEM_UX_MANIFESTO.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- `src/styles/layout.css`: the 12-column grid, container max-widths (prose 65ch, standard 1100px, wide 1280px), section rhythm (80px desktop / 56px tablet / 40px mobile), and the four breakpoints (640 / 1024 / 1280 / 1536).
- Grid gap and spacing values come from the tokens only.

## Do not

- Do not add utility classes beyond grid, container and section. This is not a framework.
- Do not allow horizontal overflow at any width.

## Exit condition

A three-cell grid holds its columns at desktop, collapses to two at tablet, one at mobile. **No horizontal overflow from 320px to 2560px — test 320px explicitly**, it is the width that breaks code blocks.

**Then commit.** One commit, message `0.5 layout primitives`. Nothing else in it.

## Report back in exactly this format

```
TASK        0.5 — Layout primitives
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        0.6
```

**Stop here. Do not begin 0.6.**
