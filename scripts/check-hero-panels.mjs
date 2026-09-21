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

// HERO_DIST lets this run against a build other than ./dist, so it can be checked
// while something else is building centrally.
const DIST = process.env.HERO_DIST
	? fileURLToPath(new URL(process.env.HERO_DIST.replace(/\/?$/, '/'), new URL('../', import.meta.url)))
	: fileURLToPath(new URL('../dist/', import.meta.url));

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

/* AIM AT THE INK, NOT AT THE GROUP. An orb's <g> holds the label AND the anchor dot
   marking its true place on the shell, and the label slides away from that anchor
   when something else wants the same pixels. The group's bounding box therefore
   spans the two, and its centre is frequently empty space between them — clicking
   there hit nothing, or hit whichever neighbour happened to be under that point,
   which is what "opened the wrong panel" was. The label is the chip, the pill, or
   the capability's text. */
const INK = { caps: '.hm-cap-text', feat: '.hm-chip' };
const fails = [];

// Reading a label off a turning model is a moving target, and Playwright's own
// "wait until it stops moving" never returns on something that turns forever.
// Hovering a label stops the spin — that is how the model behaves for a visitor
// too — so hover it, then confirm it has actually come to rest before clicking.
const settle = async (page, sel, hoverSel) => {
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
		// Hover the group, so its pointerenter fires and pins the label in place.
		const h = await page.evaluate((s) => {
			const n = document.querySelector(s);
			if (!n) return null;
			const r = n.getBoundingClientRect();
			return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
		}, hoverSel);
		if (!h) return null;
		await page.mouse.move(h.x, h.y);
		await page.waitForTimeout(220);
		const b = await read();
		if (b && Math.abs(b.x - a.x) < 1 && Math.abs(b.y - a.y) < 1) return b;
	}
	return null;
};

for (const vp of [
	/* 430 IS GONE, AND ON PURPOSE. The figure is now hidden below 760px — at phone
	   width its labels rendered at four to six pixels and it ran a sixty-frame-a-second
	   loop to say nothing. A guard that demands a panel open at 430 would demand the
	   figure come back. 800 is the narrowest width where it is still drawn, so it is
	   the one worth guarding. */
	{ width: 1600, height: 1000 }, { width: 1180, height: 820 },
	{ width: 900, height: 780 }, { width: 800, height: 900 },
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
	const picks = await page.evaluate(() => ['caps', 'feat'].map((orb) => {
		let best = null, bestOp = -1;
		for (const n of document.querySelectorAll(`[data-orb="${orb}"][data-hm-panel]`)) {
			const r = n.getBoundingClientRect();
			const op = parseFloat(getComputedStyle(n).opacity || '1');
			if (r.width < 2 || r.height < 2 || op <= bestOp) continue;
			bestOp = op; best = n;
		}
		return best && bestOp > 0.15 ? { orb, id: best.dataset.hmPanel } : null;
	}).filter(Boolean));
	if (picks.length !== 2) fails.push(`${tag}: expected both orbits to offer a clickable label, found ${picks.length}`);

	for (const { orb, id } of picks) {
		const group = `[data-hm-panel="${id}"]`;
		/* Below about 620px the figure drops the names and keeps the object, so a
		   capability has no text to aim at — what is left is its transparent hit
		   rect, which is still there and still opens the panel. Never fall back to
		   the group itself: it spans from the hit area to the anchor dot and its
		   centre is the empty space between the two, which is how this arrived as
		   "label never came to rest". First of these that is actually drawn. */
		const sel = await page.evaluate(([g, ink]) => {
			for (const part of [ink, '.hm-hit']) {
				const n = document.querySelector(`${g} ${part}`);
				if (!n) continue;
				const r = n.getBoundingClientRect();
				if (r.width > 2 && r.height > 2) return `${g} ${part}`;
			}
			return null;
		}, [group, INK[orb]]);
		if (!sel) { fails.push(`${tag} ${orb}: nothing drawn to aim at`); continue; }
		const b = await settle(page, sel, sel);
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

	/* HOVER, THEN LEAVE, AND IT HAS TO START TURNING AGAIN.
	   Hovering a label holds the model still so it can be clicked. The release used
	   to be a pointerleave on the label, and the painter's-order pass re-appends
	   every label as the depth order changes — moving the node under the pointer
	   loses the browser's record of the hover, so the leave never fired and the
	   figure stayed frozen with its chords lit long after the pointer had gone.
	   Measured here because "it gets stuck when you hover it" is not something a
	   screenshot can show.

	   MEASURED ON THE SHELL, NOT ON A LABEL. The first attempt sampled an anchor
	   dot via querySelector, which returns whichever element is first in document
	   order — and document order is exactly what the painter reshuffles, so
	   consecutive samples were sometimes different features. The outer shell is one
	   element that is never re-appended and whose rx is the rotation itself.

	   Three samples, widest gap taken: rx is periodic, so two samples alone can
	   straddle a symmetric pair and read as motionless while the model turns. */
	{
		/* TOTAL VARIATION, NOT PEAK-TO-PEAK AND NOT EQUALITY.
		   Two wrong answers came before this one. Peak-to-peak of the shell's rx has a
		   threshold to tune, and rx is periodic — sampled across a turning point it
		   barely moves, which reported a turning model as stuck at one width in four.
		   Exact equality then failed the other way at all four, because the spin eases
		   to a halt asymptotically and never reaches precisely zero: held still, rx
		   still creeps in the second decimal forever.

		   Summing the absolute change between consecutive samples answers both. A
		   turning model accumulates distance even while crossing a turning point,
		   because the path length does not care about direction; a held one accumulates
		   almost nothing. The two are three orders of magnitude apart, so the band
		   between them is wide rather than tuned. */
		/* ALL THREE OF THE SHELL'S NUMBERS, NOT JUST rx.
		   Total variation in rx alone was the third wrong answer here. It is still a
		   periodic quantity, and near a turning point a whole sampling window can sit
		   almost flat — which was survivable while the figure started at an arbitrary
		   angle and merely flaky, and became a guaranteed false failure the moment the
		   opening pose was fixed: every run now begins at the same yaw, so if that yaw
		   is near a turning point, every run lands in the flat part. Measured 0.13 at
		   all four widths while the model was demonstrably turning.

		   rx and ry are a quarter cycle apart and the rotation angle is a third
		   quantity again, so they cannot all three be stationary at once. Summing the
		   distance travelled across all of them has no flat spots to fall into. */
		const pose = () => page.evaluate(() => {
			const e = document.querySelector('[data-shell="feat"]');
			const rot = /rotate\(([-0-9.]+)/.exec(e.getAttribute('transform') || '');
			return [
				parseFloat(e.getAttribute('rx')),
				parseFloat(e.getAttribute('ry')),
				rot ? parseFloat(rot[1]) : 0,
			];
		});
		const travelled = async () => {
			let prev = await pose();
			let sum = 0;
			for (let i = 0; i < 8; i++) {
				await page.waitForTimeout(170);
				const now = await pose();
				for (let k = 0; k < now.length; k++) {
					const d = Math.abs(now[k] - prev[k]);
					// The rotation wraps at 180; a wrap is not a thousand units of travel.
					sum += d > 90 ? 0 : d;
				}
				prev = now;
			}
			return sum;
		};
		const spot = await page.evaluate(() => {
			const n = document.querySelector('[data-orb="feat"] .hm-chip');
			const r = n.getBoundingClientRect();
			return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
		});
		await page.mouse.move(spot.x, spot.y);
		await page.waitForTimeout(900);          // let it coast to a stop
		const held = await travelled();
		if (held > 0.5) fails.push(`${tag}: hovering a label did not hold the model still (moved ${held.toFixed(2)})`);

		// Off the figure entirely, which is the event that has to release it.
		await page.mouse.move(4, 4);
		await page.waitForTimeout(900);
		const freed = await travelled();
		if (freed < 1) fails.push(`${tag}: the model stayed stuck after the pointer left (moved ${freed.toFixed(2)})`);
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
