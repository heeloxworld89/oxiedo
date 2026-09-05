# BLOCK 3 — Remaining Pages

> Nine routes. Roughly three sessions. Each is smaller than Block 2's pages because the components
> now exist — **if a page here needs new CSS, it belongs in Block 1** (Law 4).

---

## 3.1 · `/sectors`

Tab row, not a radar. Five labels, mono 11px tracked, active takes a 2px amber bottom rule. **Tabs
are real anchors** — with JS off, all five sections render stacked and the tabs jump to them.

The `ComparisonMatrix` is the core module and carries the "one primitive, five markets" argument
more efficiently than the prose does. Repeat it per sector with that sector's own noun — *site*,
*region*, *batch*, *corpus*.

Buyer cards: **title at the top**, not the bottom. A reader scanning for *"is this me?"* reads
titles first.

**Read:** `design/03_SECTORS.md`, `ui_ux/03_SECTORS_UI.md`
**Exit.** Five sectors, no WebGL, JS-off renders all five.

---

## 3.2 · `/licensing`

Four stacked bands, L0 at the bottom. **Left-edge weight encodes commercial weight** — 1px on L0,
4px amber on L3. L0 is deliberately the plainest band; it is free permanently and the design
should say so.

Hard-rules panel: the only 2px border on the site. Five rules prefixed `[ ✗ ]` — **crosses, not
ticks.** These are prohibitions the company places on itself; a tick would read as a feature list.

**Read:** `design/04_LICENSING.md`, `ui_ux/04_LICENSING_UI.md`
**Exit.** Four bands legible at 320px. Hover dims the other three; JS off renders all expanded.

---

## 3.3 · `/about`

Founder block: the name set typographically in a 1px bordered box. **This solves the
no-photograph problem properly** rather than working around it — a grey avatar reads as an
unfinished page.

Founding story: the four `FAIL:` lines in a `TelemetryBlock`, the word `FAIL` in
`--chart-warning`. **Do not style this section as a warning panel** — it is a credibility asset,
not a disclosure.

Entity line carries `[Company number TBD]` until registered. See `design/12 §Pre-Launch Checklist`.

**Read:** `design/07_ABOUT.md`, `ui_ux/07_ABOUT_UI.md`
**Exit.** Renders; the datasets ask is last and longest in §6.

---

## 3.4 · `/invest`

Metric bento of four. **No TAM figure** — `design/13` treats analyst market sizes as soft and
every commercial case is built bottom-up. A TAM in the investor hero contradicts the folder's own
methodology and a deep-tech investor will notice.

No projection sparklines. There is no revenue history, and a drawn curve implies data that does
not exist.

**"What is open" gets more visual weight than the metric bento above it.** It is the section that
converts a sceptical investor.

**No progress bar, no allocation-window indicator.** A simulated raise meter is fabricated data on
a page arguing that this company does not fabricate data.

**Read:** `design/08_INVEST.md`, `ui_ux/08_INVEST_UI.md`
**Exit.** No TAM, no simulated indicators, disclosure panel visually dominant.

---

## 3.5 · `/faq`

Grouped accordions, five groups. Question in prose — **not** styled as a terminal prompt; a
`> QUERY:` prefix makes scanning for a specific question harder, which is the only thing anyone
does on an FAQ.

**Every question gets a stable `id`.** A buyer forwarding one answer to their security team must
be able to link to it.

**JS off: every panel open.** An FAQ that is blank without JavaScript is worse than a long one.

**Read:** `design/09_FAQ.md`, `ui_ux/09_FAQ_UI.md`
**Exit.** Anchors resolve; JS off shows all answers.

---

## 3.6 · `/contact`

Four intents. **All four stay visible and selectable** — sliding the others away strands a reader
who picked wrong.

**Commitments block renders above the fields.** A reader decides whether to fill in a form before
starting it.

Markup and states only; submission is Block 4.

**Read:** `design/10_CONTACT.md`, `ui_ux/10_CONTACT_UI.md`
**Exit.** All four forms render stacked with JS off. Every field labelled.

---

## 3.7 · `/data`

Straight render of `design/14_DATA.md`. Short version, then the long version for procurement.

> **Build the route. Do not link it.** `design/14` states a qualified solicitor must review it
> first, and `/contact` already points at it. Add the link in Block 5 only if the review is done —
> otherwise ship without it and record why.

**Read:** `design/14_DATA.md`
**Exit.** Route renders. **Nav and contact links to it are absent or commented, deliberately.**

---

## 3.8 · `/insights`

Feed: single column, data-table rows, **no thumbnails**. Date in mono, title in Plus Jakarta,
functional tags in bordered micro-type. Hover lifts the row background and fades in `[ READ → ]`.
No movement.

Reading view: 65ch, `Post.astro`, telemetry blocks inset full-bleed to the measure plus 24px.

Content collection with a typed schema. **Zero posts at launch is fine** — the route exists, the
feed renders an honest empty state.

**Read:** `design/06_INSIGHTS.md`, `ui_ux/06_INSIGHTS_UI.md`
**Exit.** Index and post template render from a collection. Empty state is deliberate, not broken.

---

## 3.9 · `/press` · 3.10 · `404`

> **Two routes, one session.** Both are small; they are numbered separately so the session
> protocol's `<BLOCK>.<N>` addressing stays unambiguous.

**`/press`:** single column 700px, log-style, hidden from nav **and from the sitemap**. Any
`[ TBD ]` renders with an amber ghost wash and border — visibly a missing variable. **The build
should refuse to render `/press` publicly while any `[ TBD ]` remains.**

**`404`:** copy is already written in `design/10 §404`. Three CTAs: Home, Paper, Contact.

**Read:** `design/11_PRESS.md`, `ui_ux/11_PRESS_UI.md`, `design/10 §404`
**Exit.** `/press` absent from sitemap and nav. 404 renders with working links.

---

## Block exit

```
  ☐  twelve routes total, all building
  ☐  no page-specific CSS anywhere
  ☐  /press hidden from nav and sitemap
  ☐  /data built and deliberately unlinked
  ☐  every route usable with JS disabled
  ☐  copy-rules pass on all nine
```
