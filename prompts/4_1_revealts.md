# 4.1 — reveal.ts

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

**Law 5 — motion reveals information or it does not exist.** Before adding a transition, answer:
what does removing it hide? If nothing, it does not ship.

## Read these first, in this order, in this session

1. `website/design/18_ANIMATION_AND_INTERACTION.md`
2. `Oxiedo Website Codebase/instructions/BLOCK_4_INTERACTION.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- `src/scripts/reveal.ts` — IntersectionObserver adds `.visible` to `.reveal` elements on entry, then unobserves. Fires once.
- Under `prefers-reduced-motion: reduce`, everything is visible immediately and the observer never runs.
- Under 100 lines.

## Do not

- **Before writing anything: load a page with JS disabled and confirm it is already complete.** If it is not, the bug is in Block 2 or 3 — go fix it there. Do not fix a broken page by adding JavaScript.
- Do not animate anything but `opacity` and `transform`.

## Exit condition

Sections reveal on scroll. Reduced motion: instant. JS off: visible. **All three verified in a browser.**

**Then commit.** One commit, message `4.1 reveal.ts`. Nothing else in it.

## Report back in exactly this format

```
TASK        4.1 — reveal.ts
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        4.2
```

**Stop here. Do not begin 4.2.**
