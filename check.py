#!/usr/bin/env python3
"""Structural CSS audits for this site. Run after any stylesheet change.

Three checks, each written after a real bug shipped:
  1. unstyled classes   — a class in the built HTML with no rule anywhere
  2. specificity        — `.parent tag` out-specifying a class on the same node
  3. container conflict — a class sharing an element with .container that widens past it
"""
import re, glob, sys

# Legitimately carry no rules of their own. Three kinds:
#   · grouping / animation hooks         (hv-*, ftable-id, application-body)
#   · section hooks whose styling comes  (get-in-touch, closing, proof — the band/section
#     entirely from co-applied classes    classes beside them do the work)
#   · base classes whose modifiers carry  (tech-bar -> tech-bar--ormas / --base)
#     everything
WRAPPERS = {
 'hv-caps','hv-entries','hv-feats','hv-guides','hv-matrix','hv-mkts','nav-logo','sector-graphic-art',
 'ftable-id','ftable-intro','ftable-does','ledger-cost','evidence-split-intro','application-body',
 'page-banner--ink','form-field-input--default','accordion-question','capability-step-body',
 'contact-intro','role-card-head','invest-request-copy','market-row-main','feature-row-main',
 'product-licence','licence-split-card--open','licensing-band--l0','licensing-band--l1',
 'licensing-band--l2','licensing-band--l3','surface-label','mk-section--lit',
 'detail-main','detail-rail','detail-layout','mk-intro',
 'get-in-touch','closing','proof','hv-core','tech-bar','dh-term',
 'faq-body','faq-closing','iv-close','iv-thesis-body',
 'hv-cost','hv-result','hero-fig-ask'}

css = ''.join(open(f).read() for f in glob.glob('src/styles/*.css'))
for f in glob.glob('src/**/*.astro', recursive=True):
    for blk in re.findall(r'<style[^>]*>(.*?)</style>', open(f).read(), re.S):
        css += blk
pages = [p for p in sorted(glob.glob('dist/**/*.html', recursive=True)) if 'paper' not in p]
allhtml = ''.join(open(f).read() for f in pages)
fail = 0

# 1 ── unstyled
bad = 0
for page in pages:
    used = {c for m in re.findall(r'class="([^"]+)"', open(page).read()) for c in m.split()}
    # Word-boundary, not substring. '.press-prose' is a substring of '.press-prose-note', so a
    # plain `in` test passed a class that had no rule of its own.
    miss = sorted(c for c in used
                  if not re.search(r'\.' + re.escape(c) + r'(?![\w-])', css)
                  and c not in WRAPPERS)
    if miss:
        bad += 1; print(f"  UNSTYLED {page}: {', '.join(miss)}")
print("1. unstyled classes  :", "clean" if not bad else f"{bad} pages"); fail += bad

# 2 ── specificity
cx = re.sub(r'/\*.*?\*/', '', open('src/styles/components.css').read(), flags=re.S)
er, cr = {}, {}
for sel, body in re.findall(r'([^{}]+)\{([^}]*)\}', cx):
    for s2 in (x.strip() for x in sel.split(',')):
        props = {p.split(':')[0].strip() for p in body.split(';') if ':' in p}
        m = re.fullmatch(r'(\.[\w-]+)\s+(p|h1|h2|h3|h4|span|a|li|div|dd|dt|cite)', s2)
        if m: er.setdefault((m.group(1), m.group(2)), set()).update(props)
        if re.fullmatch(r'\.[\w-]+', s2): cr.setdefault(s2[1:], set()).update(props)
# CONTAINMENT, rewritten. This was a single regex whose gap ran between the parent class and the
# child: `(?:(?!</).){0,4000}?` matches any character that is NOT the start of a closing tag, so
# the moment ANY nested element closed — a `</label>`, a `</span>` — the match died and the pair
# was skipped as "not nested". That is why `.car-apply p` beating `.form-field-hint` shipped with
# this audit reporting clean: the hint sits after a `</label>`, two elements deep.
# Now it walks the parent element to its actual matching close tag and searches inside it.
_TAG = re.compile(r'<(/?)(\w+)([^>]*?)(/?)>')
_VOID = {'br','img','input','hr','meta','link','source','track','wbr','col','area','base','embed'}

def _contains(parent_cls, child_tag, child_cls):
    """True if any element carrying parent_cls encloses a <child_tag class=child_cls>."""
    for om in re.finditer(r'<(\w+)[^>]*class="[^"]*\b' + re.escape(parent_cls) + r'\b[^"]*"[^>]*>', allhtml):
        ptag, i, depth = om.group(1), om.end(), 1
        if ptag in _VOID: continue
        while depth > 0:
            m = _TAG.search(allhtml, i)
            if not m: break
            i = m.end()
            closing, tname, attrs, selfclose = m.group(1), m.group(2), m.group(3), m.group(4)
            if closing:
                if tname == ptag: depth -= 1
                continue
            if tname in _VOID or selfclose: 
                pass
            elif tname == ptag:
                depth += 1
            if (tname == child_tag and re.search(r'class="[^"]*\b' + re.escape(child_cls) + r'\b', attrs)):
                return True
        # only the first occurrence is walked per parent match; loop continues to the next
    return False

tag_of = {}
for tag, cls in re.findall(r'<(\w+)[^>]*class="([^"]+)"', allhtml):
    for c in cls.split(): tag_of.setdefault(c, set()).add(tag)
hits = []
for (parent, tag), ep in er.items():
    pn = parent[1:]
    for cn, cp in cr.items():
        if cn == pn or tag not in tag_of.get(cn, ()): continue
        if not _contains(pn, tag, cn): continue
        if ep & cp: hits.append(f"  SPECIFICITY {parent} {tag} beats .{cn} on {', '.join(sorted(ep & cp))}")
print("2. specificity       :", "clean" if not hits else f"{len(hits)} clashes")
for h in hits: print(h)
fail += len(hits)

# 3 ── container conflict: a class sharing an element with .container that overrides its
#      max-width. Both are (0,1,0), so whichever is later in source wins — which means the
#      outcome depends on file order rather than on intent, in either direction:
#        WIDER  (%, vw, none) kills the auto margins and runs the block to the viewport edge.
#        NARROWER (a px/rem/ch value under the container's own 1280px floor) silently clamps
#        the whole page into a ribbon. This is how .press-page { max-width: 700px } held every
#        section on /press at 700px inside a 1680px container until 2026-09-08.
#      The original check only tested the first kind, so the second shipped.
rules = {}
for sel, body in re.findall(r'([^{}]+)\{([^}]*)\}', re.sub(r'/\*.*?\*/', '', css, flags=re.S)):
    for s2 in (x.strip() for x in sel.split(',')):
        if re.fullmatch(r'\.[\w-]+', s2):
            for d in body.split(';'):
                if ':' in d:
                    k, v = (x.strip() for x in d.split(':', 1))
                    if k == 'max-width': rules.setdefault(s2[1:], []).append(v)
siblings = set()
for f in pages:
    for cls in re.findall(r'class="([^"]*\bcontainer\b[^"]*)"', open(f).read()):
        siblings.update(c for c in cls.split() if c != 'container')
conf = []
CONTAINER_MIN_PX = 1280  # .container's narrowest tier, layout.css

def _px(v):
    m = re.fullmatch(r'([\d.]+)(px|rem|ch)', v.strip())
    if not m: return None
    n, unit = float(m.group(1)), m.group(2)
    return n if unit == 'px' else n * (16 if unit == 'rem' else 8)

for c in sorted(siblings):
    for v in rules.get(c, []):
        if v.endswith('%') or v == 'none' or 'vw' in v:
            conf.append(f"  CONTAINER .{c} sets max-width:{v} — wider than .container, kills centring")
        else:
            px = _px(v)
            if px is not None and px < CONTAINER_MIN_PX:
                conf.append(
                    f"  CONTAINER .{c} sets max-width:{v} (~{int(px)}px) — narrower than .container's "
                    f"{CONTAINER_MIN_PX}px floor, clamps the whole block. Put the reading measure on "
                    f"the prose inside it, not on the container element.")
print("3. container conflict:", "clean" if not conf else f"{len(conf)} conflicts")
for c in conf: print(c)
fail += len(conf)

print("\nRESULT:", "all clean" if fail == 0 else f"{fail} issue(s)")
sys.exit(1 if fail else 0)
