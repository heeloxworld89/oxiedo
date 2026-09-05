# 05 — File Architecture

> Every directory and file, decided before any is created. Create the skeleton in Block 0 Task 1
> so the shape of the work is visible from the start.

---

## The tree

```
  Oxiedo Website Codebase/
    instructions/               ← this folder. No code, ever.
    src/
      styles/
        tokens.css              transcription of design/12. NOTHING ELSE.
        reset.css               minimal, deliberate
        base.css                element defaults, type scale binding
        layout.css              grid, container, section rhythm
        components.css          the Block 1 library
        motion.css              transitions, reveal, reduced-motion, no-JS
      components/
        Nav.astro               Footer.astro
        StatusBadge.astro       PullStat.astro
        BentoGrid.astro         BentoCell.astro
        TelemetryBlock.astro    DisclosurePanel.astro
        GatePanel.astro         SolutionBlock.astro
        Button.astro            Eyebrow.astro
        SectionDivider.astro    ComparisonMatrix.astro
        Accordion.astro         FormField.astro
        MasterDetail.astro      LadderSchematic.astro
      layouts/
        Base.astro              html shell, head, fonts, the `js` class script
        Page.astro              nav + main + footer
        Post.astro              /insights reading view, 65ch
      pages/
        index.astro             solutions.astro    sectors.astro
        licensing.astro         paper.astro        about.astro
        invest.astro            faq.astro          contact.astro
        data.astro              press.astro        404.astro
        insights/
          index.astro           [slug].astro
      content/
        insights/               one .md per post
      content.config.ts         collection schema — Astro 7.x path, not src/content/config.ts
      data/
        solutions.ts            the seven — name, status, price, gate, copy ref
        sectors.ts              the five
        results.ts              the six paper results, each with its source
      scripts/
        reveal.ts               nav.ts    accordion.ts
        masterdetail.ts         form.ts
    public/
      fonts/                    exactly 6 woff2 — see 02_DESIGN_CONTRACT
      icons/                    line-art SVG only
      favicon.svg
    functions/
      contact.ts                the single form endpoint
    astro.config.mjs            package.json    tsconfig.json
```

---

## Three structural rules

**`data/` holds facts, templates hold layout.** The seven solutions live in `solutions.ts` — name,
status, price band, gate, and a reference to the copy source. A page maps over that array. **When
a status changes, it changes in one place**, not in the homepage ladder *and* the solutions page
*and* the invest page — which is exactly how "first three available" survived in four files after
the decision changed to one.

**`scripts/` files are each under 100 lines and do one thing.** If one grows past that, it is
doing two things. There are five, and there should never be a sixth without a stated reason.

**`tokens.css` imports nothing and is imported by everything.** It is the only file containing a
literal colour, duration, or size.

---

## Naming

```
  components   PascalCase.astro
  scripts      camelCase.ts
  styles       lowercase.css
  data         lowercase.ts, plural
  routes       lowercase, matching the URL exactly
```

**Route filenames match URLs exactly.** `design/02_SOLUTIONS.md` → `/solutions` →
`pages/solutions.astro`. This sounds obvious; the design folder had `02_PRODUCTS.md` serving
`/solutions` for two days and it caused real confusion.

---

## What must never appear

```
  ✗ a colour, duration, or spacing literal outside tokens.css
  ✗ a <style> block inside a page — components own their styles
  ✗ a copy string not traceable to website/design/
  ✗ a third-party script, font, or stylesheet from a CDN
  ✗ an image that is not an SVG line diagram or the founder portrait
  ✗ node_modules, .env, or build output in version control
```
