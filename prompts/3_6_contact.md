# 3.6 — Contact

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

**Law 1 — the content is finished.** Every sentence exists in `website/design/`. If you need
a sentence that is not there, that is a content gap: stop and say so. Do not invent copy.

**Law 2 — nothing hardcoded that has a token.** No hex, font stack, duration or spacing figure
appears anywhere except `src/styles/tokens.css`. Use `var(--amber-bright)`, never `#F5A623`.

**Law 3 — every page renders completely with JavaScript disabled.** Content defaults to visible.
JS adds a `js` class to `<html>` and only then may anything hide. Test by disabling JS in a
browser, not by reading CSS.

**Law 6 — accessibility is a build gate.** Keyboard operable, visible focus ring, real `<label>`
on every field, text on every status badge. Verified this session, not deferred.

## Read these first, in this order, in this session

1. `website/design/10_CONTACT.md`
2. `website/ui_ux/10_CONTACT_UI.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- Four intents: `BOOK` · `PRE-BOOK` · `INVEST` · `OTHER`. **All four stay visible and selectable.**
- **Commitments block renders above the fields**, not below.
- All six `FormField` states present. Markup and states only — submission is Block 4.

## Do not

- Do not slide the unselected intents away — it strands a reader who picked wrong.
- Do not link `/data` yet. The solicitor review in `design/14` has not happened.
- Do not wire the form action. Block 4.

## Exit condition

All four forms render stacked with JS off. Every field has a real label. Commitments visible before the first input.

**Then commit.** One commit, message `3.6 contact`. Nothing else in it.

## Report back in exactly this format

```
TASK        3.6 — Contact
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        3.7
```

**Stop here. Do not begin 3.7.**
