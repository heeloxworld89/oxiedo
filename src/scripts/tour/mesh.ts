// THE BRIDGE — a neural network, training, between the clips and the console.
//
// The three speakers have just warned about AI. What sits under every one of those systems
// is this: a deep, densely meshed neural network, trained one small adjustment at a time.
// While the narrator says so, the screen shows it happening — a forward pass sweeping the
// signal left to right in amber, a backward pass sweeping the correction right to left in
// blue, and in the wake of each backward pass every connection's weight shifting a little,
// brighter or dimmer. Training speeds up as the line goes on, the camera pushes into the
// mesh on "billions of connections", and on "nobody" a black box slams shut over all of it.
//
// It is an illustration of how training works, and it says nothing it cannot: no numbers,
// no loss curve, no claimed scale — only the shape of the process. The one box the tour then
// opens is a real one, on a real run.
//
// Canvas 2D, like the console's own drawings: a pseudo-3D projection of layers of units laid
// out in grids, edges batched by brightness so a few thousand of them cost a handful of
// strokes a frame.

import type { Clock } from './clock';

interface Unit { x: number; y: number; z: number; act: number }
interface Edge { a: Unit; b: Unit; w: number; target: number; gap: number }

const AMBER = '224,162,51';
const BLUE = '127,163,220';
const CREAM = '241,239,232';

/** A small seeded generator, so the network is the same network every time. */
function rng(seed: number): () => number {
	let s = seed >>> 0;
	return () => {
		s = (s + 0x6d2b79f5) >>> 0;
		let t = s;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export class TrainingMesh {
	private readonly ctx: CanvasRenderingContext2D | null;
	private layers: Unit[][] = [];
	private edges: Edge[] = [];
	private stop: (() => void) | null = null;
	private born = 0;
	private W = 0;
	private H = 0;
	private dpr = 1;
	/** 0..1 levers the script pulls on the narrator's words. */
	private tempo = 0.35;
	private push = 0;
	private flare = 0;
	private box = -1;          // clock time the box started to shut; -1 while open
	private readonly BOX_MS = 900;
	private lastBackward = -1;
	/** Training phase, accumulated — so speeding up never makes the wavefront jump. */
	private phase = 0;
	private lastT = 0;

	constructor(private readonly clock: Clock, private readonly cv: HTMLCanvasElement) {
		this.ctx = cv.getContext('2d');
		this.build();
	}

	/** Twelve layers: a narrow input, nine wide hidden layers of 7×7 units, a narrowing
	 *  pair and a small output — about five thousand connections. Each unit reaches its
	 *  nearest eight in the next layer and two further off: dense enough to read as a mesh,
	 *  sparse enough to still read as structure. */
	private build(): void {
		const rand = rng(11);
		const shape: Array<[number, number]> = [[3, 4], [6, 6], [7, 7], [7, 7], [7, 7], [7, 7], [7, 7], [7, 7], [7, 7], [6, 6], [5, 5], [2, 5]];
		const span = 1250;
		const step = span / (shape.length - 1);
		this.layers = shape.map(([gy, gz], i) => {
			const units: Unit[] = [];
			const sy = 46;
			const sz = 46;
			for (let a = 0; a < gy; a++) {
				for (let b = 0; b < gz; b++) {
					units.push({
						x: -span / 2 + i * step,
						y: (a - (gy - 1) / 2) * sy + (rand() - 0.5) * 6,
						z: (b - (gz - 1) / 2) * sz + (rand() - 0.5) * 6,
						act: 0,
					});
				}
			}
			return units;
		});
		this.edges = [];
		for (let g = 0; g < this.layers.length - 1; g++) {
			const A = this.layers[g];
			const B = this.layers[g + 1];
			for (const a of A) {
				const near = [...B].sort((p, q) => (p.y - a.y) ** 2 + (p.z - a.z) ** 2 - ((q.y - a.y) ** 2 + (q.z - a.z) ** 2));
				const picks = [...near.slice(0, 8), near[8 + Math.floor(rand() * (near.length - 8))], near[Math.floor(rand() * near.length)]];
				for (const b of picks) {
					if (!b) continue;
					const w = 0.15 + rand() * 0.85;
					this.edges.push({ a, b, w, target: w, gap: g });
				}
			}
		}
	}

	private size(): void {
		this.dpr = Math.min(2, window.devicePixelRatio || 1);
		this.W = window.innerWidth;
		this.H = window.innerHeight;
		this.cv.width = Math.round(this.W * this.dpr);
		this.cv.height = Math.round(this.H * this.dpr);
	}

	start(): void {
		this.size();
		this.born = this.clock.t;
		this.lastT = this.clock.t;
		this.phase = 0;
		this.lastBackward = -1;
		this.box = -1;
		this.tempo = 0.35;
		this.push = 0;
		this.flare = 0;
		this.cv.hidden = false;
		this.cv.classList.remove('is-out');
		requestAnimationFrame(() => this.cv.classList.add('is-on'));
		this.stop = this.clock.every((t) => this.draw(t));
	}

	/** Levers for the script: how fast it trains, how far the camera has pushed in, and a
	 *  flare on the weight updates. Each eases to its new value over `ms`. */
	set(k: 'tempo' | 'push' | 'flare', to: number, ms = 900): void {
		const from = this[k];
		void this.clock.tween(ms, (p) => { this[k] = from + (to - from) * p; }).catch(() => {});
	}

	/** The black box shuts over the network. */
	shut(): void {
		this.box = this.clock.t;
	}

	async fadeOut(ms: number): Promise<void> {
		this.cv.style.transition = `opacity ${Math.round(ms / Math.max(1, this.clock.speed))}ms ease`;
		this.cv.classList.add('is-out');
		await this.clock.wait(ms);
		this.clear();
	}

	clear(): void {
		this.stop?.();
		this.stop = null;
		this.cv.classList.remove('is-on', 'is-out');
		this.cv.style.transition = '';
		this.cv.hidden = true;
		this.ctx?.clearRect(0, 0, this.cv.width, this.cv.height);
	}

	private draw(t: number): void {
		const ctx = this.ctx;
		if (!ctx) return;
		const W = this.W;
		const H = this.H;
		const life = (t - this.born) / 1000;
		ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
		ctx.clearRect(0, 0, W, H);

		// ── the camera: a slow turn, pushing in on "billions of connections" ─────
		const yaw = -0.58 + 0.2 * Math.min(1, life / 11) + 0.04 * Math.sin(life * 0.6);
		const pitch = 0.3 + 0.04 * Math.sin(life * 0.45);
		const zoom = (Math.min(W / 1180, H / 600)) * (1 + 0.2 * this.push);
		const cy = Math.cos(yaw);
		const sy = Math.sin(yaw);
		const cp = Math.cos(pitch);
		const sp = Math.sin(pitch);
		const F = 1100;
		const P = (u: Unit) => {
			const x1 = u.x * cy - u.z * sy;
			const z1 = u.x * sy + u.z * cy;
			const y1 = u.y * cp - z1 * sp;
			const z2 = u.y * sp + z1 * cp;
			const d = F / (F + z2 + 380);
			return { x: W / 2 + x1 * d * zoom, y: H * 0.43 + y1 * d * zoom, d };
		};
		// Drawn in from the left as it appears, like the first moment of a run.
		const reveal = Math.min(1, life / 1.1);
		// As the box shuts, whatever of the network lies outside it goes dark with it.
		const shutK = this.box >= 0 ? Math.min(1, (t - this.box) / this.BOX_MS) : 0;
		ctx.globalAlpha = 1 - 0.92 * shutK;
		const lastLayer = reveal * (this.layers.length - 1);

		// ── the passes ────────────────────────────────────────────────────────────
		// One cycle is a forward sweep then a backward sweep. It speeds up with `tempo`:
		// training, faster and faster, as the narrator describes it.
		const cycle = 2.6 - 1.7 * this.tempo;
		this.phase += Math.max(0, t - this.lastT) / 1000 / cycle;
		this.lastT = t;
		const ph = this.phase % 1;
		const forward = ph < 0.5;
		const f = forward ? ph / 0.5 : (ph - 0.5) / 0.5;
		const nL = this.layers.length - 1;
		const front = forward ? f * nL : (1 - f) * nL;   // position of the wavefront, in layers
		const cycleNo = Math.floor(this.phase);
		// Each backward pass nudges every weight towards a new target: the adjustment.
		if (!forward && cycleNo !== this.lastBackward) {
			this.lastBackward = cycleNo;
			const rand = rng(1000 + cycleNo);
			for (const e of this.edges) e.target = Math.min(1, Math.max(0.1, e.w + (rand() - 0.5) * 0.5));
		}

		// ── edges, batched by brightness ─────────────────────────────────────────
		const BUCKETS = 10;
		const base: number[][] = Array.from({ length: BUCKETS }, () => []);
		const hotF: number[][] = Array.from({ length: BUCKETS }, () => []);
		const hotB: number[][] = Array.from({ length: BUCKETS }, () => []);
		const pts = new Map<Unit, { x: number; y: number; d: number }>();
		for (const L of this.layers) for (const u of L) pts.set(u, P(u));
		for (const e of this.edges) {
			if (e.gap + 1 > lastLayer + 0.001) continue;
			// Weights move towards their new values behind the backward front.
			const behind = !forward && e.gap + 0.5 >= front;
			if (behind) e.w += (e.target - e.w) * 0.08;
			const mid = e.gap + 0.5;
			const near = Math.max(0, 1 - Math.abs(mid - front) / 0.9);
			const a = pts.get(e.a)!;
			const b = pts.get(e.b)!;
			const bi = Math.min(BUCKETS - 1, Math.floor(e.w * BUCKETS));
			base[bi].push(a.x, a.y, b.x, b.y);
			if (near > 0.05) {
				const hi = Math.min(BUCKETS - 1, Math.floor(near * e.w * BUCKETS));
				(forward ? hotF : hotB)[hi].push(a.x, a.y, b.x, b.y);
			}
		}
		const stroke = (lines: number[][], rgb: string, alpha: (k: number) => number, width: number) => {
			ctx.lineWidth = width;
			lines.forEach((L, k) => {
				if (!L.length) return;
				ctx.strokeStyle = `rgba(${rgb},${alpha(k).toFixed(3)})`;
				ctx.beginPath();
				for (let i = 0; i < L.length; i += 4) {
					ctx.moveTo(L[i], L[i + 1]);
					ctx.lineTo(L[i + 2], L[i + 3]);
				}
				ctx.stroke();
			});
		};
		// The mesh itself: every connection, as bright as its weight.
		stroke(base, CREAM, (k) => (0.025 + 0.075 * (k / BUCKETS)) * (1 + 0.8 * this.flare * (forward ? 0 : 1)), 0.7);
		// The forward pass lights the signal's path; the backward pass lights the correction.
		stroke(hotF, AMBER, (k) => 0.12 + 0.6 * (k / BUCKETS), 1.1);
		stroke(hotB, BLUE, (k) => (0.12 + 0.55 * (k / BUCKETS)) * (1 + 0.5 * this.flare), 1.1);

		// ── units ────────────────────────────────────────────────────────────────
		this.layers.forEach((L, i) => {
			if (i > lastLayer + 0.001) return;
			const hit = Math.max(0, 1 - Math.abs(i - front) / 0.7);
			for (const u of L) {
				u.act = Math.max(u.act * 0.93, forward ? hit : 0);
				const p = pts.get(u)!;
				const r = (1.5 + 1.6 * u.act) * (0.6 + p.d * 0.7);
				if (u.act > 0.05) {
					ctx.fillStyle = `rgba(${AMBER},${(0.18 * u.act).toFixed(3)})`;
					ctx.beginPath();
					ctx.arc(p.x, p.y, r * 3.2, 0, Math.PI * 2);
					ctx.fill();
				}
				ctx.fillStyle = u.act > 0.05
					? `rgba(${AMBER},${(0.45 + 0.55 * u.act).toFixed(3)})`
					: `rgba(${BLUE},${(0.35 + 0.3 * p.d).toFixed(3)})`;
				ctx.beginPath();
				ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
				ctx.fill();
			}
		});

		// ── the two passes, named where they are ─────────────────────────────────
		if (reveal >= 1 && this.box < 0) {
			const col = this.layers[Math.round(front)];
			if (col) {
				let top = Infinity;
				let sx = 0;
				for (const u of col) { const p = pts.get(u)!; top = Math.min(top, p.y); sx += p.x; }
				ctx.font = '600 10.5px ui-monospace, SFMono-Regular, Menlo, monospace';
				ctx.textAlign = 'center';
				ctx.fillStyle = forward ? `rgba(${AMBER},0.75)` : `rgba(${BLUE},0.8)`;
				ctx.fillText(forward ? 'FORWARD PASS  →' : '←  BACKWARD PASS · WEIGHTS ADJUST', sx / col.length, top - 22);
			}
		}

		// ── the box ──────────────────────────────────────────────────────────────
		ctx.globalAlpha = 1;
		if (this.box >= 0) {
			let x0 = Infinity;
			let x1 = -Infinity;
			let y0 = Infinity;
			let y1 = -Infinity;
			for (const p of pts.values()) {
				x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x);
				y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y);
			}
			// Inside the frame, always: a box is only a box if its edges are on screen.
			x0 = Math.max(W * 0.06, x0 - 40); x1 = Math.min(W * 0.94, x1 + 40);
			y0 = Math.max(H * 0.07, y0 - 46); y1 = Math.min(H * 0.8, y1 + 40);
			const k = Math.min(1, (t - this.box) / this.BOX_MS);
			const shut = k * k * (3 - 2 * k);
			const mid = (x0 + x1) / 2;
			const travel = (1 - shut) * (mid - x0 + 80);
			ctx.lineWidth = 1.2;
			for (const [a, b, dir] of [[x0, mid, -1], [mid, x1, 1]] as Array<[number, number, number]>) {
				ctx.save();
				ctx.translate(dir * travel, 0);
				ctx.globalAlpha = Math.min(1, shut * 2.4);
				ctx.fillStyle = 'rgba(5,6,11,0.975)';
				ctx.strokeStyle = `rgba(${CREAM},0.24)`;
				ctx.beginPath();
				ctx.rect(a, y0, b - a, y1 - y0);
				ctx.fill();
				ctx.stroke();
				ctx.restore();
			}
			const since = t - this.box - this.BOX_MS;
			if (since > 0) {
				// The seam flares as it closes, then a hairline of light stays in it, and a
				// sheen crosses the lid: shut, but still running inside.
				const flare = Math.max(0, 1 - since / 700);
				const g = ctx.createLinearGradient(mid - 70, 0, mid + 70, 0);
				g.addColorStop(0, `rgba(${AMBER},0)`);
				g.addColorStop(0.5, `rgba(${AMBER},${(0.6 * flare).toFixed(3)})`);
				g.addColorStop(1, `rgba(${AMBER},0)`);
				ctx.fillStyle = g;
				ctx.fillRect(mid - 70, y0, 140, y1 - y0);
				ctx.strokeStyle = `rgba(${AMBER},${(0.3 + 0.1 * Math.sin(t / 380)).toFixed(3)})`;
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(mid, y0 + 8);
				ctx.lineTo(mid, y1 - 8);
				ctx.stroke();
				const sw = (since % 1700) / 1700;
				const sx = x0 - 140 + sw * (x1 - x0 + 280);
				ctx.save();
				ctx.beginPath();
				ctx.rect(x0, y0, x1 - x0, y1 - y0);
				ctx.clip();
				const g2 = ctx.createLinearGradient(sx - 110, 0, sx + 110, 0);
				g2.addColorStop(0, `rgba(${CREAM},0)`);
				g2.addColorStop(0.5, `rgba(${CREAM},0.07)`);
				g2.addColorStop(1, `rgba(${CREAM},0)`);
				ctx.fillStyle = g2;
				ctx.fillRect(sx - 110, y0, 220, y1 - y0);
				ctx.restore();
			}
		}
	}
}
