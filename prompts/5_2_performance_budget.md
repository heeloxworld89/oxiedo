# 5.2 — Performance budget

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

- Measure and record: HTML < 50KB per route · CSS < 40KB total · JS < 15KB total · fonts 6 files, 2 preloaded, < 200KB combined · **zero third-party requests** · LCP < 1.5s throttled · CLS < 0.05.

## Do not

- Do not add a CDN font, script or stylesheet to hit a number. One would break both `01_STACK.md` and `design/14_DATA.md`.

## Exit condition

Every figure met, or a stated reason recorded. **Zero third-party requests, verified in the network tab.**

**Then commit.** One commit, message `5.2 performance budget`. Nothing else in it.

## Report back in exactly this format

```
TASK        5.2 — Performance budget
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        5.3
```

**Stop here. Do not begin 5.3.**
