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

// THE HANGING SIGN. It is the one deliberately unusual object in the chrome, and every way
// it can go wrong is geometric: the plate leaving the anchor's row, the accessible name
// losing the space between its two spans, the plate failing to resolve as the link, or the
// plate landing on a page banner of exactly its own colour and disappearing into it.
{
	const page = await browser.newPage({ viewport: { width: 1440, height: 800 } });
	// /insights is the one route with a cream ground under the bar; the other fifteen are
	// #16182B. Both cases are checked, because the plate's whole job is to be an object on
	// whatever is behind it.
	for (const [route, expectCurrent] of [['/technology', false], ['/black-box', true], ['/insights', false]]) {
		await page.goto(`${ORIGIN}${route}`, { waitUntil: 'networkidle' });
		const m = await page.evaluate(() => {
			const nav = document.querySelector('.nav').getBoundingClientRect();
			const a = document.querySelector('.nav-link--mark');
			const ar = a.getBoundingClientRect();
			const plate = document.querySelector('.nav-sign-plate');
			const pr = plate.getBoundingClientRect();
			const others = [...document.querySelectorAll('.nav-links > li > .nav-link:not(.nav-link--mark)')]
				.map((e) => e.getBoundingClientRect());
			const cs = getComputedStyle(plate);
			return {
				anchorH: Math.round(ar.height),
				otherH: [...new Set(others.map((r) => Math.round(r.height)))],
				rows: new Set([...others.map((r) => Math.round(r.top)), Math.round(ar.top)]).size,
				hangsBy: Math.round(pr.bottom - nav.bottom),
				name: a.getAttribute('aria-label'),
				resolves: document.elementFromPoint(pr.left + pr.width / 2, pr.top + pr.height / 2)
					?.closest('a')?.getAttribute('href'),
				// The ring, which is what defines the plate's edge on a ground close to its own.
				ring: /0px 0px 0px [12]px/.test(cs.boxShadow),
				clearsBar: Math.round(pr.top - nav.bottom),
				// Text on the plate, and the plate against whatever is behind it.
				textContrast: (() => {
					const lum = (c) => {
						const [r, g, b] = c.match(/[\d.]+/g).slice(0, 3).map(Number)
							.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
						return 0.2126 * r + 0.7152 * g + 0.0722 * b;
					};
					const a = lum(cs.color), b = lum(cs.backgroundColor);
					return +(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2));
				})(),
				current: a.getAttribute('aria-current') === 'page',
				cords: [getComputedStyle(plate, '::before').width, getComputedStyle(plate, '::after').width],
			};
		});
		ok(m.anchorH === 42 && m.otherH.length === 1 && m.otherH[0] === m.anchorH,
			`sign ${route}: the bracket is the same height as every other link (${m.anchorH} vs ${m.otherH})`);
		ok(m.rows === 1, `sign ${route}: the bracket stays on the nav's row (${m.rows})`);
		ok(m.hangsBy > 12, `sign ${route}: the plate hangs clear below the bar (${m.hangsBy}px)`);
		ok(m.name === 'Open the Black Box',
			`sign ${route}: the accessible name is the whole phrase, not the two spans run together ("${m.name}")`);
		ok(m.resolves === '/black-box', `sign ${route}: the plate itself resolves to the link (${m.resolves})`);
		ok(m.ring, `sign ${route}: the plate keeps its separating ring`);
		ok(m.clearsBar >= 0,
			`sign ${route}: the plate hangs CLEAR of the bar rather than straddling it (${m.clearsBar}px). ` +
			'Straddling put half of it on a banner of its own colour, at 1.0:1.');
		ok(m.textContrast >= 4.5,
			`sign ${route}: the plate's label is ${m.textContrast}:1 against the plate`);
		ok(m.cords[0] === '1px' && m.cords[1] === '1px',
			`sign ${route}: both cords are drawn (${m.cords.join(', ')})`);
		ok(m.current === expectCurrent, `sign ${route}: aria-current is ${expectCurrent}`);
	}
	await page.close();
}

// ── BUTTONS ──────────────────────────────────────────────────────────────────────────────
//
// CONTRAST, ON EVERY SURFACE. `.btn--secondary` has been caught three times rendering
// near-invisible on a dark band: twice because a per-section patch was missing, and once
// when the base rule briefly gained `background: var(--bg-surface)` while the on-dark rule
// still set only colour and border — light text on a near-white fill, 1.13:1, on three
// pages. Each time it was found by eye, which is not a process. That experiment has since
// been reverted, but this check is what makes the next one safe, so it stays.
{
	const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
	const ROUTES = ['/', '/product', '/technology', '/licensing', '/invest', '/sectors',
		'/black-box', '/contact', '/about', '/press', '/data', '/faq', '/careers'];
	let worst = { ratio: 99 };
	for (const route of ROUTES) {
		await page.goto(`${ORIGIN}${route}`, { waitUntil: 'networkidle' });
		const rows = await page.evaluate(() => {
			const lum = (c) => {
				const [r, g, b] = c.match(/[\d.]+/g).slice(0, 3).map(Number)
					.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
				return 0.2126 * r + 0.7152 * g + 0.0722 * b;
			};
			// Walk up for the first non-transparent ancestor: a transparent button takes the
			// band's colour, and the band is the thing that changes underneath it.
			const solid = (el) => {
				for (let e = el; e; e = e.parentElement) {
					const bg = getComputedStyle(e).backgroundColor;
					if (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) return bg;
				}
				return 'rgb(255,255,255)';
			};
			return [...document.querySelectorAll('.btn')].map((el) => {
				const c = getComputedStyle(el);
				const bg = /rgba\(0, 0, 0, 0\)|transparent/.test(c.backgroundColor)
					? solid(el.parentElement) : c.backgroundColor;
				const a = lum(c.color), b = lum(bg);
				return {
					label: el.textContent.trim().slice(0, 30),
					ratio: +(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2)),
				};
			});
		});
		for (const r of rows) {
			ok(r.ratio >= 4.5, `contrast ${route}: "${r.label}" is ${r.ratio}:1, below the 4.5:1 floor`);
			if (r.ratio < worst.ratio) worst = { ...r, route };
		}
	}
	ok(worst.ratio >= 4.5, `buttons: worst contrast is ${worst.ratio}:1 ("${worst.label}" on ${worst.route})`);

	await page.close();
}

// ── THE CONSOLE FITS, AND ITS TABS WORK ──────────────────────────────────────────────────
//
// The component was 1113px against 811px of usable height at 1440×900, and every complaint
// about it — the guided read with nowhere to sit, the dock hunting for room, having to
// scroll to see what changed — was downstream of that one number. Tabbed, it is ~818px.
//
// Three things can silently undo that: a panel growing past its fixed height and scrolling
// inside itself, the four panels disagreeing on height so switching tabs makes the page
// jump, and the chart canvas drawing at zero size because it was measured while hidden.
{
	for (const vp of [{ w: 1280, h: 800 }, { w: 1440, h: 900 }, { w: 1728, h: 1080 }]) {
		const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
		await page.goto(`${ORIGIN}/black-box`, { waitUntil: 'networkidle' });
		await page.waitForTimeout(500);
		const heights = [];
		// IN APP MODE THE RAIL REPLACES THE TABLIST, which is display:none there — so clicking
		// [data-tab] waits forever on an invisible element. The test drives whichever control
		// the page actually presents, which is also what a reader can reach.
		const usesRail = await page.evaluate(() => !!document.querySelector('[data-rail-panel]')
			&& getComputedStyle(document.querySelector('.rp-tablist')).display === 'none');
		const isAppMode = await page.evaluate(() =>
			document.querySelector('.rp').classList.contains('rp--app'));
		for (const tab of ['answers', 'accuracy', 'ledger', 'record']) {
			await page.click(usesRail ? `[data-rail-panel="${tab}"]` : `[data-tab="${tab}"]`);
			await page.waitForTimeout(260);
			const m = await page.evaluate((name) => {
				const rp = document.querySelector('.rp').getBoundingClientRect();
				const panel = document.querySelector(`[data-panel="${name}"]`);
				const shown = [...document.querySelectorAll('[data-panel]')].filter((e) => !e.hidden);
				const canvas = document.querySelector('[data-canvas]');
				return {
					component: Math.round(rp.height),
					usable: innerHeight - Math.round(document.querySelector('.nav').getBoundingClientRect().height),
					onlyOne: shown.length === 1 && shown[0].dataset.panel === name,
					clipped: panel.scrollHeight > panel.clientHeight + 2,
					canvasDrawn: name !== 'accuracy' || Math.round(canvas.getBoundingClientRect().height) > 40,
					selected: document.querySelector(`[data-rail-panel="${name}"]`)?.getAttribute('aria-pressed')
						?? document.querySelector(`[data-tab="${name}"]`).getAttribute('aria-selected'),
					// The short-viewport rule needs :global() — the svg is built in JS and has
					// no [data-astro-cid], so a bare `> svg` matches nothing. It shipped that
					// way once and the component moved 4px instead of 64px.
					diagram: Math.round(document.querySelector('.rp-anatomy svg').getBoundingClientRect().height),
					isApp: document.querySelector('.rp').classList.contains('rp--app'),
					panelH: Math.round(panel.getBoundingClientRect().height),
				};
			}, tab);
			heights.push(m.component);
			var lastDiagram = m.diagram;
			ok(m.onlyOne, `console ${vp.w}px: opening "${tab}" shows that panel and only that one`);
			ok(m.selected === 'true', `console ${vp.w}px: "${tab}" is marked selected`);
			// IN APP MODE A SCROLLING PANEL IS NORMAL. A console's working area scrolls —
			// Grafana and every CRM do it — and at 1280×800 there are 711px for two network
			// diagrams, a metric strip and a five-row table, which does not fit and should
			// not be forced to. What must hold is that the panel is big enough to work in.
			// Outside app mode the component is a fixed block in a page and a scrolling
			// panel there means the height is wrong, so the strict rule stays.
			if (m.isApp) {
				ok(m.panelH >= 170,
					`console ${vp.w}×${vp.h}: the "${tab}" panel is ${m.panelH}px, too short to work in`);
			} else {
				ok(!m.clipped, `console ${vp.w}px: the "${tab}" panel is not scrolling inside itself`);
			}
			ok(m.canvasDrawn, `console ${vp.w}px: the chart has a real height when its tab opens`);
			// At 900px of window height and above it fits outright. At 800px it runs about
			// 43px past the fold even with the diagram shrunk to 240px, and shrinking it
			// further makes its labels unreadable — a worse trade than a short scroll. The
			// tolerance is that measured number, not a round one, so a regression that costs
			// another 50px fails here.
			if (isAppMode) {
				// The app screen is sized to the window on purpose: it should fill what is
				// left under the site header and never exceed it.
				ok(Math.abs(m.component - m.usable) <= 8,
					`console ${vp.w}×${vp.h}: the app screen is ${m.component}px against ${m.usable}px of window`);
			} else {
				const tolerance = vp.h >= 900 ? 12 : 48;
				ok(m.component <= m.usable + tolerance,
					`console ${vp.w}×${vp.h}: on "${tab}" the component is ${m.component}px against ${m.usable}px of usable height`);
			}
		}
		// App mode always draws the diagram at 240px to leave the working area room; outside
		// it, only a short viewport does.
		const wantDiagram = isAppMode || vp.h <= 880 ? 240 : 300;
		ok(lastDiagram === wantDiagram,
			`console ${vp.w}×${vp.h}: the diagram is ${lastDiagram}px, expected ${wantDiagram}px`);
		ok(new Set(heights).size === 1,
			`console ${vp.w}px: all four tabs are the same height, so switching does not jump (${heights.join('/')})`);
		await page.close();
	}

	// The guided read opens itself once, on a first visit to this page only.
	const first = await browser.newContext({ viewport: { width: 1440, height: 900 } });
	const fp = await first.newPage();
	await fp.goto(`${ORIGIN}/black-box`, { waitUntil: 'networkidle' });
	await fp.evaluate(() => document.querySelector('.rp').scrollIntoView({ block: 'center' }));
	await fp.waitForTimeout(1500);
	ok(await fp.evaluate(() => !document.querySelector('[data-guide]').hidden),
		'first visit: the guided read opens by itself');
	ok(await fp.evaluate(() => localStorage.getItem('oxiedo.blackbox.guideSeen') === '1'),
		'first visit: it records that it has been shown');
	await fp.goto(`${ORIGIN}/black-box`, { waitUntil: 'networkidle' });
	await fp.evaluate(() => document.querySelector('.rp').scrollIntoView({ block: 'center' }));
	await fp.waitForTimeout(1500);
	ok(await fp.evaluate(() => document.querySelector('[data-guide]').hidden),
		'second visit: it does not open again');
	await first.close();

	const home = await browser.newContext({ viewport: { width: 1440, height: 900 } });
	const hp = await home.newPage();
	await hp.goto(`${ORIGIN}/`, { waitUntil: 'networkidle' });
	await hp.evaluate(() => document.querySelector('.rp')?.scrollIntoView({ block: 'center' }));
	await hp.waitForTimeout(1500);
	ok(await hp.evaluate(() => document.querySelector('.rp').dataset.guideMode !== 'auto'),
		'homepage: the ambient embed never opens the guided read by itself');
	await home.close();
}

// ── THE THREE REPLAY CONTROLS ────────────────────────────────────────────────────────────
//
// Play, Replay from the event and Guided read were all the same cream chrome as the speed
// toggles, so a first-time visitor had nothing telling them the thing moves. They now form a
// hierarchy in the component's own amber, and the risks are the ordinary CSS ones: a colour
// that fails contrast, and a rule that loses to the base .rp-btn on source order — which is
// exactly what happened to the guided-read button, measuring 18.23:1 because `color:
// var(--fg)` came later at equal specificity and the amber never applied.
{
	const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
	await page.goto(`${ORIGIN}/black-box`, { waitUntil: 'networkidle' });
	await page.waitForTimeout(500);
	// MEASURE THE RESTING STATE. /black-box opens the guided read by itself, which puts the
	// Guided read button into its active tint — so the row was being measured mid-tour, and
	// a tinted button reported as "filled" and its label as low-contrast. Close it first.
	await page.evaluate(() => {
		const d = document.querySelector('[data-guide]');
		if (d && !d.hidden) document.querySelector('[data-guide-skip]')?.click();
	});
	await page.waitForTimeout(300);
	const m = await page.evaluate(() => {
		const lum = (c) => {
			const [r, g, b] = c.match(/[\d.]+/g).slice(0, 3).map(Number)
				.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
			return 0.2126 * r + 0.7152 * g + 0.0722 * b;
		};
		const cr = (a, b) => {
			const A = lum(a), B = lum(b);
			return +(((Math.max(A, B) + 0.05) / (Math.min(A, B) + 0.05)).toFixed(2));
		};
		// THE BACKDROP IS THE BUTTON'S OWN ANCESTOR, not the component's background. In app
		// mode the controls sit on the sunk cream strip rather than the white plate, and
		// measuring against .rp reported the wrong ground for every button in that row —
		// which is how a genuine 4.27:1 label was first surfaced as a "hierarchy" failure.
		const behind = (el) => {
			for (let e = el.parentElement; e; e = e.parentElement) {
				const bg = getComputedStyle(e).backgroundColor;
				if (bg && !/rgba\(0, 0, 0, 0\)/.test(bg)) return bg;
			}
			return 'rgb(255,255,255)';
		};
		const one = (sel) => {
			const e = document.querySelector(sel);
			const c = getComputedStyle(e);
			const plate = behind(e);
			const bg = /rgba\(0, 0, 0, 0\)/.test(c.backgroundColor) ? plate : c.backgroundColor;
			return {
				text: cr(c.color, bg),
				edge: cr(c.borderTopColor, plate),
				// "Filled" means carrying its own colour, NOT merely having a background: the
				// base .rp-btn already paints itself the plate colour, so a transparency test
				// reports every button as filled.
				bg: c.backgroundColor,
				h: Math.round(e.getBoundingClientRect().height),
			};
		};
		const btns = [...document.querySelectorAll('.rp-controls .rp-btn')];
		return {
			play: one('[data-play]'), event: one('[data-replay-event]'), guide: one('[data-guide-start]'),
			rows: new Set(btns.map((e) => Math.round(e.getBoundingClientRect().top))).size,
			heights: [...new Set(btns.map((e) => Math.round(e.getBoundingClientRect().height)))],
		};
	});
	for (const [name, v] of [['Play', m.play], ['Replay from the event', m.event], ['Guided read', m.guide]]) {
		ok(v.text >= 4.5, `control "${name}": label is ${v.text}:1 against its own background`);
	}
	// STATED AS A RELATIONSHIP, not against a fixed "plate" colour. The base .rp-btn paints
	// itself white while the app strip behind it is cream, so "has a background of its own"
	// is true of all three and says nothing. What the hierarchy actually means is that Play
	// carries a different fill from the other two, and the other two match each other.
	ok(m.play.bg !== m.event.bg,
		`controls: Play carries a fill the others do not (${m.play.bg} vs ${m.event.bg})`);
	ok(m.event.bg === m.guide.bg,
		`controls: the two secondary buttons share one treatment (${m.event.bg} / ${m.guide.bg})`);
	ok(m.event.edge >= 3, `control "Replay from the event": its edge reads at ${m.event.edge}:1`);
	ok(m.guide.edge >= 3, `control "Guided read": its edge reads at ${m.guide.edge}:1`);
	ok(m.rows === 1, `controls: the three buttons stay on one row (${m.rows})`);
	ok(m.heights.length === 1, `controls: all three are the same height (${m.heights.join('/')}px)`);
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
