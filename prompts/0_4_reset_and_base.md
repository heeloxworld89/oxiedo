# 0.4 — Reset and base

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

**Law 6 — accessibility is a build gate.** Keyboard operable, visible focus ring, real `<label>`
on every field, text on every status badge. Verified this session, not deferred.

## Read these first, in this order, in this session

1. `Oxiedo Website Codebase/instructions/02_DESIGN_CONTRACT.md`
2. `website/design/12_DESIGN_SYSTEM.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- `src/styles/reset.css`: `box-sizing: border-box`, margin zeroing, `img { max-width: 100% }`, `color-scheme: dark`.
- `src/styles/base.css`: element defaults binding the type scale from `tokens.css`. `body` sets an explicit background from `var(--bg-base)` — never transparent.
- `:focus-visible` ring: 2px `--amber-bright`, 2px offset, on every interactive element.
- A `.tabular` utility applying `font-variant-numeric: tabular-nums`, for every column of figures.

## Do not

- Do not set a light-mode palette or a `prefers-color-scheme` block. The site is dark-only by decision — `design/12` states the rationale.
- Do not use `--text-disabled` for text a reader is meant to read. It fails contrast by design.

## Exit condition

A test page with one h1, one h2, one paragraph and one code block renders correctly at 320px, 768px and 1440px. Tab moves through links with a visible amber ring at every stop.

**Then commit.** One commit, message `0.4 reset and base`. Nothing else in it.

## Report back in exactly this format

```
TASK        0.4 — Reset and base
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        0.5
```

**Stop here. Do not begin 0.5.**
