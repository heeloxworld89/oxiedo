# 0.6 — The no-JS baseline

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

**Law 8 — stop at the exit condition.** Do not continue into the next task because it looks small.

## Read these first, in this order, in this session

1. `Oxiedo Website Codebase/instructions/00_ENGINEERING_LAWS.md`
2. `website/design/18_ANIMATION_AND_INTERACTION.md`
3. `website/ui_ux/00_SYSTEM_UX_MANIFESTO.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- `src/styles/motion.css`: the reveal system **defaulting to visible**.
- `.reveal { opacity: 1; transform: none; }` — no JS required.
- `.js .reveal { opacity: 0; transform: translateY(20px); }` with transitions from the tokens.
- `.js .reveal.visible { opacity: 1; transform: none; }`
- In `src/layouts/Base.astro`, a single inline script in `<head>`, **before any stylesheet**, adding the `js` class to `<html>`.
- The full `prefers-reduced-motion: reduce` block from `design/18`.

## Do not

- Do not set `.reveal { opacity: 0 }` unconditionally. That is the exact bug this task exists to prevent — it renders every page blank when scripts are blocked.
- Do not add the observer yet. That is Block 4.

## Exit condition

**This is the block's gate.** A test page with three `.reveal` sections is fully readable with JavaScript disabled, and shows no flash of hidden content with JavaScript enabled. Demonstrate both, in a browser.

**Then commit.** One commit, message `0.6 the no-js baseline`. Nothing else in it.

## Report back in exactly this format

```
TASK        0.6 — The no-JS baseline
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        1.1
```

**Stop here. Do not begin 1.1.**
