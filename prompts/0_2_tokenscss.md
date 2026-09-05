# 0.2 — tokens.css

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

- **First:** rename `--status-bookable` to `--status-available` **in `website/design/12_DESIGN_SYSTEM.md`**. The site's vocabulary is `AVAILABLE NOW`; the token name is stale. Change the source, then transcribe.
- Transcribe the complete token set from `design/12` into `src/styles/tokens.css` — colour, type scale, line heights, spacing, motion durations, easing curves.
- The file contains custom properties only. No selectors, no resets, no utility classes.

## Do not

- Do not add a token that `design/12` does not define.
- Do not rename, tidy, or 'improve' a value during transcription. If a value looks wrong, report it — do not fix it in `tokens.css`.
- Do not put anything but `:root { }` in this file.

## Exit condition

Diff `tokens.css` against `design/12` **in both directions** and state that both hold: every value in `design/12` appears in `tokens.css`, and every value in `tokens.css` appears in `design/12`.

**Then commit.** One commit, message `0.2 tokens.css`. Nothing else in it.

## Report back in exactly this format

```
TASK        0.2 — tokens.css
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        0.3
```

**Stop here. Do not begin 0.3.**
