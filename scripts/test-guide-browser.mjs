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

	await start.click();
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

// The featured pill and the current page must not look the same. Outlined versus filled is the
// whole distinction, and it was accent-coloured text before — which read as "you are here" on
// every page that was not /black-box.
{
	const page = await browser.newPage({ viewport: { width: 1440, height: 800 } });
	await page.goto(`${ORIGIN}/technology`, { waitUntil: 'networkidle' });
	const off = await page.evaluate(() => {
		const m = document.querySelector('.nav-link--mark');
		const c = getComputedStyle(m);
		return { aria: m.getAttribute('aria-current'), bg: c.backgroundColor, border: c.borderTopColor };
	});
	ok(off.aria === null, 'nav: the featured item is not marked as the current page elsewhere');
	ok(/rgba\(0, 0, 0, 0\)|transparent/.test(off.bg), 'nav: the featured pill is outlined, not filled');
	ok(!/rgba\(0, 0, 0, 0\)|transparent/.test(off.border), 'nav: the featured pill has a visible border');

	await page.goto(`${ORIGIN}/black-box`, { waitUntil: 'networkidle' });
	const on = await page.evaluate(() => {
		const m = document.querySelector('.nav-link--mark');
		const c = getComputedStyle(m);
		return { aria: m.getAttribute('aria-current'), bg: c.backgroundColor, border: c.borderTopColor };
	});
	ok(on.aria === 'page', 'nav: on its own page the featured item is the current page');
	ok(!/rgba\(0, 0, 0, 0\)/.test(on.bg), 'nav: on its own page it fills to the dark pill');
	ok(/rgba\(0, 0, 0, 0\)|transparent/.test(on.border), 'nav: the outline is dropped once it is filled');
	await page.close();
}

// ── BUTTONS ──────────────────────────────────────────────────────────────────────────────
//
// CONTRAST, ON EVERY SURFACE. `.btn--secondary` has now been caught three times rendering
// near-invisible on a dark band: twice because a per-section patch was missing, and once on
// 2026-09-18 because the base rule gained `background: var(--bg-surface)` while the on-dark
// rule still set only colour and border — light text on a near-white fill. Each time it was
// found by eye, which is not a process. Every button on every page is measured here.
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

	// THE PRESS. One pixel of travel and the cast shadow going. It is the whole of what was
	// taken from the reference, and a silent regression would leave a button that looks
	// pressable and is not.
	await page.goto(`${ORIGIN}/`, { waitUntil: 'networkidle' });
	const btn = await page.$('main .btn--primary');
	await btn.scrollIntoViewIfNeeded();
	await page.waitForTimeout(350);
	const read = () => page.evaluate(() => {
		const c = getComputedStyle(document.querySelector('main .btn--primary'));
		return { t: c.transform, s: c.boxShadow, bw: c.borderTopWidth };
	});
	const rest = await read();
	const box = await btn.boundingBox();
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.down();
	await page.waitForTimeout(320);
	const down = await read();
	await page.mouse.up();
	ok(rest.t === 'none', `button: sits flush at rest (${rest.t})`);
	ok(rest.s !== 'none', 'button: casts a shadow at rest, for the press to collapse');
	ok(down.t !== 'none' && down.t !== rest.t, `button: travels on press (${down.t})`);
	ok(down.s === 'none', `button: the shadow collapses on press (${down.s})`);
	ok(rest.bw === '2px', `button: the keyline is 2px (${rest.bw})`);
	await page.close();
}

await browser.close();
server.close();

console.log(fail ? `\n  guide browser: ${fail} FAILURES` : `  guide browser: ${VIEWPORTS.length} viewports, every stop on screen, no page errors`);
process.exit(fail ? 1 : 0);
