# BLOCK 0 — Foundation

> **Nothing renders until this is right.** Six tasks, roughly one session.
>
> Every later block assumes this block is correct. A wrong token here is a wrong token on twelve
> pages.

---

## 0.1 · Project skeleton

**Build.** Initialise Astro with TypeScript strict, static output. Create every directory in
`05_FILE_ARCHITECTURE.md` — **empty files included.** Pin the Astro version exactly and record it
here when done.

`.gitignore` covers `node_modules`, `dist`, `.env`, `.astro`.

**Read first:** `01_STACK.md`, `05_FILE_ARCHITECTURE.md`

**Exit:** `npm run build` produces a `dist/` containing one empty HTML page. The tree matches `05`
exactly — no extra directories, none missing.

---

## 0.2 · `tokens.css`

**Build.** Transcribe `design/12`'s token set. Colour, type, spacing, motion. Nothing else in the
file — no selectors, no resets, no utilities.

> **Before transcribing:** rename `--status-bookable` → `--status-available` **in `design/12`
> first**. The site's vocabulary is `AVAILABLE NOW`; the token name is stale. Do not transcribe it
> under a new name and leave the two out of step. `02_DESIGN_CONTRACT.md` records this.

**Read first:** `02_DESIGN_CONTRACT.md`, `design/12 §Colour Palette` and `§Typography Pairing` and
`§Spacing`, `design/18 §1.2` and `§1.3`

**Exit.** Every value in `design/12` appears in `tokens.css`. Every value in `tokens.css` appears
in `design/12`. **Diff them line by line and state that both directions hold** — a token invented
during transcription is the failure this task exists to prevent.

---

## 0.3 · Fonts

**Build.** Six woff2 files into `public/fonts/`. `@font-face` for each in `base.css` with
`font-display: swap`. Preload `Fraunces-Variable` and `PlusJakartaSans-Regular` only.

```
  Fraunces-Variable            display, H1 only        [preload]
  PlusJakartaSans-Regular      body                    [preload]
  PlusJakartaSans-SemiBold     H2, H3, emphasis
  JetBrainsMono-Regular        data, labels, code
  JetBrainsMono-Bold           pull stats
  JetBrainsMono-Italic         inline annotation
```

Each face gets a real fallback stack. Subset to Latin if the files exceed 100KB combined.

**Read first:** `02_DESIGN_CONTRACT.md §Typography binding`, `design/12 §Typography Pairing`

**Exit.** All three faces render in a browser with the network throttled. No layout shift on load.
**No request to any external font host** — verified in the network tab, not assumed.

---

## 0.4 · Reset and base

**Build.** A deliberate reset — `box-sizing`, margin zeroing, `img { max-width: 100% }`,
`color-scheme: dark`. Then `base.css`: element defaults binding the type scale, `body` background
explicitly from `--bg-base`, focus-visible ring at 2px amber with 2px offset.

`font-variant-numeric: tabular-nums` on a utility class, applied wherever figures align.

**Read first:** `02_DESIGN_CONTRACT.md`, `design/12 §Accessibility Requirements`

**Exit.** A page with one h1, one h2, one paragraph and one code block renders correctly at 320px,
768px, and 1440px. Tab moves through links with a visible amber ring at every step.

---

## 0.5 · Layout primitives

**Build.** `layout.css` — the 12-column grid, container max-widths (prose 65ch, standard 1100px,
wide 1280px), section rhythm (80/56/40px), and the four breakpoints.

**Read first:** `design/12 §Spacing` and `§Responsive Breakpoints`, `ui_ux/00 §2`

**Exit.** A three-cell grid holds its columns at desktop, collapses to two at tablet and one at
mobile, with no horizontal overflow at any width from 320px to 2560px. **Test 320px explicitly** —
it is the width that breaks code blocks.

---

## 0.6 · The no-JS baseline · ★ the most important task in this block

**Build.** `motion.css` with the reveal system defaulting to **visible**, and a single inline
script in `Base.astro`'s `<head>` adding a `js` class to `<html>` before any stylesheet loads.

```
  .reveal              visible. No JS required.
  .js .reveal          hidden, ready to animate.
  .js .reveal.visible  revealed.
```

Plus the full `prefers-reduced-motion` block from `design/18`.

**Read first:** `00_ENGINEERING_LAWS.md §Law 3`, `design/18 §"The no-JavaScript rule"`,
`ui_ux/00 §5`

**Exit.** A test page with three `.reveal` sections is **fully readable with JavaScript
disabled**, and shows no flash of hidden content with JavaScript enabled. Demonstrate both.

> **This is the block's gate.** If 0.6 is not right, every page built afterwards inherits a site
> that renders blank for the buyer it was built for.

---

## Block exit

```
  ☐  npm run build succeeds, output is static HTML + CSS
  ☐  tokens.css and design/12 match in both directions
  ☐  three faces load, self-hosted, no external requests
  ☐  no horizontal overflow 320px → 2560px
  ☐  JS disabled: content visible. JS enabled: no flash.
  ☐  keyboard tab order visible throughout
```
