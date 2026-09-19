// EVERY LABEL IN THE HERO MUST OPEN ITS OWN PANEL, ON SCREEN.
//
// WHY THIS EXISTS. The labels are clickable and each one opens a small anchored
// panel explaining that feature, sector or capability. Three separate things broke
// that, none of them visible in the source:
//
//   1. A popover is promoted into the TOP LAYER, where position resolves against the
//      viewport and not against the figure the markup sits in. Figure-relative
//      coordinates were therefore off by however far down the page the hero was, and
//      panels opened below the fold while looking perfectly correct in the DOM.
//   2. A capability is a 4.5px dot with a line of text above it. An SVG group does
//      not catch a pointer in the gap between its children, so a click on the middle
//      of the group passed through to the page and opened nothing.
//   3. Dragging to turn the model captures the pointer, and a captured pointer
//      swallows the click — or, the other way round, a sloppy drag opened a panel
//      when the visitor meant to rotate.
//
// So this clicks a real label in a real browser at four widths and checks that
// exactly one panel opens, that it is the right one, that it is fully on screen,
// that Escape closes it, and that a drag does not open anything.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));

let chromium;
try {
	({ chromium } = await import('playwright'));
} catch {
	console.log('  hero panels: SKIPPED (playwright not installed)');
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
	console.log('  hero panels: SKIPPED (no browser binary)');
	server.close();
	process.exit(0);
}

const OPEN = '.hm-panel:popover-open, .hm-panel.is-open';
const fails = [];

// Reading a label off a turning model is a moving target, and Playwright's own
// "wait until it stops moving" never returns on something that turns forever.
// Hovering a label stops the spin — that is how the model behaves for a visitor
// too — so hover it, then confirm it has actually come to rest before clicking.
const settle = async (page, sel) => {
	const read = () => page.evaluate((s) => {
		const n = document.querySelector(s);
		if (!n) return null;
		const r = n.getBoundingClientRect();
		return {
			x: r.x, y: r.y, w: r.width, h: r.height,
			op: parseFloat(getComputedStyle(n).opacity || '1'),
			onScreen: r.top > 0 && r.bottom < window.innerHeight,
		};
	}, sel);
	for (let i = 0; i < 10; i++) {
		const a = await read();
		if (!a || a.w < 2) return null;
		await page.mouse.move(a.x + a.w / 2, a.y + a.h / 2);
		await page.waitForTimeout(220);
		const b = await read();
		if (b && Math.abs(b.x - a.x) < 1 && Math.abs(b.y - a.y) < 1) return b;
	}
	return null;
};

for (const vp of [
	{ width: 1600, height: 1000 }, { width: 1180, height: 820 },
	{ width: 900, height: 780 }, { width: 430, height: 850 },
]) {
	const tag = `${vp.width}x${vp.height}`;
	const page = await (await browser.newContext({ viewport: vp })).newPage();
	const errors = [];
	page.on('pageerror', (e) => errors.push(String(e)));
	await page.goto(`${ORIGIN}/`);
	await page.waitForTimeout(4200);   // the figure builds outward before it settles
	await page.evaluate(() => document.querySelector('[data-hm]')?.scrollIntoView({ block: 'center' }));
	await page.waitForTimeout(300);

	// One label per orbit: whichever is facing the camera right now, since a label
	// turned away is faded out and genuinely not clickable — that is the design.
	const picks = await page.evaluate(() => ['caps', 'feat', 'mkt'].map((orb) => {
		let best = null, bestOp = -1;
		for (const n of document.querySelectorAll(`[data-orb="${orb}"][data-hm-panel]`)) {
			const r = n.getBoundingClientRect();
			const op = parseFloat(getComputedStyle(n).opacity || '1');
			if (r.width < 2 || r.height < 2 || op <= bestOp) continue;
			bestOp = op; best = n;
		}
		return best && bestOp > 0.15 ? { orb, id: best.dataset.hmPanel } : null;
	}).filter(Boolean));
	if (picks.length !== 3) fails.push(`${tag}: expected all three orbits to offer a clickable label, found ${picks.length}`);

	for (const { orb, id } of picks) {
		const sel = `[data-hm-panel="${id}"]`;
		const b = await settle(page, sel);
		if (!b || !b.onScreen) { fails.push(`${tag} ${orb}: label never came to rest on screen`); continue; }

		await page.mouse.click(b.x + b.w / 2, b.y + b.h / 2);
		await page.waitForTimeout(280);

		const r = await page.evaluate(([want, s, labelSel]) => {
			const open = [...document.querySelectorAll(s)];
			if (open.length !== 1) return { n: open.length };
			const p = open[0];
			const q = p.getBoundingClientRect();
			const l = document.querySelector(labelSel).getBoundingClientRect();
			/* ANCHORED, not merely visible. Checking "is it on screen" cannot catch a
			   broken anchor, because the final clamp drags any wrong answer back inside
			   the viewport — proved by putting the top-layer bug back and watching this
			   file pass. What actually matters is that the panel sits against the label
			   it explains: touching it vertically, and overlapping it horizontally. */
			const gap = q.top >= l.bottom ? q.top - l.bottom : l.top - q.bottom;
			return {
				n: 1,
				right: p.id === want,
				onScreen: q.top >= -1 && q.left >= -1 &&
					q.bottom <= window.innerHeight + 1 && q.right <= window.innerWidth + 1,
				anchored: gap >= -2 && gap <= 80 && q.right > l.left && q.left < l.right,
				gap: Math.round(gap),
				body: (p.textContent || '').trim().length > 60,
			};
		}, [id, OPEN, sel]);

		if (r.n !== 1) fails.push(`${tag} ${orb}: ${r.n} panels open after one click, expected 1`);
		else {
			if (!r.right) fails.push(`${tag} ${orb}: opened the wrong panel`);
			if (!r.onScreen) fails.push(`${tag} ${orb}: panel is not fully on screen`);
			if (!r.anchored) fails.push(`${tag} ${orb}: panel is not anchored to its label (gap ${r.gap}px)`);
			if (!r.body) fails.push(`${tag} ${orb}: panel has no explanation in it`);
		}

		await page.keyboard.press('Escape');
		await page.waitForTimeout(180);
		if (await page.evaluate((s) => !!document.querySelector(s), OPEN))
			fails.push(`${tag} ${orb}: Escape did not close the panel`);
	}

	// A drag turns the model. It must never also open a panel.
	const fb = await page.evaluate(() => {
		const r = document.querySelector('[data-hm]')?.getBoundingClientRect();
		return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null;
	});
	if (fb) {
		await page.mouse.move(fb.x + fb.w * 0.72, fb.y + fb.h / 2);
		await page.mouse.down();
		for (let i = 1; i <= 6; i++) await page.mouse.move(fb.x + fb.w * 0.72 + i * 14, fb.y + fb.h / 2);
		await page.mouse.up();
		await page.waitForTimeout(180);
		if (await page.evaluate((s) => !!document.querySelector(s), OPEN))
			fails.push(`${tag}: dragging to turn the model opened a panel`);
	}
	for (const e of errors.slice(0, 2)) fails.push(`${tag}: page error — ${e}`);
	await page.close();
}

await browser.close();
server.close();

if (fails.length) {
	console.error('  hero panels: FAILED');
	for (const f of fails) console.error(`    - ${f}`);
	process.exit(1);
}
console.log('  hero panels: ok (click, anchor, Escape, drag — four widths)');
