# 3.2 — Licensing

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

**Law 3 — every page renders completely with JavaScript disabled.** Content defaults to visible.
JS adds a `js` class to `<html>` and only then may anything hide. Test by disabling JS in a
browser, not by reading CSS.

## Read these first, in this order, in this session

1. `website/design/04_LICENSING.md`
2. `website/ui_ux/04_LICENSING_UI.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- Four stacked bands, L0 at the bottom. **Left-edge weight encodes commercial weight** — 1px on L0, 2px L1, 3px L2, 4px amber on L3.
- Hard-rules panel: the only 2px border on the site, five rules prefixed `[ ✗ ]`.
- Hover dims the other three bands to 0.5 and expands that layer inline.

## Do not

- **Crosses, not ticks.** These are prohibitions the company places on itself; a tick reads as a feature list.
- No isometric 3D. Rejected — harder to read at every breakpoint, impossible on mobile.

## Exit condition

Four bands legible at 320px. Hover works. JS off: all four render expanded.

**Then commit.** One commit, message `3.2 licensing`. Nothing else in it.

## Report back in exactly this format

```
TASK        3.2 — Licensing
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        3.3
```

**Stop here. Do not begin 3.3.**
