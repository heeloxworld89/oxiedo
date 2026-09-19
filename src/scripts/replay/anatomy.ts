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

/* A stage of 128 channels cannot be drawn as 128 cards without becoming a grey
   smear, so the stack is capped and the TRUE count is printed beside it. The
   cards within a stage are deliberately uniform: the telemetry resolves to the
   stage, not to the individual channel, and varying them would invent data the
   archive does not contain. */
const UNIT_CAP = 11;

const fmt = (n: number) => n.toLocaleString('en-GB');
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

interface Stage {
	id: number;
	inDim: number;
	outDim: number;
	params: number;
	/** Cards actually drawn. Capped — see UNIT_CAP. */
	cards: number;
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

		this.raf = requestAnimationFrame(this.tick);
	}

	private size(): void {
		const w = Math.round(this.mount.getBoundingClientRect().width);
		if (!w) return;
		this.dpr = Math.min(window.devicePixelRatio || 1, 2);
		const cssH = parseFloat(getComputedStyle(this.cv).height) || this.H;
		this.cv.width = Math.round(w * this.dpr);
		this.cv.height = Math.round(cssH * this.dpr);
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
				cards: Math.min(UNIT_CAP, out),
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
	}

	update(frame: HealthFrame | null, strikeNodes: Set<number>, running: boolean): void {
		this.frame = frame;
		this.strikeNodes = strikeNodes;
		this.running = running;
	}

	destroy(): void {
		this.dead = true;
		cancelAnimationFrame(this.raf);
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

	private tick = (now: number): void => {
		if (this.dead) return;
		this.raf = requestAnimationFrame(this.tick);
		try {
			this.draw(now - this.born);
		} catch (err) {
			// A throw here would kill the loop and freeze the picture with no clue
			// as to why. The console below is fully functional without this.
			console.error('[anatomy] frame failed', err);
			cancelAnimationFrame(this.raf);
		}
	};

	private draw(t: number): void {
		const ctx = this.ctx;
		const cssW = this.cv.width / this.dpr;
		const cssH = this.cv.height / this.dpr;
		ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
		ctx.clearRect(0, 0, cssW, cssH);
		if (!this.stages.length) return;

		/* A slow drift so the object is never quite still, plus the pointer, eased.
		   Under reduced motion both are zero and the camera holds a fixed
		   three-quarter view — the depth is still there, because depth is geometry
		   and not movement. */
		const drift = this.opts.reduced ? 0 : Math.sin(t / 5200) * 0.055;
		this.curYaw += (this.aimYaw - this.curYaw) * 0.06;
		this.curPitch += (this.aimPitch - this.curPitch) * 0.06;
		const yaw = -0.42 + drift + this.curYaw;
		const pitch = 0.20 + this.curPitch;

		const ink = this.opts.instrumented;
		/** Spacing between cards in a stack, in world units. Declared here because
		 *  the fit below measures the silhouette and needs it. */
		const CARD_GAP = 5.2;

		/* ── FIT THE SCENE TO THE BOX IT HAS ─────────────────────────────────────
		   Scale was cssW/600 and the vertical origin a fraction of the height, both
		   guessed. Measured, that clipped: at 1024×768 the short-viewport rule takes
		   the canvas to 240px and the ORMAS readout ran off the bottom, and at 390px
		   the network overran both sides at once.

		   So the bounding box is computed from the geometry itself, at the CURRENT
		   camera — the silhouette changes as the thing turns, and a fit that ignores
		   that clips as soon as it moves. The label bands are reserved first, because
		   type is the part that cannot be allowed to fall off. */
		const PAD_X = 14;
		const TOP = 30;                       // shape name + parameter count
		const BOTTOM = ink ? 62 : 34;         // state + health, then the captions
		const raw = (x: number, y: number, z: number) => this.project(x, y, z, yaw, pitch);

		let bx0 = Infinity;
		let bx1 = -Infinity;
		let by0 = Infinity;
		let by1 = -Infinity;
		for (const st of this.stages) {
			const sw = (st.cards - 1) * CARD_GAP;
			for (const cx2 of [-sw / 2, sw / 2]) {
				for (const cy3 of [-st.half, st.half]) {
					for (const cz of [-st.half, st.half]) {
						const q = raw(st.x + cx2, cy3, cz);
						if (q.x < bx0) bx0 = q.x;
						if (q.x > bx1) bx1 = q.x;
						if (q.y < by0) by0 = q.y;
						if (q.y > by1) by1 = q.y;
					}
				}
			}
		}
		// The input and output captions sit outside the geometry and still have to fit.
		const endL = raw(this.stages[0].x - 150, 0, 0);
		const endR = raw(this.stages[this.stages.length - 1].x + 150, 0, 0);
		bx0 = Math.min(bx0, endL.x - 34);
		bx1 = Math.max(bx1, endR.x + 34);

		const availW = Math.max(40, cssW - PAD_X * 2);
		const availH = Math.max(40, cssH - TOP - BOTTOM);
		const scale = clamp(
			Math.min(availW / Math.max(1, bx1 - bx0), availH / Math.max(1, by1 - by0)),
			0.28,
			1.45,
		);
		const ox = cssW / 2 - ((bx0 + bx1) / 2) * scale;
		const oy = TOP + availH / 2 - ((by0 + by1) / 2) * scale;
		const P = (x: number, y: number, z: number): P2 => {
			const p = this.project(x, y, z, yaw, pitch);
			return { x: ox + p.x * scale, y: oy + p.y * scale, d: p.d, z: p.z };
		};

		const css = getComputedStyle(this.cv);
		const AMBER = css.getPropertyValue('--ormas').trim() || '#E0A233';
		const SLATE = css.getPropertyValue('--base').trim() || '#7FA3DC';
		const WARN = css.getPropertyValue('--warn').trim() || '#E0645F';
		const FG = css.getPropertyValue('--fg').trim() || '#F1EFE8';
		const DIM = css.getPropertyValue('--fg-dim').trim() || '#828AA8';

		const node = (id: number) => this.frame?.nodes.find((n) => n.id === id) ?? null;



		/* ── build every face, then sort by depth ────────────────────────────────
		   A painter's algorithm, because with five stacks at an angle the far cards
		   genuinely pass behind the near ones and drawing in array order puts them
		   in front. This is the whole reason the picture reads as solid. */
		type Face = { z: number; paint: () => void };
		const faces: Face[] = [];

		for (const s of this.stages) {
			const n = ink ? node(s.id) : null;
			const wn = n?.weight_norm ?? null;
			const destroyed = ink && wn === 0;
			const health = clamp(n?.goodness ?? 0, 0, 1);
			const struck = this.strikeNodes.has(s.id);

			const stackW = (s.cards - 1) * CARD_GAP;
			for (let k = 0; k < s.cards; k++) {
				const x = s.x - stackW / 2 + k * CARD_GAP;
				const h = s.half;
				// A card is a square facing along the flow axis: it spans y and z, and
				// the stack marches along x. That is a feature map, drawn as one.
				const a = P(x, -h, -h);
				const b = P(x, -h, h);
				const c = P(x, h, h);
				const d = P(x, h, -h);
				const depth = (a.z + b.z + c.z + d.z) / 4;
				const fade = clamp(0.35 + a.d * 0.9, 0.25, 1);

				faces.push({
					z: depth,
					paint: () => {
						ctx.beginPath();
						ctx.moveTo(a.x, a.y);
						ctx.lineTo(b.x, b.y);
						ctx.lineTo(c.x, c.y);
						ctx.lineTo(d.x, d.y);
						ctx.closePath();

						if (destroyed) {
							ctx.fillStyle = this.rgba(WARN, 0.1 * fade);
							ctx.strokeStyle = this.rgba(WARN, 0.5 * fade);
						} else if (ink) {
							// The fill IS the health figure. A stage at 0.6 is visibly
							// more lit than a stage at 0.1, which is the reading the
							// readout underneath states in numbers.
							ctx.fillStyle = this.rgba(AMBER, (0.05 + health * 0.42) * fade);
							ctx.strokeStyle = this.rgba(AMBER, (0.3 + health * 0.45) * fade);
						} else {
							// Sealed: the same card, with nothing written on it.
							ctx.fillStyle = this.rgba(SLATE, 0.045 * fade);
							ctx.strokeStyle = this.rgba(SLATE, 0.34 * fade);
						}
						ctx.lineWidth = 1;
						ctx.fill();
						ctx.stroke();

						if (struck && !destroyed) {
							ctx.strokeStyle = this.rgba(AMBER, 0.9 * fade);
							ctx.lineWidth = 1.6;
							ctx.stroke();
						}
					},
				});
			}
		}

		/* ── the flow between stacks ─────────────────────────────────────────────
		   Sampled, not exhaustive: a line from every card to every card is 121 per
		   gap and renders as a solid wedge. Four per gap, corner to corner, reads
		   as connection without pretending to enumerate it. */
		for (let i = 0; i < this.stages.length - 1; i++) {
			const s = this.stages[i];
			const nx = this.stages[i + 1];
			const aEdge = s.x + ((s.cards - 1) * CARD_GAP) / 2;
			const bEdge = nx.x - ((nx.cards - 1) * CARD_GAP) / 2;
			const gone = ink && (node(s.id)?.weight_norm === 0 || node(nx.id)?.weight_norm === 0);
			const corners: Array<[number, number]> = [[-1, -1], [-1, 1], [1, 1], [1, -1]];
			for (const [cy2, cz] of corners) {
				const a = P(aEdge, cy2 * s.half, cz * s.half);
				const b = P(bEdge, cy2 * nx.half, cz * nx.half);
				const depth = (a.z + b.z) / 2;
				faces.push({
					z: depth,
					paint: () => {
						ctx.strokeStyle = this.rgba(gone ? WARN : ink ? AMBER : SLATE, gone ? 0.09 : 0.2);
						ctx.lineWidth = 1;
						ctx.beginPath();
						ctx.moveTo(a.x, a.y);
						ctx.lineTo(b.x, b.y);
						ctx.stroke();
					},
				});
			}

			/* The signal, travelling. One packet per gap, staggered, and only while
			   the run is playing — a still frame of a paused run should look paused. */
			if (this.running && !this.opts.reduced && !gone) {
				const ph = ((t / 1500 + i * 0.16) % 1);
				const a = P(aEdge, 0, 0);
				const b = P(bEdge, 0, 0);
				const px = a.x + (b.x - a.x) * ph;
				const py = a.y + (b.y - a.y) * ph;
				faces.push({
					z: (a.z + b.z) / 2 - 1,
					paint: () => {
						ctx.fillStyle = this.rgba(ink ? AMBER : FG, 0.85);
						ctx.beginPath();
						ctx.arc(px, py, 2.4, 0, Math.PI * 2);
						ctx.fill();
					},
				});
			}
		}

		// Far first. Canvas has no z-buffer, so this sort is the depth.
		faces.sort((p, q) => q.z - p.z);
		for (const f of faces) f.paint();

		/* ── labels ──────────────────────────────────────────────────────────────
		   Flat, on top, never projected. Type that follows the camera into
		   perspective is a showreel trick that costs legibility, and these carry
		   the parameter counts and the health figures — the numbers the whole
		   screen exists to report. */
		ctx.textAlign = 'center';
		/* Centred text runs half its width either side of its anchor, and the fit
		   above measures geometry, not glyphs. At 390px that put "74,112 params"
		   over the right edge while the geometry itself was comfortably inside.
		   Clamp the anchor so the label stays in the box whatever the camera does. */
		const say = (text: string, x: number, y: number) => {
			const half = ctx.measureText(text).width / 2;
			ctx.fillText(text, clamp(x, half + 4, cssW - half - 4), y);
		};

		for (const s of this.stages) {
			/* Anchored to the stack's highest and lowest projected corners, not to its
			   centre plane. The stack has width along the flow axis and the camera is
			   yawed, so its silhouette reaches well above and below the centre — with
			   the centre as the anchor the parameter count printed straight across the
			   top of the last stage. */
			const sw = (s.cards - 1) * CARD_GAP;
			const corners: P2[] = [];
			for (const cx2 of [-sw / 2, sw / 2]) {
				for (const cz of [-s.half, s.half]) {
					corners.push(P(s.x + cx2, -s.half, cz));
					corners.push(P(s.x + cx2, s.half, cz));
				}
			}
			const top = { x: P(s.x, -s.half, 0).x, y: Math.min(...corners.map((c) => c.y)) };
			const bot = { x: P(s.x, s.half, 0).x, y: Math.max(...corners.map((c) => c.y)) };
			const n = ink ? node(s.id) : null;
			const destroyed = ink && (n?.weight_norm ?? null) === 0;

			ctx.fillStyle = FG;
			ctx.font = '700 10px ui-monospace, SFMono-Regular, Menlo, monospace';
			say(`${s.inDim}→${s.outDim}`, top.x, top.y - 16);
			ctx.fillStyle = DIM;
			ctx.font = '400 9px ui-monospace, SFMono-Regular, Menlo, monospace';
			say(`${fmt(s.params)} params`, top.x, top.y - 5);

			if (ink) {
				ctx.font = '400 9px ui-monospace, SFMono-Regular, Menlo, monospace';
				ctx.fillStyle = destroyed ? WARN : AMBER;
				say(destroyed ? 'destroyed' : (n?.state ?? '—'), bot.x, bot.y + 16);
				ctx.fillStyle = DIM;
				say(
					destroyed
						? 'weight norm 0.00'
						: `health ${clamp(n?.goodness ?? 0, 0, 1).toFixed(2)} · wn ${(n?.weight_norm ?? 0).toFixed(2)}`,
					bot.x,
					bot.y + 27,
				);
			}
		}

		// Input and output, named at the ends of the flow.
		const first = this.stages[0];
		const last = this.stages[this.stages.length - 1];
		const inP = P(first.x - 150, 0, 0);
		const outP = P(last.x + 150, 0, 0);
		ctx.font = '400 9px ui-monospace, SFMono-Regular, Menlo, monospace';
		ctx.fillStyle = DIM;
		say('input', inP.x, inP.y - 4);
		say('32×32×3', inP.x, inP.y + 8);
		say('output', outP.x, outP.y - 4);
		say('10 classes', outP.x, outP.y + 8);

		/* ── what each arm has, and has not ──────────────────────────────────── */
		/* TWO LINES, TWO BASELINES. Both of these were written at cssH - 10, one
		   left-aligned and one centred, so on every panel wider than the shorter of
		   them they printed straight through each other. Canvas will not complain
		   about that the way a layout engine would — it just draws both. */
		ctx.textAlign = 'left';
		ctx.font = '400 9px ui-monospace, SFMono-Regular, Menlo, monospace';
		/* THE CAPTION HAS A SHORT FORM, and it needs one. At 390px the canvas is
		   ~358px wide and the full chain caption measures about 470px of mono, so it
		   ran straight off the right edge — the last clipping this had, and it was
		   type rather than geometry both times. Measured and swapped, not truncated:
		   an ellipsis in the middle of "the chain cannot grow with the network"
		   destroys the only claim the line exists to make. */
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
				`Each stack draws ${UNIT_CAP} cards; the channel count above it is the real one.`,
				`${UNIT_CAP} cards drawn; the count above is real.`,
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
