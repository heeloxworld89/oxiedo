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
const res = await page.evaluate(() => {
	const grab = (sel) => [...document.querySelectorAll(sel)]
		.filter((e) => parseFloat(getComputedStyle(e).opacity || '1') > 0.02)
		.map((e) => ({ t: (e.textContent || '').trim(), b: e.getBoundingClientRect() }));
	const caps = grab('[data-orb="caps"]');
	const feats = grab('[data-orb="feat"]');
	const mkts = grab('[data-orb="mkt"]');
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

	return { stacked, onCore, missing };
});

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
