# 3.3 — About

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

## Read these first, in this order, in this session

1. `website/design/07_ABOUT.md`
2. `website/ui_ux/07_ABOUT_UI.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- Founder block: the name set typographically inside a 1px `--border-strong` box. No avatar placeholder.
- Founding story: the four `FAIL:` lines in a `TelemetryBlock`, the word `FAIL` in `--chart-warning`.
- Six decisions as an indexed log — `01`–`06` in mono `--amber-mid`, rationale to their right.
- Entity line carries `[Company number TBD]` until registered.

## Do not

- **Do not style the founding story as a warning panel.** It is a credibility asset, not a disclosure.
- Do not use a grey avatar circle — it reads as an unfinished page.

## Exit condition

Renders. The datasets ask is last and longest in §6. Entity placeholder visible, not hidden.

**Then commit.** One commit, message `3.3 about`. Nothing else in it.

## Report back in exactly this format

```
TASK        3.3 — About
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        3.4
```

**Stop here. Do not begin 3.4.**
