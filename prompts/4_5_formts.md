# 4.5 — form.ts

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

**Law 3 — every page renders completely with JavaScript disabled.** Content defaults to visible.
JS adds a `js` class to `<html>` and only then may anything hide. Test by disabling JS in a
browser, not by reading CSS.

**Law 6 — accessibility is a build gate.** Keyboard operable, visible focus ring, real `<label>`
on every field, text on every status badge. Verified this session, not deferred.

## Read these first, in this order, in this session

1. `website/ui_ux/10_CONTACT_UI.md`
2. `website/design/10_CONTACT.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- `src/scripts/form.ts` — full state machine over Block 1.9's fields.
- **Validation fires on blur, never on keystroke.**
- Submit → button label becomes `Sending…`, disabled, **no spinner**.
- Success → confirmation replaces the form inline. **No redirect.**
- Failure → `--chart-warning` message above the button that **always includes the direct email address as a fallback**.
- `aria-live="polite"` on the status region.

## Do not

- Do not validate as the user types — it shows an error for every character before the `@`.
- Do not redirect on success.
- Do not omit the fallback address from the failure message.

## Exit condition

Every state reachable and demonstrated. Blur-only validation confirmed. Failure shows the fallback address. A screen reader announces success and failure.

**Then commit.** One commit, message `4.5 form.ts`. Nothing else in it.

## Report back in exactly this format

```
TASK        4.5 — form.ts
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        4.6
```

**Stop here. Do not begin 4.6.**
