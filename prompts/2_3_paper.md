# 2.3 — Paper

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

**Law 7 — a claim must trace to a source.** Check every number against
`website/design/13_COPY_RULES.md §Rules for Numbers`. Gated copy stays gated — none has unlocked.

## Read these first, in this order, in this session

1. `website/design/05_PAPER.md`
2. `website/ui_ux/05_PAPER_UI.md`
3. `ormas_preprint/main.tex`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- Build `/paper`: header, abstract, six results, mechanism schematic, what-was-not-tested, evidence band, citation.
- **The abstract is verbatim.** It is already correct in `design/05`. Copy it character for character and **diff it against `ormas_preprint/main.tex:57`** before claiming the exit.
- Status line reads `Manuscript under review`. Name the venue **only if** the AAAI check in `design/12 §Pre-Launch Checklist` has cleared — it has not, so omit it.
- Six results as a ladder. Each row: condition, outcome, baseline, gap, and its source citation in `--text-muted`.
- What-was-not-tested as a `DisclosurePanel`, visible, including the **1.0 pp adversarial deficit**.
- KaTeX for equations, inside `#060606` blocks with 32px padding.

## Do not

- **A fabricated abstract shipped here once and was caught in review.** Diff it; do not eyeball it.
- Do not render live links to the GitHub repository or arXiv — the code is private until after review. Plain text or omit.
- Do not build a scatter plot of the 383 experiments. Rejected in `ui_ux/05` — weeks of work, no extractable claim.

## Exit condition

Abstract diffed against source, character-identical — show the diff. Every result carries its citation. No live link to a private repository. Equations readable at 200% zoom.

**Then commit.** One commit, message `2.3 paper`. Nothing else in it.

## Report back in exactly this format

```
TASK        2.3 — Paper
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        3.1
```

**Stop here. Do not begin 3.1.**
