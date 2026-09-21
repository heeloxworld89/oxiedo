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
				const r = this.cv.getBoundingClientRect();
				this.aimYaw = clamp((e.clientX - (r.left + r.width / 2)) / r.width, -0.5, 0.5) * 0.5;
				this.aimPitch = clamp((e.clientY - (r.top + r.height / 2)) / r.height, -0.5, 0.5) * 0.22;
			};
			this.onLeave = () => { this.aimYaw = 0; this.aimPitch = 0; };
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
		if (this.dead || this.pending || this.suspended) return;
		this.pending = true;
		this.raf = requestAnimationFrame(this.tick);
	}

	private size(): void {
		const w = Math.round(this.mount.getBoundingClientRect().width);
		if (!w) return;
		this.dpr = Math.min(window.devicePixelRatio || 1, 2);
		const cssH = parseFloat(getComputedStyle(this.cv).height) || this.H;
		this.cv.width = Math.round(w * this.dpr);
		this.cv.height = Math.round(cssH * this.dpr);
		// Setting either dimension clears the canvas, so a resize always owes a
		// repaint — and under reduced motion no loop is coming to supply one.
		this.schedule();
	}

	load(bundle: Bundle): void {
		this.bundle = bundle;
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
		this.curYaw += (this.aimYaw - this.curYaw) * 0.06;
		this.curPitch += (this.aimPitch - this.curPitch) * 0.06;
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
		for (const L of layers) {
			for (const u of L.units) {
				const q = raw(u.x, u.y, u.z);
				if (q.x < bx0) bx0 = q.x;
				if (q.x > bx1) bx1 = q.x;
				if (q.y < by0) by0 = q.y;
				if (q.y > by1) by1 = q.y;
			}
		}
		/* The reflection is the first thing to go when the panel is short. In app mode
		   the canvas is 240px and the label rails already claim 102 of them; spending
		   another sixth on a mirror image would leave the network smaller than the
		   type describing it. */
		const REFLECT = cssH >= 300 ? 0.16 : 0;
		const availW = Math.max(40, cssW - PAD_X * 2);
		const availH = Math.max(40, (cssH - TOP - BOTTOM) / (1 + REFLECT));
		const scale = clamp(
			Math.min(availW / Math.max(1, bx1 - bx0), availH / Math.max(1, by1 - by0)),
			0.28,
			2.1,
		);
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
			for (let i = 0; i < layers.length - 1; i++) {
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
								ctx.strokeStyle = this.rgba(hue, (gone ? 0.05 : 0.13) * alpha);
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
								ctx.fillStyle = this.rgba(ink ? AMBER : FG, 0.28 * alpha);
								ctx.beginPath();
								ctx.arc(px, py, 4.5, 0, Math.PI * 2);
								ctx.fill();
								ctx.fillStyle = this.rgba(ink ? AMBER : FG, 0.95 * alpha);
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
							ctx.fillStyle = this.rgba(hue, 0.14 * lit * alpha);
							ctx.beginPath();
							ctx.arc(p.x, p.y, r * 2.8, 0, Math.PI * 2);
							ctx.fill();
							ctx.fillStyle = this.rgba(hue, (0.5 + lit * 0.5) * alpha);
							ctx.beginPath();
							ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
							ctx.fill();
							if (struck && !destroyed) {
								ctx.strokeStyle = this.rgba(AMBER, 0.8 * alpha);
								ctx.lineWidth = 1.2;
								ctx.beginPath();
								ctx.arc(p.x, p.y, r * 2.2, 0, Math.PI * 2);
								ctx.stroke();
							}
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
			paintNet(0.28);
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
					'one shared bottleneck · 4,715 parameters · the chain cannot grow with the network',
					'bounded chain · 4,715 parameters',
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
