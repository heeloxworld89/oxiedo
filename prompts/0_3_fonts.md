# 0.3 — Fonts

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

1. `Oxiedo Website Codebase/instructions/02_DESIGN_CONTRACT.md`
2. `website/design/12_DESIGN_SYSTEM.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- Place exactly six self-hosted `.woff2` files in `public/fonts/`: `Fraunces-Variable`, `PlusJakartaSans-Regular`, `PlusJakartaSans-SemiBold`, `JetBrainsMono-Regular`, `JetBrainsMono-Bold`, `JetBrainsMono-Italic`.
- Write `@font-face` for each in `src/styles/base.css` with `font-display: swap` and a real fallback stack per face.
- Preload **only** `Fraunces-Variable` and `PlusJakartaSans-Regular` — the other four are below the fold on every route.
- If the six files exceed 200KB combined, subset to Latin.

## Do not

- Do not load anything from Google Fonts or any CDN. `01_STACK.md` forbids it and `design/14_DATA.md` depends on it being true.
- Do not add a seventh file or a seventh weight.

## Exit condition

All three faces render with the network throttled. No layout shift on load. **Zero external font requests — verified in the browser network tab, not assumed.**

**Then commit.** One commit, message `0.3 fonts`. Nothing else in it.

## Report back in exactly this format

```
TASK        0.3 — Fonts
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        0.4
```

**Stop here. Do not begin 0.4.**
