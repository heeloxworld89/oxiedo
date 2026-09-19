// THE HERO FIGURE HAS TO RENDER, AND ALL EIGHTEEN NAMES HAVE TO BE THERE.
//
// WHY THIS EXISTS, AND WHY IT REPLACED THE COLLISION CHECK. The figure used to orbit
// eighteen labels around a disc, and the old guard's whole job was proving they did
// not land on top of each other — a job it did by sampling twelve moments of a
// rotation, because the answer was different at every angle. The names are in three
// rows of a grid now, so they cannot collide: that check has nothing left to test.
//
// What can still break is different, and this tests that instead:
//
//   1. A name goes missing. The rows are generated from data/features.ts and
//      data/sectors.ts; an eighth feature or a renamed capability changes the counts,
//      and a chip that fails to render is a product page with no way in.
//   2. The object renders as a black blob. The ring paths are built in JavaScript,
//      and Astro scopes component CSS by stamping a data-astro-cid attribute on the
//      elements IT renders — a path from createElementNS never gets one, so a scoped
//      `fill: none` does not reach it, and an SVG path with no fill is black. That is
//      exactly what shipped once.
//   3. The object stops moving, or never starts.
//   4. Something runs past the edge of the page.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));

let chromium;
try {
	({ chromium } = await import('playwright'));
} catch {
	console.log('  hero figure: SKIPPED (playwright not installed)');
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
	console.log('  hero figure: SKIPPED (no browser binary)');
	server.close();
	process.exit(0);
}

const fails = [];

for (const vp of [
	{ width: 1600, height: 1000 }, { width: 1180, height: 820 },
	{ width: 900, height: 780 }, { width: 390, height: 844 },
]) {
	const tag = `${vp.width}x${vp.height}`;
	const page = await (await browser.newContext({ viewport: vp })).newPage();
	const errors = [];
	page.on('pageerror', (e) => errors.push(String(e)));
	await page.goto(`${ORIGIN}/`);
	await page.waitForTimeout(1600);

	const res = await page.evaluate(() => {
		const chips = [...document.querySelectorAll('.hm-chip')];
		const box = (e) => e.getBoundingClientRect();
		const shown = chips.filter((c) => {
			const r = box(c);
			return r.width > 8 && r.height > 8 && parseFloat(getComputedStyle(c).opacity || '1') > 0.05;
		});
		// A grid cannot stack, but assert it rather than assume it.
		const stacked = [];
		for (let i = 0; i < shown.length; i++) {
			for (let j = i + 1; j < shown.length; j++) {
				const a = box(shown[i]); const b = box(shown[j]);
				const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
				const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
				if (w > 2 && h > 2) stacked.push(`${shown[i].textContent.trim()} x ${shown[j].textContent.trim()}`);
			}
		}
		const rings = [...document.querySelectorAll('.hm-ring')].filter((r) => r.style.display !== 'none');
		const filled = rings.filter((r) => {
			const f = getComputedStyle(r).fill;
			return f && f !== 'none' && !f.startsWith('rgba(0, 0, 0, 0)');
		});
		const rim = document.querySelector('.hm-rim');
		return {
			chips: chips.length,
			shown: shown.length,
			stacked,
			rings: rings.length,
			ringsWithD: rings.filter((r) => (r.getAttribute('d') || '').length > 20).length,
			ringsFilled: filled.length,
			rimVisible: !!rim && box(rim).width > 40,
			docW: document.documentElement.scrollWidth,
			winW: window.innerWidth,
		};
	});

	if (res.chips !== 18) fails.push(`${tag}: ${res.chips} chips in the rows, expected 18`);
	if (res.shown !== res.chips) fails.push(`${tag}: ${res.chips - res.shown} of ${res.chips} names are not drawn`);
	for (const s of res.stacked) fails.push(`${tag}: names overlap — ${s}`);
	if (res.rings < 3) fails.push(`${tag}: ${res.rings} ring segments drawn, expected at least 3`);
	if (res.ringsWithD !== res.rings) fails.push(`${tag}: a ring segment has no path data`);
	if (res.ringsFilled) fails.push(`${tag}: ${res.ringsFilled} ring segments are filled — they must be stroke only`);
	if (!res.rimVisible) fails.push(`${tag}: the body has no edge`);
	if (res.docW > res.winW) fails.push(`${tag}: the page scrolls sideways (${res.docW} > ${res.winW})`);

	// It has to be moving, and still be moving after someone has poked at it.
	const ringD = () => page.evaluate(() =>
		(document.querySelector('.hm-ring--front')?.getAttribute('d') || '').slice(0, 60));
	const a = await ringD();
	await page.waitForTimeout(500);
	if (await ringD() === a) fails.push(`${tag}: the object is not moving`);

	const chip = page.locator('.hm-chip').first();
	if (await chip.count()) {
		await chip.hover();
		await page.waitForTimeout(250);
		const b = await ringD();
		await page.waitForTimeout(500);
		if (await ringD() === b) fails.push(`${tag}: the object stopped when a name was hovered`);
	}

	for (const e of errors.slice(0, 2)) fails.push(`${tag}: page error — ${e}`);
	await page.close();
}

await browser.close();
server.close();

if (fails.length) {
	console.error('  hero figure: FAILED');
	for (const f of fails) console.error(`    - ${f}`);
	process.exit(1);
}
console.log('  hero figure: all 18 names drawn, object renders and moves (four widths)');
