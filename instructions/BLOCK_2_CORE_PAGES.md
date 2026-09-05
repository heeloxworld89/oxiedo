# BLOCK 2 — Core Pages

> `/` · `/solutions` · `/paper`. Three tasks, roughly three sessions.
>
> **The site is showable to a stranger at the end of this block.** If time runs out anywhere in
> this plan, this is the stopping point that leaves the most value: what it is, the one thing
> available, and the evidence behind it.

---

## 2.1 · `/` — Home

**Build.** Eight sections per `ui_ux/01`.

Four things this task must get right, because each was a correction to an earlier draft:

**The hero subhead is two lines, not four.** The current copy restates the headline and pushes the
CTAs below the fold on a 13" screen. Cut it in the template; if the cut needs new wording, that is
a content gap — stop and ask (Law 1).

**The second CTA is `Read the paper`, not a second booking ask.** Researchers are one of four
stated audiences and have no low-commitment entry point otherwise. The Charter Partnership CTA
moves to §6 where its context exists.

**The hero right pane is a real flight-recorder excerpt in a `TelemetryBlock`**, not a
visualisation. It is the product, literally. On mobile it moves below the CTAs and truncates to
four lines — **no horizontal scroll in the first viewport.**

**The fourth bento cell uses `PullStat variant="warning"`.** `−1.0 pp · known failure`. It must
not render amber.

**The five operations row is 3 + 2, not 5 across.** Five columns at 1280px leaves ~216px per cell
for a title, a sentence and a status — cramped at desktop, broken at tablet.

**Sector cards use a different status treatment from solution badges.** A market is not bookable;
reusing `● ◐ ○` for both is a category error.

**Read first:** `design/01_HOME.md`, `ui_ux/01_HOME_UI.md`, `design/13 §Rules for Numbers`

**Exit.** Every figure traced to `design/13`. CIFAR qualifier present. Hero fits above the fold at
1440×900 **with the CTAs visible**. No horizontal overflow at 320px. JS disabled: complete.

---

## 2.2 · `/solutions` — ★ the hardest page in the build

**Build.** Master–detail. Sticky 280px master pane, fluid detail pane at max 860px.

```
  MASTER              1px --border-muted rule down the left
                      active item: 2px --amber-bright left edge, --text-primary
                      inactive: --text-secondary

  DETAIL              one SolutionBlock per solution
                      header · problem · mechanism · buyer · pricing · gate · CTA
```

**The no-JS fallback is the whole difficulty.** With scripts disabled this must degrade to a plain
anchor list above a long scrolling page — which is a correct, usable page, not a broken one. Build
that version **first**, then add the sticky behaviour and scroll-sync in Block 4.

Below 1024px the master becomes a horizontal chip row pinned under the nav.

**One available, six in build or upcoming.** Not three.

Every non-available solution carries a `GatePanel` with its real gate, cost, status, and failure
branch from `data/solutions.ts`.

**Pricing tables:** text left, numbers right, tabular lining, hairline row rules, no vertical
borders. Every table ends with *Designed; not yet tested against real customers.*

**Read first:** `design/02_SOLUTIONS.md`, `ui_ux/02_SOLUTIONS_UI.md`, `Commercial Plan/04`

**Exit.** All seven render from `data/solutions.ts` — **no solution content hardcoded in the
template.** Statuses match `design/02`. Every price carries its qualifier. **JS disabled: the page
is a usable anchor list, verified.**

---

## 2.3 · `/paper`

**Build.** Header, abstract, six results, mechanism schematic, what-was-not-tested, evidence band,
citation.

**The abstract is verbatim.** It is already correct in `design/05` — the real opening line from
`main.tex:57`. **A fabricated abstract shipped here once and was caught in review.** Copy it
character for character and diff it against the source before the exit condition.

**Status line reads `Manuscript under review`.** The venue is named **only if** the AAAI
disclosure check in `design/12 §Pre-Launch Checklist` has cleared. Until then, no venue.

**Six results as a ladder**, not a chart. Each row: condition, outcome, baseline, gap, and its
source citation in `--text-muted`. **Big figure, exact citation** — that pairing is the page's
entire credibility mechanism.

**Repository and arXiv links stay disabled.** The code is not public until after review
(`design/04 §35`). Render them as plain text, or omit them.

**What was not tested** is a `DisclosurePanel`, visible, not an appendix. Four items including the
**1.0 pp adversarial deficit**.

**Read first:** `design/05_PAPER.md`, `ui_ux/05_PAPER_UI.md`, `ormas_preprint/main.tex:57`

**Exit.** Abstract diffed against source, character-identical. Every result carries its citation.
No live link to a private repository. KaTeX renders equations, and they remain readable at 200%
zoom.

---

## Block exit

```
  ☐  three routes build and render
  ☐  every claim checked against design/13 PERMITTED
  ☐  nothing from design/13 GATED appears anywhere
  ☐  /solutions renders entirely from data/solutions.ts
  ☐  abstract verbatim, diffed
  ☐  all three usable with JS disabled
  ☐  no horizontal overflow at 320px on any of the three
```
