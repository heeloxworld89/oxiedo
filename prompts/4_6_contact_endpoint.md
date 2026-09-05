# 4.6 — contact endpoint

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

1. `Oxiedo Website Codebase/instructions/01_STACK.md`
2. `website/design/14_DATA.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- `functions/contact.ts` — one serverless function. Validate, rate-limit, send an email.
- Server-side validation — never trust the client.
- Rate limit by IP, plus a honeypot field.
- The four intents route to the same address with a subject prefix.

## Do not

- **No database, no CRM, no third-party form service.** A regulated buyer's first question is where the data goes; *"to an email address we control and nowhere else"* survives a security review.
- **Do not log message bodies.**
- Do not add analytics.

## Exit condition

A submission arrives by email. Rate limit demonstrated. Honeypot rejects a bot post. Bodies absent from logs. **`design/14_DATA.md` accurately describes what this function does** — if it does not, amend `design/14` before finishing.

**Then commit.** One commit, message `4.6 contact endpoint`. Nothing else in it.

## Report back in exactly this format

```
TASK        4.6 — contact endpoint
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        5.1
```

**Stop here. Do not begin 5.1.**
