# Run Log

One line per task. Fill it in as you go. `check.sh` after every block.

```
BLOCK 0 — FOUNDATION
  ☐ 0.1   project skeleton          git init + first commit
  ☐ 0.2   tokens.css                diff both directions
  ☐ 0.3   fonts                     zero external requests
  ☐ 0.4   reset and base
  ☐ 0.5   layout primitives         test 320px
  ☐ 0.6   no-JS baseline            ★ VERIFY YOURSELF IN A BROWSER
          → ./check.sh  ·  git tag block-0-complete

BLOCK 1 — COMPONENTS
  ☐ 1.1   nav and footer            /press and /data NOT in nav
  ☐ 1.2   StatusBadge               invalid status must fail the build
  ☐ 1.3   PullStat                  warning variant required
  ☐ 1.4   BentoGrid / BentoCell
  ☐ 1.5   TelemetryBlock            no overflow at 390px
  ☐ 1.6   DisclosurePanel
  ☐ 1.7   GatePanel                 failure branch is the point
  ☐ 1.8   Button and links
  ☐ 1.9   FormField                 six states, real labels
  ☐ 1.10  remaining primitives      Accordion renders open with no JS
          → ./check.sh  ·  git tag block-1-complete

BLOCK 2 — CORE PAGES
  ☐ 2.1   home                      hero fits above fold w/ CTAs visible
  ☐ 2.2   solutions                 ★ anchor list FIRST, then master-detail
  ☐ 2.3   paper                     ★ diff the abstract, don't eyeball it
          → ./check.sh  ·  git tag block-2-complete
          → STOP. Look at it. Show someone.

BLOCK 3 — REMAINING PAGES
  ☐ 3.1 sectors      ☐ 3.2 licensing   ☐ 3.3 about
  ☐ 3.4 invest       ☐ 3.5 faq         ☐ 3.6 contact
  ☐ 3.7 data         ☐ 3.8 insights    ☐ 3.9 press      ☐ 3.10 404
          → ./check.sh  ·  git tag block-3-complete

BLOCK 4 — INTERACTION
  ☐ 4.1 reveal.ts    ☐ 4.2 nav.ts      ☐ 4.3 accordion.ts
  ☐ 4.4 masterdetail.ts  ★ hardest task in the build
  ☐ 4.5 form.ts      ☐ 4.6 contact endpoint
          → ./check.sh  ·  git tag block-4-complete

BLOCK 5 — LAUNCH
  ☑ 5.1 a11y         ☑ 5.2 perf        ☐ 5.3 no-JS  ★ blocks launch
  ☐ 5.4 copy audit   ☐ 5.5 pre-launch  ☐ 5.6 deploy
```

---

## Notes as you go

| Task | Surprises / task-file corrections needed |
|---|---|
| 5.1 | Skip link never existed (expected). Also found and fixed three real gaps that predate this block: /paper (6 sections) and 2 of /index's sections used an Eyebrow `<span>` as their only section title — invisible to heading nav (Block 2/3). Nav.astro's link list had no `<nav>` landmark (Block 1). `--border-strong` (#333333, 1.59:1 on #080808) fails WCAG 1.4.11 for the secondary button and the default contact-form input underline — both depend on it alone for a visible boundary (Block 0 token / Block 1 usage). Corrected to `#606060` (3.18:1) in design/12 first, then tokens.css. |
| 5.2 | Site CSS (Page.CqoKQXYQ.css, all 12 non-paper routes) = 39.1 KB — under the 40 KB budget but only by ~0.9 KB; the next component added anywhere sitewide will need a look at what it costs. JS = 5.6 KB for all 5 scripts combined (budget 15 KB). Site fonts = 152.9 KB / 6 files (budget 200 KB), 2 preloaded, confirmed self-hosted. KaTeX (scoped to /paper only): 29.1 KB CSS + up to 250.2 KB of woff2 (19 files; ~1.05 MB on disk once woff/ttf fallbacks are counted, but a modern browser only ever fetches woff2, and only the specific families the one equation's glyphs actually touch — not verified exactly which subset without a real browser's network tab). Recommendation: pre-render the equation to static SVG at build time and drop KaTeX — a single static equation does not need a 250 KB–1 MB font dependency, and every other budget on this site is disciplined to the byte. Not acted on this session per instruction. |

**When a report says SURPRISES, amend the instruction file before the next session.**
The code wins; the plan gets corrected.
