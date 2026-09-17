// CANVAS RENDERER for the replay demo.
//
// One canvas per arm, sized to devicePixelRatio. Both panes are drawn with the
// SAME axes, the SAME scale and the SAME geometry, because the comparison only
// reads as fair if the halves are visually interchangeable. The only thing that
// differs between them is the data, which is the entire point.
//
// Colour is never the only channel: the ORMAS line is solid and the baseline is
// dashed, so the two remain distinguishable in greyscale, in print, and to a
// reader who cannot separate the amber from the blue.

import type { Bundle } from './types';

export interface Theme {
	grid: string; axis: string; text: string; muted: string; event: string;
}

export function readTheme(el: HTMLElement): Theme {
	const cs = getComputedStyle(el);
	const v = (n: string, fb: string) => (cs.getPropertyValue(n).trim() || fb);
	return {
		grid: v('--border-hairline', '#DEDCD0'),
		axis: v('--text-muted', '#6E6B60'),
		text: v('--text-primary', '#14151A'),
		muted: v('--text-muted', '#6E6B60'),
		event: v('--chart-warning', '#B23B3B'),
	};
}

const PAD = { top: 14, right: 14, bottom: 26, left: 40 };

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

export interface DrawOpts {
	bundle: Bundle;
	series: number[];
	/** null renders the pane without any correction marks: a standard
	 *  architecture computes no such quantity. */
	corrections: number[] | null;
	upto: number;
	colour: string;
	dashed: boolean;
	theme: Theme;
}

export function draw(cv: HTMLCanvasElement, o: DrawOpts): void {
	const ctx = cv.getContext('2d');
	if (!ctx) return;
	const { w, h } = sizeCanvas(cv);
	ctx.clearRect(0, 0, w, h);

	const n = o.series.length - 1;
	const plotW = w - PAD.left - PAD.right;
	const plotH = h - PAD.top - PAD.bottom;
	if (plotW <= 0 || plotH <= 0) return;

	const x = (e: number) => PAD.left + (n === 0 ? 0 : (e / n) * plotW);
	const y = (a: number) => PAD.top + (1 - a) * plotH;

	// Grid and y labels. Fixed 0–100% on both panes: a pane that autoscaled
	// would make a dead network look like it was doing something.
	ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, monospace';
	ctx.textBaseline = 'middle';
	for (const a of [0, 0.25, 0.5, 0.75, 1]) {
		ctx.strokeStyle = o.theme.grid;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(PAD.left, Math.round(y(a)) + 0.5);
		ctx.lineTo(w - PAD.right, Math.round(y(a)) + 0.5);
		ctx.stroke();
		ctx.fillStyle = o.theme.muted;
		ctx.textAlign = 'right';
		ctx.fillText(`${Math.round(a * 100)}%`, PAD.left - 6, y(a));
	}

	// x labels
	ctx.textAlign = 'center';
	ctx.textBaseline = 'top';
	for (const e of [0, Math.round(n / 2), n]) {
		ctx.fillStyle = o.theme.muted;
		ctx.fillText(String(e), x(e), h - PAD.bottom + 6);
	}
	ctx.fillText('epoch', PAD.left + plotW / 2, h - 11);

	// The event rule, drawn on BOTH panes so the moment is shared.
	const ev = o.bundle.event;
	if (ev) {
		ctx.save();
		ctx.strokeStyle = o.theme.event;
		ctx.globalAlpha = 0.55;
		ctx.setLineDash([3, 3]);
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(Math.round(x(ev.epoch)) + 0.5, PAD.top);
		ctx.lineTo(Math.round(x(ev.epoch)) + 0.5, h - PAD.bottom);
		ctx.stroke();
		ctx.restore();
	}

	// The curve, drawn to the current epoch only.
	const upto = Math.max(0, Math.min(n, o.upto));
	ctx.save();
	ctx.strokeStyle = o.colour;
	ctx.lineWidth = 2;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';
	if (o.dashed) ctx.setLineDash([5, 3]);
	ctx.beginPath();
	const whole = Math.floor(upto);
	for (let e = 0; e <= whole; e++) {
		const px = x(e), py = y(o.series[e]);
		e === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
	}
	if (whole < n && upto > whole) {
		const f = upto - whole;
		const a = o.series[whole] + (o.series[whole + 1] - o.series[whole]) * f;
		ctx.lineTo(x(upto), y(a));
	}
	ctx.stroke();
	ctx.restore();

	// Correction marks — ORMAS only. On the baseline pane `corrections` is null
	// and nothing is drawn, because nothing was computed.
	if (o.corrections) {
		ctx.save();
		ctx.fillStyle = o.colour;
		ctx.globalAlpha = 0.5;
		for (let e = 0; e <= whole; e++) {
			const c = o.corrections[e] || 0;
			if (c > 0) {
				const bh = Math.min(12, 2 + c * 1.4);
				ctx.fillRect(x(e) - 1, h - PAD.bottom - bh, 2, bh);
			}
		}
		ctx.restore();
	}

	// Live value readout at the head of the curve.
	const cur = o.series[Math.min(n, Math.round(upto))];
	ctx.save();
	ctx.fillStyle = o.colour;
	ctx.beginPath();
	ctx.arc(x(upto), y(cur), 3, 0, Math.PI * 2);
	ctx.fill();
	ctx.font = '600 12px ui-monospace, SFMono-Regular, Menlo, monospace';
	ctx.textAlign = upto > n * 0.72 ? 'right' : 'left';
	ctx.textBaseline = 'bottom';
	const dx = upto > n * 0.72 ? -8 : 8;
	ctx.fillText(`${(cur * 100).toFixed(1)}%`, x(upto) + dx, y(cur) - 6);
	ctx.restore();
}
