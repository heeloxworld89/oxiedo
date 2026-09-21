// NOTHING MAY RUN PAST THE RIGHT EDGE OF A PHONE.
//
// WHY THIS EXISTS, AND WHY IT LOOKS ODD. base.css carries a deliberate last-resort
// guard:
//
//     html, body { overflow-x: clip; }
//
// It was added after one 13px monospace block widened /about past a phone viewport
// and the browser scaled the whole page down to fit. It works. But it has a second
// effect nobody asked for: it makes horizontal overflow UNDETECTABLE, and it makes
// the overflowing content INVISIBLE rather than merely awkward.
//
//   · `document.documentElement.scrollWidth` can never exceed `clientWidth` under it,
//     so the obvious test for overflow always passes.
//   · Every element gains a clipping ancestor, so "is this element clipped by a
//     scroll container?" — the usual way to excuse a wide element — is true of
//     everything, and an element-by-element sweep also reports nothing.
//   · Content that runs past the edge is not scrolled to, it is CUT OFF. A real
//     instance was found this way: the breadcrumb on /sectors/defense-safety-critical
//     rendered 40px past a 320px viewport, and those 40px were silently amputated.
//     The page looked fine. The word did not finish.
//
// So the guard converts a visible bug into an invisible one. The site keeps it,
// because it is a genuine safety net and removing it is the owner's call, not this
// script's. What this script does instead is take the mask off AT TEST TIME —
// `overflow-x: visible !important`, injected before measurement — so the build can
// see what a visitor's browser would have had to deal with without the net.
//
// A failure here does NOT mean the live site is visibly broken today; the guard will
// still hide it from a visitor. It means content is being clipped away, or is one
// removed guard away from wrecking a page. Both are worth failing a build over.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(
	new URL(process.env.OVERFLOW_DIST ? process.env.OVERFLOW_DIST.replace(/\/?$/, '/') : '../dist/',
		process.env.OVERFLOW_DIST ? new URL('../', import.meta.url) : import.meta.url),
);

let chromium;
try {
	({ chromium } = await import('playwright'));
} catch {
	console.log('  mobile overflow: SKIPPED (playwright not installed)');
	process.exit(0);
}
if (!existsSync(DIST)) {
	console.log('  mobile overflow: SKIPPED (no build at ' + DIST + ')');
	process.exit(0);
}

const MIME = {
	'.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
	'.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml',
	'.png': 'image/png', '.ico': 'image/x-icon', '.xml': 'application/xml', '.txt': 'text/plain',
};

const server = createServer((req, res) => {
	let p = join(DIST, decodeURIComponent(req.url.split('?')[0]));
	if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html');
	if (!existsSync(p)) { res.writeHead(404); return res.end('not found'); }
	res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' });
	res.end(readFileSync(p));
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;

const walk = (dir, base = '') =>
	readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
		e.isDirectory() ? walk(join(dir, e.name), base + '/' + e.name)
			: e.name === 'index.html' ? [base + '/'] : []);
const pages = walk(DIST).sort();

// 320 is the narrowest phone still in the wild; 390 is the modern median. A width
// between them cannot fail while both pass — the failures this catches are fixed
// pixel widths, which bite hardest at the smallest viewport.
const WIDTHS = [
	{ width: 320, height: 568 },
	{ width: 390, height: 844 },
];

const browser = await chromium.launch();
const failures = [];

for (const vp of WIDTHS) {
	const ctx = await browser.newContext({ viewport: vp, hasTouch: true, isMobile: true });
	// Take the net away, before the page paints.
	await ctx.addInitScript(() => {
		addEventListener('DOMContentLoaded', () => {
			const s = document.createElement('style');
			s.textContent = 'html,body{overflow-x:visible !important}';
			document.head.appendChild(s);
		});
	});

	for (const url of pages) {
		const page = await ctx.newPage();
		await page.goto(`http://localhost:${port}${url}`, { waitUntil: 'load' });
		await page.waitForTimeout(500);
		const found = await page.evaluate(() => {
			const vw = document.documentElement.clientWidth;
			const wide = [];
			for (const el of document.querySelectorAll('body *')) {
				const cs = getComputedStyle(el);
				if (cs.display === 'none' || cs.visibility === 'hidden') continue;
				if (!el.getClientRects().length) continue;
				const r = el.getBoundingClientRect();
				if (r.width === 0 && r.height === 0) continue;
				if (r.right <= vw + 1) continue;
				// A fixed element is positioned against the viewport and is not page flow.
				if (cs.position === 'fixed') continue;
				// An ancestor that scrolls sideways ON PURPOSE (a wide table, a chart) is
				// the intended pattern, not a defect. `body` is excluded from this walk:
				// under the guard it would otherwise excuse every element on the page.
				let excused = false;
				for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
					if (/auto|scroll|hidden|clip/.test(getComputedStyle(p).overflowX)) { excused = true; break; }
				}
				if (excused) continue;
				const name = el.tagName.toLowerCase() +
					(typeof el.className === 'string' && el.className.trim()
						? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
				wide.push(`${name} right=${Math.round(r.right)}`);
			}
			return { over: Math.max(0, document.documentElement.scrollWidth - vw), wide: [...new Set(wide)] };
		});
		if (found.over > 0 || found.wide.length) {
			failures.push(`${vp.width}px ${url} — ` +
				(found.over ? `page scrolls +${found.over}px; ` : '') +
				found.wide.slice(0, 4).join(', ') +
				(found.wide.length > 4 ? ` (+${found.wide.length - 4} more)` : ''));
		}
		await page.close();
	}
	await ctx.close();
}

await browser.close();
server.close();

if (failures.length) {
	console.log('  mobile overflow: FAILED');
	for (const f of failures) console.log('    - ' + f);
	process.exit(1);
}
console.log(`  mobile overflow: ok (${pages.length} pages x ${WIDTHS.length} widths, guard lifted)`);
