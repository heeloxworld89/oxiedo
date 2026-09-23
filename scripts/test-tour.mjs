// Test for the demo tour ("Play the demo"). Run by `npm run verify`.
//
// TWO HALVES.
//
// THE NARRATION, without a browser. Every line of both cuts is regenerated here from the
// bundles and bounded-chain.json (scripts/narration/lines.mjs), and the manifests on disk
// must match it word for word, point at audio that exists, and carry word timings that
// make sense. So a bundle that changes under a line fails the build until the line is
// re-voiced: a narrator saying a number the console no longer shows cannot ship.
//
// THE TOUR, in a browser, against the built site. It drives the real console through the
// real controls, so it can only be tested the way it runs. Both cuts are walked silently
// at speed (?tourspeed= scales the tour's clock and the replay together, and a silent run
// takes each line's length from the manifest, so every step happens in the same order and
// at the same relative moment as the voiced one), and the test asserts what a viewer
// would notice if it broke:
//
//   · it finishes, with no page errors, at two desktop sizes;
//   · every line is spoken once, in order, with the subtitle the manifest carries;
//   · every click lands on a visible control, under the tip;
//   · every tag naming a stage names what the archived run's own event record names;
//   · Space pauses, Esc leaves, and the page is left exactly as it was found — nav back,
//     camera at rest, the console paused at the first epoch of the default scenario;
//   · a landing opens straight on the offer (there is no preloader), with running times that
//     match the measured runs; a choice starts that tour in place, voiced; "no thanks" hands
//     over the console with its guided read;
//     the corner button reopens the offer; a shared link lands on the start gate; and the
//     tour is absent where it cannot run: phones, and reduced motion.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadScripts, hashLine } from './build-narration.mjs';
import { parse } from './narration/lines.mjs';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const VOICE = fileURLToPath(new URL('../src/data/narration/', import.meta.url));

let fail = 0;
const ok = (cond, msg) => { if (!cond) { console.log('  FAIL', msg); fail++; } };

// ── 0. The narration, against the data ──────────────────────────────────────────
const CUTS = loadScripts();
const MANIFEST = {};
for (const [cut, lines] of Object.entries(CUTS)) {
	const path = join(VOICE, `${cut}.json`);
	ok(existsSync(path), `narration: ${cut}.json exists — run \`node scripts/build-narration.mjs\``);
	if (!existsSync(path)) continue;
	const m = JSON.parse(readFileSync(path, 'utf8'));
	MANIFEST[cut] = m;
	ok(m.lines.length === lines.length, `narration ${cut}: ${lines.length} lines in the script, ${m.lines.length} in the manifest`);
	lines.forEach((l, i) => {
		const got = m.lines[i];
		const p = parse(l.text);
		ok(got?.id === l.id, `narration ${cut}: line ${i + 1} is "${l.id}" (manifest has "${got?.id}")`);
		if (!got) return;
		ok(got.text === p.display, `narration ${cut}/${l.id}: the subtitle is the script's, filled from today's bundles ("${got.text}" vs "${p.display}") — re-voice it`);
		ok(got.src === `/black-box/voice/${hashLine(p.spoken)}.mp3`, `narration ${cut}/${l.id}: the audio was made from today's words — re-voice it`);
		ok(existsSync(join(DIST, got.src.slice(1))), `narration ${cut}/${l.id}: ${got.src} is in the build`);
		ok(got.duration > 0.5 && got.duration < 20, `narration ${cut}/${l.id}: a plausible length (${got.duration}s)`);
		const shown = got.words.map((w) => w.w).join(' ');
		ok(shown === p.display.split(/\s+/).filter(Boolean).join(' '), `narration ${cut}/${l.id}: timed words spell the subtitle`);
		let prev = -1;
		for (const w of got.words) {
			ok(w.t0 >= prev - 1e-6 && w.t1 >= w.t0 && w.t1 <= got.duration + 0.05, `narration ${cut}/${l.id}: "${w.w}" timed in order (${w.t0}–${w.t1})`);
			prev = w.t0;
		}
	});
	// No line may carry a figure the voice would say differently from the screen.
	for (const l of m.lines) ok(!/\bI\b|\byou\b/i.test(l.text), `narration ${cut}/${l.id}: no "I" and no "you" (${l.text})`);
}

// ── 0b. The hook's clips and headlines, against their sources ───────────────────
const CLIPS = JSON.parse(readFileSync(join(VOICE, 'clips.json'), 'utf8')).lines;
ok(JSON.stringify(CLIPS.map((c) => c.id)) === JSON.stringify(['hinton', 'coxon', 'musk']), `hook: Hinton, then CNN, then Musk (${CLIPS.map((c) => c.id)})`);
const APPROVED = {
	hinton: 'Does humanity know what it\'s doing? No. I think we\'re moving into a period when, for the first time ever, we may have things more intelligent than us.',
	coxon: 'First of all, I assume you are saying literally that you believe that AI could kill us all by the end of the decade? It sounds like something that\'s not real, but I think it is frighteningly real.',
	musk: 'Mark my words, AI is far more dangerous than nukes.',
};
for (const c of CLIPS) {
	ok(c.text === APPROVED[c.id], `hook ${c.id}: the caption is the words spoken ("${c.text}")`);
	for (const f of [c.src, c.video.webm, c.video.mp4, c.video.poster]) {
		ok(existsSync(join(DIST, f.split('?')[0].slice(1))), `hook ${c.id}: ${f.split('?')[0]} is in the build`);
	}
	ok(c.words.map((w) => w.w).join(' ') === c.text, `hook ${c.id}: timed words spell the caption`);
	let prev = -1;
	for (const w of c.words) {
		ok(w.t0 >= prev - 1e-6 && w.t1 >= w.t0 && w.t1 <= c.duration + 0.05, `hook ${c.id}: "${w.w}" timed in order`);
		prev = w.t0;
	}
	ok(c.speakers.length >= 1 && c.speakers.every((sp) => sp.name && sp.at >= 0 && sp.at < c.words.length), `hook ${c.id}: every speaker named and placed`);
	ok(/\b(19|20)\d\d\b/.test(c.source), `hook ${c.id}: carries its source and date (${c.source})`);
}
const hookTotal = CLIPS.reduce((t, c) => t + c.duration, 0);
ok(hookTotal >= 25 && hookTotal <= 34, `hook: about thirty seconds of clips (${hookTotal.toFixed(1)} s)`);
const HEADLINES = JSON.parse(readFileSync(fileURLToPath(new URL('../src/data/hook-headlines.json', import.meta.url)), 'utf8')).headlines;
ok(HEADLINES.length >= 10, `hook: at least ten verified headlines (${HEADLINES.length})`);
for (const h of HEADLINES) {
	ok(h.outlet && h.date && h.text && /^https:\/\//.test(h.url ?? ''), `hook headline carries outlet, date and the url it was checked at: "${h.text.slice(0, 50)}"`);
}

// ── the browser half ───────────────────────────────────────────────────────────
let chromium;
try {
	({ chromium } = await import('playwright'));
} catch {
	console.log('  tour browser: SKIPPED (playwright not installed — `npm i`)');
	process.exit(fail ? 1 : 0);
}

const MIME = {
	'.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
	'.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
	'.xml': 'application/xml', '.txt': 'text/plain', '.mp3': 'audio/mpeg',
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
	console.log('  tour browser: SKIPPED (no browser binary — `npx playwright install chromium`)');
	server.close();
	process.exit(fail ? 1 : 0);
}

const bundle = (k) => JSON.parse(readFileSync(join(DIST, 'black-box/runs', `${k}.json`), 'utf8'));
const B = Object.fromEntries(['dead-layer-lesion', 'full-hierarchy', 'label-noise', 'adversarial'].map((k) => [k, bundle(k)]));
const namedTags = (k) => {
	const ev = B[k].event;
	const ids = ev.detected_nodes?.length ? ev.detected_nodes : ev.nodes;
	return ids.map((id) => `layer ${id}: ${ev.detected_diagnosis ?? ev.type}`);
};

async function runTour(page, qs, timeout = 90000) {
	const errors = [];
	page.on('pageerror', (e) => errors.push(String(e)));
	page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
	await page.goto(`${ORIGIN}/black-box?${qs}`);
	await page.waitForFunction(() => window.__tourState && !['waiting', 'running', 'gate'].includes(window.__tourState), null, { timeout });
	const log = await page.evaluate(() => window.__tourLog ?? []);
	const state = await page.evaluate(() => window.__tourState);
	return { errors, log, state };
}

function assertLines(log, cut, label) {
	const spoken = log.filter((e) => e.id === 'line');
	const want = MANIFEST[cut]?.lines ?? [];
	ok(JSON.stringify(spoken.map((e) => e.detail.line)) === JSON.stringify(want.map((l) => l.id)),
		`${label}: every line spoken once, in order (${spoken.map((e) => e.detail.line).join(', ')})`);
	spoken.forEach((e, i) => ok(e.detail.text === want[i]?.text, `${label}: "${e.detail.line}" carries its manifest subtitle`));
}

function assertHook(log, label) {
	const clips = log.filter((e) => e.id === 'clip');
	ok(JSON.stringify(clips.map((e) => e.detail.clip)) === JSON.stringify(CLIPS.map((c) => c.id)), `${label}: the three clips, in order (${clips.map((e) => e.detail.clip)})`);
	clips.forEach((e, i) => ok(e.detail.text === CLIPS[i]?.text, `${label}: ${e.detail.clip} carries its caption`));
	const cut = log.find((e) => e.id === 'hook-cut');
	const first = log.find((e) => e.id === 'line');
	ok(cut && first && first.detail.line === 'training' && first.t >= cut.t, `${label}: the narrator's first line comes after the cut (${first?.detail.line})`);
	// THE BRIDGE: a network trains under that line, and the box shuts on "nobody".
	const mesh = log.find((e) => e.id === 'mesh');
	const shut = log.find((e) => e.id === 'mesh-shut');
	const nobody = MANIFEST.demo?.lines.find((l) => l.id === 'training')?.words.find((w) => /^nobody/i.test(w.w));
	ok(mesh && mesh.t >= cut.t && mesh.t <= first.t, `${label}: the training mesh fills the screen from the cut`);
	// A sped-up clock can only act on a frame, and at 12× one frame is a fifth of a second
	// of tour time — more under load. At 1× this lands on the word.
	const speed = log.find((e) => e.id === 'start')?.detail.speed ?? 1;
	const slack = 0.15 + 0.08 * speed;
	ok(shut && nobody && Math.abs((shut.t - first.t) / 1000 - nobody.t0) < slack, `${label}: the box shuts on "nobody" (${shut ? ((shut.t - first.t) / 1000).toFixed(2) : '—'} s vs ${nobody?.t0} s, ±${slack.toFixed(2)})`);
}

function assertClicks(log, label, min) {
	const clicks = log.filter((e) => e.id === 'click');
	ok(clicks.length >= min, `${label}: the cursor pressed at least ${min} controls (${clicks.length})`);
	for (const c of clicks) {
		const d = c.detail;
		const [l, t, r, b] = d.rect;
		ok(d.visible, `${label}: ${d.target} was on screen when pressed`);
		ok(d.x >= l - 2 && d.x <= r + 2 && d.y >= t - 2 && d.y <= b + 2,
			`${label}: the tip was on ${d.target} when it pressed (${d.x},${d.y} vs ${d.rect})`);
	}
}

async function assertRestored(page, label) {
	const st = await page.evaluate(() => {
		const rp = document.querySelector('.rp.rp--app');
		const nav = document.querySelector('.nav');
		return {
			tour: document.documentElement.getAttribute('data-tour'),
			touring: rp?.classList.contains('is-touring'),
			transform: rp?.querySelector('.rp-console')?.style.transform ?? '',
			url: location.search,
			rate: rp?.querySelector('[data-rate][aria-pressed="true"]')?.getAttribute('data-rate'),
			scenario: rp?.querySelector('[data-rail-scenario][aria-pressed="true"]')?.getAttribute('data-rail-scenario'),
			playing: rp?.classList.contains('is-running'),
			epoch: rp?.querySelector('[data-epoch]')?.textContent,
			cursorHidden: document.querySelector('[data-dt-cursor]')?.hidden,
			shieldHidden: document.querySelector('[data-dt-shield]')?.hidden,
			curtainHidden: document.querySelector('[data-dt-curtain]')?.hidden,
			subOn: document.querySelector('[data-dt-sub]')?.classList.contains('is-on'),
			blurred: document.querySelectorAll('.dt-blur').length,
			navVisible: nav ? getComputedStyle(nav).visibility === 'visible' : true,
			orientShown: (() => { const o = rp?.querySelector('.rp-orient'); return !o || getComputedStyle(o).display !== 'none'; })(),
			guideOpen: !!document.querySelector('.rp-guide:not([hidden])'),
			hookHidden: (document.querySelector('[data-dt-hook]')?.hidden ?? true) && (document.querySelector('[data-dt-mesh]')?.hidden ?? true),
			videosPlaying: [...document.querySelectorAll('[data-dt-hook] video')].filter((v) => !v.paused).length,
			newsLeft: document.querySelectorAll('.dt-news, .dt-echo').length,
		};
	});
	ok(st.tour === 'done', `${label}: html[data-tour] ends as "done" (got ${st.tour})`);
	ok(!st.touring, `${label}: the console is no longer marked as touring`);
	ok(st.transform === '', `${label}: the camera is back at rest (transform "${st.transform}")`);
	ok(!/tour=|rec=|tourspeed=|mute=/.test(st.url), `${label}: the URL is clean (${st.url})`);
	ok(st.rate === '1', `${label}: the rate is back at 1x (got ${st.rate})`);
	ok(st.scenario === 'dead-layer-lesion', `${label}: the default scenario is back (got ${st.scenario})`);
	ok(!st.playing, `${label}: the run is paused`);
	ok(/^epoch 0 \//.test(st.epoch ?? ''), `${label}: the run is at the first epoch (got ${st.epoch})`);
	ok(st.cursorHidden && st.shieldHidden && st.curtainHidden, `${label}: cursor, shield and curtain are gone`);
	ok(!st.subOn, `${label}: no subtitle left on screen`);
	ok(st.blurred === 0, `${label}: nothing left out of focus (${st.blurred})`);
	ok(st.navVisible && st.orientShown, `${label}: the nav and the orientation stripe are back`);
	ok(!st.guideOpen, `${label}: no guided read opened over the top`);
	ok(st.hookHidden && st.videosPlaying === 0 && st.newsLeft === 0, `${label}: the hook is gone — no stage, no mesh, no video playing, no headline left (${JSON.stringify({ h: st.hookHidden, v: st.videosPlaying, n: st.newsLeft })})`);
}

// ── 1. The demo cut, at two desktop sizes ───────────────────────────────────────
const DEMO_BEATS = ['beat:warnings', 'beat:training', 'beat:hook', 'beat:sealed', 'beat:inside', 'beat:test', 'beat:break', 'beat:repair', 'beat:close'];
const MEASURED = {};
/** The running time a viewer would see at 1×, from a run at `speed`: loading a scenario takes
 *  real time, which a sped-up clock counts `speed` times over, so that part is scaled back. */
const runLength = (log, speed) => {
	const st = log.find((e) => e.id === 'start');
	const end = log.find((e) => e.id === 'end');
	if (!st || !end) return NaN;
	const loads = log.filter((e) => e.id === 'scenario').reduce((s, e) => s + (e.detail.wait ?? 0), 0);
	return (end.t - st.t - loads + loads / speed) / 1000;
};
for (const [w, h] of [[1440, 900], [1920, 1080]]) {
	const label = `demo ${w}x${h}`;
	const page = await browser.newPage({ viewport: { width: w, height: h } });
	const { errors, log, state } = await runTour(page, 'tour=demo&tourspeed=12');
	ok(state === 'ended', `${label}: the tour ends (state ${state})`);
	ok(errors.length === 0, `${label}: no page errors (${errors.join(' | ')})`);
	const beats = log.filter((e) => e.id.startsWith('beat:')).map((e) => e.id);
	ok(JSON.stringify(beats) === JSON.stringify(DEMO_BEATS), `${label}: beats in order (${beats.join(', ')})`);
	assertLines(log, 'demo', label);
	assertHook(log, label);
	assertClicks(log, label, 6);
	ok(log.some((e) => e.id === 'click' && e.detail.target === 'open-box'), `${label}: the cursor opens the box`);
	ok(log.some((e) => e.id === 'kinetic' && e.detail.word === 'SEALED') && log.some((e) => e.id === 'kinetic' && e.detail.word === 'OPENED'),
		`${label}: SEALED, then OPENED`);
	const ev = B['dead-layer-lesion'].event;
	ok(log.some((e) => e.id === 'event' && e.detail.epoch === ev.epoch), `${label}: the impact lands on the archived event, epoch ${ev.epoch}`);
	ok(log.some((e) => e.id === 'hold'), `${label}: the damage is held on screen while it is named`);
	const tags = log.filter((e) => e.id === 'tag' && /^layer /.test(e.detail.k ?? '')).map((e) => `${e.detail.k}: ${e.detail.v}`);
	const want = namedTags('dead-layer-lesion');
	ok(tags.length >= want.length * 2 && tags.every((t) => want.includes(t)),
		`${label}: every stage tag names what the run's event record names (${[...new Set(tags)].join(' | ')} vs ${want.join(' | ')})`);
	ok(log.some((e) => e.id === 'finale'), `${label}: the end title comes up`);
	await assertRestored(page, label);
	ok(await page.evaluate(() => !document.querySelector('[data-dt-end]')?.hidden), `${label}: the end card is shown`);
	await page.close();
}

// ── 2. The full cut ─────────────────────────────────────────────────────────────
{
	const label = 'full';
	const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
	const { errors, log, state } = await runTour(page, 'tour=full&tourspeed=20', 150000);
	ok(state === 'ended', `${label}: the tour ends (state ${state})`);
	ok(errors.length === 0, `${label}: no page errors (${errors.join(' | ')})`);
	// THE FULL TOUR IS THE DEMO, CONTINUED: the same opening beats, in the same order, first.
	const beats = log.filter((e) => e.id.startsWith('beat:')).map((e) => e.id);
	const opening = DEMO_BEATS.filter((b) => b !== 'beat:close');
	ok(JSON.stringify(beats.slice(0, opening.length)) === JSON.stringify(opening), `${label}: opens exactly as the demo does (${beats.join(', ')})`);
	const demoLines = (MANIFEST.demo?.lines ?? []).filter((l) => l.id !== 'close').map((l) => l.src);
	const fullLines = (MANIFEST.full?.lines ?? []).slice(0, demoLines.length).map((l) => l.src);
	ok(demoLines.length > 0 && JSON.stringify(demoLines) === JSON.stringify(fullLines), `${label}: the introduction is the demo's own recording, line for line`);
	assertLines(log, 'full', label);
	assertHook(log, label);
	assertClicks(log, label, 16);
	const scen = log.filter((e) => e.id === 'scenario').map((e) => e.detail.key);
	ok(JSON.stringify(scen) === JSON.stringify(['full-hierarchy', 'label-noise', 'adversarial']), `${label}: the scenarios in order (${scen.join(', ')})`);
	const chapters = log.filter((e) => e.id === 'chapter').map((e) => e.detail.num);
	ok(JSON.stringify(chapters.filter(Boolean)) === JSON.stringify(['01', '02', '03', '04']), `${label}: four chapters (${chapters.join(', ')})`);
	for (const k of ['full-hierarchy', 'adversarial']) {
		const want = namedTags(k);
		ok(want.every((t) => log.some((e) => e.id === 'tag' && `${e.detail.k}: ${e.detail.v}` === t)), `${label}: ${k} tags name ${want.join(' | ')}`);
	}
	await assertRestored(page, label);
	await page.close();
}

// ── 3. Space pauses, Esc leaves, presentation mode comes and goes ───────────────
{
	const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
	await page.goto(`${ORIGIN}/black-box?tour=demo&tourspeed=3`);
	await page.waitForFunction(() => (window.__tourLog ?? []).some((e) => e.id === 'beat:inside'), null, { timeout: 40000 });
	const present = await page.evaluate(() => ({
		nav: getComputedStyle(document.querySelector('.nav')).visibility,
		orient: getComputedStyle(document.querySelector('.rp-orient')).display,
		sub: document.querySelector('[data-dt-sub]').classList.contains('is-on'),
	}));
	ok(present.nav === 'hidden' && present.orient === 'none', `presentation: the nav and the stripe step away (${JSON.stringify(present)})`);
	ok(present.sub, 'presentation: the subtitle is up while a line is spoken');
	await page.keyboard.press('Space');
	await page.waitForFunction(() => window.__tourLog.some((e) => e.id === 'pause'));
	const before = await page.evaluate(() => window.__tourLog.length);
	await page.waitForTimeout(700);
	const after = await page.evaluate(() => window.__tourLog.length);
	ok(after === before, `pause: nothing happens while paused (${before} → ${after} steps)`);
	ok(await page.evaluate(() => !document.querySelector('[data-dt-paused]').hidden), 'pause: the paused notice is shown');
	await page.keyboard.press('Space');
	await page.waitForFunction(() => window.__tourLog.some((e) => e.id === 'resume'));
	await page.keyboard.press('Escape');
	await page.waitForFunction(() => window.__tourState === 'aborted', null, { timeout: 10000 });
	await assertRestored(page, 'esc');
	ok(await page.evaluate(() => !document.querySelector('[data-dt-launch]').hidden), 'esc: the launcher is back');
	await page.close();
}

// ── 4. How long each takes — measured at 3×, for the offer's labels ──────────────
/* A sped-up clock overshoots every wait by up to one of its frames, and over a whole tour
   that adds up: at 12× the demo read ten seconds long, and at 6× the full tour varied by five
   seconds from one run to the next. At 3× the overshoot is a few seconds and steady, which is
   close enough to hold a label to. */
for (const cut of ['demo', 'full']) {
	const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
	const { log, state } = await runTour(page, `tour=${cut}&tourspeed=3`, 300000);
	ok(state === 'ended', `timing ${cut}: the tour ends (state ${state})`);
	MEASURED[cut] = runLength(log, 3);
	await page.close();
}

// ── 5. How it starts, and where it does not ─────────────────────────────────────
const parseTime = (t) => {
	const m = /(?:(\d+)\s*min)?\s*(?:(\d+)\s*s)?/.exec(t ?? '');
	return (Number(m?.[1] ?? 0) * 60) + Number(m?.[2] ?? 0);
};
{
	// A LANDING OPENS STRAIGHT ON THE OFFER — there is no preloader — and nothing starts under it.
	const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
	const errors = [];
	page.on('pageerror', (e) => errors.push(String(e)));
	const t0 = Date.now();
	await page.goto(`${ORIGIN}/black-box`);
	await page.waitForFunction(() => window.__tourState === 'offer', null, { timeout: 15000 });
	ok(Date.now() - t0 < 5000, `offer: up within moments of landing (${Date.now() - t0} ms)`);
	ok(await page.evaluate(() => !document.querySelector('[data-coldopen-root]') && !document.documentElement.hasAttribute('data-coldopen')), 'landing: there is no preloader');
	ok(await page.isVisible('[data-dt-offer]'), 'offer: the first thing on the page');
	await page.waitForTimeout(1500);
	const under = await page.evaluate(() => ({
		guided: !!document.querySelector('.rp.is-guided'),
		playing: document.querySelector('.rp.rp--app')?.classList.contains('is-running'),
		focus: document.activeElement?.getAttribute('data-dt-choose'),
		times: Object.fromEntries([...document.querySelectorAll('[data-dt-time]')].map((e) => [e.getAttribute('data-dt-time'), e.textContent])),
	}));
	ok(!under.guided && !under.playing, 'offer: no guided read and no autoplay under it');
	ok(under.focus === 'demo', `offer: the demo is focused, ready for Enter (${under.focus})`);
	/* THE LABELS ARE HELD TO THE RUNS. They were set from runs at 1× (2:16 and 3:42 on
	   2026-09-24, with the hook and the bridge) and are checked against the 3× runs above, which read a few
	   seconds long:
	   a tour that grows or shrinks by more than about ten seconds fails here until its label
	   is re-measured. */
	for (const cut of ['demo', 'full']) {
		const shown = parseTime(under.times[cut]);
		const got = MEASURED[cut];
		ok(got >= shown - 10 && got <= shown + 15, `offer: the ${cut} is labelled ${under.times[cut]}, measured ${got?.toFixed(1)} s at 3×`);
	}
	// "No thanks" hands the console over, with its guided read.
	await page.click('[data-dt-decline]');
	ok(!(await page.isVisible('[data-dt-offer]')), 'decline: the offer closes');
	ok(await page.evaluate(() => !document.documentElement.hasAttribute('data-tour')), 'decline: no tour state is left behind');
	await page.waitForFunction(() => !!document.querySelector('.rp.is-guided'), null, { timeout: 15000 });
	ok(true, 'decline: the guided read opens');
	// The corner button reopens the offer — reachable, and clear of the guide's Next.
	await page.waitForSelector('[data-dt-open]', { state: 'visible', timeout: 10000 });
	const clash = await page.evaluate(() => {
		const a = document.querySelector('[data-dt-launch]').getBoundingClientRect();
		const n = document.querySelector('[data-guide-next]')?.getBoundingClientRect();
		return !!n && a.left < n.right && a.right > n.left && a.top < n.bottom && a.bottom > n.top;
	});
	ok(!clash, 'launcher: visible during the guided read without covering its Next button');
	await page.click('[data-dt-open]');
	await page.waitForFunction(() => window.__tourState === 'offer');
	ok(await page.isVisible('[data-dt-offer]'), 'launcher: reopens the offer');
	await page.keyboard.press('Escape');
	await page.waitForFunction(() => window.__tourState === 'declined');
	ok(errors.length === 0, `offer: no page errors (${errors.join(' | ')})`);
	await page.close();
}
{
	// CHOOSING STARTS IT IN PLACE, voiced, and the title sequence never plays under it.
	for (const cut of ['demo', 'full']) {
		const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
		await page.goto(`${ORIGIN}/black-box`);
		await page.waitForFunction(() => window.__tourState === 'offer', null, { timeout: 15000 });
		const url0 = page.url();
		await page.click(`[data-dt-choose="${cut}"]`);
		await page.waitForFunction(() => (window.__tourLog ?? []).some((e) => e.id === 'clip'), null, { timeout: 20000 });
		const st = await page.evaluate(() => ({
			voiced: window.__tourLog.find((e) => e.id === 'start')?.detail.voiced,
			cut: window.__tourLog.find((e) => e.id === 'start')?.detail.cut,
			first: window.__tourLog.find((e) => e.id === 'clip')?.detail.clip,
			curtain: !!document.querySelector('[data-coldopen-root]'),
		}));
		ok(page.url() === url0, `choose ${cut}: starts in place, without a reload`);
		ok(st.voiced === true && st.cut === cut, `choose ${cut}: the ${cut} starts, with sound (${JSON.stringify(st)})`);
		ok(st.first === 'hinton', `choose ${cut}: opens on the hook, Hinton first (${st.first})`);
		ok(!st.curtain, `choose ${cut}: no preloader anywhere`);
		await page.keyboard.press('Escape');
		await page.waitForFunction(() => window.__tourState === 'aborted', null, { timeout: 10000 });
		await assertRestored(page, `choose ${cut}, esc`);
		await page.close();
	}

	// A shared link lands on the start gate, with no cold open under it.
	const link = await browser.newPage({ viewport: { width: 1440, height: 900 } });
	await link.goto(`${ORIGIN}/black-box?tour=demo`);
	await link.waitForFunction(() => window.__tourState === 'gate', null, { timeout: 10000 });
	ok(await link.isVisible('[data-dt-gate-play]'), 'link: the start gate is shown');
	ok(await link.evaluate(() => !document.querySelector('[data-coldopen-root]')), 'link: the cold open stands down for the tour');
	await link.keyboard.press('Escape');
	await link.waitForFunction(() => window.__tourState === 'skipped');
	ok(await link.evaluate(() => !document.documentElement.hasAttribute('data-tour') && !/tour=/.test(location.search)), 'link: Esc at the gate leaves a clean console');
	await link.close();

	const phone = await browser.newPage({ viewport: { width: 390, height: 844 } });
	await phone.goto(`${ORIGIN}/black-box?tour=demo`);
	await phone.waitForTimeout(600);
	ok(!(await phone.isVisible('[data-dt-open]')), 'launcher: absent on a phone');
	ok(!(await phone.isVisible('[data-dt-offer]')), 'offer: absent on a phone');
	ok(await phone.evaluate(() => !document.documentElement.hasAttribute('data-tour')), 'phone: ?tour= is ignored below 1240px');
	await phone.close();

	const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
	const rm = await ctx.newPage();
	await rm.goto(`${ORIGIN}/black-box?tour=demo`);
	await rm.waitForTimeout(600);
	ok(!(await rm.isVisible('[data-dt-open]')), 'launcher: absent under reduced motion');
	ok(!(await rm.isVisible('[data-dt-offer]')), 'offer: absent under reduced motion');
	ok(await rm.evaluate(() => !document.documentElement.hasAttribute('data-tour')), 'reduced motion: ?tour= is ignored');
	await ctx.close();
}

await browser.close();
server.close();
if (fail) {
	console.log(`\n  tour: ${fail} failure(s)\n`);
	process.exit(1);
}
console.log('  tour: narration matches the data; both cuts, two viewports, the offer and its timings, pause, exit, restore, launcher and gate all hold');
