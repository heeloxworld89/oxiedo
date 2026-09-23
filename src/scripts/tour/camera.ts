// THE CAMERA.
//
// THE ZOOM IS A TRANSFORM ON .rp-console AND NOTHING ELSE. Not the page and not the body:
// a transform on an ancestor of a position:fixed element re-parents that element to the
// transformed box, so zooming the body would drag everything fixed down the page with it.
// The console is the one-screen application box and carries no fixed descendants, and its
// section is clipped for the duration, so a zoomed console reads as a camera moving inside
// a window rather than a page spilling past its edges.
//
// IT FRAMES THINGS, IT DOES NOT GUESS SCALES. frame() is given the elements a beat is
// about and works out the zoom that fits them, capped, so the same script frames the same
// subject at 1440×900 and at 1920×1080. Translation is clamped so no edge of the console
// is ever uncovered — a zoom that shows the page behind it reads as a mistake.
//
// FOCUS. While a subject is framed, everything else in the console is dimmed and
// desaturated, so the eye goes where the picture is bright. Dimmed, not blurred: a blur over
// two canvases that redraw every frame is re-computed every frame, and on a Retina screen it
// cost enough frames to make every camera move stutter.
//
// While zoomed, the drawings and the chart re-render at the zoom factor (onScale), so a
// canvas is never a bitmap scaled up.

import { Clock, minJerk, lerp } from './clock';

interface Pose { tx: number; ty: number; s: number }

export type Subject = HTMLElement | HTMLElement[];

export class ConsoleCamera {
	private pose: Pose = { tx: 0, ty: 0, s: 1 };
	private shakeX = 0;
	private shakeY = 0;
	private blurred = new Set<HTMLElement>();
	private touched = new Set<HTMLElement>();

	constructor(
		private readonly clock: Clock,
		private readonly consoleEl: HTMLElement,
		private readonly onScale: (s: number) => void,
	) {
		consoleEl.style.transformOrigin = '0 0';
	}

	get scale(): number { return this.pose.s; }

	private apply(): void {
		const { tx, ty, s } = this.pose;
		const x = tx + this.shakeX;
		const y = ty + this.shakeY;
		this.consoleEl.style.transform = s === 1 && x === 0 && y === 0
			? ''
			: `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${s.toFixed(4)})`;
	}

	/** The subject's box in the console's own, untransformed coordinates. */
	private localRect(subject: Subject): { x0: number; y0: number; x1: number; y1: number } {
		const els = Array.isArray(subject) ? subject : [subject];
		const cr = this.consoleEl.getBoundingClientRect();
		let x0 = Infinity;
		let y0 = Infinity;
		let x1 = -Infinity;
		let y1 = -Infinity;
		for (const el of els) {
			const r = el.getBoundingClientRect();
			x0 = Math.min(x0, (r.left - cr.left) / this.pose.s);
			y0 = Math.min(y0, (r.top - cr.top) / this.pose.s);
			x1 = Math.max(x1, (r.right - cr.left) / this.pose.s);
			y1 = Math.max(y1, (r.bottom - cr.top) / this.pose.s);
		}
		return { x0, y0, x1, y1 };
	}

	/** The part of the console actually on screen, in its own coordinates at rest. The
	 *  console's untransformed top is its rendered top less the translation this camera
	 *  applied (the origin is its top-left corner, so scale does not move it). offsetTop
	 *  would do, except it is measured from the offset parent, not the viewport. */
	private viewport(): { W: number; H: number } {
		const W = this.consoleEl.offsetWidth;
		const top = this.consoleEl.getBoundingClientRect().top - (this.pose.ty + this.shakeY);
		const H = Math.max(1, Math.min(this.consoleEl.offsetHeight, window.innerHeight - Math.max(0, top)));
		return { W, H };
	}

	private poseAt(cx: number, cy: number, s: number): Pose {
		const W = this.consoleEl.offsetWidth;
		const H = this.consoleEl.offsetHeight;
		const view = this.viewport();
		const tx = Math.min(0, Math.max(W - W * s, view.W / 2 - s * cx));
		const ty = Math.min(0, Math.max(H - H * s, view.H / 2 - s * cy));
		return { tx, ty, s };
	}

	private async tweenTo(to: Pose, ms: number): Promise<void> {
		const from = { ...this.pose };
		if (to.s > from.s) this.onScale(to.s);
		await this.clock.tween(ms, (p) => {
			const k = minJerk(p);
			this.pose = { tx: lerp(from.tx, to.tx, k), ty: lerp(from.ty, to.ty, k), s: lerp(from.s, to.s, k) };
			this.apply();
		});
		if (to.s <= from.s) this.onScale(to.s);
	}

	/** Frame `subject`: the largest zoom, up to `max`, that shows all of it with `pad`
	 *  pixels of air, centred. `dof` racks focus onto it. */
	async frame(subject: Subject, opts: { max?: number; min?: number; pad?: number; ms?: number; dof?: boolean; dx?: number; dy?: number } = {}): Promise<void> {
		const r = this.localRect(subject);
		const pad = opts.pad ?? 28;
		const view = this.viewport();
		const fit = Math.min(view.W / (r.x1 - r.x0 + pad * 2), view.H / (r.y1 - r.y0 + pad * 2));
		const s = Math.max(opts.min ?? 1, Math.min(opts.max ?? 1.8, fit));
		const to = this.poseAt((r.x0 + r.x1) / 2 + (opts.dx ?? 0), (r.y0 + r.y1) / 2 + (opts.dy ?? 0), s);
		if (opts.dof !== false) this.dof(subject);
		await this.tweenTo(to, opts.ms ?? 1000);
	}

	/** A slow push in on whatever is framed — a camera never quite stops on a hold. Runs
	 *  alongside the tour; resolves when done. */
	async drift(ms: number, ds = 0.035): Promise<void> {
		const from = { ...this.pose };
		const view = this.viewport();
		// Keep the point at the centre of the screen fixed as the scale grows.
		const cx = (view.W / 2 - from.tx) / from.s;
		const cy = (view.H / 2 - from.ty) / from.s;
		await this.clock.tween(ms, (p) => {
			const s = from.s + ds * p;
			this.pose = this.poseAt(cx, cy, s);
			this.apply();
		});
	}

	async reset(ms = 900): Promise<void> {
		this.dof(null);
		if (this.pose.s === 1 && this.pose.tx === 0 && this.pose.ty === 0) return;
		await this.tweenTo({ tx: 0, ty: 0, s: 1 }, ms);
	}

	/** A short, decaying shake — the impact. */
	async shake(ms = 420, amp = 7): Promise<void> {
		await this.clock.tween(ms, (p) => {
			const k = (1 - p) * (1 - p) * amp;
			this.shakeX = Math.sin(p * 71) * k;
			this.shakeY = Math.cos(p * 53) * k * 0.6;
			this.apply();
		});
		this.shakeX = 0;
		this.shakeY = 0;
		this.apply();
	}

	/** Blur everything in the console that is not the subject, or nothing (null). The
	 *  blur is on the subject's siblings at every level up to the console, so what stays
	 *  sharp is exactly the subject and the frames that hold it. */
	dof(subject: Subject | null): void {
		for (const el of this.blurred) el.classList.remove('dt-blur');
		this.blurred.clear();
		if (!subject) return;
		const els = Array.isArray(subject) ? subject : [subject];
		const keep = new Set<Element>();
		for (const el of els) {
			for (let n: Element | null = el; n && n !== this.consoleEl; n = n.parentElement) keep.add(n);
		}
		for (const k of keep) {
			const parent = k.parentElement;
			if (!parent) continue;
			for (const sib of parent.children) {
				if (keep.has(sib) || !(sib instanceof HTMLElement)) continue;
				sib.classList.add('dt-dofable', 'dt-blur');
				this.blurred.add(sib);
				this.touched.add(sib);
			}
		}
	}

	/** Snap back with no animation — used on exit. */
	clear(): void {
		this.pose = { tx: 0, ty: 0, s: 1 };
		this.shakeX = 0;
		this.shakeY = 0;
		this.apply();
		this.dof(null);
		for (const el of this.touched) el.classList.remove('dt-dofable');
		this.touched.clear();
		this.consoleEl.style.removeProperty('transform-origin');
		this.onScale(1);
	}
}
