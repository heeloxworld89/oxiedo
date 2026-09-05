# 4.4 — masterdetail.ts

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

**Law 5 — motion reveals information or it does not exist.** Before adding a transition, answer:
what does removing it hide? If nothing, it does not ship.

## Read these first, in this order, in this session

1. `website/ui_ux/02_SOLUTIONS_UI.md`
2. `Oxiedo Website Codebase/instructions/BLOCK_4_INTERACTION.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- `src/scripts/masterdetail.ts` — two behaviours over the Block 2.2 anchor list.
- Click a master item → smooth-scroll the detail pane to that solution.
- Scroll the detail pane → update the active master item.
- **Suppress scroll-spy updates while a programmatic scroll is in flight**, or the active state flickers between origin and destination.
- Below 1024px the same sync applies to the chip row, and the active chip scrolls itself into view.
- Reduced motion: instant jumps instead of smooth scroll.

## Do not

- Do not make the page depend on this. The Block 2.2 anchor list must still work.
- Do not hijack the window scroll — only the detail pane.

## Exit condition

Both directions work. **No flicker during a click-initiated scroll.** Mobile chips track. **JS off: the anchor list still works — re-verified.**

**Then commit.** One commit, message `4.4 masterdetail.ts`. Nothing else in it.

## Report back in exactly this format

```
TASK        4.4 — masterdetail.ts
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        4.5
```

**Stop here. Do not begin 4.5.**
