# How To Use These Prompts

> 41 prompts. One per task. Each is self-contained — a fresh session with no memory can execute it.

---

## Setup, once

```
  Model             Sonnet 4.6
  Thinking          medium
  Working directory /Users/raad/Desktop/oxido
  Permission mode   accept edits (you will approve a lot otherwise)
```

**Why Sonnet at medium and not something heavier:** every design decision is already made. These
tasks are transcription, assembly, and verification against a written spec. There is no
architecture to invent. Sonnet at medium is the right tool for that and it is roughly five times
cheaper per session — which matters across 41 of them.

**Use a stronger model for exactly three tasks**, where the work is genuinely hard rather than
merely careful:

```
  2.2   /solutions      master–detail with a real no-JS fallback
  4.4   masterdetail.ts scroll-sync without flicker
  5.4   copy-rules      judgement about whether a claim is gated
```

---

## The loop

```
  1  open a NEW session
  2  paste one prompt file, whole, from the "---" line down
  3  let it run to the exit condition
  4  read the report
  5  if STATUS is complete  → close the session, open the next
     if STATUS is partial   → new session, same prompt, paste the report first
     if STATUS is blocked   → read the blocker. It is usually real.
```

**One task, one session. Always.** Context spanning two tasks gets summarised, and a summary loses
exactly the coupling detail that causes defects — a token renamed in one place, a component's props
changed without its consumers.

**Do not paste two prompts into one session** even when both look small.

---

## The order

Strictly numeric. Every task assumes the previous one is done.

```
  BLOCK 0   0.1 → 0.6     foundation. Nothing renders until this is right.
  BLOCK 1   1.1 → 1.10    components. Every page is assembled from these.
  BLOCK 2   2.1 → 2.3     home, solutions, paper
                          ← THE SITE IS SHOWABLE TO A STRANGER HERE
  BLOCK 3   3.1 → 3.10    the other nine routes
  BLOCK 4   4.1 → 4.6     motion and forms, deliberately last
  BLOCK 5   5.1 → 5.6     verify, then deploy
```

**Two tasks carry the most risk. Slow down on both.**

**`0.6`** — the no-JS baseline. Get it wrong and every page built afterwards inherits a site that
renders blank for the buyer it was built for.

**`2.2`** — `/solutions`. Build the plain anchor list first, confirm it works, *then* add the
master–detail. If you let it build the interactive version first, the fallback becomes an
afterthought and it will not be a real page.

---

## Between sessions

Keep a running log. One line per task:

```
  0.1  complete   Astro 5.x pinned, tree matches
  0.2  complete   tokens diffed both directions
  0.3  partial    fonts placed, subsetting still to do
```

**When a report says `SURPRISES`, read it properly.** The instruction files were written on
2026-09-05 against a spec that will drift. When the code and a task file disagree, **the code
wins** — and the task file gets amended, in `instructions/`, before the next session runs.

---

## What a good report looks like

```
TOKENS      none
COPY        none
NO-JS       pass
```

**`TOKENS` and `COPY` should read `none` every single session.** Anything else is a Law 1 or Law 2
violation. Do not accept "I added one small colour" — that is how the identity drifted the first
time, and the fix is one line now versus twelve files later.

**If `NO-JS` fails, stop the whole run.** Do not proceed to the next task. It means a page was
built that does not work for the audience this site exists to reach, and every page after it will
inherit the same mistake.

---

## The four correct ways for a session to stop early

```
  a sentence is needed that does not exist in website/design/
  two sources conflict after the precedence order in instructions/README
  a gated claim is required to make a page work
  a token is needed that design/12 does not define
```

**All four are good outcomes.** A session that stops for one of these has found something the plan
missed. A session that improvises past one has introduced a defect you will find in Block 5, or
worse, after launch.

---

## The one thing to check yourself, not delegate

**Before Block 5, open the site in a browser with JavaScript disabled and read all twelve pages.**

Not because the model will lie — because this is the single property the whole build is organised
around, and it is worth one hour of your own eyes. Hospital, bank and defence networks block
scripts. If those pages are blank, the site does not exist for the people it was written for.
