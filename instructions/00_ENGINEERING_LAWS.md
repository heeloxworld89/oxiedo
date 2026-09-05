# 00 — Engineering Laws

> Eight rules. They govern every session in every block. When a task file and a law disagree, the
> law wins and the task file is wrong.

---

## Law 1 · The content is finished. Do not write copy.

Every sentence on this site already exists in `website/design/`. The build assembles it; it does
not author it.

If a layout needs a heading, a label, or a line of microcopy that is not in `design/`, that is a
**content gap**, not a build decision. Stop, name the gap, and ask. **Inventing a sentence is how
a site ends up making a claim its own copy rules forbid.**

The one exception: purely functional interface strings with no factual content — "Close", "Menu",
"Skip to content". Even these follow `design/12 §Writing the copy`.

---

## Law 2 · Nothing is hardcoded that has a token.

No hex value, no font stack, no duration, no spacing figure appears anywhere except
`src/styles/tokens.css`, which is a direct transcription of `design/12`.

```
  ✗  color: #F5A623;
  ✓  color: var(--amber-bright);

  ✗  transition: opacity 380ms;
  ✓  transition: opacity var(--duration-normal) var(--ease-out);
```

**Why this is a law and not a preference:** the identity has already been changed once. When it
changes again, it must change in one file.

---

## Law 3 · Every page renders completely with JavaScript disabled.

This is the hardest rule in the plan and the reason Block 4 comes last.

```
  Content DEFAULTS to visible.
  JavaScript adds a `js` class to <html>.
  Only then may anything hide, collapse, or reveal on scroll.
```

**Test by disabling JavaScript in the browser, not by reading the CSS.** Every page, every block,
before that block's exit condition is met.

The buyer for this site sits behind a hospital, bank, or defence network that blocks scripts. A
page that is blank for them is a page that does not exist for them.

---

## Law 4 · Build the component before the page that needs it.

No page-specific CSS. If a page needs something the component library does not have, add it to the
library first, then use it.

**The test:** a component's styles must be removable to a separate file without touching any page.
If they cannot be, it is not a component.

---

## Law 5 · Motion reveals information, or it does not exist.

From `ui_ux/00 §3`. Before adding any transition, answer: *what information does removing this
hide?* If the answer is "none", it does not ship.

Permitted: hover states that expose data, accordion open, page-load fade, nav background on
scroll, scroll reveal.

**Forbidden without exception:** scroll-jacking, pinned sections, parallax, animated counters,
typing effects, elastic easing, anything on a loop, anything that delays reading.

---

## Law 6 · Accessibility is a build gate, not a launch task.

Each block's exit condition includes its own accessibility check. Nothing is deferred to Block 5;
Block 5 only *verifies* what was already true.

```
  every interactive element   reachable and operable by keyboard
  every focus state           visible — 2px amber ring, 2px offset
  every form field            a real <label>, never a placeholder
  every status badge          text, never colour or icon alone
  every image and icon        alt text, or aria-hidden if decorative
  contrast                    verified against design/12's palette
```

---

## Law 7 · A claim on a page must trace to a source.

Before any number, price, status, or factual sentence is placed in a template, confirm it against
`design/13_COPY_RULES.md §Rules for Numbers`.

**Gated copy stays gated.** `design/13 §Gated Copy` lists sentences that are locked until a named
condition is met. None has been met. **The lead-time claim has already appeared on `/solutions`
once and been removed** — do not let it back in through a component's default text.

---

## Law 8 · Stop at the exit condition.

Every task ends with a stated exit condition. Meet it, verify it, report it, stop.

Do not continue into the next task because it looks small. **Exit conditions are where the plan's
assumptions get tested**, and an unverified step carried forward is what costs a week.

If a task cannot be completed, report partial progress with what blocked it. **A session that
reports an honest blocker is more useful than one that reports a completion it cannot demonstrate.**
