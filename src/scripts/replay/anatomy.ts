// THE NETWORK, IN THREE DIMENSIONS.
//
// This module draws the network itself: the convolutional stages at their real
// widths, the flow between them, and — on the instrumented arm only — the
// bounded chain and the per-stage readout.
//
// WHY IT IS DRAWN THIS WAY. The previous version was a row of flat columns in
// SVG: correct, and a diagram of a network rather than a picture of one. A
// convolutional stage is not a column of dots. It is a stack of feature maps,
// and the whole literature of network visualisation draws it as exactly that —
// planes receding in depth, which is how "A walk in the black-box" and Harley's
// CNN visualiser both show it. Depth is not decoration here: it is the shape of
// the thing, and it is the difference between a reader seeing a graph and a
// reader seeing a machine.
//
// BOTH ARMS DRAW THE SAME ANATOMY. Same stages, same depths, same positions,
// same camera. The sealed arm is not drawn as mysterious or broken; it is drawn
// as sealed. Its cards carry no fill and no readout, because a standard network
// does not compute one, and the absence has to be visible as an absence rather
// than as something withheld.
//
// CANVAS, NOT WebGL. The scene is five stages of at most eleven cards and about
// four hundred edges. three.js is ~168KB gzipped for that, and WebGL carries a
// real failure path — blocked by privacy settings, absent on old hardware, shut
// down by the browser to save battery — which would need a fallback renderer
// written anyway. A hand-rolled projection has one failure mode, which is a
// browser with no 2D canvas, and it keeps every colour under the same tokens as
// the rest of the console.
//
// EVERY FRAME IS A PURE FUNCTION OF (t, state). No accumulated transforms, no
// tweens holding their own position. A resize, a scenario change or a seek
// re-renders identically rather than approximately.

import type { Bundle, HealthFrame } from './types';
import chainData from '../../data/bounded-chain.json';

export interface AnatomyOpts {
	/** false draws the sealed arm: same geometry, no instrumentation. */
	instrumented: boolean;
	reduced: boolean;
}

/* The units within a stage are deliberately uniform. The telemetry resolves to the
   stage, not to the individual channel, and drawing them with differing states would
   invent per-channel data the archive does not contain. The grid is a sample of the
   real channel count, which is printed above it — see gridFor() in draw(). */

const fmt = (n: number) => n.toLocaleString('en-GB');

/** THE BOUNDED CHAIN, as SharedBottleneckReadout builds it — three_signal_learning/src/
 *  core/shared_readout.py:15–26, whose own self-test asserts the 4,715 total (line 73).
 *  LayerNorm over 128 is 256 parameters (γ and β), Linear 128→32 with bias is 4,128,
 *  PReLU is one learned slope, Linear 32→10 with bias is 330. Kept in data/bounded-chain.json
 *  so the exploded view, the tour's narration generator and its tests read one list, and
 *  the drawing, the words and the voice cannot differ. */
export const BOUNDED_CHAIN: ReadonlyArray<{ name: string; shape: string; params: number }> = chainData.chain;
export const CHAIN_PARAMS = BOUNDED_CHAIN.reduce((sum, c) => sum + c.params, 0);
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

interface Stage {
	id: number;
	inDim: number;
	outDim: number;
	params: number;
	/** Centre of the stack along the flow axis, in world units. */
	x: number;
	/** Half-height of a card face. Carries the real channel count. */
	half: number;
}

interface P2 {
	x: number;
	y: number;
	/** Perspective divisor: 1 at the camera plane, smaller further away. */
	d: number;
	/** View-space depth, for painter ordering. */
	z: number;
}

export class Anatomy {
	private readonly mount: HTMLElement;
	private readonly opts: AnatomyOpts;
	private readonly cv: HTMLCanvasElement;
	private readonly ctx: CanvasRenderingContext2D;

	private bundle: Bundle | null = null;
	private stages: Stage[] = [];
	private frame: HealthFrame | null = null;
	private strikeNodes: Set<number> = new Set();
	private running = false;

	private ro: ResizeObserver | null = null;
	private raf = 0;
	private readonly born = performance.now();
	private dead = false;
	/** A frame is already booked. Guards against two chains from one instance. */
	private pending = false;
	/** The document went away. Nothing is drawn until it comes back. */
	private suspended = false;
	/** Something covers the console (hold()). Nothing is drawn until it is released. */
	private held = false;

	/* The same bounds the flat version used, so the component's height rules and
	   the cold open's hand-off geometry are unchanged. */
	private readonly MIN_W = 560;
	private readonly MAX_W = 1000;
	private readonly H = 300;
	private dpr = 1;

	/** Pointer parallax, in radians, eased towards the live pointer each frame. */
	private aimYaw = 0;
	private aimPitch = 0;
	private curYaw = 0;
	private curPitch = 0;

	/* ── DRIVEN BY THE DEMO TOUR ────────────────────────────────────────────────
	   steer() takes the camera away from the pointer so the tour can turn the
	   network on a schedule; the same easing as the pointer applies, so a steered
	   turn and a hand-driven one move identically. setRenderScale() raises the
	   backing resolution while the console is zoomed, because a canvas scaled up by
	   a CSS transform is a bitmap scaled up. setBreakdown() is the exploded view:
	   0 is the ordinary drawing, 1 is one stage lifted out and its bounded chain
	   laid open beside it. None of the three is reachable without the tour. */
	private steering = false;
	private renderScale = 1;
	private breakdown = 0;
	private breakdownStage: number | null = null;
	/** The fit is eased so a turn does not make the whole drawing pump in and out. */
	private curScale = NaN;
	private snapScale = true;
	/** The black box around the network: null is no box at all (every view but the
	 *  tour's), `unfold` 0 is shut and 1 is fully open and gone, `shade` is how opaque
	 *  its walls are. */
	private box: { unfold: number; shade: number; glow: number } | null = null;
	/** Named screen points from the last frame drawn, in canvas CSS pixels — where the
	 *  tour's leader lines attach. */
	private anchors = new Map<string, { x: number; y: number }>();

	private onPointer: ((e: PointerEvent) => void) | null = null;
	private onLeave: (() => void) | null = null;
	private onVisibility: (() => void) | null = null;

	constructor(mount: HTMLElement, opts: AnatomyOpts) {
		this.mount = mount;
		this.opts = opts;

		this.cv = document.createElement('canvas');
		this.cv.className = 'an-canvas';
		this.cv.setAttribute('role', 'img');
		this.cv.style.display = 'block';
		this.cv.style.width = '100%';
		this.cv.style.height = `${this.H}px`;
		mount.appendChild(this.cv);
		this.ctx = this.cv.getContext('2d')!;

		this.size();
		if ('ResizeObserver' in window) {
			this.ro = new ResizeObserver(() => this.size());
			this.ro.observe(mount);
		}

		/* Parallax is bound to the mount, not the window: two of these sit side by
		   side and each should answer to the pointer that is actually over it. */
		if (!opts.reduced) {
			this.onPointer = (e: PointerEvent) => {
				// While the tour holds the camera, a hand on the mouse must not fight it.
				if (this.steering) return;
				const r = this.cv.getBoundingClientRect();
				this.aimYaw = clamp((e.clientX - (r.left + r.width / 2)) / r.width, -0.5, 0.5) * 0.5;
				this.aimPitch = clamp((e.clientY - (r.top + r.height / 2)) / r.height, -0.5, 0.5) * 0.22;
			};
			this.onLeave = () => {
				if (this.steering) return;
				this.aimYaw = 0;
				this.aimPitch = 0;
			};
			mount.addEventListener('pointermove', this.onPointer);
			mount.addEventListener('pointerleave', this.onLeave);
		}

		/* ── WHEN THE DOCUMENT GOES AWAY, SO DOES THE LOOP ───────────────────────
		   Two of these run side by side on /black-box and on the home page, which
		   is 120 requestAnimationFrame callbacks a second — and on the home page
		   the embed carries `loop`, so it never stops of its own accord.

		   Only the document's own visibility, deliberately. The IntersectionObserver
		   that used to pause this on scroll was removed because pausing mid-playback
		   during a guided read was a reported bug, and visibilitychange cannot
		   reintroduce it: a guided read is something a reader is looking at, and a
		   document that is hidden is by definition one nobody is looking at.

		   Belt and braces rather than a fix on its own — every engine already
		   suspends or throttles rAF for a hidden document — but "throttles" is not
		   "stops" everywhere, and this also makes the intent legible instead of
		   leaving two 60Hz loops relying on someone else's policy. */
		this.onVisibility = () => {
			this.suspended = document.hidden;
			if (this.suspended) {
				cancelAnimationFrame(this.raf);
				this.pending = false;
			} else {
				this.schedule();
			}
		};
		document.addEventListener('visibilitychange', this.onVisibility);

		this.schedule();
	}

	/** Book one frame, and only one.
	 *
	 *  EVERY PATH THAT WANTS A REPAINT GOES THROUGH HERE, so the instance can never
	 *  hold two rAF chains at once however many times it is poked — which is the
	 *  invariant that makes the on-demand mode below safe, and which a bare
	 *  `requestAnimationFrame(this.tick)` at each call site would not give. */
	private schedule(): void {
		if (this.dead || this.pending || this.suspended || this.held) return;
		this.pending = true;
		this.raf = requestAnimationFrame(this.tick);
	}

	private size(): void {
		/* LAYOUT SIZE, NOT RENDERED SIZE. getBoundingClientRect() includes transforms, and
		   the demo tour zooms the console with one — so a resize or a scenario load during
		   a zoom sized the backing store to the SCALED width while the element kept its
		   layout width, and everything right of the old edge was drawn off the canvas.
		   offsetWidth is the layout box and ignores transforms, which is the width the
		   canvas actually occupies. Identical to the old value whenever nothing is
		   transformed. */
		const w = this.mount.offsetWidth;
		if (!w) return;
		// Capped at 3 device pixels per CSS pixel: a Retina screen at the tour's 2× zoom would
		// otherwise ask for 4, sixteen times the pixels of a plain screen, twice over.
		this.dpr = Math.min(3, Math.min(window.devicePixelRatio || 1, 2) * this.renderScale);
		const cssH = this.cv.offsetHeight || parseFloat(getComputedStyle(this.cv).height) || this.H;
		this.cv.width = Math.round(w * this.dpr);
		this.cv.height = Math.round(cssH * this.dpr);
		// Setting either dimension clears the canvas, so a resize always owes a
		// repaint — and under reduced motion no loop is coming to supply one.
		this.snapScale = true;
		this.schedule();
	}

	/** Hold the camera at a yaw and pitch offset (radians), or hand it back to the
	 *  pointer with null. Eased exactly as pointer parallax is. */
	steer(yaw: number | null, pitch = 0): void {
		if (yaw === null) {
			this.steering = false;
			this.aimYaw = 0;
			this.aimPitch = 0;
		} else {
			this.steering = true;
			this.aimYaw = clamp(yaw, -0.9, 0.9);
			this.aimPitch = clamp(pitch, -0.4, 0.4);
		}
		this.schedule();
	}

	/** Stop drawing while something covers the console (the demo tour's opening), and
	 *  pick up again on release. Nothing is lost: every frame is a function of (t, state). */
	hold(on: boolean): void {
		if (this.held === on) return;
		this.held = on;
		if (on) {
			cancelAnimationFrame(this.raf);
			this.pending = false;
		} else {
			this.schedule();
		}
	}

	/** Render at `s` times the device ratio — for a console zoomed by `s`. */
	setRenderScale(s: number): void {
		const v = clamp(s, 1, 2);
		if (Math.abs(v - this.renderScale) < 0.01) return;
		this.renderScale = v;
		this.size();
	}

	/** The exploded view. `p` 0..1; `stageId` picks the stage that opens. Ignored on
	 *  the sealed arm, which has no chain to open — that absence is the point. */
	setBreakdown(p: number, stageId: number | null = null): void {
		if (!this.opts.instrumented) return;
		this.breakdown = clamp(p, 0, 1);
		if (stageId !== null) this.breakdownStage = stageId;
		this.schedule();
	}

	/** THE BLACK BOX, literally: six dark walls around the network. `unfold` 0 is shut,
	 *  1 is open — the side walls hinge down onto the floor and the lid lifts away — and
	 *  null takes the box away entirely, which is how every view but the tour's has it.
	 *  `glow` lights the seams and the inside as it opens; a box closing has none. */
	setBox(unfold: number | null, shade = 1, glow = 0): void {
		this.box = unfold === null ? null : { unfold: clamp(unfold, 0, 1), shade: clamp(shade, 0, 1), glow: clamp(glow, 0, 1) };
		this.schedule();
	}

	/** Where a named point of the drawing is on screen, in client pixels, as of the last
	 *  frame: `stage:N`, `stage:N:top`, `stage:N:bottom`, `piece:K`, `loss`, `box`. */
	anchor(key: string): { x: number; y: number } | null {
		const a = this.anchors.get(key);
		if (!a) return null;
		const r = this.cv.getBoundingClientRect();
		const k = this.cv.offsetWidth ? r.width / this.cv.offsetWidth : 1;
		return { x: r.left + a.x * k, y: r.top + a.y * k };
	}

	load(bundle: Bundle): void {
		this.bundle = bundle;
		this.snapScale = true;
		this.size();

		const nodes = bundle.topology.nodes;
		const maxOut = nodes.length ? Math.max(...nodes.map((n) => n.out || 1)) : 1;
		// 460 read small: the perspective divide takes roughly a quarter off before
		// anything is scaled, so the network sat in 40% of the panel with the rest
		// empty. Widened here and the camera brought in below.
		const span = 540;
		const step = nodes.length > 1 ? span / (nodes.length - 1) : 0;

		this.stages = nodes.map((n, i) => {
			const out = n.out || 1;
			return {
				id: n.id,
				inDim: n.in,
				outDim: out,
				params: n.params,
				x: -span / 2 + i * step,
				// The face grows with the real channel count, so the network is seen
				// to widen as it deepens — the same fact the flat version carried in
				// column height.
				// Deeper faces. At 26–56 the stacks read as pinstripes rather than as
				// slabs with a channel count worth comparing.
				half: 32 + (out / maxOut) * 40,
			};
		});

		const c = bundle.conditions;
		const params = this.opts.instrumented ? c.params_ormas : c.params_baseline;
		this.cv.setAttribute(
			'aria-label',
			this.opts.instrumented
				? `The ORMAS network in three dimensions: ${this.stages.length} instrumented convolutional stages${params ? `, ${fmt(params)} parameters` : ''}, each reporting its own health, with a bounded four-operation chain into a shared bottleneck.`
				: `A standard convolutional network of the same shape in three dimensions: the same stages${params ? `, ${fmt(params)} parameters` : ''}, with no per-component instrumentation of any kind.`,
		);
		// A new scenario is an entirely new drawing. size() usually books the frame,
		// but it bails when the mount has no width yet, so ask again here.
		this.schedule();
	}

	update(frame: HealthFrame | null, strikeNodes: Set<number>, running: boolean): void {
		this.frame = frame;
		this.strikeNodes = strikeNodes;
		this.running = running;
		// No-op while the loop is free-running; the repaint under reduced motion.
		this.schedule();
	}

	destroy(): void {
		this.dead = true;
		cancelAnimationFrame(this.raf);
		this.pending = false;
		if (this.onVisibility) document.removeEventListener('visibilitychange', this.onVisibility);
		this.onVisibility = null;
		this.ro?.disconnect();
		this.ro = null;
		if (this.onPointer) this.mount.removeEventListener('pointermove', this.onPointer);
		if (this.onLeave) this.mount.removeEventListener('pointerleave', this.onLeave);
		this.cv.remove();
	}

	/* ── projection ─────────────────────────────────────────────────────────────
	   Yaw about the vertical, then pitch about the horizontal, then a single
	   perspective divide. FOCAL sets how strong the perspective is: too short and
	   the near stage balloons and the far one vanishes, too long and the whole
	   thing flattens back into the diagram this replaced. 900 against a 460-unit
	   network reads as depth without distorting the channel counts, which are the
	   one thing in the picture a reader is meant to compare. */
	private project(px: number, py: number, pz: number, yaw: number, pitch: number): P2 {
		const cy = Math.cos(yaw);
		const sy = Math.sin(yaw);
		const x1 = px * cy - pz * sy;
		const z1 = px * sy + pz * cy;

		const cx = Math.cos(pitch);
		const sx = Math.sin(pitch);
		const y1 = py * cx - z1 * sx;
		const z2 = py * sx + z1 * cx;

		const FOCAL = 900;
		// 420 pushed the camera far enough back that d fell to ~0.68 and shrank the
		// whole scene before scale ever applied. 300 keeps the perspective honest
		// and gives the network the panel.
		const d = FOCAL / (FOCAL + z2 + 300);
		return { x: x1 * d, y: y1 * d, d, z: z2 };
	}

	/* ── REDUCED MOTION GETS A LOOP THAT IS NOT A LOOP ───────────────────────────
	   Under `prefers-reduced-motion: reduce` this drawing does not move. The camera
	   drift is multiplied by zero (see `drift` in draw), the pointer parallax
	   listeners are never attached so aimYaw and aimPitch stay at zero and the
	   easings converge to zero and stop, and the travelling activation packets are
	   gated on `!this.opts.reduced`. Those are the only two places `t` is read.
	   The frame is therefore a pure function of the health frame, the strike set
	   and the canvas size — and it was being redrawn sixty times a second anyway,
	   twice over, for a reader who has asked the machine to stop moving things.
	   Measured at 390px: 364 callbacks in three seconds with reduced motion on.

	   So in that mode the chain does not re-arm itself. It paints once and waits,
	   and the three things that can change the picture — update() from the
	   console's own frame, load() on a scenario change, and the ResizeObserver —
	   book the next frame. While the run is playing update() fires every frame, so
	   the cadence is identical; while it is paused nothing is scheduled at all.
	   Same pixels, no idle loop. */
	private tick = (now: number): void => {
		if (this.dead) return;
		this.pending = false;
		if (!this.opts.reduced) this.schedule();
		try {
			this.draw(now - this.born);
		} catch (err) {
			// A throw here would kill the loop and freeze the picture with no clue
			// as to why. The console below is fully functional without this.
			console.error('[anatomy] frame failed', err);
			cancelAnimationFrame(this.raf);
			this.pending = false;
		}
	};

	private draw(t: number): void {
		const ctx = this.ctx;
		const cssW = this.cv.width / this.dpr;
		const cssH = this.cv.height / this.dpr;
		ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
		ctx.clearRect(0, 0, cssW, cssH);
		if (!this.stages.length) return;

		const ink = this.opts.instrumented;
		const css = getComputedStyle(this.cv);
		const AMBER = css.getPropertyValue('--ormas').trim() || '#E0A233';
		const SLATE = css.getPropertyValue('--base').trim() || '#7FA3DC';
		const WARN = css.getPropertyValue('--warn').trim() || '#E0645F';
		const FG = css.getPropertyValue('--fg').trim() || '#F1EFE8';
		const DIM = css.getPropertyValue('--fg-dim').trim() || '#828AA8';
		const node = (id: number) => this.frame?.nodes.find((n) => n.id === id) ?? null;

		const drift = this.opts.reduced ? 0 : Math.sin(t / 5200) * 0.05;
		if (this.opts.reduced) {
			// No loop runs under reduced motion, so an easing would never arrive.
			this.curYaw = this.aimYaw;
			this.curPitch = this.aimPitch;
		} else {
			this.curYaw += (this.aimYaw - this.curYaw) * 0.06;
			this.curPitch += (this.aimPitch - this.curPitch) * 0.06;
		}
		/* A HARDER YAW THAN THE BOXES WANTED. Each layer is a square grid in (y, z),
		   and z only reaches the screen through sin(yaw): at -0.40 a five-by-five
		   grid spread 39px across and 98px down, which is not a grid, it is a
		   zigzag. At -0.62 it opens to 58px and reads as the plane it is. The cost
		   is 19% of the flow axis to cos(yaw), which the fit gives straight back. */
		const yaw = -0.62 + drift + this.curYaw;
		const pitch = 0.20 + this.curPitch;

		/* ── THE LAYERS ARE GRIDS OF NEURONS ─────────────────────────────────────
		   The previous version drew each stage as a stack of solid feature-map
		   cards. Accurate for a convolution, and on screen it read as three
		   cardboard boxes — the thing a person recognises as a neural network is
		   neurons and the connections between them, and there were none of either.
		   Each stage is a square grid of units now, and the grid grows with the
		   real channel count, so the network is still seen to widen as it deepens.
		   The true count stays printed above it. */
		interface Unit { x: number; y: number; z: number }
		interface Layer {
			id: number | null;
			x: number;
			units: Unit[];
			half: number;
			grid: number;
		}

		const gridFor = (out: number) => clamp(Math.round(Math.sqrt(out) / 2.2), 3, 5);
		const layers: Layer[] = [];

		// Input: the three colour planes, as a small upright cluster.
		const lead = 128;
		layers.push({
			id: null,
			x: this.stages[0].x - lead,
			half: 24,
			grid: 3,
			units: [-1, 0, 1].map((k) => ({ x: this.stages[0].x - lead, y: k * 22, z: 0 })),
		});

		for (const s of this.stages) {
			const g = gridFor(s.outDim);
			const step = g > 1 ? (s.half * 2) / (g - 1) : 0;
			const units: Unit[] = [];
			for (let a = 0; a < g; a++) {
				for (let b2 = 0; b2 < g; b2++) {
					units.push({ x: s.x, y: -s.half + a * step, z: -s.half + b2 * step });
				}
			}
			layers.push({ id: s.id, x: s.x, units, half: s.half, grid: g });
		}

		// Output: ten classes, as two columns of five.
		const last = this.stages[this.stages.length - 1];
		const outX = last.x + lead;
		const outUnits: Unit[] = [];
		for (let a = 0; a < 5; a++) {
			for (let b2 = 0; b2 < 2; b2++) {
				outUnits.push({ x: outX, y: -44 + a * 22, z: -11 + b2 * 22 });
			}
		}
		layers.push({ id: null, x: outX, units: outUnits, half: 44, grid: 2 });

		/* ── THE EXPLODED VIEW ───────────────────────────────────────────────────
		   One stage lifts out of the network and its bounded chain comes apart beside
		   it, piece by piece, in the order the local signal passes through them:
		   LayerNorm over 128, Linear 128→32, PReLU, Linear 32→10, then the local loss
		   whose running value IS the stage's health. Those are the real shapes of
		   SharedBottleneckReadout (three_signal_learning/src/core/shared_readout.py),
		   and the four parameter counts sum to the 4,715 printed under the drawing (4,416 of them are
		   the two projection weight matrices, which is the figure the paper quotes) —
		   so the picture is the architecture, not an illustration of it.

		   Drawn as blocks whose square faces are sized by the width they carry, so the
		   bottleneck is SEEN to narrow — 128 down to 32 down to 10. That narrowing is
		   the argument: the path from a stage to its own loss is short and cannot grow.

		   Three phases off one number, so a scrub backwards replays it exactly:
		     bA  the network recedes and the chosen stage slides clear
		     bB  the pieces leave the stage one after another and take their places
		     bC  names, parameter counts and the travelling signal come up */
		const smooth = (v: number) => v * v * (3 - 2 * v);
		const bd = ink ? this.breakdown : 0;
		const bA = smooth(clamp(bd / 0.35, 0, 1));
		const bB = clamp((bd - 0.18) / 0.62, 0, 1);
		const bC = smooth(clamp((bd - 0.72) / 0.28, 0, 1));
		const selId = bd > 0
			? (this.breakdownStage ?? this.stages[Math.min(1, this.stages.length - 1)].id)
			: null;
		const selLayer = selId === null ? null : layers.find((L) => L.id === selId) ?? null;
		const FOCUS_X = -330;
		if (selLayer && bA > 0) {
			const dx = (FOCUS_X - selLayer.x) * bA;
			selLayer.x += dx;
			for (const u of selLayer.units) {
				u.x += dx;
				u.y -= 10 * bA;
			}
		}

		interface Piece {
			name: string;
			shape: string;
			params: number;
			x0: number;
			x1: number;
			h0: number;
			h1: number;
			/** 0..1, how far out of the stage this piece has travelled. */
			e: number;
		}
		const pieces: Piece[] = [];
		let sphere: { x: number; r: number; e: number } | null = null;
		/* Where every piece ENDS UP, whatever the animation's progress. The camera frames
		   these, not the pieces in flight: framing the moving pieces made the zoom chase
		   them — in close on the lone stage, then out again as the chain arrived. */
		const targets: Array<{ x0: number; x1: number; h0: number; h1: number }> = [];
		let sphereTarget = 0;
		if (selLayer && bd > 0) {
			/* Square half-widths in world units, by the width each piece carries.
			   128 → 58, 32 → 22, 10 → 12: not linear in the dimension, because at a
			   true ratio the last piece would be a speck — but monotone, so the order
			   of sizes, which is the thing a reader compares, is exact. */
			const H128 = 44;
			const H32 = 18;
			const H10 = 10;
			/* Wide gaps. The blocks are seen at an angle, so each one's depth spills
			   sideways onto its neighbour; at 46 units apart the four overprinted and their
			   names packed each other off the rail. */
			const G = 62;
			// Geometry per piece, in chain order: the face it enters by, the face it
			// leaves by, and its length along the flow.
			const geom = [
				{ h0: H128, h1: H128, len: 10 },
				{ h0: H128, h1: H32, len: 104 },
				{ h0: H32, h1: H32, len: 10 },
				{ h0: H32, h1: H10, len: 80 },
			];
			const spec = BOUNDED_CHAIN.map((c, k) => ({ ...c, ...geom[k] }));
			let x = FOCUS_X + 92;
			spec.forEach((s, k) => {
				const e = smooth(clamp((bB - k * 0.13) / 0.42, 0, 1));
				const tx0 = x;
				const tx1 = x + s.len;
				targets.push({ x0: tx0, x1: tx1, h0: s.h0, h1: s.h1 });
				x = tx1 + G;
				// Each piece leaves from the stage face and slides out to its place.
				const x0 = FOCUS_X + (tx0 - FOCUS_X) * e;
				const x1 = x0 + (tx1 - tx0) * (0.3 + 0.7 * e);
				const g = 0.35 + 0.65 * e;
				pieces.push({ name: s.name, shape: s.shape, params: s.params, x0, x1, h0: s.h0 * g, h1: s.h1 * g, e });
			});
			const eS = smooth(clamp((bB - 4 * 0.13) / 0.42, 0, 1));
			sphereTarget = x + 12;
			sphere = { x: FOCUS_X + (sphereTarget - FOCUS_X) * eS, r: 12 * (0.4 + 0.6 * eS), e: eS };
			// Nothing has left the stage yet: draw no pieces at all rather than specks.
			for (let k = pieces.length - 1; k >= 0; k--) if (pieces[k].e <= 0) pieces.splice(k, 1);
			if (eS <= 0) sphere = null;
		}

		/* ── fit ─────────────────────────────────────────────────────────────────
		   Measured from the projected silhouette at the CURRENT camera, with the
		   label bands reserved first. A fit that ignores the turn clips as soon as
		   the thing moves, and type is the part that must never fall off. */
		/* 20, not 14. The fit measures node CENTRES, and a lit neuron's halo reaches
		   about fourteen screen pixels past its centre — screen pixels, which do not
		   shrink with the scale the fit chooses, so no amount of fitting accounts for
		   them. Measured at 1280 and 390: 3px of margin where 14 was intended. */
		const PAD_X = 20;
		const TOP = 32;
		/* The instrumented arm stacks four lines down there: state, health, the chain
		   caption and the footnote. At 58 the health rail landed 7px from the chain
		   caption and printed across it. 76 is what four lines actually need. */
		const BOTTOM = ink ? 76 : 34;
		const raw = (x: number, y: number, z: number) => this.project(x, y, z, yaw, pitch);

		let bx0 = Infinity;
		let bx1 = -Infinity;
		let by0 = Infinity;
		let by1 = -Infinity;
		const grow = (x: number, y: number, z: number) => {
			const q = raw(x, y, z);
			if (q.x < bx0) bx0 = q.x;
			if (q.x > bx1) bx1 = q.x;
			if (q.y < by0) by0 = q.y;
			if (q.y > by1) by1 = q.y;
		};
		for (const L of layers) {
			for (const u of L.units) grow(u.x, u.y, u.z);
		}
		/* THE CAMERA PUSHES IN ON THE OPENED STAGE. As the rest of the network recedes, the
		   frame moves from the whole network to the stage and its chain at their final
		   places, plus the room their labels need above and below — the same move a
		   camera makes towards the thing a narrator has started talking about. */
		if (selLayer && bA > 0 && targets.length) {
			const full = { x0: bx0, x1: bx1, y0: by0, y1: by1 };
			bx0 = Infinity; bx1 = -Infinity; by0 = Infinity; by1 = -Infinity;
			const half = this.stages.find((s) => s.id === selId)?.half ?? 50;
			for (const [yy, zz] of [[-half, -half], [half, half], [-half, half], [half, -half]]) {
				grow(FOCUS_X, yy - 10, zz);
			}
			grow(FOCUS_X, half + 30, 0);                 // the stage's own name, underneath
			for (const tg of targets) {
				for (const [px, h] of [[tg.x0, tg.h0], [tg.x1, tg.h1]] as const) {
					grow(px, -h - 34, -h);                // names above
					grow(px, h + 26, h);                  // counts below
					grow(px, -h, h);
					grow(px, h, -h);
				}
			}
			grow(sphereTarget + 40, -30, 0);             // "local loss" and its health
			const k = bA;
			bx0 = full.x0 + (bx0 - full.x0) * k;
			bx1 = full.x1 + (bx1 - full.x1) * k;
			by0 = full.y0 + (by0 - full.y0) * k;
			by1 = full.y1 + (by1 - full.y1) * k;
		}
		/* ── THE BOX ─────────────────────────────────────────────────────────────
		   A cuboid a margin clear of every unit. While it is shut the camera frames the
		   box; as it opens the frame eases back onto the network inside, so the opening
		   reads as the camera moving in on what was hidden. */
		const box = this.box && this.box.unfold < 1 ? this.box : null;
		const closed = box ? 1 - smooth(box.unfold) : 0;
		let mh = 0;
		for (const L of layers) mh = Math.max(mh, L.half);
		const BX0 = layers[0].x - 40;
		const BX1 = layers[layers.length - 1].x + 40;
		const BY0 = -mh - 26;
		const BY1 = mh + 22;
		const BZ0 = -mh - 26;
		const BZ1 = mh + 26;
		if (box && closed > 0) {
			const net = { x0: bx0, x1: bx1, y0: by0, y1: by1 };
			bx0 = Infinity; bx1 = -Infinity; by0 = Infinity; by1 = -Infinity;
			for (const x of [BX0, BX1]) for (const y of [BY0, BY1]) for (const z of [BZ0, BZ1]) grow(x, y, z);
			bx0 = net.x0 + (bx0 - net.x0) * closed;
			bx1 = net.x1 + (bx1 - net.x1) * closed;
			by0 = net.y0 + (by0 - net.y0) * closed;
			by1 = net.y1 + (by1 - net.y1) * closed;
		}

		/* The reflection is the first thing to go when the panel is short. In app mode
		   the canvas is 240px and the label rails already claim 102 of them; spending
		   another sixth on a mirror image would leave the network smaller than the
		   type describing it. */
		const REFLECT = cssH >= 300 ? 0.16 : 0;
		const availW = Math.max(40, cssW - PAD_X * 2);
		const availH = Math.max(40, (cssH - TOP - BOTTOM) / (1 + REFLECT));
		const fitScale = clamp(
			Math.min(availW / Math.max(1, bx1 - bx0), availH / Math.max(1, by1 - by0)),
			0.28,
			2.1,
		);
		/* EASED, SO A TURN DOES NOT PUMP. The silhouette changes width as the network
		   turns, and a fit recomputed raw every frame made the whole drawing breathe in
		   and out in step with the camera — invisible under a few degrees of pointer
		   parallax, obvious under a steered half-turn. Snapped on load, on resize and
		   under reduced motion, where there is no next frame to ease towards. */
		if (this.snapScale || this.opts.reduced || !Number.isFinite(this.curScale)) {
			this.curScale = fitScale;
			this.snapScale = false;
		} else {
			this.curScale += (fitScale - this.curScale) * 0.16;
		}
		const scale = this.curScale;
		const ox = cssW / 2 - ((bx0 + bx1) / 2) * scale;
		const oy = TOP + availH / 2 - ((by0 + by1) / 2) * scale;
		const P = (x: number, y: number, z: number): P2 => {
			const p = this.project(x, y, z, yaw, pitch);
			return { x: ox + p.x * scale, y: oy + p.y * scale, d: p.d, z: p.z };
		};

		/* ── the scene, as one callable ──────────────────────────────────────────
		   Drawn twice: once upright, once mirrored below the floor at low alpha.
		   A reflection is the cheapest thing in the box that makes a scene sit ON
		   something rather than float in front of a flat colour. */
		const paintNet = (alpha: number) => {
			type Face = { z: number; paint: () => void };
			const faces: Face[] = [];

			// Connections. Each unit reaches the three nearest in the next layer:
			// enough to read as a web, far short of the 625 an all-to-all between two
			// 25-unit grids would draw, which renders as a solid wedge.
			/* In the exploded view the web recedes: its edges would otherwise stretch to
			   wherever the lifted stage has gone and draw a fan across the chain. */
			const webA = alpha * (1 - bA);
			for (let i = 0; i < layers.length - 1 && webA > 0.01; i++) {
				const A = layers[i];
				const B = layers[i + 1];
				const gone = ink && ((A.id !== null && node(A.id)?.weight_norm === 0)
					|| (B.id !== null && node(B.id)?.weight_norm === 0));
				const hue = gone ? WARN : ink ? AMBER : SLATE;
				for (let a = 0; a < A.units.length; a++) {
					const u = A.units[a];
					const base = Math.round((a / Math.max(1, A.units.length - 1)) * (B.units.length - 1));
					for (const k of [-1, 0, 1]) {
						const v = B.units[base + k];
						if (!v) continue;
						const p = P(u.x, u.y, u.z);
						const q = P(v.x, v.y, v.z);
						faces.push({
							z: (p.z + q.z) / 2 + 400,
							paint: () => {
								ctx.strokeStyle = this.rgba(hue, (gone ? 0.05 : 0.13) * webA);
								ctx.lineWidth = 0.8;
								ctx.beginPath();
								ctx.moveTo(p.x, p.y);
								ctx.lineTo(q.x, q.y);
								ctx.stroke();
							},
						});
					}
				}

				/* Activation travelling the edges. Three packets a gap, staggered, and
				   only while the run is playing: a paused run should look paused. */
				if (this.running && !this.opts.reduced && !gone) {
					for (let s2 = 0; s2 < 3; s2++) {
						const idx = Math.floor(((s2 * 7 + i * 3) % Math.max(1, A.units.length)));
						const u = A.units[idx];
						const v = B.units[Math.min(B.units.length - 1,
							Math.round((idx / Math.max(1, A.units.length - 1)) * (B.units.length - 1)))];
						if (!u || !v) continue;
						const ph = ((t / 1300 + i * 0.22 + s2 * 0.33) % 1);
						const p = P(u.x, u.y, u.z);
						const q = P(v.x, v.y, v.z);
						const px = p.x + (q.x - p.x) * ph;
						const py = p.y + (q.y - p.y) * ph;
						faces.push({
							z: (p.z + q.z) / 2,
							paint: () => {
								ctx.fillStyle = this.rgba(ink ? AMBER : FG, 0.28 * webA);
								ctx.beginPath();
								ctx.arc(px, py, 4.5, 0, Math.PI * 2);
								ctx.fill();
								ctx.fillStyle = this.rgba(ink ? AMBER : FG, 0.95 * webA);
								ctx.beginPath();
								ctx.arc(px, py, 1.7, 0, Math.PI * 2);
								ctx.fill();
							},
						});
					}
				}
			}

			// Neurons. A wide soft disc under a small bright core: a glow that costs
			// two fills rather than a shadowBlur, which at fifty units twice a frame
			// is the difference between sixty frames and twenty.
			for (const L of layers) {
				const n = L.id === null ? null : ink ? node(L.id) : null;
				const destroyed = ink && L.id !== null && (n?.weight_norm ?? null) === 0;
				const health = clamp(n?.goodness ?? 0, 0, 1);
				const struck = L.id !== null && this.strikeNodes.has(L.id);
				// The rest of the network recedes while one stage is opened; the opened
				// stage keeps its full weight, because it is the subject.
				const la = selLayer && L !== selLayer ? alpha * (1 - 0.95 * bA) : alpha;
				for (const u of L.units) {
					const p = P(u.x, u.y, u.z);
					const near = clamp(0.45 + p.d * 0.85, 0.3, 1.25);
					let hue = SLATE;
					let lit = 0.34;
					if (destroyed) {
						hue = WARN;
						lit = 0.3;
					} else if (ink && L.id !== null) {
						// A wider range than 0.3–1.0. The point of lighting the unit by its
						// health is that a stage at 0.00 should look unmistakably unlike one
						// at 0.42, and at a floor of 0.3 the two were nearly the same amber.
						hue = AMBER;
						lit = 0.1 + health * 0.9;
					} else if (L.id === null) {
						hue = FG;
						lit = 0.4;
					}
					const r = (destroyed ? 1.9 : 2.4 + lit * 1.5) * near;
					faces.push({
						z: p.z,
						paint: () => {
							ctx.fillStyle = this.rgba(hue, 0.14 * lit * la);
							ctx.beginPath();
							ctx.arc(p.x, p.y, r * 2.8, 0, Math.PI * 2);
							ctx.fill();
							ctx.fillStyle = this.rgba(hue, (0.5 + lit * 0.5) * la);
							ctx.beginPath();
							ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
							ctx.fill();
							if (struck && !destroyed) {
								ctx.strokeStyle = this.rgba(AMBER, 0.8 * la);
								ctx.lineWidth = 1.2;
								ctx.beginPath();
								ctx.arc(p.x, p.y, r * 2.2, 0, Math.PI * 2);
								ctx.stroke();
							}
						},
					});
				}
			}

			/* ── the opened chain ───────────────────────────────────────────────────
			   Glass blocks, not outlines: six faces each, painter-sorted with the
			   neurons so the lifted stage and its chain overlap correctly as the
			   camera turns. The top faces carry the most light and the undersides the
			   least, which is the whole of the shading — enough for a block to read as
			   solid and still let the one behind it show through. */
			const tapA = pieces[0]?.e ?? 0;
			if (selLayer && tapA > 0) {
				const from = P(FOCUS_X, -10 * bA, 0);
				const to = P(pieces[0].x0, 0, 0);
				faces.push({
					z: Math.max(from.z, to.z) + 60,
					paint: () => {
						ctx.save();
						ctx.setLineDash([3, 4]);
						ctx.strokeStyle = this.rgba(AMBER, 0.6 * alpha * tapA);
						ctx.lineWidth = 1;
						ctx.beginPath();
						ctx.moveTo(from.x, from.y);
						ctx.lineTo(to.x, to.y);
						ctx.stroke();
						ctx.restore();
					},
				});
			}
			for (const pc of pieces) {
				if (pc.e <= 0) continue;
				const c = [
					[pc.x0, -pc.h0, -pc.h0], [pc.x0, pc.h0, -pc.h0], [pc.x0, pc.h0, pc.h0], [pc.x0, -pc.h0, pc.h0],
					[pc.x1, -pc.h1, -pc.h1], [pc.x1, pc.h1, -pc.h1], [pc.x1, pc.h1, pc.h1], [pc.x1, -pc.h1, pc.h1],
				].map(([x, y, z]) => P(x, y, z));
				const quads: Array<[number[], number]> = [
					[[0, 1, 2, 3], 0.2],  // the face the signal enters
					[[4, 5, 6, 7], 0.12], // the face it leaves
					[[0, 1, 5, 4], 0.1],  // far side
					[[3, 2, 6, 7], 0.16], // near side
					[[0, 3, 7, 4], 0.26], // top
					[[1, 2, 6, 5], 0.07], // underside
				];
				for (const [idx, tone] of quads) {
					faces.push({
						z: idx.reduce((a, i) => a + c[i].z, 0) / 4,
						paint: () => {
							const a = alpha * pc.e;
							ctx.beginPath();
							ctx.moveTo(c[idx[0]].x, c[idx[0]].y);
							for (let k = 1; k < 4; k++) ctx.lineTo(c[idx[k]].x, c[idx[k]].y);
							ctx.closePath();
							ctx.fillStyle = this.rgba(AMBER, tone * a);
							ctx.fill();
							ctx.strokeStyle = this.rgba(AMBER, 0.66 * a);
							ctx.lineWidth = 0.9;
							ctx.stroke();
						},
					});
				}
			}
			const sp = sphere;
			if (sp && sp.e > 0 && selId !== null) {
				const q = P(sp.x, 0, 0);
				const hv = clamp(node(selId)?.goodness ?? 0, 0, 1);
				const rr = Math.max(2, sp.r * scale * q.d);
				faces.push({
					z: q.z,
					paint: () => {
						const a = alpha * sp.e;
						const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, rr * 2.8);
						g.addColorStop(0, this.rgba(AMBER, (0.3 + 0.45 * hv) * a));
						g.addColorStop(1, this.rgba(AMBER, 0));
						ctx.fillStyle = g;
						ctx.beginPath();
						ctx.arc(q.x, q.y, rr * 2.8, 0, Math.PI * 2);
						ctx.fill();
						ctx.fillStyle = this.rgba(AMBER, (0.5 + 0.5 * hv) * a);
						ctx.beginPath();
						ctx.arc(q.x, q.y, rr, 0, Math.PI * 2);
						ctx.fill();
					},
				});
			}
			/* THE LOCAL SIGNAL, BOTH WAYS. Out along the chain to the loss in the ink
			   colour, back in amber: the backward pass that this whole architecture
			   bounds, shown running the four operations and stopping. Pure function of
			   t like everything else, and absent under reduced motion. */
			if (sp && bC > 0 && !this.opts.reduced) {
				const PERIOD = 2800;
				const ph = (t % PERIOD) / PERIOD;
				const out = ph < 0.5;
				const f = smooth(out ? ph / 0.5 : 1 - (ph - 0.5) / 0.5);
				const q = P(FOCUS_X + (sp.x - FOCUS_X) * f, 0, 0);
				faces.push({
					z: -1e6,
					paint: () => {
						const hue = out ? FG : AMBER;
						ctx.fillStyle = this.rgba(hue, 0.3 * alpha * bC);
						ctx.beginPath();
						ctx.arc(q.x, q.y, 6, 0, Math.PI * 2);
						ctx.fill();
						ctx.fillStyle = this.rgba(hue, 0.95 * alpha * bC);
						ctx.beginPath();
						ctx.arc(q.x, q.y, 2.2, 0, Math.PI * 2);
						ctx.fill();
					},
				});
			}

			/* ── the box's walls ──────────────────────────────────────────────────
			   Walls nearer the camera than the box's centre are painted after everything
			   inside, walls further away before it — for a closed convex box that is the
			   exact depth order, and while it opens the walls are already fading. */
			if (box && alpha > 0) {
				type V3 = [number, number, number];
				const u = box.unfold;
				const th = smooth(u) * Math.PI * 0.5;
				const fade = box.shade * (1 - smooth(clamp((u - 0.3) / 0.7, 0, 1)));
				const lidFade = box.shade * (1 - smooth(clamp(u / 0.55, 0, 1)));
				// Light escaping at the seams as it starts to open, then gone.
				const seam = ink ? box.glow * smooth(clamp(u / 0.06, 0, 1)) * (1 - smooth(clamp((u - 0.25) / 0.4, 0, 1))) : 0;
				const rotX = (p: V3, y0: number, z0: number, a: number): V3 => {
					const dy = p[1] - y0;
					const dz = p[2] - z0;
					return [p[0], y0 + dy * Math.cos(a) - dz * Math.sin(a), z0 + dy * Math.sin(a) + dz * Math.cos(a)];
				};
				const rotZ = (p: V3, x0: number, y0: number, a: number): V3 => {
					const dx = p[0] - x0;
					const dy = p[1] - y0;
					return [x0 + dx * Math.cos(a) - dy * Math.sin(a), y0 + dx * Math.sin(a) + dy * Math.cos(a), p[2]];
				};
				const walls: Array<{ pts: V3[]; a: number }> = [
					// front and back hinge on their bottom edges, about x
					{ pts: ([[BX0, BY0, BZ0], [BX1, BY0, BZ0], [BX1, BY1, BZ0], [BX0, BY1, BZ0]] as V3[]).map((p) => rotX(p, BY1, BZ0, th)), a: fade },
					{ pts: ([[BX0, BY0, BZ1], [BX1, BY0, BZ1], [BX1, BY1, BZ1], [BX0, BY1, BZ1]] as V3[]).map((p) => rotX(p, BY1, BZ1, -th)), a: fade },
					// the two ends hinge on theirs, about z
					{ pts: ([[BX0, BY0, BZ0], [BX0, BY0, BZ1], [BX0, BY1, BZ1], [BX0, BY1, BZ0]] as V3[]).map((p) => rotZ(p, BX0, BY1, -th)), a: fade },
					{ pts: ([[BX1, BY0, BZ0], [BX1, BY0, BZ1], [BX1, BY1, BZ1], [BX1, BY1, BZ0]] as V3[]).map((p) => rotZ(p, BX1, BY1, th)), a: fade },
					// the lid lifts and tips away
					{
						pts: ([[BX0, BY0, BZ0], [BX1, BY0, BZ0], [BX1, BY0, BZ1], [BX0, BY0, BZ1]] as V3[])
							.map((p) => rotX(p, BY0, (BZ0 + BZ1) / 2, -0.5 * smooth(u)))
							.map(([x, y, z]) => [x, y - 170 * smooth(u), z] as V3),
						a: lidFade,
					},
					{ pts: [[BX0, BY1, BZ0], [BX1, BY1, BZ0], [BX1, BY1, BZ1], [BX0, BY1, BZ1]], a: fade },
				];
				const mid = P(0, (BY0 + BY1) / 2, 0);
				for (const w of walls) {
					if (w.a <= 0.004) continue;
					const q = w.pts.map(([x, y, z]) => P(x, y, z));
					const cz = q.reduce((acc, c) => acc + c.z, 0) / 4;
					const near = cz < mid.z;
					faces.push({
						z: near ? -1e9 : 1e9,
						paint: () => {
							const a = alpha * w.a;
							ctx.beginPath();
							ctx.moveTo(q[0].x, q[0].y);
							for (let k = 1; k < 4; k++) ctx.lineTo(q[k].x, q[k].y);
							ctx.closePath();
							ctx.fillStyle = this.rgba('#07080D', 0.965 * a);
							ctx.fill();
							if (near) {
								// A glass sheen across the near walls, so the box reads as an
								// object with a surface and not a hole in the picture.
								const g = ctx.createLinearGradient(q[0].x, q[0].y, q[2].x, q[2].y);
								g.addColorStop(0, this.rgba(FG, 0));
								g.addColorStop(0.42, this.rgba(FG, 0.025 * a));
								g.addColorStop(0.5, this.rgba(FG, 0.07 * a));
								g.addColorStop(0.58, this.rgba(FG, 0.025 * a));
								g.addColorStop(1, this.rgba(FG, 0));
								ctx.fillStyle = g;
								ctx.fill();
							}
							ctx.strokeStyle = this.rgba(FG, (near ? 0.2 : 0.08) * a);
							ctx.lineWidth = 1;
							ctx.stroke();
							if (seam > 0.01) {
								ctx.strokeStyle = this.rgba(AMBER, 0.2 * seam * alpha);
								ctx.lineWidth = 6;
								ctx.stroke();
								ctx.strokeStyle = this.rgba(AMBER, 0.95 * seam * alpha);
								ctx.lineWidth = 1.4;
								ctx.stroke();
							}
						},
					});
				}
				// The inside lights up as the walls come away: the network was lit all along.
				const glow = ink ? box.glow * Math.sin(Math.PI * clamp(u / 0.8, 0, 1)) : 0;
				if (glow > 0.01) {
					const c = P(0, 0, 0);
					const rr = Math.abs(P(BX1, 0, 0).x - P(BX0, 0, 0).x) * 0.55;
					faces.push({
						z: 1e8,
						paint: () => {
							const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, rr);
							g.addColorStop(0, this.rgba(AMBER, 0.3 * glow * alpha));
							g.addColorStop(1, this.rgba(AMBER, 0));
							ctx.fillStyle = g;
							ctx.fillRect(c.x - rr, c.y - rr, rr * 2, rr * 2);
						},
					});
				}
			}

			// Far first. Canvas has no z-buffer, so this sort IS the depth.
			faces.sort((p, q) => q.z - p.z);
			for (const f of faces) f.paint();
		};

		/* ── the reflection ───────────────────────────────────────────────────── */
		const floorY = oy + by1 * scale + 16;
		if (floorY < cssH - 18) {
			ctx.save();
			ctx.beginPath();
			ctx.rect(0, floorY, cssW, cssH - floorY);
			ctx.clip();
			ctx.translate(0, floorY * 2);
			ctx.scale(1, -1);
			// The floor's reflection gives way while a stage is opened: under the chain it
			// read as a second, ghostly chain beneath the bracket.
			paintNet(0.28 * (1 - bA));
			ctx.restore();
			// Fade it out downward, into the panel's own ground.
			const plate = css.getPropertyValue('--plate').trim() || '#141625';
			const g = ctx.createLinearGradient(0, floorY, 0, cssH);
			g.addColorStop(0, this.rgba(plate, 0.05));
			g.addColorStop(0.62, this.rgba(plate, 0.8));
			g.addColorStop(1, this.rgba(plate, 1));
			ctx.fillStyle = g;
			ctx.fillRect(0, floorY, cssW, cssH - floorY);
		}

		paintNet(1);

		/* ── anchors, for the tour's leader lines ────────────────────────────────── */
		this.anchors.clear();
		for (const L of layers) {
			if (L.id === null) continue;
			let top = Infinity;
			let bot = -Infinity;
			let sx = 0;
			for (const un of L.units) {
				const p = P(un.x, un.y, un.z);
				top = Math.min(top, p.y);
				bot = Math.max(bot, p.y);
				sx += p.x;
			}
			const cx = sx / Math.max(1, L.units.length);
			this.anchors.set(`stage:${L.id}`, { x: cx, y: (top + bot) / 2 });
			this.anchors.set(`stage:${L.id}:top`, { x: cx, y: top });
			this.anchors.set(`stage:${L.id}:bottom`, { x: cx, y: bot });
		}
		pieces.forEach((pc, k) => {
			const p = P((pc.x0 + pc.x1) / 2, 0, 0);
			this.anchors.set(`piece:${k}`, { x: p.x, y: p.y });
		});
		if (sphere) {
			const p = P(sphere.x, 0, 0);
			this.anchors.set('loss', { x: p.x, y: p.y });
		}
		if (box) {
			const p = P(0, (BY0 + BY1) / 2, 0);
			this.anchors.set('box', { x: p.x, y: p.y });
		}

		/* ── labels ──────────────────────────────────────────────────────────────
		   Flat, on top, never projected. Type that follows the camera into
		   perspective is a showreel trick that costs legibility, and these carry
		   the parameter counts and the health figures. */
		ctx.textAlign = 'center';
		const say = (text: string, x: number, y: number) => {
			const half = ctx.measureText(text).width / 2;
			ctx.fillText(text, clamp(x, half + 4, cssW - half - 4), y);
		};

		/* ── THE RAILS ARE PACKED, NOT JUST CLAMPED ──────────────────────────────
		   say() keeps a label inside the canvas and says nothing about the label
		   beside it. That was fine while this drawing was 560px wide, which is what
		   MIN_W was for; in app mode it is whatever the pane is, and on a 390px
		   phone the pane is 356. Five labels on one rail at 356px is roughly 70px
		   each, and the readings are 60–115px. Measured on a phone, the top rail
		   printed "32×3296O params" — the input shape and the first stage's
		   parameter count struck through one another — and the bottom one printed
		   "health 0.32 · wnhealth 0.33".

		   Two mechanics fix it, and neither of them is a breakpoint.

		   sayPacked() takes a whole rail at once, in priority order, and refuses to
		   draw a label that would land on one already down. The three stage
		   readings go first because they are the measurement; the input and output
		   captions go second because they name the two ends of a diagram whose
		   shape is the one thing already obvious. So the endpoints are what a
		   narrow canvas loses, and it loses them silently rather than on top of a
		   number.

		   sayFit() is for a rail where nothing may be dropped — the health line is
		   per-stage telemetry and every stage has to report. It takes the reading
		   already split into its parts and, when the joined form does not fit the
		   width one stage may have, stacks the parts down the rail instead. The
		   third row lands at railBot + 22, which is cssH - 40: BOTTOM reserves 76
		   and the chain caption sits at cssH - 26, so there are 14px there and the
		   rail is 9px type. Nothing is abbreviated and nothing is dropped. */
		type Rail = { x: number; text: string; fill: string; font: string };
		const sayPacked = (items: Rail[], y: number) => {
			const placed: Array<{ l: number; r: number }> = [];
			for (const it of items) {
				ctx.font = it.font;
				const half = ctx.measureText(it.text).width / 2;
				const cx = clamp(it.x, half + 4, cssW - half - 4);
				const l = cx - half - 5;
				const r = cx + half + 5;
				if (placed.some((p) => l < p.r && r > p.l)) continue;
				placed.push({ l, r });
				ctx.fillStyle = it.fill;
				ctx.fillText(it.text, cx, y);
			}
		};
		/** Width one stage's reading may take before it has to stack. */
		const stageBudget = cssW / Math.max(1, this.stages.length) - 10;
		const sayFit = (parts: string[], x: number, y: number) => {
			const joined = parts.join(' · ');
			if (parts.length < 2 || ctx.measureText(joined).width <= stageBudget) {
				say(joined, x, y);
				return;
			}
			parts.forEach((p, k) => say(p, x, y + k * 11));
		};

		/* ON TWO FIXED RAILS, not hung off each layer's own silhouette.
		   Floating them relative to the units put every readout inside the web of
		   connections belonging to the next layer along — the layers overlap
		   horizontally, so "below this stage" is "on top of that one". Two rails,
		   top and bottom, in the bands the fit already reserved: the labels cannot
		   reach the scene, and a row of readings on a rail is what an instrument
		   looks like anyway. */
		const railTop = 13;
		const railBot = cssH - BOTTOM + 14;
		const BOLD10 = '700 10px ui-monospace, SFMono-Regular, Menlo, monospace';
		const REG9 = '400 9px ui-monospace, SFMono-Regular, Menlo, monospace';
		const inP = P(layers[0].x, 0, 0);
		const outP = P(outX, 0, 0);

		/* The ordinary readings give way while a stage is opened — the rails describe
		   the whole network, and for those seconds the drawing is about one part. */
		const railsA = (1 - smooth(clamp(bd / 0.3, 0, 1))) * (1 - closed);
		ctx.save();
		ctx.globalAlpha = railsA;

		/* The two top rails, stages before endpoints. */
		const shapeRail: Rail[] = [];
		const paramRail: Rail[] = [];
		for (const s of this.stages) {
			const cxs = P(s.x, 0, 0).x;
			shapeRail.push({ x: cxs, text: `${s.inDim}→${s.outDim}`, fill: FG, font: BOLD10 });
			paramRail.push({ x: cxs, text: `${fmt(s.params)} params`, fill: DIM, font: REG9 });
		}
		shapeRail.push({ x: inP.x, text: 'input', fill: DIM, font: REG9 });
		shapeRail.push({ x: outP.x, text: 'output', fill: DIM, font: REG9 });
		paramRail.push({ x: inP.x, text: '32×32×3', fill: DIM, font: REG9 });
		paramRail.push({ x: outP.x, text: '10 classes', fill: DIM, font: REG9 });
		sayPacked(shapeRail, railTop);
		sayPacked(paramRail, railTop + 11);

		/* The two bottom rails carry per-stage telemetry, so nothing here may be
		   dropped — a stage with no reading reads as a stage with no reading. */
		if (ink) {
			ctx.font = REG9;
			for (const s of this.stages) {
				const cxs = P(s.x, 0, 0).x;
				const n = node(s.id);
				const destroyed = (n?.weight_norm ?? null) === 0;

				ctx.fillStyle = destroyed ? WARN : AMBER;
				say(destroyed ? 'destroyed' : (n?.state ?? '—'), cxs, railBot);
				ctx.fillStyle = DIM;
				sayFit(
					destroyed
						? ['weight norm 0.00']
						: [
								`health ${clamp(n?.goodness ?? 0, 0, 1).toFixed(2)}`,
								`wn ${(n?.weight_norm ?? 0).toFixed(2)}`,
							],
					cxs,
					railBot + 11,
				);
			}
		}

		ctx.textAlign = 'left';
		const fits = (text: string) => ctx.measureText(text).width <= cssW - 28;
		const pick = (full: string, short: string) => (fits(full) ? full : short);
		if (ink) {
			ctx.fillStyle = AMBER;
			ctx.fillText(
				pick(
					'one shared bottleneck · 4,416 shared weights · the chain cannot grow with the network',
					'bounded chain · 4,416 shared weights',
				),
				14,
				cssH - 26,
			);
		} else {
			ctx.fillStyle = DIM;
			ctx.fillText(
				pick('no bounded chain — no per-component quantity is computed here', 'no bounded chain'),
				14,
				cssH - 26,
			);
		}
		ctx.fillStyle = this.rgba(DIM, 0.72);
		ctx.font = '400 8.5px ui-monospace, SFMono-Regular, Menlo, monospace';
		ctx.fillText(
			pick(
				'Each layer draws a square sample of its units; the channel count above it is the real one.',
				'a sample of units; the count above is real.',
			),
			14,
			cssH - 11,
		);
		ctx.restore();

		/* ── the opened chain's labels ───────────────────────────────────────────
		   Names above each piece, the parameter count under it, and one bracket in
		   the bottom band — the band the stage rails have just vacated — adding them
		   up. The four counts are the real layer sizes and they sum to the 4,715 on
		   the bracket, so a reader can check the total against its parts. */
		if (selLayer && selId !== null && bC > 0.01) {
			ctx.save();
			ctx.globalAlpha = bC;
			ctx.textAlign = 'center';
			const yTop = (x: number, h: number) => Math.min(P(x, -h, -h).y, P(x, -h, h).y);
			const yBot = (x: number, h: number) => Math.max(P(x, h, -h).y, P(x, h, h).y);

			const names: Rail[] = [];
			const shapes: Rail[] = [];
			let lo = Infinity;
			for (const pc of pieces) {
				const cx = P((pc.x0 + pc.x1) / 2, 0, 0).x;
				const top = Math.min(yTop(pc.x0, pc.h0), yTop(pc.x1, pc.h1));
				const bot = Math.max(yBot(pc.x0, pc.h0), yBot(pc.x1, pc.h1));
				lo = Math.min(lo, top);
				names.push({ x: cx, text: pc.name, fill: FG, font: BOLD10 });
				shapes.push({ x: cx, text: pc.shape, fill: DIM, font: REG9 });
				// Each piece's count sits just under that piece, not on a shared rail:
				// the blocks differ in height by a factor of five and a shared rail
				// would leave the small ones' numbers floating far below them.
				ctx.font = REG9;
				ctx.fillStyle = AMBER;
				say(fmt(pc.params), cx, bot + 12);
			}
			const sphereX = sphere ? P(sphere.x, 0, 0).x : null;
			if (sphereX !== null) {
				const g = clamp(node(selId)?.goodness ?? 0, 0, 1);
				names.push({ x: sphereX, text: 'local loss', fill: FG, font: BOLD10 });
				shapes.push({ x: sphereX, text: `health ${g.toFixed(2)}`, fill: AMBER, font: REG9 });
			}
			// One shared baseline for the names, above the tallest piece, so the row
			// reads as a row; packed so two can never print through one another.
			const nameY = Math.max(railTop + 10, lo - 18);
			sayPacked(names, nameY);
			sayPacked(shapes, nameY + 11);

			// The opened stage names itself underneath, where nothing else is.
			const st = this.stages.find((s) => s.id === selId);
			if (st) {
				let sb = -Infinity;
				for (const u of selLayer.units) sb = Math.max(sb, P(u.x, u.y, u.z).y);
				ctx.font = BOLD10;
				ctx.fillStyle = AMBER;
				say(`stage ${st.id}`, P(selLayer.x, 0, 0).x, sb + 14);
				ctx.font = REG9;
				ctx.fillStyle = DIM;
				say(`${st.inDim}→${st.outDim}`, P(selLayer.x, 0, 0).x, sb + 25);
			}

			// The bracket, and the sum.
			if (pieces.length) {
				const a = P(pieces[0].x0, 0, 0).x;
				const b = P(pieces[pieces.length - 1].x1, 0, 0).x;
				const by = railBot + 4;
				ctx.strokeStyle = this.rgba(AMBER, 0.7);
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(a, by - 5);
				ctx.lineTo(a, by);
				ctx.lineTo(b, by);
				ctx.lineTo(b, by - 5);
				ctx.stroke();
				const total = pieces.reduce((s, pc) => s + pc.params, 0);
				ctx.font = BOLD10;
				ctx.fillStyle = AMBER;
				say(`= ${fmt(total)} parameters · 4,416 of them shared weights`, (a + b) / 2, by + 14);
				ctx.font = REG9;
				ctx.fillStyle = DIM;
				say('four operations for every stage · the chain cannot grow with the network', (a + b) / 2, by + 26);
			}
			ctx.textAlign = 'left';
			ctx.font = REG9;
			ctx.fillStyle = DIM;
			ctx.fillText(`stage ${selId} opened · its bounded chain`, 14, railTop);
			ctx.restore();
		}
	}

	/** #rrggbb → rgba(). The tokens resolve to hex; canvas needs the alpha split out. */
	private rgba(hex: string, a: number): string {
		const h = hex.replace('#', '').trim();
		if (h.length !== 6) return hex;
		const r = parseInt(h.slice(0, 2), 16);
		const g = parseInt(h.slice(2, 4), 16);
		const b = parseInt(h.slice(4, 6), 16);
		return `rgba(${r},${g},${b},${a})`;
	}
}
