# 02 — The Design Contract

> How `website/design/12_DESIGN_SYSTEM.md` becomes CSS. Transcription, not interpretation.

---

## The rule

**`tokens.css` is a transcription of `design/12`. Nothing is added, renamed, or improved during
transcription.**

If a value in `design/12` looks wrong, that is a finding to report — **not a thing to fix in
`tokens.css`.** Fix it in `design/12` first, then transcribe. Two sources of truth for a colour is
how the identity drifted the first time.

---

## The token set, as of 2026-09-05

**Verify against `design/12` at transcription time.** This list is a snapshot; that file is the
authority.

```
  GROUND        --bg-base #080808 · --bg-surface #0F0F0F
                --bg-raised #161616 · --bg-overlay rgba(8,8,8,0.92)

  BORDERS       --border-subtle #1A1A1A · --border-muted #252525
                --border-strong #333333

  TEXT          --text-primary #EBEBEB · --text-secondary #8C8C8C
                --text-muted #6E6E6E · --text-disabled #2A2A2A

  ACCENT        --amber-bright #F5A623 · --amber-mid #D4890A
                --amber-muted #7A4D06 · --amber-ghost rgba(245,166,35,0.08)

  STATUS        --status-bookable #F5A623 · --status-inbuild #6B9FE8
                --status-upcoming #5A5A5A · --status-live #3FCF6E

  CHART         --chart-ormas #F5A623 · --chart-baseline #5A7ECA
                --chart-warning #E85454 · --chart-recovery #3FCF6E

  TYPE          --text-display clamp(2.5rem, 5vw + 1rem, 4.5rem)
                --text-h2 · --text-h3 · --text-body · --text-small · --text-eyebrow
                --lh-display 1.1 · --lh-body 1.7 · --lh-mono 1.6

  SPACE         --space-xs 4px … --space-4xl 128px, base unit 8

  MOTION        --duration-instant 80ms · --duration-fast 150ms
                --duration-normal 380ms · --duration-slow 600ms
                --ease-out · --ease-in · --ease-in-out
```

> **One rename to raise before transcribing.** `--status-bookable` is named for a status the site
> no longer uses — the vocabulary is now `AVAILABLE NOW / IN BUILD / UPCOMING`. Rename it to
> `--status-available` **in `design/12` first**, then transcribe. Do not transcribe it under a new
> name and leave the two out of step.

---

## Typography binding

Three faces, three roles, no overlap. **A face used outside its role is a defect.**

```
  Fraunces            --text-display          H1 only. One per page.
  Plus Jakarta Sans   --text-h2 --text-h3     headings, body, form input,
                      --text-body               nav links, buttons
  JetBrains Mono      --text-eyebrow          eyebrows, ALL numbers, status
                      code blocks               badges, captions, table figures,
                                                code, prices, dates
```

**Every number that a reader might compare to another number is JetBrains Mono with
`font-variant-numeric: tabular-nums`.** Prices, percentages, GPU-hours, line counts, dates. This
is not decorative — misaligned figures in a pricing column read as carelessness to exactly the
buyer this site is for.

**Six font files. Two preloaded.** `Fraunces-Variable` and `PlusJakartaSans-Regular` only; the
other four are below the fold on every route. `font-display: swap` on all six.

---

## The four rules that are not negotiable

**Radius is 2px.** Everywhere. Never a pill, never a circle, never 8px. Sharp edges are the
identity.

**There are no shadows.** Elevation is communicated by `--bg-surface` against `--bg-base` and by
border weight. `box-shadow` appears nowhere, including `inset`.

**There is no `backdrop-filter`.** No frosted glass. It was proposed and rejected — see
`ui_ux/00`. It is a 2025 cliché and it costs real frame time on a page with many panels.

**Amber is spent, not applied.** It marks the thing that matters most in a view: one CTA, one
figure, one active state. **A page with amber in six places has amber in zero places.**

---

## Dark only

Single-theme, deliberately — `design/12` states the rationale and instructs that this line be
updated first if it is ever revisited.

**Consequence for the build:** `body` sets an explicit background from `--bg-base`. Never rely on
an inherited or transparent ground. Set `color-scheme: dark` so form controls and scrollbars
render correctly rather than as light-mode defaults on a dark page.

---

## Contrast, verified not assumed

```
  --text-primary   on --bg-base    ≈ 16:1     AAA
  --text-secondary on --bg-base    ≈  6:1     AA
  --text-muted     on --bg-base    ≈  5.2:1   AA        ← was #4A4A4A, ≈2.4:1, FAILED
  --amber-bright   on --bg-base    AA at ≥14px only — never smaller
  --text-disabled  on --bg-base    FAILS by design — decorative only, never semantic
```

**`--text-disabled` must never carry information.** It is for an inactive control's own surface,
not for text a reader is expected to read.
