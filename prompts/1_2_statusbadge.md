# 1.2 — StatusBadge

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

1. `website/design/12_DESIGN_SYSTEM.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- `StatusBadge.astro` with exactly three variants: `available` · `inbuild` · `upcoming`.
- Typed prop — passing an invalid status must be a **build error**, not a runtime surprise.
- Each renders its glyph (`●` `◐` `○`) **and its text**.

## Do not

- Do not render colour or glyph alone. Law 6 — a badge must be legible to someone who cannot distinguish the colours.
- Do not add a fourth variant. `--status-live` exists in the tokens but is reserved and unused.

## Exit condition

All three render. Passing an invalid status fails `npm run build`. Demonstrate the build failure.

**Then commit.** One commit, message `1.2 statusbadge`. Nothing else in it.

## Report back in exactly this format

```
TASK        1.2 — StatusBadge
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        1.3
```

**Stop here. Do not begin 1.3.**
