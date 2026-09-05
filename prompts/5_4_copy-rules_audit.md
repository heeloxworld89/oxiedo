# 5.4 — Copy-rules audit

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

**Law 7 — a claim must trace to a source.** Check every number against
`website/design/13_COPY_RULES.md §Rules for Numbers`. Gated copy stays gated — none has unlocked.

## Read these first, in this order, in this session

1. `website/design/13_COPY_RULES.md`
2. `Commercial Plan/20 — WHAT IS NOT CLAIMED.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- Audit the **built output in `dist/`**, not the source files.
- 1 — every claim against `design/13` PERMITTED. 2 — **grep for every GATED phrase**; none has unlocked. 3 — every number against `§Rules for Numbers`. 4 — CIFAR qualifier wherever a result is quoted. 5 — every price carries *Designed; not yet tested against real customers*. 6 — nothing from `Commercial Plan/20` NEVER-PERMITTED.

## Do not

- **Item 2 has already failed once** — the lead-time claim reached `/solutions` and was removed in review. **Grep for the gated phrases; do not read for them.**

## Exit condition

All six pass. **Record the grep output** for the gated phrases.

**Then commit.** One commit, message `5.4 copy-rules audit`. Nothing else in it.

## Report back in exactly this format

```
TASK        5.4 — Copy-rules audit
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        5.5
```

**Stop here. Do not begin 5.5.**
