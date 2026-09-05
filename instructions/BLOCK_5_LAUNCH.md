# BLOCK 5 — Launch

> **This block verifies what is already true. It does not make anything true.**
>
> Accessibility was a gate in every prior block (Law 6). No-JS was a gate in every prior block
> (Law 3). If either fails here, the failure belongs to an earlier block and gets fixed there.
>
> Six tasks, roughly one session — assuming the earlier blocks did their work.

---

## 5.1 · Accessibility verification

```
  KEYBOARD      every route traversed by keyboard alone, start to finish
  FOCUS         2px amber ring, 2px offset, visible on every stop
  LABELS        every field a real <label> with for. Zero placeholder-as-label.
  HEADINGS      one h1 per route, no skipped levels
  LANDMARKS     header, nav, main, footer on every route
  CONTRAST      re-verified against tokens.css, not against design/12
  MOTION        prefers-reduced-motion honoured on all twelve routes
  STATUS        every badge carries text — never colour or icon alone
  SKIP LINK     "Skip to content" as the first focusable element
```

**Exit.** All twelve routes pass every line. An automated checker is a starting point, not the
test — **traverse each route by keyboard yourself.**

---

## 5.2 · Performance budget

```
  HTML per route      < 50 KB
  CSS total           < 40 KB
  JS total            < 15 KB      five files, none over 100 lines
  FONTS               6 files, 2 preloaded, < 200 KB combined
  THIRD PARTY         zero requests
  LCP                 < 1.5s on a throttled connection
  CLS                 < 0.05       fonts are the usual culprit
```

**Exit.** Every figure met or a stated reason recorded. **Zero third-party requests, verified in
the network tab** — one CDN font would break both `01_STACK` and `design/14`.

---

## 5.3 · No-JavaScript verification · ★ the launch gate

**Disable JavaScript in the browser. Load all twelve routes. Read them.**

```
  ☐  every route renders complete content
  ☐  /solutions is a usable anchor list
  ☐  /faq shows every answer
  ☐  /contact shows all four forms with labels
  ☐  nav links work; mobile nav degrades to visible links
  ☐  no element is invisible, clipped, or empty
```

**Test in the browser, not by reading CSS.** This is the buyer's actual environment.

**Exit.** All twelve readable and navigable. Any failure blocks launch.

---

## 5.4 · Copy-rules audit against the built site

Not against the source files — **against the rendered pages.**

```
  1.  every claim on every page → design/13 PERMITTED list
  2.  nothing from design/13 GATED appears. None has unlocked.
  3.  every number → design/13 §Rules for Numbers
  4.  CIFAR-10/100 qualifier present wherever a result is quoted
  5.  every price carries "Designed; not yet tested against real customers"
  6.  nothing from Commercial Plan/20 NEVER-PERMITTED appears
```

> **Item 2 has already failed once.** The lead-time claim reached `/solutions` and was removed in
> review. **Grep the built output** for the gated phrases specifically — do not read for them.

**Exit.** All six pass, with the grep output recorded.

---

## 5.5 · The pre-launch checklist from `design/12`

Five items, none of them code:

```
  ☐  AAAI DISCLOSURE     Does AAAI's policy permit naming the venue during
                         review? Ten minutes. If not — remove the venue from
                         every page. Desk rejection is a real risk.

  ☐  COMPANY NUMBER      [TBD] in five files. design/14 makes data commitments
                         on behalf of an entity that is not registered.
                         Register it, or remove the entity line and the
                         commitments that depend on it.

  ☐  /data LEGAL REVIEW  A qualified solicitor reads design/14 before /data
                         is linked. /contact already points at it.

  ☐  REPO LINKS          Stay disabled until the code is public post-review.
                         design/04 §35.

  ☐  PRESS PLACEHOLDERS  /press must not render publicly while any [TBD]
                         remains — the location line in design/11 §91.
```

**Exit.** Each item resolved or explicitly deferred with a recorded reason. **A deferred item is
acceptable; an unnoticed one is not.**

---

## 5.6 · Deploy

Static output to Cloudflare Pages or Netlify — pick one and record it. Custom domain, HTTPS,
the form function deployed alongside.

```
  ☐  build reproducible from a clean clone
  ☐  custom domain resolving, HTTPS valid
  ☐  form endpoint live and rate-limited
  ☐  404 serving correctly
  ☐  sitemap generated — WITHOUT /press
  ☐  robots.txt allows indexing, excludes /press
  ☐  a real submission tested end to end on production
```

> **Change the contact address before launch.** `design/10` still carries a personal gmail
> address. A site selling to hospitals and banks fails a procurement smell test on that alone.
> Domain email, and update `design/10` and `design/14` to match.

**Exit.** Site live. A real form submission received. All of 5.1–5.5 re-verified against
production, not against localhost.

---

## Block exit

```
  ☐  all twelve routes pass every accessibility line
  ☐  performance budget met, zero third-party requests
  ☐  all twelve readable with JavaScript disabled
  ☐  copy-rules audit passed against BUILT output, grep recorded
  ☐  five pre-launch items resolved or explicitly deferred with a reason
  ☐  live, custom domain, real submission received end to end
```

---

## After launch

```
  ☐  when a gate passes, update design/13 FIRST, then the site
  ☐  when a status changes, edit data/solutions.ts — one place, not four
  ☐  when the paper is accepted, /paper and every "under review" line changes
  ☐  when the repo goes public, enable the links
  ☐  re-run 5.4 after ANY copy change
```

**The last line is the standing rule.** This site's entire argument is that it does not overclaim.
The audit is what keeps that true after the people who wrote the rules have moved on to other work.
