# 5.5 — Pre-launch checklist

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

## Read these first, in this order, in this session

1. `website/design/12_DESIGN_SYSTEM.md`
2. `Oxiedo Website Codebase/instructions/BLOCK_5_LAUNCH.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- Resolve or explicitly defer each of the five items in `design/12 §Pre-Launch Checklist`:
- **AAAI disclosure** — does their policy permit naming the venue during review? If not, remove it from every page.
- **Company number** — `[TBD]` in five files, and `/data` makes commitments on behalf of an unregistered entity.
- **`/data` legal review** — a solicitor reads `design/14` before the route is linked.
- **Repository links** — stay disabled until the code is public post-review.
- **Press placeholders** — `/press` must not render publicly while any `[ TBD ]` remains.

## Do not

- Do not resolve any of these yourself. They are decisions for the founder, not build tasks.
- Do not silently skip one. **A deferred item is acceptable; an unnoticed one is not.**

## Exit condition

Each of the five resolved or explicitly deferred **with a recorded reason**.

**Then commit.** One commit, message `5.5 pre-launch checklist`. Nothing else in it.

## Report back in exactly this format

```
TASK        5.5 — Pre-launch checklist
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        5.6
```

**Stop here. Do not begin 5.6.**
