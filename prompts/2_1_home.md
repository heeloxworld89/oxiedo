# 2.1 — Home

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

**Law 5 — motion reveals information or it does not exist.** Before adding a transition, answer:
what does removing it hide? If nothing, it does not ship.

**Law 7 — a claim must trace to a source.** Check every number against
`website/design/13_COPY_RULES.md §Rules for Numbers`. Gated copy stays gated — none has unlocked.

## Read these first, in this order, in this session

1. `website/design/01_HOME.md`
2. `website/ui_ux/01_HOME_UI.md`
3. `website/design/13_COPY_RULES.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- Build `/` — eight sections per `ui_ux/01`.
- **Hero subhead is two lines, not four.** The current copy restates the headline and pushes the CTAs below the fold at 1440×900. If cutting needs new wording, that is a content gap — stop and ask.
- **Second CTA is `Read the paper`**, not a second booking ask. Move the Charter Partnership CTA to §6.
- **Hero right pane is the real flight-recorder excerpt** in a `TelemetryBlock` — not a visualisation. On mobile it moves below the CTAs and truncates to four lines.
- **Fourth bento cell uses `PullStat variant="warning"`** for `−1.0 pp known failure`.
- **Five operations row is 3 + 2**, not five across.
- **Sector cards use a different status treatment from solution badges** — a market is not bookable.

## Do not

- Do not put a WebGL canvas, particle system, or generated network diagram in the hero.
- Do not render the warning stat in amber.
- Do not let the hero code block scroll horizontally at 390px.

## Exit condition

Every figure traced to `design/13 §Rules for Numbers`. CIFAR qualifier present. **Hero fits above the fold at 1440×900 with the CTAs visible.** No horizontal overflow at 320px. JS disabled: complete.

**Then commit.** One commit, message `2.1 home`. Nothing else in it.

## Report back in exactly this format

```
TASK        2.1 — Home
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        2.2
```

**Stop here. Do not begin 2.2.**
