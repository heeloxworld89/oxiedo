# 4.2 — nav.ts

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

**Law 3 — every page renders completely with JavaScript disabled.** Content defaults to visible.
JS adds a `js` class to `<html>` and only then may anything hide. Test by disabling JS in a
browser, not by reading CSS.

**Law 6 — accessibility is a build gate.** Keyboard operable, visible focus ring, real `<label>`
on every field, text on every status badge. Verified this session, not deferred.

## Read these first, in this order, in this session

1. `website/design/12_DESIGN_SYSTEM.md`
2. `website/ui_ux/00_SYSTEM_UX_MANIFESTO.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- `src/scripts/nav.ts` — nav background transitions to `--bg-overlay` with a bottom border past 40px scroll.
- Mobile hamburger toggles the full-screen overlay.
- **The overlay traps focus and closes on Escape** and on link activation.

## Do not

- Do not let focus leak to the page behind an open overlay — that fails audit.
- Do not add a scroll-direction hide/show behaviour. Not in the spec.

## Exit condition

Scroll state works. Mobile overlay traps focus, closes on Escape and on link click. JS off: nav links visible and working.

**Then commit.** One commit, message `4.2 nav.ts`. Nothing else in it.

## Report back in exactly this format

```
TASK        4.2 — nav.ts
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        4.3
```

**Stop here. Do not begin 4.3.**
