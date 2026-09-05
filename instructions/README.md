# Oxiedo Website — Build Instructions

> **What this folder is.** The complete implementation plan for building the Oxiedo website.
> Written 2026-09-05, before any code exists.
>
> **This folder contains no code.** It contains the decisions, the sequence, and the exit
> conditions. Code goes in `../src/`, and not before Block 0 Task 1.

---

## The three source folders, and what each is authoritative for

**Nothing in this plan invents content, colour, or copy.** Everything is assembled from three
folders that already exist and disagree with each other on nothing.

```
  website/design/          THE COPY AND THE IDENTITY
                           What every page says, word for word.
                           Colour, typography, motion timing, components.
                           12_DESIGN_SYSTEM.md is the sole authority on visual identity.
                           13_COPY_RULES.md is the sole authority on what may be said.

  website/ui_ux/           THE LAYOUT AND THE INTERACTION
                           How each page is structured and how it behaves.
                           Expressed entirely in design/12's tokens.
                           00_SYSTEM_UX_MANIFESTO.md governs density and interaction.

  Commercial Plan/         THE FACTS
                           Every number, price, status and claim traces back here.
                           20 — WHAT IS NOT CLAIMED is the boundary on all of it.
```

**Precedence, when two sources appear to conflict:**

```
  1. Commercial Plan/20      what may never be claimed        — absolute
  2. design/13_COPY_RULES    what may be said, and when       — absolute
  3. design/12_DESIGN_SYSTEM colour, type, motion, components — absolute
  4. ui_ux/*                 layout and interaction
  5. design/01–11, 14        page copy
```

**If a conflict survives that ordering, stop and report it. Do not resolve it in code.**

---

## The files in this folder

| File | Settles |
|---|---|
| `README.md` | This. Sources, precedence, sequence. |
| `00_ENGINEERING_LAWS.md` | The eight rules that govern every session |
| `01_STACK.md` | The technology decision, with the rejected alternatives and why |
| `02_DESIGN_CONTRACT.md` | How `design/12` becomes CSS, exactly. Token names, no exceptions |
| `03_SOURCE_MAP.md` | Which source file supplies which part of which page |
| `04_SESSION_PROTOCOL.md` | How a single build session runs, start to finish |
| `05_FILE_ARCHITECTURE.md` | Every directory and file to create, before creating any |
| `BLOCK_0_FOUNDATION.md` | Tokens, fonts, reset, layout primitives, the no-JS baseline |
| `BLOCK_1_COMPONENTS.md` | The component library — nothing page-specific |
| `BLOCK_2_CORE_PAGES.md` | Home, Solutions, Paper |
| `BLOCK_3_REMAINING_PAGES.md` | The other nine routes |
| `BLOCK_4_INTERACTION.md` | Motion, forms, and the JavaScript that is allowed to exist |
| `BLOCK_5_LAUNCH.md` | Accessibility, performance, verification, deploy |

---

## The sequence

```
  BLOCK 0  FOUNDATION        ~1 session    nothing renders until this is right
      ↓
  BLOCK 1  COMPONENTS        ~2 sessions   every page is assembled from these
      ↓
  BLOCK 2  CORE PAGES        ~3 sessions   /  ·  /solutions  ·  /paper
      ↓                                    ← THE SITE IS SHOWABLE HERE
  BLOCK 3  REMAINING PAGES   ~3 sessions   the other nine routes
      ↓
  BLOCK 4  INTERACTION       ~2 sessions   motion and forms, added last on purpose
      ↓
  BLOCK 5  LAUNCH            ~1 session    verify, then deploy
```

**Blocks 0 through 2 produce a site worth showing someone.** If time runs out, that is the
stopping point that leaves the most value — a homepage, the one available solution, and the
evidence behind it.

**Block 4 is deliberately last.** Every page must work completely before any JavaScript is added.
That ordering is what makes the no-JS requirement true by construction rather than by testing.

---

## The three things that are true before a single line is written

**One. Content is finished.** 46,918 words across `design/` and `ui_ux/`, verified, cross-checked,
and free of factual error as of 2026-09-05. **This build writes no copy.** If a page needs a
sentence that does not exist in `design/`, that is a content task, not a build task — stop and
say so.

**Two. The identity is settled.** Amber on matte black, Fraunces / Plus Jakarta Sans / JetBrains
Mono, six font files, 2px radius, no shadows. A competing direction was proposed and rejected;
`ui_ux/00 §"Why this file was rewritten"` records why. **Do not reopen it mid-build.**

**Three. There are no file uploads on this website.** The contact forms collect text only.
Model checkpoints and datasets are exchanged out of band, after a conversation, under the terms in
`design/14_DATA.md`. **This removes the entire file-handling, storage, and virus-scanning surface
from the build**, and it is a deliberate scope decision rather than an omission.
