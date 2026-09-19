// Browser test for the guided read. Run by `npm run verify`.
//
// WHY THIS EXISTS, WRITTEN PLAINLY. Three versions of this component shipped broken and not
// one of them was catchable by anything else in the repo:
//
//   1. `.rp-guide { display: grid }` beat the UA's `[hidden]` rule, so an empty card sat
//      under the controls on every page. CSS text; the build was happy.
//   2. The dock was re-parented to <body> — `.rp` has container-type: inline-size, so a fixed
//      child of it is fixed to the component — and paintGuide kept looking its elements up
//      with the root-scoped q(). Every lookup returned null, `!` is a compile-time claim
//      rather than a runtime guard, and the first assignment threw before the dock was ever
//      unhidden. A grey screen with no controls.
//   3. The dock was hidden WHILE the run travelled between stops, which takes several
//      seconds. Dimmed component, no dock: indistinguishable from a crash.
//
// Every one is a runtime fact about a rendered page — containment, the cascade, a null in a
// click handler. A type checker cannot see any of them and neither can a DOM stub. This loads
// the built site in Chromium, presses the button, and walks the whole sequence at five
// viewports, asserting the things a reader actually needs: the dock on screen, Next reachable,
// the highlighted panel visible, nothing overflowing, and no page errors at any point.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));

let chromium;
try {
	({ chromium } = await import('playwright'));
} catch {
	console.log('  guide browser: SKIPPED (playwright not installed — `npm i`)');
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
} catch (err) {
	console.log(`  guide browser: SKIPPED (no browser binary — \`npx playwright install chromium\`)`);
	server.close();
	process.exit(0);
}

// Five viewports: a phone, a short laptop (the worst case for a bottom dock), two ordinary
// desktops, and one wide enough to trigger the side placement in the gutter.
const VIEWPORTS = [
	{ name: 'phone', width: 390, height: 844 },
	{ name: 'short laptop', width: 1280, height: 640 },
	{ name: 'laptop', width: 1440, height: 900 },
	{ name: 'desktop', width: 1728, height: 1080 },
	{ name: 'wide/gutter', width: 2560, height: 1440 },
];

for (const vp of VIEWPORTS) {
	const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
	const errors = [];
	page.on('pageerror', (e) => errors.push(String(e)));
	page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });

	await page.goto(`${ORIGIN}/black-box`, { waitUntil: 'networkidle' });
	const start = await page.$('[data-guide-start]');
	ok(!!start, `${vp.name}: the Guided read button exists`);
	if (!start) { await page.close(); continue; }

	// DO NOT ASSUME IT IS CLOSED. /black-box opens the guided read by itself on a first
	// visit, and each Playwright page is a fresh context with empty storage — so on the
	// viewports where the component is in view at load, it is already running and clicking
	// the button TOGGLES IT OFF. The test then measured a dock that its own click had
	// closed. Open it only if it is not open.
	if (await page.evaluate(() => document.querySelector('[data-guide]').hidden)) {
		await start.click();
	}
	await page.waitForTimeout(900);

	const stops = await page.evaluate(() => {
		const d = document.querySelector('[data-guide]');
		return d ? d.querySelectorAll('[data-seg]').length : 0;
	});
	ok(stops >= 4, `${vp.name}: the rail shows every stop (${stops})`);

	for (let i = 0; i < stops; i++) {
		const s = await page.evaluate(() => {
			const d = document.querySelector('[data-guide]');
			if (!d || d.hidden) return { missing: true };
			const r = d.getBoundingClientRect();
			const next = d.querySelector('[data-guide-next]').getBoundingClientRect();
			const lit = document.querySelector('.is-lit');
			const lr = lit ? lit.getBoundingClientRect() : null;
			const body = d.querySelector('[data-guide-body]');
			return {
				onScreen: r.top >= 0 && r.bottom <= innerHeight + 1 && r.left >= -1 && r.right <= innerWidth + 1,
				nextReachable: next.top >= 0 && next.bottom <= innerHeight + 1,
				litVisible: lr ? lr.bottom > 0 && lr.top < innerHeight : false,
				hasCopy: !!body.textContent.trim() && !!d.querySelector('[data-guide-title]').textContent.trim(),
				height: Math.round(r.height),
			};
		});
		ok(!s.missing, `${vp.name} stop ${i + 1}: the dock is on screen, not hidden`);
		if (s.missing) break;
		ok(s.onScreen, `${vp.name} stop ${i + 1}: the dock is fully inside the viewport (${s.height}px tall)`);
		ok(s.nextReachable, `${vp.name} stop ${i + 1}: Next is reachable without scrolling`);
		ok(s.litVisible, `${vp.name} stop ${i + 1}: the highlighted panel is visible`);
		ok(s.hasCopy, `${vp.name} stop ${i + 1}: the stop has a title and a body`);

		if (i < stops - 1) {
			// Immediately after pressing Next the run travels for several seconds. The dock
			// must stay up for the whole of it — its disappearing there was bug 3.
			await page.click('[data-guide-next]');
			await page.waitForTimeout(350);
			const mid = await page.evaluate(() => {
				const d = document.querySelector('[data-guide]');
				if (!d || d.hidden) return { gone: true };
				const r = d.getBoundingClientRect();
				return { gone: false, onScreen: r.bottom <= innerHeight + 1 && r.top >= 0 };
			});
			ok(!mid.gone, `${vp.name}: the dock stays up while the run travels to stop ${i + 2}`);
			ok(mid.gone || mid.onScreen, `${vp.name}: the travelling dock stays inside the viewport`);
			await page.waitForTimeout(1800);
		}
	}

	// Close puts it away and returns it to the component, so a client-side navigation cannot
	// strand a fixed panel on the body of the next page.
	await page.click('[data-guide-skip]');
	await page.waitForTimeout(250);
	const closed = await page.evaluate(() => {
		const d = document.querySelector('[data-guide]');
		return {
			hidden: !d || d.hidden,
			returned: !d || d.closest('.rp') !== null,
			undimmed: !document.querySelector('.rp.is-guided'),
			noLit: !document.querySelector('.is-lit'),
		};
	});
	ok(closed.hidden, `${vp.name}: Close hides the dock`);
	ok(closed.returned, `${vp.name}: Close returns the dock into the component`);
	ok(closed.undimmed, `${vp.name}: Close clears the dimming`);
	ok(closed.noLit, `${vp.name}: Close clears the highlight`);

	ok(errors.length === 0, `${vp.name}: no page errors (${errors.slice(0, 2).join(' | ')})`);
	await page.close();
}

// The homepage embed loops and must never offer the guided read over the top of itself.
const home = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await home.goto(`${ORIGIN}/`, { waitUntil: 'networkidle' });
await home.waitForTimeout(600);
ok(
	await home.evaluate(() => !document.querySelector('[data-guide-start]')),
	'homepage: the ambient embed removes the Guided read button',
);
await home.close();

// ── THE NAV BAR ──────────────────────────────────────────────────────────────────────────
//
// The featured item is an outlined pill, which costs 2px of width and 2px of height. The bar
// is nearly full between 1160px and 1339px — there is a whole comment in components.css about
// advance widths measured off the shipped font — so a change here can wrap the links or push
// them into the CTA, and neither shows up in any stylesheet check. The border also sat the
// pill 1px proud of its neighbours until the padding was compensated.
for (const w of [1160, 1200, 1280, 1339, 1440, 1728]) {
	const page = await browser.newPage({ viewport: { width: w, height: 800 } });
	await page.goto(`${ORIGIN}/technology`, { waitUntil: 'networkidle' });
	const m = await page.evaluate(() => {
		const links = [...document.querySelectorAll('.nav-links > li > .nav-link')];
		const r = links.map((l) => l.getBoundingClientRect());
		const cta = document.querySelector('.nav-cta').getBoundingClientRect();
		return {
			count: links.length,
			rows: new Set(r.map((x) => Math.round(x.top))).size,
			heights: [...new Set(r.map((x) => Math.round(x.height)))],
			gap: Math.round(cta.left - r[r.length - 1].right),
		};
	});
	ok(m.rows === 1, `nav ${w}px: the links stay on one row (${m.rows})`);
	ok(m.heights.length === 1, `nav ${w}px: every link is the same height (${m.heights.join('/')}px)`);
	ok(m.gap >= 8, `nav ${w}px: the links clear the Contact Us button (${m.gap}px)`);
	await page.close();
}

// THE SIGN, IN ITS TWO STATES.
//
// Off the page it names it is a shop sign: "Open the" in the bar with a plate hanging under
// it on two cords. ON that page the plate has come up INTO the bar and the two halves are
// one pill reading "Black box opened" — past tense, no cords, nothing left hanging.
//
// Moving the plate up and leaving the label saying "open the" was the half-measure, and it
// shipped: an instruction still standing beside a thing that had already happened. The
// sentence has to change with the state or the motion is decoration, so the test checks the
// WORDS as well as the geometry.
{
	const page = await browser.newPage({ viewport: { width: 1512, height: 800 } });

	// Elsewhere: hanging.
	await page.goto(`${ORIGIN}/technology`, { waitUntil: 'networkidle' });
	await page.waitForTimeout(1200);
	const away = await page.evaluate(() => {
		const a = document.querySelector('.nav-link--mark');
		const plate = document.querySelector('.nav-sign-plate');
		if (!plate) return { missing: true };
		const nav = document.querySelector('.nav').getBoundingClientRect();
		const pr = plate.getBoundingClientRect();
		return {
			missing: false,
			name: a.getAttribute('aria-label'),
			hangsBy: Math.round(pr.bottom - nav.bottom),
			clears: Math.round(pr.top - nav.bottom),
			cords: [getComputedStyle(plate, '::before').width, getComputedStyle(plate, '::after').width],
			resolves: document.elementFromPoint(pr.left + pr.width / 2, pr.top + pr.height / 2)
				?.closest('a')?.getAttribute('href'),
			opened: !!document.querySelector('.nav-sign-opened'),
		};
	});
	ok(!away.missing, 'sign elsewhere: the hanging plate exists');
	ok(!away.opened, 'sign elsewhere: it is NOT showing the opened state');
	ok(away.name === 'Open the Black Box',
		`sign elsewhere: the accessible name is the whole phrase ("${away.name}")`);
	ok(away.hangsBy > 12, `sign elsewhere: it hangs clear below the bar (${away.hangsBy}px)`);
	ok(away.clears >= 0,
		`sign elsewhere: it hangs CLEAR of the bar rather than straddling it (${away.clears}px)`);
	ok(away.cords[0] === '1px' && away.cords[1] === '1px',
		`sign elsewhere: both cords are drawn (${away.cords.join(', ')})`);
	ok(away.resolves === '/black-box', `sign elsewhere: the plate resolves to the link (${away.resolves})`);

	// On its own page: opened.
	await page.goto(`${ORIGIN}/black-box`, { waitUntil: 'networkidle' });
	await page.waitForTimeout(1400);
	const here = await page.evaluate(() => {
		const a = document.querySelector('.nav-link--mark');
		const pill = document.querySelector('.nav-sign-opened');
		const heights = [...document.querySelectorAll('.nav-links > li > .nav-link')]
			.map((e) => Math.round(e.getBoundingClientRect().height));
		return {
			missing: !pill,
			// THE TWO PARTS, NOT THEIR CONCATENATION. The spans sit side by side with no
			// whitespace node between them — the gap is flex and the divider is a border — so
			// textContent reads "BlackBoxOpened" while the page shows "BlackBox | OPENED".
			// The accessible name is stated separately for the same reason.
			parts: pill ? [pill.querySelector('.nav-sign-name').textContent.trim(),
				pill.querySelector('.nav-sign-state').textContent.trim()] : [],
			// The two halves carry different faces on purpose — the name in the display serif,
			// the state as a mono tag. If either falls back to the nav's sans the lockup is
			// gone and it is a word in a box again.
			faces: pill ? [
				getComputedStyle(pill.querySelector('.nav-sign-name')).fontFamily.split(',')[0].replace(/["']/g, ''),
				getComputedStyle(pill.querySelector('.nav-sign-state')).fontFamily.split(',')[0].replace(/["']/g, ''),
			] : [],
			ariaName: a.getAttribute('aria-label'),
			stillHanging: !!document.querySelector('.nav-sign-plate'),
			current: a.getAttribute('aria-current') === 'page',
			heights: [...new Set(heights)],
			rows: new Set([...document.querySelectorAll('.nav-links > li > .nav-link')]
				.map((e) => Math.round(e.getBoundingClientRect().top))).size,
		};
	});
	ok(!here.missing, 'sign on its own page: the opened pill exists');
	ok(here.parts[0] === 'BlackBox' && here.parts[1] === 'Opened',
		`sign on its own page: it reads BlackBox / Opened (got "${here.parts.join(' / ')}")`);
	ok(here.faces[0] === 'Fraunces' && here.faces[1] === 'JetBrains Mono',
		`sign on its own page: name in the display serif, state in mono (${here.faces.join(' + ')})`);
	// The two spans concatenate to "BlackBoxOpened" with no space, so the name is stated.
	ok(here.ariaName === 'BlackBox opened',
		`sign on its own page: the accessible name has its space ("${here.ariaName}")`);
	ok(!here.stillHanging, 'sign on its own page: nothing is left hanging');
	ok(here.current, 'sign on its own page: it is marked as the current page');
	ok(here.heights.length === 1,
		`sign on its own page: the pill matches the row height (${here.heights.join('/')}px)`);
	ok(here.rows === 1, `sign on its own page: the bar stays on one row (${here.rows})`);
	await page.close();
}

// ── THE CONSOLE ─────────────────────────────────────────────────────────────────────────
//
// /black-box is an application screen: a product bar, a metric strip, the two networks, the
// controls, and four readouts side by side. No rail and no tabs — the argument this screen
// makes is a comparison, and a comparison you have to click between is not one.
//
// What can silently go wrong is geometric. The screen is sized to the window, so a panel
// that outgrows its band, a chart canvas measured before the grid has laid out, or a
// breakpoint that crushes cells to nothing are all invisible to a stylesheet check.
{
	for (const vp of [{ w: 1680, h: 1050 }, { w: 1512, h: 945 }, { w: 1440, h: 900 }]) {
		const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
		await page.goto(`${ORIGIN}/black-box`, { waitUntil: 'networkidle' });
		await page.waitForTimeout(1100);
		await page.evaluate(() => {
			const d = document.querySelector('[data-guide]');
			if (d && !d.hidden) document.querySelector('[data-guide-skip]')?.click();
		});
		await page.waitForTimeout(400);

		const m = await page.evaluate(() => {
			const rp = document.querySelector('.rp-shell').getBoundingClientRect();
			// SCOPED TO THE ROW. The record is a full-width strip outside .rp-tabs now, and
			// counting it here reported four cells on two rows.
			const cells = [...document.querySelectorAll('.rp-tabs [data-panel]')].map((e) => ({
				name: e.dataset.panel,
				rendered: e.getClientRects().length > 0,
				box: e.getBoundingClientRect(),
			}));
			return {
				component: Math.round(rp.height),
				usable: innerHeight - Math.round(document.querySelector('.nav').getBoundingClientRect().height),
				allRendered: cells.every((c) => c.rendered),
				count: cells.length,
				rows: new Set(cells.map((c) => Math.round(c.box.top))).size,
				shortest: Math.round(Math.min(...cells.map((c) => c.box.height))),
				narrowest: Math.round(Math.min(...cells.map((c) => c.box.width))),
				// The answer table carries the argument and gets the widest cell.
				answersWidest: Math.round(cells.find((c) => c.name === 'answers').box.width)
					=== Math.round(Math.max(...cells.map((c) => c.box.width))),
				canvas: Math.round(document.querySelector('[data-canvas]').getBoundingClientRect().width),
				rail: !!document.querySelector('.rp-rail'),
				options: document.querySelectorAll('.rp-opt').length,
				overflowX: document.documentElement.scrollWidth > innerWidth + 1,
				recordIsStrip: (() => {
					const rb = document.querySelector('.rp-recordband');
					if (!rb) return false;
					const inRow = rb.closest('.rp-tabs') !== null;
					return !inRow && Math.round(rb.getBoundingClientRect().width) >= innerWidth - 4;
				})(),
				overflowAtEnd: [],
			};
		});

		// Drive the run to its last epoch and re-measure — the tallest state, not the resting one.
		await page.evaluate(() => {
			const sc = document.querySelector('[data-scrub]');
			sc.value = String(sc.max);
			sc.dispatchEvent(new Event('input', { bubbles: true }));
		});
		await page.waitForTimeout(700);
		m.overflowAtEnd = await page.evaluate(() =>
			[...document.querySelectorAll('.rp-tabs [data-panel]')]
				.map((e) => ({ name: e.dataset.panel, over: e.scrollHeight - e.clientHeight })));

		ok(!m.rail, `console ${vp.w}: there is no sidebar`);
		ok(m.options === 4, `console ${vp.w}: four scenario options sit in the bar (${m.options})`);
		ok(m.allRendered && m.count === 3,
			`console ${vp.w}: all three readouts are on screen at once (${m.count}, all rendered: ${m.allRendered})`);
		ok(m.rows === 1, `console ${vp.w}: the three sit on one row (${m.rows})`);
		ok(m.recordIsStrip,
			`console ${vp.w}: the record is a full-width strip below the console, not a cell in the row`);
		// AT THE END OF THE RUN, not at rest. The ORMAS cell grows to two lines once
		// corrections accumulate, and sizing to the resting height pushed the last row —
		// "test accuracy right now" — out of the cell. The ledger is exempt: it is a log of
		// 85 entries and scrolls by nature.
		ok(m.overflowAtEnd.every((x) => x.name === 'ledger' || x.over <= 2),
			`console ${vp.w}: the readouts still fit at the end of the run (` +
				m.overflowAtEnd.map((x) => `${x.name} +${x.over}`).join(' ') + ')');
		ok(m.answersWidest, `console ${vp.w}: the answer table gets the widest cell`);
		ok(m.shortest >= 200, `console ${vp.w}: the shortest cell is ${m.shortest}px, too short to read`);
		ok(m.narrowest >= 240, `console ${vp.w}: the narrowest cell is ${m.narrowest}px`);
		ok(m.canvas > 120,
			`console ${vp.w}: the chart has a real width (${m.canvas}px) — a canvas measured before the grid lays out is 0`);
		// The CONSOLE is one screen — the product bar plus the working area. The record strip
		// below is deliberately outside it.
		ok(Math.abs(m.component + 48 - m.usable) <= 10,
			`console ${vp.w}×${vp.h}: bar + working area is ${m.component + 48}px against ${m.usable}px of window`);
		ok(!m.overflowX, `console ${vp.w}: nothing overflows sideways`);
		await page.close();
	}

	// Below 1240 the panels wrap and the screen releases its fixed height rather than
	// crushing the cells — measured at 1200×800 they came out 92px tall before this.
	{
		const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
		await page.goto(`${ORIGIN}/black-box`, { waitUntil: 'networkidle' });
		await page.waitForTimeout(900);
		const m = await page.evaluate(() => {
			const cells = [...document.querySelectorAll('.rp-tabs [data-panel]')].map((e) => e.getBoundingClientRect());
			return {
				shortest: Math.round(Math.min(...cells.map((c) => c.height))),
				rows: new Set(cells.map((c) => Math.round(c.top))).size,
				overflowX: document.documentElement.scrollWidth > innerWidth + 1,
			};
		});
		// Three readouts in a two-column grid is two rows.
		ok(m.rows === 2, `console 1200: the readouts wrap to two rows (${m.rows})`);
		ok(m.shortest >= 200, `console 1200: cells keep a usable height (${m.shortest}px)`);
		ok(!m.overflowX, 'console 1200: nothing overflows sideways');
		await page.close();
	}

	// IT OPENS FOR A READER WHO HAS ASKED FOR REDUCED MOTION TOO. It used to sit behind the
	// same early return as autoplay, so anyone with that system setting never saw it and had
	// to find the button — reported exactly that way. Reduced motion asks for things to stop
	// moving, not to be told less; the guide seeks between stops instead of playing.
	{
		const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
		const page = await ctx.newPage();
		await page.goto(`${ORIGIN}/black-box`, { waitUntil: 'networkidle' });
		await page.waitForTimeout(2000);
		ok(await page.evaluate(() => !document.querySelector('[data-guide]').hidden),
			'reduced motion: the guided read still opens itself');
		await ctx.close();
	}

	// BOTH WAYS OUT WORK. The dock prints "esc" on its Skip button, and the listener was on
	// the component — which hears nothing, because the dock is re-parented to <body> and
	// nothing inside the component has focus when the guide has opened by itself.
	for (const [how, act] of [['Escape', async (pg) => pg.keyboard.press('Escape')],
		['Skip', async (pg) => pg.click('[data-guide-skip]')]]) {
		const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
		const page = await ctx.newPage();
		await page.goto(`${ORIGIN}/black-box`, { waitUntil: 'networkidle' });
		await page.waitForTimeout(2000);
		await act(page);
		await page.waitForTimeout(400);
		ok(await page.evaluate(() => document.querySelector('[data-guide]').hidden),
			`${how} closes the guided read`);
		await ctx.close();
	}

	// A START THAT CANNOT SUCCEED MUST NOT SPEND THE ONE SHOWING. The flag was written
	// before guideStart, so a run that failed to load burned it and the reader never got
	// the guide on any later visit either.
	{
		const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
		const page = await ctx.newPage();
		await page.route('**/runs/*.json', (r) => r.abort());
		await page.goto(`${ORIGIN}/black-box`, { waitUntil: 'domcontentloaded' });
		await page.waitForTimeout(2000);
		ok(await page.evaluate(() => localStorage.getItem('oxiedo.blackbox.guideSeen') === null),
			'a failed run does not spend the first-visit showing');
		await ctx.close();
	}

	// The guided read opens itself once, on a first visit to this page only.
	const first = await browser.newContext({ viewport: { width: 1440, height: 900 } });
	const fp = await first.newPage();
	await fp.goto(`${ORIGIN}/black-box`, { waitUntil: 'networkidle' });
	await fp.evaluate(() => document.querySelector('.rp').scrollIntoView({ block: 'center' }));
	await fp.waitForTimeout(1500);
	ok(await fp.evaluate(() => !document.querySelector('[data-guide]').hidden),
		'first visit: the guided read opens by itself');
	await fp.goto(`${ORIGIN}/black-box`, { waitUntil: 'networkidle' });
	await fp.evaluate(() => document.querySelector('.rp').scrollIntoView({ block: 'center' }));
	await fp.waitForTimeout(1500);
	ok(await fp.evaluate(() => document.querySelector('[data-guide]').hidden),
		'second visit: it does not open again');
	await first.close();

	const home = await browser.newContext({ viewport: { width: 1440, height: 900 } });
	const hp = await home.newPage();
	await hp.goto(`${ORIGIN}/`, { waitUntil: 'networkidle' });
	await hp.waitForTimeout(900);
	ok(await hp.evaluate(() => document.querySelector('.rp').dataset.guideMode !== 'auto'),
		'homepage: the ambient embed never opens the guided read by itself');
	ok(await hp.evaluate(() => !document.querySelector('.rp').classList.contains('rp--app')),
		'homepage: the embed is not the application screen');
	await home.close();
}

// ── WHEN THE RUN DOES NOT ARRIVE ─────────────────────────────────────────────────────────
//
// Only `!res.ok` was handled, so a thrown fetch — a network failure, a blocked request, an
// intercepted response — rejected unhandled and the console sat on "Loading the archived
// run…" indefinitely while everything around it rendered. A dark screen with a scrubber,
// empty readouts and no explanation reads as the product being broken rather than as a file
// not arriving, and it was reported exactly that way.
{
	// Blocked outright.
	const p1 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
	const thrown = [];
	p1.on('pageerror', (e) => thrown.push(String(e)));
	await p1.route('**/runs/*.json', (r) => r.abort());
	await p1.goto(`${ORIGIN}/black-box`, { waitUntil: 'domcontentloaded' });
	await p1.waitForTimeout(2200);
	const blocked = await p1.evaluate(() => ({
		failed: document.querySelector('.rp').classList.contains('is-failed'),
		panel: !document.querySelector('[data-failed]').hidden,
		instrumentGone: getComputedStyle(document.querySelector('.rp-stageband')).display === 'none',
		says: document.querySelector('[data-conditions-app]').textContent.trim(),
	}));
	ok(blocked.failed && blocked.panel, 'blocked run: the console says it failed');
	ok(blocked.instrumentGone,
		'blocked run: the empty instrument is removed rather than left pretending to be one');
	ok(/could not be loaded/.test(blocked.says), `blocked run: the bar explains ("${blocked.says}")`);
	ok(thrown.length === 0, `blocked run: nothing throws unhandled (${thrown[0] ?? ''})`);
	await p1.close();

	// Answered, badly.
	const p2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
	await p2.route('**/runs/*.json', (r) => r.fulfill({ status: 500, body: 'nope' }));
	await p2.goto(`${ORIGIN}/black-box`, { waitUntil: 'domcontentloaded' });
	await p2.waitForTimeout(1800);
	ok(/answered 500/.test(await p2.evaluate(() => document.querySelector('[data-conditions-app]').textContent)),
		'a 500 is reported with its status');
	await p2.close();

	// And it recovers.
	const p3 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
	let block = true;
	await p3.route('**/runs/*.json', (r) => (block ? r.abort() : r.continue()));
	await p3.goto(`${ORIGIN}/black-box`, { waitUntil: 'domcontentloaded' });
	await p3.waitForTimeout(1800);
	block = false;
	await p3.click('[data-retry]');
	await p3.waitForTimeout(1800);
	const back = await p3.evaluate(() => ({
		failed: document.querySelector('.rp').classList.contains('is-failed'),
		svgs: document.querySelectorAll('.rp-anatomy svg').length,
	}));
	ok(!back.failed && back.svgs === 2, 'retry loads the run and restores the console');
	await p3.close();
}

// ── EVERY RENDERED WORD IN THE CONSOLE ───────────────────────────────────────────────────
//
// The console is dark and its palette is six custom properties, so a single token being a
// shade off moves a dozen labels at once. Spot-checking named selectors is not enough —
// switching to the dark palette put seven things under the floor and only a sweep found
// them all: white on the light amber at 2.24:1, and --fg-dim at 3.91:1 carrying the metric
// labels, the chart labels, the table headers, the run string and the breadcrumb.
//
// Two things this sweep has to get right, both learned by getting them wrong. Elements
// inside a hidden panel still report their own computed display, so they must be filtered
// by whether they actually render — otherwise the guide dock is measured against the
// console's dark ground while it is closed and reports five phantom failures. And the floor
// is 3:1 for large text, 4.5:1 otherwise, because most of this screen is 10-12px labels.
{
	const page = await browser.newPage({ viewport: { width: 1512, height: 945 } });
	await page.goto(`${ORIGIN}/black-box`, { waitUntil: 'networkidle' });
	await page.waitForTimeout(1300);

	const sweep = () => page.evaluate(() => {
		const lum = (c) => {
			const m = c.match(/[\d.]+/g);
			if (!m) return 1;
			const [r, g, b] = m.slice(0, 3).map(Number)
				.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
			return 0.2126 * r + 0.7152 * g + 0.0722 * b;
		};
		const behind = (el) => {
			for (let e = el.parentElement; e; e = e.parentElement) {
				const bg = getComputedStyle(e).backgroundColor;
				if (bg && !/rgba\(0, 0, 0, 0\)/.test(bg)) return bg;
			}
			return 'rgb(255,255,255)';
		};
		const out = [];
		const scope = [...document.querySelectorAll('.rp--app *'), ...document.querySelectorAll('[data-guide] *')];
		for (const el of scope) {
			if (el.getClientRects().length === 0) continue;
			if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
			const c = getComputedStyle(el);
			const bg = /rgba\(0, 0, 0, 0\)/.test(c.backgroundColor) ? behind(el) : c.backgroundColor;
			const px = parseFloat(c.fontSize);
			const floor = px >= 24 || (px >= 18.66 && parseInt(c.fontWeight, 10) >= 700) ? 3 : 4.5;
			const a = lum(c.color), b = lum(bg);
			const ratio = +(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2));
			if (ratio < floor) {
				out.push({ text: el.textContent.trim().slice(0, 34), ratio, floor, size: c.fontSize });
			}
		}
		return out;
	});

	// Once with the guided read over the console, once with it closed — the dock is a light
	// panel on a dark screen and only one of those states is covered by looking at either.
	const open = await sweep();
	ok(open.length === 0,
		`console contrast, guide open: ${open.length} below floor` +
			(open[0] ? ` — "${open[0].text}" at ${open[0].ratio}:1 (needs ${open[0].floor})` : ''));
	await page.evaluate(() => document.querySelector('[data-guide-skip]')?.click());
	await page.waitForTimeout(500);
	const rest = await sweep();
	ok(rest.length === 0,
		`console contrast, at rest: ${rest.length} below floor` +
			(rest[0] ? ` — "${rest[0].text}" at ${rest[0].ratio}:1 (needs ${rest[0].floor})` : ''));
	await page.close();
}

// ── THE HERO TRUST BAR ───────────────────────────────────────────────────────────────────
//
// Five sector names on one line. The column gap was --space-xl, which pushed the fifth name
// onto its own row at every width from 1100px to 1512px — most desktops — so one market read
// as demoted below the other four. Reported on 2026-09-18, and it had been there a while:
// reverting every button and nav change made that day did not affect it.
//
// The names need ~543px; four 40px gaps took the total past the 674px the list gets at
// 1440px. Now 24px, and below 1280px the label stacks above so the list runs full width.
{
	const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
	await page.goto(`${ORIGIN}/`, { waitUntil: 'networkidle' });
	for (const w of [768, 1024, 1200, 1280, 1366, 1440, 1512, 1600, 1728, 1920]) {
		await page.setViewportSize({ width: w, height: 900 });
		await page.waitForTimeout(120);
		const rows = await page.evaluate(() => new Set(
			[...document.querySelectorAll('.hero-trust-list li')]
				.map((e) => Math.round(e.getBoundingClientRect().top)),
		).size);
		ok(rows === 1, `hero trust bar ${w}px: the five sectors stay on one line (${rows} rows)`);
	}
	await page.close();
}

await browser.close();
server.close();

console.log(fail ? `\n  guide browser: ${fail} FAILURES` : `  guide browser: ${VIEWPORTS.length} viewports, every stop on screen, no page errors`);
process.exit(fail ? 1 : 0);
