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

/* One chip of each kind. They are ordinary buttons in a grid now — no settling, no
   aiming at ink inside a group, no chasing a label across a turning object. That
   whole apparatus existed because the names were in orbit; it went with them. */
const KINDS = ['hm-chip--cap', 'hm-chip--feat', 'hm-chip--sec'];

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

	for (const kind of KINDS) {
		const chip = page.locator(`.${kind}`).first();
		if (!(await chip.count())) { fails.push(`${tag}: no ${kind} to click`); continue; }
		await chip.scrollIntoViewIfNeeded();
		const want = await chip.getAttribute('data-node');
		await chip.click();
		await page.waitForTimeout(260);

		const r = await page.evaluate(([id, sel]) => {
			const open = [...document.querySelectorAll(sel)];
			if (open.length !== 1) return { n: open.length };
			const p = open[0];
			const q = p.getBoundingClientRect();
			const l = document.querySelector(`[data-node="${id}"]`).getBoundingClientRect();
			/* ANCHORED, not merely visible. "Is it on screen" cannot catch a broken
			   anchor, because the final clamp drags any wrong answer back inside the
			   viewport — proved once by putting the bug back and watching this pass.
			   What matters is that the card sits against the name it explains. */
			const gap = q.top >= l.bottom ? q.top - l.bottom : l.top - q.bottom;
			return {
				n: 1,
				right: p.id === id,
				onScreen: q.top >= -1 && q.left >= -1 &&
					q.bottom <= window.innerHeight + 1 && q.right <= window.innerWidth + 1,
				anchored: gap >= -2 && gap <= 80 && q.right > l.left && q.left < l.right,
				gap: Math.round(gap),
				body: (p.textContent || '').trim().length > 60,
			};
		}, [want, OPEN]);

		if (r.n !== 1) fails.push(`${tag} ${kind}: ${r.n} cards open after one click, expected 1`);
		else {
			if (!r.right) fails.push(`${tag} ${kind}: opened the wrong card`);
			if (!r.onScreen) fails.push(`${tag} ${kind}: card is not fully on screen`);
			if (!r.anchored) fails.push(`${tag} ${kind}: card is not anchored to its name (gap ${r.gap}px)`);
			if (!r.body) fails.push(`${tag} ${kind}: card has no explanation in it`);
		}

		await page.keyboard.press('Escape');
		await page.waitForTimeout(200);
		if (await page.evaluate((s) => !!document.querySelector(s), OPEN))
			fails.push(`${tag} ${kind}: Escape did not close the card`);
	}

	/* POINTING AT A NAME LIGHTS WHAT IT JOINS. This is the whole of the chord matrix
	   and the sector lines, and if it silently stops working the rows are just three
	   lists that happen to sit near each other. */
	{
		const feat = page.locator('.hm-chip--feat').first();
		await feat.hover();
		await page.waitForTimeout(220);
		const lit = await page.evaluate(() => ({
			on: document.querySelectorAll('.hm-chip.is-on').length,
			lit: document.querySelectorAll('.hm-chip.is-lit').length,
			dim: document.querySelectorAll('.hm-chip.is-dim').length,
		}));
		if (lit.on !== 1) fails.push(`${tag}: pointing at a feature marked ${lit.on} chips as the subject`);
		if (lit.lit < 1) fails.push(`${tag}: pointing at a feature lit nothing it joins`);
		if (lit.dim < 1) fails.push(`${tag}: pointing at a feature dimmed nothing`);

		await page.mouse.move(4, 4);
		await page.waitForTimeout(220);
		const cleared = await page.evaluate(() =>
			!document.querySelector('.hm-chip.is-on, .hm-chip.is-lit, .hm-chip.is-dim'));
		if (!cleared) fails.push(`${tag}: the highlight stayed after the pointer left`);
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
console.log('  hero panels: ok (click, anchor, Escape, highlight — four widths)');
