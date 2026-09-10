"""dist/*.html -> site-content/*.md

A content mirror of the built site for agents, so nothing has to read the codebase to know
what the site says. Reads the BUILT html, not the source, so what lands here is exactly what
a visitor sees: data files are already interpolated and every template is already expanded.
"""
import os, re, glob, html, json
from bs4 import BeautifulSoup, NavigableString, Tag

OUT = 'site-content'
DROP_CLASS = {'faq-q-icon', 'accordion-icon', 'eyebrow-bullet', 'contact-form-honeypot',
              'nav-mobile', 'skip-link', 'reveal-sr'}

def inline(node):
    """Inline markup only. Links keep their href; decorative spans are dropped."""
    if isinstance(node, NavigableString):
        return re.sub(r'\s+', ' ', str(node))
    if not isinstance(node, Tag):
        return ''
    if node.name in ('script', 'style', 'svg', 'noscript'):
        return ''
    if set(node.get('class') or []) & DROP_CLASS:
        return ''
    # Adjacent element siblings with NO text node between them are a layout pattern — a label
    # span beside a value span — and concatenating them raw yields "AI TrainingIs this run
    # failing". Separate those, and only those: a <strong> inside a sentence always has text
    # nodes around it, so it is untouched.
    pieces, prev_was_styled = [], False
    for c in node.children:
        piece = inline(c)
        if not piece:
            continue
        styled = bool(isinstance(c, Tag) and c.name in ('span', 'div') and c.get('class'))
        if pieces and pieces[-1][-1:].isalnum() and piece[:1].isalnum():
            # A styled span that runs straight into what follows is a label ("Done when",
            # "AI Training"), so it takes a dash. Anything else just needs the missing space.
            pieces.append(' — ' if prev_was_styled else ' ')
        pieces.append(piece)
        prev_was_styled = styled
    inner = ''.join(pieces)
    if node.name in ('strong', 'b'):
        return f'**{inner.strip()}**' if inner.strip() else ''
    if node.name in ('em', 'i'):
        return f'*{inner.strip()}*' if inner.strip() else ''
    if node.name == 'code':
        return f'`{inner.strip()}`' if inner.strip() else ''
    if node.name == 'a':
        href, t = node.get('href', ''), inner.strip()
        if not t:
            return ''
        return f'[{t}]({href})' if href and not href.startswith('#') else t
    if node.name == 'br':
        return ' '
    return inner

def txt(node):
    return re.sub(r'[ \t]+', ' ', inline(node)).strip()

def blocks(node, out, depth=0):
    """Walk block-level structure, appending markdown blocks to `out`."""
    for el in node.children:
        if isinstance(el, NavigableString):
            t = re.sub(r'\s+', ' ', str(el)).strip()
            if t:
                out.append(t)
            continue
        if not isinstance(el, Tag) or el.name in ('script', 'style', 'svg', 'noscript'):
            continue
        cls = set(el.get('class') or [])
        if cls & DROP_CLASS:
            continue

        # --- the two interactive patterns, flattened to question + answer ---------------
        if el.name == 'details':
            q = el.find('summary')
            qt = txt(q.find(class_='faq-q-text') or q) if q else ''
            if qt:
                out.append(f'#### {qt}')
            body = el.find(class_='faq-a') or el
            for c in body.children:
                if isinstance(c, Tag) and c is not q:
                    blocks(BeautifulSoup(str(c), 'html.parser'), out, depth)
            continue
        if 'accordion-item' in cls:
            q = el.find(class_='accordion-question')
            if q:
                out.append(f'#### {txt(q)}')
            ans = el.find(class_='accordion-answer')
            if ans:
                blocks(ans, out, depth)
            continue

        # --- eyebrows become small labels rather than headings -------------------------
        if 'eyebrow' in cls:
            t = txt(el)
            if t:
                out.append(f'**{t}**')
            continue

        if el.name in ('h1', 'h2', 'h3', 'h4', 'h5', 'h6'):
            t = txt(el)
            if t:
                out.append('#' * min(int(el.name[1]) + 1, 6) + ' ' + t)
            continue
        if el.name == 'p':
            t = txt(el)
            if t:
                out.append(t)
            continue
        if el.name in ('ul', 'ol'):
            # A simple <li> is one line. A card <li> — the application and licence-tier lists
            # are built as list items holding headings, paragraphs and definition lists — has
            # to keep that structure, or it flattens into one unreadable run of prose.
            items = []
            for i, li in enumerate(el.find_all('li', recursive=False), 1):
                marker = f'{i}. ' if el.name == 'ol' else '- '
                if li.find(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'dl', 'ul', 'ol']):
                    sub = []
                    blocks(li, sub, depth + 1)
                    sub = [b for b in (x.strip() for x in sub) if b]
                    if not sub:
                        continue
                    items.append(marker + sub[0])
                    for b in sub[1:]:
                        items.append('\n'.join('  ' + ln for ln in b.split('\n')))
                else:
                    t = txt(li)
                    if t:
                        items.append(marker + t)
            if items:
                out.append('\n\n'.join(items))
            continue
        if el.name == 'dl':
            rows = []
            term = None
            for c in el.find_all(['dt', 'dd'], recursive=True):
                if c.name == 'dt':
                    term = txt(c)
                else:
                    v = txt(c)
                    if term or v:
                        rows.append(f'- **{term or ""}** — {v}' if term else f'- {v}')
                    term = None
            if rows:
                out.append('\n'.join(rows))
            continue
        if el.name == 'figcaption':
            t = txt(el)
            if t:
                out.append(f'> {t}')
            continue
        if el.name == 'table':
            out.append(txt(el))
            continue
        if el.name in ('label',):
            t = txt(el)
            if t:
                out.append(f'- Field: {t}')
            continue
        if el.name == 'a':
            # Card links wrap a whole block of content (the sector index is five of them).
            # Flattening those loses the heading and the figure caption, so recurse and hang
            # the destination off the end instead.
            if el.find(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'dl', 'ul', 'ol', 'figure']):
                sub = []
                blocks(el, sub, depth + 1)
                out.extend(b for b in (x.strip() for x in sub) if b)
                href = el.get('href', '')
                if href and not href.startswith('#'):
                    out.append(f'→ [{href}]({href})')
            else:
                t = inline(el).strip()
                if t:
                    out.append(t)
            continue
        if el.name in ('button', 'input', 'textarea', 'select', 'option'):
            continue
        blocks(el, out, depth + 1)

def page(f):
    raw = open(f).read()
    soup = BeautifulSoup(raw, 'html.parser')
    title = soup.title.get_text(strip=True) if soup.title else ''
    d = soup.find('meta', attrs={'name': 'description'})
    desc = d.get('content', '') if d else ''
    for t in soup(['nav', 'footer', 'script', 'style', 'svg', 'noscript']):
        t.decompose()
    main = soup.find('main') or soup.body
    out = []
    if main:
        blocks(main, out)
    # collapse runs of duplicates the templates create (a heading echoed as a card label)
    clean, prev = [], None
    for b in out:
        b = b.strip()
        # Decorative glyphs (chevrons, arrows, bullets) are their own spans in the markup and
        # carry no content once the styling is gone.
        if re.fullmatch(r'[\s→↗←▪▾▸●○·×+—–\-*/|]{0,4}', b):
            continue
        if b and b != prev:
            clean.append(b)
            prev = b
    return title, desc, clean

routes = {}
for f in sorted(glob.glob('dist/**/*.html', recursive=True)):
    url = f[len('dist/'):].replace('/index.html', '').replace('.html', '')
    url = '/' if url in ('index', '') else '/' + url
    routes[url] = page(f)

os.makedirs(OUT, exist_ok=True)
NAMES = {'/': 'home'}
written = []
for url, (title, desc, body) in sorted(routes.items()):
    rel = NAMES.get(url, url.lstrip('/'))
    path = os.path.join(OUT, rel + '.md')
    os.makedirs(os.path.dirname(path), exist_ok=True)
    words = sum(len(b.split()) for b in body)
    head = [f'# {title.split(" — ")[0].split(" · ")[0] if " — " in title or " · " in title else title}',
            '', f'- **URL:** `{url}`', f'- **Page title:** {title}',
            f'- **Meta description:** {desc}', '', '---', '']
    open(path, 'w').write('\n'.join(head) + '\n\n'.join(body) + '\n')
    written.append((url, path, words))
    print(f'{words:>6}w  {path}')

print(f'\n{len(written)} files, {sum(w for _,_,w in written)} words total')
