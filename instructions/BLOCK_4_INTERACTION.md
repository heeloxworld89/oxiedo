# BLOCK 4 — Interaction

> Motion and forms, added **last on purpose.** Every page already works completely without any of
> this. That ordering is what makes Law 3 true by construction rather than by testing.
>
> Six tasks, roughly two sessions. **Five script files, each under 100 lines.**

---

## The rule that governs this entire block

**Every script in this block enhances a page that already works. None of them makes a page work.**

Before writing any task here, load the page with JavaScript disabled and confirm it is complete.
If it is not, the bug is in Block 2 or 3 — **go back and fix it there.** Do not fix a broken page
by adding JavaScript to it.

---

## 4.1 · `reveal.ts`

IntersectionObserver adds `.visible` to `.reveal` elements on entry, then unobserves. Fires once.

The CSS already defaults to visible; this only takes effect under `.js` (Block 0.6).

Respects `prefers-reduced-motion` — under reduce, everything is visible immediately and the
observer never runs.

**Read:** `design/18 §2`, `00_ENGINEERING_LAWS §Law 3` and `§Law 5`
**Exit.** Sections reveal on scroll. Reduced motion: instant. JS off: visible. All three verified
in a browser.

---

## 4.2 · `nav.ts`

Nav background transitions to `--bg-overlay` with a bottom border past 40px scroll. Mobile
hamburger toggles the overlay.

**The overlay must trap focus and close on Escape.** A full-screen menu that leaks focus to the
page behind it is a keyboard trap in reverse and it fails audit.

**Read:** `design/12 §Navigation`, `ui_ux/00 §3`
**Exit.** Scroll state works; mobile overlay traps focus, closes on Escape and on link activation.

---

## 4.3 · `accordion.ts`

Progressive enhancement over Block 1's markup, which already renders every panel open.

On load with `.js`, collapse all but any panel targeted by the URL hash. Click toggles
`height: 0 → auto` over `--duration-normal`. **No typing effect** — it delays reading for
decoration.

`aria-expanded` on the trigger, `aria-controls` to the panel. Enter and Space both activate.

**A deep link to `/faq#some-question` must open that panel and scroll to it.**

**Read:** `ui_ux/09 §2` and `§3`, `design/18`
**Exit.** Toggle works by mouse and keyboard. Hash-targeted panel opens on load. Reduced motion:
instant. JS off: all open.

---

## 4.4 · `masterdetail.ts` — the block's hardest task

Two behaviours over the Block 2.2 anchor list:

```
  CLICK master item   → smooth-scroll the detail pane to that solution
  SCROLL detail pane  → update the active master item
```

**Both directions must work**, and the scroll-spy must not fight a user-initiated smooth scroll —
suppress spy updates while a programmatic scroll is in flight, or the active state flickers between
the origin and destination.

Below 1024px the master is a horizontal chip row; the same sync applies, and the active chip
scrolls itself into view.

Respects reduced motion by using instant jumps instead of smooth scroll.

**Read:** `ui_ux/02 §1`, Block 2.2
**Exit.** Both directions work, no flicker during click-scroll, mobile chips track. **JS off: the
Block 2.2 anchor list still works, re-verified.**

---

## 4.5 · `form.ts`

**Validation on blur, never on keystroke.** Validating an email as it is typed shows an error for
every character before the `@`.

Full state machine from Block 1.9: default · focus · filled · error · disabled · loading ·
success · failure.

```
  SUBMIT    button → "Sending…", disabled, no spinner
  SUCCESS   confirmation replaces the form inline. No redirect.
  FAILURE   --chart-warning message above the button, and it ALWAYS
            includes the direct email address as a fallback.
```

`aria-live="polite"` on the status region so a screen reader announces the result.

**Read:** `ui_ux/10 §3`, `design/10 §What Happens After You Submit`
**Exit.** Every state reachable and demonstrated. Blur-only validation confirmed. Failure shows
the fallback address. Screen reader announces success and failure.

---

## 4.6 · `functions/contact.ts` — the only backend

One serverless function. Validates, rate-limits, sends an email. **No database, no CRM, no
third-party form service.**

```
  ✓  server-side validation — never trust the client
  ✓  rate limit by IP, and a honeypot field
  ✓  the four intents route to the same address with a subject prefix
  ✗  no logging of message bodies
  ✗  no analytics, no third-party processor
```

**Rate limiting is required, not optional.** A public form with no limit on a site with no
analytics is an open relay for whoever finds it.

> **Why no third-party form service:** a regulated buyer's first question is where the data goes.
> *"To an email address we control, and nowhere else"* survives a security review. A third-party
> processor is another entry in `design/14_DATA.md` and another answer you have to give.

**Read:** `01_STACK.md §Hosting and forms`, `design/14_DATA.md`
**Exit.** Submission arrives by email. Rate limit demonstrated. Honeypot rejects a bot post.
Bodies absent from logs. **`design/14_DATA.md` accurately describes what this function does** — if
it does not, amend `design/14` before shipping.

---

## Block exit

```
  ☐  five scripts, each under 100 lines, each doing one thing
  ☐  every page still complete with JS disabled — re-verified, all twelve
  ☐  reduced motion honoured everywhere
  ☐  keyboard operation unaffected by every enhancement
  ☐  form endpoint live, rate-limited, and accurately documented in design/14
  ☐  no third-party script anywhere in the built output
```
