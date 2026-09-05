# 03 — Source Map

> Which source file supplies which part of which route. Open these, in this order, before building
> a page.

---

## Per route

| Route | Copy | Layout | Facts to re-verify |
|---|---|---|---|
| `/` | `design/01_HOME.md` | `ui_ux/01_HOME_UI.md` | every figure → `design/13 §Rules for Numbers` |
| `/solutions` | `design/02_SOLUTIONS.md` | `ui_ux/02_SOLUTIONS_UI.md` | status + price + gate per solution |
| `/sectors` | `design/03_SECTORS.md` | `ui_ux/03_SECTORS_UI.md` | market figures labelled EXTERNAL |
| `/licensing` | `design/04_LICENSING.md` | `ui_ux/04_LICENSING_UI.md` | L0 MIT permanence wording |
| `/paper` | `design/05_PAPER.md` | `ui_ux/05_PAPER_UI.md` | **abstract must be verbatim** |
| `/insights` | `design/06_INSIGHTS.md` | `ui_ux/06_INSIGHTS_UI.md` | each post's claims |
| `/about` | `design/07_ABOUT.md` | `ui_ux/07_ABOUT_UI.md` | kill-test figures, entity line |
| `/invest` | `design/08_INVEST.md` | `ui_ux/08_INVEST_UI.md` | no TAM in the metric bento |
| `/faq` | `design/09_FAQ.md` | `ui_ux/09_FAQ_UI.md` | gated answers stay gated |
| `/contact` | `design/10_CONTACT.md` | `ui_ux/10_CONTACT_UI.md` | commitments block above fields |
| `/data` | `design/14_DATA.md` | — | **do not link until solicitor review** |
| `/press` | `design/11_PRESS.md` | `ui_ux/11_PRESS_UI.md` | **hidden from nav and sitemap** |

---

## Cross-cutting sources — read once, apply everywhere

```
  design/12_DESIGN_SYSTEM.md      identity · components · a11y · pre-launch checklist
  design/13_COPY_RULES.md         permitted · gated · never-permitted copy
  design/18_ANIMATION...md        motion spec, easing, the no-JS rule
  ui_ux/00_SYSTEM_UX_MANIFESTO    density · interaction · what may be drawn
  Commercial Plan/20              the boundaries, absolute
```

---

## The three files that are reference, not instruction

`design/15_RESEARCH_BRIEF.md`, `design/16_PAGE_FEEDBACK.md`, `design/17_COMPETITIVE...md` are
**internal research and feedback, not build specs.** About 10,000 words of the design folder is
this category.

`17` is worth reading once before writing any comparison copy — its "copy implication" lines
prevent the *"better than SHAP"* class of error. `15` and `16` are historical: they record
decisions already made and applied.

**Do not build anything from these three.**

---

## Four things to check before every page

```
  1.  Does every claim on this page appear in design/13's PERMITTED list?
  2.  Does anything on it appear in the GATED list? None has unlocked.
  3.  Does the CIFAR-10/100 qualifier appear where a result is quoted?
  4.  Does any number differ from design/13 §Rules for Numbers?
```

**Item 2 has already failed once in review.** The lead-time claim reached `/solutions` and was
removed. Check it explicitly rather than assuming.
