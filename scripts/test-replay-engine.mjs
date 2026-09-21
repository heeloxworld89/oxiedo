// Engine tests for the replay demo. Run by `npm run verify`.
//
// The engine keeps two mappings apart on purpose: playback is non-linear in
// epochs so the failure is legible, while the scrubber is linear because a
// person dragging a handle expects uniform travel. Confusing them is the bug
// this file exists to catch, so the round-trip and monotonicity checks below
// are the load-bearing ones.
//
// It also asserts that the event lands inside the slowed segment. If a future
// bundle moved the lesion, the beat would silently play at act-1 speed and the
// whole demo would lose its point without anything failing to build.

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const out = await build({
	entryPoints: [fileURLToPath(new URL('../src/scripts/replay/engine.ts', import.meta.url))],
	bundle: true, write: false, format: 'esm', target: 'es2022',
});
const mod = await import('data:text/javascript;base64,' +
	Buffer.from(out.outputFiles[0].text).toString('base64'));
const { ReplayEngine } = mod;

const gout = await build({
	entryPoints: [fileURLToPath(new URL('../src/scripts/replay/guide.ts', import.meta.url))],
	bundle: true, write: false, format: 'esm', target: 'es2022',
});
const { buildGuide } = await import('data:text/javascript;base64,' +
	Buffer.from(gout.outputFiles[0].text).toString('base64'));

globalThis.performance = globalThis.performance ?? { now: () => Date.now() };
globalThis.requestAnimationFrame = () => 0;
globalThis.cancelAnimationFrame = () => {};

let fail = 0;
const ok = (c, m) => { if (!c) { console.log('  FAIL', m); fail++; } else console.log('  pass', m); };

// Derived from the directory, never hardcoded: a fixed list silently diverged
// from the bundles the moment a scenario was swapped, and the failure was a
// thrown ENOENT rather than a readable assertion.
const runsDir = new URL('../public/black-box/runs/', import.meta.url);
const keys = readdirSync(runsDir).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5)).sort();
if (!keys.length) { console.log('  FAIL no bundles found'); process.exit(1); }
console.log(`scenarios: ${keys.join(', ')}`);

for (const key of keys) {
	const b = JSON.parse(readFileSync(
		new URL(`../public/black-box/runs/${key}.json`, import.meta.url), 'utf8'));
	const e = new ReplayEngine(b);
	console.log(`\n${key}  lastEpoch=${e.lastEpoch} total=${e.totalSeconds}s segments=${e.segments.length}`);

	ok(e.lastEpoch === b.series.ormas.accuracy.length - 1, 'lastEpoch matches series length');
	ok(e.epochAt(0) === 0, 'epochAt(0) is epoch 0');
	ok(Math.abs(e.epochAt(e.totalSeconds) - e.lastEpoch) < 0.01, 'epochAt(total) is last epoch');

	// timeAt / epochAt must round-trip, or the scrubber and the clock disagree.
	let maxErr = 0;
	for (let ep = 0; ep <= e.lastEpoch; ep++) {
		maxErr = Math.max(maxErr, Math.abs(e.epochAt(e.timeAt(ep)) - ep));
	}
	ok(maxErr < 0.01, `epochAt(timeAt(e)) round-trips for every epoch (max err ${maxErr.toExponential(1)})`);

	// Monotonic: time must never go backwards as epochs advance.
	let mono = true, prev = -1;
	for (let ep = 0; ep <= e.lastEpoch; ep++) { const t = e.timeAt(ep); if (t < prev) mono = false; prev = t; }
	ok(mono, 'timeAt is monotonic');

	// The event must land inside the slow segment, or the beat is missed.
	// A scenario with no inflicted event (corrupted labels) skips this block
	// and is checked for the single-segment shape instead.
	const ev = b.event;
	if (!ev) {
		ok(e.segments.length === 1, 'an event-free run plays as one continuous segment');
		ok(e.actAt(e.lastEpoch) === 'repair' || e.actAt(e.lastEpoch) === 'record',
		   'an event-free run still resolves an act at the end');
	}
	if (ev) {
		const seg = e.segments.find(s => ev.epoch > s.fromEpoch && ev.epoch <= s.toEpoch);
		ok(seg?.act === 'event', `event epoch ${ev.epoch} falls in the slowed segment`);
		const secPerEpochEvent = seg ? seg.seconds / (seg.toEpoch - seg.fromEpoch) : 0;
		const first = e.segments[0];
		const secPerEpochBefore = first.seconds / (first.toEpoch - first.fromEpoch);
		ok(secPerEpochEvent > secPerEpochBefore * 5,
			`event segment is much slower than act 1 (${secPerEpochEvent.toFixed(2)}s vs ${secPerEpochBefore.toFixed(3)}s per epoch)`);
		ok(e.actAt(ev.epoch - 5) === 'before', 'before the event the act is "before"');
		ok(e.actAt(e.lastEpoch) === 'record', 'at the end the act is "record"');
	}

	e.seekEpoch(-50); ok(e.epoch === 0, 'seek below range clamps to 0');
	e.seekEpoch(9999); ok(Math.abs(e.epoch - e.lastEpoch) < 0.01, 'seek above range clamps to last');
}
// ─── GUIDED READ ──────────────────────────────────────────────────────────────
//
// Every stop's prose is generated from bundle fields, so the risk is not a typo — it is a
// stop quoting a number the run does not contain, or pointing at an epoch or a panel that
// does not exist. Those are the four things checked here, per scenario.
//
// The last check is the one that matters most. The adversarial run LOSES, by 1.09 points,
// and its final stop has to say so. A guided read that narrates three wins and goes quiet
// on the fourth is worth less than none, because the reader being walked through this is
// deciding whether the account can be trusted at exactly that moment.
const PANELS = ['.rp-panes', '.rp-verdict', '.rp-ledger'];
/* The transport. Not a panel: nothing is read here, it is the thing the closing stop
   asks the reader to press. */
const CTA_TARGET = '.rp-controls';
console.log('\nguided read');
for (const key of keys) {
	const b = JSON.parse(readFileSync(
		new URL(`../public/black-box/runs/${key}.json`, import.meta.url), 'utf8'));
	const g = buildGuide(b);
	const last = b.series.ormas.accuracy.length - 1;

	/* THE GUIDE ENDS ON A CALL TO ACTION, AND IT IS NOT PART OF THE NARRATIVE.
	   The read finishes by rewinding the run to epoch 0 and pointing at the transport,
	   so the reader who has just been shown the argument can run it themselves. That
	   closing stop therefore breaks three things every OTHER stop must satisfy: it goes
	   backwards in time, it targets a control strip rather than a data panel, and it
	   does not quote a result. Those are the properties that make it the call to action.

	   So it is separated out and checked on its own terms, rather than the narrative
	   rules being loosened to accommodate it — which would have stopped them catching a
	   genuinely out-of-order stop in the middle of the read. */
	const cta = g.filter((s) => s.target === CTA_TARGET);
	const story = g.slice(0, g.length - cta.length);

	ok(cta.length === 1, `${b.key}: exactly one closing call to action`);
	ok(g[g.length - 1].target === CTA_TARGET,
		`${b.key}: the call to action is the last stop`);
	ok(cta[0]?.epoch === 0,
		`${b.key}: the call to action rewinds the run to the first epoch`);

	ok(story.length >= 4, `${b.key}: ${story.length} narrative stops`);
	ok(g.every((s) => s.epoch >= 0 && s.epoch <= last),
		`${b.key}: every stop lands inside the run`);
	ok(story.every((s, i) => i === 0 || s.epoch >= story[i - 1].epoch),
		`${b.key}: stops advance monotonically through the run`);
	ok(story.every((s) => PANELS.includes(s.target)),
		`${b.key}: every stop lights a panel that exists`);
	ok(g.every((s) => s.title && s.body && s.eyebrow),
		`${b.key}: no stop is missing copy`);
	ok(!g.some((s) => /undefined|NaN|\[object/.test(s.body + s.title + s.eyebrow)),
		`${b.key}: no stop interpolated a missing field`);
	ok(story[story.length - 1].epoch === last,
		`${b.key}: the last narrative stop is the end of the run`);

	if (b.event) {
		const shock = g.find((s) => s.eyebrow === `EPOCH ${b.event.epoch}`);
		ok(!!shock, `${b.key}: a stop is pinned to the event epoch`);
		const named = g.find((s) => s.target === '.rp-ledger');
		ok(named?.body.includes(String(b.event.detected_step).replace(/\B(?=(\d{3})+(?!\d))/g, ',')),
			`${b.key}: the detection stop quotes the archived detection step`);
	}

	const gap = b.summary.gap_pp;
	/* The result is quoted by the last NARRATIVE stop. The call to action after it
	   deliberately states no number. */
	const closing = story[story.length - 1].body;
	if (gap < 0) {
		ok(/finishes ahead/.test(closing) && closing.includes(Math.abs(gap).toFixed(2)),
			`${b.key}: the adverse result is stated as a loss of ${Math.abs(gap).toFixed(2)} points`);
	} else {
		ok(closing.includes(gap.toFixed(2)),
			`${b.key}: the closing stop quotes the archived gap of ${gap.toFixed(2)} points`);
	}
}

console.log(fail ? `\n${fail} FAILURES` : `\nall engine checks pass`);
process.exit(fail ? 1 : 0);
