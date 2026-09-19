// The guided read: a small number of stops, each pinned to an epoch the archived run
// itself defines, each lighting the one panel that answers a question at that moment.
//
// WHY NOT A CONVENTIONAL PRODUCT TOUR. A coachmark tour invents a step order and walks a
// visitor through controls. This walks them through a TRAINING RUN — the timeline already
// exists, the beats are already in the bundle (record.shock, event.detected_step,
// record.recovery), and every figure quoted below is read from the same fields the 97
// assertions in verify-replay-bundle.py already check. Nothing here is authored prose with
// numbers typed into it, so a stop cannot drift from the run it describes.
//
// THE COPY IS GENERATED FROM THE DATA, INCLUDING WHEN THE DATA IS UNFLATTERING. The
// adversarial scenario finishes 1.09 points BEHIND the standard network. Its final stop says
// so, because a guided read that narrates three wins and goes quiet on the fourth is worth
// less than no guided read at all — the person being walked through this is evaluating
// whether the account can be trusted, and that is the moment it is being decided.
import type { Bundle } from './types';

export interface GuideStep {
	/** Epoch the run is taken to before this stop is shown. */
	epoch: number;
	/** Selector, within the component, of the panel to light. */
	target: string;
	eyebrow: string;
	title: string;
	body: string;
}

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const int = (x: number) => x.toLocaleString('en-GB');

/** Nodes read as "component 1", or "components 1 and 2" — never a bare array. */
function nameNodes(ids: number[]): string {
	if (ids.length === 0) return 'the affected component';
	if (ids.length === 1) return `component ${ids[0]}`;
	const head = ids.slice(0, -1).join(', ');
	return `components ${head} and ${ids[ids.length - 1]}`;
}

export function buildGuide(bundle: Bundle): GuideStep[] {
	const last = bundle.series.ormas.accuracy.length - 1;
	const s = bundle.summary as Record<string, number>;
	const rec = bundle.record as Record<string, Record<string, number> | undefined>;
	const ev = bundle.event;
	const c = bundle.conditions;
	const spe = c.steps_per_epoch || 391;

	const steps: GuideStep[] = [];

	// 1. What is on screen. Nobody reads a diagram they have not been told the shape of.
	steps.push({
		epoch: 0,
		target: '.rp-panes',
		eyebrow: 'THE SETUP',
		title: 'Two networks, identical shape',
		body:
			`Left, a standard convolutional network, sealed. Right, the same network trained under ` +
			`ORMAS. Same data, same objective, same three convolutional stages — ` +
			`${int(c.params_baseline ?? 0)} parameters against ${int(c.params_ormas ?? 0)}. ` +
			`Both begin from seed ${c.seed ?? 0} on ${c.dataset}.`,
	});

	// 2. The verdict table, introduced BEFORE it diverges. Its whole persuasive weight is in
	//    the change, and a reader who first notices it after the event has no baseline to
	//    compare against — they see two different columns and assume they were always that way.
	steps.push({
		epoch: ev ? Math.max(0, ev.epoch - 8) : Math.round(last * 0.15),
		target: '.rp-verdict',
		eyebrow: 'THE INSTRUMENT',
		title: 'This table tracks the epoch on screen',
		body:
			'It reports what each network can answer at the epoch currently displayed, not at the ' +
			'end of the run. ' +
			// "Both are training normally" is true only where a shock is still to come. In the
			// corrupted-label run two in five labels are wrong from the first step, so nothing
			// about this epoch is normal — and a reader who knows that catches the lie.
			(ev
				? 'Both are training normally here, and both answer the same way. '
				: 'Neither run is healthy — the labels are wrong from the first step — but at this ' +
					'point the two still answer the same way. ') +
			'The epoch bar is draggable, and the rows change with it.',
	});

	if (ev) {
		const shock = rec.shock as Record<string, number> | undefined;
		const detectedEpoch = ev.detected_step != null ? Math.floor(ev.detected_step / spe) : ev.epoch;

		// 3. The event.
		steps.push({
			epoch: ev.epoch,
			target: '.rp-panes',
			eyebrow: `EPOCH ${ev.epoch}`,
			title: ev.label,
			body:
				`${ev.description} Accuracy falls from ${pct(shock?.pre ?? 0)} to ${pct(shock?.post ?? 0)}, ` +
				`a drop of ${(shock?.severity_pp ?? 0).toFixed(2)} points. Both networks lose it. Only one ` +
				'of them registers anything beyond the loss itself.',
		});

		// 4. Detection — the claim the whole page rests on, with its own latency stated.
		const lag = ev.detected_lag_steps;
		const lagPhrase =
			lag == null
				? 'in the same epoch'
				: lag === 0
					? 'on the same step'
					: `${int(lag)} step${lag === 1 ? '' : 's'} later`;
		steps.push({
			epoch: Math.min(last, detectedEpoch),
			target: '.rp-ledger',
			eyebrow: `STEP ${int(ev.detected_step ?? ev.step)}`,
			title: `Named ${lagPhrase}`,
			body:
				`ORMAS names ${nameNodes(ev.detected_nodes ?? ev.nodes)} at step ` +
				`${int(ev.detected_step ?? ev.step)}, ${lagPhrase} than the event at step ${int(ev.step)}, ` +
				`with the diagnosis "${ev.detected_diagnosis ?? ev.type ?? 'unknown'}". The entry is ` +
				'written while the run is still going. The sealed pane has no equivalent line because a ' +
				'standard network never computes the quantity.',
		});
	} else {
		// No discrete event — the corruption is present from the first step. The beat is the
		// accumulation, not a moment.
		steps.push({
			epoch: Math.round(last * 0.5),
			target: '.rp-ledger',
			eyebrow: 'THROUGHOUT',
			title: 'No single moment to point at',
			body:
				`Nothing is injected here; the damage is in the data from the first step. The ledger ` +
				`fills anyway — ${int(s.corrections_total ?? 0)} corrections across the run, each with ` +
				'the component it applied to and the diagnosis that triggered it. This is what the ' +
				'record looks like when the failure has no timestamp.',
		});
	}

	// 5. The outcome, stated as the data has it — including when that is a loss.
	const gap = s.gap_pp ?? 0;
	const adverse = gap < 0;
	const recovery = rec.recovery as Record<string, number> | undefined;
	steps.push({
		epoch: last,
		target: '.rp-verdict',
		eyebrow: adverse ? 'THE ADVERSE RESULT' : 'THE OUTCOME',
		title: adverse ? 'This one goes the other way' : 'The rows no longer agree',
		body: adverse
			? `The sealed network finishes ahead: ${pct(s.baseline_final)} against ` +
				`${pct(s.ormas_final)}, a loss of ${Math.abs(gap).toFixed(2)} points. It is on this page, ` +
				'in the same menu as the other three, because an account that reports only the runs ' +
				'that went well is not an account. The record was still written, and it is still correct.'
			: `The open network reaches ${pct(s.ormas_final)}. The sealed one ` +
				// "holds at" only makes sense after something knocked it down. With no event
				// there is nothing to hold after, and the run simply ends where it ends.
				(ev
					? `holds at ${pct(s.baseline_final)} for the rest of the run`
					: `finishes at ${pct(s.baseline_final)}`) +
				`, a gap of ${gap.toFixed(2)} points` +
				(recovery?.reclaimed_pct != null
					? `, reclaiming ${recovery.reclaimed_pct}% of what was lost`
					: '') +
				'. The rows above now answer differently, and the record below is the reason.',
	});

	// SAYS WHAT THE BUTTON ACTUALLY DOES. It used to promise the record, and Finish
	// now rewinds the run and hands the controls over instead — a stop that describes
	// a different button than the one under it is worse than a stop that says nothing.
	steps[steps.length - 1].body +=
		' Finish puts the run back to the first epoch at normal speed, and the controls are yours.';

	/* THE FRAME, WRITTEN LAST AND SHOWN FIRST.
	   A reader arrives here straight out of the title sequence and the first thing they
	   met was "Two networks, identical shape" — a sentence that only means something to
	   somebody who already knows what they are looking at. They do not yet know this is
	   a recording rather than a live demo, that something is about to go wrong on
	   purpose, what they are being asked to watch for, or how long it will take. Every
	   one of those is cheap to say and expensive to leave out, because the reader who
	   cannot tell what is being claimed is the reader who leaves.

	   Built after the rest so the length is counted rather than asserted: a scenario
	   with no discrete event has a different number of stops, and a promise of "six"
	   that delivers five is worse than no promise. */
	steps.unshift({
		epoch: 0,
		target: '.rp-panes',
		eyebrow: 'WHAT THIS IS',
		title: 'A real training run, recorded and replayed',
		body:
			`Not a simulation and not a diagram. ${int(last + 1)} epochs of an actual run on ` +
			`${c.dataset}, archived and played back exactly as it happened. Two networks train ` +
			`side by side` +
			(ev
				? ', something is done to both of them partway through, and the question is which '
				: ', the data they are given is wrong from the first step, and the question is which ') +
			`one can say what happened to it. ${int(steps.length + 1)} stops, about a minute. Leave ` +
			'at any point with Skip and the controls are yours.',
	});

	return steps;
}
