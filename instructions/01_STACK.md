# 01 — The Stack

> The technology decision, the rejected alternatives, and the constraints that decided it.

---

## The constraints, before the choice

```
  1.  MUST render completely with JavaScript disabled          Law 3
  2.  12 routes, overwhelmingly static content
  3.  ONE genuinely interactive page (/solutions master–detail)
  4.  Text-only forms. NO file uploads anywhere on the site.
  5.  Self-hosted fonts, 6 files, 2 preloaded
  6.  Built by one person plus an assistant, in sessions
  7.  Must still be maintainable in two years by whoever is here
  8.  Deployed cheaply, globally, with no server to operate
```

Constraint 1 eliminates most of the modern default stack on its own.

---

## The decision: Astro, static output

**Astro ships zero JavaScript by default.** Every other framework in common use ships a runtime
and then asks you to opt out of it. Astro asks you to opt *in*, per component. That is not a
convenience here — **it is Law 3 enforced by the tool rather than by discipline.**

What it gives that plain HTML does not:

```
  · one <Nav> and <Footer>, not twelve copies
  · a real component model for the library in BLOCK_1
  · content collections for /insights posts as markdown
  · typed props, so a StatusBadge cannot be given an invalid status
  · static output — plain HTML and CSS on a CDN, no server
```

**Version:** pin exactly. Record it in `05_FILE_ARCHITECTURE.md` at Block 0 Task 1 and do not
float it.

**TypeScript:** on, `strict`. The component props are the only place types matter here, and they
are exactly where a wrong status string or a missing required field would otherwise ship silently.

---

## What was rejected, and why

**Plain HTML/CSS/JS.** Genuinely tempting — zero build step, maximum longevity, no-JS by default.
Rejected because twelve routes means twelve copies of the nav and footer, and the first time the
navigation changes, one of them will be missed. **The failure mode is silent drift**, which is the
exact failure this repository has already fought twice.

**Next.js.** Ships a React runtime, hydrates by default, and would require fighting the framework
to satisfy Law 3. Enormous capability for a site with twelve static pages and one interactive
component. Rejected as the wrong tool at the wrong scale.

**11ty.** A reasonable alternative and close to correct. Rejected on ergonomics only: Astro's
component model and typed props map more directly onto the component library in Block 1, and the
content collection for `/insights` is one file instead of a configured pipeline.

**Any CSS framework — Tailwind, Bootstrap, or similar.** Rejected outright, and this is not a
preference. `design/12` is a complete design system with named tokens. A utility framework would
either duplicate it or override it, and Law 2 exists specifically to prevent a second source of
truth for colour and spacing. **Plain CSS with custom properties, written by hand, matching the
design system exactly.**

**A component library — shadcn, Radix, or similar.** Rejected. Every component in Block 1 is
specified in `design/12` down to border width and letter-spacing. Importing a library would mean
restyling every part of it to match, which is more work than writing it.

---

## Hosting and forms

**Hosting: Cloudflare Pages or Netlify.** Static output, global CDN, free at this volume, custom
domain, automatic HTTPS. Either is correct; pick one at Block 5 and record it.

**Forms need one endpoint and nothing more.** Four intents, text fields only, no uploads.

```
  the form POSTs to a single serverless function
  the function validates, rate-limits, and sends an email
  no database, no CRM, no analytics on the submission
  no third-party form service that receives buyer data
```

**That last line is a decision, not a default.** A regulated buyer's first question about a form
is where the data goes. "To an email address we control, and nowhere else" is an answer that
survives a security review. A third-party form service is another processor to disclose in
`design/14_DATA.md`.

**Rate limiting is required**, not optional. A public form with no limit on a site with no
analytics is an open relay for whoever finds it.

---

## What is explicitly not in the stack

```
  ✗ analytics of any kind, at launch
      A site that publishes a data-handling policy and then loads a
      third-party tracker has contradicted itself above the fold.
      If analytics are added later, they go in design/14_DATA.md FIRST.

  ✗ a cookie banner
      Because there are no cookies. Keep it that way.

  ✗ any CDN-hosted font, script, or stylesheet
      Fonts are self-hosted. See BLOCK_0.

  ✗ a CMS
      The content lives in this repository, in markdown, in version control.

  ✗ WebGL, canvas, three.js, or any physics library
      ui_ux/00 §4. If a diagram needs a GPU it is the wrong diagram.
```
