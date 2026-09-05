# BLOCK 1 — Components

> Every page is assembled from these. **No page-specific CSS exists after this block** — if a page
> needs something new, it is added here first (Law 4).
>
> Ten tasks, roughly two sessions.

---

## 1.1 · Nav and Footer

Nav: wordmark left, six links centre, `Invest` ghost and `Book Now` amber fill right. Transparent
at top, `--bg-overlay` with a bottom border on scroll. Mobile: hamburger → full-screen overlay,
both CTAs full-width at the foot.

Footer: the standing disclaimer — all results CIFAR-10/100, no clinical, biological, financial or
production data, manuscript under review — plus the route list.

> **`/press` and `/data` are not in the nav.** `/press` is hidden until first outreach. `/data`
> is linked only from `/contact`, and only once the solicitor review in `design/14` is done.

**Read:** `design/01 §Navigation`, `design/12 §Navigation` and `§Footer`
**Exit.** Nav works at all four breakpoints; mobile overlay traps focus and closes on Escape; the
footer disclaimer is verbatim from `design/01`.

---

## 1.2 · StatusBadge

Three variants only: `available` · `inbuild` · `upcoming`. Typed prop — an invalid status must be
a build error, not a runtime surprise.

**Always renders text.** Never icon or colour alone (Law 6).

**Read:** `design/12 §Status Badge`
**Exit.** All three render; passing an invalid status fails the build.

---

## 1.3 · PullStat

Figure in JetBrains Mono Bold, `--amber-bright`, 80px desktop / 56px mobile. Caption beneath in
Plus Jakarta Sans, `--text-secondary`, max 240px.

**A `variant="warning"` is required** — it renders the figure in `--chart-warning`. The homepage's
`−1.0 pp known failure` cell uses it. **Three wins and a loss in the same amber reads as four
wins**, and that cell's whole purpose is being legible as the honest one.

**Read:** `design/12 §Pull Stat`, `ui_ux/01 §2`
**Exit.** Both variants render; tabular figures align in a column of three.

---

## 1.4 · BentoGrid and BentoCell

12-column grid. Cell takes a span prop. Cell size communicates importance — never sized to fill a
gap (`ui_ux/00 §2`).

`--bg-surface`, 1px `--border-subtle`, 2px radius, 24px padding. Hover: border to
`--border-strong`, 150ms. **No lift, no scale, no shadow.**

**Read:** `ui_ux/00 §2`, `design/12 §Bento Grid System`
**Exit.** A 2×2 + 1×1 + 1×1 + 2×1 arrangement holds at desktop and stacks cleanly at mobile.

---

## 1.5 · TelemetryBlock

`#060606` ground, 1px `--border-subtle`, JetBrains Mono 13px, `--lh-mono`, `overflow-x: auto`.
Optional right-aligned caption label. Optional amber emphasis on a single term.

**No syntax-highlight palette.** A second colour system on top of the identity is how palettes
drift (`ui_ux/02 §2`).

**Read:** `design/12 §Code / Telemetry Block`
**Exit.** The homepage's flight-recorder excerpt renders without horizontal overflow at 390px.

---

## 1.6 · DisclosurePanel

`--bg-surface`, 3px `--amber-mid` left edge, label in `--amber-mid` uppercase mono.

**Maximum two per page** (`design/12`). Used for open questions and honest gaps — the `/paper`
"what was not tested" section and `/invest` "what is open".

**Read:** `design/12 §Disclosure Panel`
**Exit.** Renders; the 65ch measure holds inside it.

---

## 1.7 · GatePanel · ★ the site's most distinctive component

Four fields: gate name, cost, status, **and what happens if it fails.**

```
  ┌─ GATE ────────────────────────────────────┐
  │  Frozen-model wrapper viability           │
  │  COST      ~1 GPU-day                     │
  │  STATUS    not started                    │
  │  IF IT FAILS   native-training mode only  │
  └───────────────────────────────────────────┘
```

**No progress bar, no percentage, no lock icon.** A progress indicator on an experiment that has
not started is fabricated telemetry on a site about honest telemetry.

**Read:** `ui_ux/02 §4`, `Commercial Plan/19 §3`
**Exit.** Renders for all six gated solutions with real values from `data/solutions.ts`.

---

## 1.8 · Button and links

Primary amber fill · secondary ghost · tertiary text-with-arrow. All 2px radius, JetBrains Mono
600 14px. Focus ring on all three. Disabled state that is visibly disabled without relying on
colour alone.

**Read:** `design/12 §CTA Buttons`
**Exit.** All three variants, all states, keyboard-operable, ring visible on each.

---

## 1.9 · FormField · ★ most state-complete component

No background, no top or side borders, 1px `--border-strong` bottom rule. **Label permanently
above** — never a placeholder as label.

Six states: default · focus · filled · error · disabled · success. Error message states the fix
("Enter a work email address"), never "Invalid input".

**Read:** `ui_ux/10 §2` and `§3`, `design/12 §Accessibility Requirements`
**Exit.** Every state renders. Every field has a real `<label>` with `for`. `aria-describedby`
links the error message. Tab and screen-reader order verified.

---

## 1.10 · Remaining primitives

`Eyebrow` (mono 11px, 0.15em, `--amber-mid`) · `SectionDivider` (rule–label–rule) ·
`ComparisonMatrix` (two columns, left muted, right full contrast with amber keyword) ·
`LadderSchematic` (Unicode Type 1, from `data/solutions.ts`) · `Accordion` (markup and styles
only — behaviour is Block 4).

**Read:** `design/12 §Components`, `ui_ux/03 §2`
**Exit.** All five render from real data. **`Accordion` renders every panel open with no JS.**

---

## Block exit

```
  ☐  every component renders in isolation
  ☐  zero colour, duration or spacing literals outside tokens.css
  ☐  every component keyboard-operable with a visible focus state
  ☐  StatusBadge and FormField reject invalid props at build time
  ☐  components.css is complete — no page has its own styles
  ☐  JS disabled: every component still readable and operable
```
