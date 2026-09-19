// THE COLD OPEN, EXERCISED IN A REAL BROWSER.
//
// WHY THIS EXISTS. The first working version destroyed the page. The inline gate stamps
// data-coldopen="running" on <html> so ReplayDemo can hold its guided read, and the module
// script then looked the overlay up with document.querySelector('[data-coldopen]') — which
// matches <html> first, because <html> precedes everything. root was therefore
// documentElement, and root.remove() at the end of the sequence deleted the document. It
// threw no visible error and the screenshots up to fourteen seconds looked perfect; the page
// simply went blank afterwards. So the first assertion here is the dullest one imaginable:
// after the sequence, is there still a document.
//
// The rest guards the things that are easy to regress and invisible until someone complains:
// that it never mounts under reduced motion, that it plays once per session, that Escape gets
// out of it, that the guided read does not open behind the curtain and burn its one showing,
// and that act two's figures still match the sourced data in src/data/markets.ts.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));

let chromium;
try {
	({ chromium } = await import('playwright'));
} catch {
	console.log('  cold open: SKIPPED (playwright not installed — `npm i`)');
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

let fail = 0;
const ok = (cond, msg) => { if (!cond) { console.log('  FAIL', msg); fail++; } };

let browser;
try {
	browser = await chromium.launch();
} catch {
	console.log('  cold open: SKIPPED (no browser binary — `npx playwright install chromium`)');
	server.close();
	process.exit(0);
}

const VP = { width: 1400, height: 900 };
const errors = [];
const watch = (page, tag) => {
	page.on('pageerror', (e) => errors.push(`${tag}: ${e.message}`));
	page.on('console', (m) => { if (m.type() === 'error') errors.push(`${tag} console: ${m.text()}`); });
};

/* ── 1. it plays, it ends, and the document is still standing ──────────────── */
{
	const ctx = await browser.newContext({ viewport: VP });
	const page = await ctx.newPage();
	watch(page, 'sequence');
	await page.goto(`${ORIGIN}/black-box`);

	const early = await page.evaluate(() => ({
		mounted: !!document.querySelector('[data-coldopen-root]'),
		flag: document.documentElement.getAttribute('data-coldopen'),
		// The overlay must never be the thing the page is made of: the console has to be
		// rendered underneath it, or a crawler is served a curtain.
		consoleBehind: !!document.querySelector('.rp-console'),
		skipFocused: document.activeElement?.hasAttribute('data-co-skip') ?? false,
	}));
	ok(early.mounted, 'the cold open mounts on /black-box');
	ok(early.flag === 'running', `the interlock flag reads "running" (got ${early.flag})`);
	ok(early.consoleBehind, 'the console is rendered behind the overlay, not replaced by it');
	ok(early.skipFocused, 'Skip takes focus, so a keyboard reader is not trapped');

	// THE NAV STAYS. The sequence covers the instrument, not the site — a full-bleed
	// takeover with no masthead leaves a stranger unable to tell where they are or how to
	// leave. The overlay must begin at the nav and the nav must remain hit-testable, or the
	// way out has quietly gone away.
	const frame = await page.evaluate(() => {
		const nav = document.querySelector('.nav').getBoundingClientRect();
		const co = document.querySelector('[data-coldopen-root]').getBoundingClientRect();
		const hit = document.elementFromPoint(Math.round(nav.width / 2), Math.round(nav.height / 2));
		return {
			seam: Math.round(co.top - nav.bottom),
			reachesBottom: Math.round(co.bottom) >= window.innerHeight - 1,
			navOnTop: !!(hit && hit.closest('.nav')),
			navLinkClickable: !!(document.elementFromPoint(
				Math.round(document.querySelector('.nav a').getBoundingClientRect().left) + 4,
				Math.round(document.querySelector('.nav a').getBoundingClientRect().top) + 8,
			)?.closest('.nav')),
		};
	});
	ok(Math.abs(frame.seam) <= 2, `the curtain meets the nav with no seam (${frame.seam}px)`);
	ok(frame.reachesBottom, 'and runs to the bottom of the viewport');
	ok(frame.navOnTop, 'the nav paints above the curtain');
	ok(frame.navLinkClickable, 'and its links are still hit-testable — the way out stays open');

	// The figures are quoted from src/data/markets.ts and from the EU AI Act. If those are
	// corrected and this is not, the sequence starts citing numbers the rest of the site
	// disagrees with — in front of the exact audience most likely to check.
	const figs = await page.evaluate(() =>
		[...document.querySelectorAll('[data-co-fig] .co-fig-n')].map((e) => e.textContent.trim()));
	for (const want of ['419', '$15M', '~8%', 'Aug 2026']) {
		ok(figs.includes(want), `the sequence still cites ${want} (got ${figs.join(' · ')})`);
	}

	/* THE QUOTATIONS ARE THE HIGHEST-RISK TEXT ON THE SITE. They are real statements by
	   named people who have not endorsed anything here, reproduced verbatim. A stray edit
	   that drops a word, softens a claim or loses an attribution turns an accurate citation
	   into a misquotation attributed to a Turing laureate. Assert them to the character,
	   and assert that the disclaimer travels with them. */
	const quoted = await page.evaluate(() => ({
		text: document.querySelector('[data-co-quotes]')?.textContent.replace(/\s+/g, ' ').trim() ?? '',
		count: document.querySelectorAll('[data-co-quotes] blockquote').length,
		captions: document.querySelectorAll('[data-co-quotes] figcaption').length,
	}));
	ok(quoted.count === 2 && quoted.captions === 2,
		`both quotations carry an attribution (${quoted.count} quotes, ${quoted.captions} captions)`);
	for (const want of [
		'This lack of understanding is essentially unprecedented in the history of technology.',
		'Dario Amodei, Anthropic · 2025',
		'We don’t really understand exactly how they do those things.',
		'Geoffrey Hinton · 60 Minutes, 2023',
		'Neither is affiliated with Oxiedo.',
	]) {
		ok(quoted.text.includes(want), `act three reproduces exactly: "${want.slice(0, 64)}"`);
	}

	// Seek to the last act rather than sitting through all seven. The suite should not cost
	// twenty-six seconds a run to learn what the final two seconds do, and seeking is the
	// product's own control, so this exercises the real path rather than a test-only one.
	await page.click('[data-co-seg="6"]');
	await page.waitForTimeout(4000);
	const after = await page.evaluate(() => {
		const de = document.documentElement;
		const guide = document.querySelector('.rp-guide');
		return {
			// THE ONE THAT MATTERS.
			documentAlive: !!de && !!document.body && !!document.querySelector('.rp-console'),
			gone: !document.querySelector('[data-coldopen-root]'),
			flag: de ? de.getAttribute('data-coldopen') : null,
			guideAutoOpened: guide ? !guide.hasAttribute('hidden') : false,
		};
	});
	ok(after.documentAlive, 'the document survives the sequence — <html>, <body> and the console are all still there');
	ok(after.gone, 'the overlay removes itself when it ends');
	ok(after.flag === 'done', `the interlock flag reads "done" (got ${after.flag})`);
	// It hands over to the guided read rather than deleting it: the sequence plays on every
	// landing now, so suppressing the guide on the same landing would mean it never opened
	// again on any landing. Its own once-per-browser flag still stops it repeating.
	ok(after.guideAutoOpened, 'the guided read takes over once the curtain is down');

	// EVERY LANDING. This is the behaviour the once-per-session flag used to prevent.
	await page.reload();
	await page.waitForTimeout(1200);
	ok(await page.evaluate(() => {
		const el = document.querySelector('[data-coldopen-root]');
		return !!el && !el.hidden;
	}), 'a reload replays it');

	// AND ON CLIENT-SIDE NAVIGATION, which is the path the nav button actually takes. The
	// ClientRouter swaps the body without reloading the document, and Astro deduplicates
	// inline script execution across swaps — so the gate fired on the first arrival and
	// never again. Leaving and coming back a second time produced no sequence at all.
	for (const pass of [1, 2, 3]) {
		await page.click('.nav a[href="/product"]');
		await page.waitForTimeout(700);
		await page.click('.nav a[href="/black-box"]');
		await page.waitForTimeout(1200);
		const st = await page.evaluate(() => {
			const el = document.querySelector('[data-coldopen-root]');
			return { playing: !!el && !el.hidden, flag: document.documentElement.getAttribute('data-coldopen') };
		});
		ok(st.playing, `click-through #${pass}: the sequence plays again`);
		ok(st.flag === 'running', `click-through #${pass}: the interlock is re-armed (${st.flag})`);
	}

	// Navigating away mid-sequence must tear it down rather than leave a frame loop and a
	// set of document listeners running against a body that has been swapped out.
	await page.click('.nav a[href="/product"]');
	await page.waitForTimeout(800);
	const gone = await page.evaluate(() => ({
		el: !!document.querySelector('[data-coldopen-root]'),
		flag: document.documentElement.getAttribute('data-coldopen'),
	}));
	ok(!gone.el && gone.flag === null,
		`leaving mid-sequence tears it down (el ${gone.el}, flag ${gone.flag})`);
	// THE READER STEERS. Twenty-five seconds is only affordable because the rail is a set
	// of buttons and the arrows step, so a skimmer reaches the console in two clicks and
	// nobody is held to the auto-advance.
	await page.goto(`${ORIGIN}/black-box`);
	await page.waitForTimeout(700);
	const segCount = await page.evaluate(() => document.querySelectorAll('[data-co-seg]').length);
	ok(segCount === 7, `the rail exposes one control per act (${segCount})`);
	await page.click('[data-co-seg="4"]');
	await page.waitForTimeout(500);
	ok((await page.evaluate(() => document.querySelector('[data-co-act]')?.textContent ?? '')).startsWith('05'),
		'clicking the rail jumps to that act');
	await page.keyboard.press('ArrowLeft');
	await page.waitForTimeout(400);
	ok((await page.evaluate(() => document.querySelector('[data-co-act]')?.textContent ?? '')).startsWith('04'),
		'ArrowLeft steps back an act rather than skipping out');
	await page.keyboard.press('ArrowRight');
	await page.waitForTimeout(400);
	ok((await page.evaluate(() => document.querySelector('[data-co-act]')?.textContent ?? '')).startsWith('05'),
		'ArrowRight steps forward an act');
	ok(await page.evaluate(() => !!document.querySelector('[data-coldopen-root]')),
		'and none of that stepping dismissed the sequence');
	await ctx.close();
}

/* ── 2. reduced motion never mounts it at all ──────────────────────────────── */
{
	const ctx = await browser.newContext({ viewport: VP, reducedMotion: 'reduce' });
	const page = await ctx.newPage();
	watch(page, 'reduced');
	await page.goto(`${ORIGIN}/black-box`);
	await page.waitForTimeout(1200);
	const m = await page.evaluate(() => ({
		mounted: !!document.querySelector('[data-coldopen-root]'),
		flag: document.documentElement.getAttribute('data-coldopen'),
		consoleThere: !!document.querySelector('.rp-console'),
	}));
	ok(!m.mounted, 'under prefers-reduced-motion the cold open never mounts');
	ok(m.flag === null, `and never sets the interlock, so the guided read is untouched (got ${m.flag})`);
	ok(m.consoleThere, 'and the console is straight there');
	await ctx.close();
}

/* ── 3. Escape gets out, and hands over cleanly ────────────────────────────── */
{
	const ctx = await browser.newContext({ viewport: VP });
	const page = await ctx.newPage();
	watch(page, 'escape');
	await page.goto(`${ORIGIN}/black-box`);
	await page.waitForTimeout(1400);
	await page.keyboard.press('Escape');
	await page.waitForTimeout(1000);
	const m = await page.evaluate(() => ({
		gone: !document.querySelector('[data-coldopen-root]'),
		alive: !!document.documentElement && !!document.body,
		flag: document.documentElement.getAttribute('data-coldopen'),
	}));
	ok(m.gone, 'Escape ends it at once');
	ok(m.alive, 'and the document survives an early exit too');
	ok(m.flag === 'done', `and the interlock is released (got ${m.flag})`);
	// THE HANDOFF: something must take over, rather than the console sitting dead behind a
	// curtain that has just gone. Either is correct and which one depends on the reader —
	// a first-timer gets the guided read, anyone who has seen it gets plain autoplay — so
	// this asserts the disjunction rather than pinning the branch.
	await page.waitForTimeout(3000);
	const handover = await page.evaluate(() => {
		const guide = document.querySelector('.rp-guide');
		const label = document.querySelector('[data-epoch]');
		return {
			guided: guide ? !guide.hasAttribute('hidden') : false,
			epoch: label ? label.textContent.trim() : '',
		};
	});
	ok(handover.guided || /epoch\s+[1-9]/.test(handover.epoch),
		`the console takes over after a skip (guided: ${handover.guided}, epoch: "${handover.epoch}")`);
	await ctx.close();
}

/* ── 3b. THE EMPTY SCREEN IS AN EXIT; THE WORDS ARE NOT ───────────────────── */
{
	/* Clicking anywhere dismisses the sequence, as asked. What must not happen is the
	   version of that which drops the curtain on somebody engaging with it — clicking a
	   quotation, an attribution, or a segment of the rail. The copy block is transparent
	   to the pointer so the space AROUND the words is part of the exit and its children
	   are not, a distinction only a test will keep honest: it shipped broken once, because
	   pointer-events:none on the block sent a click on a blockquote through to the
	   backdrop and dismissed the sequence out from under the reader. */
	const ctx = await browser.newContext({ viewport: VP });
	const page = await ctx.newPage();
	watch(page, 'exits');
	await page.goto(`${ORIGIN}/black-box`);
	await page.waitForTimeout(1200);
	const alive = () => page.evaluate(() => !!document.querySelector('[data-coldopen-root]'));

	await page.click('[data-co-seg="2"]');
	await page.waitForTimeout(1300);
	const q = await page.locator('.co-quote blockquote').first().boundingBox();
	await page.mouse.click(Math.round(q.x + 40), Math.round(q.y + 12));
	await page.waitForTimeout(500);
	ok(await alive(), 'clicking a quotation does NOT dismiss it');

	await page.click('[data-co-seg="5"]');
	await page.waitForTimeout(500);
	ok(await alive(), 'clicking the rail does NOT dismiss it');
	ok((await page.evaluate(() => document.querySelector('[data-co-act]')?.textContent ?? '')).startsWith('06'),
		'and it seeks to that act instead');

	// Scrolling is held rather than treated as an exit, so the page behind cannot slide
	// away and strand the reader mid-article the moment the curtain lifts.
	const before = await page.evaluate(() => window.scrollY);
	await page.mouse.wheel(0, 600);
	await page.waitForTimeout(500);
	ok(await alive(), 'scrolling does not dismiss it');
	ok(before === (await page.evaluate(() => window.scrollY)), 'and the page behind is held');

	// THE CONTROL: filled, real size, names its key, lifted well clear of the bottom edge.
	// 22px off it is what "very low, hard to see" measured as.
	const btn = await page.evaluate(() => {
		const el = document.querySelector('[data-co-skip]');
		const cs = getComputedStyle(el);
		const r = el.getBoundingClientRect();
		const co = document.querySelector('[data-coldopen-root]').getBoundingClientRect();
		const rail = document.querySelector('[data-co-seg="0"]').getBoundingClientRect();
		return {
			label: el.textContent.replace(/\s+/g, ' ').trim(),
			bg: cs.backgroundColor,
			w: Math.round(r.width), h: Math.round(r.height),
			offBottom: Math.round(co.bottom - r.bottom),
			clearOfRail: r.left > rail.right + 40,
			onScreen: r.bottom <= co.bottom + 1 && r.right <= co.right + 1,
		};
	});
	ok(btn.bg !== 'rgba(0, 0, 0, 0)', `Skip is a filled control, not a ghost outline (${btn.bg})`);
	ok(btn.h >= 36 && btn.w >= 120, `Skip is a real target (${btn.w}×${btn.h})`);
	ok(btn.offBottom >= 40, `Skip is lifted clear of the bottom edge (${btn.offBottom}px)`);
	ok(btn.clearOfRail, 'Skip is at the other end of the control row from the rail');
	ok(btn.onScreen, 'Skip is on screen');
	ok(/Esc/.test(btn.label), `Skip names its keyboard equivalent ("${btn.label}")`);

	await page.mouse.click(Math.round(VP.width / 2), 240);
	await page.waitForTimeout(700);
	ok(!(await alive()), 'clicking the empty screen dismisses it');
	await ctx.close();
}

/* ── 3b-i. ONE LINE AND A FRAGMENT, NOT A PARAGRAPH ────────────────────────── */
{
	/* Reported as "the content is dense… you essentially put paragraphs in it", and it
	   was: three-sentence subs, three-line figure cells, a fine-print disclaimer
	   paragraph. A title sequence is read at a glance or not at all. A ceiling, so the
	   copy cannot creep back up. */
	const ctx = await browser.newContext({ viewport: VP });
	const page = await ctx.newPage();
	watch(page, 'density');
	await page.goto(`${ORIGIN}/black-box`);
	await page.waitForTimeout(800);
	// Two ceilings, because they guard different things. The PROSE — the line and its
	// fragment — is what turned into paragraphs, and it is capped hard. The evidence
	// blocks are a quotation with its attribution and a row of figures; those are read by
	// scanning, not by reading, and counting their words as prose would push the fix in
	// the wrong direction: cutting an attribution short, or a quotation.
	for (let act = 0; act < 7; act++) {
		await page.click(`[data-co-seg="${act}"]`);
		await page.waitForTimeout(1300);
		const n = await page.evaluate(() => {
			const count = (el) => el && el.innerText
				? el.innerText.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length : 0;
			const vis = (sel) => { const e = document.querySelector(sel); return e && !e.hidden ? e : null; };
			return {
				prose: count(vis('.co-line')) + count(vis('.co-sub')),
				total: count(document.querySelector('.co-copy')),
			};
		});
		ok(n.prose <= 22, `act ${act + 1}: the prose stays a line and a fragment (${n.prose} words)`);
		ok(n.total <= 45, `act ${act + 1} stays glanceable overall (${n.total} words)`);
	}
	await ctx.close();
}

/* ── 3b-ii. NO ACT IS ALLOWED TO FREEZE ────────────────────────────────────── */
{
	/* Acts three to five once ran for twelve seconds as a static image: the pulse loop was
	   gated behind the recede, the draw-in had finished and the break had not begun, so
	   nothing on the canvas moved while the text slid over it. Measured at the time, 17 of
	   37 sampled frames across those three acts were identical to the one before them. A
	   frozen instrument reads as a crashed instrument, and nobody reports it as a bug —
	   they just leave.
	   This samples the canvas twice, a third of a second apart, on every act. */
	let sharp;
	try { ({ default: sharp } = await import('sharp')); } catch { sharp = null; }
	if (!sharp) {
		console.log('  cold open: motion check SKIPPED (sharp not installed)');
	} else {
		const ctx = await browser.newContext({ viewport: VP });
		const page = await ctx.newPage();
		watch(page, 'motion');
		await page.goto(`${ORIGIN}/black-box`);
		await page.waitForTimeout(700);
		const clip = await page.evaluate(() => {
			const r = document.querySelector('[data-co-canvas]').getBoundingClientRect();
			return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
		});
		// A clipped page screenshot, not locator.screenshot(): the latter waits for the
		// element to be "stable", which a canvas repainting every frame never is.
		const frame = async () => sharp(await page.screenshot({ clip }))
			.resize({ width: 260 }).greyscale().raw().toBuffer();

		for (let act = 0; act < 7; act++) {
			await page.click(`[data-co-seg="${act}"]`);
			await page.waitForTimeout(900);
			const a = await frame();
			await page.waitForTimeout(340);
			const b2 = await frame();
			let moved = 0;
			for (let i = 0; i < a.length; i++) if (Math.abs(a[i] - b2[i]) > 3) moved++;
			const pct = (100 * moved) / a.length;
			ok(pct > 0.05, `act ${act + 1} is still moving (${pct.toFixed(2)}% of the canvas changed in 340ms)`);
		}
		await ctx.close();
	}
}

/* ── 3c. ?intro=0 goes straight to the console ─────────────────────────────── */
{
	const ctx = await browser.newContext({ viewport: VP });
	const page = await ctx.newPage();
	watch(page, 'bypass');
	await page.goto(`${ORIGIN}/black-box?intro=0`);
	await page.waitForTimeout(900);
	const m = await page.evaluate(() => ({
		mounted: !!document.querySelector('[data-coldopen-root]'),
		flag: document.documentElement.getAttribute('data-coldopen'),
		consoleThere: !!document.querySelector('.rp-console'),
	}));
	ok(!m.mounted, '?intro=0 skips the sequence entirely');
	ok(m.flag === null, `and leaves the interlock alone (${m.flag})`);
	ok(m.consoleThere, 'and lands on the console');
	await ctx.close();
}

/* ── 4. it belongs to one page only ────────────────────────────────────────── */
{
	const ctx = await browser.newContext({ viewport: VP });
	for (const route of ['/', '/product', '/technology']) {
		const page = await ctx.newPage();
		watch(page, route);
		await page.goto(`${ORIGIN}${route}`);
		await page.waitForTimeout(500);
		ok(await page.evaluate(() => !document.querySelector('[data-coldopen-root]')),
			`no cold open on ${route}`);
		await page.close();
	}
	await ctx.close();
}

ok(errors.length === 0, `no page errors anywhere (${errors.join(' | ')})`);

await browser.close();
server.close();

if (fail) {
	console.log(`  cold open: ${fail} FAILURE${fail === 1 ? '' : 'S'}`);
	process.exit(1);
}
console.log('  cold open: sequence, reduced motion, skip, handoff and scope all hold');
