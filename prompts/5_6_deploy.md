# 5.6 — Deploy

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

## Read these first, in this order, in this session

1. `Oxiedo Website Codebase/instructions/BLOCK_5_LAUNCH.md`
2. `Oxiedo Website Codebase/instructions/01_STACK.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- Deploy static output to Cloudflare Pages or Netlify. Pick one and **record the choice** in `01_STACK.md`.
- Custom domain, HTTPS, form function deployed alongside.
- Sitemap generated **excluding `/press`**. `robots.txt` allows indexing, excludes `/press`.
- Test a real form submission end to end on production.

## Do not

- **Change the contact address before launch.** `design/10` still carries a personal gmail address; a site selling to hospitals and banks fails a procurement smell test on that alone. Use a domain address and update `design/10` and `design/14` to match.
- Do not deploy with `/press` in the sitemap.
- Do not add analytics.

## Exit condition

Site live on a custom domain with valid HTTPS. A real submission received. **All of 5.1–5.5 re-verified against production, not localhost.**

**Then commit.** One commit, message `5.6 deploy`. Nothing else in it.

## Report back in exactly this format

```
TASK        5.6 — Deploy
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        — none, this is the last task
```

**Stop here. Do not begin — none, this is the last task.**
