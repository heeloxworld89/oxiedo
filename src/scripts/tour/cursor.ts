// THE PRESENTER CURSOR.
//
// A drawn pointer, not the system one, because a demo is watched at a distance: a 20px
// system arrow on a 1080p frame is the most common reason a product video is hard to
// follow. This one is a glass delta with a lit amber rim and a short light trail, and it
// behaves the way the best pointer designs do:
//
//   · MAGNETIC. Over a control it lets go of its own shape and a ring settles around the
//     control itself — the target, not the arrow, becomes the thing that is lit — with a
//     short chip naming the action ("Play", "4×", "Open").
//   · A PRESS IS SEEN. The ring tightens, a shockwave leaves the tip, then a beat before
//     the next move, so a viewer sees WHAT was pressed before seeing what it did.
//
// THE MOTION IS CALCULATED, NOT TUNED BY EYE.
//
//   Travel time follows Fitts's law: T(D) = 380 + 170·log2(1 + D/48) ms, clamped to
//   420–1150. A hop between neighbouring buttons (~100px) takes ~650ms and a trip across
//   the screen ~1140ms — slow enough to follow on video, never a slideshow.
//
//   The path bows, as a wrist pivots: a quadratic Bézier with its control point pushed off
//   the chord by min(12% of the distance, 90px).
//
//   The timing along it is minimum-jerk (clock.ts): zero speed at both ends, peak in the
//   middle — the measured signature of a human reach.

import { Clock, minJerk, lerp } from './clock';

export interface CursorEls {
	root: HTMLElement;
	ring: HTMLElement;
	label: HTMLElement;
	wave: HTMLElement;
	trail: HTMLCanvasElement;
}

const DWELL_MS = 200;
const PRESS_MS = 110;
const SETTLE_MS = 260;

export function travelMs(d: number): number {
	const t = 380 + 170 * Math.log2(1 + d / 48);
	return Math.min(1150, Math.max(420, t));
}

type Target = HTMLElement | { x: number; y: number };

export class PresenterCursor {
	private x: number;
	private y: number;
	private bowSign = 1;
	private magnetPad = 6;
	private stopRing: (() => void) | null = null;
	private history: Array<{ x: number; y: number; t: number }> = [];
	private readonly tctx: CanvasRenderingContext2D | null;
	/** Called on every press, for the click sound. */
	onPress: (() => void) | null = null;

	constructor(private readonly clock: Clock, private readonly els: CursorEls) {
		this.x = window.innerWidth / 2;
		this.y = window.innerHeight * 0.55;
		this.tctx = els.trail.getContext('2d');
		this.sizeTrail();
		this.paint();
		clock.every(() => this.drawTrail());
	}

	get pos(): { x: number; y: number } { return { x: this.x, y: this.y }; }

	sizeTrail(): void {
		const dpr = Math.min(2, window.devicePixelRatio || 1);
		this.els.trail.width = Math.round(window.innerWidth * dpr);
		this.els.trail.height = Math.round(window.innerHeight * dpr);
		this.tctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
	}

	private paint(): void {
		this.els.root.style.transform = `translate3d(${this.x.toFixed(1)}px, ${this.y.toFixed(1)}px, 0)`;
		this.history.push({ x: this.x, y: this.y, t: this.clock.t });
	}

	/** A comet tail of the last ~130ms of travel: only visible while the pointer is
	 *  actually moving, and gone the moment it stops. */
	private drawTrail(): void {
		const c = this.tctx;
		if (!c) return;
		const now = this.clock.t;
		const LIFE = 130 * this.clock.speed;
		this.history = this.history.filter((h) => now - h.t < LIFE);
		c.clearRect(0, 0, window.innerWidth, window.innerHeight);
		if (this.history.length < 2 || this.els.root.hidden) return;
		c.lineCap = 'round';
		for (let i = 1; i < this.history.length; i++) {
			const a = this.history[i - 1];
			const b = this.history[i];
			const k = 1 - (now - b.t) / LIFE;
			c.strokeStyle = `rgba(224,162,51,${(0.5 * k).toFixed(3)})`;
			c.lineWidth = 1 + 5 * k;
			c.beginPath();
			c.moveTo(a.x, a.y);
			c.lineTo(b.x, b.y);
			c.stroke();
		}
	}

	private resolve(t: Target, ax: number, ay: number): { x: number; y: number } {
		if (!(t instanceof HTMLElement)) return t;
		const r = t.getBoundingClientRect();
		return { x: r.left + r.width * ax, y: r.top + r.height * ay };
	}

	async show(): Promise<void> {
		this.els.root.hidden = false;
		await this.clock.tween(320, (p) => {
			this.els.root.style.opacity = String(p);
		});
	}

	async hide(): Promise<void> {
		this.magnet(null);
		await this.clock.tween(240, (p) => {
			this.els.root.style.opacity = String(1 - p);
		});
		this.els.root.hidden = true;
	}

	placeAt(x: number, y: number): void {
		this.x = x;
		this.y = y;
		this.paint();
	}

	async moveTo(t: Target, ax = 0.5, ay = 0.5): Promise<void> {
		const sx = this.x;
		const sy = this.y;
		const end0 = this.resolve(t, ax, ay);
		const d = Math.hypot(end0.x - sx, end0.y - sy);
		if (d < 2) return;
		const ms = travelMs(d);
		this.bowSign = -this.bowSign;
		const bow = Math.min(0.12 * d, 90) * this.bowSign;
		this.els.root.classList.add('is-moving');
		await this.clock.tween(ms, (p) => {
			const end = this.resolve(t, ax, ay);
			const s = minJerk(p);
			const mx = (sx + end.x) / 2;
			const my = (sy + end.y) / 2;
			const len = Math.hypot(end.x - sx, end.y - sy) || 1;
			const nx = -(end.y - sy) / len;
			const ny = (end.x - sx) / len;
			const cx = mx + nx * bow;
			const cy = my + ny * bow;
			const u = 1 - s;
			this.x = u * u * sx + 2 * u * s * cx + s * s * end.x;
			this.y = u * u * sy + 2 * u * s * cy + s * s * end.y;
			this.paint();
		});
		this.els.root.classList.remove('is-moving');
	}

	/** Settle a ring around `el` (null lets go), with an optional action chip. The ring
	 *  follows the element every frame, so it holds through a camera move. */
	magnet(el: HTMLElement | null, label?: string, pad = 6): void {
		const ring = this.els.ring;
		this.stopRing?.();
		this.stopRing = null;
		this.magnetPad = pad;
		this.label(label ?? null);
		if (!el) {
			ring.classList.remove('is-on');
			this.els.root.classList.remove('is-magnet');
			return;
		}
		const place = () => {
			const r = el.getBoundingClientRect();
			const p = this.magnetPad;
			ring.style.transform = `translate3d(${(r.left - p).toFixed(1)}px, ${(r.top - p).toFixed(1)}px, 0)`;
			ring.style.width = `${(r.width + p * 2).toFixed(1)}px`;
			ring.style.height = `${(r.height + p * 2).toFixed(1)}px`;
			const br = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 6;
			ring.style.borderRadius = `${Math.min(28, br + p)}px`;
		};
		place();
		ring.hidden = false;
		this.stopRing = this.clock.every(place);
		requestAnimationFrame(() => ring.classList.add('is-on'));
		this.els.root.classList.add('is-magnet');
	}

	label(text: string | null): void {
		const l = this.els.label;
		if (text) {
			l.textContent = text;
			this.els.root.classList.add('has-label');
		} else {
			this.els.root.classList.remove('has-label');
		}
	}

	/** Press what is under the tip. `action` defaults to the element's own click(), so the
	 *  page's real handler runs — the tour never fakes what a button does. */
	async click(el?: HTMLElement, action?: () => void): Promise<void> {
		this.els.root.classList.add('is-hover');
		await this.clock.wait(DWELL_MS);
		this.els.root.classList.add('is-press');
		this.els.ring.classList.add('is-press');
		await this.clock.wait(PRESS_MS);
		this.els.root.classList.remove('is-press');
		this.els.ring.classList.remove('is-press');
		const w = this.els.wave;
		w.classList.remove('is-on');
		void w.offsetWidth;
		w.classList.add('is-on');
		this.onPress?.();
		if (action) action();
		else el?.click();
		await this.clock.wait(SETTLE_MS);
		this.els.root.classList.remove('is-hover');
	}

	hover(on: boolean): void {
		this.els.root.classList.toggle('is-hover', on);
	}

	clear(): void {
		this.magnet(null);
		this.history = [];
		this.tctx?.clearRect(0, 0, window.innerWidth, window.innerHeight);
		this.els.root.classList.remove('is-orbit', 'is-hover', 'is-press', 'is-moving', 'is-magnet', 'has-label');
		this.els.ring.hidden = true;
	}

	/** Drag: press, travel with the button held, release. */
	async drag(from: Target, to: Target, onMove: (x: number, y: number) => void, ms?: number): Promise<void> {
		await this.moveTo(from);
		this.els.root.classList.add('is-hover');
		await this.clock.wait(DWELL_MS);
		this.els.root.classList.add('is-press');
		const a = this.resolve(from, 0.5, 0.5);
		const b = this.resolve(to, 0.5, 0.5);
		const span = ms ?? travelMs(Math.hypot(b.x - a.x, b.y - a.y)) * 1.6;
		await this.clock.tween(span, (p) => {
			const s = minJerk(p);
			this.x = lerp(a.x, b.x, s);
			this.y = lerp(a.y, b.y, s);
			this.paint();
			onMove(this.x, this.y);
		});
		this.els.root.classList.remove('is-press');
		await this.clock.wait(SETTLE_MS);
		this.els.root.classList.remove('is-hover');
	}
}
