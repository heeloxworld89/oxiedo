# 1.3 — PullStat

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

**Law 7 — a claim must trace to a source.** Check every number against
`website/design/13_COPY_RULES.md §Rules for Numbers`. Gated copy stays gated — none has unlocked.

## Read these first, in this order, in this session

1. `website/design/12_DESIGN_SYSTEM.md`
2. `website/ui_ux/01_HOME_UI.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- `PullStat.astro`: figure in JetBrains Mono Bold, `--amber-bright`, 80px desktop / 56px mobile. Caption beneath in Plus Jakarta Sans, `--text-secondary`, max 240px.
- **A `variant="warning"` is required** — it renders the figure in `--chart-warning` instead of amber.
- Figures use the `.tabular` class.

## Do not

- Do not make `warning` a colour override at the call site. It is a variant of the component.

## Exit condition

Both variants render. Three stats in a row have vertically aligned figures. **State why the warning variant exists:** the homepage's `−1.0 pp known failure` cell must not read as a fourth win.

**Then commit.** One commit, message `1.3 pullstat`. Nothing else in it.

## Report back in exactly this format

```
TASK        1.3 — PullStat
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        1.4
```

**Stop here. Do not begin 1.4.**
