# 1.6 — DisclosurePanel

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

## Read these first, in this order, in this session

1. `website/design/12_DESIGN_SYSTEM.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- `DisclosurePanel.astro`: `--bg-surface`, 3px `--amber-mid` left edge, label in `--amber-mid` uppercase mono, body at 65ch.

## Do not

- Do not use `box-shadow: inset`. It was proposed and rejected — on a dark ground it reads as a rendering artifact.
- Maximum two per page. Note this in the component's comment.

## Exit condition

Renders. The 65ch measure holds inside it at all breakpoints.

**Then commit.** One commit, message `1.6 disclosurepanel`. Nothing else in it.

## Report back in exactly this format

```
TASK        1.6 — DisclosurePanel
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        1.7
```

**Stop here. Do not begin 1.7.**
