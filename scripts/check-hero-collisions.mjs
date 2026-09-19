// THE HERO DIAGRAM MUST NOT OVERLAP ITSELF.
//
// WHY THIS EXISTS. The rings were tilted into three dimensions, and the tilt squashes
// y to 0.695 of itself while leaving x alone. Every offset that had been tuned on a
// flat circle therefore walked sideways instead of stepping clear: five of the six
// capability labels ended up printed across a feature chip, and the one on top sat
// over the crown of the core disc. None of that was visible in the code — the numbers
// still said "28px clear of the guide" — and all of it was obvious on screen.
//
// The placement is solved at build time now, against the same geometry. This checks
// the result in a real browser, because the solver estimates text width from the
// character count and only the browser knows what the font actually did.
//
// It also guards the thing that will break this next. The diagram is generated from
// data/features.ts and data/sectors.ts: an eighth feature, a sixth sector or a longer
// capability name all move the geometry, and the failure mode is a label quietly
// sitting on top of another one on the homepage.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));

let chromium;
try {
	({ chromium } = await import('playwright'));
} catch {
	console.log('  hero collisions: SKIPPED (playwright not installed)');
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
	if (!existsSync(p)) p += '.html';
	if (!existsSync(p)) { res.writeHead(404); return res.end('not found'); }
	res.writeHead(200, { 'Content-Type': MIME[extname(p)] ?? 'application/octet-stream' });
	res.end(readFileSync(p));
});
await new Promise((r) => server.listen(0, r));
const ORIGIN = `http://localhost:${server.address().port}`;

let browser;
try {
	browser = await chromium.launch();
} catch {
	console.log('  hero collisions: SKIPPED (no browser binary)');
	server.close();
	process.exit(0);
}

const page = await (await browser.newContext({ viewport: { width: 1600, height: 1000 } })).newPage();
await page.goto(`${ORIGIN}/`);
// The figure builds outward over ~3.2s and only then is at its final geometry.
await page.waitForTimeout(4200);

const probe = () => page.evaluate(() => {
	/* MEASURE THE INK, NOT THE GROUP. An orb's <g> holds the label, the anchor dot
	   that marks its true place on the shell, and — before the leaders were moved out
	   — the line joining the two. Its bounding box therefore spanned from the shell to
	   wherever the label had slid, which is not a thing anybody can see. Measured that
	   way this check reported four labels lying across the nucleus when what crossed
	   the nucleus was four hairlines. The label is the chip, the pill, or the
	   capability's text; that is what must not collide. */
	const grab = (sel, inkSel) => [...document.querySelectorAll(sel)]
		.filter((e) => parseFloat(getComputedStyle(e).opacity || '1') > 0.02)
		.map((e) => {
			const ink = inkSel ? e.querySelector(inkSel) : e;
			return { t: (e.textContent || '').trim(), b: (ink || e).getBoundingClientRect() };
		});
	const caps = grab('[data-orb="caps"]', '.hm-cap-text');
	const feats = grab('[data-orb="feat"]', '.hm-chip');
	const mkts = grab('[data-orb="mkt"]', '.hm-pill');
	const core = grab('.hm-core-disc');
	const all = [...caps, ...feats, ...mkts];

	const frac = (a, z) => {
		const w = Math.min(a.right, z.right) - Math.max(a.left, z.left);
		const h = Math.min(a.bottom, z.bottom) - Math.max(a.top, z.top);
		if (w <= 0 || h <= 0) return 0;
		return (w * h) / Math.min(a.width * a.height, z.width * z.height);
	};

	const stacked = [];
	for (let i = 0; i < all.length; i++) {
		for (let j = i + 1; j < all.length; j++) {
			const f = frac(all[i].b, all[j].b);
			if (f > 0.4) stacked.push(`${all[i].t} x ${all[j].t} (${Math.round(f * 100)}%)`);
		}
	}
	const onCore = [];
	for (const a2 of all) for (const c of core) {
		const w = Math.min(a2.b.right, c.b.right) - Math.max(a2.b.left, c.b.left);
		const h = Math.min(a2.b.bottom, c.b.bottom) - Math.max(a2.b.top, c.b.top);
		if (w > 6 && h > 6) onCore.push(`${a2.t} covers the nucleus`);
	}

	// A guard that can pass on an empty page is not a guard. The class names changed
	// once already when the figure was rewritten, and the old selectors matched
	// nothing and reported clean.
	const missing = [];
	if (caps.length + feats.length + mkts.length < 8) missing.push(`only ${all.length} labels found`);
	if (!core.length) missing.push('no nucleus found');
	/* NOTHING MAY BE HIDDEN. The figure used to solve crowding by deleting labels —
	   five of the eighteen at a typical angle, and because hovering stops the model,
	   whatever was hidden at that moment stayed hidden while the reader looked at it.
	   Labels move out of each other's way now, so the count is the whole point: all
	   eighteen are on screen at every angle, or this is not finished. */
	const drawn = [...document.querySelectorAll('[data-orb]')]
		.filter((e) => parseFloat(getComputedStyle(e).opacity || '1') > 0.02).length;
	const total18 = document.querySelectorAll('[data-orb]').length;
	if (drawn < total18) missing.push(`${total18 - drawn} of ${total18} labels are hidden`);

	return { stacked, onCore, missing };
});

/* SAMPLED ACROSS A ROTATION, NOT AT ONE INSTANT. The shells turn, and the labels
   now slide out of each other's way as they do, so a single frame proves nothing
   about the other three hundred and fifty-nine. A still frame is how an earlier
   pass of this file reported itself clean while the figure was visibly stacking
   labels on screen. Twelve moments spread over a full turn. */
const res = { stacked: [], onCore: [], missing: [] };
const seen = new Set();
for (let i = 0; i < 12; i++) {
	const r = await probe();
	for (const k of ['stacked', 'onCore', 'missing']) {
		for (const m of r[k]) {
			if (seen.has(m)) continue;
			seen.add(m);
			res[k].push(m);
		}
	}
	await page.waitForTimeout(340);
}

const total = Object.values(res).flat().length;
if (total) {
	console.log(`  hero collisions: ${total} OVERLAP${total === 1 ? '' : 'S'}`);
	for (const [k, v] of Object.entries(res)) for (const line of v) console.log(`    ${k}: ${line}`);
	await browser.close();
	server.close();
	process.exit(1);
}
console.log(`  hero model: ${'' }no stacked labels, nucleus clear`);
await browser.close();
server.close();
