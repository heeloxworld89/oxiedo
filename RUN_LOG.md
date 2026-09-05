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
  ☐ 5.1 a11y         ☐ 5.2 perf        ☐ 5.3 no-JS  ★ blocks launch
  ☐ 5.4 copy audit   ☐ 5.5 pre-launch  ☐ 5.6 deploy
```

---

## Notes as you go

| Task | Surprises / task-file corrections needed |
|---|---|
| | |

**When a report says SURPRISES, amend the instruction file before the next session.**
The code wins; the plan gets corrected.
