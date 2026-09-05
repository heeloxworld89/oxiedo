# 2.2 — Solutions

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

**Law 4 — build the component before the page.** No page-specific CSS. If a page needs something
the library lacks, add it to the library first.

**Law 7 — a claim must trace to a source.** Check every number against
`website/design/13_COPY_RULES.md §Rules for Numbers`. Gated copy stays gated — none has unlocked.

## Read these first, in this order, in this session

1. `website/design/02_SOLUTIONS.md`
2. `website/ui_ux/02_SOLUTIONS_UI.md`
3. `Commercial Plan/04 — THE PRODUCT LADDER.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- Create `data/solutions.ts` **first** — the seven solutions with name, status, price band, gate (name, cost, status, failure branch), and a reference to the copy source.
- **Build the no-JS version first:** a plain anchor list above a long scrolling page of `SolutionBlock`s. That must be a usable page on its own.
- Then add the master–detail layout: sticky 280px master pane, fluid detail pane max 860px. Active item takes a 2px `--amber-bright` left edge.
- Below 1024px the master becomes a horizontal chip row pinned under the nav.
- Every non-available solution carries a `GatePanel` with its real values.
- Pricing tables: text left, numbers right, tabular lining, hairline row rules, no vertical borders, and the standing line *Designed; not yet tested against real customers.*

## Do not

- **One solution is `AVAILABLE NOW`, six are `IN BUILD` or `UPCOMING`. Not three.**
- Do not hardcode any solution's content in the template — it maps over the data file.
- Do not write the scroll-sync. Block 4.4.
- Do not let a gated claim into a solution description — check `design/13 §Gated Copy`.

## Exit condition

All seven render from `data/solutions.ts`. Statuses match `design/02`. Every price carries its qualifier. **JS disabled: the page is a usable anchor list — verified in a browser.**

**Then commit.** One commit, message `2.2 solutions`. Nothing else in it.

## Report back in exactly this format

```
TASK        2.2 — Solutions
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        2.3
```

**Stop here. Do not begin 2.3.**
