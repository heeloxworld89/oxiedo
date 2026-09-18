// THE ACCURACY STRIP — small multiples on one shared axis.
//
// REWRITTEN TWICE, 2026-09-17.
//
// v1 drew one chart per arm, side by side, each with its own axis. Two charts of
// the same measure on separate axes make the reader perform the comparison by
// eye across a gutter, and they spend the canvas twice.
//
// v2 overlaid both arms on a single axis. That fixed the gutter and created a
// worse problem: for the first hundred epochs the two arms are the SAME network
// training identically, so the lines sit on top of each other as an
// indistinguishable mush, and the two direct labels overprint at the head.
// Occlusion, not scale, was the real constraint — and the textbook answer to
// occlusion in a same-measure comparison is small multiples.
//
// v3, this one: two panels stacked vertically, sharing one x-axis and one
// identical y-scale, with a single "now" rule running through both. Stacked
// rather than side by side so that the same x is the same epoch in both panels
// and the eye travels straight down; each series gets its own band, so nothing
// occludes and no label can collide. The divergence reads as two different
// SHAPES, which is a stronger signal than two lines that happen to separate.
//
// The curve is no longer the hero. It is the evidence that the repair in the
// anatomy above it worked, and it is sized accordingly.
//
// Colour is never the only channel: ORMAS is solid and the baseline is dashed,
// so the two stay separable in greyscale, in print, and for a reader who cannot
// separate the amber from the slate. Both are direct-labelled at their heads.
//
// PALETTE NOTE. Run against the data-viz validator on the light surface, the
// pair passes CVD separation (ΔE 17.4, target ≥8), the normal-vision floor
// (ΔE 21.9, floor ≥15) and 3:1 contrast. It fails one check: --chart-baseline
// (#4E6FA8) sits under the chroma floor at 0.098 and can read as grey.
//
// Kept anyway, deliberately. It is the site's own documented token, the
// baseline is meant to be the recessive series, and the chroma floor exists so
// that identity is not carried by a washed-out hue — which here it is not:
// the two series differ by dash pattern, by direct label at each head, and by
// position. Changing a brand token to satisfy a general-purpose check, in a
// two-series chart that already carries three secondary encodings, would be
// the wrong trade.

import type { Bundle } from './types';

export interface Theme {
	grid: string; text: string; muted: string;
	ormas: string; baseline: string; event: string;
}

/** Reads the component's OWN palette rather than the global tokens, so the
 *  plate's colours are defined in exactly one place (the .rp block) and the
 *  canvas cannot drift from the SVG beside it. */
export function readTheme(el: HTMLElement): Theme {
	const cs = getComputedStyle(el);
	const v = (n: string, fb: string) => (cs.getPropertyValue(n).trim() || fb);
	return {
		grid: v('--rule', '#DEDCD0'),
		text: v('--fg', '#14151A'),
		muted: v('--fg-dim', '#6E6B60'),
		ormas: v('--ormas', '#A5600C'),
		baseline: v('--base', '#4E6FA8'),
		event: v('--warn', '#B23B3B'),
	};
}

// THE CHROME SCALES WITH THE BOX. These were fixed, sized for the full-width chart this
// used to be: 78px of label gutter plus 42px of axis is 120px, which is 40% of a 300px
// panel — the plot was squeezed into the remainder and the series labels collided with the
// lines they name. In a narrow cell the gutter and the axis both give ground, and the
// direct labels are dropped entirely below the width where they cannot be placed clear of
// the data.
const PAD_WIDE = { top: 14, right: 78, bottom: 24, left: 42 };
const PAD_TIGHT = { top: 12, right: 46, bottom: 22, left: 34 };
const NARROW = 560;      // below this the chart is in a console cell, not a page column
const GAP = 16;          // between the two panels
const LABEL_W_WIDE = 78; // reserved gutter for the direct labels
const LABEL_W_TIGHT = 46;

export function sizeCanvas(cv: HTMLCanvasElement): { w: number; h: number } {
	const dpr = Math.min(3, window.devicePixelRatio || 1);
	const rect = cv.getBoundingClientRect();
	const w = Math.max(1, Math.round(rect.width));
	const h = Math.max(1, Math.round(rect.height));
	if (cv.width !== w * dpr || cv.height !== h * dpr) {
		cv.width = w * dpr;
		cv.height = h * dpr;
	}
	const ctx = cv.getContext('2d');
	if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	return { w, h };
}

const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

export function draw(cv: HTMLCanvasElement, bundle: Bundle, upto: number, theme: Theme): void {
	const ctx = cv.getContext('2d');
	if (!ctx) return;
	const { w, h } = sizeCanvas(cv);
	ctx.clearRect(0, 0, w, h);

	const o = bundle.series.ormas.accuracy;
	const b = bundle.series.baseline.accuracy;
	const n = o.length - 1;
	const tight = w < NARROW;
	const PAD = tight ? PAD_TIGHT : PAD_WIDE;
	const LABEL_W = tight ? LABEL_W_TIGHT : LABEL_W_WIDE;
	const plotW = w - PAD.left - PAD.right;
	const bandH = (h - PAD.top - PAD.bottom - GAP) / 2;
	if (plotW <= 0 || bandH <= 10) return;

	const x = (e: number) => PAD.left + (n === 0 ? 0 : (e / n) * plotW);
	const cur = Math.max(0, Math.min(n, upto));

	// Panel order puts the baseline on top: it is the status quo, and the eye
	// travelling downward arrives at the recovery rather than leaving it.
	const panels = [
		{ series: b, colour: theme.baseline, dashed: true, name: 'Standard CNN',
		  top: PAD.top, corrections: null as number[] | null },
		{ series: o, colour: theme.ormas, dashed: false, name: 'ORMAS',
		  top: PAD.top + bandH + GAP, corrections: bundle.series.ormas.corrections },
	];

	const ev = bundle.event;

	for (const p of panels) {
		const y = (a: number) => p.top + (1 - a) * bandH;

		// Identical fixed 0-100% scale in both panels. An autoscaled band would
		// make a dead network look busy and destroy the comparison outright.
		ctx.font = `10px ${MONO}`;
		ctx.textBaseline = 'middle';
		for (const a of [0, 0.5, 1]) {
			ctx.strokeStyle = theme.grid;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(PAD.left, Math.round(y(a)) + 0.5);
			ctx.lineTo(w - PAD.right, Math.round(y(a)) + 0.5);
			ctx.stroke();
			ctx.fillStyle = theme.muted;
			ctx.textAlign = 'right';
			ctx.fillText(`${Math.round(a * 100)}%`, PAD.left - 6, y(a));
		}

		// Panel name, inside its own band so it cannot collide with the other.
		ctx.font = `600 10px ${MONO}`;
		ctx.textAlign = 'left';
		ctx.textBaseline = 'top';
		ctx.fillStyle = p.colour;
		ctx.fillText(p.name.toUpperCase(), PAD.left + 4, p.top + 3);

		if (ev) {
			ctx.save();
			ctx.strokeStyle = theme.event;
			ctx.globalAlpha = 0.8;
			ctx.setLineDash([3, 3]);
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(Math.round(x(ev.epoch)) + 0.5, p.top);
			ctx.lineTo(Math.round(x(ev.epoch)) + 0.5, p.top + bandH);
			ctx.stroke();
			ctx.restore();
		}

		// Correction ticks along this panel's floor. The baseline panel has none
		// and that emptiness is the same argument the sealed anatomy makes.
		if (p.corrections) {
			ctx.save();
			ctx.fillStyle = p.colour;
			ctx.globalAlpha = 0.55;
			for (let e = 0; e <= Math.floor(cur); e++) {
				const c = p.corrections[e] || 0;
				if (c > 0) {
					const bh = Math.min(9, 2 + c * 1.1);
					ctx.fillRect(x(e) - 0.75, p.top + bandH - bh, 1.5, bh);
				}
			}
			ctx.restore();
		}

		ctx.save();
		ctx.strokeStyle = p.colour;
		ctx.lineWidth = p.dashed ? 1.75 : 2.25;
		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';
		if (p.dashed) ctx.setLineDash([5, 4]);
		ctx.beginPath();
		const whole = Math.floor(cur);
		for (let e = 0; e <= whole; e++) {
			const px = x(e), py = y(p.series[e]);
			e === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
		}
		if (whole < n && cur > whole) {
			const f = cur - whole;
			const a = p.series[whole] + (p.series[whole + 1] - p.series[whole]) * f;
			ctx.lineTo(x(cur), y(a));
		}
		ctx.stroke();
		ctx.restore();

		// Direct label in the reserved right gutter — its own band, so the two
		// can never overprint however close the values are.
		const v = p.series[Math.min(n, Math.round(cur))];
		ctx.save();
		ctx.fillStyle = p.colour;
		ctx.beginPath();
		ctx.arc(x(cur), y(v), 3, 0, Math.PI * 2);
		ctx.fill();
		const lx = Math.min(x(cur) + 9, w - LABEL_W + 4);
		ctx.font = `700 14px ${MONO}`;
		ctx.textAlign = 'left';
		ctx.textBaseline = 'middle';
		ctx.fillText(`${(v * 100).toFixed(1)}%`, lx, y(v));
		ctx.restore();
	}

	// The event label sits once, above both panels, because it is one event.
	if (ev) {
		ctx.save();
		ctx.font = `9px ${MONO}`;
		ctx.textAlign = 'right';
		ctx.textBaseline = 'bottom';
		ctx.fillStyle = theme.event;
		ctx.fillText(ev.label.toUpperCase(), x(ev.epoch) - 5, PAD.top - 2);
		ctx.restore();
	}

	// One "now" rule through both panels, so the two bands read as one moment.
	ctx.save();
	ctx.strokeStyle = theme.muted;
	ctx.globalAlpha = 0.5;
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(Math.round(x(cur)) + 0.5, PAD.top);
	ctx.lineTo(Math.round(x(cur)) + 0.5, PAD.top + bandH * 2 + GAP);
	ctx.stroke();
	ctx.restore();

	ctx.font = `10px ${MONO}`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'top';
	ctx.fillStyle = theme.muted;
	for (const e of [0, Math.round(n / 2), n]) {
		ctx.fillText(String(e), x(e), h - PAD.bottom + 5);
	}
	// THE CAPTION SITS UNDER THE MIDDLE TICK, so in a console cell it lands on top of it —
	// "100" and "epoch" were printed over each other. There is no room for both in 22px of
	// bottom padding, and the tick numbers are the ones carrying information, so the caption
	// goes. The axis is labelled by the run's own epoch counter beside the transport anyway.
	if (!tight) ctx.fillText('epoch', PAD.left + plotW / 2, h - 11);
}
