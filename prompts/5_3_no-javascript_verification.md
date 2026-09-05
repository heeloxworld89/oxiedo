# 5.3 — No-JavaScript verification

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

## Read these first, in this order, in this session

1. `Oxiedo Website Codebase/instructions/BLOCK_5_LAUNCH.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- **Disable JavaScript in the browser. Load all twelve routes. Read them.**
- Verify: every route renders complete content · `/solutions` is a usable anchor list · `/faq` shows every answer · `/contact` shows all four labelled forms · nav links work · no element invisible, clipped or empty.

## Do not

- **Do not test by reading CSS.** This is the buyer's actual environment — hospital, bank and defence networks block scripts.

## Exit condition

All twelve readable and navigable with scripts off. **Any failure blocks launch.** Report per route.

**Then commit.** One commit, message `5.3 no-javascript verification`. Nothing else in it.

## Report back in exactly this format

```
TASK        5.3 — No-JavaScript verification
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        5.4
```

**Stop here. Do not begin 5.4.**
