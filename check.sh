#!/usr/bin/env bash
# Run after every block. Thirty seconds. Catches the two failures that compound.
set -uo pipefail
cd "$(dirname "$0")"
FAIL=0

echo "── 1 · HARDCODED VALUES OUTSIDE tokens.css  (Law 2) ─────────────────"
HITS=$(grep -rn "#[0-9A-Fa-f]\{6\}\|#[0-9A-Fa-f]\{3\}\b" src/ 2>/dev/null \
       | grep -v "src/styles/tokens.css" | grep -v "^\s*//" || true)
if [ -n "$HITS" ]; then echo "$HITS"; FAIL=1; else echo "  clean"; fi

echo
echo "── 2 · GATED COPY IN BUILT OUTPUT  (Law 7) ──────────────────────────"
if [ -d dist ]; then
  HITS=$(grep -rniE "before the global loss|before the loss curve moves|regulator.ready|submission.grade|certified deletion is available|in use with a design partner|state of the art" dist/ || true)
  if [ -n "$HITS" ]; then echo "$HITS"; FAIL=1; else echo "  clean"; fi
else echo "  no dist/ yet — run after a build"; fi

echo
echo "── 3 · THIRD-PARTY REQUESTS  (01_STACK) ─────────────────────────────"
if [ -d dist ]; then
  HITS=$(grep -rn "https\?://" dist/ --include="*.html" --include="*.css" 2>/dev/null \
         | grep -vE "schema.org|w3.org|oxiedo" || true)
  if [ -n "$HITS" ]; then echo "$HITS"; FAIL=1; else echo "  clean"; fi
else echo "  no dist/ yet"; fi

echo
echo "── 4 · UNCONDITIONAL HIDDEN REVEALS  (Law 3) ────────────────────────"
HITS=$(grep -rn "^\s*\.reveal\s*{" src/styles/ 2>/dev/null -A3 | grep "opacity:\s*0" || true)
if [ -n "$HITS" ]; then echo "  .reveal hides without a .js guard:"; echo "$HITS"; FAIL=1; else echo "  clean"; fi

echo
echo "── 4b · PREMATURELY LINKED ROUTES ───────────────────────────────────"
if [ -d dist ]; then
  HITS=$(grep -rn 'href="/data"\|href="/press"' dist/ --include="*.html" || true)
  if [ -n "$HITS" ]; then
    echo "  /data or /press is linked. Both must stay unlinked:"
    echo "    /data  — until the solicitor review in design/14"
    echo "    /press — until first outreach"
    echo "$HITS"; FAIL=1
  else echo "  clean"; fi
else echo "  no dist/ yet"; fi

echo
echo "── 5 · UNCOMMITTED WORK ─────────────────────────────────────────────"
if [ -d .git ]; then
  git status --short | head -20
  [ -z "$(git status --short)" ] && echo "  clean"
else echo "  NOT A GIT REPO — task 0.1 was not completed correctly"; FAIL=1; fi

echo
[ "$FAIL" -eq 0 ] && echo "✓ ALL CLEAR" || echo "✗ FAILURES ABOVE — fix before the next block"
exit $FAIL
