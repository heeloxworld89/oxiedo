// THE NARRATION — both cuts of the demo tour, as data.
//
// Two versions, each written for its own job (Replay Demo Plan/14_VOICE_SCRIPTS.md):
//   demo — the thesis, one scenario (the dead-layer lesion), done in about a minute and a half;
//   full — the thesis, then all four scenarios, each with its own angle and its own lines.
//
// MARKUP. `{{say|show}}` — the voice reads `say`, the subtitle shows `show`. That is how
// numbers are spoken as words ("one hundred and one") and shown as digits ("101"), and how
// the names are respelled for the voice ("Ormas", "Oxeedo") and spelled right on screen.
//
// NO NUMBER IS TYPED. Every figure below is read from the bundle it describes, or from
// src/data/bounded-chain.json for the chain's layer sizes, and turned into words here.
// scripts/test-tour.mjs regenerates these lines from the same data and fails the build if
// the audio on disk was made from different words.
//
// THE COPY LAWS HOLD: "we" is the company, no "you", no "I", no paper named, nothing
// unbuilt, and the adverse run is narrated as the loss it is.

export const VOICE = {
	id: 'nPczCjzI2devNBz1zQrb', // Brian — chosen by ear, 2026-09-23
	name: 'Brian',
	model: 'eleven_v3',
	settings: { stability: 0.5, similarity_boost: 0.8 },
	format: 'mp3_44100_128',
};

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
	'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

/** British English, as a narrator says it: 101 → "one hundred and one". */
export function words(n) {
	if (!Number.isInteger(n) || n < 0) throw new Error(`words(): ${n} is not a whole number`);
	if (n < 20) return ONES[n];
	if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : '');
	if (n < 1000) {
		const r = n % 100;
		return `${ONES[Math.floor(n / 100)]} hundred${r ? ` and ${words(r)}` : ''}`;
	}
	if (n < 1_000_000) {
		const r = n % 1000;
		const tail = r === 0 ? '' : r < 100 ? ` and ${words(r)}` : `, ${words(r)}`;
		return `${words(Math.floor(n / 1000))} thousand${tail}`;
	}
	throw new Error(`words(): ${n} is out of range`);
}

/** 0.7991 → { say: "seventy-nine point nine", show: "79.9" } — a percentage to one place. */
function pct1(x) {
	const v = Math.round(x * 1000) / 10;
	const [i, d] = v.toFixed(1).split('.');
	return { say: `${words(Number(i))} point ${words(Number(d))}`, show: v.toFixed(1) };
}
const cap = (s) => s[0].toUpperCase() + s.slice(1);
// Subtitles follow print style: counts under ten read as words, everything else as digits.
const shown = (v, say) => (v < 10 ? say : v.toLocaleString('en-GB'));
const n = (v) => `{{${words(v)}|${shown(v, words(v))}}}`;
const N = (v) => `{{${cap(words(v))}|${shown(v, cap(words(v)))}}}`;
const ORMAS = '{{Ormas|ORMAS}}';
const OXIEDO = '{{Oxeedo|Oxiedo}}';

/** `bundles` keyed by scenario; `chain` is bounded-chain.json's list. */
export function scripts(bundles, chain) {
	const dl = bundles['dead-layer-lesion'];
	const fh = bundles['full-hierarchy'];
	const ln = bundles['label-noise'];
	const adv = bundles['adversarial'];
	const need = (cond, what) => { if (!cond) throw new Error(`narration: the bundles no longer support "${what}"`); };

	const dlLost = dl.event.nodes.length;
	const dlNamed = dl.event.detected_nodes.length;
	need(dlNamed === dlLost && dlNamed === 2, 'names both');         // the lines say "both"
	const ops = chain.length;
	const scenarios = 4;

	// Corrupted labels: the rate is in the run's own identifier, e.g. …_symmetric40_s0.
	const rate = Number((ln.conditions.run_id_ormas.match(/symmetric(\d+)/) || [])[1]);
	need(rate === 40, 'two in every five labels');                   // 40% = two in five
	need(ln.event === null, 'no single moment');
	need(ln.summary.baseline_final < ln.summary.baseline_peak, 'the standard network slides');

	const s2 = pct1(fh.summary.ormas_final);
	need(fh.summary.baseline_final <= 0.1 + 1e-9, 'never recovers');
	need(dl.summary.baseline_final <= 0.1 + 1e-9, 'collapses to chance');     // ten classes, 10%
	need(adv.summary.gap_pp < 0, 'the one we lose');
	const behind = Math.round(Math.abs(adv.summary.gap_pp));
	need(behind === 1, 'one point behind');
	// "Halfway through training": the event epoch against the run's own length.
	need(Math.abs(dl.event.epoch / dl.conditions.epochs - 0.5) < 0.05, 'halfway through training');
	need(fh.event.nodes.length === fh.topology.nodes.length, 'every layer destroyed at once');
	need(adv.event.detected_nodes.length === 1, 'flags a layer');

	/* THE DEMO — for someone deciding in ninety seconds whether this is real. It says what
	   the problem is and why it exists (one error signal, measured at the end), what ORMAS
	   changes (every layer gets its own check), shows it working once, and ends on the three
	   things it does. Plain words: "layer", not "stage"; "halfway through training", not
	   "epoch 101"; no term the picture does not define. */
	const demo = [
		/* AFTER THE CLIPS (scripts/narration/clips.mjs): three people have just said it on camera.
		   Over a dense network in training (tour/mesh.ts), the narrator names what sits under
		   every one of those systems — a neural network, trained by small adjustments across a
		   vast number of connections — and on "nobody" a black box shuts over it. The page's
		   own claim, sourced on it: Hinton on 60 Minutes, "we don't really understand exactly
		   how they do those things", and Amodei's "this lack of understanding is essentially
		   unprecedented". The console then opens on a network that can say what happened. */
		['training', 'Underneath every one of these systems is a neural network, trained like this — billions of connections, adjusted a little at a time. … And nobody can see inside.'],
		['hook', `This neural network just lost ${n(dlLost)} of its layers. … And it can tell us exactly which ${n(dlLost)}.`],
		['sealed', 'Normally, that’s impossible. A standard network learns from one error signal, measured at the very end. When something inside it breaks, the score drops — and nothing says where. … That’s the black box.'],
		['open', `So we opened it. ${ORMAS} gives every layer its own small check — and each one reports its own health, live, as the network trains.`],
		['inside', `Here’s that check, taken apart: one short path, the same ${n(ops)} operations in every layer. It can’t grow as the network grows. … So each check belongs to its own layer — and the network can say which part is in trouble.`],
		['test', `Now the proof. Two matched networks: same data, same training. One standard. One ${ORMAS}.`],
		['break-1', `Halfway through training, we destroy ${n(dlLost)} layers in both.`],
		['break-2', 'The standard network collapses to random guessing … and has no way to say what broke.'],
		['break-3', `${ORMAS} names both damaged layers — ${n(dl.event.detected_lag_steps)} training steps later.`],
		['repair', `Then it repairs itself, and writes down every change it makes: which layer, which step, how much. ${N(dl.summary.corrections_total)} changes by the end of the run.`],
		['close', `It tells us what broke. It repairs it. And it keeps the record. … That’s the black box — opened. ${ORMAS}, by ${OXIEDO}.`],
	];

	/* THE FULL TOUR IS THE DEMO, CONTINUED. Founder's note: without the demo's introduction
	   the full tour "cannot start" — a viewer dropped straight into four scenarios has not
	   been told what the black box is or what ORMAS changes. So it opens with the demo's own
	   lines, word for word (the same audio files — the hash is of the words), runs the first
	   failure exactly as the demo does, and only then turns to the other three, each with its
	   own angle: the worst case, the quiet one, and the one we lose. */
	const full = [
		...demo.slice(0, demo.findIndex(([id]) => id === 'close')),
		['bridge', `That was one way to break a network. Here are ${n(scenarios - 1)} more — the worst case, the quiet one … and the one we lose.`],
		['s2-title', 'Scenario two: the worst case.'],
		['s2-break', 'Every convolutional layer, destroyed at once. Nothing healthy left to lean on.'],
		['s2-repair', `${ORMAS} still finds the damage within ${n(fh.event.detected_lag_steps)} steps — and climbs back to {{${s2.say}|${s2.show}}} percent. The standard network never recovers.`],
		['s3-title', 'Scenario three: the quiet one.'],
		['s3-setup', `No crash this time. ${N(rate / 20)} in every ${n(100 / 20)} training labels are simply wrong, from the very first step.`],
		['s3-hold', `The standard network slowly slides. ${ORMAS} holds its ground — and its record shows every intervention along the way.`],
		['s4-title', 'Scenario four: the one we lose.'],
		['s4-setup', 'Weights crafted to look normal while they bend the network.'],
		['s4-result', `${ORMAS} flags a layer ${n(adv.event.detected_lag_steps)} steps later … and still finishes ${n(behind)} point behind the standard network.`],
		['s4-why', 'We show this run on purpose. A record that only shows the wins isn’t a record.'],
		['close', `${N(scenarios)} failures. For every one, a record written while the network trained: which layer, which step, what changed. … That’s the black box — opened. ${ORMAS}, by ${OXIEDO}.`],
	];

	const shape = (list) => list.map(([id, text]) => ({ id, text }));
	return { demo: shape(demo), full: shape(full) };
}

/** Split `{{say|show}}` markup into what is spoken and what is shown, keeping, for every
 *  displayed character, the span of spoken characters that produced it — so the voice's
 *  per-character timestamps can be carried across to the subtitle's words. */
export function parse(text) {
	const segs = [];
	const re = /\{\{([^|}]+)\|([^}]+)\}\}/g;
	let last = 0;
	for (let m; (m = re.exec(text));) {
		if (m.index > last) segs.push({ say: text.slice(last, m.index), show: text.slice(last, m.index), literal: true });
		segs.push({ say: m[1], show: m[2], literal: false });
		last = re.lastIndex;
	}
	if (last < text.length) segs.push({ say: text.slice(last), show: text.slice(last), literal: true });
	let spoken = '';
	let display = '';
	const map = []; // map[displayIndex] = [spokenStart, spokenEnd)
	for (const s of segs) {
		const s0 = spoken.length;
		spoken += s.say;
		for (let i = 0; i < s.show.length; i++) {
			map.push(s.literal ? [s0 + i, s0 + i + 1] : [s0, s0 + s.say.length]);
		}
		display += s.show;
	}
	return { spoken, display, map };
}
