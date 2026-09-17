// THE NETWORK, DRAWN.
//
// WHY THIS EXISTS. The first build of this demo rendered two accuracy charts
// and nothing else — a page whose thesis is "the black box is opened" drawing
// two boxes with a number written on the outside. A reader who has never seen a
// neural network learned only that one line ends higher than the other.
//
// This module draws the network itself: three convolutional stages at their
// real shapes, the signal passing through them, and — on the instrumented side
// — the bounded four-operation chain that is the entire product.
//
// BOTH SIDES DRAW THE SAME ANATOMY. Same stages, same heights, same positions,
// because they are the same network. The baseline is not drawn as primitive or
// broken; it is drawn as sealed. Its stages carry no fill and no readout, and
// the caption says why. That is the honest version of the claim and also the
// strongest one: nothing was withheld, the quantity was never computed.
//
// EVERY ENCODING IS SOURCED. Stage height is the real output dimension; area
// carries the real parameter count; fill is `goodness`; an emptied stage is
// `weight_norm == 0`, which is literally what the archive records at the
// lesion; strikes are real correction events at their real steps. Nothing on
// screen is decorative data.

import type { Bundle, HealthFrame } from './types';

const NS = 'http://www.w3.org/2000/svg';

export interface AnatomyOpts {
	/** false draws the sealed arm: same geometry, no instrumentation. */
	instrumented: boolean;
	reduced: boolean;
}

interface StageGeom {
	id: number;
	x: number;      // column centre
	y: number;      // top of the column
	w: number;      // hit/label width
	h: number;      // column height
	inDim: number;
	outDim: number;
	params: number;
	/** Unit marks actually drawn. Capped — see UNIT_CAP. */
	drawn: number;
	unitY: number[];
}

/* A stage of 128 channels cannot be drawn as 128 marks at this size without
   becoming a grey smear, so the column is capped and the TRUE count is printed
   beside it. The marks are deliberately uniform within a stage: the telemetry
   resolves to the stage, not to the individual channel, and drawing them with
   differing states would invent data the archive does not contain. */
const UNIT_CAP = 11;

const el = <K extends keyof SVGElementTagNameMap>(
	name: K,
	attrs: Record<string, string | number> = {},
): SVGElementTagNameMap[K] => {
	const n = document.createElementNS(NS, name);
	for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
	return n;
};

const fmt = (n: number) => n.toLocaleString('en-GB');

export class Anatomy {
	private root: SVGSVGElement;
	private opts: AnatomyOpts;
	private bundle: Bundle | null = null;
	private stages: StageGeom[] = [];

	// Per-stage live parts, rebuilt whenever a bundle loads.
	private units = new Map<number, SVGCircleElement[]>();
	private halos = new Map<number, SVGRectElement>();
	private gones = new Map<number, SVGRectElement>();
	private states = new Map<number, SVGTextElement>();
	private metrics = new Map<number, SVGTextElement>();
	private strikes = new Map<number, SVGGElement>();
	private flows: SVGPathElement[] = [];

	// Geometry. A 16:9-ish artboard the SVG scales into.
	// Vertical rhythm is tight enough that it has to be reasoned about rather
	// than eyeballed: an earlier pass derived the chain's rows from AXIS by
	// offsets and produced a tap line running from 226 to 225 — inverted, so the
	// connection between each stage and its chain rendered as nothing at all.
	// Every row is now an explicit y, and the checks below hold by construction:
	//   stages end 190 · state 203 · metric 214 · caption 228
	//   tap 232->240 · ops 240..251 · tap 251..259 · bottleneck 259..277
	/* THE ARTBOARD IS RESPONSIVE IN WIDTH, FIXED IN HEIGHT.
	   It used to be a fixed 560x300 viewBox at width:100%, which welds the two
	   together: the drawing grew TALLER as it grew wider — 317px in a 1280
	   container, 456px at 1800 — so widening the page pushed the controls
	   further off screen. Now one artboard unit is one CSS pixel, the height is
	   pinned, and extra width becomes extra space between the columns.
	   Capped at MAX_W so a very wide screen does not stretch the network into
	   long horizontal edges. */
	private W = 560;
	private readonly MIN_W = 560;
	private readonly MAX_W = 1000;
	private readonly H = 300;
	private readonly AXIS = 190;       // baseline the stages stand on
	private readonly Y_STATE = 203;
	private readonly Y_METRIC = 214;
	private readonly Y_CAPTION = 228;
	private readonly Y_OPS = 240;      // top of the operation boxes
	private readonly OPS_H = 11;
	private readonly Y_NECK = 259;     // top of the shared bottleneck
	private readonly NECK_H = 18;

	/** Pattern ids must be unique per instance: the demo appears more than once
	 *  on a page, and a duplicated id resolves to whichever rendered first. */
	private readonly uid = Math.random().toString(36).slice(2, 8);

	private mount: HTMLElement;
	private ro: ResizeObserver | null = null;

	constructor(mount: HTMLElement, opts: AnatomyOpts) {
		this.opts = opts;
		this.mount = mount;
		this.root = el('svg', {
			viewBox: `0 0 ${this.W} ${this.H}`,
			role: 'img',
			preserveAspectRatio: 'xMidYMid meet',
		});
		this.root.style.width = '100%';
		this.root.style.height = `${this.H}px`;
		this.root.style.display = 'block';
		mount.appendChild(this.root);

		// Redraw at the new artboard width whenever the pane resizes.
		if (typeof ResizeObserver !== 'undefined') {
			this.ro = new ResizeObserver(() => this.fit());
			this.ro.observe(mount);
		}
	}

	/** Recompute the artboard width from the mount and redraw if it changed. */
	private fit(): void {
		const w = Math.round(this.mount.getBoundingClientRect().width);
		if (!w) return;
		const next = Math.max(this.MIN_W, Math.min(this.MAX_W, w));
		if (next === this.W) return;
		this.W = next;
		this.root.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`);
		if (this.bundle) this.load(this.bundle);
	}

	/** Stage heights follow the real output dimensions, so the reader sees the
	 *  network widen as it deepens. Widths follow the parameter count on a log
	 *  scale — 960 against 74,112 is a 77x range and a linear map would render
	 *  the first stage as a hairline. */
	private layout(bundle: Bundle): StageGeom[] {
		const nodes = bundle.topology.nodes;
		if (!nodes.length) return [];
		const maxOut = Math.max(...nodes.map((n) => n.out || 1));

		const left = 124;
		const right = this.W - 136;
		const span = right - left;
		const step = nodes.length > 1 ? span / (nodes.length - 1) : 0;

		return nodes.map((n, i) => {
			const out = n.out || 1;
			// Column height carries the real channel count, so the network is
			// seen to widen as it deepens.
			const h = 30 + (out / maxOut) * 82;
			const drawn = Math.min(UNIT_CAP, out);
			const y = this.AXIS - h;
			const gap = drawn > 1 ? h / (drawn - 1) : 0;
			const unitY = Array.from({ length: drawn }, (_, k) =>
				drawn === 1 ? y + h / 2 : y + k * gap);
			return {
				id: n.id, x: left + i * step, y, w: 64, h,
				inDim: n.in, outDim: out, params: n.params, drawn, unitY,
			};
		});
	}

	load(bundle: Bundle): void {
		this.bundle = bundle;
		// Pick up the current width before laying out, so the first paint is
		// already at the right size rather than snapping after a resize tick.
		const w = Math.round(this.mount.getBoundingClientRect().width);
		if (w) {
			this.W = Math.max(this.MIN_W, Math.min(this.MAX_W, w));
			this.root.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`);
		}
		this.stages = this.layout(bundle);
		this.units.clear();
		this.halos.clear();
		this.gones.clear();
		this.states.clear();
		this.metrics.clear();
		this.strikes.clear();
		this.flows = [];
		while (this.root.firstChild) this.root.removeChild(this.root.firstChild);

		const c = bundle.conditions;
		const params = this.opts.instrumented ? c.params_ormas : c.params_baseline;
		this.root.setAttribute(
			'aria-label',
			this.opts.instrumented
				? `The ORMAS network: ${this.stages.length} instrumented convolutional stages, each reporting its own health, with a bounded four-operation chain into a shared bottleneck.`
				: `A standard convolutional network of the same shape: the same stages, with no per-component instrumentation of any kind.`,
		);

		this.drawHeader(params);
		this.drawIO();
		this.drawFlow();
		this.drawStages();
		if (this.opts.instrumented) this.drawChain();
		else this.drawSeal();
	}

	private drawHeader(params: number | null): void {
		const g = el('g');
		const name = this.opts.instrumented ? 'ORMAS' : 'STANDARD CNN';
		const t = el('text', { x: 0, y: 15, class: 'an-name' });
		t.textContent = name;
		g.appendChild(t);

		const badge = el('text', { x: this.W, y: 15, class: 'an-badge', 'text-anchor': 'end' });
		badge.textContent = this.opts.instrumented ? 'OPEN' : 'SEALED';
		g.appendChild(badge);

		const sub = el('text', { x: 0, y: 31, class: 'an-sub' });
		sub.textContent = params
			? `${fmt(params)} parameters · ${this.stages.length} stages`
			: `${this.stages.length} stages`;
		g.appendChild(sub);

		const obs = el('text', { x: this.W, y: 31, class: 'an-sub', 'text-anchor': 'end' });
		obs.textContent = this.opts.instrumented
			? `${this.stages.length} observable components`
			: '0 observable components';
		g.appendChild(obs);

		// Said once at the foot rather than three times across the stages, where
		// three long strings were competing for one band and colliding.
		if (this.stages.some((x) => x.drawn < x.outDim)) {
			const note = el('text', { x: 0, y: this.H - 3, class: 'an-footnote' });
			note.textContent =
				`Each column draws ${UNIT_CAP} marks; the channel count above it is the real one.`;
			g.appendChild(note);
		}

		this.root.appendChild(g);
	}

	/** Input is a CIFAR-10 image: three colour channels at 32x32. Output is ten
	 *  classes. Naming both ends is what lets a reader place everything between
	 *  them. */
	private drawIO(): void {
		const g = el('g');
		const cy = this.AXIS - 46;

		for (const uy of [this.AXIS - 76, this.AXIS - 58, this.AXIS - 40]) {
			g.appendChild(el('circle', { cx: 44, cy: uy, r: 4.2, class: 'an-input' }));
		}
		const il = el('text', { x: 44, y: this.Y_STATE, class: 'an-io', 'text-anchor': 'middle' });
		il.textContent = 'input';
		g.appendChild(il);
		const il2 = el('text', { x: 44, y: this.Y_METRIC, class: 'an-io-sub', 'text-anchor': 'middle' });
		il2.textContent = '32×32×3';
		g.appendChild(il2);

		for (let k = 0; k < 5; k++) {
			g.appendChild(el('circle', {
				cx: this.W - 40, cy: this.AXIS - 84 + k * 18, r: 4.2, class: 'an-output',
			}));
		}
		const ol = el('text', { x: this.W - 40, y: this.Y_STATE, class: 'an-io', 'text-anchor': 'middle' });
		ol.textContent = 'output';
		g.appendChild(ol);
		const ol2 = el('text', { x: this.W - 40, y: this.Y_METRIC, class: 'an-io-sub', 'text-anchor': 'middle' });
		ol2.textContent = '10 classes';
		g.appendChild(ol2);

		this.root.appendChild(g);
	}

	/** The connective tissue: a fan from every drawn unit in one column to its
	 *  three nearest in the next. Not all-to-all — that is 11x11 per gap and
	 *  renders as a solid block — but enough that the structure reads as a
	 *  network rather than a row of objects. The travelling dash is what teaches
	 *  a reader that a network is a thing a signal passes THROUGH; no still
	 *  frame carries it. */
	private drawFlow(): void {
		const g = el('g', { class: 'an-web' });
		const cols: Array<{ x: number; ys: number[] }> = [
			{ x: 44, ys: [this.AXIS - 76, this.AXIS - 58, this.AXIS - 40] },   // input channels
			...this.stages.map((s) => ({ x: s.x, ys: s.unitY })),
			{ x: this.W - 40, ys: Array.from({ length: 5 }, (_, k) => this.AXIS - 84 + k * 18) },
		];

		for (let c = 0; c < cols.length - 1; c++) {
			const a = cols[c], b = cols[c + 1];
			const lines: SVGPathElement[] = [];
			a.ys.forEach((y1, i) => {
				const centre = Math.round((i / Math.max(1, a.ys.length - 1)) * (b.ys.length - 1));
				for (let d = -1; d <= 1; d++) {
					const j = centre + d;
					if (j < 0 || j >= b.ys.length) continue;
					const y2 = b.ys[j];
					const path = el('path', {
						d: `M${a.x + 5} ${y1} L${b.x - 5} ${y2}`,
						class: 'an-edge',
					});
					g.appendChild(path);
					lines.push(path);
				}
			});
			// One animated overlay per gap rather than per edge: the pulse reads
			// the same and it is a third of the nodes.
			a.ys.forEach((y1, i) => {
				const centre = Math.round((i / Math.max(1, a.ys.length - 1)) * (b.ys.length - 1));
				const y2 = b.ys[Math.min(b.ys.length - 1, Math.max(0, centre))];
				const p = el('path', {
					d: `M${a.x + 5} ${y1} L${b.x - 5} ${y2}`,
					class: 'an-flow',
					style: `animation-delay:${(c * 0.16 + i * 0.03).toFixed(2)}s`,
				});
				g.appendChild(p);
				this.flows.push(p);
			});
		}
		this.root.insertBefore(g, this.root.firstChild);
	}

	private drawStages(): void {
		for (const s of this.stages) {
			const g = el('g');

			// A faint spine, so a column of units still reads as one component.
			g.appendChild(el('line', {
				x1: s.x, y1: s.y - 4, x2: s.x, y2: s.y + s.h + 4, class: 'an-spine',
			}));

			const units: SVGCircleElement[] = [];
			for (const uy of s.unitY) {
				const c = el('circle', { cx: s.x, cy: uy, r: 4.2, class: 'an-unit' });
				g.appendChild(c);
				units.push(c);
			}
			this.units.set(s.id, units);

			if (!this.opts.instrumented) {
				// Sealed: the units exist and are drawn, but nothing reports.
				units.forEach((u) => u.classList.add('is-sealed'));
			}

			const shape = el('text', {
				x: s.x, y: s.y - 26, class: 'an-stage-shape', 'text-anchor': 'middle',
			});
			shape.textContent = `${s.inDim}→${s.outDim}`;
			g.appendChild(shape);

			const pc = el('text', {
				x: s.x, y: s.y - 14, class: 'an-stage-params', 'text-anchor': 'middle',
			});
			pc.textContent = `${fmt(s.params)} params`;
			g.appendChild(pc);

			if (this.opts.instrumented) {
				const st = el('text', {
					x: s.x, y: this.Y_STATE, class: 'an-stage-state', 'text-anchor': 'middle',
				});
				this.states.set(s.id, st);
				g.appendChild(st);

				const mt = el('text', {
					x: s.x, y: this.Y_METRIC, class: 'an-stage-metric', 'text-anchor': 'middle',
				});
				this.metrics.set(s.id, mt);
				g.appendChild(mt);

				// Health reads as a filled arc around the column rather than a
				// level in a box: it belongs to the component, not to a container.
				const halo = el('rect', {
					x: s.x - 13, y: s.y - 10, width: 26, height: s.h + 20, rx: 13,
					class: 'an-halo', opacity: 0,
				});
				this.halos.set(s.id, halo);
				g.insertBefore(halo, g.firstChild);

				const strike = el('g', { class: 'an-strike', opacity: 0 });
				strike.appendChild(el('rect', {
					x: s.x - 15, y: s.y - 9, width: 30, height: s.h + 18, rx: 15,
				}));
				this.strikes.set(s.id, strike);
				g.appendChild(strike);

				const gone = el('rect', {
					x: s.x - 15, y: s.y - 9, width: 30, height: s.h + 18, rx: 15,
					class: 'an-gone', opacity: 0,
				});
				this.gones.set(s.id, gone);
				g.appendChild(gone);
			}

			this.root.appendChild(g);
		}
	}

	/** The bounded four-operation chain, drawn once per stage into one shared
	 *  bottleneck. This is the mechanism the whole company rests on, and until
	 *  now it appeared only as a static diagram elsewhere on the site. Here it
	 *  is attached to a network that is running. */
	private drawChain(): void {
		const g = el('g');
		const ops = ['LN', 'Lin', 'PReLU', 'Lin'];

		for (const s of this.stages) {
			const cx = s.x;   // s.x is the column centre, not a left edge
			// Stage down into its own chain.
			g.appendChild(el('line', {
				x1: cx, y1: this.Y_CAPTION + 4, x2: cx, y2: this.Y_OPS, class: 'an-tap',
			}));
			const boxW = 26, boxH = this.OPS_H, gap = 3;
			const total = ops.length * boxW + (ops.length - 1) * gap;
			let ox = cx - total / 2;
			ops.forEach((op) => {
				g.appendChild(el('rect', {
					x: ox, y: this.Y_OPS, width: boxW, height: boxH, rx: 2, class: 'an-op',
				}));
				const t = el('text', {
					x: ox + boxW / 2, y: this.Y_OPS + boxH - 3.2,
					class: 'an-op-label', 'text-anchor': 'middle',
				});
				t.textContent = op;
				g.appendChild(t);
				ox += boxW + gap;
			});
			// Chain down into the shared bottleneck.
			g.appendChild(el('line', {
				x1: cx, y1: this.Y_OPS + boxH, x2: cx, y2: this.Y_NECK, class: 'an-tap',
			}));
		}

		const last = this.stages[this.stages.length - 1];
		const bx = this.stages[0].x - 58;
		const bw = last.x + 58 - bx;
		g.appendChild(el('rect', {
			x: bx, y: this.Y_NECK, width: bw, height: this.NECK_H, rx: 3, class: 'an-bottleneck',
		}));
		const bl = el('text', {
			x: bx + bw / 2, y: this.Y_NECK + this.NECK_H - 6.5,
			class: 'an-bottleneck-label', 'text-anchor': 'middle',
		});
		bl.textContent = 'one shared bottleneck · 4,715 parameters · the chain cannot grow with the network';
		g.appendChild(bl);

		const cl = el('text', { x: bx, y: this.Y_CAPTION, class: 'an-chain-caption' });
		cl.textContent = 'FOUR OPERATIONS, BOUNDED — the same four on every stage';
		g.appendChild(cl);

		this.root.appendChild(g);
	}

	/** The sealed arm's counterpart to the chain: the reason the space is empty. */
	private drawSeal(): void {
		const g = el('g');
		const last = this.stages[this.stages.length - 1];
		const bx = this.stages[0].x - 58;
		const bw = last.x + 58 - bx;
		const top = this.Y_OPS;
		const bottom = this.Y_NECK + this.NECK_H;

		g.appendChild(el('rect', {
			x: bx, y: top, width: bw, height: bottom - top, rx: 3, class: 'an-void',
		}));
		const mid = top + (bottom - top) / 2;
		const l1 = el('text', { x: bx + bw / 2, y: mid - 2, class: 'an-void-label', 'text-anchor': 'middle' });
		l1.textContent = 'No per-component quantity is computed here.';
		g.appendChild(l1);
		const l2 = el('text', { x: bx + bw / 2, y: mid + 12, class: 'an-void-sub', 'text-anchor': 'middle' });
		l2.textContent = 'The path from a parameter to the loss runs through everything downstream.';
		g.appendChild(l2);

		const cl = el('text', { x: bx, y: this.Y_CAPTION, class: 'an-chain-caption an-chain-caption--void' });
		cl.textContent = 'NO BOUNDED CHAIN — nothing to tap';
		g.appendChild(cl);

		this.root.appendChild(g);
	}

	/** Called every frame. `strikeNodes` are the components a correction named
	 *  within the last moment, so the pulse lands on the stage it names. */
	update(frame: HealthFrame | null, strikeNodes: Set<number>, running: boolean): void {
		for (const p of this.flows) {
			p.classList.toggle('is-running', running && !this.opts.reduced);
		}
		if (!this.opts.instrumented || !frame) return;

		for (const s of this.stages) {
			const n = frame.nodes.find((x) => x.id === s.id);
			const units = this.units.get(s.id);
			const halo = this.halos.get(s.id);
			const st = this.states.get(s.id);
			const mt = this.metrics.get(s.id);
			const strike = this.strikes.get(s.id);
			if (!n || !units) continue;

			const wn = n.weight_norm ?? 0;
			const destroyed = wn === 0;
			const g = Math.max(0, Math.min(1, n.goodness ?? 0));

			// Every unit in a stage carries the SAME state, because the telemetry
			// resolves to the stage. Varying them would be inventing per-channel
			// data the archive does not hold.
			for (const u of units) {
				u.classList.toggle('is-destroyed', destroyed);
				u.style.setProperty('--health', destroyed ? '0' : g.toFixed(3));
			}
			if (halo) {
				halo.setAttribute('opacity', destroyed ? '0' : (0.05 + g * 0.30).toFixed(3));
			}

			if (st) {
				st.textContent = destroyed ? 'destroyed' : (n.state ?? '—');
				st.classList.toggle('is-destroyed', destroyed);
			}
			if (mt) {
				mt.textContent = destroyed
					? 'weight norm 0.00'
					: `health ${g.toFixed(2)} · wn ${wn.toFixed(2)}`;
			}
			if (strike) {
				strike.setAttribute('opacity', strikeNodes.has(s.id) ? '1' : '0');
			}
			this.gones.get(s.id)?.setAttribute('opacity', destroyed ? '1' : '0');
		}
	}

	destroy(): void {
		this.ro?.disconnect();
		this.ro = null;
		this.root.remove();
	}
}
