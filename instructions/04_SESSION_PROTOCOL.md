# 04 — Session Protocol

> How one build session runs. Paste the standing prompt, do the task, meet the exit condition,
> report, stop.

---

## The standing prompt

Paste this at the start of every session, with the task filled in:

```
  Building the Oxiedo website. Task: <BLOCK>.<N>

  Read first, in this order, in this session:
    1.  instructions/00_ENGINEERING_LAWS.md
    2.  instructions/02_DESIGN_CONTRACT.md
    3.  the task's own file — instructions/BLOCK_<n>_*.md, the task section
    4.  every source named in that task's "read first" list

  Do not carry a belief about a file's contents from a previous session.
  Re-read it.

  Build only this task. Stop at its exit condition. Report back in the
  format at the end of the task.
```

---

## One task, one session

Context that spans two tasks is context that has been summarised, and a summary loses exactly the
coupling detail that causes defects — a token renamed in one place, a component's props changed
without its consumers.

**If a task turns out to be two tasks, say so and split it.** Do not do both.

---

## The order within a session

```
  1  READ      the sources. All of them. Before writing anything.
  2  CONFIRM   restate what the task builds and what it does not.
               If that restatement is wrong, the session stops here.
  3  BUILD     the task, and nothing adjacent to it.
  4  VERIFY    the exit condition, demonstrated — not asserted.
  5  A11Y      the block's accessibility check. Law 6.
  6  NO-JS     disable JavaScript. Load the page. Law 3.
  7  REPORT    the format below.
```

**Steps 5 and 6 are not optional and not deferred to Block 5.** Block 5 verifies what was already
true; it does not make it true.

---

## When the task file and reality disagree

**The code wins. The task file is wrong and must be amended.**

These task files were written on 2026-09-05 against a design system that will change. When a task
says a component takes three props and the design now needs four:

```
  1.  report the divergence
  2.  amend the task file
  3.  then proceed
```

**Do not silently build the thing the task did not describe.** That is how a plan stops being a
plan.

---

## The report format

```
  TASK        <BLOCK>.<N> — <name>
  STATUS      complete | partial | blocked
  FILES       created and modified, with line counts
  TOKENS      any --var used that is not in tokens.css   ← should be none
  COPY        any string placed that is not from design/  ← should be none
  EXIT        the exit condition, and how it was demonstrated
  A11Y        keyboard · focus · labels · contrast — pass/fail each
  NO-JS       loaded with scripts disabled: pass | fail
  SURPRISES   anything the task file got wrong
  NEXT        <BLOCK>.<N+1>
```

**`TOKENS` and `COPY` should read "none" every session.** A non-empty line in either is a Law 1 or
Law 2 violation and it gets fixed before the session ends, not logged for later.

---

## What ends a session early

```
  ✗  a needed sentence does not exist in design/        → content gap, ask
  ✗  two sources conflict after README's precedence     → report, do not resolve
  ✗  a gated claim is required to make a page work      → the page is wrong
  ✗  a token is needed that design/12 does not define   → amend design/12 first
```

**All four are correct outcomes.** A session that stops for one of these has found something the
plan missed, which is more valuable than a session that improvised past it.
