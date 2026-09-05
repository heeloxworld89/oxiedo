# 1.4 — BentoGrid and BentoCell

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

**Law 5 — motion reveals information or it does not exist.** Before adding a transition, answer:
what does removing it hide? If nothing, it does not ship.

## Read these first, in this order, in this session

1. `website/ui_ux/00_SYSTEM_UX_MANIFESTO.md`
2. `website/design/12_DESIGN_SYSTEM.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- `BentoGrid.astro` (12-column) and `BentoCell.astro` (takes a span prop).
- Cell: `--bg-surface`, 1px `--border-subtle`, 2px radius, 24px padding.
- Hover: border to `--border-strong` over `--duration-fast`. Colour change only.

## Do not

- **No lift, no scale, no shadow, no `backdrop-filter`.** `design/12` forbids shadows entirely and `ui_ux/00` rejects frosted glass.
- Do not size a cell to fill a gap — cell size communicates importance.

## Exit condition

A 2×2 + 1×1 + 1×1 + 2×1 arrangement holds at desktop and stacks cleanly at mobile with no overflow.

**Then commit.** One commit, message `1.4 bentogrid and bentocell`. Nothing else in it.

## Report back in exactly this format

```
TASK        1.4 — BentoGrid and BentoCell
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        1.5
```

**Stop here. Do not begin 1.5.**
