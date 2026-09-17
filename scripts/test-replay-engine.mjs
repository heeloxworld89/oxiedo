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

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const out = await build({
	entryPoints: [fileURLToPath(new URL('../src/scripts/replay/engine.ts', import.meta.url))],
	bundle: true, write: false, format: 'esm', target: 'es2022',
});
const mod = await import('data:text/javascript;base64,' +
	Buffer.from(out.outputFiles[0].text).toString('base64'));
const { ReplayEngine } = mod;

globalThis.performance = globalThis.performance ?? { now: () => Date.now() };
globalThis.requestAnimationFrame = () => 0;
globalThis.cancelAnimationFrame = () => {};

let fail = 0;
const ok = (c, m) => { if (!c) { console.log('  FAIL', m); fail++; } else console.log('  pass', m); };

for (const key of ['dead-layer-lesion','full-hierarchy','adversarial','weight-explosion']) {
	const b = JSON.parse(readFileSync(
		new URL(`../public/demo/runs/${key}.json`, import.meta.url), 'utf8'));
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
	const ev = b.event;
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
console.log(fail ? `\n${fail} FAILURES` : `\nall engine checks pass`);
process.exit(fail ? 1 : 0);
