# 1.8 — Button and links

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

- `Button.astro`: primary (amber fill), secondary (ghost border), tertiary (text with trailing arrow). All 2px radius, JetBrains Mono 600 14px.
- Every variant: default, hover, focus, disabled.
- Disabled must be visibly disabled **without relying on colour alone**.

## Do not

- Do not use a pill radius. 2px, everywhere.
- Do not remove the focus ring on any variant.

## Exit condition

All three variants, all four states, keyboard-operable, focus ring visible on each.

**Then commit.** One commit, message `1.8 button and links`. Nothing else in it.

## Report back in exactly this format

```
TASK        1.8 — Button and links
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        1.9
```

**Stop here. Do not begin 1.9.**
