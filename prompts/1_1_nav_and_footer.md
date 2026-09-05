# 1.1 — Nav and Footer

> Paste everything below into a fresh session. Nothing above this line.

---

You are building the Oxiedo website. Working directory: `/Users/raad/Desktop/oxido`.

**Context in three lines.** Oxiedo sells ORMAS — a neural network architecture that keeps a
bounded, logged record of every change it makes to itself. The website is 12 static routes. All
copy, colour, typography and layout are already written and verified in `website/design/` and
`website/ui_ux/`. **You are assembling, not authoring.**

**The build plan lives in `Oxiedo Website Codebase/instructions/`.** Code goes in
`Oxiedo Website Codebase/src/`.

## The laws that apply to this task

**Law 1 — the content is finished.** Every sentence exists in `website/design/`. If you need
a sentence that is not there, that is a content gap: stop and say so. Do not invent copy.

**Law 2 — nothing hardcoded that has a token.** No hex, font stack, duration or spacing figure
appears anywhere except `src/styles/tokens.css`. Use `var(--amber-bright)`, never `#F5A623`.

**Law 4 — build the component before the page.** No page-specific CSS. If a page needs something
the library lacks, add it to the library first.

**Law 6 — accessibility is a build gate.** Keyboard operable, visible focus ring, real `<label>`
on every field, text on every status badge. Verified this session, not deferred.

## Read these first, in this order, in this session

1. `website/design/01_HOME.md`
2. `website/design/12_DESIGN_SYSTEM.md`
3. `website/ui_ux/00_SYSTEM_UX_MANIFESTO.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- `Nav.astro`: wordmark left, six links centre, `Invest` ghost + `Book Now` amber fill right. Transparent at page top, `--bg-overlay` with a bottom border once scrolled (styles only — the scroll listener is Block 4).
- Mobile: hamburger opening a full-screen overlay, both CTAs full-width at the foot.
- `Footer.astro`: the standing disclaimer verbatim from `design/01 §Section 8` — all results CIFAR-10/100, no clinical, biological, financial or production data, manuscript under review — plus the route list.

## Do not

- **Do not put `/press` or `/data` in the nav.** `/press` is hidden until first outreach; `/data` is linked only from `/contact`, and only after the solicitor review in `design/14`.
- Do not write the scroll behaviour or the menu toggle. Block 4.
- Do not paraphrase the footer disclaimer.

## Exit condition

Nav renders at all four breakpoints. With JS disabled the mobile nav degrades to visible links. Footer disclaimer diffed against `design/01` and identical.

**Then commit.** One commit, message `1.1 nav and footer`. Nothing else in it.

## Report back in exactly this format

```
TASK        1.1 — Nav and Footer
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        1.2
```

**Stop here. Do not begin 1.2.**
