# 0.1 — Project skeleton

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

**Law 8 — stop at the exit condition.** Do not continue into the next task because it looks small.

## Read these first, in this order, in this session

1. `Oxiedo Website Codebase/instructions/01_STACK.md`
2. `Oxiedo Website Codebase/instructions/05_FILE_ARCHITECTURE.md`
3. `Oxiedo Website Codebase/instructions/00_ENGINEERING_LAWS.md`

**Do not carry a belief about any file's contents from a previous session. Re-read it.**

## Build

- Initialise Astro inside `Oxiedo Website Codebase/`, TypeScript `strict`, **static output** (not SSR).
- **Pin the Astro version exactly.** Record the pinned version back into `instructions/01_STACK.md` when done.
- Create every directory and every **empty** file listed in `05_FILE_ARCHITECTURE.md §The tree`. All of them, now, so the shape of the work is visible.
- `.gitignore` covering `node_modules`, `dist`, `.env`, `.astro`.
- **`git init` inside `Oxiedo Website Codebase/`, and make the first commit.** Every task from here
  commits exactly once, message `<num> <title>` — e.g. `0.4 reset and base`. Every block end gets a
  tag: `block-0-complete`. This is the rollback story for the whole build; without it a session that
  breaks something built three tasks ago costs an archaeology session instead of a `git diff`.

## Do not

- Do not install Tailwind, any CSS framework, or any component library. `01_STACK.md` rejects them explicitly and gives the reasons.
- Do not write any CSS or any page content yet.
- Do not add analytics, a cookie banner, or any third-party script.

## Exit condition

`npm run build` succeeds and emits a `dist/` containing one empty HTML page. The directory tree matches `05_FILE_ARCHITECTURE.md` exactly — no extra directories, none missing. State the pinned Astro version.

**Then commit.** One commit, message `0.1 project skeleton`. Nothing else in it.

## Report back in exactly this format

```
TASK        0.1 — Project skeleton
STATUS      complete | partial | blocked
FILES       created and modified, with line counts
TOKENS      any --var used that is not in tokens.css        (should be: none)
COPY        any string placed that is not from website/design/  (should be: none)
EXIT        the exit condition, and how you demonstrated it
A11Y        keyboard · focus · labels · contrast — pass/fail each
NO-JS       loaded with scripts disabled: pass | fail
SURPRISES   anything the task file got wrong
NEXT        0.2
```

**Stop here. Do not begin 0.2.**
