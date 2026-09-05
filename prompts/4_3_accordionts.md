# 4.3 — accordion.ts

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

**Law 6 — accessibility is a build gate.** Keyboard operable, visible focus ring, real `<label>`
on every field, text on every status badge. Verified this session, not deferred.

## Read these first, in this order, in this session

1. `website/ui_ux/09_FAQ_UI.md`
2. `website/design/18_ANIMATION_AND_INTERACTION.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- `src/scripts/accordion.ts` — progressive enhancement over Block 1.10's markup, which already renders every panel open.
- On load with `.js`, collapse all except a panel targeted by the URL hash.
- Click toggles `height: 0 → auto` over `--duration-normal`. Enter and Space both activate.
- **A deep link to `/faq#some-question` opens that panel and scrolls to it.**

## Do not

- **No typing effect.** It delays reading for decoration.
- Do not use `display: none` — it breaks the height transition and hides content from in-page search.

## Exit condition

Toggle works by mouse and keyboard. Hash-targeted panel opens on load. Reduced motion: instant. **JS off: all panels open.**

**Then commit.** One commit, message `4.3 accordion.ts`. Nothing else in it.

## Report back in exactly this format

```
TASK        4.3 — accordion.ts
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        4.4
```

**Stop here. Do not begin 4.4.**
