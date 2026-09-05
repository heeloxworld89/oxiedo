# 3.7 — Data

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

1. `website/design/14_DATA.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- Straight render of `design/14_DATA.md` — short version, then the long version for procurement.
- **Build the route. Do not link it** from the nav or from `/contact`.

## Do not

- Do not add the link anywhere. `design/14` states a qualified solicitor must review it first, and `/contact` already points at it in the copy.
- Do not soften or summarise the retention and deletion commitments.

## Exit condition

Route renders at `/data`. **Nav and contact links to it are absent or commented out, deliberately** — state that you did this and why.

**Then commit.** One commit, message `3.7 data`. Nothing else in it.

## Report back in exactly this format

```
TASK        3.7 — Data
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        3.8
```

**Stop here. Do not begin 3.8.**
