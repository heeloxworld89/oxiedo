# 5.1 — Accessibility verification

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

**Law 6 — accessibility is a build gate.** Keyboard operable, visible focus ring, real `<label>`
on every field, text on every status badge. Verified this session, not deferred.

## Read these first, in this order, in this session

1. `Oxiedo Website Codebase/instructions/BLOCK_5_LAUNCH.md`
2. `website/design/12_DESIGN_SYSTEM.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- Traverse **all twelve routes by keyboard alone**, start to finish.
- Verify: focus ring visible at every stop · one h1 per route, no skipped levels · header/nav/main/footer landmarks · every field a real `<label>` · every badge carries text · `prefers-reduced-motion` honoured · a `Skip to content` link as the first focusable element.
- Re-verify contrast against `tokens.css`, not against `design/12`.

## Do not

- **An automated checker is a starting point, not the test.** Traverse each route yourself.
- Do not defer any failure to launch. Fix it in the block it belongs to.

## Exit condition

All twelve routes pass every line. Report pass/fail per route, per criterion.

**Then commit.** One commit, message `5.1 accessibility verification`. Nothing else in it.

## Report back in exactly this format

```
TASK        5.1 — Accessibility verification
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        5.2
```

**Stop here. Do not begin 5.2.**
